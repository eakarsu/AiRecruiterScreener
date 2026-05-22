const router = require('express').Router();

router.post('/score', (req, res) => {
  const { candidateCount = 0, interviewReady = 0, underrepresentedPct = 0, referralPct = 0, skillCoveragePct = 0 } = req.body || {};
  const sizeScore = Math.min(25, Number(candidateCount) * 3);
  const readinessScore = Math.min(25, Number(interviewReady) * 4);
  const diversityScore = Math.min(20, Number(underrepresentedPct) * 0.7);
  const referralPenalty = Math.max(0, Number(referralPct) - 45) * 0.5;
  const skillScore = Math.min(30, Number(skillCoveragePct) * 0.3);
  const score = Math.max(0, Math.min(100, Math.round(sizeScore + readinessScore + diversityScore + skillScore - referralPenalty)));

  res.json({
    feature: 'candidate_slate_balance',
    score,
    level: score >= 75 ? 'balanced' : score >= 45 ? 'thin' : 'at-risk',
    actions: [
      Number(candidateCount) < 6 && 'Source additional qualified candidates before final interviews.',
      Number(underrepresentedPct) < 30 && 'Expand sourcing channels to improve slate representation.',
      Number(skillCoveragePct) < 70 && 'Add candidates covering missing must-have skills.',
      Number(referralPct) > 55 && 'Reduce overreliance on referral-only sourcing.',
    ].filter(Boolean),
  });
});

module.exports = router;
