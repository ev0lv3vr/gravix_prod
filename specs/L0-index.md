# Gravix Feature Index (L0)

> **Read this first.** This is the master index of all Gravix features. Every agent session loads this file to find the relevant spec files for the feature being implemented. The canonical source of truth is `gravix-final-prd.md` — this index tells you where to look within it.

**Stack:** Next.js 14 (App Router) + Tailwind + FastAPI (Python 3.11+) + Supabase (PostgreSQL + Auth) + Claude API + Stripe  
**Design:** Dark-mode-first. Background `#0A1628`. Accent `#3B82F6`. Font: Inter + JetBrains Mono.  
**Repo:** Main code repo + `gravix-specs/` (this directory, read-only) + `gravix-holdouts/` (private, agents never access)

---

## Spec Engine (F1–F6)
AI-powered adhesive specification tool. User inputs substrates, loads, environment, constraints. AI returns ranked adhesive recommendations with confidence scores and specific product names (e.g., "Loctite EA 9395"). Routes: `/tool`.
→ Summary: `L1/spec-engine.md`
→ Full detail: `L2/spec-engine-full.md`
→ UI spec: `L2/spec-engine-full.md` includes form layout, Zone 1/Zone 2 structure, combobox substrate selector
→ Form fields: `L2/forms-full.md`

## Failure Analysis (F7–F12)
Root cause analysis for adhesive bond failures. User describes failure mode, inputs conditions, optionally uploads photos (up to 5). AI identifies probable root causes ranked by confidence. Routes: `/failure`, `/failure?mode=guided`.
→ Summary: `L1/failure-analysis.md`
→ Full detail: `L2/failure-analysis-full.md`
→ UI spec: same as above

## Auth & Tier Gating (F13–F14, F19)
Supabase Auth with magic link. Four tiers: Free (3 analyses/mo, summary only), Pro ($79/mo, 30/mo, full), Quality ($299/mo, 100/mo, 8D, 3 seats), Enterprise ($799/mo, unlimited, 10 seats). Auth gate drops on "Analyze" click (F19) — form is publicly fillable, modal overlay on submit, localStorage preserves form data. Usage counter in nav.
→ Summary: `L1/auth-and-gating.md`
→ Full detail: `L2/auth-and-gating-full.md`

## Feedback & Knowledge Layer (V2 Intelligence)
The moat. Feedback system captures whether fixes worked (outcome tracking). Knowledge aggregator computes patterns from confirmed outcomes. Knowledge injection augments AI prompts with empirical data. Case library auto-generates searchable, SEO-indexed case studies. Cross-linking connects spec↔failure analyses.
→ Summary: `L1/feedback-and-knowledge.md`
→ Full detail: `L2/feedback-and-knowledge-full.md`

## Quality Module — 8D Investigations (F15–F18 + Collaboration Features)
Enterprise bolt-on. Auto-generates audit-ready 8D corrective action reports. D1–D8 disciplines as stepper workflow. Team collaboration (threaded comments, photo annotation with Fabric.js, electronic signatures). OEM templates (Ford Global 8D, VDA 8D, A3, AS9100 CAPA). Email-in investigation creation. Notifications. Routes: `/investigations`, `/investigations/[id]`, `/investigations/new`, `/investigations/[id]/report`.
→ Summary: `L1/quality-module.md`
→ Full detail: `L2/quality-module-full.md`
→ Tier: Quality ($299/mo) and Enterprise ($799/mo) only

## Observability & Monitoring
AI engine telemetry (every call logged: tokens, latency, cost, knowledge context used). API request logging. Daily metrics aggregation (cron). System health monitoring. Tables: `ai_engine_logs`, `api_request_logs`, `daily_metrics`.
→ Summary: `L1/observability.md`
→ Full detail: `L2/observability-full.md`

## Admin Dashboard
Internal-only. 5 pages: Overview (volume + conversion), AI Engine (performance + knowledge impact), Engagement (feedback funnel + user table), Knowledge Moat (calibration + patterns), System Health (endpoints + errors). Role system: user/admin/reviewer. Audit log. Route: `/admin/*`.
→ Summary: `L1/admin-dashboard.md`
→ Full detail: `L2/admin-dashboard-full.md`

## Product Catalog & Matching
Product name recommendations in spec engine results (e.g., "Loctite EA 9395 · 3M Scotch-Weld DP460"). "Matching Products" section below spec results queried from `product_specifications` table. Product pages: `/products`, `/products/[manufacturer]/[slug]` with field performance data. Routes: `/products`.
→ Summary: `L1/product-catalog.md`
→ Full detail: `L2/product-catalog-full.md`

## Landing Page & Marketing Pages
Quality teams as primary audience. Hero: "Specify industrial adhesives with confidence. Diagnose failures in minutes." 5 feature blocks. 3-column differentiator (Generic AI vs Manual vs Gravix). Pricing preview (4 mini-cards). Social proof bar. Routes: `/`, `/pricing`.
→ Summary: `L1/landing-page.md`
→ Full detail: `L2/landing-page-full.md`

---

## Cross-Cutting Specs

| File | Contents |
|------|----------|
| `ui/design-tokens.md` | Colors, typography, spacing, component styling, dark mode palette |
| `schema/database-schema.md` | All tables, columns, types, constraints, RLS policies, indexes |
| `schema/api-contracts.md` | All REST endpoints, request/response shapes, auth requirements |
| `L2/forms-full.md` | Complete form field specs for both Spec Engine and Failure Analysis (Zone 1/Zone 2, combobox, multi-select chips, conditional sub-fields, all options lists) |

---

## Pricing Quick Reference

| Tier | Price | Analyses/mo | Investigations/mo | Seats | Key Gates |
|------|-------|-------------|-------------------|-------|-----------|
| Free | $0 | 3 | 0 | 1 | Summary results only, no feedback, case library view-only |
| Pro | $79/mo | 30 | 0 | 1 | Full results, feedback, case library, cross-linking |
| Quality | $299/mo | 100 | 20 | 3 | 8D investigations, guided investigation, visual analysis, TDS |
| Enterprise | $799/mo | Unlimited | Unlimited | 10 | OEM templates, pattern alerts, org branding |

## Tech Stack Quick Reference

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), React, Tailwind CSS, shadcn/ui |
| Backend | FastAPI (Python 3.11+), Pydantic, pytest |
| Database | Supabase (PostgreSQL + Auth + RLS + Storage) |
| AI | Claude API (Sonnet for analysis, Haiku for extraction/eval) |
| Payments | Stripe (checkout sessions, webhooks, subscription management) |
| Email | Resend (transactional + follow-up) |
| Hosting | Vercel (frontend) + Railway or Fly.io (backend) |
| CI/CD | GitHub Actions |
| E2E Tests | Playwright |
| Image Annotation | Fabric.js (8D photo annotation) |
