# Gravix Codebase Gap Analysis

**Audit date:** 2026-02-19  
**Branch baseline:** `main`  
**Spec baseline:** `specs/L0-index.md` + all `specs/L1/*.md`

---

## Executive Summary

Current implementation is strong on core flows (Spec Engine, Failure Analysis, Feedback/Knowledge), but several **contract and information-architecture gaps** remain between code and L1 specs.

- **Complete:** 3
- **Partial:** 6
- **Not started:** 0

Most gaps are not missing products from scratch — they are **route/API contract mismatches** and **admin/ops surface incompleteness**.

---

## Feature-by-Feature Status

## 1) Spec Engine — **Complete**
**L1:** `specs/L1/spec-engine.md`

### Implemented
- `/tool` route + split layout
- Zone 1/Zone 2 form structure
- Combobox substrate inputs
- Multi-select chips + conditional sub-fields
- Product search integration
- AI output + matching products rendering

### Gaps
- Product matching is embedded in `/specify` backend flow, not exposed as dedicated `/api/products/match` contract endpoint.

**Effort:** Small

---

## 2) Failure Analysis — **Complete**
**L1:** `specs/L1/failure-analysis.md`

### Implemented
- `/failure` route with staged inputs
- Photo upload endpoint + visual analysis rendering
- TDS-aware analysis
- Guided mode session flow
- Root-cause ranking and recommendations

### Gaps
- API naming diverges from L1 contract naming (`/analyze`, `/v1/guided` vs strict `/api/analyze/*` style in docs).

**Effort:** Small

---

## 3) Auth & Gating — **Partial**
**L1:** `specs/L1/auth-and-gating.md`

### Implemented
- Modal auth gating (not page redirect) on core tools
- localStorage persistence + auto-submit after auth
- Stripe checkout/portal/webhook
- Plan gates and upgrade prompts
- Admin role checks on admin routes

### Missing / Gaps
- L1 auth API contracts (`/api/auth/signup`, `/api/auth/signin`, `/api/auth/magic-link`) are not implemented as FastAPI routes (auth is directly via Supabase client).
- Seat-management and billing contract surface is only partially represented in explicit backend API.
- Holdout auth flows still rely on brittle selector assumptions (`#email`, `#signup-email`) — auth form automation reliability gap.

**Effort:** Medium

---

## 4) Feedback & Knowledge — **Complete**
**L1:** `specs/L1/feedback-and-knowledge.md`

### Implemented
- Feedback CRUD + pending queue
- Aggregation cron (`knowledge_patterns`, `daily_metrics`)
- Knowledge injection into AI engine
- Public stats endpoint using aggregated metrics with fallback

### Gaps
- Full confidence-calibration analytics UI surface (as described in L1) is limited/implicit.

**Effort:** Medium

---

## 5) Quality Module — **Partial**
**L1:** `specs/L1/quality-module.md`

### Implemented
- Investigation list/new/detail
- Actions, comments, attachments, signatures
- PDF report generation backend endpoint
- Share token generation + read-only view

### Missing / Gaps
- Missing frontend route: `/investigations/[id]/report`
- Share route shape differs from L1 (`/investigations/share/[token]` vs `/investigations/[id]/share/[token]`)
- API contract pathing differs for comments/signatures/email-in expectations in L1

**Effort:** Large

---

## 6) Observability — **Partial**
**L1:** `specs/L1/observability.md`

### Implemented
- Request logging middleware (`api_request_logs`)
- AI engine telemetry logs (`ai_engine_logs`)
- Daily metric aggregation
- Admin request-log and engine-health endpoints

### Missing / Gaps
- L1 `GET /api/admin/metrics/*` endpoint set not implemented exactly as specified
- No Sentry/Fabric external observability integration in source
- No dedicated frontend pages for all observability domains (ai-engine/engagement/knowledge/system)

**Effort:** Medium

---

## 7) Admin Dashboard — **Partial**
**L1:** `specs/L1/admin-dashboard.md`

### Implemented
- Admin overview KPIs
- Users page
- Activity page
- Logs page

### Missing / Gaps
- L1 IA mismatch: missing explicit frontend routes for `/admin/overview`, `/admin/ai-engine`, `/admin/engagement`, `/admin/knowledge`, `/admin/system`
- Current admin APIs are partially consolidated vs the specified per-domain contracts

**Effort:** Medium

---

## 8) Product Catalog — **Partial**
**L1:** `specs/L1/product-catalog.md`

### Implemented
- `/products` and `/products/[manufacturer]/[slug]` frontend routes
- Product TDS extraction + CRUD backend
- Product search consumed by tool forms

### Missing / Gaps
- Catalog API is auth-gated in backend (L1 calls for public list/detail)
- Missing dedicated `/api/products/match`
- Missing dedicated `/api/products/autocomplete`

**Effort:** Medium

---

## 9) Landing Page — **Partial**
**L1:** `specs/L1/landing-page.md`

### Implemented
- Multi-section landing page structure
- Social proof stats fetched from API
- Pricing page and CTAs

### Missing / Gaps
- Pricing values are hardcoded in frontend constants (L1 requires Stripe-driven live pricing display)
- API naming differs (`/v1/stats/public` vs L1 naming expectation)

**Effort:** Small

---

## Prioritized Fix Queue

## BLOCKER
1. **Pipeline-validatable auth automation stability for holdouts (Auth & Gating)** — ensure stable auth selectors/flows for baseline checks and future convergence loops. *(Medium)*

## CRITICAL
2. **Quality Module route/API contract alignment** (`/investigations/[id]/report`, share path harmonization, nested contract alignment). *(Large)*
3. **Admin Dashboard IA completion** (add ai-engine/engagement/knowledge/system pages + endpoint split). *(Medium)*
4. **Observability contract completion** (`/api/admin/metrics/*` parity and missing monitoring integrations). *(Medium)*
5. **Product Catalog API parity** (public list/detail + match + autocomplete endpoints). *(Medium)*

## IMPORTANT
6. **Auth/Billing contract normalization** (optional API façade for documented `/api/auth/*` contracts; seat-management API polish). *(Medium)*
7. **Landing/Pricing source-of-truth pricing** (remove hardcoded values, pull from Stripe-configured source). *(Small)*
8. **Spec/Failure contract naming harmonization** for L1 parity docs vs routes. *(Small)*

## NICE-TO-HAVE
9. **Knowledge analytics UI expansion** for calibration trend visualization and richer operator insight. *(Medium)*

---

## Recommended Implementation Order

1. **Auth holdout stability hardening** (enables reliable Phase 4+ convergence loops)
2. **Quality Module contract + route parity** (largest business-critical surface gap)
3. **Admin + Observability IA and endpoint parity** (operational control plane)
4. **Product Catalog API parity** (public catalog + matching contracts)
5. **Landing/Pricing data source cleanup** (marketing correctness)
6. **Contract naming harmonization + polish**

---

## Notes

- This audit is contract-level (L1 vs implemented code paths/routes/components), not subjective UX scoring.
- Low holdout scores on preview are expected where auth/test-data are constrained; this report focuses on code/spec parity gaps.
