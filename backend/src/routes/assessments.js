const express = require('express');
const {
  getAssessments,
  getAssessment,
  createAssessment,
  generateAssessment,
  startAssessment,
  submitAssessment,
} = require('../controllers/assessmentController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, getAssessments);
router.get('/:id', authMiddleware, getAssessment);
router.post('/', authMiddleware, createAssessment);

// AI endpoints
router.post('/ai/generate', authMiddleware, generateAssessment);

// Assessment flow
router.post('/:id/start', authMiddleware, startAssessment);
router.post('/:id/submit', authMiddleware, submitAssessment);

module.exports = router;
