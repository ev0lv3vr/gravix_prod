# Business State Audit — 2026-05-11

Generated: 2026-05-10 23:05 PDT

## Snapshot
- Active items scanned: **48**
- Past-date references in active items: **11**
- Relative time phrases to clean up: **0**
- Urgent items missing source evidence: **1**
- Possible duplicate source IDs: **0**
- Total findings: **12**

## Findings
- **HIGH · stale_date_ref · in_progress** — Active task still contains a past-dated reference; verify whether it should be rewritten, resolved, or escalated. Refs: 2026-05-05.
  - B2B sample kits — Ev confirmed on **2026-05-05** that the boxes are done and kits are ready to be sent. Status: ready for outbound/send execution; do **not** list box production or kit assembly as blockers. Kit assets/collateral live under `gluemasters-bizdev/b2b-kit/`.
- **HIGH · stale_date_ref · in_progress** — Active task still contains a past-dated reference; verify whether it should be rewritten, resolved, or escalated. Refs: 2026-05-02.
  - Heartbeat git-hygiene check on 2026-05-02 surfaced surprise local MoneySamurai repo changes: `api/trigger-sync.js` modified, new `api/get-auth-token.js`, and branch ahead of origin by **21 commits**. Inspect before any deploy-ish action.
- **HIGH · stale_date_ref · in_progress** — Active task still contains a past-dated reference; verify whether it should be rewritten, resolved, or escalated. Refs: 2026-05-10.
  - Latest manual cron pass on **2026-05-10 4:01 PM PT** successfully reset the MoneySamurai account sync state to **healthy**, cleared queued/running jobs to **failed**, and triggered a fresh full-category sync (`products`, `orders`, `inventory`, `financial`, `restock`).
- **HIGH · stale_date_ref · needs_ev** — Active task still contains a past-dated reference; verify whether it should be rewritten, resolved, or escalated. Refs: 2026-05-06.
  - **Cute Things & Creative Concepts / Shohreh** — bulk quote is current; Shohreh asked whether they may sell Glue Masters products on **Amazon** after the $16,030.20 quote. Ev sent a reply on **2026-05-06** saying **no Amazon resale authorization**; wait for her response. Sources: `sales` msgs **6087**, **6100**, **6101**, **6149**.
- **HIGH · stale_date_ref · needs_ev** — Active task still contains a past-dated reference; verify whether it should be rewritten, resolved, or escalated. Refs: 2026-05-09, 2026-05-09.
  - **Deane Belk / Good Friends of Bryan County** — Shopify contact form asks to speak with someone about **Thick viscosity / no-drip CA glue** for nonprofit luncheon centerpieces; she followed up again on 2026-05-09 saying this is her second attempt and she needs assistance. On 2026-05-09 Ev requested a draft response; draft was provided but not sent by me. Sources: `sales` msgs **6105**, **6179**, **6180**.
- **HIGH · stale_date_ref · needs_ev** — Active task still contains a past-dated reference; verify whether it should be rewritten, resolved, or escalated. Refs: 2026-05-07, 2026-05-09.
  - **Garcor / Kyle Lawson** — sent attached purchase order **PO4046132.pdf** and asked us to process it and confirm receipt. PayPal invoice **1001-0244** for **$1,806.00** was sent to `ap@garcor.com` on 2026-05-07 and PayPal sent a due-on-receipt reminder on 2026-05-09. Sources: `gluemasters` msg **192403**, `sales` msgs **6165**, **6178**.
- **HIGH · stale_date_ref · needs_ev** — Active task still contains a past-dated reference; verify whether it should be rewritten, resolved, or escalated. Refs: 2026-05-08.
  - **Gemifly LLC** — PayPal invoice **1001-0243** remains unpaid; PayPal reminder on 2026-05-08 shows **$7,424.15 due on receipt** (earlier sent notice showed **$7,449.98**). Track for payment / reconcile amount if needed. Earlier open amount listed was **$1,513.23**, now superseded by the new larger invoice unless Ev says otherwise. Sources: `sales` msgs **6134**, **6172**.
- **HIGH · stale_date_ref · needs_ev** — Active task still contains a past-dated reference; verify whether it should be rewritten, resolved, or escalated. Refs: 2026-04-27.
  - **Jeremy Embry / Aquarium Artisans** — Ev sent the pricing / “what do you want to do moving forward” reply on 2026-04-27; wait for Jeremy’s response before next action. Source thread: `sales` msg **6046**.
- **HIGH · stale_date_ref · needs_ev** — Active task still contains a past-dated reference; verify whether it should be rewritten, resolved, or escalated. Refs: 2026-05-03, 2026-05-08.
  - **Louise Frogley** — order **#6055** delayed/stuck at label printed; Ev replied that USPS tracking might lag and asked her to report if not delivered. Louise followed up again on 2026-05-03 saying the product never arrived, she bought a replacement, and she wants a credit-card refund. Shopify opened a product-not-received chargeback for **$41.84 + $15.00 fee** and auto-submitted the response on 2026-05-08; bank decision may take up to 75 days. Sources: `sales` msgs **6088**, **6089**, **6098**, **6116**, **6122**, **6168**, **6170**.
- **HIGH · stale_date_ref · urgent** — Active task still contains a past-dated reference; verify whether it should be rewritten, resolved, or escalated. Refs: 2026-04-30, 2026-04-25, 2026-04-30.
  - A3 Partners Gemiflex shipment / invoice — A3/Caroline forwarded UPS tracking **1Z43A99A0348588986** for **165 backordered Gemiflex units** to KNCH Law / Gabriel Majalca in Phoenix; ETA **Thu 2026-04-30 by 7 PM**. A3 invoice **26-04271** is due **2026-05-27** for **$501.25**. Caroline’s later past-due balance statement says A3 still shows **$6,597.07** open across older invoices **26-03263** (**$3,312.37**, due **2026-04-25**) and **26-03311** (**$3,284.70**, due **2026-04-30**). Treat that as supplier-side open-balance evidence; verify against bank/QuickBooks before asserting internal non-payment as fact. Sources: `gluemasters` msgs **192183**, **192184**, **191451**, **191683**, **192371**.
- **HIGH · stale_date_ref · urgent** — Active task still contains a past-dated reference; verify whether it should be rewritten, resolved, or escalated. Refs: 2026-04-30.
  - ICU Shopify upsell app token — In Cart Upsell says the store token expires **Thu 2026-04-30** and upsell offers will pause if the app is not opened/refreshed in Shopify admin. Source: `sales` msg **6090**.
- **MEDIUM · urgent_without_source · urgent** — Urgent item lacks explicit source evidence/message reference.
  - Shopify API token — Current API access is dead; inventory visibility is degraded/blind. Needs token regeneration or browser/API workaround.
