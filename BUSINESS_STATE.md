# BUSINESS_STATE.md — Active Business State

Last updated: 2026-04-28 6:23 PM PT

This replaces `KANBAN.md`. `KANBAN.md` is retired and must not be used as an active source of truth.

## 🔴 Needs Ev / time-sensitive

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

### Amazon FBA unfulfillable removal
- Amazon created automated unfulfillable FBA removal order **gZRKfHwQJb**.
- Next automated removal may be created **2026-04-27** if unfulfillable inventory remains.
- Needs Seller Central verification if Ev wants to change removal settings/address/frequency.
- Source: `gluemasters` msg **192161**.

### Walmart Marketplace performance/pricing
- Fresh Walmart performance snapshot shows **on-time delivery 83.3% vs 90% standard**; valid tracking 100%, cancellations/negative feedback/returns/item-not-received all 0%.
- Fresh Walmart pricing digest shows **price competitiveness 38.75%** and top recommended price cuts: `20GRGELCAGM` **$8.99 → $6.99**, `24MLEPOXYGM2` **$14.99 → $7.99**. Treat as recommendations only; Ev should decide before price changes.
- Sources: `gluemasters` msgs **192175**, **192177**.

### A3 Partners Gemiflex shipment / invoice
- A3/Caroline forwarded UPS tracking **1Z43A99A0348588986** for **165 backordered Gemiflex units** to KNCH Law / Gabriel Majalca in Phoenix; ETA **Thu 2026-04-30 by 7 PM**.
- A3 invoice **26-04271** is due **2026-05-27** for **$501.25**.
- Sources: `gluemasters` msgs **192183**, **192184**.

### Amazon refund / product-not-as-described
- Amazon initiated a **$36.83** refund for order **111-6918255-6449022** / ASIN **B01CDPIIXK** / SKU **8OZTHICKCAGM**; reason **Product not as described**.
- Source: `gluemasters` msg **192188**.

## 🟡 Customer / B2B follow-up queue

- **Heather / Amazon** — A-to-Z risk. Order **114-0636756-1872255**. Source msg **191366**. Draft exists at `moneysamurai/drafts/b2b-email-drafts-2026-03-24.md`.
- **Eric Patrick** — asked how to open 8oz bottle. Draft exists at `moneysamurai/drafts/customer-replies-2026-04-09.md`; source msg **5941**.
- **Antonio Gutierrez** — order **#6000**, asks if shipped + ship date. Draft exists, needs shipping fields; source msg **5930**.
- **Michael Nasholm** — 20% partial refund was promised but not done; customer followed up.
- **Sam Tillery** — says package has not arrived; subject actionable even though email body is blank. Source msg **6061**.
- **Jeremy Embry / Aquarium Artisans** — Ev sent the pricing / “what do you want to do moving forward” reply on 2026-04-27; wait for Jeremy’s response before next action. Source thread: `sales` msg **6046**.
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
- Walmart Marketplace announced a **2026-06-01** API behavior change for `GET /v3/inventories`: sequential cursor pagination will be enforced, and parallel/out-of-order cursor requests will return `400`.
- Quick code sweep at midday 2026-04-28 did **not** find a live MoneySamurai Walmart inventory client or `GET /v3/inventories` usage in current `api/`, `scripts/`, or `src/` code. Treat this as a watch item, not an active integration blocker, unless Walmart inventory sync code is added later. Source: `sales` msg **6080**.
- Ads daily pull incident is resolved as of **2026-04-25** with code fix `9539660` (`fix: harden amazon ads report polling`). Root cause was Amazon reports completing around 27–30 min while local report/duplicate polling timed out too early. Polling is now 45 min, HTTP/download timeouts are explicit, and duplicate handling has focused tests.
- Latest checked ads folder: **2026-04-27**, complete/valid: campaigns **10**, keywords **102**, search terms **137**, no failed reports. Same-day Apr 27 Amazon Ads attributed metrics: **$116.50 spend / $370.96 sales / 31.4% ACoS / 3.18× ROAS**. Digest flags spend as severely below the prior rolling average, but it is directionally close to the corrected Apr 26 same-day pull.
- **Important correction:** the pre-fix Amazon Ads “daily” digest was mislabeled. Its default pull was a **7-day rolling window ending on the snapshot date**, so the earlier **$708.60 spend / $2,152.91 ad-attributed sales / 69 orders** for `2026-04-26` were **not same-day April 26 sales** and must not be compared to Seller Central same-day total sales. Seller Central showed **$1,129.16 total sales including organic** for Apr 26, confirming the label/logic was invalid. Fix applied 2026-04-27 in `moneysamurai@1a2f79a`: default pull is now same-day; multi-day pulls require `--rolling-7d` and are kept out of daily history; digest labels now say ad-attributed/window metrics explicitly. Correction pull completed 2026-04-27 at ~11:31 AM PT and overwrote the daily snapshot with true same-day data.
- Recent timeout patches:
  - `sales-email-monitor`: **180s → 240s**.
  - `evgueni-email-monitor`: **120s → 180s**.
  - `ads-daily-pull`: **1800s → 3600s**.
- Both email monitors completed cleanly on late **2026-04-24** runs after the timeout bumps and surfaced no new actionable email alerts.
- New local triage artifact is live for morning testing: `reports/ads-pull-incident-latest.html` (plus `.md` / `.json`), generated by `scripts/ads_pull_incident_report.py` and linked from the morning ops build/handoff.
- New morning decision artifact is live for testing: `reports/morning-decision-desk-latest.html` (plus `.md` / `.json`), generated by `scripts/build_decision_brief.py`; it pulls source IDs, draft refs, money-at-stake, and unblockers into one morning-ready view and is linked from the morning ops hub/build.
- New morning customer-response artifact is live for testing: `reports/morning-customer-desk-latest.html` (plus `.md` / `.json`), generated by `scripts/build_customer_response_desk.py`; it distills the customer/B2B queue into hot risks, draft-backed replies, missing-info blockers, and a one-page full queue, and is linked from the morning ops hub/build.
- The recurring `moneysamurai-sync-trigger` cron job (`c6565127-2875-4a1d-be8f-1c0021dd0ade`, every 2h) should keep running but has Telegram delivery silenced (`delivery.mode=none`) as of 2026-04-25; do not re-enable routine success announcements.

## 🟢 Resolved / do not resurface without fresh evidence

- **Florida Annual Report / company renewal reminder** — Ev said to disregard/delete from todo on 2026-04-28; do not resurface unless a fresh verified filing issue appears. Source: `gluemasters` msg **192197**.
- **American Express past-due / virtual-card suspension** — evening 2026-04-28 Amex emails show the **$1,256.00 payment was received and processed on Apr 28** for account ending **71002** (`gluemasters` msg **192209**) and the Amex virtual card number was reactivated for account ending **94007** (`gluemasters` msg **192210**). Do not resurface the earlier past-due/suspended-card item unless a fresh Amex alert says the account is still restricted.
- **Donaldson NET60/onboarding reply** — Ev confirmed this is done and the NET60 reply was sent on 2026-04-26. Do not resurface as active unless Donaldson replies with a new blocker.
- **Amazon Ads daily pull outage** — resolved 2026-04-25; latest valid snapshot is **2026-04-25**. Do not resurface unless a fresh cron/pull fails.
- **ShipBob UROs** — resolved before 2026-04-23. Do not list as active debt/priority unless a new URO issue appears.
- **Canada marketplace noise** — Gluemasters is not actively selling in Canada unless Ev says otherwise; do not treat Amazon CA / WHMIS / SDS noise as a live priority.

## ⚙️ Agent / comms preferences

- Telegram updates should be pretty, colorful, concise, and strongly structured.
- No raw tool output or implementation chatter.
- Do not send routine cron success pings (especially MoneySamurai sync trigger). Only alert on failures, decisions, or real action-needed events.
- Surface only results, blockers, risks, and decisions needed.
