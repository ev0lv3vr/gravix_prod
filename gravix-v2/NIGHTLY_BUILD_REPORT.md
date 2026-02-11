# Nightly Build Report — 2026-02-10

## Summary
Reconstructed the entire backend from .pyc files, fixed the auth callback bug, aligned frontend↔backend schemas, and added missing pages.

---

## TASK 1: Backend Reconstruction ✅

### Files Created (28 .py files + 3 deployment files)

**Core:**
| File | Purpose |
|------|---------|
| `api/config.py` | Pydantic Settings — all env vars, plan_limits dict |
| `api/database.py` | Supabase client singleton (service_key) |
| `api/dependencies.py` | JWT auth — python-jose HS256, "authenticated" audience, auto-create user |
| `api/main.py` | FastAPI app with lifespan, CORS, global exception handler, 7 routers |

**Schemas (Pydantic v2):**
| File | Models |
|------|--------|
| `schemas/common.py` | ErrorResponse, PaginatedResponse, HealthResponse |
| `schemas/analyze.py` | RootCause, Recommendation, FailureAnalysisCreate/Response/ListItem |
| `schemas/specify.py` | BondRequirements, EnvironmentalConditions, CureConstraints, SpecRequestCreate/Response/ListItem |
| `schemas/user.py` | UserProfile, UserUpdate, UsageResponse |
| `schemas/billing.py` | CheckoutRequest/Response, PortalResponse |
| `schemas/case.py` | CaseListItem, CaseDetail |

**Routers:**
| Router | Endpoints |
|--------|-----------|
| `health.py` | GET /health, GET / |
| `analyze.py` | POST /analyze, GET /analyze, GET /analyze/{id} |
| `specify.py` | POST /specify, GET /specify, GET /specify/{id} |
| `users.py` | GET /users/me, PATCH /users/me, GET /users/me/usage |
| `cases.py` | GET /cases, GET /cases/{id} |
| `reports.py` | GET /reports/analysis/{id}/pdf, GET /reports/spec/{id}/pdf |
| `billing.py` | POST /billing/checkout, POST /billing/portal, POST /billing/webhook |

**Services:**
| Service | Function |
|---------|----------|
| `ai_engine.py` | httpx→Claude API (not SDK), retry logic, analyze_failure + generate_spec |
| `usage_service.py` | Monthly usage tracking, plan limits check, counter reset |
| `pdf_generator.py` | WeasyPrint HTML→PDF with fallback placeholder |
| `stripe_service.py` | Checkout sessions, portal, webhook handler (sub created/updated/deleted, invoice events) |

**Prompts:**
| File | Content |
|------|---------|
| `failure_analysis.py` | System prompt (expert failure analyst) + user prompt builder |
| `spec_engine.py` | System prompt (expert spec engineer) + user prompt builder |

**Deployment:**
- `requirements.txt` — fastapi, uvicorn, supabase, python-jose, httpx, stripe, weasyprint, pydantic-settings
- `Dockerfile` — Python 3.12-slim with WeasyPrint system deps
- `render.yaml` — Render deployment config

**Plan Limits (from SPEC):**
- Free: 5 analyses + 5 specs/month
- Pro: unlimited ($49/mo)
- Team: unlimited ($149/mo)
- Enterprise: unlimited (custom)

---

## TASK 2: Auth Callback Fix ✅

**Problem:** `auth/callback/route.ts` created a standalone `createClient()` — session exchange succeeded server-side but cookies never reached the browser.

**Fix:**
- Installed `@supabase/ssr` package
- `auth/callback/route.ts` now uses `createServerClient` from `@supabase/ssr` with proper cookie read/write via `cookies()` from `next/headers`
- `lib/supabase.ts` now uses `createBrowserClient` from `@supabase/ssr` instead of `createClient` from `@supabase/supabase-js`

This ensures:
1. OAuth code exchange sets session cookies on the response
2. Email verification sets session cookies on the response
3. Browser client automatically uses cookie-based session

---

## TASK 3: Schema Alignment ✅

### Spec Engine (tool/page.tsx)
- Frontend `SpecFormData` (flat fields) → mapped to backend `SpecRequestCreate` with nested `bond_requirements`, `environment`, `cure_constraints` objects
- Response mapping handles both snake_case (backend) and camelCase (frontend types) field names

### Failure Analysis (failure/page.tsx)
- Frontend `FailureFormData` → mapped to backend `FailureAnalysisCreate` (all snake_case)
- `adhesiveUsed` → `material_subcategory`
- `environment[]` → `chemical_exposure`
- `surfacePrep` → `surface_preparation`
- `additionalContext` → `additional_notes`
- Response: handles `root_causes`, `contributing_factors`, `recommendations` (both array-of-objects and object formats), `prevention_plan` (string → array split)

### Pricing Page
- Fixed: `NEXT_PUBLIC_BACKEND_URL` → `NEXT_PUBLIC_API_URL` (consistent with api.ts)
- Fixed: `{tier: 'pro'}` → `{price_id: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO}`
- Matches backend `CheckoutRequest` schema

---

## TASK 4: Additional Fixes ✅

| Item | Status |
|------|--------|
| `/privacy` page | ✅ Created with full privacy policy content |
| `/terms` page | ✅ Created with full terms of service content |
| `not-found.tsx` (404) | ✅ Created with dark theme, home/spec engine links |
| `.gitignore` | ✅ Created (node_modules, venv, .env, __pycache__, .next, .vercel) |
| Plan limits match SPEC | ✅ Free=5, Pro=unlimited/$49, Team=unlimited/$149 |

---

## Known Issues / Next Steps
1. **Supabase tables** need to exist: `users`, `failure_analyses`, `spec_requests`, `cases` — run migrations
2. **WeasyPrint** needs system dependencies on Render (handled in Dockerfile)
3. **Frontend types.ts** still has camelCase interfaces — the page-level mapping handles this, but types.ts could be updated to match backend
4. **`@supabase/ssr`** may need a middleware.ts for token refresh on server-side routes
5. **Stripe webhook** URL needs to be configured in Stripe dashboard pointing to `https://gravix-prod.onrender.com/billing/webhook`

---

## Commit
```
5c37037 nightly: reconstruct backend, fix auth, align schemas, add missing pages
```
42 files changed, 2177 insertions(+), 42 deletions(-)
