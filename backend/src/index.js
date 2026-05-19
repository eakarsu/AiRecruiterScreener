require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const prisma = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const candidateRoutes = require('./routes/candidates');
const interviewRoutes = require('./routes/interviews');
const communicationRoutes = require('./routes/communications');
const assessmentRoutes = require('./routes/assessments');
const analyticsRoutes = require('./routes/analytics');
const hrRoutes = require('./routes/hr');

const app = express();
const PORT = process.env.PORT || 3001;

// Security headers (helmet-like)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.removeHeader('X-Powered-By');
  next();
});

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3100', 'http://localhost:5510', 'http://localhost:5173'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// General rate limiter
app.use('/api', generalLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/communications', communicationRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/hr', hrRoutes);

// Custom Views - Hiring Analytics (funnel + skill match radar)
app.use('/api/custom-views', require('./routes/customViews'));

// Error handler
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();

// AI feature mount: resume-rank
app.use('/api/ai/resume-rank', require('./routes/ai-resume-rank'));
// === Batch 07 Gaps & Frontend Mounts ===
app.use('/api/gap-no-resumescreening-parse-and-score', require('./routes/gap-no-resumescreening-parse-and-score'));
app.use('/api/gap-no-interviewanalysis-transcribe-sentiment-re', require('./routes/gap-no-interviewanalysis-transcribe-sentiment-re'));
app.use('/api/gap-no-culturefitassessment', require('./routes/gap-no-culturefitassessment'));
app.use('/api/gap-no-biasdetection-in-hiring-funnel', require('./routes/gap-no-biasdetection-in-hiring-funnel'));
app.use('/api/gap-no-salarybenchmark-route', require('./routes/gap-no-salarybenchmark-route'));
app.use('/api/gap-no-skillsgapanalysis-for-hires', require('./routes/gap-no-skillsgapanalysis-for-hires'));
app.use('/api/gap-no-resume-parserfile-ingestion-route', require('./routes/gap-no-resume-parserfile-ingestion-route'));
app.use('/api/gap-no-calendar-integration-for-interview-schedu', require('./routes/gap-no-calendar-integration-for-interview-schedu'));
app.use('/api/gap-no-offer-letter-generator', require('./routes/gap-no-offer-letter-generator'));
app.use('/api/gap-no-onboarding-checklist-workflow', require('./routes/gap-no-onboarding-checklist-workflow'));
app.use('/api/gap-no-performance-review-module', require('./routes/gap-no-performance-review-module'));
app.use('/api/gap-no-dei-metrics-dashboard', require('./routes/gap-no-dei-metrics-dashboard'));
app.use('/api/gap-no-external-jobboard-posting-linkedin-indeed', require('./routes/gap-no-external-jobboard-posting-linkedin-indeed'));
app.use('/api/gap-no-notificationsemail-automation-routes', require('./routes/gap-no-notificationsemail-automation-routes'));
// === End Batch 07 ===
