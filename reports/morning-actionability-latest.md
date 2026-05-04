# Morning Actionability Desk — 2026-05-04

Generated: 2026-05-03 23:05 PDT

## Snapshot
- Active items scanned: **44**
- Access / token blockers: **7**
- Passive / watch-only items: **7**
- Stale date refs still active: **6**
- High-ranked but low-action items: **1**

## Blocked on access / token / login
- **#2 · urgent · score 52.0** — Needs authenticated access, token refresh, or direct account/security check before progress.
  - Amazon account security check — Amazon sent a password recovery notice tied to a reset attempt from **Chrome on macOS near Washington**. If this was not Ev, he should verify account security directly in Amazon, not through the email link. Source: `gluemasters` msg **192139**.
- **#3 · urgent · score 52.0** — Needs authenticated access, token refresh, or direct account/security check before progress.
  - Shopify API token — Current API access is dead; inventory visibility is degraded/blind. Needs token regeneration or browser/API workaround.
- **#5 · urgent · score 45.0** — Needs authenticated access, token refresh, or direct account/security check before progress.
  - ICU Shopify upsell app token — In Cart Upsell says the store token expires **Thu 2026-04-30** and upsell offers will pause if the app is not opened/refreshed in Shopify admin. Source: `sales` msg **6090**.
- **#13 · urgent · score 33.0** — Needs authenticated access, token refresh, or direct account/security check before progress.
  - Amazon FBA unfulfillable removal — Amazon created automated unfulfillable FBA removal order **gZRKfHwQJb**. Next automated removal may be created **2026-04-27** if unfulfillable inventory remains. Needs Seller Central verification if Ev wants to change removal settings/address/frequency. Source: `gluemasters` msg **192161**.
- **#25 · needs_ev · score 25.0** — Needs authenticated access, token refresh, or direct account/security check before progress.
  - **Amazon buyer message / Karaoke Machine Store** — Amazon buyer message is waiting in Seller Central for order **113-4386244-8272243**, ASIN **B0DFPG9PJN** Singing Machine Platinum Plus. Source: `gluemasters` msg **192280**.
- **#30 · in_progress · score 22.0** — Needs authenticated access, token refresh, or direct account/security check before progress.
  - Heartbeat git-hygiene check on 2026-05-02 surfaced surprise local MoneySamurai repo changes: `api/trigger-sync.js` modified, new `api/get-auth-token.js`, and branch ahead of origin by **21 commits**. Inspect before any deploy-ish action.
- **#32 · in_progress · score 18.9** — Needs authenticated access, token refresh, or direct account/security check before progress.
  - **Important correction:** the pre-fix Amazon Ads “daily” digest was mislabeled. Its default pull was a **7-day rolling window ending on the snapshot date**, so the earlier **$708.60 spend / $2,152.91 ad-attributed sales / 69 orders** for `2026-04-26` were **not same-day April 26 sales** and must not be compared to Seller Central same-day total sales. Seller Central showed **$1,129.16 total sales including organic** for Apr 26, confirming the label/logic was invalid. Fix applied 2026-04-27 in `moneysamurai@1a2f79a`: default pull is now same-day; multi-day pulls require `--rolling-7d` and are kept out of daily history; digest labels now say ad-attributed/window metrics explicitly. Correction pull completed 2026-04-27 at ~11:31 AM PT and overwrote the daily snapshot with true same-day data.

## Passive / watch-only context
- **#13 · urgent · score 33.0** — Useful context, but likely not first-block execution work.
  - Amazon FBA unfulfillable removal — Amazon created automated unfulfillable FBA removal order **gZRKfHwQJb**. Next automated removal may be created **2026-04-27** if unfulfillable inventory remains. Needs Seller Central verification if Ev wants to change removal settings/address/frequency. Source: `gluemasters` msg **192161**.
- **#15 · urgent · score 32.07** — Useful context, but likely not first-block execution work.
  - Walmart Marketplace performance/pricing — Fresh Walmart performance snapshot shows **on-time delivery 83.3% vs 90% standard**; valid tracking 100%, cancellations/negative feedback/returns/item-not-received all 0%. Fresh Walmart pricing digest shows **price competitiveness 38.75%** and top recommended price cuts: `20GRGELCAGM` **$8.99 → $6.99**, `24MLEPOXYGM2` **$14.99 → $7.99**. Treat as recommendations only; Ev should decide before price changes. Sources: `gluemasters` msgs **192175**, **192177**.
- **#29 · needs_ev · score 23.0** — Useful context, but likely not first-block execution work.
  - **TikTok/Amazon influencer outreach** — low-priority vendor/influencer pitch surfaced late day; not urgent. Source msg **6066**.
- **#33 · needs_ev · score 15.0** — Useful context, but likely not first-block execution work.
  - **Jeremy Embry / Aquarium Artisans** — Ev sent the pricing / “what do you want to do moving forward” reply on 2026-04-27; wait for Jeremy’s response before next action. Source thread: `sales` msg **6046**.
- **#40 · urgent · score 13.0** — Useful context, but likely not first-block execution work.
  - Amazon product safety recall notice — Amazon flagged a **Thermos Stainless King food jar** order (**111-9829889-5064236**) with a stop-use / recall notice tied to a CPSC announcement. Needs Ev review only if this personal-order safety notice matters operationally; otherwise keep it low priority and do not let it crowd business-critical work. Source: `gluemasters` msg **192266**.
- **#43 · urgent · score 4.0** — Useful context, but likely not first-block execution work.
  - Trademark maintenance filing — pending USPTO acceptance — PCH filed the Combined Declaration of Use and Incontestability (Sections 8 & 15) for trademark reg **6216158 GLUE MASTERS**; USPTO filing receipt received 2026-05-01. Next step is passive monitoring for USPTO acceptance/Office action over the next 1–2 months; no Ev e-sign action remains unless PCH flags an irregularity. Sources: `gluemasters` msgs **192263**, **192271**.
- **#44 · backlog · score -10.0** — Useful context, but likely not first-block execution work.
  - Quick code sweep at midday 2026-04-28 did **not** find a live MoneySamurai Walmart inventory client or `GET /v3/inventories` usage in current `api/`, `scripts/`, or `src/` code. Treat this as a watch item, not an active integration blocker, unless Walmart inventory sync code is added later. Source: `sales` msg **6080**.

## Past-dated active items
- **#1 · urgent · score 56.18** — Contains past-dated reference; may need rewrite, confirmation, or demotion. Refs: 2026-04-30.
  - A3 Partners Gemiflex shipment / invoice — A3/Caroline forwarded UPS tracking **1Z43A99A0348588986** for **165 backordered Gemiflex units** to KNCH Law / Gabriel Majalca in Phoenix; ETA **Thu 2026-04-30 by 7 PM**. A3 invoice **26-04271** is due **2026-05-27** for **$501.25**. Sources: `gluemasters` msgs **192183**, **192184**.
- **#5 · urgent · score 45.0** — Contains past-dated reference; may need rewrite, confirmation, or demotion. Refs: 2026-04-30.
  - ICU Shopify upsell app token — In Cart Upsell says the store token expires **Thu 2026-04-30** and upsell offers will pause if the app is not opened/refreshed in Shopify admin. Source: `sales` msg **6090**.
- **#10 · needs_ev · score 38.0** — Contains past-dated reference; may need rewrite, confirmation, or demotion. Refs: 2026-05-03.
  - **Louise Frogley** — order **#6055** delayed/stuck at label printed; Ev replied that USPS tracking might lag and asked her to report if not delivered. Louise followed up again on 2026-05-03 saying the product never arrived, she bought a replacement, and she wants a credit-card refund. Needs refund vs replacement/reship decision. Source: `sales` msgs **6088**, **6089**, **6098**, **6116**, **6122**.
- **#13 · urgent · score 33.0** — Contains past-dated reference; may need rewrite, confirmation, or demotion. Refs: 2026-04-27.
  - Amazon FBA unfulfillable removal — Amazon created automated unfulfillable FBA removal order **gZRKfHwQJb**. Next automated removal may be created **2026-04-27** if unfulfillable inventory remains. Needs Seller Central verification if Ev wants to change removal settings/address/frequency. Source: `gluemasters` msg **192161**.
- **#30 · in_progress · score 22.0** — Contains past-dated reference; may need rewrite, confirmation, or demotion. Refs: 2026-05-02.
  - Heartbeat git-hygiene check on 2026-05-02 surfaced surprise local MoneySamurai repo changes: `api/trigger-sync.js` modified, new `api/get-auth-token.js`, and branch ahead of origin by **21 commits**. Inspect before any deploy-ish action.
- **#33 · needs_ev · score 15.0** — Contains past-dated reference; may need rewrite, confirmation, or demotion. Refs: 2026-04-27.
  - **Jeremy Embry / Aquarium Artisans** — Ev sent the pricing / “what do you want to do moving forward” reply on 2026-04-27; wait for Jeremy’s response before next action. Source thread: `sales` msg **6046**.

## High-ranked but low-action items
- **#12 · needs_ev · score 34.0** — Surfaced high in the ranked board despite weak immediate action signal.
  - **Jason F return** — decision pending.

## Urgent items missing source evidence
- **#3 · urgent · score 52.0** — Urgent item has no explicit message/source pointer.
  - Shopify API token — Current API access is dead; inventory visibility is degraded/blind. Needs token regeneration or browser/API workaround.

