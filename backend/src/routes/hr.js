const express = require('express');
const router = express.Router();
const hrController = require('../controllers/hrController');
const { authMiddleware } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// ==================== EMPLOYEES ====================
router.get('/employees', hrController.getEmployees);
router.get('/employees/:id', hrController.getEmployee);
router.post('/employees', hrController.createEmployee);
router.put('/employees/:id', hrController.updateEmployee);
router.delete('/employees/:id', hrController.deleteEmployee);

// ==================== AI BIAS DETECTOR ====================
router.get('/bias-reports', hrController.getBiasReports);
router.get('/bias-reports/:id', hrController.getBiasReport);
router.post('/bias-reports/analyze', hrController.analyzeBias);
router.put('/bias-reports/:id', hrController.updateBiasReport);
router.delete('/bias-reports/:id', hrController.deleteBiasReport);

// ==================== SENTIMENT ANALYSIS ====================
router.get('/sentiment', hrController.getSentimentAnalyses);
router.get('/sentiment/:id', hrController.getSentimentAnalysis);
router.post('/sentiment/analyze', hrController.analyzeSentiment);
router.delete('/sentiment/:id', hrController.deleteSentimentAnalysis);

// ==================== CULTURE FIT ====================
router.get('/culture-fit', hrController.getCultureFitScores);
router.get('/culture-fit/:id', hrController.getCultureFitScore);
router.post('/culture-fit/score', hrController.scoreCultureFit);
router.delete('/culture-fit/:id', hrController.deleteCultureFitScore);

// ==================== PERFORMANCE REVIEWS ====================
router.get('/performance-reviews', hrController.getPerformanceReviews);
router.get('/performance-reviews/:id', hrController.getPerformanceReview);
router.post('/performance-reviews', hrController.createPerformanceReview);
router.post('/performance-reviews/generate', hrController.generatePerformanceReview);
router.put('/performance-reviews/:id', hrController.updatePerformanceReview);
router.delete('/performance-reviews/:id', hrController.deletePerformanceReview);

// ==================== SALARY BENCHMARKING ====================
router.get('/salary-benchmarks', hrController.getSalaryBenchmarks);
router.get('/salary-benchmarks/:id', hrController.getSalaryBenchmark);
router.post('/salary-benchmarks/analyze', hrController.benchmarkSalary);
router.delete('/salary-benchmarks/:id', hrController.deleteSalaryBenchmark);

// ==================== EXIT INTERVIEWS ====================
router.get('/exit-interviews', hrController.getExitInterviews);
router.get('/exit-interviews/:id', hrController.getExitInterview);
router.post('/exit-interviews', hrController.createExitInterview);
router.post('/exit-interviews/:id/analyze', hrController.analyzeExitInterview);
router.put('/exit-interviews/:id', hrController.updateExitInterview);
router.delete('/exit-interviews/:id', hrController.deleteExitInterview);

// ==================== ORG CHART ====================
router.get('/org-charts', hrController.getOrgCharts);
router.get('/org-charts/:id', hrController.getOrgChart);
router.post('/org-charts', hrController.createOrgChart);
router.post('/org-charts/:id/optimize', hrController.optimizeOrgChart);
router.delete('/org-charts/:id', hrController.deleteOrgChart);

// ==================== INTERVIEW SCHEDULING ====================
router.get('/interview-schedules', hrController.getInterviewSchedules);
router.get('/interview-schedules/:id', hrController.getInterviewSchedule);
router.post('/interview-schedules', hrController.createInterviewSchedule);
router.put('/interview-schedules/:id', hrController.updateInterviewSchedule);
router.delete('/interview-schedules/:id', hrController.deleteInterviewSchedule);

// ==================== SKILLS ASSESSMENT ====================
router.get('/skills/assessments', hrController.getAssessments);
router.post('/skills/assess', hrController.assessSkills);
router.delete('/skills/assessments/:id', hrController.deleteAssessment);

// ==================== AI: SKILLS GAP / INTERVIEW / RETENTION RISK ====================
router.post('/skills-gap-analysis', hrController.skillsGapAnalysis);
router.post('/interview-analysis', hrController.analyzeInterviewTranscript);
router.post('/retention-risk', hrController.predictRetentionRisk);

// Apply pass 4 (mechanical backlog)
router.post('/offer-letter', hrController.generateOfferLetter);
router.post('/dei-metrics', hrController.deiMetrics);

module.exports = router;
