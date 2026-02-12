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

## Notes / gotchas
- ApiClient already exists: `frontend/src/lib/api.ts`
- Backend endpoints exist:
  - `GET /specify`, `GET /specify/{id}`
  - `GET /analyze`, `GET /analyze/{id}`
  - `GET /reports/spec/{id}/pdf`, `GET /reports/analysis/{id}/pdf`
  - `GET /users/me`, `GET /users/me/usage`
