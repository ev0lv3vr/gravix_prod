# NIGHTLY BUILD REPORT — 2026-02-10

Commit: `5c37037` (local only, not pushed)

## Context / Priorities Checked
- Read `memory/2026-02-10.md` (today). No `memory/2026-02-09.md` exists.
- No `KANBAN.md` exists in workspace.
- Top priority from earlier: **fix Gravix V2 auth bug** + **wire frontend to backend schemas**.

## What I Built

### 1) Reconstructed Gravix V2 backend source from .pyc (critical unblock)
Path: `gravix-v2/api/`
- Recreated full FastAPI codebase (config, database client, auth deps, schemas, routers, services, prompts)
- Added deployment scaffolding:
  - `api/requirements.txt`
  - `api/Dockerfile`
  - `api/render.yaml`

Key backend modules:
- `api/main.py` — FastAPI app, CORS, lifespan logs, global exception handler, router registration
- `api/config.py` — Pydantic settings w/ **plan limits aligned to SPEC**:
  - free: 5 analyses + 5 specs
  - pro/team/enterprise: treated as “unlimited” via large numeric caps
- `api/dependencies.py` — JWT verification using Supabase JWT secret (HS256, audience=authenticated)
- `api/routers/*` — analyze/specify/users/cases/reports/billing endpoints
- `api/services/ai_engine.py` — Claude API calls w/ retry + timeouts
- `api/services/usage_service.py` — monthly usage tracking/reset
- `api/services/stripe_service.py` — checkout/portal + webhook handling (plan updates)
- `api/services/pdf_generator.py` — PDF generation service
- `api/prompts/*` — domain prompts + user prompt builders

### 2) Fixed Auth Modal login (session persistence)
Problem: `/auth/callback` exchanged the OAuth/magic-link code server-side but didn’t persist session to browser cookies.

Fixes (frontend):
- `frontend/src/app/auth/callback/route.ts`
  - switched to `@supabase/ssr` `createServerClient` with cookie getAll/setAll
- `frontend/src/lib/supabase.ts`
  - switched to `createBrowserClient` from `@supabase/ssr`
- Added dependency: `@supabase/ssr`

### 3) Fixed frontend↔backend schema mismatches (stop 422s)
- `frontend/src/app/(app)/tool/page.tsx`
  - maps Spec form → backend `SpecRequestCreate` with nested objects:
    - `bond_requirements`, `environment`, `cure_constraints`
  - handles both camelCase + snake_case response fields defensively

- `frontend/src/app/(app)/failure/page.tsx`
  - maps Failure form → backend `FailureAnalysisCreate` field names
  - handles snake_case response mapping

### 4) Fixed pricing checkout payload
- `frontend/src/app/(marketing)/pricing/page.tsx`
  - uses `NEXT_PUBLIC_API_URL`
  - sends `{ price_id }` (backend expects price_id), not `{ tier }`

### 5) Filled missing required pages
- `frontend/src/app/(marketing)/privacy/page.tsx`
- `frontend/src/app/(marketing)/terms/page.tsx`
- `frontend/src/app/not-found.tsx`

### 6) Hygiene
- `gravix-v2/.gitignore`

## How to Test in the Morning (fast)

### Frontend auth
1. `cd gravix-v2/frontend`
2. `npm i`
3. `npm run dev`
4. Hit `http://localhost:3000` → open auth modal → sign in
5. Confirm redirect + session persists across refresh

### Backend (local)
1. `cd gravix-v2/api`
2. create a venv and `pip install -r requirements.txt`
3. set env vars (Supabase + JWT secret at minimum)
4. `uvicorn main:app --reload --port 8000`
5. from frontend set `NEXT_PUBLIC_API_URL=http://localhost:8000` and submit /tool + /failure forms

## Notes / Follow-ups
- Backend reconstruction is best-effort based on bytecode introspection; run `uvicorn` locally to verify imports and adjust any missing deps.
- Stripe requires `NEXT_PUBLIC_STRIPE_PRICE_ID_PRO` (frontend) + Stripe keys (backend) to fully test checkout.
