const prisma = require('../config/database');
const aiService = require('../services/aiService');

// Get communications
const getCommunications = async (req, res) => {
  try {
    const { candidateId, type, direction } = req.query;

    const where = {};
    if (candidateId) where.candidateId = candidateId;
    if (type) where.type = type;
    if (direction) where.direction = direction;

    const communications = await prisma.communication.findMany({
      where,
      include: {
        candidate: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(communications);
  } catch (error) {
    console.error('Get communications error:', error);
    res.status(500).json({ error: 'Failed to fetch communications' });
  }
};

// Get single communication
const getCommunication = async (req, res) => {
  try {
    const { id } = req.params;

    const communication = await prisma.communication.findUnique({
      where: { id },
      include: {
        candidate: true,
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!communication) {
      return res.status(404).json({ error: 'Communication not found' });
    }

    res.json(communication);
  } catch (error) {
    console.error('Get communication error:', error);
    res.status(500).json({ error: 'Failed to fetch communication' });
  }
};

// Create communication
const createCommunication = async (req, res) => {
  try {
    const { candidateId, type, direction, subject, content, status } = req.body;

    const communication = await prisma.communication.create({
      data: {
        candidateId,
        type: type || 'email',
        direction: direction || 'outbound',
        subject,
        content,
        status: status || 'sent',
        sentAt: status === 'sent' ? new Date() : null,
        userId: req.user.id,
      },
      include: {
        candidate: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    res.status(201).json(communication);
  } catch (error) {
    console.error('Create communication error:', error);
    res.status(500).json({ error: 'Failed to create communication' });
  }
};

// Generate email with AI
const generateEmail = async (req, res) => {
  try {
    const { candidateId, templateType, customContext } = req.body;

    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: { jobPosting: true },
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const email = await aiService.generateEmail(
      templateType,
      {
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        position: candidate.jobPosting.title,
      },
      customContext
    );

    res.json(email);
  } catch (error) {
    console.error('Generate email error:', error);
    res.status(500).json({ error: 'Failed to generate email' });
  }
};

// Get email templates
const getEmailTemplates = async (req, res) => {
  try {
    const { type, isActive } = req.query;

    const where = {};
    if (type) where.type = type;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const templates = await prisma.emailTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(templates);
  } catch (error) {
    console.error('Get email templates error:', error);
    res.status(500).json({ error: 'Failed to fetch email templates' });
  }
};

// Create email template
const createEmailTemplate = async (req, res) => {
  try {
    const { name, subject, body, type, variables } = req.body;

    const template = await prisma.emailTemplate.create({
      data: {
        name,
        subject,
        body,
        type,
        variables: variables ? JSON.stringify(variables) : null,
      },
    });

    res.status(201).json(template);
  } catch (error) {
    console.error('Create email template error:', error);
    res.status(500).json({ error: 'Failed to create email template' });
  }
};

module.exports = {
  getCommunications,
  getCommunication,
  createCommunication,
  generateEmail,
  getEmailTemplates,
  createEmailTemplate,
};
