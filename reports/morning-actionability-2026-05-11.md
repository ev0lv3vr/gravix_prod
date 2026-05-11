# Morning Actionability Desk — 2026-05-11

Generated: 2026-05-10 23:05 PDT

## Snapshot
- Active items scanned: **48**
- Access / token blockers: **7**
- Passive / watch-only items: **11**
- Stale date refs still active: **11**
- High-ranked but low-action items: **2**

## Blocked on access / token / login
- **#5 · urgent · score 52.0** — Needs authenticated access, token refresh, or direct account/security check before progress.
  - Shopify API token — Current API access is dead; inventory visibility is degraded/blind. Needs token regeneration or browser/API workaround.
- **#6 · urgent · score 48.0** — Needs authenticated access, token refresh, or direct account/security check before progress.
  - Amazon account security check / Meta partner request — Amazon sent a password recovery notice tied to a reset attempt from **Chrome on macOS near Washington**. If this was not Ev, he should verify account security directly in Amazon, not through the email link. Facebook/Meta sent a Business Manager partner request from **“Join the Meta Agency Partner Program”**. Treat as suspicious unless Ev recognizes it; do not approve/share assets from email links. Source: `sales` msg **6141**. Sources: `gluemasters` msg **192139**, `sales` msg **6141**.
- **#8 · urgent · score 45.0** — Needs authenticated access, token refresh, or direct account/security check before progress.
  - ICU Shopify upsell app token — In Cart Upsell says the store token expires **Thu 2026-04-30** and upsell offers will pause if the app is not opened/refreshed in Shopify admin. Source: `sales` msg **6090**.
- **#14 · urgent · score 36.0** — Needs authenticated access, token refresh, or direct account/security check before progress.
  - Amazon FBA unfulfillable removal — Amazon created automated unfulfillable FBA removal order **gZRKfHwQJb**. Completion notice later arrived confirming the removal request completed successfully; no immediate action remains unless Ev wants to review Seller Central removal settings/address/frequency. Sources: `gluemasters` msgs **192161**, **192366**.
- **#30 · needs_ev · score 25.0** — Needs authenticated access, token refresh, or direct account/security check before progress.
  - **Amazon buyer message / Karaoke Machine Store** — Amazon buyer message is waiting in Seller Central for order **113-4386244-8272243**, ASIN **B0DFPG9PJN** Singing Machine Platinum Plus. Source: `gluemasters` msg **192280**.
- **#35 · in_progress · score 22.0** — Needs authenticated access, token refresh, or direct account/security check before progress.
  - Heartbeat git-hygiene check on 2026-05-02 surfaced surprise local MoneySamurai repo changes: `api/trigger-sync.js` modified, new `api/get-auth-token.js`, and branch ahead of origin by **21 commits**. Inspect before any deploy-ish action.
- **#45 · in_progress · score 14.0** — Needs authenticated access, token refresh, or direct account/security check before progress.
  - Latest manual cron pass on **2026-05-10 4:01 PM PT** successfully reset the MoneySamurai account sync state to **healthy**, cleared queued/running jobs to **failed**, and triggered a fresh full-category sync (`products`, `orders`, `inventory`, `financial`, `restock`).

## Passive / watch-only context
- **#4 · needs_ev · score 53.0** — Useful context, but likely not first-block execution work.
  - **Gemifly LLC** — PayPal invoice **1001-0243** remains unpaid; PayPal reminder on 2026-05-08 shows **$7,424.15 due on receipt** (earlier sent notice showed **$7,449.98**). Track for payment / reconcile amount if needed. Earlier open amount listed was **$1,513.23**, now superseded by the new larger invoice unless Ev says otherwise. Sources: `sales` msgs **6134**, **6172**.
- **#6 · urgent · score 48.0** — Useful context, but likely not first-block execution work.
  - Amazon account security check / Meta partner request — Amazon sent a password recovery notice tied to a reset attempt from **Chrome on macOS near Washington**. If this was not Ev, he should verify account security directly in Amazon, not through the email link. Facebook/Meta sent a Business Manager partner request from **“Join the Meta Agency Partner Program”**. Treat as suspicious unless Ev recognizes it; do not approve/share assets from email links. Source: `sales` msg **6141**. Sources: `gluemasters` msg **192139**, `sales` msg **6141**.
- **#11 · needs_ev · score 43.0** — Useful context, but likely not first-block execution work.
  - **Cute Things & Creative Concepts / Shohreh** — bulk quote is current; Shohreh asked whether they may sell Glue Masters products on **Amazon** after the $16,030.20 quote. Ev sent a reply on **2026-05-06** saying **no Amazon resale authorization**; wait for her response. Sources: `sales` msgs **6087**, **6100**, **6101**, **6149**.
- **#12 · urgent · score 42.0** — Useful context, but likely not first-block execution work.
  - Walmart Marketplace performance/pricing — Fresh Walmart performance snapshot shows **on-time delivery 83.3% vs 90% standard** and **late shipment 50% vs 5% standard**; valid tracking 100%, cancellations/negative feedback/returns/item-not-received all 0%. Fresh Walmart pricing digest shows **price competitiveness 46.15%** (+5.32% WoW), Buy Box win rate 100%, and top recommended price cuts: `20GRGELCAGM` **$8.99 → $6.99**, `24MLEPOXYGM2` **$14.99 → $7.99**. Treat as recommendations only; Ev should decide before price changes. New 2026-05-09 Walmart Partner Performance alert says **1 shipped order has a late origin scan** and needs carrier scan/tracking accuracy confirmed within **24 hours**; impacted-orders XLSX was referenced but not available in the local download path during the heartbeat check. Sources: `gluemasters` msgs **192323**, **192326**, **192443**.
- **#14 · urgent · score 36.0** — Useful context, but likely not first-block execution work.
  - Amazon FBA unfulfillable removal — Amazon created automated unfulfillable FBA removal order **gZRKfHwQJb**. Completion notice later arrived confirming the removal request completed successfully; no immediate action remains unless Ev wants to review Seller Central removal settings/address/frequency. Sources: `gluemasters` msgs **192161**, **192366**.
- **#17 · urgent · score 34.85** — Useful context, but likely not first-block execution work.
  - Amazon product safety / affiliate notices — Amazon flagged a **Thermos Stainless King food jar** order (**111-9829889-5064236**) with a stop-use / recall notice tied to a CPSC announcement. Amazon Associates/Influencer says account **redwaspnet-20** has been closed/rejected for over 3 years and a remaining **$114.30** balance will be forfeited after **7 days**; email says no action needed, but surface if Ev cares about recovering/appealing it. Source: `gluemasters` msg **192362**. Needs Ev review only if these personal/affiliate notices matter operationally; otherwise keep them low priority and do not let them crowd business-critical work. Sources: `gluemasters` msgs **192266**, **192362**.
- **#34 · needs_ev · score 23.0** — Useful context, but likely not first-block execution work.
  - **TikTok/Amazon influencer outreach** — low-priority vendor/influencer pitch surfaced late day; not urgent. Source msg **6066**.
- **#36 · needs_ev · score 21.0** — Useful context, but likely not first-block execution work.
  - **Starbond/Systemslab outreach** — David Jones says he tried to call about **Starbond** and asks for 5 minutes. Treat as low-priority vendor/competitive outreach unless Ev recognizes it. Source: `gluemasters` msg **192425**.
- **#37 · needs_ev · score 21.0** — Useful context, but likely not first-block execution work.
  - **Munera Capital / Josef Kozorezov** — acquisition-interest outreach asking whether we’d explore acquiring Glue Masters; added to MoneySamurai as stage `contacted`. Low-priority unless Ev wants to engage. Source: `sales` msg **6177**.
- **#38 · needs_ev · score 15.0** — Useful context, but likely not first-block execution work.
  - **Jeremy Embry / Aquarium Artisans** — Ev sent the pricing / “what do you want to do moving forward” reply on 2026-04-27; wait for Jeremy’s response before next action. Source thread: `sales` msg **6046**.
- **#48 · urgent · score 4.0** — Useful context, but likely not first-block execution work.
  - Trademark maintenance filing — pending USPTO acceptance — PCH filed the Combined Declaration of Use and Incontestability (Sections 8 & 15) for trademark reg **6216158 GLUE MASTERS**; USPTO filing receipt received 2026-05-01. Next step is passive monitoring for USPTO acceptance/Office action over the next 1–2 months; no Ev e-sign action remains unless PCH flags an irregularity. Sources: `gluemasters` msgs **192263**, **192271**.

## Past-dated active items
- **#1 · needs_ev · score 95.97** — Contains past-dated reference; may need rewrite, confirmation, or demotion. Refs: 2026-05-03, 2026-05-08.
  - **Louise Frogley** — order **#6055** delayed/stuck at label printed; Ev replied that USPS tracking might lag and asked her to report if not delivered. Louise followed up again on 2026-05-03 saying the product never arrived, she bought a replacement, and she wants a credit-card refund. Shopify opened a product-not-received chargeback for **$41.84 + $15.00 fee** and auto-submitted the response on 2026-05-08; bank decision may take up to 75 days. Sources: `sales` msgs **6088**, **6089**, **6098**, **6116**, **6122**, **6168**, **6170**.
- **#2 · needs_ev · score 64.05** — Contains past-dated reference; may need rewrite, confirmation, or demotion. Refs: 2026-05-07, 2026-05-09.
  - **Garcor / Kyle Lawson** — sent attached purchase order **PO4046132.pdf** and asked us to process it and confirm receipt. PayPal invoice **1001-0244** for **$1,806.00** was sent to `ap@garcor.com` on 2026-05-07 and PayPal sent a due-on-receipt reminder on 2026-05-09. Sources: `gluemasters` msg **192403**, `sales` msgs **6165**, **6178**.
- **#3 · urgent · score 60.18** — Contains past-dated reference; may need rewrite, confirmation, or demotion. Refs: 2026-04-30, 2026-04-25, 2026-04-30.
  - A3 Partners Gemiflex shipment / invoice — A3/Caroline forwarded UPS tracking **1Z43A99A0348588986** for **165 backordered Gemiflex units** to KNCH Law / Gabriel Majalca in Phoenix; ETA **Thu 2026-04-30 by 7 PM**. A3 invoice **26-04271** is due **2026-05-27** for **$501.25**. Caroline’s later past-due balance statement says A3 still shows **$6,597.07** open across older invoices **26-03263** (**$3,312.37**, due **2026-04-25**) and **26-03311** (**$3,284.70**, due **2026-04-30**). Treat that as supplier-side open-balance evidence; verify against bank/QuickBooks before asserting internal non-payment as fact. Sources: `gluemasters` msgs **192183**, **192184**, **191451**, **191683**, **192371**.
- **#4 · needs_ev · score 53.0** — Contains past-dated reference; may need rewrite, confirmation, or demotion. Refs: 2026-05-08.
  - **Gemifly LLC** — PayPal invoice **1001-0243** remains unpaid; PayPal reminder on 2026-05-08 shows **$7,424.15 due on receipt** (earlier sent notice showed **$7,449.98**). Track for payment / reconcile amount if needed. Earlier open amount listed was **$1,513.23**, now superseded by the new larger invoice unless Ev says otherwise. Sources: `sales` msgs **6134**, **6172**.
- **#8 · urgent · score 45.0** — Contains past-dated reference; may need rewrite, confirmation, or demotion. Refs: 2026-04-30.
  - ICU Shopify upsell app token — In Cart Upsell says the store token expires **Thu 2026-04-30** and upsell offers will pause if the app is not opened/refreshed in Shopify admin. Source: `sales` msg **6090**.
- **#11 · needs_ev · score 43.0** — Contains past-dated reference; may need rewrite, confirmation, or demotion. Refs: 2026-05-06.
  - **Cute Things & Creative Concepts / Shohreh** — bulk quote is current; Shohreh asked whether they may sell Glue Masters products on **Amazon** after the $16,030.20 quote. Ev sent a reply on **2026-05-06** saying **no Amazon resale authorization**; wait for her response. Sources: `sales` msgs **6087**, **6100**, **6101**, **6149**.
- **#27 · needs_ev · score 28.0** — Contains past-dated reference; may need rewrite, confirmation, or demotion. Refs: 2026-05-09, 2026-05-09.
  - **Deane Belk / Good Friends of Bryan County** — Shopify contact form asks to speak with someone about **Thick viscosity / no-drip CA glue** for nonprofit luncheon centerpieces; she followed up again on 2026-05-09 saying this is her second attempt and she needs assistance. On 2026-05-09 Ev requested a draft response; draft was provided but not sent by me. Sources: `sales` msgs **6105**, **6179**, **6180**.
- **#35 · in_progress · score 22.0** — Contains past-dated reference; may need rewrite, confirmation, or demotion. Refs: 2026-05-02.
  - Heartbeat git-hygiene check on 2026-05-02 surfaced surprise local MoneySamurai repo changes: `api/trigger-sync.js` modified, new `api/get-auth-token.js`, and branch ahead of origin by **21 commits**. Inspect before any deploy-ish action.
- **#38 · needs_ev · score 15.0** — Contains past-dated reference; may need rewrite, confirmation, or demotion. Refs: 2026-04-27.
  - **Jeremy Embry / Aquarium Artisans** — Ev sent the pricing / “what do you want to do moving forward” reply on 2026-04-27; wait for Jeremy’s response before next action. Source thread: `sales` msg **6046**.
- **#39 · in_progress · score 14.0** — Contains past-dated reference; may need rewrite, confirmation, or demotion. Refs: 2026-05-05.
  - B2B sample kits — Ev confirmed on **2026-05-05** that the boxes are done and kits are ready to be sent. Status: ready for outbound/send execution; do **not** list box production or kit assembly as blockers. Kit assets/collateral live under `gluemasters-bizdev/b2b-kit/`.
- **#45 · in_progress · score 14.0** — Contains past-dated reference; may need rewrite, confirmation, or demotion. Refs: 2026-05-10.
  - Latest manual cron pass on **2026-05-10 4:01 PM PT** successfully reset the MoneySamurai account sync state to **healthy**, cleared queued/running jobs to **failed**, and triggered a fresh full-category sync (`products`, `orders`, `inventory`, `financial`, `restock`).

## High-ranked but low-action items
- **#4 · needs_ev · score 53.0** — Surfaced high in the ranked board despite weak immediate action signal. Refs: 2026-05-08.
  - **Gemifly LLC** — PayPal invoice **1001-0243** remains unpaid; PayPal reminder on 2026-05-08 shows **$7,424.15 due on receipt** (earlier sent notice showed **$7,449.98**). Track for payment / reconcile amount if needed. Earlier open amount listed was **$1,513.23**, now superseded by the new larger invoice unless Ev says otherwise. Sources: `sales` msgs **6134**, **6172**.
- **#11 · needs_ev · score 43.0** — Surfaced high in the ranked board despite weak immediate action signal. Refs: 2026-05-06.
  - **Cute Things & Creative Concepts / Shohreh** — bulk quote is current; Shohreh asked whether they may sell Glue Masters products on **Amazon** after the $16,030.20 quote. Ev sent a reply on **2026-05-06** saying **no Amazon resale authorization**; wait for her response. Sources: `sales` msgs **6087**, **6100**, **6101**, **6149**.

## Urgent items missing source evidence
- **#5 · urgent · score 52.0** — Urgent item has no explicit message/source pointer.
  - Shopify API token — Current API access is dead; inventory visibility is degraded/blind. Needs token regeneration or browser/API workaround.

