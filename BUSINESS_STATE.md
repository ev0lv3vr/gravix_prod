# BUSINESS_STATE.md — Active Business State

Last updated: 2026-04-25 6:00 PM PT

This replaces `KANBAN.md`. `KANBAN.md` is retired and must not be used as an active source of truth.

## 🔴 Needs Ev / time-sensitive

### Donaldson onboarding
- Rachael Fitzgerald says onboarding is almost finished.
- Needs either Quality/ISO certification copies or one final super-glue certification form.
- Donaldson AP also pushed back on **NET30** and asked whether Gluemasters will accept **NET60** for expected purchases around **3–4x/year**.
- Sources: `sales` msgs **6048**, **6060**.

### Jeremy Embry / Aquarium Artisans
- Wants urgent CA + accelerator support for Monday aquascape job.
- Needs 16oz Medium + 16oz Thick with accelerator ASAP.
- Also wants 2oz Medium + 2oz Thick for store.
- Source: `sales` msg **6046**.

### American Express account/payment follow-up
- Past-due notice for account ending **271002** came in earlier.
- New Amex emails show a **$1,000 payment received** (msg **192107**) but also a **transaction declined due to past-due status** shortly before/around processing (msg **192106**).
- A separate Amex statement-ready email also arrived for account ending **94007**, payment due **Tue May 19, 2026** (msg **192149**).
- Ev should verify the Amex balance/status directly in Amex, not through email links.
- Sources: `gluemasters` msgs **192094**, **192106**, **192107**, **192149**.

### Amazon account security check
- Amazon sent a password recovery notice tied to a reset attempt from **Chrome on macOS near Washington**.
- If this was not Ev, he should verify account security directly in Amazon, not through the email link.
- Source: `gluemasters` msg **192139**.

### Insurance audit
- Overdue; data reportedly ready around **$637K**.
- Ev must submit/handle final PDF.

### Shopify API token
- Current API access is dead; inventory visibility is degraded/blind.
- Needs token regeneration or browser/API workaround.

## 🟡 Customer / B2B follow-up queue

- **Heather / Amazon** — A-to-Z risk. Order **114-0636756-1872255**. Source msg **191366**. Draft exists at `moneysamurai/drafts/b2b-email-drafts-2026-03-24.md`.
- **Eric Patrick** — asked how to open 8oz bottle. Draft exists at `moneysamurai/drafts/customer-replies-2026-04-09.md`; source msg **5941**.
- **Antonio Gutierrez** — order **#6000**, asks if shipped + ship date. Draft exists, needs shipping fields; source msg **5930**.
- **Michael Nasholm** — 20% partial refund was promised but not done; customer followed up.
- **Sam Tillery** — says package has not arrived; subject actionable even though email body is blank. Source msg **6061**.
- **Gemifly LLC** — **$1,513.23** PayPal invoice outstanding.
- **TikTok/Amazon influencer outreach** — low-priority vendor/influencer pitch surfaced late day; not urgent. Source msg **6066**.
- **Dynasty Global / Eli** — dealer inquiry; needs Ev decision.
- **Ethan Miller** — order **#5786**, 4× Thick 16oz replacement not created at ShipBob.
- **Josh Mintz** — 8oz Medium sample to New Orleans overdue.
- **Walmart unshipped order** — auto-cancel risk.
- **KMS LLC / Brittni** — wholesale distributor inquiry stale.
- **Christopher Webber** — B2B inquiry stale.
- **Jason F return** — decision pending.

## 🔵 Active product / growth

### Pump Accelerator 8oz
- Supplier: Xtralok, Chicago.
- UPC: **199874971148**.
- Model: **ACC0201**.
- Target price: **$14.99**.
- Designer: Designcoffers/Fiverr; revisions in progress.
- Files: `gluemasters-bizdev/labels/pump-accelerator-8oz/`.

### Amazon PPC
- Tracked state: 11 campaigns, ~$773/day spend, 2.42× ROAS, 41% ACoS.
- Late-day 2-month PPC review: growth is working, but account profitability is still loose; best current wins are 8oz Thick Auto, 8oz Medium Auto, and CA Glue Core Exact, while **2oz Thick Auto**, conquest, and defense need tightening.
- Backlog: wire flywheel data into MoneySamurai PPC frontend; bias next optimization pass toward cutting waste in **2oz Thick Auto / conquest / defense** and scaling the stronger exact/discovery winners more carefully.

### Shopify / marketplace backlog
- Back-in-stock notification app.
- Refund policy links to gravixadhesives.com.
- Google Search Console sitemap submission.
- Opinew review import verification: **1,183 reviews**.
- Bundle offers.
- Oversold inventory watch: Gel 20g (-6), Thick 2oz (-1).

## 🟣 MoneySamurai / systems

- MoneySamurai is the internal analytics/ops platform.
- Ads daily pull incident is resolved as of **2026-04-25** with code fix `9539660` (`fix: harden amazon ads report polling`). Root cause was Amazon reports completing around 27–30 min while local report/duplicate polling timed out too early. Polling is now 45 min, HTTP/download timeouts are explicit, and duplicate handling has focused tests.
- Latest checked ads folder: **2026-04-24**, complete/valid: campaigns **10**, keywords **118**, search terms **393**, no failed reports. Recovery log: `.runs/ads-20260425T080523Z-recovery/ads-daily-pull-recovery.log`.
- Ads daily digest and pull-health dashboard regenerated for **2026-04-24**.
- Recent timeout patches:
  - `sales-email-monitor`: **180s → 240s**.
  - `evgueni-email-monitor`: **120s → 180s**.
  - `ads-daily-pull`: **1800s → 3600s**.
- Both email monitors completed cleanly on late **2026-04-24** runs after the timeout bumps and surfaced no new actionable email alerts.
- New local triage artifact is live for morning testing: `reports/ads-pull-incident-latest.html` (plus `.md` / `.json`), generated by `scripts/ads_pull_incident_report.py` and linked from the morning ops build/handoff.
- New morning decision artifact is live for testing: `reports/morning-decision-desk-latest.html` (plus `.md` / `.json`), generated by `scripts/build_decision_brief.py`; it pulls source IDs, draft refs, money-at-stake, and unblockers into one morning-ready view and is linked from the morning ops hub/build.
- The recurring `moneysamurai-sync-trigger` cron job (`c6565127-2875-4a1d-be8f-1c0021dd0ade`, every 2h) should keep running but has Telegram delivery silenced (`delivery.mode=none`) as of 2026-04-25; do not re-enable routine success announcements.

## 🟢 Resolved / do not resurface without fresh evidence

- **Amazon Ads daily pull outage** — resolved 2026-04-25; latest valid snapshot is **2026-04-24**. Do not resurface unless a fresh cron/pull fails.
- **ShipBob UROs** — resolved before 2026-04-23. Do not list as active debt/priority unless a new URO issue appears.
- **Canada marketplace noise** — Gluemasters is not actively selling in Canada unless Ev says otherwise; do not treat Amazon CA / WHMIS / SDS noise as a live priority.

## ⚙️ Agent / comms preferences

- Telegram updates should be pretty, colorful, concise, and strongly structured.
- No raw tool output or implementation chatter.
- Do not send routine cron success pings (especially MoneySamurai sync trigger). Only alert on failures, decisions, or real action-needed events.
- Surface only results, blockers, risks, and decisions needed.
