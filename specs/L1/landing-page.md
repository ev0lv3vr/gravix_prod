# Landing Page & Marketing Pages — L1 Summary

> Full detail: `L2/landing-page-full.md` | Source: gravix-final-prd.md Part V

## What It Does
Primary conversion page. Communicates: what Gravix does, why it's better than ChatGPT (self-learning), and how to start (free). Quality teams (8D buyers) are the primary audience, individual engineers secondary.

## Routes
- `/` — Landing page
- `/pricing` — Full pricing page with plan comparison + FAQ

## Landing Page Components (in order)

1. **Hero Section** — "Specify industrial adhesives with confidence. Diagnose failures in minutes." Two CTAs: "Try Spec Engine →" (primary) + "Diagnose a Failure" (secondary). Microcopy: "Free to start · No credit card"
2. **Social Proof Bar** — "Trusted by engineers at [logo strip]" + stats: "X analyses completed · Y% average confidence · Z cases in knowledge base" (from `/api/admin/stats` public endpoint)
3. **Problem Section** — 3 cards showing pain points (chatgpt unreliable, templates suck, no learning)
4. **Feature Block 1: AI Failure Analysis** — visual AI + TDS-aware diagnostics
5. **Feature Block 2: 8D Investigation Management** — NEW primary conversion tool (Quality/Enterprise)
6. **Feature Block 3: Self-Learning Intelligence** — knowledge moat, "every analysis makes the next one smarter"
7. **Feature Block 4: Pattern Intelligence** — enterprise differentiator, cross-case detection
8. **Feature Block 5: Adhesive Specification Engine** — demoted from position 1 (still important, but not the lead)
9. **Differentiator Section** — 3-column comparison table: Generic AI vs Manual/Templates vs Gravix
10. **Pricing Preview** — 4 mini-cards (Free/Pro/Quality/Enterprise) with key features + CTAs → `/pricing`
11. **Final CTA** — "Start diagnosing failures for free" + email capture or direct link to `/failure`

## Pricing Page Components
- Plan comparison table (features × tiers, checkmarks)
- Billing toggle (monthly/annual, annual = 2 months free)
- FAQ accordion (8-10 questions)
- Enterprise "Contact us" CTA
- Each plan: primary CTA button → Stripe checkout (or "Current plan" if subscribed)

## Design Specs
- Dark mode: bg `#0A1628`, text white/gray hierarchy
- Hero: 48px headline (32px mobile), centered, max-width 720px
- CTAs: `bg-accent-500 hover:bg-accent-600`, 16px, px-8 py-3, rounded-lg
- Feature blocks: alternating left/right image+text layout, subtle grid bg
- Pricing cards: `bg-brand-800`, border highlight on Quality card ("Most Popular")
- All spacing, colors, typography in `ui/design-tokens.md`

## Key Copy Rules
- Subheadline must say "learns from every analysis" and "real production data" — this is the moat USP
- 8D feature block should lead with "Reduce 8D cycle time from 15 days to 3 days"
- Social proof bar stats must be real (from API), not hardcoded
- Quality tier card must be visually highlighted as the recommended plan

## Critical Validations
- Landing page must load fast — no heavy JS, above-fold content SSR
- Social proof stats endpoint must be cached (5 min TTL) and return zeros gracefully before data exists
- Pricing page must reflect current Stripe prices — not hardcoded
- Mobile: all components stack vertically, hero 32px headline, feature blocks single-column
