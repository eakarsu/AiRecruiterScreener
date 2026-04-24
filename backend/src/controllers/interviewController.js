const prisma = require('../config/database');
const aiService = require('../services/aiService');
const { parsePagination, parseSort, paginatedResponse, toCSV } = require('../utils/pagination');

// Get all interviews with pagination
const getInterviews = async (req, res) => {
  try {
    const { status, type, candidateId, interviewerId, startDate, endDate } = req.query;
    const { page, limit, skip } = parsePagination(req.query);
    const orderBy = parseSort(req.query, ['scheduledAt', 'createdAt', 'status', 'type', 'duration']);

    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (candidateId) where.candidateId = candidateId;
    if (interviewerId) where.interviewerId = interviewerId;
    if (startDate || endDate) {
      where.scheduledAt = {};
      if (startDate) where.scheduledAt.gte = new Date(startDate);
      if (endDate) where.scheduledAt.lte = new Date(endDate);
    }

    const [interviews, total] = await Promise.all([
      prisma.interview.findMany({
        where,
        include: {
          candidate: {
            select: { id: true, firstName: true, lastName: true, email: true, currentTitle: true },
          },
          interviewer: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.interview.count({ where }),
    ]);

    res.json(paginatedResponse(interviews, total, page, limit));
  } catch (error) {
    console.error('Get interviews error:', error);
    res.status(500).json({ error: 'Failed to fetch interviews' });
  }
};

// Bulk delete interviews
const bulkDeleteInterviews = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids array is required' });
    }
    const result = await prisma.interview.deleteMany({ where: { id: { in: ids } } });
    res.json({ message: `${result.count} interviews deleted`, count: result.count });
  } catch (error) {
    console.error('Bulk delete interviews error:', error);
    res.status(500).json({ error: 'Failed to bulk delete interviews' });
  }
};

// Bulk update interviews
const bulkUpdateInterviews = async (req, res) => {
  try {
    const { ids, data } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids array is required' });
    }
    const result = await prisma.interview.updateMany({ where: { id: { in: ids } }, data });
    res.json({ message: `${result.count} interviews updated`, count: result.count });
  } catch (error) {
    console.error('Bulk update interviews error:', error);
    res.status(500).json({ error: 'Failed to bulk update interviews' });
  }
};

// Export interviews as CSV
const exportInterviewsCSV = async (req, res) => {
  try {
    const interviews = await prisma.interview.findMany({
      include: {
        candidate: { select: { firstName: true, lastName: true } },
        interviewer: { select: { firstName: true, lastName: true } },
      },
      orderBy: { scheduledAt: 'desc' },
    });

    const columns = [
      { key: 'candidate.firstName', label: 'Candidate First Name' },
      { key: 'candidate.lastName', label: 'Candidate Last Name' },
      { key: 'interviewer.firstName', label: 'Interviewer' },
      { key: 'scheduledAt', label: 'Scheduled At' },
      { key: 'duration', label: 'Duration (min)' },
      { key: 'type', label: 'Type' },
      { key: 'status', label: 'Status' },
      { key: 'overallRating', label: 'Rating' },
      { key: 'technicalScore', label: 'Technical' },
      { key: 'culturalScore', label: 'Cultural' },
    ];

    const csv = toCSV(interviews, columns);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=interviews.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export interviews CSV error:', error);
    res.status(500).json({ error: 'Failed to export interviews' });
  }
};

// Get single interview
const getInterview = async (req, res) => {
  try {
    const { id } = req.params;

    const interview = await prisma.interview.findUnique({
      where: { id },
      include: {
        candidate: {
          include: {
            jobPosting: true,
          },
        },
        interviewer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    res.json(interview);
  } catch (error) {
    console.error('Get interview error:', error);
    res.status(500).json({ error: 'Failed to fetch interview' });
  }
};

// Create interview
const createInterview = async (req, res) => {
  try {
    const {
      candidateId,
      scheduledAt,
      duration,
      type,
      location,
      meetingLink,
      notes,
    } = req.body;

    const interview = await prisma.interview.create({
      data: {
        candidateId,
        scheduledAt: new Date(scheduledAt),
        duration: duration || 60,
        type: type || 'video',
        location,
        meetingLink,
        notes,
        interviewerId: req.user.id,
        status: 'scheduled',
      },
      include: {
        candidate: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        interviewer: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    // Update candidate status
    await prisma.candidate.update({
      where: { id: candidateId },
      data: { status: 'interviewed' },
    });

    res.status(201).json(interview);
  } catch (error) {
    console.error('Create interview error:', error);
    res.status(500).json({ error: 'Failed to create interview' });
  }
};

// Update interview
const updateInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.scheduledAt) {
      updateData.scheduledAt = new Date(updateData.scheduledAt);
    }

    const interview = await prisma.interview.update({
      where: { id },
      data: updateData,
      include: {
        candidate: {
          select: { id: true, firstName: true, lastName: true },
        },
        interviewer: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    res.json(interview);
  } catch (error) {
    console.error('Update interview error:', error);
    res.status(500).json({ error: 'Failed to update interview' });
  }
};

// Delete interview
const deleteInterview = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.interview.delete({ where: { id } });

    res.json({ message: 'Interview deleted successfully' });
  } catch (error) {
    console.error('Delete interview error:', error);
    res.status(500).json({ error: 'Failed to delete interview' });
  }
};

// Generate interview questions with AI
const generateQuestions = async (req, res) => {
  try {
    const { id } = req.params;
    const { interviewType } = req.body;

    const interview = await prisma.interview.findUnique({
      where: { id },
      include: {
        candidate: {
          include: { jobPosting: true },
        },
      },
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    const candidateInfo = {
      name: `${interview.candidate.firstName} ${interview.candidate.lastName}`,
      title: interview.candidate.currentTitle,
      company: interview.candidate.currentCompany,
      experience: interview.candidate.yearsExperience,
      skills: interview.candidate.skills,
      summary: interview.candidate.aiSummary,
    };

    const questions = await aiService.generateInterviewQuestions(
      candidateInfo,
      interview.candidate.jobPosting.description,
      interviewType || interview.type
    );

    // Update interview with generated questions
    await prisma.interview.update({
      where: { id },
      data: { aiQuestions: JSON.stringify(questions.questions) },
    });

    res.json(questions);
  } catch (error) {
    console.error('Generate questions error:', error);
    res.status(500).json({ error: 'Failed to generate interview questions' });
  }
};

// Submit interview feedback and get AI summary
const submitFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, overallRating, technicalScore, culturalScore, feedback } = req.body;

    const interview = await prisma.interview.findUnique({ where: { id } });
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    // Generate AI summary
    let aiSummary = null;
    if (notes || feedback) {
      const summary = await aiService.summarizeInterview(
        notes || feedback,
        { overallRating, technicalScore, culturalScore }
      );
      aiSummary = JSON.stringify(summary);
    }

    const updated = await prisma.interview.update({
      where: { id },
      data: {
        notes,
        overallRating,
        technicalScore,
        culturalScore,
        feedback,
        aiSummary,
        status: 'completed',
      },
      include: {
        candidate: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
};

module.exports = {
  getInterviews,
  getInterview,
  createInterview,
  updateInterview,
  deleteInterview,
  bulkDeleteInterviews,
  bulkUpdateInterviews,
  exportInterviewsCSV,
  generateQuestions,
  submitFeedback,
};
