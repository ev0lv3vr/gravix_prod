# CLAUDE.md — Gravix Agent Instructions

## Project
Gravix.com — Industrial Adhesive Intelligence Platform.
Frontend: Next.js 14 (App Router) + Tailwind CSS + shadcn/ui.
Backend: FastAPI (Python 3.11+) + Pydantic.
Database: Supabase (PostgreSQL + Auth + RLS + Storage).
AI: Claude API (Sonnet for analysis, Haiku for extraction/eval).
Payments: Stripe. Email: Resend. Hosting: Vercel + Railway.

## Spec Location
All feature specs live in `specs/`. Read `specs/L0-index.md` first to find the right file.
- L0 = master index (~50 lines). Always read first.
- L1 = one-page summary per feature. Read for the feature you're implementing.
- L2 = full detail. Read for the specific component you're building.
- `specs/ui/design-tokens.md` = colors, typography, spacing, components.
- `specs/ui/page-by-page-spec.md` = complete frontend page layouts.
- `specs/schema/database-schema.md` = all tables, columns, RLS policies.
- `specs/schema/api-contracts.md` = all endpoints, request/response shapes.

## Rules
1. Read the L1 summary for your feature BEFORE writing any code.
2. Read the L2 detail for the specific component BEFORE implementing it.
3. Match the UI to `specs/ui/design-tokens.md` exactly — colors, spacing, typography.
4. Run `npm test` and `pytest` before pushing.
5. Run `npm run lint && npm run typecheck` — both must pass.
6. Never modify existing database columns — only ADD new ones.
7. All new columns must be NULLABLE or have DEFAULT values.
8. Deploy database migrations first, then backend, then frontend.
9. Commit with conventional commit messages: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`.
10. After pushing, wait for CI + holdout results before considering task done.

## Testing Against Digital Twins
When running locally, use these environment overrides:
```
ANTHROPIC_API_URL=http://localhost:3100
NEXT_PUBLIC_SUPABASE_URL=http://localhost:3200
STRIPE_API_URL=http://localhost:3300
```
Start twins with: `docker-compose -f docker-compose.twins.yml up`

## Convergence Criteria
A task is DONE when:
- All in-repo tests pass (`pytest` + `npm test`)
- Lint and typecheck pass (`npm run lint && npm run typecheck`)
- All critical holdout scenarios score >= 85 satisfaction
- The spec reviewer agent confirms spec compliance

## File Ownership
- `frontend/src/` — Next.js app (TypeScript, Tailwind)
- `api/` — FastAPI backend (Python)
- `api/routers/` — API endpoint handlers
- `api/services/` — Business logic services
- `api/prompts/` — AI system prompts
- `api/utils/` — Normalizer, classifier, helpers
- `api/middleware/` — Request logging, auth
- `database/migrations/` — SQL migration files
- `specs/` — Read-only spec documents (never modify)
- `tests/` — Test files

## Key Architecture Decisions
- Auth gate is a MODAL OVERLAY on form submit, not a page redirect. Form data persists in localStorage.
- Free tier users can fill forms without auth. Gate drops on "Analyze" click.
- AI responses are structured JSON parsed by Pydantic schemas. Always validate.
- Knowledge injection is additive — if no patterns exist, the prompt works without them.
- All admin endpoints require the `require_admin` FastAPI dependency.
- All observability tables (ai_engine_logs, api_request_logs, daily_metrics) have RLS: admins only.
- Product matching must never block the primary AI result — if matching fails, show results without products.

## Design System Quick Reference
- Background: `#0A1628`
- Surface: `#111B2E`
- Accent: `#3B82F6` (blue-500)
- Text primary: `#FFFFFF`
- Text secondary: `#94A3B8` (slate-400)
- Text tertiary: `#64748B` (slate-500)
- Font: Inter (body), JetBrains Mono (code/data)
- Border radius: `rounded-lg` (8px) for cards, `rounded-md` (6px) for inputs
- Dark mode only — no light mode toggle

## Dark Factory Operations

### Convergence Pipeline
- PR push → converge.yml → Vercel preview deploy → dispatch to gravix-holdouts → holdout-check.yml runs Playwright + Haiku scoring → results posted as PR comment
- Vercel Authentication is DISABLED for preview deployments (required for Playwright access)
- Preview URL is fetched from GitHub Deployments API (not constructed from branch name)
- Holdout dispatch uses repository_dispatch with event type `run-scenarios`
- Dispatch payload must include: `preview_url`, `sha`, `callback_repo`, `pr_number`
- Results are posted back as a PR comment (not a check run — check runs require a GitHub App)

### Timeouts
- holdout-check.yml job: 20 minutes
- converge.yml wait step: 25 minutes
- converge.yml wait step uses `fail-on-no-checks: false`

### Required Secrets
- Main repo: `HOLDOUT_PAT` (classic PAT with `repo` scope — dispatches to private holdouts repo)
- gravix-holdouts: `ANTHROPIC_API_KEY` (for Haiku scoring), `CALLBACK_PAT` (same PAT — posts PR comments back)

### Holdout Scoring
- 8 critical scenarios, scored 0-100 by Claude Haiku 4.5 vision
- Passing threshold: >= 85 per scenario
- Baseline scores will be low on preview deployments without real Supabase auth — this is expected
- The factory validates by relative scoring: broken code scores significantly lower than correct code
