# Morning Unblock Desk — 2026-05-03

Generated: 2026-05-03 14:01 PDT

## Snapshot
- Total unblock / verify items: **8**
- Do now: **3**
- Operator-owned: **4**
- Ev-owned: **2**
- Surfaces: **Amazon Seller Central, ShipBob / UPS, Shopify Admin, Walmart Marketplace**

## Do now
- **Amazon account security check** — Amazon sent a password recovery notice tied to a reset attempt from Chrome on macOS near Washington. If this was not Ev, he should verify account security directly in Amazon, not through the email link. Source: `gluemasters` msg 192139. (Amazon Seller Central; Ev; security; msgs 192139)
  - First step: Open Amazon account security activity directly in-browser and confirm whether the Washington/macOS reset attempt was yours.
  - Success: Marked done once recent sign-in / recovery activity is confirmed legitimate or the password + MFA are changed.
- **ICU Shopify upsell app token** — In Cart Upsell says the store token expires Thu 2026-04-30 and upsell offers will pause if the app is not opened/refreshed in Shopify admin. Source: `sales` msg 6090. (Shopify Admin; Operator; access; msgs 6090)
  - First step: Open the In Cart Upsell app inside Shopify admin so the store token refreshes before offers stay paused.
  - Success: Done when the app loads cleanly and the expiry/pause warning is gone or extended.
- **Amazon buyer message / Karaoke Machine Store** — Amazon buyer message is waiting in Seller Central for order 113-4386244-8272243, ASIN B0DFPG9PJN Singing Machine Platinum Plus. Source: `gluemasters` msg 192280. (Amazon Seller Central; Shared; customer; msgs 192280)
  - First step: Open Seller Central buyer messages for order 113-4386244-8272243 and draft/send the reply from the existing order context.
  - Success: Done when the message is answered in Seller Central and the thread is moved out of the active queue.

## Operator-owned clears
- **ICU Shopify upsell app token** — In Cart Upsell says the store token expires Thu 2026-04-30 and upsell offers will pause if the app is not opened/refreshed in Shopify admin. Source: `sales` msg 6090. (Shopify Admin; Operator; access; msgs 6090)
  - First step: Open the In Cart Upsell app inside Shopify admin so the store token refreshes before offers stay paused.
  - Success: Done when the app loads cleanly and the expiry/pause warning is gone or extended.
- **A3 Partners Gemiflex shipment / invoice** — A3/Caroline forwarded UPS tracking 1Z43A99A0348588986 for 165 backordered Gemiflex units to KNCH Law / Gabriel Majalca in Phoenix; ETA Thu 2026-04-30 by 7 PM. A3 invoice 26-04271 is due 2026-05-27 for $501.25. Sources: `gluemasters` msgs 192183, 192184. (ShipBob / UPS; Operator; ops; msgs 192183, 192184)
  - First step: Verify delivery status for tracking 1Z43A99A0348588986 and confirm whether invoice 26-04271 needs a reminder or calendar hold.
  - Success: Done when delivery is confirmed and the payable follow-up is clearly parked.
- **Louise Frogley** — order #6055 delayed/stuck at label printed; Ev replied that USPS tracking might lag and asked her to report if not delivered. Louise followed up again on 2026-05-03 saying the product never arrived, she bought a replacement, and she wants a credit-card refund. Needs refund vs replacement/reship decision. Source: `sales` msgs 6088, 6089, 6098, 6116, 6122. (ShipBob / UPS; Operator; ops; msgs 6088, 6089, 6098, 6116, 6122)
  - First step: Open the source system in-browser and clear the blocker from the live operating surface, not from email.
  - Success: Done when the live surface confirms the blocker is cleared and the state file can be updated confidently.
- **Shopify API token** — Current API access is dead; inventory visibility is degraded/blind. Needs token regeneration or browser/API workaround. (Shopify Admin; Operator; access)
  - First step: Open Shopify admin, regenerate or replace the broken API credential, then re-test inventory visibility in the affected workflow.
  - Success: Done when inventory visibility is back and the dependent workflow no longer shows blind/dead API access.

## Needs Ev in-browser
- **Amazon account security check** — Amazon sent a password recovery notice tied to a reset attempt from Chrome on macOS near Washington. If this was not Ev, he should verify account security directly in Amazon, not through the email link. Source: `gluemasters` msg 192139. (Amazon Seller Central; Ev; security; msgs 192139)
  - First step: Open Amazon account security activity directly in-browser and confirm whether the Washington/macOS reset attempt was yours.
  - Success: Marked done once recent sign-in / recovery activity is confirmed legitimate or the password + MFA are changed.
- **Walmart Marketplace performance/pricing** — Fresh Walmart performance snapshot shows on-time delivery 83.3% vs 90% standard; valid tracking 100%, cancellations/negative feedback/returns/item-not-received all 0%. Fresh Walmart pricing digest shows price competitiveness 38.75% and top recommended price cuts: `20GRGELCAGM` $8.99 → $6.99, `24MLEPOXYGM2` $14.99 → $7.99. Treat as recommendations only; Ev should decide before price changes. Sources: `gluemasters` msgs 192175, 192177. (Walmart Marketplace; Ev; ops; msgs 192175, 192177)
  - First step: Open the Walmart performance/pricing dashboards and decide whether to act on on-time delivery risk and the suggested price cuts.
  - Success: Done when Ev accepts or rejects the pricing/performance actions and the decision is recorded.

## Watch / lower urgency
- **Walmart Marketplace performance/pricing** — Fresh Walmart performance snapshot shows on-time delivery 83.3% vs 90% standard; valid tracking 100%, cancellations/negative feedback/returns/item-not-received all 0%. Fresh Walmart pricing digest shows price competitiveness 38.75% and top recommended price cuts: `20GRGELCAGM` $8.99 → $6.99, `24MLEPOXYGM2` $14.99 → $7.99. Treat as recommendations only; Ev should decide before price changes. Sources: `gluemasters` msgs 192175, 192177. (Walmart Marketplace; Ev; ops; msgs 192175, 192177)
  - First step: Open the Walmart performance/pricing dashboards and decide whether to act on on-time delivery risk and the suggested price cuts.
  - Success: Done when Ev accepts or rejects the pricing/performance actions and the decision is recorded.
- **A3 Partners Gemiflex shipment / invoice** — A3/Caroline forwarded UPS tracking 1Z43A99A0348588986 for 165 backordered Gemiflex units to KNCH Law / Gabriel Majalca in Phoenix; ETA Thu 2026-04-30 by 7 PM. A3 invoice 26-04271 is due 2026-05-27 for $501.25. Sources: `gluemasters` msgs 192183, 192184. (ShipBob / UPS; Operator; ops; msgs 192183, 192184)
  - First step: Verify delivery status for tracking 1Z43A99A0348588986 and confirm whether invoice 26-04271 needs a reminder or calendar hold.
  - Success: Done when delivery is confirmed and the payable follow-up is clearly parked.
- **Amazon FBA unfulfillable removal** — Amazon created automated unfulfillable FBA removal order gZRKfHwQJb. Next automated removal may be created 2026-04-27 if unfulfillable inventory remains. Needs Seller Central verification if Ev wants to change removal settings/address/frequency. Source: `gluemasters` msg 192161. (Amazon Seller Central; Shared; ops; msgs 192161)
  - First step: Open FBA removal settings/order gZRKfHwQJb and verify destination, cadence, and whether any additional unfulfillable inventory is queued.
  - Success: Done when the settings are confirmed or adjusted and any follow-up action is recorded.
- **Louise Frogley** — order #6055 delayed/stuck at label printed; Ev replied that USPS tracking might lag and asked her to report if not delivered. Louise followed up again on 2026-05-03 saying the product never arrived, she bought a replacement, and she wants a credit-card refund. Needs refund vs replacement/reship decision. Source: `sales` msgs 6088, 6089, 6098, 6116, 6122. (ShipBob / UPS; Operator; ops; msgs 6088, 6089, 6098, 6116, 6122)
  - First step: Open the source system in-browser and clear the blocker from the live operating surface, not from email.
  - Success: Done when the live surface confirms the blocker is cleared and the state file can be updated confidently.
- **Shopify API token** — Current API access is dead; inventory visibility is degraded/blind. Needs token regeneration or browser/API workaround. (Shopify Admin; Operator; access)
  - First step: Open Shopify admin, regenerate or replace the broken API credential, then re-test inventory visibility in the affected workflow.
  - Success: Done when inventory visibility is back and the dependent workflow no longer shows blind/dead API access.

