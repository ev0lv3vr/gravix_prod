# MEMORY.md — Durable Facts

Last updated: 2026-05-03

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
- **Current operational status (2026-04-30):** Gluemasters does **not** sell in Canada. Do not treat Amazon CA suppression / WHMIS / SDS issues as live business priorities unless Ev explicitly says Canadian selling has resumed. Donaldson NET60/onboarding reply is done as of 2026-04-26; do not resurface as active unless Donaldson replies with a new blocker. Jeremy Embry / Aquarium Artisans has an urgent accelerator + CA quote/fulfillment request for a Monday aquascape job (sales msg id **6046**). ShipBob announced Twin Lakes inventory will move to Kenosha in early May–June with possible zero-on-hand/downtime windows (evgueni msg id **192092**). GLUE MASTERS trademark maintenance invoice **3704** for **$1,170** was paid in full on 2026-04-29 and confirmed by PCH on 2026-04-30 (gluemasters msgs **192239**, **192256**); do not resurface as unpaid. PCH filed the GLUE MASTERS Section 8 & 15 declaration and USPTO receipt arrived 2026-05-01 (gluemasters msg **192271**); no e-sign action remains unless PCH flags an irregularity. Amex high-balance warning for account ending **94007/794007** was resolved by **$20,493.51** payment received/processed on 2026-04-30 (gluemasters msgs **192250**, **192258**); do not resurface unless a fresh Amex restriction appears. R&R Fabrications shipment/invoice and the insurance audit were both marked done by Ev on 2026-05-03; do not resurface either as active without fresh evidence.

### MoneySamurai
- Product data/analytics platform. Workspace: `/workspace/moneysamurai/`
- ESM project — use `import` not `require()`, scripts need .mjs or type=module
- Automated data syncs via cron (products, orders, inventory, financial, restock)
- Amazon Ads daily pull (campaigns + keywords + search-terms) confirmed working end-to-end as of **2026-04-12** (fix commit `moneysamurai@93bbb4e`; run logs under `logs/ads-daily/`).
- Ads pull health HTML dashboard generator: `moneysamurai/scripts/ads-pull-health-dashboard-gen.py` → output `moneysamurai/dashboards/ads-pull-health.html` (commit `moneysamurai@73d861f`).
- Cron timeout triage dashboard assets created on 2026-04-19: `reports/cron-timeout-dashboard-2026-04-19.{html,md,json}` with reusable renderer `scripts/build_cron_timeout_dashboard.py`.
- Cron timeout headroom watchlist added late 2026-04-19 from live cron config snapshot: `reports/cron-list-snapshot-2026-04-19.json`, `reports/cron-watchlist-2026-04-19.{html,md,json}`, renderer `scripts/build_cron_watchlist.py`.
- Midday 2026-04-20: applied the ready cron patch for `moneysamurai-sync-trigger` (job `c6565127-2875-4a1d-be8f-1c0021dd0ade`), raising `payload.timeoutSeconds` from **60** to **120** after the watchlist flagged it as the only live critical timeout risk.
- Nightly 2026-04-20: refreshed the live cron snapshot/watchlist for `2026-04-21` and integrated cron watchlist visibility into the morning ops build (`scripts/ops_build.py`, `scripts/kanban_morning_builder.py`), so the morning brief now surfaces the hottest timeout risk directly.
- Midday 2026-04-21: live cron state showed `moneysamurai-sync-trigger` still green, `gravix-aggregate-knowledge` no longer red, and a new repeated timeout on `sales-email-monitor`; patched job `280c5ddc-93ca-4011-980e-4740a51a4eb5` from **120s → 180s**.
- Nightly 2026-04-21: added a multi-day cron risk/regression reporter (`scripts/build_cron_trend_report.py`) with outputs `reports/cron-trend-report-2026-04-22.{html,md,json}` + latest aliases, and wired it into the morning ops build/hub so the morning package now shows whether cron risk is improving or getting worse across saved watchlists.
- Midday 2026-04-22: confirmed `sales-email-monitor` is healthy after yesterday’s timeout bump, and patched `ads-daily-pull` (job `05a6e66b-d1df-46af-b164-4e55cbb6bb9f`) from **1800s → 3600s** after three straight timeout failures at the previous cap.
- Nightly 2026-04-22: added a compact morning handoff builder (`scripts/build_morning_handoff.py`) that distills the existing board/debt/cron artifacts into one operator-first brief (`reports/morning-handoff-2026-04-23.{md,html,json}` + latest aliases), and wired it into `scripts/ops_build.py` plus the morning ops hub.
- Midday 2026-04-23: fresh live runs showed both email monitors timing out again after earlier healthy runs, so `sales-email-monitor` (job `280c5ddc-93ca-4011-980e-4740a51a4eb5`) was widened from **180s → 240s** and `evgueni-email-monitor` (job `08054f94-6178-4f45-83b2-348ab56cda17`) from **120s → 180s**. `ads-daily-pull` stayed unresolved after the 3600s bump; 2026-04-24 morning manual recovery produced a partial/invalid 2026-04-23 folder with keywords failed/empty and should move to deeper pipeline/log triage, not another timeout bump.
- Nightly 2026-04-23: migrated the morning execution builder off retired `KANBAN.md` and onto `BUSINESS_STATE.md` as the active source of truth (`scripts/kanban_morning_builder.py`, `scripts/ops_build.py`, `scripts/ops_debt_dashboard.py`). Rebuilt the **2026-04-24** morning pack so the ranked queue reflects live state instead of stale/resolved board items.
- Midday 2026-04-24: cleaned the ops debt source/dashboard to remove stale retired items (including resolved ShipBob UROs / Amazon CA noise and obsolete Donaldson shipping debt), rebuilt the morning ops artifacts, and brought live debt reporting down to **9 open / 7 active-critical** with **$1,715.54** one-time open debt and **$0/day** recurring burn.
- Evening 2026-04-24: verified both email monitors completed cleanly on their next runs after the timeout bumps, with no actionable new alerts; `ads-daily-pull` remains the only live cron reliability issue that still needs deeper log/pipeline triage.
- Nightly 2026-04-24: added an ads pull incident reporter (`scripts/ads_pull_incident_report.py`) that parses the latest `logs/ads-daily/*.log` plus snapshot status into `reports/ads-pull-incident-latest.{html,md,json}`, and wired it into `scripts/ops_build.py`, the morning handoff, and the morning ops hub so the stuck campaigns/keywords failure is explained in one place instead of raw logs.
- Morning 2026-04-25: resolved the Amazon Ads daily-pull incident with code fix `moneysamurai@9539660` (`fix: harden amazon ads report polling`): report/duplicate polling widened to 45 minutes, HTTP/download timeouts added, keyword hard-fail fallback covered by tests. Recovery run `.runs/ads-20260425T080523Z-recovery` completed successfully for snapshot **2026-04-24** with campaigns **10**, keywords **118**, search terms **393**, no failed reports; digest and ads pull health dashboard regenerated.
- Midday 2026-04-25: traced noisy Telegram messages (“MoneySamurai sync trigger sent ✅” / “Sync triggered ✅”) to OpenClaw cron job `c6565127-2875-4a1d-be8f-1c0021dd0ade` (`moneysamurai-sync-trigger`, `0 */2 * * *`, 5m stagger). It had `delivery.mode=announce` to Ev’s Telegram; changed it to `delivery.mode=none` while leaving the backend sync itself enabled. Backup: `/Users/evolve/.openclaw/cron/jobs.json.bak-before-silence-moneysamurai-sync-trigger-20260425T1219.json`.
- Midday 2026-04-25 (2 PM check): captured two newly surfaced non-resolved items into live state so they do not get lost or re-surfaced as surprises later: Amazon password recovery/security alert (`gluemasters` msg **192139**) and Sam Tillery package-not-arrived complaint (`sales` msg **6061**). Confirmed again that Amazon Ads daily pull is resolved and that `KANBAN.md` remains retired.
- Evening 2026-04-25 (6 PM window): additional actionable context surfaced — Amex statement-ready email for account ending **94007** due **2026-05-19** (`gluemasters` msg **192149**) and a low-priority TikTok/Amazon influencer outreach pitch (`sales` msg **6066**). No fresh Amazon Ads regression was seen; latest valid ads snapshot remained **2026-04-24**.
- Nightly 2026-04-25: added a dedicated morning decision desk builder (`scripts/build_decision_brief.py`) with outputs `reports/morning-decision-desk-2026-04-26.{md,html,json}` + latest aliases, and wired it into `scripts/ops_build.py` plus the morning ops hub. Also tightened the morning pack so old ads incident details are suppressed when the latest ads snapshot is healthy, and filtered out resolved/status-only MoneySamurai bullets from the ranked morning board to reduce noise.
- Morning 2026-04-26 (9 AM window): surfaced fresh Amex risk into live state — account ending **271002** is now reported **$620 past due / $1,256 total due** (`gluemasters` msg **192157**), and an **Electrify America $40** charge declined due to past-due status on account ending **794007** (`gluemasters` msg **192151**). Amazon Ads daily pull recovered and completed for snapshot **2026-04-25** despite a transient polling 401/token issue: campaigns **10**, keywords **120**, search terms **358**, spend **$671.36**, sales **$2,037.64**, orders **67**, ACoS **32.9%**, ROAS **3.04×**.
- Midday 2026-04-26 (1 PM window): no new sales/customer emails after the morning scan. New operational Amazon notice surfaced: automated unfulfillable FBA removal order **gZRKfHwQJb** created, with the next automated removal scheduled for **2026-04-27** if unfulfillable inventory remains (`gluemasters` msg **192161**); captured in live state for Seller Central verification if needed. Ev confirmed Donaldson is done and the NET60 reply was sent; moved Donaldson out of active state.
- Evening 2026-04-26 (6 PM window): fresh Amex notice says the card enrolled for an Amex virtual card number has been suspended for account ending **94007** (`gluemasters` msg **192165**); active Amex follow-up now includes both this virtual-card suspension and the earlier account ending **271002** past-due notice (`gluemasters` msg **192157**). Amazon Ads daily pull remained healthy for snapshot **2026-04-25**: campaigns **10**, keywords **120**, search terms **358**, no failed reports.
- Nightly 2026-04-26: added a dedicated morning customer-response desk builder (`scripts/build_customer_response_desk.py`) with outputs `reports/morning-customer-desk-2026-04-27.{md,html,json}` + latest aliases, and wired it into `scripts/ops_build.py` plus the morning ops hub so the morning pack now has one page for hot customer/B2B risks, draft-backed replies, and missing-info blockers.
- Morning 2026-04-27: Ev caught the Amazon Ads daily digest mismatch (digest showed **$2,152.91** ad-attributed sales while Seller Central total sales including organic were **$1,129.16**). Root cause was default rolling-7-day report logic being labeled as daily. Fix committed as `moneysamurai@1a2f79a` (`fix: separate ads daily and rolling attribution metrics`): default pull is now same-day, rolling reports require `--rolling-7d`, and digest labels are explicit. Same-day correction pull completed at ~11:31 AM PT for snapshot **2026-04-26**: campaigns **10**, keywords **93**, search terms **125**, **$109.57** spend, **$246.91** ad-attributed sales, **44.4% ACoS**, **2.25× ROAS**.
- Nightly 2026-04-27: added a `Morning Delta Brief` builder (`scripts/build_morning_delta_brief.py`) with outputs `reports/morning-delta-brief-2026-04-28.{md,html,json}` + latest aliases, and wired it into `scripts/ops_build.py` plus the morning ops hub so the pack now shows what changed versus the prior dated board: new queue items, drops/resolutions, rank movers, top-8 entrants/exits, and section deltas.
- Midday 2026-04-28 (1 PM window): email scan surfaced a time-sensitive Florida Annual Report / company renewal reminder from MIAccounting, due **2026-05-01** with late penalty starting at **$400** (`gluemasters` msg **192197**), plus a Walmart Marketplace API notice that `GET /v3/inventories` will enforce sequential cursor pagination on **2026-06-01** (`sales` msg **6080**). Ads daily pull for snapshot **2026-04-27** was valid/complete: campaigns **10**, keywords **102**, search terms **137**, **$116.50** spend, **$370.96** ad-attributed sales, **31.4% ACoS**, **3.18× ROAS**.
- Evening 2026-04-28 (6 PM window): Amex follow-up improved/resolved based on new Amex emails: **$1,256.00** payment received/processed on Apr 28 for account ending **71002** (`gluemasters` msg **192209**) and virtual card number reactivated for account ending **94007** (`gluemasters` msg **192210**). Also surfaced a non-customer cleaning-services cold pitch (`sales` msg **6081**) and PayPal receipt for **$142.55** to Pocket / Personal AI Assistant (`sales` msg **6075**). Ads daily pull remained current with latest folder **2026-04-27**. Ev said to disregard/delete the Florida Annual Report reminder from todo; moved it out of active state and marked do-not-resurface unless a fresh verified filing issue appears.
- Nightly 2026-04-29: added morning-pack freshness/trust signals to the ops build (`scripts/kanban_morning_builder.py`, `scripts/ops_build.py`) so the morning hub/pack now surfaces freshness state (`FRESH / AGING / STALE`), newest source edit time, build lag, and source timestamps for `BUSINESS_STATE.md`, `MEMORY.md`, and loaded daily journals. Built and verified in commit `d7f2e46` (`feat: add morning pack freshness signals`).
- Morning 2026-04-30 (9 AM window): surfaced new/updated customer and ops items into live state: Louise Frogley order **#6055** followed up again (`sales` msg **6098**); The Escape Game clarified their receipt link points to **Glue Masters Thin CA Glue — 16oz** (`sales` msg **6096**); Steven Cohen reported order **#6032** Thin Glue may be mislabeled/thicker than expected and requested refund (`sales` msgs **6093**, **6094**); R&R Fabrications PayPal invoice **1001-0242** for **$1,289.70** was sent to Jeff (`sales` msg **6099**). Amazon Ads daily flywheel completed for snapshot **2026-04-29**: campaigns **10**, keywords **103**, search terms **106**, **$80.15** spend, **$205.93** ad-attributed sales, **38.9% ACoS**, **2.57× ROAS**, plus optimizer/harvester live actions and Render sync.
- Midday 2026-04-30 (1 PM window): The Escape Game receipt request resolved itself after Brendon found the receipt on Shopify (`sales` msg **6102**); moved it out of active customer follow-up. Shohreh/Cute Things bulk quote thread advanced with requests for 16oz Thick/Medium, 8oz Medium, and 300–400 unit 2oz pricing (`sales` msgs **6100**, **6101**); Ev requested/corrected final email and thread shows answered, so await her response/final quantities.
- Nightly 2026-05-02: added a `Morning Unblock Desk` to the ops pack (`reports/morning-unblock-desk-latest.html` plus dated output), wired into `scripts/ops_build.py`, hub links, and freshness/build brief output; validated with `python3 scripts/ops_build.py --date 2026-05-02`, all **14/14** artifacts OK, commit `fbbff28` (`feat: add morning unblock desk`).
- Nightly 2026-05-03: added a `Morning Actionability Desk` to the ops pack (`reports/morning-actionability-latest.html` plus dated output), wired into `scripts/ops_build.py` and the ops hub; also tuned the ranking in `scripts/kanban_morning_builder.py` to demote passive/watch-only items and pull executable access/token blockers higher in the morning queue.

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
- Ev wants Telegram updates formatted cleanly, prettily, and colorfully: bold section headers, strong visual hierarchy, short bullets, whitespace, and tasteful emoji/color cues (🔴 🟡 🟢 🔵 ⚠️ ✅).
- Ev does **not** want in-between implementation chatter, raw run/tool output, or routine cron success pings. Only surface final results, blockers, decisions needed, time-sensitive risks, and concise action-oriented status updates.
- Persona preference: Vasya should be collegial, friendly, and direct — Ev’s right hand/confidant, not a detached chatbot.
- ShipBob UROs were already completed/resolved before 2026-04-23. Do **not** list them as active ops debt or a priority unless fresh evidence shows a new URO issue.
- `KANBAN.md` is retired as of 2026-04-23. Ev does not use it. Do **not** use it as active truth. Use `BUSINESS_STATE.md` for active business state, `MEMORY.md` for durable facts, and `memory/YYYY-MM-DD.md` for journal history.
