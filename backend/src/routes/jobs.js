const express = require('express');
const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  generateJobDescription,
  generateScreeningQuestions,
} = require('../controllers/jobController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, getJobs);
router.get('/:id', authMiddleware, getJob);
router.post('/', authMiddleware, createJob);
router.put('/:id', authMiddleware, updateJob);
router.delete('/:id', authMiddleware, deleteJob);

// AI endpoints
router.post('/ai/generate-description', authMiddleware, generateJobDescription);
router.post('/:id/ai/generate-questions', authMiddleware, generateScreeningQuestions);

module.exports = router;
