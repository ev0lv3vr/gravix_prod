# Morning Delta Brief — 2026-04-29

Generated: 2026-04-28 23:05 PDT
Compared with: 2026-04-28

## Snapshot
- Open tasks: **33** (+1 vs previous)
- New items surfaced: **2**
- Items removed from board: **1**
- Rank movers: **0**
- Top 8 churn: **+1 / -1**

## Section deltas
- 🔴 Urgent: **-1**
- 🟡 Needs Ev: **0**
- 🔵 In Progress: **+1**
- 📋 Backlog: **+1**

## New since last board
- **#26** · 🔵 IN PROGRESS · Walmart Marketplace announced a 2026-06-01 API behavior change for GET /v3/inventories: sequential cursor pagination will be enforced, and parallel/out-of-order cursor requests will return 400. (~20m)
- **#33** · 📋 BACKLOG · Quick code sweep at midday 2026-04-28 did not find a live MoneySamurai Walmart inventory client or GET /v3/inventories usage in current api/, scripts/, or src/ code. Treat this as a watch item, not an active integration blocker, unless Walmart inventory sync code is added later. Source: sales msg 6080. (~30m)

## Dropped off / resolved
- **prev #7** · 🔴 URGENT · American Express account/payment follow-up — Past-due notice for account ending 271002 came in earlier. New Amex emails show a $1,000 payment received (msg 192107) but also a transaction declined due to past-due status shortly before/around processing (msg 192106). Fresh 2026-04-26 Amex notice says account ending 271002 is past due: $620 past due / $1,256 total due (msg 192157). Fresh 2026-04-25 Amex notice says an Electrify America $40 transaction declined because one or more accounts is past due; account shown as ending 794007 (msg 192151). A separate Amex statement-ready email also arrived for account ending 94007, payment due Tue May 19, 2026 (msg 192149). New 2026-04-26 Amex notice says the card enrolled for an Amex virtual card number has been suspended for account ending 94007; Chrome/Android virtual-card purchases may fail until Ev contacts Amex (msg 192165). Ev should verify the Amex balance/status directly in Amex, not through email links. Sources: gluemasters msgs 192094, 192106, 192107, 192149, 192151, 192157, 192165.

## Big rank moves
- None

## Top 8 new entrants
- **#8** · Shopify API token — Current API access is dead; inventory visibility is degraded/blind. Needs token regeneration or browser/API workaround. (~20m)

## Top 8 exits
- **prev #7** · American Express account/payment follow-up — Past-due notice for account ending 271002 came in earlier. New Amex emails show a $1,000 payment received (msg 192107) but also a transaction declined due to past-due status shortly before/around processing (msg 192106). Fresh 2026-04-26 Amex notice says account ending 271002 is past due: $620 past due / $1,256 total due (msg 192157). Fresh 2026-04-25 Amex notice says an Electrify America $40 transaction declined because one or more accounts is past due; account shown as ending 794007 (msg 192151). A separate Amex statement-ready email also arrived for account ending 94007, payment due Tue May 19, 2026 (msg 192149). New 2026-04-26 Amex notice says the card enrolled for an Amex virtual card number has been suspended for account ending 94007; Chrome/Android virtual-card purchases may fail until Ev contacts Amex (msg 192165). Ev should verify the Amex balance/status directly in Amex, not through email links. Sources: gluemasters msgs 192094, 192106, 192107, 192149, 192151, 192157, 192165.

## Recent memory context
- 2026-04-28.md: Amazon Ads daily pull for snapshot **2026-04-27** is valid/complete: campaigns **10**, keywords **102**, search terms **137**, no failed reports; **$116.50** spend / **$370.96** ad-attributed sales / **31.4% ACoS** / **3.18× ROAS**.
- 2026-04-28.md: No genuinely new blocker surfaced in this pass beyond the already-open Florida annual report deadline and the existing Ev-owned queue.
- 2026-04-28.md: Confirmed the two real changes that mattered most today were: **(1)** the Florida annual report / company renewal deadline now sitting at **2026-05-01** with a **$400** late-penalty risk if missed, and **(2)** the Amex situation materially improved by evening — payment processed and the virtual card reactivated, so the earlier Amex fire is resolved and should stay buried.
- 2026-04-27.md: Amazon Ads daily pull for snapshot **2026-04-26** is complete/valid: campaigns **10**, keywords **121**, search terms **410**, no failed reports; digest shows **$708.60** spend, **$2,152.91** sales, **69** orders, **32.9% ACoS**, **3.04× ROAS**.
- 2026-04-27.md: Gates: `python3 -m unittest tests/test_ads_daily_pull.py` passed; `npm run build` passed. `npm run lint` remains blocked by pre-existing repo-wide TS/ESLint debt unrelated to this patch; `npm test` and `npm run type-check` scripts are missing in package.json.
- 2026-04-27.md: Ev confirmed the Jeremy/Aquarium Artisans pricing / “what do you want to do moving forward” reply was sent. Moved Jeremy out of Needs Ev and into wait-for-response state in BUSINESS_STATE.md.
- 2026-04-26.md: Insurance audit, Shopify API token access, and Amazon FBA removal verification.
- 2026-04-26.md: Amazon Ads daily pull is healthy for yesterday’s snapshot **2026-04-25**: valid pull, campaigns **10**, keywords **120**, search terms **358**, no failed reports.
- 2026-04-26.md: Captured the day’s important new risk items into live state without resurfacing resolved noise: Amex past-due / declined-charge issues, Amex virtual-card suspension on **94007**, and Amazon’s automated FBA unfulfillable removal order **gZRKfHwQJb**.

## Current top 8
- **#1** · Insurance audit — Overdue; data reportedly ready around $637K. Ev must submit/handle final PDF. (~20m)
- **#2** · A3 Partners Gemiflex shipment / invoice — A3/Caroline forwarded UPS tracking 1Z43A99A0348588986 for 165 backordered Gemiflex units to KNCH Law / Gabriel Majalca in Phoenix; ETA Thu 2026-04-30 by 7 PM. A3 invoice 26-04271 is due 2026-05-27 for $501.25. Sources: gluemasters msgs 192183, 192184. (~25m)
- **#3** · Heather / Amazon — A-to-Z risk. Order 114-0636756-1872255. Source msg 191366. Draft exists at moneysamurai/drafts/b2b-email-drafts-2026-03-24.md. (~15m)
- **#4** · Walmart unshipped order — auto-cancel risk. (~25m)
- **#5** · Amazon refund / product-not-as-described — Amazon initiated a $36.83 refund for order 111-6918255-6449022 / ASIN B01CDPIIXK / SKU 8OZTHICKCAGM; reason Product not as described. Source: gluemasters msg 192188. (~7m)
- **#6** · Walmart Marketplace performance/pricing — Fresh Walmart performance snapshot shows on-time delivery 83.3% vs 90% standard; valid tracking 100%, cancellations/negative feedback/returns/item-not-received all 0%. Fresh Walmart pricing digest shows price competitiveness 38.75% and top recommended price cuts: 20GRGELCAGM $8.99 → $6.99, 24MLEPOXYGM2 $14.99 → $7.99. Treat as recommendations only; Ev should decide before price changes. Sources: gluemasters msgs 192175, 192177. (~18m)
- **#7** · Amazon account security check — Amazon sent a password recovery notice tied to a reset attempt from Chrome on macOS near Washington. If this was not Ev, he should verify account security directly in Amazon, not through the email link. Source: gluemasters msg 192139. (~18m)
- **#8** · Shopify API token — Current API access is dead; inventory visibility is degraded/blind. Needs token regeneration or browser/API workaround. (~20m)

