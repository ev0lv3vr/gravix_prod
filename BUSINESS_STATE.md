# BUSINESS_STATE.md — Active Business State

Last updated: 2026-05-18 2:03 PM PT

This replaces `KANBAN.md`. `KANBAN.md` is retired and must not be used as an active source of truth.

## 🔴 Needs Ev / time-sensitive

### QuickBooks bank connection expired
- QuickBooks Online says a bank/financial-institution connection expired and recent transactions cannot be displayed until an authorized account holder reauthorizes it in **Accounting > Bank transactions**.
- After reconnecting, QuickBooks should attempt to download missed transactions.
- Source: `gluemasters` msg **192589**.

### ShipBob DG/HAZMAT product review
- ShipBob says flagged DG/HAZMAT items must be reviewed/resolved by **Tuesday 2026-05-19** or affected products may experience order delays, order holds, or inventory quarantine.
- Specific IDs called out: **8696101** and **8696102** need net weight and net volume filled in; ShipBob says **5 products** need review total.
- Note from ShipBob: expedited shipping is not possible for orders containing DG items.
- Source: `gluemasters` msg **192586**.

### Beyaz bank statements task overdue
- ClickUp sent an overdue reminder for task **“Send Beyaz statements from all banks”**, originally due **2026-05-14**.
- Needs Ev handling unless statements were already sent outside the visible email/task context.
- Source: `gluemasters` msg **192585**.

### Amex foreign transaction alert — Supabase
- American Express sent a foreign-transaction alert for account ending **794007**: **SUPABASE**, Singapore SGP, **$44.22**, dated **2026-05-17**.
- This may be a normal Supabase platform charge, but Ev should verify in Amex if it is not recognized.
- Source: `gluemasters` msg **192605**.

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
- Source: `sales` msg **6090**.

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
- Sources: `gluemasters` msgs **192161**, **192366**.

### Walmart Marketplace performance/pricing
- Fresh Walmart performance snapshot shows **on-time delivery 100% vs 90% standard**, but **valid tracking 87.5% vs 99% standard** and **late shipment 25% vs 5% standard**; cancellations/negative feedback/returns/item-not-received all 0%.
- Fresh Walmart pricing digest shows **price competitiveness 47.83%** (+8.1% WoW), Buy Box win rate 100%, and top recommended price cuts remain `20GRGELCAGM` **$8.99 → $6.99** and `24MLEPOXYGM2` **$14.99 → $7.99**. Treat as recommendations only; Ev should decide before price changes.
- New 2026-05-09 Walmart Partner Performance alert says **1 shipped order has a late origin scan** and needs carrier scan/tracking accuracy confirmed within **24 hours**; impacted-orders XLSX was referenced but not available in the local download path during the heartbeat check.
- New 2026-05-14 Walmart auto-cancel warning says **1 order has today as expected ship date and no tracking uploaded**. Impacted order from attachment: PO **119113590713297**, item **2476466849**, **1× Professional Grade Cyanoacrylate "Super Glue" by Glue Masters - 2 oz - Medium Viscosity, Clear**, GMV **$19.75**, ESD **2026-05-14**, EDD **2026-05-23**. Needs valid tracking uploaded today or proactive cancellation to avoid auto-cancel.
- Sources: `gluemasters` msgs **192323**, **192326**, **192443**, **192554**, **192595**, **192619**, **192624**.

### A3 Partners Gemiflex shipment / invoice
- A3/Caroline forwarded UPS tracking **1Z43A99A0348588986** for **165 backordered Gemiflex units** to KNCH Law / Gabriel Majalca in Phoenix; ETA **Thu 2026-04-30 by 7 PM**.
- A3 invoice **26-04271** is due **2026-05-27** for **$501.25**.
- A3 sent new invoice **26-05151** for **$732.63**, due **2026-06-14**.
- Caroline’s later past-due balance statement says A3 still shows **$6,597.07** open across older invoices **26-03263** (**$3,312.37**, due **2026-04-25**) and **26-03311** (**$3,284.70**, due **2026-04-30**). Treat that as supplier-side open-balance evidence; verify against bank/QuickBooks before asserting internal non-payment as fact.
- Sources: `gluemasters` msgs **192183**, **192184**, **191451**, **191683**, **192371**, **192632**.

### Shipux sales order SO14531
- Ev requested an urgent shipping update for Shipux sales order **SO14531 - 001034** because it had no shipping update since **2026-05-08** and a customer is waiting for tracking.
- Shipux / Tomas replied on 2026-05-13 that they missed it and **will ship tomorrow morning**. Ev's copy to `administrator@shipux.com` bounced because that mailbox does not exist, but `info@shipux.com` delivered and got the reply.
- Next step: watch for tracking on 2026-05-14 and update the waiting customer when available.
- Sources: `gluemasters` msgs **192543**, **192545**.

### Amazon refunds
- Amazon initiated a **$15.21** refund for order **111-7692391-0638603** / ASIN **B01MDNS8QB** / SKU **GM2M** / item **2oz Medium**; reason **Customer Return**. Source: `gluemasters` msg **192357**.
- Amazon initiated a **$38.15** refund for order **114-0455907-8694635** / ASIN **B01LZUN030** / SKU **8OZMED**; reason **Shipping Address Undeliverable**. Source: `gluemasters` msg **192328**.
- Amazon initiated a **$36.83** refund for order **111-6918255-6449022** / ASIN **B01CDPIIXK** / SKU **8OZTHICKCAGM**; reason **Product not as described**. Source: `gluemasters` msg **192188**.
- Amazon initiated a **$15.21** refund for order **112-8576738-1861063** to **Gregory I Boldrey** / ASIN **B01M8JT9LI** / SKU **GM2TH** / item **2oz Thin**; reason **Shipping Address Undeliverable**. Source: `gluemasters` msg **192438**.
- Amazon initiated a **$15.14** refund for order **111-3032772-6512258** to **Caroline M. Lerner** / ASIN **B01MDNS8QB** / SKU **GM2M** / item **2oz Medium**; reason **Shipping Address Undeliverable**. Source: `gluemasters` msg **192559**.
- Amazon initiated a **$73.80** refund for order **113-4123533-5785839** to **Richard W Sewell** / ASIN **B00WHEM0UA** / SKU **2OZTHICKCAGM** / **5× 2oz Thick**; reason **Customer Return**. Source: `gluemasters` msg **192628**.

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
- **Louise Frogley** — order **#6055** delayed/stuck at label printed; Ev replied that USPS tracking might lag and asked her to report if not delivered. Louise followed up again on 2026-05-03 saying the product never arrived, she bought a replacement, and she wants a credit-card refund. Shopify opened a product-not-received chargeback for **$41.84 + $15.00 fee** and auto-submitted the response on 2026-05-08; bank decision may take up to 75 days. Sources: `sales` msgs **6088**, **6089**, **6098**, **6116**, **6122**, **6168**, **6170**.
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
- **Jeremy Embry / Aquarium Artisans** — Ev sent the pricing / “what do you want to do moving forward” reply on 2026-04-27; wait for Jeremy’s response before next action. Source thread: `sales` msg **6046**.
- **Gemifly LLC** — PayPal invoice **1001-0243** is paid as of 2026-05-16: **$7,424.15** received from Gemifly LLC, transaction **1JB03438J23145733**, PayPal Seller Protection eligible, ship-to address unconfirmed. Invoice line items: **815× Gemiflex V1** ($6,552.60), **10,000× dispensing tips** ($600.00), **500× Natural Pin Cap EXTRA** ($125.00), **shipping** ($146.55). Next step: fulfill/ship the paid Gemiflex/tips/caps order, using normal unconfirmed-address caution. Sources: `sales` msgs **6134**, **6172**, **6235**.
- **Donaldson / Rachael Fitzgerald** — account setup is still pending on Donaldson Finance side; Rachael reached out internally to see what is holding it up. They are good on inventory for now and will re-order when they break into the second case; usage for the new bottle size is still unknown. Ev already replied asking her to keep us updated. Sources: `sales` msg **6137**, `gluemasters` msgs **192353**, **192354**.
- **TikTok/Amazon influencer outreach** — low-priority vendor/influencer pitch surfaced late day; not urgent. Source msg **6066**.
- **Starbond/Systemslab outreach** — David Jones says he tried to call about **Starbond** and asks for 5 minutes. Treat as low-priority vendor/competitive outreach unless Ev recognizes it. Source: `gluemasters` msg **192425**.
- **Dynasty Global / Eli** — dealer inquiry; needs Ev decision.
- **Munera Capital / Josef Kozorezov** — acquisition-interest outreach asking whether we’d explore acquiring Glue Masters; added to MoneySamurai as stage `contacted`. Low-priority unless Ev wants to engage. Source: `sales` msg **6177**.
- **Ethan Miller** — order **#5786**, 4× Thick 16oz replacement not created at ShipBob.
- **Josh Mintz** — 8oz Medium sample to New Orleans overdue.
- **KMS LLC / Brittni** — wholesale distributor inquiry stale.
- **Christopher Webber** — B2B inquiry stale.
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
- Files: `gluemasters-bizdev/labels/pump-accelerator-8oz/`.

### Amazon PPC
- Tracked state: 11 campaigns, ~$773/day spend, 2.42× ROAS, 41% ACoS.
- Late-day 2-month PPC review: growth is working, but account profitability is still loose; best current wins are 8oz Thick Auto, 8oz Medium Auto, and CA Glue Core Exact, while **2oz Thick Auto**, conquest, and defense need tightening.
- Backlog: wire flywheel data into MoneySamurai PPC frontend; bias next optimization pass toward cutting waste in **2oz Thick Auto / conquest / defense** and scaling the stronger exact/discovery winners more carefully.

### Shopify / marketplace backlog
- **ShipBob Northeast Hub move** — ShipBob is moving from Kutztown to **4755 Hanoverville Road, Building E, Bethlehem, PA 18020**. Transition window **2026-05-11 to 2026-05-29**; no Kutztown appointments after **2026-05-22**; new WRO labels show new address starting **2026-05-27**; inbound arriving at Kutztown starting **2026-05-27** will be denied. Check any open Northeast/Kutztown WROs before shipping inbound inventory. Source: `gluemasters` msg **192400**.
- ShipBob sent a non-urgent security reminder recommending rotation of PATs older than 90 days; memory note remains that PATs do not expire, so treat this as hygiene only, not an outage. Source: `gluemasters` msg **192468**.
- ShipBob updated the Claims Page effective **2026-05-18**: lost-in-transit claims can be filed from **7 days after estimated delivery** through **45 days post-EDD**, uninsured LIT liability is capped at the lesser of **$100** or the carrier limit, and proactive claim filing is opt-in with a **25% fee** on approved payouts. Source: `gluemasters` msg **192620**.
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
- Latest checked ads folder: **2026-05-17**; manual early-morning recovery pull completed at **2026-05-18 01:24 PT** with campaigns, keywords, search terms, and valid `pull-status.json`. Same-day May 17 Amazon Ads attributed metrics: **$87.52 spend / $235.91 sales / 37.1% ACoS / 2.70× ROAS**, with **10 campaigns**, **96 keywords**, and **49 search terms**. On **2026-05-07 6:30 PM PT**, after Ev approved the first conservative growth batch, Amazon Ads API accepted **20 campaign-level negative exacts**, **12 proven exact keyword bid raises (~10%)**, and **+10% budget bumps** on four winner campaigns: `Discovery - 8oz Thick Auto` **$60→$66**, `Sales - CA Glue Core Exact` **$50→$55**, `Discovery - 8oz Medium Auto` **$50→$55**, and `Sales - Thin CA Glue` **$35→$38.50**. Execution log: `moneysamurai/reports/ads-master-actions-execution-latest.json`. Monitor next 3–7 daily pulls before any second scaling wave. Prior 2026-05-04 recovery remains resolved; no current invalid-streak incident is open.
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

- **Anne Johnson / Mountain Dog Millworks delivery-risk contact** — Ev marked this done on 2026-05-18 after the urgent contact form about 2 large super glue containers. Do not resurface unless Anne follows up with a fresh issue. Source: Ev Telegram **2026-05-18 14:03 PT**, original `sales` msg **6243**.
- **Bank of America OPEX low-balance alert** — Ev marked this done on 2026-05-18. Do not resurface the checking ending **6560** below-$100 alert unless a fresh Bank of America alert appears. Source: Ev Telegram **2026-05-18 14:03 PT**, original `gluemasters` msg **192623**.
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
