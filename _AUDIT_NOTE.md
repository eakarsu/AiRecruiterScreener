# Audit Note — AiRecruiterScreener

## Original audit recommendations (batch_07.md §13)

**Missing AI endpoints:** `/resume-screening`, `/interview-analysis`, `/culture-fit-assessment`, `/bias-detection`, `/salary-benchmark`, `/skills-gap-analysis`.

**Missing non-AI features:** resume parser, interview scheduling, ATS, offer letter generator, onboarding checklist, performance review templates.

**Custom suggestions:** unbiased resume ranking, interview intelligence, peer feedback aggregator, DEI dashboard, retention risk prediction, skills-to-role matcher.

Note: audit said "0 AI endpoints"; in reality `aiService.js` already implements analyzeResume / generateScreeningQuestions / scoreScreeningAnswer / generateInterviewQuestions / summarizeInterview / generateEmail / generateJobDescription / rankCandidates / generateAssessment / detectBias / analyzeSentiment / scoreCultureFit / generatePerformanceReview / benchmarkSalary / analyzeExitInterview / suggestInterviewSchedule / optimizeOrgChart / assessSkills (18 methods) — all wired through controllers/routes. Most of the audit's "missing" list was already done.

## Implemented this pass (3 mechanical)
1. `POST /api/hr/skills-gap-analysis` — team-vs-target capabilities gap with closure plan (hire/train/outsource).
2. `POST /api/hr/interview-analysis` — structured analysis of an interview transcript (topics, communication, flags).
3. `POST /api/hr/retention-risk` — early-tenure attrition risk score for a hire/employee profile.

Added: 3 methods on `aiService` (skillsGapAnalysis, analyzeInterview, predictRetentionRisk), 3 controller exports on `hrController`, 3 route lines on `hr.js`. Reuses existing `parseAIJson`, openrouter client, `authMiddleware`. Syntax-checked.

## Backlog (prioritized)
1. Persist new AI outputs to dedicated Prisma models (currently stateless) — mechanical follow-up.
2. Resume parser non-AI (PDF → text) — mechanical (NEEDS-LIB choice).
3. Offer letter generator endpoint — mechanical follow-up.
4. Onboarding checklist domain model — NEEDS-PRODUCT-DECISION.
5. DEI metrics dashboard aggregator — mechanical follow-up.

## Apply pass 3 (frontend)

Status: **LEFT-AS-IS**. Frontend already wires the three pass-2 endpoints with full Tailwind UIs.

- `frontend/src/pages/SkillsGapAnalysis.jsx` ↔ `POST /api/hr/skills-gap-analysis` (route `/hr/skills-gap-analysis`).
- `frontend/src/pages/InterviewAnalysis.jsx` ↔ `POST /api/hr/interview-analysis` (route `/hr/interview-analysis`).
- `frontend/src/pages/RetentionRisk.jsx` ↔ `POST /api/hr/retention-risk` (route `/hr/retention-risk`).
- Each page uses an axios instance with a request interceptor injecting `Authorization: Bearer <localStorage.token>`, and surfaces `err.response?.data?.error` (so 503-no-key shows cleanly).
- All three pages imported and registered in `frontend/src/App.jsx`; reachable from the `HRTools` hub page.

No FE files written this pass. No `npm install`. No new deps. See `_AUDIT/apply3_logs/ab3_64.md`.

