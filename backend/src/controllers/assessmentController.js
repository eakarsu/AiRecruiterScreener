const prisma = require('../config/database');
const aiService = require('../services/aiService');

// Get assessments
const getAssessments = async (req, res) => {
  try {
    const { candidateId, status, type } = req.query;

    const where = {};
    if (candidateId) where.candidateId = candidateId;
    if (status) where.status = status;
    if (type) where.type = type;

    const assessments = await prisma.assessment.findMany({
      where,
      include: {
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            jobPosting: {
              select: { id: true, title: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(assessments);
  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({ error: 'Failed to fetch assessments' });
  }
};

// Get single assessment
const getAssessment = async (req, res) => {
  try {
    const { id } = req.params;

    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        candidate: {
          include: { jobPosting: true },
        },
      },
    });

    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    res.json(assessment);
  } catch (error) {
    console.error('Get assessment error:', error);
    res.status(500).json({ error: 'Failed to fetch assessment' });
  }
};

// Create assessment
const createAssessment = async (req, res) => {
  try {
    const { candidateId, name, type, timeLimit, questions } = req.body;

    const assessment = await prisma.assessment.create({
      data: {
        candidateId,
        name,
        type: type || 'technical',
        timeLimit: timeLimit || 60,
        questions: questions ? JSON.stringify(questions) : null,
        status: 'pending',
      },
      include: {
        candidate: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    res.status(201).json(assessment);
  } catch (error) {
    console.error('Create assessment error:', error);
    res.status(500).json({ error: 'Failed to create assessment' });
  }
};

// Generate assessment with AI
const generateAssessment = async (req, res) => {
  try {
    const { candidateId, type, difficulty } = req.body;

    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: { jobPosting: true },
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const generated = await aiService.generateAssessment(
      type || 'technical',
      {
        title: candidate.jobPosting.title,
        skills: candidate.skills,
      },
      difficulty || 'medium'
    );

    // Create the assessment
    const assessment = await prisma.assessment.create({
      data: {
        candidateId,
        name: generated.title,
        type: type || 'technical',
        timeLimit: generated.timeLimit,
        questions: JSON.stringify(generated.questions),
        status: 'pending',
      },
      include: {
        candidate: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    res.status(201).json({ assessment, generated });
  } catch (error) {
    console.error('Generate assessment error:', error);
    res.status(500).json({ error: 'Failed to generate assessment' });
  }
};

// Start assessment
const startAssessment = async (req, res) => {
  try {
    const { id } = req.params;

    const assessment = await prisma.assessment.update({
      where: { id },
      data: {
        status: 'in_progress',
        startedAt: new Date(),
      },
    });

    res.json(assessment);
  } catch (error) {
    console.error('Start assessment error:', error);
    res.status(500).json({ error: 'Failed to start assessment' });
  }
};

// Submit assessment
const submitAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;

    const assessment = await prisma.assessment.findUnique({ where: { id } });
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    // Calculate score
    const questions = JSON.parse(assessment.questions || '[]');
    let totalScore = 0;
    let maxScore = 0;

    questions.forEach((q, index) => {
      maxScore += q.points || 10;
      if (answers[index] && answers[index].toLowerCase() === q.correctAnswer?.toLowerCase()) {
        totalScore += q.points || 10;
      }
    });

    const scorePercent = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    // Calculate duration
    const duration = assessment.startedAt
      ? Math.round((new Date() - new Date(assessment.startedAt)) / 60000)
      : null;

    const updated = await prisma.assessment.update({
      where: { id },
      data: {
        answers: JSON.stringify(answers),
        score: scorePercent,
        maxScore: 100,
        duration,
        status: 'completed',
        completedAt: new Date(),
      },
      include: {
        candidate: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Submit assessment error:', error);
    res.status(500).json({ error: 'Failed to submit assessment' });
  }
};

module.exports = {
  getAssessments,
  getAssessment,
  createAssessment,
  generateAssessment,
  startAssessment,
  submitAssessment,
};
