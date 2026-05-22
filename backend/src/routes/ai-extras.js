// Apply pass 6 (mechanical backlog close-out)
// Mounts:
//   POST /api/ai/offer-letter-generator
//   GET  /api/ai/dei-metrics
// House style: reuses authMiddleware + aiService (openrouter via parseAIJson).
// Append-only; no schema changes; no new deps.

const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const aiService = require('../services/aiService');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// ---------- POST /api/ai/offer-letter-generator (LLM-only) ----------
router.post('/offer-letter-generator', async (req, res) => {
  if (!process.env.OPENROUTER_API_KEY) {
    return res.status(503).json({ error: 'AI service unavailable: OPENROUTER_API_KEY is not configured.' });
  }
  try {
    const { candidate, terms, company, custom_clauses } = req.body || {};
    if (!candidate || typeof candidate !== 'object' || !candidate.name || !candidate.role) {
      return res.status(400).json({ error: 'candidate.{name, role} is required.' });
    }
    if (!terms || typeof terms !== 'object' || terms.base_salary == null || !terms.start_date) {
      return res.status(400).json({ error: 'terms.{base_salary, start_date, location, employment_type} are required.' });
    }
    if (!company || typeof company !== 'object' || !company.name) {
      return res.status(400).json({ error: 'company.name is required.' });
    }

    const result = await aiService.generateOfferLetterStructured({
      candidate,
      terms,
      company,
      custom_clauses: Array.isArray(custom_clauses) ? custom_clauses : (custom_clauses ? [custom_clauses] : []),
    });

    // Normalize to the contract; the LLM may omit fields.
    res.json({
      offer_letter_markdown: result.offer_letter_markdown || '',
      offer_letter_html: result.offer_letter_html || '',
      summary_for_candidate: result.summary_for_candidate || '',
      key_terms_highlights: Array.isArray(result.key_terms_highlights) ? result.key_terms_highlights : [],
      recommended_negotiation_responses: Array.isArray(result.recommended_negotiation_responses)
        ? result.recommended_negotiation_responses
        : [],
    });
  } catch (error) {
    console.error('Offer Letter Generator Error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate offer letter' });
  }
});

// ---------- GET /api/ai/dei-metrics ----------
// Aggregates candidate pipeline + hire records from DB.
// Missing tables / columns => empty arrays via .catch(()=>[]).
// LLM call is optional (used only to enrich recommended_actions when configured).
router.get('/dei-metrics', async (req, res) => {
  try {
    const periodRaw = String(req.query.period || '30d');
    const dept = req.query.dept ? String(req.query.dept) : null;

    // Parse "30d" / "90d" / "365d" / "12m" — defaults to 30 days.
    let days = 30;
    const m = periodRaw.match(/^(\d+)\s*([dwm])$/i);
    if (m) {
      const n = parseInt(m[1], 10);
      const unit = m[2].toLowerCase();
      days = unit === 'd' ? n : unit === 'w' ? n * 7 : n * 30;
    }
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // ---- Pull candidate pipeline (status snapshot in window) ----
    const candidateWhere = { createdAt: { gte: since } };
    const candidates = await prisma.candidate.findMany({
      where: candidateWhere,
      select: {
        id: true,
        status: true,
        source: true,
        aiScore: true,
        createdAt: true,
        jobPosting: { select: { department: true, title: true } },
      },
    }).catch(() => []);

    const pipelineFiltered = dept
      ? candidates.filter((c) => c.jobPosting && c.jobPosting.department === dept)
      : candidates;

    // ---- Pull hire records (Employees hired in window, optional dept) ----
    const employeeWhere = { hireDate: { gte: since } };
    if (dept) employeeWhere.department = dept;
    const hires = await prisma.employee.findMany({
      where: employeeWhere,
      select: { id: true, department: true, title: true, hireDate: true, location: true },
    }).catch(() => []);

    // ---- Aggregate pipeline by status, by source, by department ----
    const groupCount = (rows, getKey) => {
      const out = {};
      for (const r of rows) {
        const k = getKey(r);
        if (k == null || k === '') continue;
        out[k] = (out[k] || 0) + 1;
      }
      return out;
    };

    const pipeline_demographics = {
      total_candidates: pipelineFiltered.length,
      by_status: groupCount(pipelineFiltered, (c) => c.status || 'unknown'),
      by_source: groupCount(pipelineFiltered, (c) => c.source || 'unspecified'),
      by_department: groupCount(pipelineFiltered, (c) => (c.jobPosting && c.jobPosting.department) || 'unspecified'),
    };

    const hire_demographics = {
      total_hires: hires.length,
      by_department: groupCount(hires, (h) => h.department || 'unspecified'),
      by_title: groupCount(hires, (h) => h.title || 'unspecified'),
      by_location: groupCount(hires, (h) => h.location || 'unspecified'),
    };

    // ---- Conversion rates by segment (status flow proxies) ----
    const statusCounts = pipeline_demographics.by_status;
    const safeRate = (num, den) => (den > 0 ? Math.round((num / den) * 1000) / 10 : 0);
    const totalApplied = pipelineFiltered.length;
    const screened = (statusCounts.screening || 0) + (statusCounts.interviewed || 0) + (statusCounts.offered || 0) + (statusCounts.hired || 0);
    const interviewed = (statusCounts.interviewed || 0) + (statusCounts.offered || 0) + (statusCounts.hired || 0);
    const offered = (statusCounts.offered || 0) + (statusCounts.hired || 0);
    const hired = statusCounts.hired || 0;

    const conversion_rates_by_segment = {
      overall: {
        applied_to_screened_pct: safeRate(screened, totalApplied),
        screened_to_interviewed_pct: safeRate(interviewed, screened),
        interviewed_to_offered_pct: safeRate(offered, interviewed),
        offered_to_hired_pct: safeRate(hired, offered),
      },
      by_source: Object.fromEntries(
        Object.keys(pipeline_demographics.by_source).map((src) => {
          const subset = pipelineFiltered.filter((c) => (c.source || 'unspecified') === src);
          const appliedS = subset.length;
          const hiredS = subset.filter((c) => c.status === 'hired').length;
          return [src, { applied: appliedS, hired: hiredS, hire_rate_pct: safeRate(hiredS, appliedS) }];
        })
      ),
      by_department: Object.fromEntries(
        Object.keys(pipeline_demographics.by_department).map((d) => {
          const subset = pipelineFiltered.filter((c) => ((c.jobPosting && c.jobPosting.department) || 'unspecified') === d);
          const appliedD = subset.length;
          const hiredD = subset.filter((c) => c.status === 'hired').length;
          return [d, { applied: appliedD, hired: hiredD, hire_rate_pct: safeRate(hiredD, appliedD) }];
        })
      ),
    };

    // ---- Gaps: low-pass-through stages, source skew ----
    const gaps = [];
    if (totalApplied > 0 && conversion_rates_by_segment.overall.applied_to_screened_pct < 30) {
      gaps.push({ stage: 'applied_to_screened', value_pct: conversion_rates_by_segment.overall.applied_to_screened_pct, note: 'Low screening pass-through' });
    }
    if (screened > 0 && conversion_rates_by_segment.overall.screened_to_interviewed_pct < 40) {
      gaps.push({ stage: 'screened_to_interviewed', value_pct: conversion_rates_by_segment.overall.screened_to_interviewed_pct, note: 'Interview rate may be selective' });
    }
    if (interviewed > 0 && conversion_rates_by_segment.overall.interviewed_to_offered_pct < 20) {
      gaps.push({ stage: 'interviewed_to_offered', value_pct: conversion_rates_by_segment.overall.interviewed_to_offered_pct, note: 'Few interviews convert to offers' });
    }
    // Source concentration > 60% of pipeline from one source
    const topSrcEntry = Object.entries(pipeline_demographics.by_source).sort((a, b) => b[1] - a[1])[0];
    if (topSrcEntry && totalApplied > 0 && topSrcEntry[1] / totalApplied > 0.6) {
      gaps.push({ dimension: 'source_concentration', group: topSrcEntry[0], share_pct: Math.round((topSrcEntry[1] / totalApplied) * 1000) / 10, note: 'Pipeline highly dependent on a single source' });
    }

    // ---- Trend indicators: compare window vs previous window of equal length ----
    const prevSince = new Date(since.getTime() - days * 24 * 60 * 60 * 1000);
    const prevCandidates = await prisma.candidate.findMany({
      where: { createdAt: { gte: prevSince, lt: since } },
      select: { id: true, status: true, jobPosting: { select: { department: true } } },
    }).catch(() => []);
    const prevHires = await prisma.employee.findMany({
      where: { hireDate: { gte: prevSince, lt: since }, ...(dept ? { department: dept } : {}) },
      select: { id: true },
    }).catch(() => []);
    const prevPipelineFiltered = dept
      ? prevCandidates.filter((c) => c.jobPosting && c.jobPosting.department === dept)
      : prevCandidates;
    const pctChange = (curr, prev) => {
      if (!prev) return curr ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 1000) / 10;
    };
    const trend_indicators = {
      window_days: days,
      pipeline_volume_pct_change: pctChange(pipelineFiltered.length, prevPipelineFiltered.length),
      hire_volume_pct_change: pctChange(hires.length, prevHires.length),
      direction: hires.length >= prevHires.length ? 'up_or_flat' : 'down',
    };

    // ---- Recommended actions: rule-driven; optionally LLM-augmented ----
    const rule_actions = [];
    if (totalApplied === 0) {
      rule_actions.push('Pipeline is empty for this window — review job-board postings and ATS source wiring.');
    } else {
      if (gaps.find((g) => g.stage === 'applied_to_screened')) {
        rule_actions.push('Audit screening criteria for unintended filters; consider structured rubric.');
      }
      if (gaps.find((g) => g.stage === 'interviewed_to_offered')) {
        rule_actions.push('Calibrate interview panels; review offer thresholds vs. interview signal.');
      }
      if (gaps.find((g) => g.dimension === 'source_concentration')) {
        rule_actions.push('Diversify sourcing: add at least two complementary channels.');
      }
      if (trend_indicators.hire_volume_pct_change < 0) {
        rule_actions.push('Hire volume declined vs. prior window — investigate offer acceptance and time-to-hire.');
      }
    }

    let recommended_actions = rule_actions;
    if (process.env.OPENROUTER_API_KEY) {
      try {
        const llmActions = await aiService.deiMetricsRecommendations({
          period_days: days,
          dept: dept || 'all',
          pipeline_demographics,
          hire_demographics,
          conversion_rates_by_segment,
          gaps,
          trend_indicators,
        });
        if (llmActions && Array.isArray(llmActions.recommended_actions) && llmActions.recommended_actions.length) {
          recommended_actions = llmActions.recommended_actions;
        }
      } catch (e) {
        // LLM optional — fall back to rule actions silently.
      }
    }

    res.json({
      pipeline_demographics,
      hire_demographics,
      conversion_rates_by_segment,
      gaps,
      trend_indicators,
      recommended_actions,
      disclaimer: 'Aggregate metrics — do not use for individual employment decisions',
    });
  } catch (error) {
    console.error('DEI Metrics Error:', error);
    res.status(500).json({ error: error.message || 'Failed to aggregate DEI metrics' });
  }
});

module.exports = router;
