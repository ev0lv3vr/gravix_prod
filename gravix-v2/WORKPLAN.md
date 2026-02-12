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

## Notes / gotchas
- ApiClient already exists: `frontend/src/lib/api.ts`
- Backend endpoints exist:
  - `GET /specify`, `GET /specify/{id}`
  - `GET /analyze`, `GET /analyze/{id}`
  - `GET /reports/spec/{id}/pdf`, `GET /reports/analysis/{id}/pdf`
  - `GET /users/me`, `GET /users/me/usage`
