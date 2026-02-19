# Gravix API Contracts — Complete Reference

> All REST endpoints, request/response shapes, and auth requirements.
> Combined from gravix-final-prd.md Parts II, III, VII, IX.

**Base URL:** `/api` (FastAPI backend)  
**Auth:** Supabase JWT in `Authorization: Bearer <token>` header  
**Content-Type:** `application/json`

---

## PUBLIC ENDPOINTS (No Auth Required)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/health` | Health check |
| GET | `/api/admin/stats` | Public aggregate stats (cached 5min) for landing page |
| GET | `/api/products` | Public product catalog (paginated, filterable) |
| GET | `/api/products/{manufacturer}/{slug}` | Public product detail page |
| GET | `/api/cases` | Public case library (paginated, filterable) |
| GET | `/api/cases/{slug}` | Public single case study |

## AUTHENTICATED ENDPOINTS (Any Tier)

| Method | Path | Purpose | Tier |
|--------|------|---------|------|
| POST | `/api/auth/signup` | Create account (magic link) | — |
| POST | `/api/auth/verify` | Verify magic link token | — |
| GET | `/api/auth/user` | Current user profile + plan | Any |
| GET | `/api/usage` | Usage counts + limits for current period | Any |
| POST | `/api/spec` | Submit spec engine analysis | Any (rate limited) |
| POST | `/api/failure-analysis` | Submit failure analysis | Any (rate limited) |
| GET | `/api/history` | User's analysis history | Any |

## PRO+ ENDPOINTS

| Method | Path | Purpose | Tier |
|--------|------|---------|------|
| POST | `/api/feedback` | Submit analysis feedback | Pro+ |
| GET | `/api/feedback/{analysis_id}` | Get existing feedback | Pro+ |
| GET | `/api/patterns/{type}/{key}` | Knowledge pattern data | Pro+ |

## QUALITY+ ENDPOINTS

| Method | Path | Purpose | Tier |
|--------|------|---------|------|
| POST | `/api/investigations` | Create investigation | Quality+ |
| GET | `/api/investigations` | List investigations (filterable) | Quality+ |
| GET | `/api/investigations/{id}` | Investigation detail | Quality+ |
| PATCH | `/api/investigations/{id}` | Update discipline data | Quality+ |
| POST | `/api/investigations/{id}/actions` | Add action item | Quality+ |
| PATCH | `/api/investigations/{id}/actions/{action_id}` | Update action | Quality+ |
| POST | `/api/investigations/{id}/comments` | Add comment | Quality+ |
| POST | `/api/investigations/{id}/attachments` | Upload photo | Quality+ |
| POST | `/api/investigations/{id}/signatures` | Sign discipline | Quality+ |
| GET | `/api/investigations/{id}/report` | Generate PDF report | Quality+ |
| POST | `/api/investigations/{id}/share` | Create share token | Quality+ |
| POST | `/api/investigations/email-in` | Create from email | Quality+ |
| POST | `/api/failure-analysis/guided` | Guided investigation turn | Quality+ |
| GET | `/api/products/match` | Product matching query | Quality+ |
| GET | `/api/products/autocomplete` | Product name autocomplete | Quality+ |

## ENTERPRISE ENDPOINTS

| Method | Path | Purpose | Tier |
|--------|------|---------|------|
| GET | `/api/alerts` | Pattern alerts list | Enterprise |
| PATCH | `/api/alerts/{id}` | Acknowledge/resolve alert | Enterprise |
| GET | `/api/settings/seats` | Seat management | Quality+ |
| POST | `/api/settings/seats/invite` | Invite team member | Quality+ |

## ADMIN ENDPOINTS (Admin Role Required)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/admin/metrics/overview` | Volume + conversion summary |
| GET | `/api/admin/metrics/ai-engine` | AI performance metrics |
| GET | `/api/admin/metrics/engagement` | User engagement metrics |
| GET | `/api/admin/metrics/knowledge` | Knowledge moat metrics |
| GET | `/api/admin/metrics/system` | System health metrics |
| GET | `/api/admin/users` | User management table |

## WEBHOOK ENDPOINTS

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/webhooks/stripe` | Stripe subscription events |
| POST | `/api/webhooks/email-in` | Inbound email → investigation |

## CRON ENDPOINTS (Internal, Auth by Secret Key)

| Method | Path | Frequency | Purpose |
|--------|------|-----------|---------|
| POST | `/api/cron/daily-metrics` | Daily 00:05 UTC | Aggregate daily_metrics |
| POST | `/api/cron/knowledge-aggregate` | Daily 01:00 UTC | Recompute knowledge_patterns |
| POST | `/api/cron/pattern-detection` | Daily 02:00 UTC | Check pattern clusters |
| POST | `/api/cron/feedback-followup` | Daily 09:00 UTC | Send 48h follow-up emails |

---

## KEY REQUEST/RESPONSE SHAPES

### POST /api/spec — Request
```json
{
  "substrate_a": "string (required)",
  "substrate_b": "string (optional)",
  "load_types": ["shear", "peel"],
  "environment": ["high_humidity", "chemical_exposure"],
  "environment_details": { "chemical_types": ["acids", "solvents"] },
  "temperature_range": { "min": -40, "max": 150, "unit": "C" },
  "cure_constraints": {
    "methods": ["heat_cure", "room_temp"],
    "fixture_time": "5_30_min",
    "max_cure_temp": 120
  },
  "gap_fill": "normal_0.1_1mm",
  "surface_prep": ["degrease_solvent", "abrasion_mechanical"],
  "application_method": "automated_dispensing",
  "industry": "automotive",
  "additional_context": "string (optional)"
}
```

### POST /api/spec — Response
```json
{
  "id": "uuid",
  "recommended_spec": {
    "title": "Two-Part Structural Epoxy",
    "chemistry": "Modified Bisphenol-A Epoxy with Amine Hardener",
    "example_products": ["Loctite EA 9395", "3M Scotch-Weld DP460"],
    "rationale": "string"
  },
  "alternatives": [{ "title": "...", "chemistry": "...", "example_products": [], "rationale": "..." }],
  "confidence": 87,
  "application_guidance": "string",
  "matching_products": [
    {
      "product_name": "Loctite EA 9395",
      "manufacturer": "Henkel",
      "match_score": 92,
      "key_specs": { "operating_temp": "-55 to 177°C", "lap_shear": "35 MPa" }
    }
  ],
  "knowledge_context": {
    "used": true,
    "patterns_count": 12,
    "confidence_note": "Based on 47 confirmed cases in the Gravix database"
  }
}
```

### POST /api/failure-analysis — Response
```json
{
  "id": "uuid",
  "root_causes": [
    {
      "cause": "Insufficient surface preparation on aluminum substrate",
      "confidence": 89,
      "category": "surface_preparation",
      "corrective_actions": ["Abrade with 180-grit...", "Verify water break..."],
      "8d_discipline": "D4"
    }
  ],
  "visual_analysis": {
    "failure_mode_classification": "adhesive_failure",
    "confidence": 82,
    "annotated_image_url": "string"
  },
  "tds_compliance": {
    "violations": ["Cure temperature below TDS minimum (120°C required, 80°C reported)"],
    "warnings": ["Operating near lower temperature limit"]
  }
}
```

### POST /api/feedback — Request
```json
{
  "analysis_id": "uuid",
  "was_helpful": true,
  "root_cause_confirmed": 1,
  "outcome": "resolved",
  "recommendation_implemented": ["abrasion", "primer"],
  "actual_root_cause": "string (optional)",
  "what_worked": "string (optional)",
  "what_didnt_work": "string (optional)",
  "time_to_resolution": "string (optional)",
  "estimated_cost_saved": 15000.00
}
```
