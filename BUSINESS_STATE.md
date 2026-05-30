# BUSINESS_STATE.md — Active Business State

Last updated: 2026-05-29 6:00 PM PT

This replaces `KANBAN.md`. `KANBAN.md` is retired and must not be used as an active source of truth.

## 🔴 Needs Ev / time-sensitive

### QuickBooks bank connection expired
- QuickBooks Online says a bank/financial-institution connection expired and recent transactions cannot be displayed until an authorized account holder reauthorizes it in **Accounting > Bank transactions**.
- After reconnecting, QuickBooks should attempt to download missed transactions.
- Source: `gluemasters` msg **192589**.

### 2025 tax filing deadline / MIAccounting
- MIAccounting sent a reminder for clients who have not yet filed 2025 tax returns: with extensions, **S-Corp / Partnership deadline is 2026-09-15** and **C-Corp / personal deadline is 2026-10-15**.
- They recommend submitting tax information May-August to avoid deadline backlog.
- Needs Ev review only if 2025 Gluemasters/company/personal filings are not already complete.
- Source: `gluemasters` msg **192681**.

### Amex foreign transaction alert — Supabase
- American Express sent a foreign-transaction alert for account ending **794007**: **SUPABASE**, Singapore SGP, **$44.22**, dated **2026-05-17**.
- This may be a normal Supabase platform charge, but Ev should verify in Amex if it is not recognized.
- Source: `gluemasters` msg **192605**.

### Amex ANA / Membership Rewards alerts
- American Express sent a foreign-transaction alert for **ANA All Nippon Airways**, **Japan**, **¥893,830**, dated **2026-05-20**, on account ending **794007**; a matching large-purchase alert references account ending **94007**.
- American Express also confirmed **24,770 Membership Rewards points** redeemed for a **$148.62** statement credit on account ending **94007**.
- Treat as expected travel/rewards activity only if Ev recognizes it; otherwise verify directly in Amex.
- Sources: `gluemasters` msgs **192686**, **192687**, **192688**.

### Travel bookings / Amex alerts
- Agoda booking **1005553226** confirmed for **Cross Hotel Kyoto**, check-in **2026-07-14**, check-out **2026-07-19**, 1 room / 3 adults, paid **$1,190.86** on card ending **4007**; cancellation policy says **non-refundable from 2026-05-21 05:19 Kyoto time**. Matching Amex large-purchase alert for **AGODA COMPANY PTELTD $1,190.86** on account ending **94007**.
- Agoda booking **1005557122** confirmed for **MIMARU Tokyo Shinjuku West**, check-in **2026-07-10**, check-out **2026-07-14**, 1 room / 3 adults, total **$2,215.45**, automatic charge scheduled **2026-06-29**, card ending **4007**; free cancellation before **2026-07-01**.
- teamLab Planets TOKYO ticket purchase completed for **2026-07-12 09:00-09:30 JST**, total **¥10,200**; matching Amex foreign-transaction alert on account ending **794007**.
- Treat as expected travel planning unless Ev does not recognize any booking/charge.
- Sources: `gluemasters` msgs **192691**, **192692**, **192693**, **192697**, **192698**.

### Amex card-not-present alert — Electrify America
- American Express sent a card-not-present alert for **ELECTRIFY AMERICA**, **$40.00**, dated **2026-05-20**, on account ending **794007**.
- American Express sent another card-not-present alert for **ELECTRIFY AMERICA**, **$40.00**, dated **2026-05-27**, on account ending **794007**.
- Treat as expected EV charging/preauth only if Ev recognizes it.
- Sources: `gluemasters` msgs **192683**, **192864**.

### Amex card-not-present alert — Raised By Society
- American Express sent a card-not-present alert for **RAISED BY SOCIETY**, **$89.00**, dated **2026-05-23**, on account ending **794007**.
- Treat as expected personal/apparel spend only if Ev recognizes it; otherwise verify directly in Amex.
- Source: `gluemasters` msg **192758**.

### Evolve Bank digital payment — account closure
- Evolve Bank & Trust / Checkbook sent a digital payment for **$14.67** with remittance info **Account Closure**.
- Needs Ev deposit/review if this account-closure payment is expected.
- Source: `gluemasters` msg **192670**.

### Bank of America scheduled transfer — Barristo Enterprises
- Bank of America says funds transfer request **614560288** was scheduled on **2026-05-27** as a next-day transfer of **$26,392.00** to **Barristo Enterprises Inc.**, with a **$5.00** fee.
- Treat as expected only if Ev recognizes the transfer; otherwise verify directly in Bank of America.
- Source: 2026-05-27 persisted session alert at **14:36 PT**.

### PayPal CAD payment — CONCEPT-PET
- PayPal receipt says Glue Masters sent **$300.00 CAD** to **CONCEPT-PET** on **2026-05-28**, paid from PayPal balance as **$226.91 USD**, transaction **1L278286X78311449**.
- Treat as expected supplier/personal payment only if Ev recognizes it; otherwise verify directly in PayPal.
- Source: `sales` msg **6323**.

### Amazon account security check / Meta partner request
- Amazon sent a password recovery notice tied to a reset attempt from **Chrome on macOS near Washington**.
- If this was not Ev, he should verify account security directly in Amazon, not through the email link.
- Facebook/Meta sent a Business Manager partner request from **“Join the Meta Agency Partner Program”**. Treat as suspicious unless Ev recognizes it; do not approve/share assets from email links. Source: `sales` msg **6141**.
- Sources: `gluemasters` msg **192139**, `sales` msg **6141**.

### Shopify API token
- Current API access is dead; inventory visibility is degraded/blind.
- Needs token regeneration or browser/API workaround.

### Buy with Prime compliance notice
- Amazon Buy with Prime opened case **20290685991** on 2026-05-13 saying Gluemasters may be non-compliant because two active Buy with Prime integrations are displaying and the Buy with Prime collection/product tiles show an **Add to Cart** CTA that may block the widget/checkout experience.
- URLs flagged: `https://gluemasters.com/collections/buy-with-prime/products/ca-glue-gel-20g` and `https://gluemasters.com/collections/buy-with-prime`.
- Requested fix within **30 calendar days**: keep only one Buy with Prime integration active and either implement Collections for Buy with Prime or remove the incorrect CTA. Risk is Buy with Prime suspension if not corrected.
- Source: `gluemasters` msg **192533**.

### Insurance midterm sales/product check
- Ashlin Hadden Insurance asked whether Gluemasters is still on schedule for estimated **$900k** annual sales and whether any products have been added/discontinued. If sales/product mix has changed materially, Ev should reply so coverage can be adjusted; otherwise no policy adjustment is needed until renewal.
- Claire followed up again on 2026-05-18 asking Ev to confirm whether business/products/sales pace have changed.
- Sources: `gluemasters` msgs **192475**, **192631**.

### ICU Shopify upsell app token
- In Cart Upsell says the store token expires **Thu 2026-04-30** and upsell offers will pause if the app is not opened/refreshed in Shopify admin.
- Fresh 2026-05-27 morning sales alert says the Shopify upsell token is expired again and offers may turn off unless someone opens/refreshes the ICU app in Shopify Admin.
- Sources: `sales` msg **6090**; 2026-05-27 persisted session alert.

### Fastenal supplier onboarding
- Fastenal says Gluemasters is currently an unsupported transactional supplier and invited formal supplier onboarding via Smartsheet; corporate onboarding requires supplier self-assessment, onboarding request, and ACH form, reviewed in ~5–7 business days.
- Jerrad Lacey confirmed this is from corporate and “would be the pathway to follow.”
- Optional Level 3 supported/managed program would require MSA, rebate/early-pay/freight program, and EDI feeds.
- Sources: `gluemasters` msgs **192233**, **192240**, **192242**.

### Trademark maintenance filing — pending USPTO acceptance
- PCH filed the Combined Declaration of Use and Incontestability (Sections 8 & 15) for trademark reg **6216158 GLUE MASTERS**; USPTO filing receipt received 2026-05-01.
- Next step is passive monitoring for USPTO acceptance/Office action over the next 1–2 months; no Ev e-sign action remains unless PCH flags an irregularity.
- Sources: `gluemasters` msgs **192263**, **192271**.

### Amazon FBA unfulfillable removal
- Amazon created automated unfulfillable FBA removal order **gZRKfHwQJb**.
- Completion notice later arrived confirming the removal request completed successfully; no immediate action remains unless Ev wants to review Seller Central removal settings/address/frequency.
- Amazon created a new automated unfulfillable FBA removal order **Fi3io7csW4** on **2026-05-25**. The next automated removal is scheduled for **2026-05-26** if more unfulfillable inventory exists.
- Amazon created a new automated unfulfillable FBA removal order **Da7RqF+4Mp** on **2026-05-26**. The next automated removal is scheduled for **2026-05-27** if more unfulfillable inventory exists.
- Amazon created a new automated unfulfillable FBA removal order **1OLLCT1wj/** on **2026-05-27**. The next automated removal is scheduled for **2026-05-28** if more unfulfillable inventory exists.
- Sources: `gluemasters` msgs **192161**, **192366**, **192789**, **192815**; 2026-05-27 persisted session alert.

### Amazon FBA capacity limits
- Amazon confirmed June FBA capacity limits: **262.18 cu ft standard-size**, **950.00 cu ft oversize**, **160.00 cu ft extra-large**, **100.00 cu ft apparel**, and **200.00 cu ft footwear**; Capacity Manager allocation is **0.00**.
- Current usage as of **2026-05-27** is low: **12.32 cu ft standard-size** excluding and including open shipments; all other storage types are **0.00**.
- No capacity pressure is visible right now; request more only if a large inbound shipment is planned.
- Source: `gluemasters` msg **192894**.

### Walmart Marketplace performance/pricing
- Fresh Walmart performance snapshot shows **on-time delivery 100% vs 90% standard**, but **valid tracking 87.5% vs 99% standard** and **late shipment 25% vs 5% standard**; cancellations/negative feedback/returns/item-not-received all 0%.
- Fresh Walmart pricing digest shows **price competitiveness 47.83%** (+8.1% WoW), Buy Box win rate 100%, and top recommended price cuts remain `20GRGELCAGM` **$8.99 → $6.99** and `24MLEPOXYGM2` **$14.99 → $7.99**. Treat as recommendations only; Ev should decide before price changes.
- Walmart WFS says a new long-term storage fee of **$7.50/cu ft/month** starts **2026-06-30** for inventory stored over **450 days**; Walmart says **290 units** are already 450+ days old. Review aged inventory/removal options in Seller Center if WFS inventory is active.
- Walmart sent a customer cancellation request for order **129114275520845** on **2026-05-21**; Seller Center needs the order cancelled if it has not already been handled.
- Walmart Partner Performance sent a fresh **2026-05-22** auto-cancellation warning: **1 order is past expected ship date** and needs valid tracking uploaded today or proactive cancellation. The email references an impacted-orders XLSX, but the attachment was not present at the local download path during the heartbeat check; inspect Seller Center unshipped orders to identify/clear it.
- Walmart Partner Performance sent a fresh **2026-05-25** late-origin-scan warning: **2 Walmart orders have late origin scans** and need carrier contact/tracking accuracy confirmation within **24 hours**.
- Prior Walmart late-origin-scan alert said **1 shipped order has a late origin scan** and needs carrier scan/tracking accuracy confirmed within **24 hours**; impacted-orders XLSX was referenced but not available in the local download path during the heartbeat check.
- The prior PO-specific Walmart auto-cancel item was marked done/out on 2026-05-19; do not resurface PO **119113590713297** unless Walmart sends a fresh alert.
- Sources: `gluemasters` msgs **192323**, **192326**, **192443**, **192619**, **192624**, **192719**, **192730**, **192779**.

### Prime Day inbound inventory cutoffs
- Amazon Freight / Ryan Anderson reminded that the first Prime Day inventory cutoff is **2026-05-27** for AWD and FBA **Minimal Shipment Splits** arrivals, and **2026-06-05** for FBA **Amazon-Optimized Shipment Splits** arrivals. Inventory arriving after those windows will not be eligible for Prime Day deals.
- Needs Ev/logistics review only if any Prime Day-bound inbound shipment is still pending.
- Source: `gluemasters` msg **192717**.

### A3 Partners Gemiflex shipment / invoice
- A3/Caroline forwarded UPS tracking **1Z43A99A0348588986** for **165 backordered Gemiflex units** to KNCH Law / Gabriel Majalca in Phoenix; ETA **Thu 2026-04-30 by 7 PM**.
- A3/Joe forwarded a UPS delivery confirmation for tracking **1Z43A99A0347067700**: delivered **2026-05-20 12:27 PM**, ship-to **David Christensen**, Mesa AZ, **28 lb**, references **PO#29** and **BH**.
- A3/Caroline forwarded UPS tracking **1Z43A99A0347220365** for the remaining **1,260 Gemiflex units** on **PO#29**, ship-to **David Christensen**, Mesa AZ, **4 packages / 142 lb**, UPS Ground, estimated delivery **2026-05-30 by 7 PM**.
- A3 invoice **26-04271** is due **2026-05-27** for **$501.25**.
- A3 sent new invoice **26-05151** for **$732.63**, due **2026-06-14**.
- A3 sent invoice **26-05272** for **$3,825.79**, due **2026-06-26**.
- Caroline’s later past-due balance statement says A3 still shows **$6,597.07** open across older invoices **26-03263** (**$3,312.37**, due **2026-04-25**) and **26-03311** (**$3,284.70**, due **2026-04-30**). Treat that as supplier-side open-balance evidence; verify against bank/QuickBooks before asserting internal non-payment as fact.
- Sources: `gluemasters` msgs **192183**, **192184**, **191451**, **191683**, **192371**, **192632**, **192701**, **192888**, **192889**.

### Shipux sales order SO14531
- Ev requested an urgent shipping update for Shipux sales order **SO14531 - 001034** because it had no shipping update since **2026-05-08** and a customer is waiting for tracking.
- Shipux / Tomas replied on 2026-05-19 that it **has shipped**; Odoo sales order notice shows UPS tracking **1ZYV02810391168524**.
- Shipux invoice **INV/2026/05/001308** for **$36.92** is due **2026-05-19** for SO14531.
- Next step: update the waiting customer with tracking and verify/pay the Shipux invoice if not already handled.
- Sources: `gluemasters` msgs **192543**, **192545**, **192666**, **192667**, **192668**.

### Amazon refunds
- Amazon initiated a **$15.21** refund for order **111-7692391-0638603** / ASIN **B01MDNS8QB** / SKU **GM2M** / item **2oz Medium**; reason **Customer Return**. Source: `gluemasters` msg **192357**.
- Amazon initiated a **$38.15** refund for order **114-0455907-8694635** / ASIN **B01LZUN030** / SKU **8OZMED**; reason **Shipping Address Undeliverable**. Source: `gluemasters` msg **192328**.
- Amazon initiated a **$36.83** refund for order **111-6918255-6449022** / ASIN **B01CDPIIXK** / SKU **8OZTHICKCAGM**; reason **Product not as described**. Source: `gluemasters` msg **192188**.
- Amazon initiated a **$15.21** refund for order **112-8576738-1861063** to **Gregory I Boldrey** / ASIN **B01M8JT9LI** / SKU **GM2TH** / item **2oz Thin**; reason **Shipping Address Undeliverable**. Source: `gluemasters` msg **192438**.
- Amazon initiated a **$15.14** refund for order **111-3032772-6512258** to **Caroline M. Lerner** / ASIN **B01MDNS8QB** / SKU **GM2M** / item **2oz Medium**; reason **Shipping Address Undeliverable**. Source: `gluemasters` msg **192559**.
- Amazon initiated a **$73.80** refund for order **113-4123533-5785839** to **Richard W Sewell** / ASIN **B00WHEM0UA** / SKU **2OZTHICKCAGM** / **5× 2oz Thick**; reason **Customer Return**. Source: `gluemasters` msg **192628**.
- Amazon initiated a **$15.00** refund for order **114-1453287-1830630** to **Brad Peebles** / ASIN **B00WHEM0UA** / SKU **2OZTHICKCAGM** / **2oz Thick**; reason **Customer Return**. Source: `gluemasters` msg **192733**.

### Amazon product safety / affiliate notices
- Amazon flagged a **Thermos Stainless King food jar** order (**111-9829889-5064236**) with a stop-use / recall notice tied to a CPSC announcement.
- Amazon Associates/Influencer says account **redwaspnet-20** has been closed/rejected for over 3 years and a remaining **$114.30** balance will be forfeited after **7 days**; email says no action needed, but surface if Ev cares about recovering/appealing it. Source: `gluemasters` msg **192362**.
- Needs Ev review only if these personal/affiliate notices matter operationally; otherwise keep them low priority and do not let them crowd business-critical work.
- Sources: `gluemasters` msgs **192266**, **192362**.

## 🟡 Customer / B2B follow-up queue

- **Heather / Amazon** — A-to-Z risk. Order **114-0636756-1872255**. Source msg **191366**. Draft exists at `moneysamurai/drafts/b2b-email-drafts-2026-03-24.md`.
- **Eric Patrick** — asked how to open 8oz bottle. Draft exists at `moneysamurai/drafts/customer-replies-2026-04-09.md`; source msg **5941**.
- **Antonio Gutierrez** — order **#6000**, asks if shipped + ship date. Draft exists, needs shipping fields; source msg **5930**.
- **Michael Nasholm** — 20% partial refund was promised but not done; customer followed up.
- **Sam Tillery** — says package has not arrived; subject actionable even though email body is blank. Source msg **6061**.
- **Chris Kendall / KittyWand order #6127** — Ev/Glue Masters replied with delay explanation and UniUni tracking **UUS65U2760832927577**; Chris replied "No problem, thank you for the update." Treat as cooled unless carrier scan/order follow-up reopens it. Sources: `sales` msgs **6316**, **6317**.
- **MarcoRocks / Joseph Caparatta** — owner says they have recommended Glue Masters for joining reef-aquarium rocks and wants to discuss a reef-space co-branding opportunity. Ev sent Joseph a proposal on **2026-05-29** after their call: **8oz Thin** as the co-branded bottle with "Powered by Glue Masters" mark, wholesale pricing tiered by volume, and rebate-based step-down pricing. Joseph replied that it looks good and he will review over the weekend, then come back next week with questions. Contact: `joe@marcorocks.com`, **917-757-9744**. Sources: `sales` msgs **6313**, **6320**, **6321**, **6322**; `gluemasters` msgs **192881**, **192890**, **192892**, **192912**.
- **Accurate Graphics / Javier Baeza** — new B2B production trial request for rubber-to-wood bonding, tight/hairline wicking gap, instant fixture under 10 sec, current adhesive **f-bond H-1 Adhesive**, problems with cure/bond/cost/shelf life, estimated **10-50 bottles/month**. Bottle size unknown. Contact: `jbaeza@accurategraphix.com`, **678-801-0175**. Shipping/address context: **6994 Rogers Lake Rd, Lithonia, GA 30058**. Needs product recommendation/sample/quote path. Source: `sales` msg **6328**.
- **Louise Frogley** — order **#6055** delayed/stuck at label printed; Ev replied that USPS tracking might lag and asked her to report if not delivered. Louise followed up again on 2026-05-03 saying the product never arrived, she bought a replacement, and she wants a credit-card refund. Shopify opened a product-not-received chargeback for **$41.84 + $15.00 fee** and auto-submitted the response on 2026-05-08; bank decision may take up to 75 days. Sources: `sales` msgs **6088**, **6089**, **6098**, **6116**, **6122**, **6168**, **6170**.
- **Deane Belk / Good Friends of Bryan County fill-volume complaint** — fresh 2026-05-21 thread reopened after prior reorder path: Deane says the replacement Thick 16oz bottles arrived late vs expected 2-day air and initially appeared underfilled. Ev replied with the net-weight vs fluid-volume explanation and batch weight check. Deane later opened the third bottle, got **7 bottles to the 2 oz mark plus 1-2 squeezes into an 8th**, apologized, and said they will likely place a second order in a few weeks. Treat complaint as resolved/warm unless she asks another follow-up. Sources: `sales` msgs **6270**, **6271**, **6273**, **6274**, **6275**, **6276**.
- **Cute Things & Creative Concepts / Shohreh** — bulk quote is current; Shohreh asked whether they may sell Glue Masters products on **Amazon** after the $16,030.20 quote. Ev sent a reply on **2026-05-06** saying **no Amazon resale authorization**; wait for her response. Sources: `sales` msgs **6087**, **6100**, **6101**, **6149**.
- **Malcolm Industries** — new bulk inquiry for CA adhesive + activator shipment to Pakistan; needs quote/reply path and likely COA/MSDS support. Source: `sales` msg **6145**.
- **Garcor / Kyle Lawson / David Young** — PO/payment corrected: David Young paid PayPal invoice **1001-0244** for **$1,806.00** on 2026-05-11 (transaction **8L633560LT2348943**) for **420× 20g Gel**, but Garcor used the wrong card on that first payment and it has been refunded per Ev on 2026-05-13. David then paid invoice **1001-0245** for **$1,806.00** on 2026-05-13 (transaction **8U542068D8830142E**) as the valid payment for the order. PayPal notice says Seller Protection eligible and ship-to address unconfirmed. Next step: fulfill/ship one paid 420-unit order only; do not treat invoice 1001-0244 as an open duplicate-payment risk. Sources: Ev Telegram **2026-05-13 13:40 PT**, `gluemasters` msgs **192403**, **192479**, `sales` msgs **6165**, **6178**, **6191**, **6194**, **6208**.
- **Frame My TV / Danielle Labrecque** — new B2B case order request for **1 case Thick 1500cps**, one-time, shipping to **66 Newark St, Haverhill, MA 01832**; needs invoice/fulfillment path and inventory check. Source: `sales` msg **6189**.
- **Petite Keep / Amber Peterson** — Amber confirmed the 60-bottle welcome-back order: **60× 16oz Medium 1500 cps at $26/bottle = $1,560**. Ship only to **1093 N Warson Rd, St Louis, MO 63132**. Invoices still go to `accounting@petitekeep.com`, and should also copy `lmartin@petitekeep.com` and Amber. Ramp says payment for invoice **1001-0247** was received/processed for **$1,560.00** via ACH, payment ID **SU4JBCM49C**, trace ID **074920900154501**, estimated arrival **2026-05-15**. Next step: fulfill/ship the paid order if internal cash-clearance policy allows shipment on Ramp receipt. Sources: `gluemasters` msgs **192521**, **192542**, **192579**.
- **Wet Work Studios / Sam Slobusky** — new wholesale account inquiry for an initial order of **80× 16oz Ultra Thin**; asks what documents are required for account setup. Midday 2026-05-15 local product check reduced the product-truth blocker: Shopify product **Glue Masters Ultra Thin CA Glue — 16oz** is active as SKU **16OZ05CAGM** with quantity **91**, and ShipBob product ID **8696104** shows **91 fulfillable** plus **30 awaiting**. Draft reply exists at `moneysamurai/drafts/midday-quick-wins-2026-05-15.md`; needs Ev pricing/terms approval before sending. Source: `sales` msg **6207**.
- **Champion Fiberglass / Miguel Garcia** — new RFQ for **52× Gluemasters 1500 CPS Super Glue, 2g, 4 ct**. Ship/contact context: Champion Fiberglass, 6400 Spring Stuebner Rd, Spring, TX 77389; Miguel Garcia / Purchasing Manager. Needs product mapping, quote, and reply. Source: `sales` msg **6218**.
- **Tyler Panzer / TJP Art** — donation request for gift-bag items/samples/promotional material for a July 25, 2026 gallery show at Spacelab Gallery in Philadelphia; first 50 attendees. Address provided: 1300 Hillcrest Rd, Conshohocken, PA 19428. Needs Ev decision on whether to support and what samples, if any, to send. Source: `sales` msg **6226**.
- **WaterRower / NOHRD / Abel Sanchez / Peter King** — PO **00039435** received for **15× CA Medium 700 CPS / WRC1505**, 16oz, **$42.99** each, total **$644.85**, C.O.D., ship to **WATERROWER | NOHRD, 560 Metacom Ave, Warren, RI 02885**, ship via Best Way. PayPal invoice **1001-0246** was sent and paid on 2026-05-13 by Peter King / `peter@waterrower.com`; transaction **4W686707JS430003G**, Seller Protection eligible, PayPal ship-to address unconfirmed. Next step: fulfill/ship the paid order. Sources: `sales` msgs **6206**, **6210**, **6211**.
- **Thomas Oconnell** — Shopify contact form says he cannot get the plastic cap off brand-new Thin super glue; likely needs customer support reply with opening instructions/replacement path. Source: `sales` msg **6120**.
- **Arka / Sean** — chose **stock 700 cps in 2oz bottles, ships now** for the CO 80110 quote path. Next step: get initial quantity / annual volume and price the stock 2oz Medium option. Draft follow-up created at `moneysamurai/drafts/arka-stock-700cps-2oz-followup-2026-05-04.md`. Sources: `sales` msgs **6112**, **6131**.
- **Amazon buyer message / Karaoke Machine Store** — Amazon buyer message is waiting in Seller Central for order **113-4386244-8272243**, ASIN **B0DFPG9PJN** Singing Machine Platinum Plus. Source: `gluemasters` msg **192280**.
- **John L Ortman** — Shopify contact form asks whether **Ultra Thin** will be offered in a small-format size; website says it is available but no purchase option is visible. A 2026-05-08 product check found mixed evidence: current shopping/feed + B2B collateral only expose **Ultra Thin 16oz**, but internal SKU/cost references also mention **GM8OZ5CPS** and **GM2OZ5CPS**. Real blocker is product truth: confirm whether 8oz/2oz Ultra Thin are actually sellable/live before replying. Source: `sales` msg **6174**.
- **Larry Trammell** — repeat Amazon buyer of Medium CA says recent bottle arrived with screw cap instead of nozzle. Ev spoke with him and requested his address; Larry sent address and thanked for customer service. Next step is send replacement nozzle/bottle if not already shipped. Sources: `sales` msgs **6173**, **6187**, **6188**.
- **Larry Trammell follow-up** — Larry followed up again on 2026-05-21 asking for status on the missing pour spout/nozzle issue and provided prior address context: Rifles and Reels Taxidermy LLC, 29919 Hwy UU, Warsaw, MO 65355. This is now a hot customer follow-up; reply with replacement status/tracking or ship the replacement if it has not gone out. Sources: `sales` msgs **6268**, **6269**.
- **Justin Schuhmann** — Shopify contact form says his **8oz bottle cap keeps getting glued shut** and asks whether he can order a new lid. Needs customer support reply / replacement cap path. Source: `sales` msg **6267**.
- **Jeremy Embry / Aquarium Artisans** — Ev sent the pricing / “what do you want to do moving forward” reply on 2026-04-27; wait for Jeremy’s response before next action. Source thread: `sales` msg **6046**.
- **Gemifly LLC** — PayPal invoice **1001-0243** is paid as of 2026-05-16: **$7,424.15** received from Gemifly LLC, transaction **1JB03438J23145733**, PayPal Seller Protection eligible, ship-to address unconfirmed. Invoice line items: **815× Gemiflex V1** ($6,552.60), **10,000× dispensing tips** ($600.00), **500× Natural Pin Cap EXTRA** ($125.00), **shipping** ($146.55). Next step: fulfill/ship the paid Gemiflex/tips/caps order, using normal unconfirmed-address caution. Sources: `sales` msgs **6134**, **6172**, **6235**.
- **Gemifly LLC invoice 1001-0248** — PayPal invoice **1001-0248** for **$1,968.63** was sent to Gemifly LLC on 2026-05-20. Next step: watch for payment before treating as paid/ready to fulfill. Source: `sales` msg **6261**.
- **Donaldson / Rachael Fitzgerald** — account setup is still pending on Donaldson Finance side; Rachael reached out internally to see what is holding it up. They are good on inventory for now and will re-order when they break into the second case; usage for the new bottle size is still unknown. Ev already replied asking her to keep us updated. Sources: `sales` msg **6137**, `gluemasters` msgs **192353**, **192354**.
- **TikTok/Amazon influencer outreach** — low-priority vendor/influencer pitch surfaced late day; not urgent. Source msg **6066**.
- **Furniture Flipping Teacher / Lauren Hull** — influencer/collab follow-up from Melissa Hogg at Cactus Belle Co.; Lauren has ~331k YouTube subscribers and ~260k Instagram followers, with home-renovation/furniture-restoration projects ahead. Low-priority unless Ev wants a Q2 creator campaign. Sources: `gluemasters` msg **192734**, `sales` msg **6279**.
- **Cristaux / JSabon delivery failure** — Ev's email to `JSabon@cristaux.com` bounced with **550 5.7.1 Invalid recipient address**. Subject was “Your adhesives guide, the UV-vs-CA call.” If this is a live lead, need corrected contact/address. Source: `gluemasters` msg **192739**.
- **Pinnacle Brand Management / Tim Edmunds** — cold pitch for TikTok retargeting against the existing email list with a claimed 5× return guarantee and $50 gift card for a call. Low-priority marketing vendor outreach unless Ev wants to evaluate. Source: `sales` msg **6281**.
- **Starbond/Systemslab outreach** — David Jones says he tried to call about **Starbond** and asks for 5 minutes. Treat as low-priority vendor/competitive outreach unless Ev recognizes it. Source: `gluemasters` msg **192425**.
- **Dynasty Global / Eli** — dealer inquiry; needs Ev decision.
- **Munera Capital / Josef Kozorezov** — acquisition-interest outreach asking whether we’d explore acquiring Glue Masters; added to MoneySamurai as stage `contacted`. Low-priority unless Ev wants to engage. Source: `sales` msg **6177**.
- **Ethan Miller** — order **#5786**, 4× Thick 16oz replacement not created at ShipBob.
- **Josh Mintz** — 8oz Medium sample to New Orleans overdue.
- **KMS LLC / Brittni** — wholesale distributor inquiry stale.
- **Jason F return** — decision pending.

## 🔵 Active product / growth

### B2B sample kits
- Ev confirmed on **2026-05-05** that the boxes are done and kits are ready to be sent.
- Status: ready for outbound/send execution; do **not** list box production or kit assembly as blockers.
- Kit assets/collateral live under `gluemasters-bizdev/b2b-kit/`.

### Pump Accelerator 8oz
- Supplier: Xtralok, Chicago.
- UPC: **199874971148**.
- Model: **ACC0201**.
- Target price: **$14.99**.
- Designer: Designcoffers/Fiverr; revisions in progress.
- Designcoffers says they will be on Eid al-Adha vacation **2026-05-26 through 2026-05-30** and asks for any revisions/questions before **2026-05-26**.
- Files: `gluemasters-bizdev/labels/pump-accelerator-8oz/`.

### Amazon PPC
- Tracked state: 11 campaigns, ~$773/day spend, 2.42× ROAS, 41% ACoS.
- Late-day 2-month PPC review: growth is working, but account profitability is still loose; best current wins are 8oz Thick Auto, 8oz Medium Auto, and CA Glue Core Exact, while **2oz Thick Auto**, conquest, and defense need tightening.
- Backlog: wire flywheel data into MoneySamurai PPC frontend; bias next optimization pass toward cutting waste in **2oz Thick Auto / conquest / defense** and scaling the stronger exact/discovery winners more carefully.

### Shopify / marketplace backlog
- **ShipBob Northeast Hub move** — ShipBob is moving from Kutztown to **4755 Hanoverville Road, Building E, Bethlehem, PA 18020**. Transition window **2026-05-11 to 2026-05-29**; no Kutztown appointments after **2026-05-22**; new WRO labels show new address starting **2026-05-27**; inbound arriving at Kutztown starting **2026-05-27** will be denied. Check any open Northeast/Kutztown WROs before shipping inbound inventory. Source: `gluemasters` msg **192400**.
- ShipBob / Niyati created or updated case **thread::nTthrrhGdgmmyhr_yqOvHj0::** / case **#02713670** on **2026-05-27** after Ev's chat. On **2026-05-28**, Niyati said the shipment is now labelled and waiting for carrier pickup; after Ev asked how ShipBob will prevent repeats, Niyati apologized and offered to help with the shipment's shipping cost if Ev confirms. On **2026-05-29**, Niyati closed the case for internal reporting because no confirmation was received, but said replying to the thread will reopen it without starting over. Source: `gluemasters` msgs **192858**, **192872**, **192885**, **192903**.
- ShipBob / Mohit opened a separate credit request on **2026-05-29** for SLA-breached shipments totaling **$114.31**: **370553993** ($19.18), **370345903** ($14.08), **370259129** ($19.35), **370025482** ($42.52), and **368622070** ($19.18). Next step: watch for approval/application of the credit; do not treat it as applied cash yet. Source: `gluemasters` msg **192910**.
- ShipBob sent a non-urgent security reminder recommending rotation of PATs older than 90 days; memory note remains that PATs do not expire, so treat this as hygiene only, not an outage. Source: `gluemasters` msg **192468**.
- ShipBob updated the Claims Page effective **2026-05-18**: lost-in-transit claims can be filed from **7 days after estimated delivery** through **45 days post-EDD**, uninsured LIT liability is capped at the lesser of **$100** or the carrier limit, and proactive claim filing is opt-in with a **25% fee** on approved payouts. Source: `gluemasters` msg **192620**.
- ShipBob updated Terms of Service effective **2026-06-21**; continuing to use services on/after that date accepts the updated terms. Non-urgent legal/vendor watch unless Ev wants review. Source: `gluemasters` msg **192735**.
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
- Latest checked ads folder: **2026-05-28**; 2026-05-28 pull completed valid at **2026-05-29 06:53 PT** with **10 campaigns**, **88 keywords**, and **58 search terms**. Same-day May 28 Amazon Ads attributed metrics were still weak but improved from May 27: **$107.28 spend / $151.81 sales / 5 orders / 70.7% ACoS / 1.42× ROAS**. Do not run a second scale wave without review/approval. Current waste candidates include **2oz Thick Auto** ($20.17 spend, $0 sales) and **CA Glue Core Exact** ($15.83 spend, $0 sales), while **8oz Thick Auto** and **8oz Medium Auto** were winners. On **2026-05-07 6:30 PM PT**, after Ev approved the first conservative growth batch, Amazon Ads API accepted **20 campaign-level negative exacts**, **12 proven exact keyword bid raises (~10%)**, and **+10% budget bumps** on four winner campaigns: `Discovery - 8oz Thick Auto` **$60→$66**, `Sales - CA Glue Core Exact` **$50→$55**, `Discovery - 8oz Medium Auto` **$50→$55**, and `Sales - Thin CA Glue` **$35→$38.50**. Execution log: `moneysamurai/reports/ads-master-actions-execution-latest.json`. Prior 2026-05-04 recovery remains resolved; no current invalid-streak incident is open. Caveat: `reports/ads-pull-incident-latest.md` still renders the old **2026-04-23** critical incident from `logs/ads-daily/2026-04-24_060021.log`; trust `moneysamurai/data/ads/daily/2026-05-28/pull-status.json` for current ads health until the incident renderer is cleaned up.
2026-05-28 morning email/system context: Morning check-in found Himalaya works only with `HOME=/Users/evolve` in this environment. Fresh actionable items captured above: MarcoRocks co-branding inquiry (`sales` msg **6313**), ShipBob case update saying the shipment is labelled and awaiting pickup (`gluemasters` msg **192872**), and a new Amex Electrify America **$40.00** card-not-present alert dated **2026-05-27** (`gluemasters` msg **192864**). FBA sent a reimbursement notification with no action required (`gluemasters` msg **192870**). Ads daily pull is current for **2026-05-27** but performance was weak. Git status was clean. Do not reopen ShipBob DG/HAZMAT or the corrected non-B2B noise item without fresh evidence.
2026-05-28 midday email/system context: Sales scan found Chris Kendall cooled after tracking reply, MarcoRocks waiting on Joseph's call window after Ev's reply, and low-priority Pinnacle/TikTok retargeting follow-up. Gluemasters scan found ShipBob offering shipping-cost help on the shipment case and requiring confirmation within 8 business hours, Amazon payout **$1,401.50**, and Walmart release notes about price competitiveness affecting Pro Seller status plus Walmart+ seller-fulfilled badge criteria moving to 2-calendar-day delivery. Ads daily pull remains current for **2026-05-27**. Git status only showed this active-state update.
2026-05-28 evening email/system context: MarcoRocks/Joseph confirmed he will call Ev at **11:00 AM PT on 2026-05-29** for the reef co-branding discussion. A3/Caroline sent UPS tracking **1Z43A99A0347220365** for the remaining **1,260 Gemiflex units** on **PO#29**, ETA **2026-05-30 by 7 PM**, plus invoice **26-05272** for **$3,825.79** due **2026-06-26**. Walmart WFS surfaced a long-term-storage-fee change effective **2026-06-30** with **290 units** already 450+ days old. ShipBob's shipping-cost-help confirmation ask is still the only same-day vendor action with an 8-business-hour clock. Ads daily pull remains current for **2026-05-27**; git hygiene shows generated report/state churn plus `moneysamurai` ahead **39**.
2026-05-29 morning email/system context: FBA June capacity is healthy (**262.18 cu ft standard-size** limit vs **12.32 cu ft** used including open shipments), Shopify initiated payout **$580.68** for May 29, PayPal sent **$300.00 CAD / $226.91 USD** to **CONCEPT-PET**, and ShipBob sent another blank-amount payment-received notice. Fresh sales inbox also had a commission-only Amazon-growth vendor pitch from Alexander Mitchell; treat as low-priority vendor noise unless Ev wants to evaluate. MarcoRocks call is still scheduled for **11:00 AM PT today**. Ads pull is current for **2026-05-28** and git status is clean.
2026-05-29 midday email/system context: Fresh actionable customer/B2B item is Accurate Graphics / Javier Baeza requesting a rubber-to-wood production trial with instant fixture and 10-50 bottles/month potential (`sales` msg **6328**). ShipBob closed case **#02713670** for reporting after no reply, but it can be reopened by replying to the same thread (`gluemasters` msg **192903**). Delta sent operational trip details for **MIA → SEA**, confirmation **JM7CVR**, **2026-06-01 18:02-21:50**; treat as personal/travel logistics unless Ev asks. Walmart Customer Favorites and Alignable Shipux connection emails are low-priority/noise. Ads pull remains current for **2026-05-28**; git status only showed the active state updates.
2026-05-29 evening email/system context: MarcoRocks moved to proposal review after Ev's 2026-05-29 call/proposal; Joseph says it looks good and he will review over the weekend, then come back next week with questions (`gluemasters` msg **192912**). ShipBob submitted a **$114.31** credit request for five SLA-breached shipments, but credit is not yet confirmed/applied (`gluemasters` msg **192910**). Sales inbox had only PayPal Uber Eats receipts after midday, not customer/B2B action. Ads pull remains current for **2026-05-28**; root workspace has large generated report/state churn, and `moneysamurai` is still on `docs/partner-share-moneysamurai` ahead **39** with one modified temp cron script.
2026-05-29 2 PM kanban/progress context: `KANBAN.md` remains retired; active truth is this file, `MEMORY.md`, daily journals, and generated report desks. Rebuilt the May 29 ops pack at **14:02 PT** with artifact freshness **26 / 26 OK**, stale **0**, missing **0**, mismatched latest-vs-dated **0**. Current queue shape: **78** active items, **25** urgent, **41** needs Ev, **10** in progress, **2** backlog. Money desk: **$9,498.69** collect-visible, **$6,897.07** pay/verify, **$8,625.35** leakage/disputes, **$16,030.20** pipeline/upside. Order Ops: **19** closure items, **7** do-now, **7** Ev/credentialed, **1** marketplace firebreak, **6** customer closures, **5** paid fulfillment releases.
- Microsoft Advertising charged Gluemasters account **F145YB38** / card ending **5553** for **$399.76** on **2026-05-20** after reaching billing threshold/monthly billing date. Source: `gluemasters` msg **192673**.
- Amazon initiated a payout of **$999.15** to bank ending **388** on **2026-05-20 17:02 PDT**, expected within 3-5 days. Amazon initiated another payout of **$946.57** to bank ending **388** on **2026-05-21 20:30 PDT**, expected within 3-5 days. Amazon initiated another payout email on **2026-05-28** for **$1,401.50** to bank ending **388**, expected within 3-5 days. Shopify initiated a **$845.47** payout on **2026-05-22** and **$580.68** payout on **2026-05-29**, each expected in 1-2 business days. ShipBob confirmed receipt of payments for the outstanding amount, but the emails displayed blank dollar amounts. Sources: `gluemasters` msgs **192684**, **192718**, **192723**, **192747**, **192883**, **192895**; `sales` msgs **6277**, **6324**.
2026-05-24 afternoon/evening cron context: MoneySamurai sync trigger succeeded twice with HTTP 200 / `success: true` for categories products, orders, inventory, financial, and restock; service health checks stayed green (`HEARTBEAT_OK`); sales and gluemasters inbox monitors returned no actionable customer/B2B/supplier alerts. One late gluemasters email above the prior checkpoint was MLS marketing noise, and `evgueni-monitor.md` advanced to ID **192773**. Do not surface routine sync/heartbeat successes to Ev.
2026-05-25 midday cron/session context: visible recent sessions were empty, persisted session logs showed routine `HEARTBEAT_OK` / `NO_REPLY` / sync successes plus two actionable alerts now captured above: Walmart late-origin-scan msg **192779** and Amazon FBA removal msg **192789**. No session evidence showed Shipux, Walmart credentialed cleanup, Larry, Justin, Thomas, Ethan, QuickBooks, Shopify token, Buy with Prime, or A3 resolved.
2026-05-26 midday cron/session context: `memory/2026-05-26.md` was initially missing, `memory/2026-05-25.md` was read, `KANBAN.md` remained retired, visible recent sessions were empty, and persisted session logs showed routine `HEARTBEAT_OK` / `NO_REPLY` / MoneySamurai sync activity plus one new actionable alert now captured above: Amazon FBA automated unfulfillable removal order **Da7RqF+4Mp** (`gluemasters` msg **192815**). Session review did not show resolved/done signals for Shipux, Walmart credentialed cleanup, Larry, Justin, Thomas, Ethan, QuickBooks, Shopify token, Buy with Prime, Garcor, Gemifly, WaterRower, Petite Keep, Louise, or A3.
2026-05-26 evening cron/session context: late sessions after the 2 PM checkpoint were mostly routine `HEARTBEAT_OK`, `NO_REPLY`, MoneySamurai keep-alive OK, and sync success. Ev corrected one Telegram-surfaced item at **2026-05-26 09:50 PT** / Telegram msg **12374** as **not a B2B lead, just noise**; the source item was not identifiable from the session transcript. The 5:56 PM heartbeat sent Telegram msg **12383** with an erroneous claim that the ShipBob DG/HAZMAT blocker/order **370025482** was still highest risk; this conflicts with Ev's 2026-05-19 done signal and the resolved state below, so do **not** resurface ShipBob DG/HAZMAT unless a fresh ShipBob notice appears. The same heartbeat surfaced unverified/source-ID-missing notes for `cs@gluemasters.com` bouncing, Amex account ending **94007** statement due **2026-06-19**, Shopify payout **$386.33**, Google Cloud TLS notice before **2026-06-15**, and generic Amazon Freight / marketing pitch noise; treat these as verify-before-alert context, not active queue blockers. No late session evidence showed Shipux, Walmart credentialed cleanup, Larry, Justin, Thomas, Ethan, QuickBooks, Shopify token, Buy with Prime, Garcor, Gemifly, WaterRower, Petite Keep, Louise, or A3 resolved.
2026-05-27 midday cron/session context: `memory/2026-05-27.md` was missing before this check, so the review used yesterday's journal plus live state. Persisted sessions since morning were mostly routine `HEARTBEAT_OK`, `NO_REPLY`, OpenClaw health OK, and MoneySamurai sync successes. Fresh actionable/session alerts now captured above: ICU Shopify upsell token expired again, Amazon automated FBA removal order **1OLLCT1wj/**, Chris Kendall tracking/update complaint, and ShipBob/Niyati case follow-up **thread::nTthrrhGdgmmyhr_yqOvHj0::**. Morning brief also noted Seller Central remained blocked at Amazon password sign-in. No session evidence showed resolved/done signals for Shipux, Walmart credentialed cleanup, Larry, Justin, Thomas, Ethan, QuickBooks, Shopify token, Buy with Prime, Garcor, Gemifly, WaterRower, Petite Keep, Louise, or A3.
2026-05-27 evening cron/session context: late persisted sessions after the 2 PM checkpoint were mostly routine `HEARTBEAT_OK`, `NO_REPLY`, OpenClaw health OK, MoneySamurai keep-alive OK, and sync success. One actionable money alert was captured above: Bank of America scheduled transfer request **614560288** for **$26,392.00** to **Barristo Enterprises Inc.** with a **$5.00** fee. No late session evidence showed resolved/done signals for Shipux, Walmart credentialed cleanup, Larry, Justin, Thomas, Ethan, QuickBooks, Shopify token, ICU Shopify app refresh, Buy with Prime, Garcor, Gemifly, WaterRower, Petite Keep, Louise, Chris Kendall, or A3. Do not reopen ShipBob DG/HAZMAT or the corrected non-B2B noise item without fresh evidence.
- **Important correction:** the pre-fix Amazon Ads “daily” digest was mislabeled. Its default pull was a **7-day rolling window ending on the snapshot date**, so the earlier **$708.60 spend / $2,152.91 ad-attributed sales / 69 orders** for `2026-04-26` were **not same-day April 26 sales** and must not be compared to Seller Central same-day total sales. Seller Central showed **$1,129.16 total sales including organic** for Apr 26, confirming the label/logic was invalid. Fix applied 2026-04-27 in `moneysamurai@1a2f79a`: default pull is now same-day; multi-day pulls require `--rolling-7d` and are kept out of daily history; digest labels now say ad-attributed/window metrics explicitly. Correction pull completed 2026-04-27 at ~11:31 AM PT and overwrote the daily snapshot with true same-day data.
- Recent timeout patches:
  - `sales-email-monitor`: **180s → 240s**.
  - `evgueni-email-monitor`: **120s → 180s**.
  - `ads-daily-pull`: **1800s → 3600s**.
- Both email monitors completed cleanly on late **2026-04-24** runs after the timeout bumps and surfaced no new actionable email alerts.
- New local triage artifact is live for morning testing: `reports/ads-pull-incident-latest.html` (plus `.md` / `.json`), generated by `scripts/ads_pull_incident_report.py` and linked from the morning ops build/handoff.
- New morning decision artifact is live for testing: `reports/morning-decision-desk-latest.html` (plus `.md` / `.json`), generated by `scripts/build_decision_brief.py`; it pulls source IDs, draft refs, money-at-stake, and unblockers into one morning-ready view and is linked from the morning ops hub/build.
- New morning customer-response artifact is live for testing: `reports/morning-customer-desk-latest.html` (plus `.md` / `.json`), generated by `scripts/build_customer_response_desk.py`; it distills the customer/B2B queue into hot risks, draft-backed replies, missing-info blockers, and a one-page full queue, and is linked from the morning ops hub/build.
- New morning money artifact is live for testing: `reports/morning-money-desk-latest.html` (plus `.md` / `.json`), generated by `scripts/build_morning_money_desk.py`; it buckets visible cash pressure into collect-now, pay/verify, leakage, and upside so morning review can start from money movement instead of scanning the whole state file.
- Nightly 2026-04-29 improvement: the morning ops pack/hub now includes freshness/trust signals (`FRESH / AGING / STALE`, newest source edit time, build lag, and source timestamps for loaded journals/state files) via `scripts/kanban_morning_builder.py` + `scripts/ops_build.py`, so morning review can quickly tell whether the pack is current before acting.
- Midday 2026-05-10 ops refresh rebuilt the full pack with `python3 scripts/ops_build.py --date 2026-05-10`; artifact freshness is now **22 / 22 OK** with latest/daily outputs aligned at **2026-05-10 14:00 PDT**. Important nuance: source freshness still trails artifact freshness because the newest live-state/source edits were still from **2026-05-09 18:03 PDT** after that rebuild.
- The recurring `moneysamurai-sync-trigger` cron job (`c6565127-2875-4a1d-be8f-1c0021dd0ade`, every 2h) should keep running but has Telegram delivery silenced (`delivery.mode=none`) as of 2026-04-25; do not re-enable routine success announcements.
- Latest manual cron pass on **2026-05-10 4:01 PM PT** successfully reset the MoneySamurai account sync state to **healthy**, cleared queued/running jobs to **failed**, and triggered a fresh full-category sync (`products`, `orders`, `inventory`, `financial`, `restock`).
- Heartbeat git-hygiene check on 2026-05-02 surfaced surprise local MoneySamurai repo changes: `api/trigger-sync.js` modified, new `api/get-auth-token.js`, and branch ahead of origin by **21 commits**. Inspect before any deploy-ish action.
- Evening 2026-05-09 check still found git hygiene noise: MoneySamurai has unreviewed local change `api/cron-trigger-sync.cjs`, and the workspace has many generated ops/report file modifications. Avoid deploy-ish actions until reviewed/cleaned.

## 🟢 Resolved / do not resurface without fresh evidence

- **ShipBob DG/HAZMAT product review** — Ev marked this done on 2026-05-19. Remove from active deadline/shipment queues and do not resurface unless ShipBob sends a fresh DG/HAZMAT review or hold notice. Original source: `gluemasters` msg **192586**; done source: Ev Telegram **2026-05-19 14:42 PT**.
- **ShipBob DG/HAZMAT late false resurfacing** — A 2026-05-26 5:56 PM heartbeat incorrectly told Ev that ShipBob DG/HAZMAT/order **370025482** was still the highest-risk blocker. Treat that as a stale-context error, not an active blocker. Do not repeat it without fresh ShipBob evidence.
- **Anne Johnson / Mountain Dog Millworks delivery-risk contact** — Ev marked this done on 2026-05-18 after the urgent contact form about 2 large super glue containers. Do not resurface unless Anne follows up with a fresh issue. Source: Ev Telegram **2026-05-18 14:03 PT**, original `sales` msg **6243**.
- **Bank of America OPEX low-balance alert** — Ev marked this done on 2026-05-18. Do not resurface the checking ending **6560** below-$100 alert unless a fresh Bank of America alert appears. Source: Ev Telegram **2026-05-18 14:03 PT**, original `gluemasters` msg **192623**.
- **Christopher Webber / Mountain Man's Creative Arts B2B inquiry** — Ev marked this done on 2026-05-19. Remove from active B2B/sample-kit queues and do not resurface unless Christopher follows up with a fresh issue. Source: Ev Telegram **2026-05-19 11:01 PT**.
- **Clarion Bathware / Megan Best order #6099 ETA** — Megan asked when order **#6099** would ship; a reply was already sent with OSM tracking **9239590318421410007161**, and Megan replied “Thank you.” No further action unless she follows up. Sources: `sales` msgs **6227**, **6228**.
- **Deane Belk / Good Friends of Bryan County reorder** — `DEANE20` discount was created and the reorder/refund path was sent in-thread on 2026-05-14. After ShipBob-side cancellation of order **#6111**, Deane confirmed she completed the replacement order with the correct Good Friends card. Do not keep the “send 2× 16oz Thick order path” item active unless Deane raises a fresh issue. Sources: `sales` msgs **6216**, **6221**, **6222**.
- **R&R Fabrications shipment / invoice** — Ev marked R&R done on 2026-05-03, and Jeffery Davis paid PayPal invoice **1001-0242** for **$1,289.70** on 2026-05-04. Do not resurface the shipment/invoice as active unless a fresh R&R follow-up appears. Sources: `sales` msgs **6086**, **6099**, **6117**, **6130**.
- **Insurance audit** — Ev marked insurance done on 2026-05-03; do not resurface as active unless a fresh insurance/audit issue appears.
- **Steven Cohen order #6032 refund request** — Ev explained the 8oz Thin vs 16oz Thin/100cps difference and issued the refund; Steven replied “Thank you” on 2026-05-01. Sources: `sales` msgs **6093**, **6094**, **6114**, **6115**.
- **DMS Packaging invoice 2026-00169** — resolved midday 2026-05-07: Ev replied that payment had just been sent after James Johnston’s check-in, so do not keep the April storage/freight invoice on the live queue unless DMS says it is still unpaid. Source: `gluemasters` msg **192401**.
- **DMS Packaging invoice 2026-00118** — Ev marked the invoice-status check done on 2026-05-01. Source: `gluemasters` msg **192277**.
- **GLUE MASTERS trademark maintenance invoice** — Peretz Chesal & Herrmann invoice **3704** for **$1,170.00** was paid in full on 2026-04-29 and PCH confirmed payment on 2026-04-30. Do not resurface as unpaid. Sources: `gluemasters` msgs **192239**, **192256**.
- **The Escape Game receipt request** — Brendon/TEG found the receipt on the Shopify website after Ev’s follow-up. No further action unless they reply again. Sources: `sales` msgs **6091**, **6096**, **6102**.
- **Amex high-balance warning for account ending 94007/794007** — Amex warned future transactions may be declined unless a suggested **$20,494** payment was made, then confirmed a **$20,493.51** payment was received/processed on 2026-04-30. Do not resurface as active unless a fresh Amex restriction appears. Sources: `gluemasters` msgs **192250**, **192258**.
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
