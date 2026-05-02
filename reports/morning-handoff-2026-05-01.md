# Morning Handoff — 2026-05-01

Generated: 2026-05-01 14:01 PDT
Source: morning execution board + ops debt + cron watchlist/trend

## Do first
1. R&R Fabrications shipment — first thing Apr 30 — Ev asked to be reminded first thing in the morning to create shipment for R&R Fabrications. PO: 30 bottles of 16oz Medium viscosity CA, ship to R&R Fabrications, 601 E Washington St, St Henry, OH 45883, provide UPS tracking once shipped. Source: `sales` msg 6086. PayPal invoice 1001-0242 for $1,289.70 was sent to `jeff@rrfabrications.com` morning 2026-04-30. Source: `sales` msg 6099. (~25m)
2. Insurance audit — Overdue; data reportedly ready around $637K. Ev must submit/handle final PDF. (~20m)
3. A3 Partners Gemiflex shipment / invoice — A3/Caroline forwarded UPS tracking 1Z43A99A0348588986 for 165 backordered Gemiflex units to KNCH Law / Gabriel Majalca in Phoenix; ETA Thu 2026-04-30 by 7 PM. A3 invoice 26-04271 is due 2026-05-27 for $501.25. Sources: `gluemasters` msgs 192183, 192184. (~25m)
4. Heather / Amazon — A-to-Z risk. Order 114-0636756-1872255. Source msg 191366. Draft exists at `moneysamurai/drafts/b2b-email-drafts-2026-03-24.md`. (~15m)
5. Trademark maintenance filing — pending USPTO acceptance — PCH filed the Combined Declaration of Use and Incontestability (Sections 8 & 15) for trademark reg 6216158 GLUE MASTERS; USPTO filing receipt received 2026-05-01. Next step is passive monitoring for USPTO acceptance/Office action over the next 1–2 months; no Ev e-sign action remains unless PCH flags an irregularity. Sources: `gluemasters` msgs 192263, 192271. (~18m)

## Needs Ev
- Insurance audit — Overdue; data reportedly ready around $637K. Ev must submit/handle final PDF.
- Heather / Amazon — A-to-Z risk. Order 114-0636756-1872255. Source msg 191366. Draft exists at `moneysamurai/drafts/b2b-email-drafts-2026-03-24.md`.
- Walmart unshipped order — auto-cancel risk.
- Fastenal supplier onboarding — Fastenal says Gluemasters is currently an unsupported transactional supplier and invited formal supplier onboarding via Smartsheet; corporate onboarding requires supplier self-assessment, onboarding request, and ACH form, reviewed in ~5–7 business days. Jerrad Lacey confirmed this is from corporate and “would be the pathway to follow.” Optional Level 3 supported/managed program would require MSA, rebate/early-pay/freight program, and EDI feeds. Sources: `gluemasters` msgs 192233, 192240, 192242.
- Gemifly LLC — $1,513.23 PayPal invoice outstanding.
- TikTok/Amazon influencer outreach — low-priority vendor/influencer pitch surfaced late day; not urgent. Source msg 6066.

## Customer risk
- A3 Partners Gemiflex shipment / invoice — A3/Caroline forwarded UPS tracking 1Z43A99A0348588986 for 165 backordered Gemiflex units to KNCH Law / Gabriel Majalca in Phoenix; ETA Thu 2026-04-30 by 7 PM. A3 invoice 26-04271 is due 2026-05-27 for $501.25. Sources: `gluemasters` msgs 192183, 192184.
- Heather / Amazon — A-to-Z risk. Order 114-0636756-1872255. Source msg 191366. Draft exists at `moneysamurai/drafts/b2b-email-drafts-2026-03-24.md`.
- Walmart unshipped order — auto-cancel risk.
- Amazon refund / product-not-as-described — Amazon initiated a $36.83 refund for order 111-6918255-6449022 / ASIN B01CDPIIXK / SKU 8OZTHICKCAGM; reason Product not as described. Source: `gluemasters` msg 192188.
- Walmart Marketplace performance/pricing — Fresh Walmart performance snapshot shows on-time delivery 83.3% vs 90% standard; valid tracking 100%, cancellations/negative feedback/returns/item-not-received all 0%. Fresh Walmart pricing digest shows price competitiveness 38.75% and top recommended price cuts: `20GRGELCAGM` $8.99 → $6.99, `24MLEPOXYGM2` $14.99 → $7.99. Treat as recommendations only; Ev should decide before price changes. Sources: `gluemasters` msgs 192175, 192177.
- Amazon FBA unfulfillable removal — Amazon created automated unfulfillable FBA removal order gZRKfHwQJb. Next automated removal may be created 2026-04-27 if unfulfillable inventory remains. Needs Seller Central verification if Ev wants to change removal settings/address/frequency. Source: `gluemasters` msg 192161.

## Unblock / verify
- Shopify API token — Current API access is dead; inventory visibility is degraded/blind. Needs token regeneration or browser/API workaround.
- ICU Shopify upsell app token — In Cart Upsell says the store token expires Thu 2026-04-30 and upsell offers will pause if the app is not opened/refreshed in Shopify admin. Source: `sales` msg 6090.
- Fastenal supplier onboarding — Fastenal says Gluemasters is currently an unsupported transactional supplier and invited formal supplier onboarding via Smartsheet; corporate onboarding requires supplier self-assessment, onboarding request, and ACH form, reviewed in ~5–7 business days. Jerrad Lacey confirmed this is from corporate and “would be the pathway to follow.” Optional Level 3 supported/managed program would require MSA, rebate/early-pay/freight program, and EDI feeds. Sources: `gluemasters` msgs 192233, 192240, 192242.
- Arka / Sean — replied to CO 80110 quote thread confirming they need a small-format super glue product for a packaged kit/application, not a specific viscosity target. Next step: quote closest standard fit or custom/private-label route. Source: `sales` msg 6112.
- Important correction: the pre-fix Amazon Ads “daily” digest was mislabeled. Its default pull was a 7-day rolling window ending on the snapshot date, so the earlier $708.60 spend / $2,152.91 ad-attributed sales / 69 orders for `2026-04-26` were not same-day April 26 sales and must not be compared to Seller Central same-day total sales. Seller Central showed $1,129.16 total sales including organic for Apr 26, confirming the label/logic was invalid. Fix applied 2026-04-27 in `moneysamurai@1a2f79a`: default pull is now same-day; multi-day pulls require `--rolling-7d` and are kept out of daily history; digest labels now say ad-attributed/window metrics explicitly. Correction pull completed 2026-04-27 at ~11:31 AM PT and overwrote the daily snapshot with true same-day data.
- Timeout watchlist: 1 critical, 1 medium, 3 ready timeout patches.
- Verify ads-daily-pull after the 3600s bump; latest observed run hit 1800057 ms on a 1800s timeout.
- Trend: 1 regressing, 1 improving, 0 newly surfaced risks across 3 saved days.
- Ops debt exposure: $1,715.54 open, $0/day true burn, $0 30-day burn exposure.

## Copy/paste starter
Morning stack for 2026-05-01:
- [ ] R&R Fabrications shipment — first thing Apr 30 — Ev asked to be reminded first thing in the morning to create shipment for R&R Fabrications. PO: 30 bottles of 16oz Medium viscosity CA, ship to R&R Fabrications, 601 E Washington St, St Henry, OH 45883, provide UPS tracking once shipped. Source: `sales` msg 6086. PayPal invoice 1001-0242 for $1,289.70 was sent to `jeff@rrfabrications.com` morning 2026-04-30. Source: `sales` msg 6099.
- [ ] Insurance audit — Overdue; data reportedly ready around $637K. Ev must submit/handle final PDF.
- [ ] A3 Partners Gemiflex shipment / invoice — A3/Caroline forwarded UPS tracking 1Z43A99A0348588986 for 165 backordered Gemiflex units to KNCH Law / Gabriel Majalca in Phoenix; ETA Thu 2026-04-30 by 7 PM. A3 invoice 26-04271 is due 2026-05-27 for $501.25. Sources: `gluemasters` msgs 192183, 192184.
- [ ] Heather / Amazon — A-to-Z risk. Order 114-0636756-1872255. Source msg 191366. Draft exists at `moneysamurai/drafts/b2b-email-drafts-2026-03-24.md`.
- [ ] Trademark maintenance filing — pending USPTO acceptance — PCH filed the Combined Declaration of Use and Incontestability (Sections 8 & 15) for trademark reg 6216158 GLUE MASTERS; USPTO filing receipt received 2026-05-01. Next step is passive monitoring for USPTO acceptance/Office action over the next 1–2 months; no Ev e-sign action remains unless PCH flags an irregularity. Sources: `gluemasters` msgs 192263, 192271.

