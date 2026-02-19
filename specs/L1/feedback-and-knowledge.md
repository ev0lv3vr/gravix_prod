# Feedback & Knowledge Layer (V2 Intelligence) — L1 Summary

> Full detail: `L2/feedback-and-knowledge-full.md` | Source: gravix-final-prd.md Part II

## What It Does
The moat. Four interlocking systems: (1) Feedback capture — did the fix work? (2) Knowledge aggregation — compute patterns from confirmed outcomes. (3) Knowledge injection — augment AI prompts with empirical data. (4) Case library — auto-generate searchable case studies.

## The Flywheel
```
Analysis → Fix attempted → Feedback submitted → Patterns computed → Next analysis augmented → Better results → More trust → More users → More data
```
Without this, Gravix is a Claude wrapper. With it, analysis #1,000 is categorically better than #1.

## Tier Gating
| Feature | Free | Pro | Quality+ |
|---------|------|-----|----------|
| Submit feedback | ❌ | ✅ | ✅ |
| View case library | View only | Full access | Full access |
| Knowledge badges on results | ❌ | ✅ | ✅ |
| Cross-linking (spec↔failure) | ❌ | ✅ | ✅ |

## Key Tables
- `analysis_feedback` — outcome tracking (was_helpful, root_cause_confirmed, outcome, actual_root_cause, what_worked, what_didnt_work, time_to_resolution, estimated_cost_saved)
- `knowledge_patterns` — aggregated intelligence (pattern_type, pattern_key, total_cases, resolution_rate, top_root_causes, effective_solutions, confidence_level)
- `case_library` — auto-generated case studies (material_category, failure_mode, root_cause, title, summary, solution, lessons_learned, slug)

## API Contracts
```
POST /api/feedback — { analysis_id|spec_id, was_helpful, root_cause_confirmed, outcome, actual_root_cause?, what_worked?, what_didnt_work?, ... }
GET /api/feedback/{analysis_id} — existing feedback for an analysis
GET /api/cases — { page, per_page, category?, failure_mode?, search? } → paginated case library
GET /api/cases/{slug} — single case study
GET /api/patterns/{pattern_type}/{pattern_key} — knowledge pattern data
```

## Key Services
- `SubstrateNormalizer` — maps free-text substrates to canonical IDs (e.g., "Al 6061" → "aluminum_6061")
- `RootCauseClassifier` — categorizes free-text root causes into 7 categories
- `KnowledgeAggregator` — cron job, recomputes patterns from all feedback data, updates confidence levels
- `KnowledgeContextBuilder` — called during AI analysis, finds relevant patterns, formats injection context
- `CaseLibraryGenerator` — auto-creates case studies from analyses with positive feedback

## Critical Validations
- Feedback requires Pro+ tier
- Only one feedback per analysis per user
- Aggregator runs via cron (daily) and on-demand after feedback submission
- Knowledge injection must not exceed token budget (check `knowledge_context_tokens` estimate before injection)
- Confidence levels: low (<5 cases), medium (5-20), high (>20 with >60% resolution rate)
- Case library entries require positive feedback (resolved/partially_resolved) — never auto-generate from unresolved analyses

## Frontend Components
- `FeedbackPrompt` — appears 48h after analysis, inline card with quick capture (helpful? which root cause?) + expandable rich feedback
- `ConfidenceBadge` — shows on results when knowledge context was used ("Based on 47 confirmed cases")
- `PendingFeedbackBanner` — dashboard reminder for analyses awaiting feedback
- `CaseLibrary` page — `/cases`, filterable grid of case studies, SEO-indexed
- `CrossLinkBanner` — on failure analysis results, shows "Related spec requests for this substrate pair"

## Follow-Up Email
- Sent 48 hours after analysis if no feedback submitted
- Contains: analysis summary, one-click feedback buttons (Resolved / Not resolved / Still testing)
- Email click lands on `/feedback/{token}` with pre-filled context
- Service: Resend, triggered by cron checking `feedback_sent_at IS NULL AND created_at < NOW() - INTERVAL '48 hours'`
