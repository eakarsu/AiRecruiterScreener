const express = require('express');
const {
  getCandidates, getCandidate, createCandidate, updateCandidate, deleteCandidate,
  bulkDeleteCandidates, bulkUpdateCandidates, exportCandidatesCSV,
  analyzeResume, rankCandidates, addNote,
} = require('../controllers/candidateController');
const { authMiddleware } = require('../middleware/auth');
const { requireRecruiter } = require('../middleware/rbac');
const { exportLimiter, aiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.get('/', authMiddleware, getCandidates);
router.get('/export/csv', authMiddleware, exportLimiter, exportCandidatesCSV);
router.get('/:id', authMiddleware, getCandidate);
router.post('/', authMiddleware, requireRecruiter, createCandidate);
router.put('/:id', authMiddleware, requireRecruiter, updateCandidate);
router.delete('/:id', authMiddleware, requireRecruiter, deleteCandidate);

// Bulk operations
router.post('/bulk/delete', authMiddleware, requireRecruiter, bulkDeleteCandidates);
router.post('/bulk/update', authMiddleware, requireRecruiter, bulkUpdateCandidates);

// AI endpoints
router.post('/:id/ai/analyze-resume', authMiddleware, aiLimiter, analyzeResume);
router.post('/job/:jobId/ai/rank', authMiddleware, aiLimiter, rankCandidates);

// Notes
router.post('/:id/notes', authMiddleware, addNote);

module.exports = router;
