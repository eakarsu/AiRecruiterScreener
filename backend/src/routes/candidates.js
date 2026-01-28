const express = require('express');
const {
  getCandidates,
  getCandidate,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  analyzeResume,
  rankCandidates,
  addNote,
} = require('../controllers/candidateController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware, getCandidates);
router.get('/:id', authMiddleware, getCandidate);
router.post('/', authMiddleware, createCandidate);
router.put('/:id', authMiddleware, updateCandidate);
router.delete('/:id', authMiddleware, deleteCandidate);

// AI endpoints
router.post('/:id/ai/analyze-resume', authMiddleware, analyzeResume);
router.post('/job/:jobId/ai/rank', authMiddleware, rankCandidates);

// Notes
router.post('/:id/notes', authMiddleware, addNote);

module.exports = router;
