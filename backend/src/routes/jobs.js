const express = require('express');
const {
  getJobs, getJob, createJob, updateJob, deleteJob,
  bulkDeleteJobs, bulkUpdateJobs, exportJobsCSV,
  generateJobDescription, generateScreeningQuestions,
} = require('../controllers/jobController');
const { authMiddleware } = require('../middleware/auth');
const { requireRecruiter } = require('../middleware/rbac');
const { exportLimiter, aiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.get('/', authMiddleware, getJobs);
router.get('/export/csv', authMiddleware, exportLimiter, exportJobsCSV);
router.get('/:id', authMiddleware, getJob);
router.post('/', authMiddleware, requireRecruiter, createJob);
router.put('/:id', authMiddleware, requireRecruiter, updateJob);
router.delete('/:id', authMiddleware, requireRecruiter, deleteJob);

// Bulk operations
router.post('/bulk/delete', authMiddleware, requireRecruiter, bulkDeleteJobs);
router.post('/bulk/update', authMiddleware, requireRecruiter, bulkUpdateJobs);

// AI endpoints
router.post('/ai/generate-description', authMiddleware, aiLimiter, generateJobDescription);
router.post('/:id/ai/generate-questions', authMiddleware, aiLimiter, generateScreeningQuestions);

module.exports = router;
