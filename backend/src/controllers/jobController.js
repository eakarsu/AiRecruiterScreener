const prisma = require('../config/database');
const aiService = require('../services/aiService');
const { parsePagination, parseSort, paginatedResponse, toCSV } = require('../utils/pagination');

// Get all job postings with pagination
const getJobs = async (req, res) => {
  try {
    const { status, department, search } = req.query;
    const { page, limit, skip } = parsePagination(req.query);
    const orderBy = parseSort(req.query, ['createdAt', 'title', 'department', 'status', 'salaryMin', 'salaryMax']);

    const where = {};
    if (status) where.status = status;
    if (department) where.department = department;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [jobs, total] = await Promise.all([
      prisma.jobPosting.findMany({
        where,
        include: {
          createdBy: {
            select: { id: true, firstName: true, lastName: true },
          },
          _count: {
            select: { candidates: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.jobPosting.count({ where }),
    ]);

    res.json(paginatedResponse(jobs, total, page, limit));
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
          include: { interviews: true },
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
    const { title, department, location, type, salaryMin, salaryMax, description, requirements, benefits, status } = req.body;

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

// Bulk delete jobs
const bulkDeleteJobs = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids array is required' });
    }

    const result = await prisma.jobPosting.deleteMany({
      where: { id: { in: ids } },
    });

    res.json({ message: `${result.count} jobs deleted`, count: result.count });
  } catch (error) {
    console.error('Bulk delete jobs error:', error);
    res.status(500).json({ error: 'Failed to bulk delete jobs' });
  }
};

// Bulk update jobs
const bulkUpdateJobs = async (req, res) => {
  try {
    const { ids, data } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids array is required' });
    }

    const result = await prisma.jobPosting.updateMany({
      where: { id: { in: ids } },
      data,
    });

    res.json({ message: `${result.count} jobs updated`, count: result.count });
  } catch (error) {
    console.error('Bulk update jobs error:', error);
    res.status(500).json({ error: 'Failed to bulk update jobs' });
  }
};

// Export jobs as CSV
const exportJobsCSV = async (req, res) => {
  try {
    const jobs = await prisma.jobPosting.findMany({
      include: {
        createdBy: { select: { firstName: true, lastName: true } },
        _count: { select: { candidates: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const columns = [
      { key: 'title', label: 'Title' },
      { key: 'department', label: 'Department' },
      { key: 'location', label: 'Location' },
      { key: 'type', label: 'Type' },
      { key: 'status', label: 'Status' },
      { key: 'salaryMin', label: 'Salary Min' },
      { key: 'salaryMax', label: 'Salary Max' },
      { key: '_count.candidates', label: 'Candidates' },
      { key: 'createdBy.firstName', label: 'Created By' },
      { key: 'createdAt', label: 'Created At' },
    ];

    const csv = toCSV(jobs, columns);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=jobs.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export jobs CSV error:', error);
    res.status(500).json({ error: 'Failed to export jobs' });
  }
};

// Generate job description with AI
const generateJobDescription = async (req, res) => {
  try {
    const { title, department, location, type, notes } = req.body;

    const generated = await aiService.generateJobDescription({ title, department, location, type, notes });

    const descriptionParts = [generated.summary || ''];
    if (generated.niceToHave && generated.niceToHave.length > 0) {
      descriptionParts.push('\nNice to Have:\n' + generated.niceToHave.map(n => `- ${n}`).join('\n'));
    }
    if (generated.salaryRange) {
      descriptionParts.push(`\nSuggested Salary: $${generated.salaryRange.min?.toLocaleString()} - $${generated.salaryRange.max?.toLocaleString()}`);
    }

    const job = await prisma.jobPosting.create({
      data: {
        title: generated.title || title,
        department,
        location,
        type,
        salaryMin: generated.salaryRange?.min || null,
        salaryMax: generated.salaryRange?.max || null,
        description: descriptionParts.join('\n'),
        requirements: generated.requirements?.join('\n') || '',
        benefits: generated.benefits?.join('\n') || '',
        aiGenerated: true,
        status: 'draft',
        createdById: req.user.id,
      },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    res.json({ job, generated });
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

    const generated = await aiService.generateScreeningQuestions(job.title, job.description, count || 5);

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
  bulkDeleteJobs,
  bulkUpdateJobs,
  exportJobsCSV,
  generateJobDescription,
  generateScreeningQuestions,
};
