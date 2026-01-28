const express = require('express');
const {
  getInterviews,
  getInterview,
  createInterview,
  updateInterview,
  deleteInterview,
  generateQuestions,
  submitFeedback,
} = require('../controllers/interviewController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, getInterviews);
router.get('/:id', authMiddleware, getInterview);
router.post('/', authMiddleware, createInterview);
router.put('/:id', authMiddleware, updateInterview);
router.delete('/:id', authMiddleware, deleteInterview);

// AI endpoints
router.post('/:id/ai/generate-questions', authMiddleware, generateQuestions);
router.post('/:id/feedback', authMiddleware, submitFeedback);

module.exports = router;
