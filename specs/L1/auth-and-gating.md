# Auth & Tier Gating (F13–F14, F19) — L1 Summary

> Full detail: `L2/auth-and-gating-full.md` | Source: gravix-final-prd.md Parts II, V

## What It Does
Authentication via Supabase (magic link email). Four-tier subscription model via Stripe. Auth gate on form submit (not page load). Usage tracking and enforcement. Upgrade prompts.

## Routes
- Auth modal (overlay, not a page) — triggered on "Analyze" click when unauthenticated
- `/pricing` — plan comparison and checkout
- `/settings` — subscription management, seat management (Quality+)

## Auth Flow (F19 — Critical)
1. User arrives at `/tool` or `/failure` — **no auth required to view or fill form**
2. User fills in all fields, clicks "Analyze"
3. If not authenticated: **auth modal overlays** (form stays visible behind, NOT a redirect)
4. User signs up / signs in via magic link
5. Modal closes, **form data preserved via localStorage**
6. Analysis runs automatically with preserved data
7. If already authenticated: analysis runs immediately

**Key rule:** Never lose form data. localStorage must persist through the entire auth flow.

## Tier System

| Tier | Price | Stripe Price ID | Analyses/mo | Investigations/mo | Seats |
|------|-------|----------------|-------------|-------------------|-------|
| Free | $0 | — | 3 | 0 | 1 |
| Pro | $79/mo | `price_pro_monthly` | 30 | 0 | 1 |
| Quality | $299/mo | `price_quality_monthly` | 100 | 20 | 3 |
| Enterprise | $799/mo | `price_enterprise_monthly` | Unlimited | Unlimited | 10 |

## Usage Tracking
- Nav bar shows usage badge: "3/5 analyses" (icon + count)
- When limit hit: modal with upgrade CTA, cannot submit new analysis
- Usage resets monthly (based on Stripe billing cycle)
- Endpoint: `GET /api/usage` → `{ analyses_used, analyses_limit, investigations_used, investigations_limit, period_end }`

## API Contracts
```
POST /api/auth/signup — { email } → magic link sent
POST /api/auth/verify — { token } → { session, user }
GET /api/auth/user — → { id, email, plan, role, usage }
GET /api/usage — → { analyses_used, analyses_limit, ... }
POST /api/checkout — { plan } → { checkout_url } (Stripe)
POST /api/webhooks/stripe — Stripe webhook handler (subscription changes)
GET /api/settings/seats — → { seats[], limit } (Quality+)
POST /api/settings/seats/invite — { email } → invite sent (Quality+)
```

## Critical Validations
- Auth gate must be modal overlay, NOT page redirect
- localStorage form persistence must survive: signup, signin, magic link click, browser tab switch
- Free tier: results show summary only, detailed rationale blurred with upgrade CTA overlay
- Rate limiting: per-user per-tier, enforced server-side, 429 response with `retry_after`
- Stripe webhook must handle: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- Seat management: Quality gets 3, Enterprise gets 10. Admin can invite by email. Invited users inherit org's plan.

## Role System
- `user` — default, standard access per tier
- `admin` — access to `/admin/*` dashboard, can feature/delete cases, view all analytics
- `reviewer` — future use (code review agent role, not user-facing yet)
- Stored in `users.role` column, checked via `require_admin` FastAPI dependency
