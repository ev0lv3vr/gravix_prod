# Failure Analysis (F7–F12) — L1 Summary

> Full detail: `L2/failure-analysis-full.md` | Form fields: `L2/forms-full.md` | Source: gravix-final-prd.md Parts V, VI

## What It Does
User describes adhesive bond failure (substrates, adhesive used, conditions, failure mode, optionally uploads defect photos). AI identifies probable root causes ranked by confidence with 8D methodology alignment. Powers the Quality Module's D4 (root cause) step.

## Routes
- `/failure` — Failure Analysis form + results (standard mode)
- `/failure?mode=guided` — Guided Investigation (chat-style, Quality+ tier)

## Tier Gating
| Tier | Access |
|------|--------|
| Free | 3 analyses/mo (shared with spec engine), summary only |
| Pro | 30/mo, full results + feedback |
| Quality+ | Visual failure analysis (photo AI), guided investigation mode, TDS intelligence |

## Form Layout
**Zone 1 (always visible):** Substrate A (combobox), Substrate B (combobox), Adhesive Used / Product Name (autocomplete + free-form), Failure Description (textarea, 500 char min recommended), Photo Upload Zone (up to 5 images, 10MB each, JPEG/PNG/HEIC, drag-and-drop)
**Zone 2 (collapsed by default):** Load Type (multi-select), Environment (multi-select + conditional sub-fields), Temperature Range, Timeline, Failure Mode (single-select with visual tooltip: adhesive vs cohesive vs mixed vs substrate failure), Industry, Surface Preparation (multi-select), Additional Context

## Key Components
- `PhotoUploadZone` — drag-and-drop, thumbnail preview with remove, integrated into Zone 1 (failure form only)
- `FailureResults` — ranked root causes with confidence, recommended corrective actions, 8D alignment tags
- `VisualAnalysisResults` — failure mode classification from photos with confidence (Quality+ only)
- `TDSComplianceSection` — spec violations flagged against product TDS data (Quality+ only)
- `KnownRisksSection` — field failure rate data from `product_specifications` (Quality+ only)
- `AnalysisModeToggle` — Standard / Guided toggle (Quality+ only)
- `GuidedInvestigation` — chat-style UI, AI asks follow-up questions, tool calls for TDS lookup / pattern search

## API Contract
```
POST /api/failure-analysis
Body: { substrate_a, substrate_b, adhesive_used, failure_description, photos[]?, load_types[], environment[], temperature_range, timeline, failure_mode, industry, surface_prep[], additional_context }
Response: { id, root_causes[{ cause, confidence, category, corrective_actions[], 8d_discipline }], visual_analysis?{ failure_mode_classification, confidence, annotated_image_url }, tds_compliance?{ violations[], warnings[] }, known_risks?[] }
Auth: Required on submit (F19 gate)

POST /api/failure-analysis/guided
Body: { session_id?, message, context{} }
Response: { session_id, response, tool_calls[]?, is_complete, turn_count }
Auth: Quality+ tier required
```

## Critical Validations
- Failure description required (minimum meaningful input)
- Photos: max 5, max 10MB each, JPEG/PNG/HEIC only
- Visual analysis only runs if photos uploaded AND user is Quality+ tier
- Guided investigation: max 20 turns per session, session pause/resume via `guided_investigation_sessions` table
- Root cause categories must be one of: surface_preparation, material_compatibility, application_process, cure_conditions, environmental, design, unknown

## AI Engine
- Model: Claude Sonnet (root cause analysis), Claude with vision (photo analysis, Quality+ only)
- Root cause classifier normalizes free-text into categories
- Knowledge injection: empirical data from `knowledge_patterns` injected when substrate pair / failure mode / industry matches
- TDS intelligence: if product name matched to `product_specifications`, check analysis against TDS parameters
