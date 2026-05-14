const prisma = require('../config/database');
const aiService = require('../services/aiService');

// ==================== EMPLOYEE MANAGEMENT ====================

// Get all employees
exports.getEmployees = async (req, res) => {
  try {
    const { department, status, search } = req.query;

    const where = {};
    if (department) where.department = department;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
      ];
    }

    const employees = await prisma.employee.findMany({
      where,
      include: {
        manager: { select: { id: true, firstName: true, lastName: true } },
        directReports: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { lastName: 'asc' },
    });

    res.json(employees);
  } catch (error) {
    console.error('Get Employees Error:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
};

// Get employee by ID
exports.getEmployee = async (req, res) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: req.params.id },
      include: {
        manager: true,
        directReports: true,
        performanceReviews: { orderBy: { createdAt: 'desc' } },
        sentimentAnalyses: { orderBy: { createdAt: 'desc' }, take: 5 },
        salaryBenchmarks: { orderBy: { createdAt: 'desc' }, take: 1 },
        cultureFitScores: { orderBy: { createdAt: 'desc' }, take: 1 },
        exitInterview: true,
      },
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    console.error('Get Employee Error:', error);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
};

// Create employee
exports.createEmployee = async (req, res) => {
  try {
    const employee = await prisma.employee.create({
      data: {
        ...req.body,
        skills: req.body.skills ? JSON.stringify(req.body.skills) : null,
      },
    });
    res.status(201).json(employee);
  } catch (error) {
    console.error('Create Employee Error:', error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
};

// Update employee
exports.updateEmployee = async (req, res) => {
  try {
    const employee = await prisma.employee.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        skills: req.body.skills ? JSON.stringify(req.body.skills) : undefined,
      },
    });
    res.json(employee);
  } catch (error) {
    console.error('Update Employee Error:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
  try {
    await prisma.employee.delete({ where: { id: req.params.id } });
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete Employee Error:', error);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
};

// ==================== AI BIAS DETECTOR ====================

// Get all bias reports
exports.getBiasReports = async (req, res) => {
  try {
    const { targetType, status } = req.query;
    const where = {};
    if (targetType) where.targetType = targetType;
    if (status) where.status = status;

    const reports = await prisma.biasReport.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json(reports);
  } catch (error) {
    console.error('Get Bias Reports Error:', error);
    res.status(500).json({ error: 'Failed to fetch bias reports' });
  }
};

// Get bias report by ID
exports.getBiasReport = async (req, res) => {
  try {
    const report = await prisma.biasReport.findUnique({
      where: { id: req.params.id },
    });
    if (!report) {
      return res.status(404).json({ error: 'Bias report not found' });
    }
    res.json(report);
  } catch (error) {
    console.error('Get Bias Report Error:', error);
    res.status(500).json({ error: 'Failed to fetch bias report' });
  }
};

// Analyze content for bias
exports.analyzeBias = async (req, res) => {
  try {
    const { content, targetType, targetId } = req.body;

    const analysis = await aiService.detectBias(content, targetType);

    const report = await prisma.biasReport.create({
      data: {
        targetType,
        targetId: targetId || 'manual_check',
        content,
        biasScore: analysis.biasScore,
        biasTypes: JSON.stringify(analysis.biasTypes),
        suggestions: JSON.stringify(analysis.problematicPhrases),
        aiAnalysis: JSON.stringify(analysis),
        status: 'pending',
      },
    });

    res.json({ report, analysis });
  } catch (error) {
    console.error('Analyze Bias Error:', error);
    res.status(500).json({ error: 'Failed to analyze bias' });
  }
};

// Update bias report status
exports.updateBiasReport = async (req, res) => {
  try {
    const report = await prisma.biasReport.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(report);
  } catch (error) {
    console.error('Update Bias Report Error:', error);
    res.status(500).json({ error: 'Failed to update bias report' });
  }
};

// Delete bias report
exports.deleteBiasReport = async (req, res) => {
  try {
    await prisma.biasReport.delete({ where: { id: req.params.id } });
    res.json({ message: 'Bias report deleted successfully' });
  } catch (error) {
    console.error('Delete Bias Report Error:', error);
    res.status(500).json({ error: 'Failed to delete bias report' });
  }
};

// ==================== SENTIMENT ANALYSIS ====================

// Get all sentiment analyses
exports.getSentimentAnalyses = async (req, res) => {
  try {
    const { employeeId, source } = req.query;
    const where = {};
    if (employeeId) where.employeeId = employeeId;
    if (source) where.source = source;

    const analyses = await prisma.sentimentAnalysis.findMany({
      where,
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, department: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(analyses);
  } catch (error) {
    console.error('Get Sentiment Analyses Error:', error);
    res.status(500).json({ error: 'Failed to fetch sentiment analyses' });
  }
};

// Get sentiment analysis by ID
exports.getSentimentAnalysis = async (req, res) => {
  try {
    const analysis = await prisma.sentimentAnalysis.findUnique({
      where: { id: req.params.id },
      include: { employee: true },
    });
    if (!analysis) {
      return res.status(404).json({ error: 'Sentiment analysis not found' });
    }
    res.json(analysis);
  } catch (error) {
    console.error('Get Sentiment Analysis Error:', error);
    res.status(500).json({ error: 'Failed to fetch sentiment analysis' });
  }
};

// Analyze sentiment
exports.analyzeSentiment = async (req, res) => {
  try {
    const { employeeId, content, source } = req.body;

    const analysis = await aiService.analyzeSentiment(content, source);

    const record = await prisma.sentimentAnalysis.create({
      data: {
        employeeId,
        source,
        content,
        sentimentScore: analysis.sentimentScore,
        emotions: JSON.stringify(analysis.emotions),
        themes: JSON.stringify(analysis.themes),
        aiAnalysis: JSON.stringify(analysis),
        actionItems: JSON.stringify(analysis.actionItems),
      },
      include: { employee: true },
    });

    res.json({ record, analysis });
  } catch (error) {
    console.error('Analyze Sentiment Error:', error);
    res.status(500).json({ error: 'Failed to analyze sentiment' });
  }
};

// Delete sentiment analysis
exports.deleteSentimentAnalysis = async (req, res) => {
  try {
    await prisma.sentimentAnalysis.delete({ where: { id: req.params.id } });
    res.json({ message: 'Sentiment analysis deleted successfully' });
  } catch (error) {
    console.error('Delete Sentiment Analysis Error:', error);
    res.status(500).json({ error: 'Failed to delete sentiment analysis' });
  }
};

// ==================== CULTURE FIT SCORING ====================

// Get all culture fit scores
exports.getCultureFitScores = async (req, res) => {
  try {
    const { candidateId, employeeId } = req.query;
    const where = {};
    if (candidateId) where.candidateId = candidateId;
    if (employeeId) where.employeeId = employeeId;

    const scores = await prisma.cultureFitScore.findMany({
      where,
      include: {
        candidate: { select: { id: true, firstName: true, lastName: true } },
        employee: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(scores);
  } catch (error) {
    console.error('Get Culture Fit Scores Error:', error);
    res.status(500).json({ error: 'Failed to fetch culture fit scores' });
  }
};

// Get culture fit score by ID
exports.getCultureFitScore = async (req, res) => {
  try {
    const score = await prisma.cultureFitScore.findUnique({
      where: { id: req.params.id },
      include: { candidate: true, employee: true },
    });
    if (!score) {
      return res.status(404).json({ error: 'Culture fit score not found' });
    }
    res.json(score);
  } catch (error) {
    console.error('Get Culture Fit Score Error:', error);
    res.status(500).json({ error: 'Failed to fetch culture fit score' });
  }
};

// Score culture fit
exports.scoreCultureFit = async (req, res) => {
  try {
    const { candidateId, employeeId, candidateInfo, companyValues, teamDynamics } = req.body;

    const analysis = await aiService.scoreCultureFit(candidateInfo, companyValues, teamDynamics);

    const score = await prisma.cultureFitScore.create({
      data: {
        candidateId: candidateId || null,
        employeeId: employeeId || null,
        overallScore: analysis.overallScore,
        dimensions: JSON.stringify(analysis.dimensions),
        strengths: JSON.stringify(analysis.strengths),
        concerns: JSON.stringify(analysis.potentialChallenges),
        aiAnalysis: JSON.stringify(analysis),
        recommendation: analysis.recommendation,
      },
      include: { candidate: true, employee: true },
    });

    res.json({ score, analysis });
  } catch (error) {
    console.error('Score Culture Fit Error:', error);
    res.status(500).json({ error: 'Failed to score culture fit' });
  }
};

// Delete culture fit score
exports.deleteCultureFitScore = async (req, res) => {
  try {
    await prisma.cultureFitScore.delete({ where: { id: req.params.id } });
    res.json({ message: 'Culture fit score deleted successfully' });
  } catch (error) {
    console.error('Delete Culture Fit Score Error:', error);
    res.status(500).json({ error: 'Failed to delete culture fit score' });
  }
};

// ==================== PERFORMANCE REVIEWS ====================

// Get all performance reviews
exports.getPerformanceReviews = async (req, res) => {
  try {
    const { employeeId, status, reviewType } = req.query;
    const where = {};
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;
    if (reviewType) where.reviewType = reviewType;

    const reviews = await prisma.performanceReview.findMany({
      where,
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, department: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reviews);
  } catch (error) {
    console.error('Get Performance Reviews Error:', error);
    res.status(500).json({ error: 'Failed to fetch performance reviews' });
  }
};

// Get performance review by ID
exports.getPerformanceReview = async (req, res) => {
  try {
    const review = await prisma.performanceReview.findUnique({
      where: { id: req.params.id },
      include: { employee: true },
    });
    if (!review) {
      return res.status(404).json({ error: 'Performance review not found' });
    }
    res.json(review);
  } catch (error) {
    console.error('Get Performance Review Error:', error);
    res.status(500).json({ error: 'Failed to fetch performance review' });
  }
};

// Create performance review
exports.createPerformanceReview = async (req, res) => {
  try {
    const review = await prisma.performanceReview.create({
      data: {
        ...req.body,
        goals: req.body.goals ? JSON.stringify(req.body.goals) : null,
        achievements: req.body.achievements ? JSON.stringify(req.body.achievements) : null,
        areasForImprovement: req.body.areasForImprovement ? JSON.stringify(req.body.areasForImprovement) : null,
        competencyScores: req.body.competencyScores ? JSON.stringify(req.body.competencyScores) : null,
        aiRecommendations: req.body.aiRecommendations ? JSON.stringify(req.body.aiRecommendations) : null,
      },
      include: { employee: true },
    });
    res.status(201).json(review);
  } catch (error) {
    console.error('Create Performance Review Error:', error);
    res.status(500).json({ error: 'Failed to create performance review' });
  }
};

// Generate AI performance review
exports.generatePerformanceReview = async (req, res) => {
  try {
    const { employeeId, performanceData, reviewPeriod } = req.body;

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const analysis = await aiService.generatePerformanceReview(
      {
        name: `${employee.firstName} ${employee.lastName}`,
        title: employee.title,
        department: employee.department,
        tenure: Math.floor((new Date() - new Date(employee.hireDate)) / (1000 * 60 * 60 * 24 * 365)),
      },
      performanceData,
      reviewPeriod
    );

    const review = await prisma.performanceReview.create({
      data: {
        employeeId,
        reviewPeriod,
        reviewType: performanceData.reviewType || 'annual',
        overallRating: analysis.overallRating,
        goals: JSON.stringify(analysis.goals),
        achievements: JSON.stringify(analysis.achievements),
        areasForImprovement: JSON.stringify(analysis.developmentAreas),
        competencyScores: JSON.stringify(analysis.competencyScores),
        aiGenerated: true,
        aiSummary: analysis.executiveSummary,
        aiRecommendations: JSON.stringify(analysis.managerRecommendations),
        status: 'draft',
      },
      include: { employee: true },
    });

    res.json({ review, analysis });
  } catch (error) {
    console.error('Generate Performance Review Error:', error);
    res.status(500).json({ error: 'Failed to generate performance review' });
  }
};

// Update performance review
exports.updatePerformanceReview = async (req, res) => {
  try {
    const review = await prisma.performanceReview.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        goals: req.body.goals ? JSON.stringify(req.body.goals) : undefined,
        achievements: req.body.achievements ? JSON.stringify(req.body.achievements) : undefined,
        areasForImprovement: req.body.areasForImprovement ? JSON.stringify(req.body.areasForImprovement) : undefined,
        competencyScores: req.body.competencyScores ? JSON.stringify(req.body.competencyScores) : undefined,
        aiRecommendations: req.body.aiRecommendations ? JSON.stringify(req.body.aiRecommendations) : undefined,
      },
      include: { employee: true },
    });
    res.json(review);
  } catch (error) {
    console.error('Update Performance Review Error:', error);
    res.status(500).json({ error: 'Failed to update performance review' });
  }
};

// Delete performance review
exports.deletePerformanceReview = async (req, res) => {
  try {
    await prisma.performanceReview.delete({ where: { id: req.params.id } });
    res.json({ message: 'Performance review deleted successfully' });
  } catch (error) {
    console.error('Delete Performance Review Error:', error);
    res.status(500).json({ error: 'Failed to delete performance review' });
  }
};

// ==================== SALARY BENCHMARKING ====================

// Get all salary benchmarks
exports.getSalaryBenchmarks = async (req, res) => {
  try {
    const { department, title } = req.query;
    const where = {};
    if (department) where.department = department;
    if (title) where.title = { contains: title, mode: 'insensitive' };

    const benchmarks = await prisma.salaryBenchmark.findMany({
      where,
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(benchmarks);
  } catch (error) {
    console.error('Get Salary Benchmarks Error:', error);
    res.status(500).json({ error: 'Failed to fetch salary benchmarks' });
  }
};

// Get salary benchmark by ID
exports.getSalaryBenchmark = async (req, res) => {
  try {
    const benchmark = await prisma.salaryBenchmark.findUnique({
      where: { id: req.params.id },
      include: { employee: true },
    });
    if (!benchmark) {
      return res.status(404).json({ error: 'Salary benchmark not found' });
    }
    res.json(benchmark);
  } catch (error) {
    console.error('Get Salary Benchmark Error:', error);
    res.status(500).json({ error: 'Failed to fetch salary benchmark' });
  }
};

// Benchmark salary
exports.benchmarkSalary = async (req, res) => {
  try {
    const { title, department, location, yearsExperience, currentSalary, employeeId } = req.body;

    const analysis = await aiService.benchmarkSalary({
      title,
      department,
      location,
      yearsExperience,
      currentSalary,
    });

    const benchmark = await prisma.salaryBenchmark.create({
      data: {
        title,
        department,
        location,
        yearsExperience,
        employeeId: employeeId || null,
        currentSalary: currentSalary || null,
        marketMin: analysis.marketAnalysis.min,
        marketMedian: analysis.marketAnalysis.median,
        marketMax: analysis.marketAnalysis.max,
        percentile: analysis.currentPositioning?.percentile || null,
        competitiveness: analysis.currentPositioning?.competitiveness || null,
        aiAnalysis: JSON.stringify(analysis),
        recommendations: JSON.stringify(analysis.recommendations),
        dataSource: 'AI Market Analysis',
      },
      include: { employee: true },
    });

    res.json({ benchmark, analysis });
  } catch (error) {
    console.error('Benchmark Salary Error:', error);
    res.status(500).json({ error: 'Failed to benchmark salary' });
  }
};

// Delete salary benchmark
exports.deleteSalaryBenchmark = async (req, res) => {
  try {
    await prisma.salaryBenchmark.delete({ where: { id: req.params.id } });
    res.json({ message: 'Salary benchmark deleted successfully' });
  } catch (error) {
    console.error('Delete Salary Benchmark Error:', error);
    res.status(500).json({ error: 'Failed to delete salary benchmark' });
  }
};

// ==================== EXIT INTERVIEWS ====================

// Get all exit interviews
exports.getExitInterviews = async (req, res) => {
  try {
    const { status, reason } = req.query;
    const where = {};
    if (status) where.status = status;
    if (reason) where.reason = reason;

    const interviews = await prisma.exitInterview.findMany({
      where,
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, department: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(interviews);
  } catch (error) {
    console.error('Get Exit Interviews Error:', error);
    res.status(500).json({ error: 'Failed to fetch exit interviews' });
  }
};

// Get exit interview by ID
exports.getExitInterview = async (req, res) => {
  try {
    const interview = await prisma.exitInterview.findUnique({
      where: { id: req.params.id },
      include: { employee: true },
    });
    if (!interview) {
      return res.status(404).json({ error: 'Exit interview not found' });
    }
    res.json(interview);
  } catch (error) {
    console.error('Get Exit Interview Error:', error);
    res.status(500).json({ error: 'Failed to fetch exit interview' });
  }
};

// Create exit interview
exports.createExitInterview = async (req, res) => {
  try {
    const interview = await prisma.exitInterview.create({
      data: {
        ...req.body,
        exitDate: new Date(req.body.exitDate).toISOString(),
        questionsAnswers: req.body.questionsAnswers ? JSON.stringify(req.body.questionsAnswers) : null,
        keyThemes: req.body.keyThemes ? JSON.stringify(req.body.keyThemes) : null,
        actionableInsights: req.body.actionableInsights ? JSON.stringify(req.body.actionableInsights) : null,
      },
      include: { employee: true },
    });

    // Automatically run AI analysis if feedback is provided
    if (interview.feedback) {
      try {
        const analysis = await aiService.analyzeExitInterview({
          employeeName: `${interview.employee.firstName} ${interview.employee.lastName}`,
          department: interview.employee.department,
          title: interview.employee.title,
          tenure: Math.floor((new Date(interview.exitDate) - new Date(interview.employee.hireDate)) / (1000 * 60 * 60 * 24 * 365)),
          reason: interview.reason,
          feedback: interview.feedback,
          questionsAnswers: interview.questionsAnswers ? JSON.parse(interview.questionsAnswers) : [],
          satisfactionScore: interview.satisfactionScore,
          wouldRecommend: interview.wouldRecommend,
        });

        const updated = await prisma.exitInterview.update({
          where: { id: interview.id },
          data: {
            aiSummary: analysis.summary,
            keyThemes: JSON.stringify(analysis.keyThemes),
            sentimentScore: analysis.sentimentScore,
            actionableInsights: JSON.stringify(analysis.actionableInsights),
            status: 'analyzed',
          },
          include: { employee: true },
        });

        return res.status(201).json({ interview: updated, analysis });
      } catch (aiError) {
        console.error('AI analysis failed, returning interview without analysis:', aiError);
      }
    }

    res.status(201).json(interview);
  } catch (error) {
    console.error('Create Exit Interview Error:', error);
    res.status(500).json({ error: 'Failed to create exit interview' });
  }
};

// Analyze exit interview
exports.analyzeExitInterview = async (req, res) => {
  try {
    const { id } = req.params;

    const interview = await prisma.exitInterview.findUnique({
      where: { id },
      include: { employee: true },
    });

    if (!interview) {
      return res.status(404).json({ error: 'Exit interview not found' });
    }

    const analysis = await aiService.analyzeExitInterview({
      employeeName: `${interview.employee.firstName} ${interview.employee.lastName}`,
      department: interview.employee.department,
      title: interview.employee.title,
      tenure: Math.floor((new Date(interview.exitDate) - new Date(interview.employee.hireDate)) / (1000 * 60 * 60 * 24 * 365)),
      reason: interview.reason,
      feedback: interview.feedback,
      questionsAnswers: interview.questionsAnswers ? JSON.parse(interview.questionsAnswers) : [],
      satisfactionScore: interview.satisfactionScore,
      wouldRecommend: interview.wouldRecommend,
    });

    const updated = await prisma.exitInterview.update({
      where: { id },
      data: {
        aiSummary: analysis.summary,
        keyThemes: JSON.stringify(analysis.keyThemes),
        sentimentScore: analysis.sentimentScore,
        actionableInsights: JSON.stringify(analysis.actionableInsights),
        status: 'analyzed',
      },
      include: { employee: true },
    });

    res.json({ interview: updated, analysis });
  } catch (error) {
    console.error('Analyze Exit Interview Error:', error);
    res.status(500).json({ error: 'Failed to analyze exit interview' });
  }
};

// Update exit interview
exports.updateExitInterview = async (req, res) => {
  try {
    const interview = await prisma.exitInterview.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        questionsAnswers: req.body.questionsAnswers ? JSON.stringify(req.body.questionsAnswers) : undefined,
        keyThemes: req.body.keyThemes ? JSON.stringify(req.body.keyThemes) : undefined,
        actionableInsights: req.body.actionableInsights ? JSON.stringify(req.body.actionableInsights) : undefined,
      },
      include: { employee: true },
    });
    res.json(interview);
  } catch (error) {
    console.error('Update Exit Interview Error:', error);
    res.status(500).json({ error: 'Failed to update exit interview' });
  }
};

// Delete exit interview
exports.deleteExitInterview = async (req, res) => {
  try {
    await prisma.exitInterview.delete({ where: { id: req.params.id } });
    res.json({ message: 'Exit interview deleted successfully' });
  } catch (error) {
    console.error('Delete Exit Interview Error:', error);
    res.status(500).json({ error: 'Failed to delete exit interview' });
  }
};

// ==================== ORG CHART ====================

// Get all org charts
exports.getOrgCharts = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;

    const charts = await prisma.orgChart.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json(charts);
  } catch (error) {
    console.error('Get Org Charts Error:', error);
    res.status(500).json({ error: 'Failed to fetch org charts' });
  }
};

// Get org chart by ID
exports.getOrgChart = async (req, res) => {
  try {
    const chart = await prisma.orgChart.findUnique({
      where: { id: req.params.id },
    });
    if (!chart) {
      return res.status(404).json({ error: 'Org chart not found' });
    }
    res.json(chart);
  } catch (error) {
    console.error('Get Org Chart Error:', error);
    res.status(500).json({ error: 'Failed to fetch org chart' });
  }
};

// Create org chart from employees
exports.createOrgChart = async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      where: { status: 'active' },
      include: {
        manager: { select: { id: true, firstName: true, lastName: true } },
        directReports: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    const structure = employees.map(e => ({
      id: e.id,
      name: `${e.firstName} ${e.lastName}`,
      title: e.title,
      department: e.department,
      managerId: e.managerId,
      directReports: e.directReports.length,
    }));

    const chart = await prisma.orgChart.create({
      data: {
        name: req.body.name || 'Current Org Chart',
        description: req.body.description || 'Auto-generated from employee data',
        structure: JSON.stringify(structure),
        status: 'current',
      },
    });

    // Automatically run AI optimization
    try {
      const analysis = await aiService.optimizeOrgChart({ structure, name: chart.name });

      const updated = await prisma.orgChart.update({
        where: { id: chart.id },
        data: {
          aiOptimizations: JSON.stringify(analysis),
          metrics: JSON.stringify(analysis.currentMetrics),
          spanOfControl: analysis.currentMetrics?.averageSpanOfControl,
          layerCount: analysis.currentMetrics?.hierarchyLevels,
        },
      });

      return res.status(201).json({ chart: updated, analysis });
    } catch (aiError) {
      console.error('AI optimization failed, returning chart without analysis:', aiError);
    }

    res.status(201).json(chart);
  } catch (error) {
    console.error('Create Org Chart Error:', error);
    res.status(500).json({ error: 'Failed to create org chart' });
  }
};

// Optimize org chart with AI
exports.optimizeOrgChart = async (req, res) => {
  try {
    const { id } = req.params;

    const chart = await prisma.orgChart.findUnique({ where: { id } });
    if (!chart) {
      return res.status(404).json({ error: 'Org chart not found' });
    }

    const structure = JSON.parse(chart.structure);
    const analysis = await aiService.optimizeOrgChart({ structure, name: chart.name });

    const updated = await prisma.orgChart.update({
      where: { id },
      data: {
        aiOptimizations: JSON.stringify(analysis),
        metrics: JSON.stringify(analysis.currentMetrics),
        spanOfControl: analysis.currentMetrics?.averageSpanOfControl,
        layerCount: analysis.currentMetrics?.hierarchyLevels,
      },
    });

    res.json({ chart: updated, analysis });
  } catch (error) {
    console.error('Optimize Org Chart Error:', error);
    res.status(500).json({ error: 'Failed to optimize org chart' });
  }
};

// Delete org chart
exports.deleteOrgChart = async (req, res) => {
  try {
    await prisma.orgChart.delete({ where: { id: req.params.id } });
    res.json({ message: 'Org chart deleted successfully' });
  } catch (error) {
    console.error('Delete Org Chart Error:', error);
    res.status(500).json({ error: 'Failed to delete org chart' });
  }
};

// ==================== INTERVIEW SCHEDULING ====================

// Get all interview schedules
exports.getInterviewSchedules = async (req, res) => {
  try {
    const { candidateId, status } = req.query;
    const where = {};
    if (candidateId) where.candidateId = candidateId;
    if (status) where.status = status;

    const schedules = await prisma.interviewSchedule.findMany({
      where,
      include: {
        candidate: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(schedules);
  } catch (error) {
    console.error('Get Interview Schedules Error:', error);
    res.status(500).json({ error: 'Failed to fetch interview schedules' });
  }
};

// Get interview schedule by ID
exports.getInterviewSchedule = async (req, res) => {
  try {
    const schedule = await prisma.interviewSchedule.findUnique({
      where: { id: req.params.id },
      include: { candidate: true },
    });
    if (!schedule) {
      return res.status(404).json({ error: 'Interview schedule not found' });
    }
    res.json(schedule);
  } catch (error) {
    console.error('Get Interview Schedule Error:', error);
    res.status(500).json({ error: 'Failed to fetch interview schedule' });
  }
};

// Create interview schedule with AI suggestions
exports.createInterviewSchedule = async (req, res) => {
  try {
    const { candidateId, interviewers, duration, type, availableSlots } = req.body;

    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: { jobPosting: true },
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const suggestions = await aiService.suggestInterviewSchedule({
      candidate: {
        name: `${candidate.firstName} ${candidate.lastName}`,
        position: candidate.jobPosting.title,
      },
      interviewers,
      duration,
      type,
      availableSlots,
    });

    const schedule = await prisma.interviewSchedule.create({
      data: {
        candidateId,
        interviewers: JSON.stringify(interviewers),
        proposedSlots: JSON.stringify(availableSlots),
        duration,
        type,
        aiSuggestions: JSON.stringify(suggestions),
        status: 'pending',
      },
      include: { candidate: true },
    });

    res.json({ schedule, suggestions });
  } catch (error) {
    console.error('Create Interview Schedule Error:', error);
    res.status(500).json({ error: 'Failed to create interview schedule' });
  }
};

// Update interview schedule
exports.updateInterviewSchedule = async (req, res) => {
  try {
    const schedule = await prisma.interviewSchedule.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        interviewers: req.body.interviewers ? JSON.stringify(req.body.interviewers) : undefined,
        proposedSlots: req.body.proposedSlots ? JSON.stringify(req.body.proposedSlots) : undefined,
      },
      include: { candidate: true },
    });
    res.json(schedule);
  } catch (error) {
    console.error('Update Interview Schedule Error:', error);
    res.status(500).json({ error: 'Failed to update interview schedule' });
  }
};

// Delete interview schedule
exports.deleteInterviewSchedule = async (req, res) => {
  try {
    await prisma.interviewSchedule.delete({ where: { id: req.params.id } });
    res.json({ message: 'Interview schedule deleted successfully' });
  } catch (error) {
    console.error('Delete Interview Schedule Error:', error);
    res.status(500).json({ error: 'Failed to delete interview schedule' });
  }
};

// ==================== SKILLS ASSESSMENT ====================

// Assess candidate skills
exports.assessSkills = async (req, res) => {
  try {
    const { candidateId, requiredSkills } = req.body;

    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: { jobPosting: true },
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const analysis = await aiService.assessSkills(
      {
        name: `${candidate.firstName} ${candidate.lastName}`,
        currentTitle: candidate.currentTitle,
        currentCompany: candidate.currentCompany,
        yearsExperience: candidate.yearsExperience,
        skills: candidate.skills ? JSON.parse(candidate.skills) : [],
        resumeSummary: candidate.aiSummary,
      },
      requiredSkills || candidate.jobPosting.requirements.split(',').map(s => s.trim())
    );

    // Save to Assessment model
    const assessment = await prisma.assessment.create({
      data: {
        name: `Skills Assessment - ${candidate.firstName} ${candidate.lastName}`,
        type: 'technical',
        status: 'completed',
        score: analysis.overallScore || 0,
        aiAnalysis: JSON.stringify(analysis),
        completedAt: new Date(),
        candidateId,
      },
    });

    res.json({ candidate, analysis, assessment });
  } catch (error) {
    console.error('Assess Skills Error:', error);
    res.status(500).json({ error: 'Failed to assess skills' });
  }
};

// Get all assessments
exports.getAssessments = async (req, res) => {
  try {
    const assessments = await prisma.assessment.findMany({
      include: { candidate: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(assessments);
  } catch (error) {
    console.error('Get Assessments Error:', error);
    res.status(500).json({ error: 'Failed to fetch assessments' });
  }
};

// Delete assessment
exports.deleteAssessment = async (req, res) => {
  try {
    await prisma.assessment.delete({ where: { id: req.params.id } });
    res.json({ message: 'Assessment deleted successfully' });
  } catch (error) {
    console.error('Delete Assessment Error:', error);
    res.status(500).json({ error: 'Failed to delete assessment' });
  }
};

// ==================== AI: SKILLS GAP ANALYSIS ====================
exports.skillsGapAnalysis = async (req, res) => {
  try {
    const { teamSkills, targetCapabilities } = req.body;
    if (!teamSkills || !targetCapabilities) {
      return res.status(400).json({ error: 'teamSkills and targetCapabilities are required' });
    }
    const analysis = await aiService.skillsGapAnalysis(teamSkills, targetCapabilities);
    res.json({ analysis });
  } catch (error) {
    console.error('Skills Gap Analysis Error:', error);
    res.status(500).json({ error: error.message || 'Failed to run skills gap analysis' });
  }
};

// ==================== AI: INTERVIEW ANALYSIS ====================
exports.analyzeInterviewTranscript = async (req, res) => {
  try {
    const { transcript, jobDescription, candidateName } = req.body;
    if (!transcript || !transcript.trim()) {
      return res.status(400).json({ error: 'transcript is required' });
    }
    const analysis = await aiService.analyzeInterview(transcript, jobDescription || '', candidateName || '');
    res.json({ analysis });
  } catch (error) {
    console.error('Interview Analysis Error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze interview' });
  }
};

// ==================== AI: RETENTION RISK PREDICTION ====================
exports.predictRetentionRisk = async (req, res) => {
  try {
    const { employeeProfile, contextSignals } = req.body;
    if (!employeeProfile) return res.status(400).json({ error: 'employeeProfile is required' });
    const risk = await aiService.predictRetentionRisk(employeeProfile, contextSignals || {});
    res.json({ risk });
  } catch (error) {
    console.error('Retention Risk Error:', error);
    res.status(500).json({ error: error.message || 'Failed to predict retention risk' });
  }
};

// ==================== AI: OFFER LETTER GENERATOR (apply pass 4) ====================
exports.generateOfferLetter = async (req, res) => {
  if (!process.env.OPENROUTER_API_KEY) {
    return res.status(503).json({ error: 'AI service unavailable: OPENROUTER_API_KEY is not configured.' });
  }
  try {
    const { offerInput } = req.body;
    if (!offerInput || typeof offerInput !== 'object') {
      return res.status(400).json({ error: 'offerInput object is required (candidateName, role, baseSalary, startDate, etc.).' });
    }
    const offer = await aiService.generateOfferLetter(offerInput);
    res.json({ offer });
  } catch (error) {
    console.error('Offer Letter Error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate offer letter' });
  }
};

// ==================== AI: DEI METRICS AGGREGATOR (apply pass 4) ====================
exports.deiMetrics = async (req, res) => {
  if (!process.env.OPENROUTER_API_KEY) {
    return res.status(503).json({ error: 'AI service unavailable: OPENROUTER_API_KEY is not configured.' });
  }
  try {
    const { workforceSnapshot, hiringFunnel } = req.body;
    if (!workforceSnapshot && !hiringFunnel) {
      return res.status(400).json({ error: 'workforceSnapshot and/or hiringFunnel are required.' });
    }
    const metrics = await aiService.deiMetricsAggregate(workforceSnapshot, hiringFunnel);
    res.json({ metrics });
  } catch (error) {
    console.error('DEI Metrics Error:', error);
    res.status(500).json({ error: error.message || 'Failed to aggregate DEI metrics' });
  }
};
