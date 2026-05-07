# Morning Exception Desk — 2026-05-06

Generated: 2026-05-06 14:00 PDT

## Snapshot
- Total findings: **12**
- Past-dated active items: **8**
- Amount parser risks: **0**
- Urgent items missing source: **1**
- Passive items still in urgent: **3**

## Findings
- **HIGH · stale_date · in_progress** — Past-dated reference is still active and may need confirmation, rewrite, or cleanup. Refs: 2026-05-05.
  - B2B sample kits — Ev confirmed on **2026-05-05** that the boxes are done and kits are ready to be sent. Status: ready for outbound/send execution; do **not** list box production or kit assembly as blockers. Kit assets/collateral live under `gluemasters-bizdev/b2b-kit/`.
- **HIGH · stale_date · in_progress** — Past-dated reference is still active and may need confirmation, rewrite, or cleanup. Refs: 2026-05-02.
  - Heartbeat git-hygiene check on 2026-05-02 surfaced surprise local MoneySamurai repo changes: `api/trigger-sync.js` modified, new `api/get-auth-token.js`, and branch ahead of origin by **21 commits**. Inspect before any deploy-ish action.
- **HIGH · stale_date · needs_ev** — Past-dated reference is still active and may need confirmation, rewrite, or cleanup. Refs: 2026-05-04.
  - **Gemifly LLC** — new PayPal invoice **1001-0243** for **$7,449.98** was sent to Gemifly LLC on 2026-05-04; track for payment. Earlier open amount listed was **$1,513.23**, now superseded by the new larger invoice unless Ev says otherwise. Source: `sales` msg **6134**.
- **HIGH · stale_date · needs_ev** — Past-dated reference is still active and may need confirmation, rewrite, or cleanup. Refs: 2026-04-27.
  - **Jeremy Embry / Aquarium Artisans** — Ev sent the pricing / “what do you want to do moving forward” reply on 2026-04-27; wait for Jeremy’s response before next action. Source thread: `sales` msg **6046**.
- **HIGH · stale_date · needs_ev** — Past-dated reference is still active and may need confirmation, rewrite, or cleanup. Refs: 2026-05-03.
  - **Louise Frogley** — order **#6055** delayed/stuck at label printed; Ev replied that USPS tracking might lag and asked her to report if not delivered. Louise followed up again on 2026-05-03 saying the product never arrived, she bought a replacement, and she wants a credit-card refund. Needs refund vs replacement/reship decision. Source: `sales` msgs **6088**, **6089**, **6098**, **6116**, **6122**.
- **HIGH · stale_date · urgent** — Past-dated reference is still active and may need confirmation, rewrite, or cleanup. Refs: 2026-04-30, 2026-04-25, 2026-04-30.
  - A3 Partners Gemiflex shipment / invoice — A3/Caroline forwarded UPS tracking **1Z43A99A0348588986** for **165 backordered Gemiflex units** to KNCH Law / Gabriel Majalca in Phoenix; ETA **Thu 2026-04-30 by 7 PM**. A3 invoice **26-04271** is due **2026-05-27** for **$501.25**. Payment-status verification needed for older A3 invoices found in email but not active state: **26-03263** for **$3,312.37**, due **2026-04-25** (`gluemasters` msg **191451**) and **26-03311** for **$3,284.70**, due **2026-04-30** (`gluemasters` msg **191683**). Do not call these unpaid as fact until bank/QuickBooks/payment confirmation is checked. Sources: `gluemasters` msgs **192183**, **192184**, **191451**, **191683**.
- **HIGH · stale_date · urgent** — Past-dated reference is still active and may need confirmation, rewrite, or cleanup. Refs: 2026-04-27.
  - Amazon FBA unfulfillable removal — Amazon created automated unfulfillable FBA removal order **gZRKfHwQJb**. Next automated removal may be created **2026-04-27** if unfulfillable inventory remains. Needs Seller Central verification if Ev wants to change removal settings/address/frequency. Source: `gluemasters` msg **192161**.
- **HIGH · stale_date · urgent** — Past-dated reference is still active and may need confirmation, rewrite, or cleanup. Refs: 2026-04-30.
  - ICU Shopify upsell app token — In Cart Upsell says the store token expires **Thu 2026-04-30** and upsell offers will pause if the app is not opened/refreshed in Shopify admin. Source: `sales` msg **6090**.
- **MEDIUM · missing_source · urgent** — Urgent item lacks explicit source evidence/message reference.
  - Shopify API token — Current API access is dead; inventory visibility is degraded/blind. Needs token regeneration or browser/API workaround.
- **MEDIUM · passive_urgent · urgent** — Passive/watch-only language is still living in the urgent lane.
  - Amazon product safety / affiliate notices — Amazon flagged a **Thermos Stainless King food jar** order (**111-9829889-5064236**) with a stop-use / recall notice tied to a CPSC announcement. Amazon Associates/Influencer says account **redwaspnet-20** has been closed/rejected for over 3 years and a remaining **$114.30** balance will be forfeited after **7 days**; email says no action needed, but surface if Ev cares about recovering/appealing it. Source: `gluemasters` msg **192362**. Needs Ev review only if these personal/affiliate notices matter operationally; otherwise keep them low priority and do not let them crowd business-critical work. Sources: `gluemasters` msgs **192266**, **192362**.
- **MEDIUM · passive_urgent · urgent** — Passive/watch-only language is still living in the urgent lane.
  - Trademark maintenance filing — pending USPTO acceptance — PCH filed the Combined Declaration of Use and Incontestability (Sections 8 & 15) for trademark reg **6216158 GLUE MASTERS**; USPTO filing receipt received 2026-05-01. Next step is passive monitoring for USPTO acceptance/Office action over the next 1–2 months; no Ev e-sign action remains unless PCH flags an irregularity. Sources: `gluemasters` msgs **192263**, **192271**.
- **MEDIUM · passive_urgent · urgent** — Passive/watch-only language is still living in the urgent lane.
  - Walmart Marketplace performance/pricing — Fresh Walmart performance snapshot shows **on-time delivery 83.3% vs 90% standard** and **late shipment 50% vs 5% standard**; valid tracking 100%, cancellations/negative feedback/returns/item-not-received all 0%. Fresh Walmart pricing digest shows **price competitiveness 46.15%** (+5.32% WoW), Buy Box win rate 100%, and top recommended price cuts: `20GRGELCAGM` **$8.99 → $6.99**, `24MLEPOXYGM2` **$14.99 → $7.99**. Treat as recommendations only; Ev should decide before price changes. Sources: `gluemasters` msgs **192323**, **192326**.

