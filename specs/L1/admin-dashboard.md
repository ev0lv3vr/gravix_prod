# Admin Dashboard — L1 Summary

> Full detail: `L2/admin-dashboard-full.md` | Source: gravix-final-prd.md Parts II, IX

## What It Does
Internal-only dashboard for the operator (Ev). 5 pages covering system health, AI performance, user engagement, knowledge moat growth, and operational overview. Role-gated (admin only).

## Routes
- `/admin` — redirects to `/admin/overview`
- `/admin/overview` — volume + conversion metrics
- `/admin/ai-engine` — AI performance, knowledge impact, costs
- `/admin/engagement` — feedback funnel, top users, plan distribution
- `/admin/knowledge` — calibration accuracy, pattern coverage, top patterns
- `/admin/system` — endpoint performance, errors, DB health

## Layout
- Sidebar navigation (left, 240px, collapsible)
- Top bar with "Admin Dashboard" title + date range picker (7d / 30d / 90d / custom)
- Content area with card grid

## Pages — Key Components

**Overview:** Total analyses card, total signups card, total feedback card, revenue card. Daily volume line chart (30d). Conversion funnel (visit → signup → first analysis → feedback → paid). Free→Pro conversion rate.

**AI Engine:** Performance cards (avg/p50/p95/p99 latency, error rate, parse success rate). Knowledge impact comparison table (confidence with vs without knowledge, lift %). Token usage + cost breakdown per day. Confidence distribution bar chart. Error breakdown table. Daily latency trend line chart.

**Engagement:** Feedback funnel horizontal bar (analyses → any feedback → outcome → rich feedback). Top users table (email, company, plan, analyses count, feedback count, last active). Plan distribution donut chart. Conversion funnel numbers.

**Knowledge Moat:** Calibration accuracy cards (top-1 accuracy, top-3 accuracy, complete miss rate). Coverage summary (total patterns, high/medium/low confidence counts). Top patterns sortable table (pattern key, cases, feedback count, resolution rate, confidence). Patterns needing more feedback list.

**System Health:** Endpoint performance table (path, requests, avg/p95 latency, error rate). Hourly traffic bar chart. Recent errors scrollable log. AI errors log. Database size + row counts.

## API Dependencies
All endpoints from `L1/observability.md` — the admin dashboard is purely a frontend that visualizes data from the observability layer.

## Critical Validations
- All `/admin/*` routes require admin role — redirect to `/` if not admin
- Date range picker controls all dashboard queries
- Charts should handle empty data gracefully (show "No data for this period" not broken charts)
- Top users table must not expose sensitive data — email, company, plan, usage stats only
- Admin actions (feature case, delete case, etc.) logged to `admin_audit_log`
