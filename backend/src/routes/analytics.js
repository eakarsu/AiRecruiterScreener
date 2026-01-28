const express = require('express');
const {
  getDashboardStats,
  getPipelineOverview,
  getHiringFunnel,
  getRecentActivity,
  getSourceAnalytics,
  getTimeToHire,
} = require('../controllers/analyticsController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard', authMiddleware, getDashboardStats);
router.get('/pipeline', authMiddleware, getPipelineOverview);
router.get('/funnel', authMiddleware, getHiringFunnel);
router.get('/activity', authMiddleware, getRecentActivity);
router.get('/sources', authMiddleware, getSourceAnalytics);
router.get('/time-to-hire', authMiddleware, getTimeToHire);

module.exports = router;
