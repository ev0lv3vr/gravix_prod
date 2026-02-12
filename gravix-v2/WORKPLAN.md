# Gravix — Agentic Build Plan

This file tracks the “big remaining work” and the order we’re executing it using the PLAN → CODE (Sonnet) → GATES → REVIEW → MERGE loop.

## Epics (Big Remaining Work)

### E1 — Backend wiring (replace mocks)
- Dashboard: usage + recent analyses + pending feedback
- History: real list + filters + PDF download
- Settings: profile save + plan/usage

### E2 — Tool flows (end-to-end)
- /tool (Spec Engine): submit → results → save to history → export PDF
- /failure (Failure Analysis): submit → results → save to history → export PDF

### E3 — Detail pages
- /history/spec/[id]
- /history/failure/[id]
- /cases list + /cases/[slug]

### E4 — Billing & plan enforcement
- Stripe checkout + portal
- Enforce limits in UI (free vs pro/team) + upgrade prompts

### E5 — Auth edge cases
- Password reset (if we’re keeping password auth)
- Better error states + verification messaging

## Current Milestone

### M1 — History + Dashboard wiring + detail pages (E1 + E3)
- Branch/worktree: `feat/history-wiring` → `/tmp/gravix-history-wiring`
- Owner: Sonnet coder + Sonnet reviewer + Opus orchestrator

## Sprint 1 (V2) — Backend schema + observability

Status: complete.

- [x] Migrations 001–004 added (structured fields, feedback/knowledge, observability, seed placeholder)
- [x] Structured analysis fields persisted (normalized substrates, root_cause_category)
- [x] Request logging middleware writes to `api_request_logs` (best-effort; skips /health and /v1/stats/public)
- [x] Public stats endpoint: `GET /v1/stats/public`

## Sprint 2 (V2) — Feedback System

Status: complete.

- [x] Feedback API (submit/get/pending)
- [x] FeedbackPrompt component (two-stage widget)
- [x] PendingFeedbackBanner on dashboard
- [x] Follow-up email service (Resend, 6-8 day nudges)
- [x] Cron router (send-followups + placeholders)

## Sprint 3 (V2) — Detail Pages + Feedback Integration

Status: complete.

- [x] Failure detail page enhanced (rank badges, contributing factors, prevention plan, similar cases, color-coded recs)
- [x] Spec detail page enhanced (2-col properties, surface prep cards, collapsible alternatives)
- [x] FeedbackPrompt wired into both tool results
- [x] Industry + production_impact sent from failure form
- [x] Error state UX (red banner + retry)

## Sprint 4 (V2) — Billing + Auth + Settings

Status: complete.

- [x] Settings: profile load/save, real plan + usage, Stripe portal, JSON export
- [x] History: free user banner + blur
- [x] Dashboard: checkout success/cancel banners
- [x] UpgradeModal: direct Stripe checkout
- [x] AuthModal: password reset view, resend timer, password strength

## Sprint 5 (V2) — Admin Dashboard

Status: complete.

- [x] Admin backend (overview, users, activity, request-logs, user management)
- [x] Admin frontend (4 pages + layout guard + sidebar)
- [x] Header: admin link for admin users

## Remaining Sprints (See GAP_PLAN.md)

- Sprint 6: Knowledge Engine (aggregation, injection, similar cases, calibration, metrics)
- Sprint 7: PDF Export + Data Wiring (export buttons, expert review, live stats, pagination, case filters)
- Sprint 8: Auth & Account (delete account, PATCH verify, OAuth prod, password reset e2e)
- Sprint 9: Frontend Polish (TypeScript cleanup, zod validation, React Query, flywheel SVG, mockups)
- Sprint 10: Production Hardening (Sentry, rate limiting, caching, SEO, migration verification)

## Notes / gotchas
- ApiClient already exists: `frontend/src/lib/api.ts`
- Backend endpoints exist:
  - `GET /specify`, `GET /specify/{id}`
  - `GET /analyze`, `GET /analyze/{id}`
  - `GET /reports/spec/{id}/pdf`, `GET /reports/analysis/{id}/pdf`
  - `GET /users/me`, `GET /users/me/usage`
