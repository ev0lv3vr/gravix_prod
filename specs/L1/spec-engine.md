# Spec Engine (F1–F6) — L1 Summary

> Full detail: `L2/spec-engine-full.md` | Form fields: `L2/forms-full.md` | Source: gravix-final-prd.md Parts V, VI, VII

## What It Does
User inputs substrate pair, load types, environment, constraints → AI returns ranked adhesive recommendations with confidence scores, specific product names, and application instructions. The primary conversion tool.

## Routes
- `/tool` — Spec Engine form + results

## Tier Gating
| Tier | Access |
|------|--------|
| Free | 3 analyses/mo, summary results only (detailed rationale blurred) |
| Pro | 30/mo, full results, feedback, cross-linking |
| Quality+ | 100/mo, TDS intelligence, product matching from DB |

## Form Layout
**Zone 1 (always visible):** Substrate A (combobox), Substrate B (combobox), Adhesive Used / Product Name (autocomplete from `product_specifications` + free-form), Requirements Description
**Zone 2 (collapsed by default, expand button):** Load Type (multi-select chips, 12 options), Environment (multi-select, 15 options + conditional sub-fields), Temperature Range, Cure Constraints (3 sub-fields: method, fixture time, heat availability), Gap Fill (radio context selector), Surface Prep (multi-select, 12 options), Application Method, Industry, Additional Context
**Mobile:** Zone 2 always expanded (no collapse)

## Key Components
- `SubstrateCombobox` — dropdown with 96 substrates across 5 categories (Metals, Plastics, Elastomers, Composites, Other), category headers non-selectable, recent selections pinned, fuzzy search, "Other (specify)" triggers free-form
- `MultiSelectChips` — shared component for Load Type, Environment, Surface Prep
- `ConditionalSubField` — renders below parent when trigger option selected (e.g., "Chemical exposure" → "Chemical Type" multi-select)
- `SpecResults` — ranked recommendation cards with confidence indicator, product names, rationale
- `ProductMatchSection` — below AI results, queries `product_specifications` for DB-verified matches
- `ConfidenceIndicator` — 0-100 score, color-coded (red <50, yellow 50-75, green >75), animated ring

## API Contract
```
POST /api/spec
Body: { substrate_a, substrate_b, load_types[], environment[], temperature_range, cure_constraints{}, gap_fill, surface_prep[], application_method, industry, additional_context }
Response: { id, recommended_spec{ title, chemistry, example_products[], rationale }, alternatives[], confidence, application_guidance, matching_products[] }
Auth: Required (gate drops on submit, not page load)
Rate limit: Per tier (Free: 3/mo, Pro: 30/mo, Quality: 100/mo, Enterprise: unlimited)
```

## Critical Validations
- At least one substrate required (A or B)
- "Not Sure" in multi-selects is mutually exclusive with other options
- Product Name autocomplete searches `product_specifications` table + allows free-form
- Free tier: form fillable without auth, gate drops on "Analyze" click (F19), localStorage preserves form data through auth flow
- Results must include `example_products[]` with real product names (Part VII spec)

## AI Engine
- Model: Claude Sonnet (primary analysis), Haiku (extraction/parsing)
- System prompt: `api/prompts/spec_engine.py` — includes knowledge context injection when available
- Output: Structured JSON parsed by Pydantic schema
- Knowledge injection: If `knowledge_patterns` table has relevant substrate pair/industry data, inject empirical context into prompt
