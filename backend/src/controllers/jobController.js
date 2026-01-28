const prisma = require('../config/database');
const aiService = require('../services/aiService');

// Get all job postings
const getJobs = async (req, res) => {
  try {
    const { status, department, search } = req.query;

    const where = {};
    if (status) where.status = status;
    if (department) where.department = department;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const jobs = await prisma.jobPosting.findMany({
      where,
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        _count: {
          select: { candidates: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(jobs);
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

// Get single job
const getJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await prisma.jobPosting.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        candidates: {
          include: {
            interviews: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        screeningQuestions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
};

// Create job posting
const createJob = async (req, res) => {
  try {
    const {
      title,
      department,
      location,
      type,
      salaryMin,
      salaryMax,
      description,
      requirements,
      benefits,
      status,
    } = req.body;

    const job = await prisma.jobPosting.create({
      data: {
        title,
        department,
        location,
        type,
        salaryMin: salaryMin ? parseInt(salaryMin) : null,
        salaryMax: salaryMax ? parseInt(salaryMax) : null,
        description,
        requirements,
        benefits,
        status: status || 'draft',
        createdById: req.user.id,
      },
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    res.status(201).json(job);
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
};

// Update job posting
const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.salaryMin) updateData.salaryMin = parseInt(updateData.salaryMin);
    if (updateData.salaryMax) updateData.salaryMax = parseInt(updateData.salaryMax);

    const job = await prisma.jobPosting.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    res.json(job);
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
};

// Delete job posting
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.jobPosting.delete({ where: { id } });

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
};

// Generate job description with AI
const generateJobDescription = async (req, res) => {
  try {
    const { title, department, location, type, notes } = req.body;

    const generated = await aiService.generateJobDescription({
      title,
      department,
      location,
      type,
      notes,
    });

    res.json(generated);
  } catch (error) {
    console.error('Generate job description error:', error);
    res.status(500).json({ error: 'Failed to generate job description' });
  }
};

// Generate screening questions with AI
const generateScreeningQuestions = async (req, res) => {
  try {
    const { id } = req.params;
    const { count } = req.body;

    const job = await prisma.jobPosting.findUnique({ where: { id } });
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const generated = await aiService.generateScreeningQuestions(
      job.title,
      job.description,
      count || 5
    );

    // Save the generated questions
    const questions = await Promise.all(
      generated.questions.map((q, index) =>
        prisma.screeningQuestion.create({
          data: {
            question: q.question,
            type: q.type,
            options: q.options ? JSON.stringify(q.options) : null,
            weight: q.weight || 1,
            order: index,
            aiGenerated: true,
            jobPostingId: id,
          },
        })
      )
    );

    res.json(questions);
  } catch (error) {
    console.error('Generate screening questions error:', error);
    res.status(500).json({ error: 'Failed to generate screening questions' });
  }
};

module.exports = {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  generateJobDescription,
  generateScreeningQuestions,
};
