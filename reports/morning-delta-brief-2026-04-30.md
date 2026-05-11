# Morning Delta Brief — 2026-04-30

Generated: 2026-04-29 23:03 PDT
Compared with: 2026-04-29

## Snapshot
- Open tasks: **40** (+7 vs previous)
- New items surfaced: **7**
- Items removed from board: **0**
- Rank movers: **20**
- Top 8 churn: **+0 / -0**

## Section deltas
- 🔴 Urgent: **+3**
- 🟡 Needs Ev: **+3**
- 🔵 In Progress: **+1**
- 📋 Backlog: **0**

## New since last board
- **#9** · 🔴 URGENT · ICU Shopify upsell app token — In Cart Upsell says the store token expires Thu 2026-04-30 and upsell offers will pause if the app is not opened/refreshed in Shopify admin. Source: sales msg 6090. (~20m)
- **#10** · 🔴 URGENT · R&R Fabrications shipment — first thing Apr 30 — Ev asked to be reminded first thing in the morning to create shipment for R&R Fabrications. PO: 30 bottles of 16oz Medium viscosity CA, ship to R&R Fabrications, 601 E Washington St, St Henry, OH 45883, provide UPS tracking once shipped. Source: sales msg 6086. (~25m)
- **#11** · 🔴 URGENT · Fastenal supplier onboarding — Fastenal says Gluemasters is currently an unsupported transactional supplier and invited formal supplier onboarding via Smartsheet; corporate onboarding requires supplier self-assessment, onboarding request, and ACH form, reviewed in ~5–7 business days. Jerrad Lacey confirmed this is from corporate and “would be the pathway to follow.” Optional Level 3 supported/managed program would require MSA, rebate/early-pay/freight program, and EDI feeds. Sources: gluemasters msgs 192233, 192240, 192242. (~18m)
- **#17** · 🟡 NEEDS EV · The Escape Game — Shopify contact form asks for a receipt for a $229.95 transaction authorized/cleared 2026-04-27. Ev said there is only one order; reply sent 2026-04-29 asking them to confirm the exact glue/product, specifically whether it was 8oz Thin viscosity CA glue. Await customer confirmation, then resend receipt. Source: sales msg 6091. (~8m)
- **#19** · 🟡 NEEDS EV · Cute Things & Creative Concepts / Shohreh — bulk quote request for 200× 2oz CA, 100× 2oz Thin, 100× 8oz Thick, 100× 2oz Medium. Ev requested immediate pricing with free freight; draft quote prepared with 8oz at $20.29/unit and total $5,105. Source: sales msg 6087. (~15m)
- **#24** · 🟡 NEEDS EV · Louise Frogley — order #6055 delayed/stuck at label printed; Ev replied that he was checking and would update shortly. Needs tracking/shipping status follow-up. Source: sales msgs 6088, 6089. (~25m)
- **#37** · 🔵 IN PROGRESS · Nightly 2026-04-29 improvement: the morning ops pack/hub now includes freshness/trust signals (FRESH / AGING / STALE, newest source edit time, build lag, and source timestamps for loaded journals/state files) via scripts/kanban_morning_builder.py + scripts/ops_build.py, so morning review can quickly tell whether the pack is current before acting. (~20m)

## Dropped off / resolved
- None

## Big rank moves
- **#38** from #31 (-7) · Amazon PPC — Tracked state: 11 campaigns, ~$773/day spend, 2.42× ROAS, 41% ACoS. Late-day 2-month PPC review: growth is working, but account profitability is still loose; best current wins are 8oz Thick Auto, 8oz Medium Auto, and CA Glue Core Exact, while 2oz Thick Auto, conquest, and defense need tightening. Backlog: wire flywheel data into MoneySamurai PPC frontend; bias next optimization pass toward cutting waste in 2oz Thick Auto / conquest / defense and scaling the stronger exact/discovery winners more carefully.
- **#39** from #32 (-7) · Shopify / marketplace backlog — Back-in-stock notification app. Refund policy links to gravixadhesives.com. Google Search Console sitemap submission. Opinew review import verification: 1,183 reviews. Bundle offers. Oversold inventory watch: Gel 20g (-6), Thick 2oz (-1).
- **#40** from #33 (-7) · Quick code sweep at midday 2026-04-28 did not find a live MoneySamurai Walmart inventory client or GET /v3/inventories usage in current api/, scripts/, or src/ code. Treat this as a watch item, not an active integration blocker, unless Walmart inventory sync code is added later. Source: sales msg 6080.
- **#25** from #19 (-6) · Jeremy Embry / Aquarium Artisans — Ev sent the pricing / “what do you want to do moving forward” reply on 2026-04-27; wait for Jeremy’s response before next action. Source thread: sales msg 6046.
- **#26** from #20 (-6) · Dynasty Global / Eli — dealer inquiry; needs Ev decision.
- **#27** from #21 (-6) · Ethan Miller — order #5786, 4× Thick 16oz replacement not created at ShipBob.
- **#28** from #22 (-6) · KMS LLC / Brittni — wholesale distributor inquiry stale.
- **#29** from #23 (-6) · Christopher Webber — B2B inquiry stale.
- **#30** from #24 (-6) · Important correction: the pre-fix Amazon Ads “daily” digest was mislabeled. Its default pull was a 7-day rolling window ending on the snapshot date, so the earlier $708.60 spend / $2,152.91 ad-attributed sales / 69 orders for 2026-04-26 were not same-day April 26 sales and must not be compared to Seller Central same-day total sales. Seller Central showed $1,129.16 total sales including organic for Apr 26, confirming the label/logic was invalid. Fix applied 2026-04-27 in moneysamurai@1a2f79a: default pull is now same-day; multi-day pulls require --rolling-7d and are kept out of daily history; digest labels now say ad-attributed/window metrics explicitly. Correction pull completed 2026-04-27 at ~11:31 AM PT and overwrote the daily snapshot with true same-day data.
- **#31** from #25 (-6) · Pump Accelerator 8oz — Supplier: Xtralok, Chicago. UPC: 199874971148. Model: ACC0201. Target price: $14.99. Designer: Designcoffers/Fiverr; revisions in progress. Files: gluemasters-bizdev/labels/pump-accelerator-8oz/.
- **#32** from #26 (-6) · Walmart Marketplace announced a 2026-06-01 API behavior change for GET /v3/inventories: sequential cursor pagination will be enforced, and parallel/out-of-order cursor requests will return 400.
- **#20** from #15 (-5) · Eric Patrick — asked how to open 8oz bottle. Draft exists at moneysamurai/drafts/customer-replies-2026-04-09.md; source msg 5941.

## Top 8 new entrants
- None

## Top 8 exits
- None

## Recent memory context
- 2026-04-29.md: No new blocker surfaced from this pass. Live urgent items remain the already-open queue: Shopify token access, ICU upsell token expiring **2026-04-30**, insurance audit, and customer/B2B follow-up items already captured in `BUSINESS_STATE.md`.
- 2026-04-29.md: **Insurance audit** still needs Ev’s final PDF handling.
- 2026-04-29.md: Customer/B2B queue still needs movement on **Heather / Amazon**, **Jeff Davis / R&R**, **The Escape Game receipt**, **Louise Frogley shipping follow-up**, and the bulk-quote/order threads already listed in `BUSINESS_STATE.md`.
- 2026-04-29.md: Amazon Ads needs a business review tomorrow for the **spend collapse / weak ROAS** signal, even though the automation itself is healthy.
- 2026-04-28.md: Amazon Ads daily pull for snapshot **2026-04-27** is valid/complete: campaigns **10**, keywords **102**, search terms **137**, no failed reports; **$116.50** spend / **$370.96** ad-attributed sales / **31.4% ACoS** / **3.18× ROAS**.
- 2026-04-28.md: No genuinely new blocker surfaced in this pass beyond the already-open Florida annual report deadline and the existing Ev-owned queue.
- 2026-04-28.md: Confirmed the two real changes that mattered most today were: **(1)** the Florida annual report / company renewal deadline now sitting at **2026-05-01** with a **$400** late-penalty risk if missed, and **(2)** the Amex situation materially improved by evening — payment processed and the virtual card reactivated, so the earlier Amex fire is resolved and should stay buried.
- 2026-04-27.md: Amazon Ads daily pull for snapshot **2026-04-26** is complete/valid: campaigns **10**, keywords **121**, search terms **410**, no failed reports; digest shows **$708.60** spend, **$2,152.91** sales, **69** orders, **32.9% ACoS**, **3.04× ROAS**.
- 2026-04-27.md: Gates: `python3 -m unittest tests/test_ads_daily_pull.py` passed; `npm run build` passed. `npm run lint` remains blocked by pre-existing repo-wide TS/ESLint debt unrelated to this patch; `npm test` and `npm run type-check` scripts are missing in package.json.
- 2026-04-27.md: Ev confirmed the Jeremy/Aquarium Artisans pricing / “what do you want to do moving forward” reply was sent. Moved Jeremy out of Needs Ev and into wait-for-response state in BUSINESS_STATE.md.

## Current top 8
- **#1** · Insurance audit — Overdue; data reportedly ready around $637K. Ev must submit/handle final PDF. (~20m)
- **#2** · A3 Partners Gemiflex shipment / invoice — A3/Caroline forwarded UPS tracking 1Z43A99A0348588986 for 165 backordered Gemiflex units to KNCH Law / Gabriel Majalca in Phoenix; ETA Thu 2026-04-30 by 7 PM. A3 invoice 26-04271 is due 2026-05-27 for $501.25. Sources: gluemasters msgs 192183, 192184. (~25m)
- **#3** · Heather / Amazon — A-to-Z risk. Order 114-0636756-1872255. Source msg 191366. Draft exists at moneysamurai/drafts/b2b-email-drafts-2026-03-24.md. (~15m)
- **#4** · Walmart unshipped order — auto-cancel risk. (~25m)
- **#5** · Amazon refund / product-not-as-described — Amazon initiated a $36.83 refund for order 111-6918255-6449022 / ASIN B01CDPIIXK / SKU 8OZTHICKCAGM; reason Product not as described. Source: gluemasters msg 192188. (~7m)
- **#6** · Walmart Marketplace performance/pricing — Fresh Walmart performance snapshot shows on-time delivery 83.3% vs 90% standard; valid tracking 100%, cancellations/negative feedback/returns/item-not-received all 0%. Fresh Walmart pricing digest shows price competitiveness 38.75% and top recommended price cuts: 20GRGELCAGM $8.99 → $6.99, 24MLEPOXYGM2 $14.99 → $7.99. Treat as recommendations only; Ev should decide before price changes. Sources: gluemasters msgs 192175, 192177. (~18m)
- **#7** · Amazon account security check — Amazon sent a password recovery notice tied to a reset attempt from Chrome on macOS near Washington. If this was not Ev, he should verify account security directly in Amazon, not through the email link. Source: gluemasters msg 192139. (~18m)
- **#8** · Shopify API token — Current API access is dead; inventory visibility is degraded/blind. Needs token regeneration or browser/API workaround. (~20m)

