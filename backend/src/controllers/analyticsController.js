const prisma = require('../config/database');

// Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalJobs,
      activeJobs,
      totalCandidates,
      newCandidates,
      scheduledInterviews,
      completedInterviews,
      hiredCandidates,
      avgScore,
    ] = await Promise.all([
      prisma.jobPosting.count(),
      prisma.jobPosting.count({ where: { status: 'active' } }),
      prisma.candidate.count(),
      prisma.candidate.count({ where: { status: 'new' } }),
      prisma.interview.count({ where: { status: 'scheduled' } }),
      prisma.interview.count({ where: { status: 'completed' } }),
      prisma.candidate.count({ where: { status: 'hired' } }),
      prisma.candidate.aggregate({
        _avg: { aiScore: true },
        where: { aiScore: { not: null } },
      }),
    ]);

    res.json({
      jobs: {
        total: totalJobs,
        active: activeJobs,
      },
      candidates: {
        total: totalCandidates,
        new: newCandidates,
        hired: hiredCandidates,
        avgScore: Math.round(avgScore._avg.aiScore || 0),
      },
      interviews: {
        scheduled: scheduledInterviews,
        completed: completedInterviews,
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

// Get pipeline overview
const getPipelineOverview = async (req, res) => {
  try {
    const pipeline = await prisma.candidate.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    const stages = await prisma.pipelineStage.findMany({
      orderBy: { order: 'asc' },
    });

    res.json({
      pipeline: pipeline.map(p => ({
        status: p.status,
        count: p._count.status,
      })),
      stages,
    });
  } catch (error) {
    console.error('Get pipeline overview error:', error);
    res.status(500).json({ error: 'Failed to fetch pipeline overview' });
  }
};

// Get hiring funnel
const getHiringFunnel = async (req, res) => {
  try {
    const { jobId, startDate, endDate } = req.query;

    const where = {};
    if (jobId) where.jobPostingId = jobId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const funnel = await prisma.candidate.groupBy({
      by: ['status'],
      where,
      _count: { status: true },
    });

    const statusOrder = ['new', 'screening', 'interviewed', 'offered', 'hired', 'rejected'];
    const orderedFunnel = statusOrder.map(status => {
      const found = funnel.find(f => f.status === status);
      return {
        status,
        count: found ? found._count.status : 0,
      };
    });

    res.json(orderedFunnel);
  } catch (error) {
    console.error('Get hiring funnel error:', error);
    res.status(500).json({ error: 'Failed to fetch hiring funnel' });
  }
};

// Get recent activity
const getRecentActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const [recentCandidates, recentInterviews, recentCommunications] = await Promise.all([
      prisma.candidate.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          status: true,
          createdAt: true,
          jobPosting: {
            select: { title: true },
          },
        },
      }),
      prisma.interview.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          scheduledAt: true,
          status: true,
          type: true,
          createdAt: true,
          candidate: {
            select: { firstName: true, lastName: true },
          },
        },
      }),
      prisma.communication.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          subject: true,
          status: true,
          createdAt: true,
          candidate: {
            select: { firstName: true, lastName: true },
          },
        },
      }),
    ]);

    // Combine and sort by createdAt
    const activities = [
      ...recentCandidates.map(c => ({
        type: 'candidate',
        id: c.id,
        title: `New candidate: ${c.firstName} ${c.lastName}`,
        description: `Applied for ${c.jobPosting.title}`,
        status: c.status,
        createdAt: c.createdAt,
      })),
      ...recentInterviews.map(i => ({
        type: 'interview',
        id: i.id,
        title: `Interview ${i.status}: ${i.candidate.firstName} ${i.candidate.lastName}`,
        description: `${i.type} interview`,
        status: i.status,
        createdAt: i.createdAt,
      })),
      ...recentCommunications.map(c => ({
        type: 'communication',
        id: c.id,
        title: `${c.type} ${c.status}: ${c.candidate.firstName} ${c.candidate.lastName}`,
        description: c.subject || 'No subject',
        status: c.status,
        createdAt: c.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);

    res.json(activities);
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
};

// Get source analytics
const getSourceAnalytics = async (req, res) => {
  try {
    const sources = await prisma.candidate.groupBy({
      by: ['source'],
      _count: { source: true },
      _avg: { aiScore: true },
    });

    res.json(
      sources.map(s => ({
        source: s.source || 'Unknown',
        count: s._count.source,
        avgScore: Math.round(s._avg.aiScore || 0),
      }))
    );
  } catch (error) {
    console.error('Get source analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch source analytics' });
  }
};

// Get time to hire analytics
const getTimeToHire = async (req, res) => {
  try {
    const hiredCandidates = await prisma.candidate.findMany({
      where: { status: 'hired' },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        jobPosting: {
          select: { title: true, department: true },
        },
      },
    });

    const timeToHire = hiredCandidates.map(c => {
      const days = Math.round(
        (new Date(c.updatedAt) - new Date(c.createdAt)) / (1000 * 60 * 60 * 24)
      );
      return {
        candidateId: c.id,
        jobTitle: c.jobPosting.title,
        department: c.jobPosting.department,
        daysToHire: days,
      };
    });

    const avgDays =
      timeToHire.length > 0
        ? Math.round(timeToHire.reduce((sum, t) => sum + t.daysToHire, 0) / timeToHire.length)
        : 0;

    res.json({
      avgDaysToHire: avgDays,
      details: timeToHire,
    });
  } catch (error) {
    console.error('Get time to hire error:', error);
    res.status(500).json({ error: 'Failed to fetch time to hire' });
  }
};

module.exports = {
  getDashboardStats,
  getPipelineOverview,
  getHiringFunnel,
  getRecentActivity,
  getSourceAnalytics,
  getTimeToHire,
};
