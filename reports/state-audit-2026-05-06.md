# Business State Audit — 2026-05-06

Generated: 2026-05-06 14:00 PDT

## Snapshot
- Active items scanned: **42**
- Past-date references in active items: **8**
- Relative time phrases to clean up: **0**
- Urgent items missing source evidence: **1**
- Possible duplicate source IDs: **0**
- Total findings: **9**

## Findings
- **HIGH · stale_date_ref · in_progress** — Active task still contains a past-dated reference; verify whether it should be rewritten, resolved, or escalated. Refs: 2026-05-05.
  - B2B sample kits — Ev confirmed on **2026-05-05** that the boxes are done and kits are ready to be sent. Status: ready for outbound/send execution; do **not** list box production or kit assembly as blockers. Kit assets/collateral live under `gluemasters-bizdev/b2b-kit/`.
- **HIGH · stale_date_ref · in_progress** — Active task still contains a past-dated reference; verify whether it should be rewritten, resolved, or escalated. Refs: 2026-05-02.
  - Heartbeat git-hygiene check on 2026-05-02 surfaced surprise local MoneySamurai repo changes: `api/trigger-sync.js` modified, new `api/get-auth-token.js`, and branch ahead of origin by **21 commits**. Inspect before any deploy-ish action.
- **HIGH · stale_date_ref · needs_ev** — Active task still contains a past-dated reference; verify whether it should be rewritten, resolved, or escalated. Refs: 2026-05-04.
  - **Gemifly LLC** — new PayPal invoice **1001-0243** for **$7,449.98** was sent to Gemifly LLC on 2026-05-04; track for payment. Earlier open amount listed was **$1,513.23**, now superseded by the new larger invoice unless Ev says otherwise. Source: `sales` msg **6134**.
- **HIGH · stale_date_ref · needs_ev** — Active task still contains a past-dated reference; verify whether it should be rewritten, resolved, or escalated. Refs: 2026-04-27.
  - **Jeremy Embry / Aquarium Artisans** — Ev sent the pricing / “what do you want to do moving forward” reply on 2026-04-27; wait for Jeremy’s response before next action. Source thread: `sales` msg **6046**.
- **HIGH · stale_date_ref · needs_ev** — Active task still contains a past-dated reference; verify whether it should be rewritten, resolved, or escalated. Refs: 2026-05-03.
  - **Louise Frogley** — order **#6055** delayed/stuck at label printed; Ev replied that USPS tracking might lag and asked her to report if not delivered. Louise followed up again on 2026-05-03 saying the product never arrived, she bought a replacement, and she wants a credit-card refund. Needs refund vs replacement/reship decision. Source: `sales` msgs **6088**, **6089**, **6098**, **6116**, **6122**.
- **HIGH · stale_date_ref · urgent** — Active task still contains a past-dated reference; verify whether it should be rewritten, resolved, or escalated. Refs: 2026-04-30, 2026-04-25, 2026-04-30.
  - A3 Partners Gemiflex shipment / invoice — A3/Caroline forwarded UPS tracking **1Z43A99A0348588986** for **165 backordered Gemiflex units** to KNCH Law / Gabriel Majalca in Phoenix; ETA **Thu 2026-04-30 by 7 PM**. A3 invoice **26-04271** is due **2026-05-27** for **$501.25**. Payment-status verification needed for older A3 invoices found in email but not active state: **26-03263** for **$3,312.37**, due **2026-04-25** (`gluemasters` msg **191451**) and **26-03311** for **$3,284.70**, due **2026-04-30** (`gluemasters` msg **191683**). Do not call these unpaid as fact until bank/QuickBooks/payment confirmation is checked. Sources: `gluemasters` msgs **192183**, **192184**, **191451**, **191683**.
- **HIGH · stale_date_ref · urgent** — Active task still contains a past-dated reference; verify whether it should be rewritten, resolved, or escalated. Refs: 2026-04-27.
  - Amazon FBA unfulfillable removal — Amazon created automated unfulfillable FBA removal order **gZRKfHwQJb**. Next automated removal may be created **2026-04-27** if unfulfillable inventory remains. Needs Seller Central verification if Ev wants to change removal settings/address/frequency. Source: `gluemasters` msg **192161**.
- **HIGH · stale_date_ref · urgent** — Active task still contains a past-dated reference; verify whether it should be rewritten, resolved, or escalated. Refs: 2026-04-30.
  - ICU Shopify upsell app token — In Cart Upsell says the store token expires **Thu 2026-04-30** and upsell offers will pause if the app is not opened/refreshed in Shopify admin. Source: `sales` msg **6090**.
- **MEDIUM · urgent_without_source · urgent** — Urgent item lacks explicit source evidence/message reference.
  - Shopify API token — Current API access is dead; inventory visibility is degraded/blind. Needs token regeneration or browser/API workaround.
