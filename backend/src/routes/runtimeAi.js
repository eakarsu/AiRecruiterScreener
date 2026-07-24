'use strict';
const express = require('express');
const prisma = require('../config/database');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.post('/screening-advice', authMiddleware, async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object' || !Object.keys(req.body).length) return res.status(400).json({ error: 'deidentified_screening_context_required' });
    const serialized = JSON.stringify(req.body);
    if (/name|email|phone|address|birth|gender|race|ethnicity|religion|disability/i.test(serialized)) return res.status(400).json({ error: 'identifying_or_protected_attribute_rejected' });
    const { OPENROUTER_API_KEY: key, OPENROUTER_MODEL: model, OPENROUTER_BASE_URL: base } = process.env;
    if (base !== 'https://openrouter.ai/api/v1' || !key || !model) throw new Error('OpenRouter runtime configuration is incomplete');
    const response = await fetch(`${base}/chat/completions`, {
      method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages: [
        { role: 'system', content: 'Give a concise, job-related candidate-screening review checklist. Require individualized human review and avoid protected attributes.' },
        { role: 'user', content: serialized },
      ] }),
    });
    if (!response.ok) throw new Error(`OpenRouter request failed with status ${response.status}`);
    const body = await response.json();
    const result = body.choices?.[0]?.message?.content;
    if (!result) throw new Error('OpenRouter returned no usable content');
    const rows = await prisma.$queryRawUnsafe(
      `INSERT INTO recruiter_runtime_ai_results(user_id,input,result,model)
       VALUES($1,$2::jsonb,$3::jsonb,$4) RETURNING id,created_at`,
      req.user.id, serialized, JSON.stringify({ text: result }), body.model || model,
    );
    return res.json({ success: true, result, model: body.model || model, persisted: { id: String(rows[0].id), created_at: rows[0].created_at } });
  } catch (error) {
    console.error('Runtime AI error:', error.message);
    return res.status(502).json({ error: 'provider_request_failed' });
  }
});

module.exports = router;
