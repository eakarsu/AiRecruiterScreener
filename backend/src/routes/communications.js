const express = require('express');
const {
  getCommunications,
  getCommunication,
  createCommunication,
  generateEmail,
  getEmailTemplates,
  createEmailTemplate,
} = require('../controllers/communicationController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, getCommunications);
router.get('/templates', authMiddleware, getEmailTemplates);
router.post('/templates', authMiddleware, createEmailTemplate);
router.get('/:id', authMiddleware, getCommunication);
router.post('/', authMiddleware, createCommunication);

// AI endpoints
router.post('/ai/generate-email', authMiddleware, generateEmail);

module.exports = router;
