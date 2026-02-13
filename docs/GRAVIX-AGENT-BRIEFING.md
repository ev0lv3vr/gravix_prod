# Gravix Dev Agent — Full Briefing Document

**Created:** 2026-02-12 by the main OpenClaw agent  
**Purpose:** Complete knowledge transfer so a dedicated Gravix agent can boot with full context.

---

## What is Gravix?

**gravix.com** — AI-powered industrial adhesive specification + failure analysis SaaS.

The pitch: Engineers waste weeks debugging adhesive failures or specifying the wrong adhesive. Gravix lets them describe their substrates, environment, and problem → get a vendor-neutral specification or ranked root-cause diagnosis in 60 seconds.

**The killer differentiator:** A self-learning Knowledge Engine that accumulates empirical data from confirmed production outcomes. Every confirmed fix makes the next diagnosis more accurate. This is NOT generic ChatGPT — it's a domain-specific AI that gets smarter over time.

**Target users:** Manufacturing engineers, production leads, materials scientists, quality teams.  
**Pricing:** Free (5 analyses) → Pro $79/mo → Team $199/mo  

---

## Stack

| Layer | Tech | Location |
|-------|------|----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind, shadcn/ui | `frontend/` |
| Backend | Python 3.14, FastAPI, Pydantic | `api/` |
| Database | Supabase (PostgreSQL + Auth + Storage) | Project: `jvyohfodhaeqchjzcopf` |
| AI | Anthropic Claude (claude-sonnet-4) | Via `anthropic` Python SDK |
| Payments | Stripe (Checkout + Portal + Webhooks) | Live keys in `api/.env` |
| Email | Resend API | For feedback follow-ups |
| Frontend Hosting | Vercel (auto-deploy from `main`) | Project: `gravix-prod` |
| Backend Hosting | Render (Docker) | Service: `srv-d65o7l9r0fns73biao5g` |
| Domain | gravix.com | DNS via Vercel + Render |

### Key URLs
- **Production frontend:** https://gravix.com
- **Production backend:** https://gravix-prod.onrender.com
- **Supabase dashboard:** https://supabase.com/dashboard/project/jvyohfodhaeqchjzcopf
- **Vercel dashboard:** gravix-prod in evguenis-projects-81321ce2 team
- **Render dashboard:** srv-d65o7l9r0fns73biao5g

---

## Workspace Structure

```
/Users/evolve/.openclaw/workspace/
├── api/                          # FastAPI backend
│   ├── config.py                 # Pydantic Settings (all env vars)
│   ├── main.py                   # App entry, CORS, routers
│   ├── database.py               # Supabase client init
│   ├── dependencies.py           # Auth dependency (JWT verify)
│   ├── .env                      # ALL secrets (Supabase, Stripe, Anthropic, Resend, Cron)
│   ├── Dockerfile                # Production Docker build
│   ├── requirements.txt          # Python deps
│   ├── routers/
│   │   ├── analyze.py            # POST /analyze (failure analysis)
│   │   ├── specify.py            # POST /specify (spec engine)
│   │   ├── admin.py              # GET /admin/* (dashboard, users, activity, logs)
│   │   ├── billing.py            # POST /billing/* (Stripe checkout, webhook)
│   │   ├── cases.py              # GET /cases (case library)
│   │   ├── cron.py               # POST /cron/* (aggregate-knowledge, aggregate-metrics, send-followups)
│   │   ├── feedback.py           # POST/GET /feedback
│   │   ├── health.py             # GET /health
│   │   ├── reports.py            # GET /reports/*/pdf
│   │   ├── stats.py              # GET /v1/stats/public
│   │   └── users.py              # GET/PATCH/DELETE /users/me
│   ├── services/
│   │   ├── ai_engine.py          # Claude prompt construction + knowledge injection
│   │   ├── knowledge_aggregator.py  # Cron: aggregate feedback → knowledge_patterns
│   │   ├── knowledge_service.py  # Similar cases + confidence calibration
│   │   ├── pdf_generator.py      # WeasyPrint PDF export
│   │   ├── stripe_service.py     # Stripe integration
│   │   ├── feedback_email.py     # Resend follow-up emails
│   │   ├── usage_service.py      # Plan limits enforcement
│   │   └── account_deletion_service.py
│   ├── prompts/
│   │   ├── failure_analysis.py   # System prompt for failure diagnosis
│   │   └── spec_engine.py        # System prompt for adhesive specification
│   ├── schemas/                  # Pydantic request/response models
│   ├── middleware/
│   │   ├── rate_limiter.py       # IP-based rate limiting
│   │   └── request_logger.py     # API request logging to Supabase
│   ├── utils/
│   │   ├── classifier.py         # Substrate/adhesive classification
│   │   └── normalizer.py         # Input normalization
│   └── tests/                    # pytest suite (244 tests all green as of 2/12)
│       ├── unit/
│       ├── integration/
│       └── security/
├── frontend/                     # Next.js frontend
│   ├── src/
│   │   ├── app/                  # App Router pages
│   │   │   ├── page.tsx          # Landing page (8 components)
│   │   │   ├── (app)/            # Authenticated pages
│   │   │   │   ├── tool/         # Spec Engine
│   │   │   │   ├── failure/      # Failure Analysis
│   │   │   │   ├── dashboard/    # User dashboard
│   │   │   │   ├── history/      # Analysis history + detail pages
│   │   │   │   ├── cases/        # Case library
│   │   │   │   ├── settings/     # Account settings
│   │   │   │   ├── admin/        # Admin dashboard (4 pages)
│   │   │   │   └── feedback/     # Feedback submission
│   │   │   ├── (marketing)/      # Public pages (pricing, about, contact, privacy, terms)
│   │   │   └── auth/             # Auth callback + password reset
│   │   ├── components/           # React components
│   │   ├── contexts/             # AuthContext, QueryProvider
│   │   ├── hooks/                # useQueries, useUsageTracking
│   │   └── lib/                  # api.ts, types.ts, supabase.ts, schemas.ts
│   ├── .env.local                # NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_APP_URL
│   └── next.config.js
├── database/
│   └── migrations/               # SQL migrations 001-006 + ALL_MIGRATIONS.sql
├── scripts/
│   └── check.sh                  # Gate script: tsc, lint, build, pattern checks, secret scan
└── docs/
    ├── SPEC.md                   # Source of truth — every page, every component
    ├── GAP_PLAN.md               # Sprint 6-10 detailed task breakdown
    ├── WORKPLAN.md               # Epic overview + sprint status
    ├── PIPELINE.md               # Development pipeline (PLAN→CODE→GATES→REVIEW→DEPLOY)
    └── CODE_REVIEW.md            # Code review standards
```

---

## Environment Variables

### Backend (`api/.env`)
```
ENVIRONMENT=production
SUPABASE_URL=https://jvyohfodhaeqchjzcopf.supabase.co
SUPABASE_ANON_KEY=<key>
SUPABASE_SERVICE_KEY=<key>
SUPABASE_JWT_SECRET=<key>
ANTHROPIC_API_KEY=<key>
STRIPE_SECRET_KEY=<key>
STRIPE_WEBHOOK_SECRET=<key>
STRIPE_PRICE_ID_PRO=<price_id>
STRIPE_PRICE_ID_TEAM=<price_id>
RESEND_API_KEY=<key>
CRON_SECRET=7tAvLEsrI5uGNSFa0WgauloQkICM-_uRDXD5HaE6Cbw
ALLOWED_ORIGINS=https://gravix.com,https://www.gravix.com
```

### Frontend (Vercel env vars)
```
NEXT_PUBLIC_SUPABASE_URL=https://jvyohfodhaeqchjzcopf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<key>
NEXT_PUBLIC_APP_URL=https://gravix.com
NEXT_PUBLIC_API_URL=https://gravix-prod.onrender.com
```

---

## Database Schema (key tables)

| Table | Purpose |
|-------|---------|
| `spec_analyses` | Spec Engine results (substrates, env, AI response) |
| `failure_analyses` | Failure Analysis results (description, root causes, recommendations) |
| `analysis_feedback` | User feedback on analyses (outcome, fix_description, effectiveness) |
| `knowledge_patterns` | Aggregated empirical data (substrate pair → success rates) |
| `daily_metrics` | Aggregated daily stats for Social Proof Bar |
| `case_library` | Curated public case studies |
| `api_request_logs` | Request logging for admin dashboard |
| `profiles` | User profiles (extends Supabase auth) |

**Migrations:** 001-006 in `database/migrations/`. All have been run on production Supabase.

---

## Sprint History (ALL COMPLETE ✅)

| Sprint | What | Key Commit |
|--------|------|-----------|
| 1 | Schema + observability (migrations 001-004, request logging, public stats) | — |
| 2 | Feedback system (submit/get/pending, email follow-ups, cron) | — |
| 3 | Detail pages + feedback integration (failure/spec detail, FeedbackPrompt) | — |
| 4 | Billing + Auth + Settings (Stripe checkout/portal, password reset UI, profile) | — |
| 5 | Admin dashboard (overview, users, activity, request logs, management) | `6c8e268` |
| 6 | Knowledge Engine (aggregation, injection, similar cases, confidence calibration) | `9c0e48a` |
| 7 | PDF export, expert review mailto, live stats, pagination, case filters | `44f0cfe` |
| 8 | Account deletion, auth callbacks, password reset end-to-end | `28c26a1` |
| 9 | Frontend polish — TypeScript cleanup, zod validation, React Query, flywheel SVG | `8c2e206` |
| 10 | Production hardening — rate limiting, caching, SEO, error boundaries | `687fd98` |

---

## Knowledge Engine (the core differentiator — understand this)

### How it works:
1. User runs a failure analysis → AI gives root causes + recommendations
2. User submits feedback: "I tried fix X, it worked/didn't"
3. **Cron: aggregate-knowledge** — reads feedback, groups by substrate pair + root cause + adhesive family, computes success rates, writes to `knowledge_patterns`
4. **Next analysis for same substrate pair** — `knowledge_service.py` queries matching patterns, injects empirical data into the AI prompt
5. AI now says: "Based on 12 confirmed cases with Aluminum → ABS: surface contamination was root cause 73% of the time"
6. **Confidence calibration:** `calibrated = ai_score * 0.7 + empirical_match * 0.3` when evidence_count >= 3
7. **ConfidenceBadge** shows "Empirically Validated (N)" vs "AI Estimated"

### Cron endpoints (authenticated with CRON_SECRET):
- `POST /cron/aggregate-knowledge` — daily, aggregates feedback into patterns
- `POST /cron/aggregate-metrics` — daily, updates daily_metrics for stats bar
- `POST /cron/send-followups` — daily, sends feedback nudge emails (6-8 days after analysis)

These are triggered by Render cron jobs (configured in Render dashboard).

---

## Deployment

### Frontend (Vercel)
- Auto-deploys from `main` branch
- Root directory: `frontend/`
- Build command: `next build`
- Framework: Next.js

### Backend (Render)
- Docker deployment from `main` branch
- Root directory: `api/`
- Dockerfile in `api/Dockerfile`
- Health check: `GET /health`
- Service ID: `srv-d65o7l9r0fns73biao5g`

### Deploy process:
1. Push to `main`
2. Vercel auto-deploys frontend (~2 min)
3. Render auto-deploys backend (~5 min, Docker build)
4. Verify: `curl https://gravix-prod.onrender.com/health`

---

## Development Pipeline

**Option B — Simulated Swarm** (what we use):
1. **PLAN** (Opus) — Design the sprint, break into tasks
2. **CODE** (Sonnet sub-agent) — Implement in feature branch
3. **GATES** (`scripts/check.sh`) — TypeScript check, lint, build, pattern checks, secret scan
4. **REVIEW** (Sonnet sub-agent) — Code review against standards
5. **DEPLOY** — Merge to main → auto-deploy

Gate script: `scripts/check.sh`  
Branch strategy: feature branches → merge to main  
Cost per task: ~$0.05-0.10 (Sonnet workers)

---

## Current State & What's Next

### V2 is COMPLETE — all 10 sprints shipped and deployed.

### Remaining operational items:
- Monitor Render cron jobs (aggregate-knowledge, aggregate-metrics, send-followups)
- Knowledge Engine is live but needs real user data to start accumulating patterns
- OG image for social sharing (not yet created)
- Google Search Console sitemap submission (needs manual access)
- 244 tests all green as of 2/12

### Potential future work:
- User onboarding flow improvements
- More adhesive families in the knowledge base
- API rate limiting tuning based on real traffic
- Mobile app or PWA
- Integration with materials databases (MatWeb, etc.)

---

## Key Gotchas & Lessons Learned

1. **`api.ts` fallback URL was `localhost:8000`** — broke ALL prod API calls. Always verify the fallback URL is production.
2. **Repo was flattened on 2/11** — V2 code moved from `gravix-v2/` to root. Old paths in docs may reference `gravix-v2/`.
3. **Supabase JWT verification** — uses ES256 via JWKS endpoint, not symmetric HS256. The `dependencies.py` handles this.
4. **CORS** — must include both `gravix.com` and `www.gravix.com` in allowed origins.
5. **Render cold starts** — free tier spins down after inactivity. First request after idle takes ~30s. Backend is on paid tier now but keep this in mind.
6. **Migration 006** — aligned `analysis_feedback` schema between code expectations and what was actually in Supabase. If schema issues arise, check this migration.
7. **Stripe webhook** — configured in Stripe dashboard pointing to `https://gravix-prod.onrender.com/billing/webhook`.
8. **Admin access** — `e.netchaev@gmail.com` has admin role in profiles table.

---

## Key Files to Read First

1. `docs/SPEC.md` — Every page, every component, exact copy. This is the bible.
2. `docs/GAP_PLAN.md` — Detailed sprint breakdown with test plans.
3. `api/config.py` — All configuration in one place.
4. `api/services/ai_engine.py` — The core AI logic + knowledge injection.
5. `api/services/knowledge_service.py` — Similar cases + confidence calibration.
6. `frontend/src/lib/api.ts` — All API calls from frontend.
7. `frontend/src/lib/types.ts` — TypeScript types for the whole app.

---

## Human (Your Boss)

- **Name:** Evgeny (Ev) Nechayev
- **Style:** Direct, fast-moving, gives instructions and expects execution. Doesn't like being asked unnecessary questions.
- **Preference:** Opus 4.6 for coding tasks
- **Timezone:** America/Los_Angeles (PST)
- **Telegram:** @Evolv3

---

## Communication with Main Agent

The main OpenClaw agent (me) handles Gluemasters, MoneySamurai, email, general tasks. If you need cross-project coordination, use `sessions_send` to message the main session, or Ev will relay.

---

*This document contains everything needed to maintain and extend Gravix. Read SPEC.md for the detailed component spec, GAP_PLAN.md for task breakdowns, and git log for ground truth on what's shipped.*
