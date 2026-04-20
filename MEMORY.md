# MEMORY.md — Durable Facts

Last updated: 2026-04-19

## Multi-Agent Setup
- **Main agent** (me) → `@GmVasyaBot` — Gluemasters, MoneySamurai, email, personal
- **Gravix agent** → `@GravixAlex_bot` — dedicated Gravix dev agent
- One gateway (port 18789), multi-account Telegram config
- Agent-to-agent: `sessions_send(agentId="gravix", sessionKey="agent:gravix:main")`
- Don't use separate gateways — causes lock conflicts + Telegram 409s

## Projects

### Gravix (gravix.com) — OWNED BY GRAVIX AGENT
- AI-powered adhesive specification SaaS. Next.js + FastAPI + Supabase.
- V2 complete. Frontend on Vercel (auto-deploy), backend on Render.
- I defer Gravix questions to the gravix agent.

### Gluemasters (gluemasters.com)
- **What:** CA/super glue e-commerce — B2B + consumer
- **Platform:** Shopify (store: gravix.myshopify.com, token in moneysamurai/api/.env)
- **Theme:** Empire, ID 131948675249
- **Products:** Thick (1500 CPS), Medium (700 CPS), Thin (100 CPS), Ultra Thin (5 CPS) in 16oz/8oz/2oz + Gel + Accelerator
- **Fulfillment:** ShipBob (Twin Lakes WI, Ontario CA, Buford GA)
- **Email:** sales@gluemasters.com via himalaya (`save-copy = false`)
- **Revenue run rate:** ~$638K (Amazon $531K + Shopify $107K)
- **Current operational status (2026-04-18):** Gluemasters does **not** sell in Canada. Do not treat Amazon CA suppression / WHMIS / SDS issues as live business priorities unless Ev explicitly says Canadian selling has resumed. Donaldson onboarding package has been sent, and the Donaldson order has already shipped.

### MoneySamurai
- Product data/analytics platform. Workspace: `/workspace/moneysamurai/`
- ESM project — use `import` not `require()`, scripts need .mjs or type=module
- Automated data syncs via cron (products, orders, inventory, financial, restock)
- Amazon Ads daily pull (campaigns + keywords + search-terms) confirmed working end-to-end as of **2026-04-12** (fix commit `moneysamurai@93bbb4e`; run logs under `logs/ads-daily/`).
- Ads pull health HTML dashboard generator: `moneysamurai/scripts/ads-pull-health-dashboard-gen.py` → output `moneysamurai/dashboards/ads-pull-health.html` (commit `moneysamurai@73d861f`).
- Cron timeout triage dashboard assets created on 2026-04-19: `reports/cron-timeout-dashboard-2026-04-19.{html,md,json}` with reusable renderer `scripts/build_cron_timeout_dashboard.py`.

### Pump Accelerator 8oz (New Product)
- Supplier: Xtralok (Chicago), pump spray bottle
- UPC: 199874971148, Model: ACC0201, target $14.99
- Designer: Designcoffers (Fiverr, $450) — revisions in progress as of 3/31
- Files: `gluemasters-bizdev/labels/pump-accelerator-8oz/`

## Tools
- himalaya: TWO accounts — `gluemasters` (evgueni@, newsletters/Amazon/ShipBob) and `sales` (sales@, customer/B2B). Customer replies → `--account sales` always.
- ShipBob API for fulfillment
- Vercel for Gravix (project: gravix-prod), Render for backend
- Supabase project: jvyohfodhaeqchjzcopf
- Gravix agent handles its own dev pipeline (PLAN → CODE → GATES → REVIEW → DEPLOY)

## B2B Reference
- CRM dashboard: `gluemasters-bizdev/b2b-crm.html`
- Quote template: `gluemasters-bizdev/quotes/`
- Strategy docs: `whale-outreach-sequence.md`, `b2b-sales-playbook.md` — READ BEFORE IMPROVISING
- GM logo: `gluemasters-bizdev/assets/gluemasters-logo.svg`

## Suppliers
- **A3 Partners** (Caroline Silvestro) — Gemiflex + caps supplier

## Lessons Learned
- himalaya SMTP `save-copy = false` for Gmail (retries otherwise)
- himalaya attachments need MML `<#multipart type=mixed>` wrapper
- himalaya thread replies: get Message-ID, set In-Reply-To + References
- himalaya account syntax: `himalaya envelope list -a <account>` (flag inside subcommand)
- Never create new ShipBob products via API — orphan inventory trap. Use existing IDs or ask Ev.
- ShipBob PATs don't expire — don't assume expiry from a single 403
- Context compaction loses details — write to files immediately
- Never report API-derived metrics as fact without verifying logs
- `git config core.compression 0` fixes LibreSSL SSL_read errors on large pushes
- MoneySamurai sync: use amazon_accounts table (sync_status doesn't exist)
- MoneySamurai sync_jobs cleanup should not assume `error_message`; recent cron history indicates the working column is `error`.
- Shopify browser auth works when API token is dead (openclaw browser, profile: openclaw)
- Amazon NARF can auto-list FBA on .ca/.mx and trigger SDS/CCCR / compliance noise even when Canada is not an active Gluemasters sales priority
- Ev wants Telegram updates formatted cleanly with bolding, stronger visual hierarchy, and selective emoji use.
