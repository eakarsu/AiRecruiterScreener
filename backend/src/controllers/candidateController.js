const prisma = require('../config/database');
const aiService = require('../services/aiService');
const { parsePagination, parseSort, paginatedResponse, toCSV } = require('../utils/pagination');

// Get all candidates with pagination
const getCandidates = async (req, res) => {
  try {
    const { status, jobId, search } = req.query;
    const { page, limit, skip } = parsePagination(req.query);
    const orderBy = parseSort(req.query, ['createdAt', 'firstName', 'lastName', 'aiScore', 'status', 'yearsExperience', 'currentTitle']);

    const where = {};
    if (status) where.status = status;
    if (jobId) where.jobPostingId = jobId;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { currentTitle: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [candidates, total] = await Promise.all([
      prisma.candidate.findMany({
        where,
        include: {
          jobPosting: {
            select: { id: true, title: true, department: true },
          },
          interviews: {
            select: { id: true, scheduledAt: true, status: true, type: true },
            orderBy: { scheduledAt: 'desc' },
            take: 1,
          },
          _count: {
            select: { notes: true, communications: true, assessments: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.candidate.count({ where }),
    ]);

    res.json(paginatedResponse(candidates, total, page, limit));
  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
};

// Get single candidate with full details
const getCandidate = async (req, res) => {
  try {
    const { id } = req.params;

    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: {
        jobPosting: true,
        interviews: {
          include: {
            interviewer: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
          orderBy: { scheduledAt: 'desc' },
        },
        screeningAnswers: {
          include: { question: true },
        },
        notes: {
          include: {
            author: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        communications: {
          orderBy: { createdAt: 'desc' },
        },
        assessments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    res.json(candidate);
  } catch (error) {
    console.error('Get candidate error:', error);
    res.status(500).json({ error: 'Failed to fetch candidate' });
  }
};

// Create candidate
const createCandidate = async (req, res) => {
  try {
    const {
      firstName, lastName, email, phone, linkedIn, portfolio,
      resumeText, coverLetter, source, jobPostingId,
      currentTitle, currentCompany, yearsExperience, expectedSalary,
    } = req.body;

    const candidate = await prisma.candidate.create({
      data: {
        firstName, lastName, email, phone, linkedIn, portfolio,
        resumeText, coverLetter, source, jobPostingId,
        currentTitle, currentCompany,
        yearsExperience: yearsExperience ? parseInt(yearsExperience) : null,
        expectedSalary: expectedSalary ? parseInt(expectedSalary) : null,
        status: 'new',
      },
      include: {
        jobPosting: { select: { id: true, title: true } },
      },
    });

    res.status(201).json(candidate);
  } catch (error) {
    console.error('Create candidate error:', error);
    res.status(500).json({ error: 'Failed to create candidate' });
  }
};

// Update candidate
const updateCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.yearsExperience) updateData.yearsExperience = parseInt(updateData.yearsExperience);
    if (updateData.expectedSalary) updateData.expectedSalary = parseInt(updateData.expectedSalary);

    const candidate = await prisma.candidate.update({
      where: { id },
      data: updateData,
      include: {
        jobPosting: { select: { id: true, title: true } },
      },
    });

    res.json(candidate);
  } catch (error) {
    console.error('Update candidate error:', error);
    res.status(500).json({ error: 'Failed to update candidate' });
  }
};

// Delete candidate
const deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.candidate.delete({ where: { id } });
    res.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    console.error('Delete candidate error:', error);
    res.status(500).json({ error: 'Failed to delete candidate' });
  }
};

// Bulk delete candidates
const bulkDeleteCandidates = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids array is required' });
    }

    const result = await prisma.candidate.deleteMany({
      where: { id: { in: ids } },
    });

    res.json({ message: `${result.count} candidates deleted`, count: result.count });
  } catch (error) {
    console.error('Bulk delete candidates error:', error);
    res.status(500).json({ error: 'Failed to bulk delete candidates' });
  }
};

// Bulk update candidates
const bulkUpdateCandidates = async (req, res) => {
  try {
    const { ids, data } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids array is required' });
    }

    const result = await prisma.candidate.updateMany({
      where: { id: { in: ids } },
      data,
    });

    res.json({ message: `${result.count} candidates updated`, count: result.count });
  } catch (error) {
    console.error('Bulk update candidates error:', error);
    res.status(500).json({ error: 'Failed to bulk update candidates' });
  }
};

// Export candidates as CSV
const exportCandidatesCSV = async (req, res) => {
  try {
    const candidates = await prisma.candidate.findMany({
      include: {
        jobPosting: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const columns = [
      { key: 'firstName', label: 'First Name' },
      { key: 'lastName', label: 'Last Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'currentTitle', label: 'Title' },
      { key: 'currentCompany', label: 'Company' },
      { key: 'yearsExperience', label: 'Years Exp' },
      { key: 'status', label: 'Status' },
      { key: 'source', label: 'Source' },
      { key: 'aiScore', label: 'AI Score' },
      { key: 'jobPosting.title', label: 'Job' },
      { key: 'createdAt', label: 'Applied At' },
    ];

    const csv = toCSV(candidates, columns);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=candidates.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export candidates CSV error:', error);
    res.status(500).json({ error: 'Failed to export candidates' });
  }
};

// Analyze candidate resume with AI
const analyzeResume = async (req, res) => {
  try {
    const { id } = req.params;

    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: { jobPosting: true },
    });

    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    if (!candidate.resumeText) return res.status(400).json({ error: 'No resume text available' });

    const analysis = await aiService.analyzeResume(candidate.resumeText, candidate.jobPosting.description);

    const updated = await prisma.candidate.update({
      where: { id },
      data: {
        aiScore: analysis.score,
        aiSummary: analysis.summary,
        aiStrengths: JSON.stringify(analysis.strengths),
        aiWeaknesses: JSON.stringify(analysis.weaknesses),
        aiRecommendation: analysis.recommendation,
        skills: JSON.stringify(analysis.skills),
        yearsExperience: analysis.yearsExperience || candidate.yearsExperience,
        currentTitle: analysis.currentTitle || candidate.currentTitle,
        currentCompany: analysis.currentCompany || candidate.currentCompany,
        education: JSON.stringify(analysis.education),
      },
    });

    res.json({ candidate: updated, analysis });
  } catch (error) {
    console.error('Analyze resume error:', error);
    res.status(500).json({ error: 'Failed to analyze resume' });
  }
};

// Rank candidates for a job
const rankCandidates = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await prisma.jobPosting.findUnique({
      where: { id: jobId },
      include: { candidates: true },
    });

    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.candidates.length === 0) return res.status(400).json({ error: 'No candidates to rank' });

    const rankings = await aiService.rankCandidates(job.candidates, job.description);
    res.json(rankings);
  } catch (error) {
    console.error('Rank candidates error:', error);
    res.status(500).json({ error: 'Failed to rank candidates' });
  }
};

// Add note to candidate
const addNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, type, isPrivate } = req.body;

    const note = await prisma.note.create({
      data: {
        content,
        type: type || 'general',
        isPrivate: isPrivate || false,
        candidateId: id,
        authorId: req.user.id,
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    res.status(201).json(note);
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ error: 'Failed to add note' });
  }
};

module.exports = {
  getCandidates,
  getCandidate,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  bulkDeleteCandidates,
  bulkUpdateCandidates,
  exportCandidatesCSV,
  analyzeResume,
  rankCandidates,
  addNote,
};
