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

## Apply pass 6 (close-out)

Implemented (2 mechanical follow-ups):

1. `POST /api/ai/offer-letter-generator` — LLM-only offer letter draft.
   - Body: `{ candidate:{name,role,level}, terms:{base_salary,bonus?,equity?,start_date,location,employment_type,benefits_summary?}, company:{name,brand_voice?}, custom_clauses? }`.
   - Returns: `{ offer_letter_markdown, offer_letter_html, summary_for_candidate, key_terms_highlights, recommended_negotiation_responses }`.
   - 503 when `OPENROUTER_API_KEY` missing; 400 on missing required fields.
2. `GET /api/ai/dei-metrics?period=30d&dept=...` — aggregator.
   - Pulls `prisma.candidate` (pipeline) + `prisma.employee` (hires) inside `.catch(()=>[])` so missing tables/columns degrade gracefully.
   - Period parser accepts `Nd|Nw|Nm` (defaults `30d`); optional `dept` filter applied to both pipeline (via `jobPosting.department`) and hires.
   - Computes `pipeline_demographics`, `hire_demographics`, `conversion_rates_by_segment` (overall + by_source + by_department), rule-driven `gaps`, prior-window `trend_indicators`, rule-driven `recommended_actions` (LLM-augmented when key configured), and the required `disclaimer`.
   - LLM call is optional; if `OPENROUTER_API_KEY` unset or call fails, rule actions are returned and the endpoint still succeeds.

Files touched (append-only):

- `backend/src/services/aiService.js` — appended `generateOfferLetterStructured(input)` and `deiMetricsRecommendations(payload)` methods on `AIService` class (before `module.exports`).
- `backend/src/routes/ai-extras.js` — NEW route module, mounted under `/api/ai`. Reuses `authMiddleware`, `prisma`, `aiService`.
- `backend/src/index.js` — appended `app.use('/api/ai', require('./routes/ai-extras'))` after the `=== End Batch 07 ===` marker.

No schema changes. No new deps. No `.env` edits. No FE touched. Servers not started.

Syntax: `node --check` PASS on `routes/ai-extras.js`, `services/aiService.js`, `index.js`.

Remaining backlog:

- **MECHANICAL-deferred:** Persist AI outputs to dedicated Prisma models (offer letters, DEI snapshots, prior-pass skills-gap / interview-analysis / retention-risk). Currently stateless. Schema decision needed: one polymorphic `AiArtifact` table vs. per-feature models.
- **NEEDS-PRODUCT-DECISION:** Onboarding checklist domain model — task templates per role/dept, owner roles, due-date offsets relative to start date, status workflow, integration with `Employee`/`JobPosting`.
- **NEEDS-LIB-CHOICE:** Resume parser PDF→text — pick between `pdf-parse`, `pdfjs-dist`, `mammoth` (DOCX), or a hosted parser; affects deps and file-upload route shape.

