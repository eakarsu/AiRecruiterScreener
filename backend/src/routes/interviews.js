const express = require('express');
const {
  getInterviews, getInterview, createInterview, updateInterview, deleteInterview,
  bulkDeleteInterviews, bulkUpdateInterviews, exportInterviewsCSV,
  generateQuestions, submitFeedback,
} = require('../controllers/interviewController');
const { authMiddleware } = require('../middleware/auth');
const { requireRecruiter } = require('../middleware/rbac');
const { exportLimiter, aiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.get('/', authMiddleware, getInterviews);
router.get('/export/csv', authMiddleware, exportLimiter, exportInterviewsCSV);
router.get('/:id', authMiddleware, getInterview);
router.post('/', authMiddleware, createInterview);
router.put('/:id', authMiddleware, updateInterview);
router.delete('/:id', authMiddleware, deleteInterview);

// Bulk operations
router.post('/bulk/delete', authMiddleware, requireRecruiter, bulkDeleteInterviews);
router.post('/bulk/update', authMiddleware, requireRecruiter, bulkUpdateInterviews);

// AI endpoints
router.post('/:id/ai/generate-questions', authMiddleware, aiLimiter, generateQuestions);
router.post('/:id/feedback', authMiddleware, submitFeedback);

module.exports = router;
