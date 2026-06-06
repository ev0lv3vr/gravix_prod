# Morning Commerce Desk — 2026-06-05

Generated: 2026-06-05 08:57 PDT

## Snapshot
- Total commerce items: **12**
- Do now: **3**
- Catalog truth: **4**
- Marketplace guardrails: **2**
- Conversion backlog: **4**
- Launch assets: **2**

## Do now
- **Shopify API token** — Current API access is dead; inventory visibility is degraded/blind. Needs token regeneration or browser/API workaround. (Shopify Admin; Operator; now)
  - First step: Regenerate or replace the dead Shopify API credential, then re-test the inventory-dependent workflow.
  - Success: Done when inventory visibility is restored and the dependent workflow is no longer blind.
- **John L Ortman** — Shopify contact form asks whether Ultra Thin will be offered in a small-format size; website says it is available but no purchase option is visible. A 2026-05-08 product check found mixed evidence: current shopping/feed + B2B collateral only expose Ultra Thin 16oz, but internal SKU/cost references also mention GM8OZ5CPS and GM2OZ5CPS. Real blocker is product truth: confirm whether 8oz/2oz Ultra Thin are actually sellable/live before replying. Source: `sales` msg 6174. (Shopify Admin; Operator; now; msgs 6174)
  - First step: Verify whether 2oz / 8oz Ultra Thin are actually live and sellable across storefront, product feed, and internal SKU truth.
  - Success: Done when the sellable truth is clear enough to answer John without hedging.
- **Oversold inventory watch** — Backlog item: oversold inventory watch shows Gel 20g (-6) and Thick 2oz (-1). (Browser / manual verify; Operator; now; $328.62; msgs 192400, 192858, 192872, 192885, 192903, 192910, 192468, 192620, 192735)
  - First step: Check the oversold SKUs and decide whether to correct inventory, pause exposure, or treat them as false alarms.
  - Success: Done when Gel 20g / Thick 2oz oversell risk is either cleared or explicitly contained.

## Catalog truth
- **Shopify API token** — Current API access is dead; inventory visibility is degraded/blind. Needs token regeneration or browser/API workaround. (Shopify Admin; Operator; now)
  - First step: Regenerate or replace the dead Shopify API credential, then re-test the inventory-dependent workflow.
  - Success: Done when inventory visibility is restored and the dependent workflow is no longer blind.
- **John L Ortman** — Shopify contact form asks whether Ultra Thin will be offered in a small-format size; website says it is available but no purchase option is visible. A 2026-05-08 product check found mixed evidence: current shopping/feed + B2B collateral only expose Ultra Thin 16oz, but internal SKU/cost references also mention GM8OZ5CPS and GM2OZ5CPS. Real blocker is product truth: confirm whether 8oz/2oz Ultra Thin are actually sellable/live before replying. Source: `sales` msg 6174. (Shopify Admin; Operator; now; msgs 6174)
  - First step: Verify whether 2oz / 8oz Ultra Thin are actually live and sellable across storefront, product feed, and internal SKU truth.
  - Success: Done when the sellable truth is clear enough to answer John without hedging.
- **Oversold inventory watch** — Backlog item: oversold inventory watch shows Gel 20g (-6) and Thick 2oz (-1). (Browser / manual verify; Operator; now; $328.62; msgs 192400, 192858, 192872, 192885, 192903, 192910, 192468, 192620, 192735)
  - First step: Check the oversold SKUs and decide whether to correct inventory, pause exposure, or treat them as false alarms.
  - Success: Done when Gel 20g / Thick 2oz oversell risk is either cleared or explicitly contained.
- **Refund policy links** — Backlog item: refund policy links currently point to gravixadhesives.com and should be corrected. (Shopify Admin; Shared; backlog; $328.62; msgs 192400, 192858, 192872, 192885, 192903, 192910, 192468, 192620, 192735)
  - First step: Trace the live refund-policy links and replace any gravixadhesives.com destinations with the correct storefront target.
  - Success: Done when the live policy links resolve to the correct domain/path.

## Marketplace guardrails
- **Walmart Marketplace announced a **2026-06-01** API behavior change for `GET /v3/inventories`: sequential cursor pagination will be enforced, and parallel/out-of-order cursor requests will return `400`.** — Walmart Marketplace announced a 2026-06-01 API behavior change for `GET /v3/inventories`: sequential cursor pagination will be enforced, and parallel/out-of-order cursor requests will return `400`. (Walmart Marketplace; Shared; soon)
  - First step: Open the live surface tied to this commerce task and clear the ambiguity from the source system.
  - Success: Done when the live system confirms the truth and the state can be updated cleanly.
- **ShipBob Northeast Hub move** — ShipBob is moving from Kutztown to 4755 Hanoverville Road, Building E, Bethlehem, PA 18020. Transition window 2026-05-11 to 2026-05-29; no Kutztown appointments after 2026-05-22; new WRO labels show new address starting 2026-05-27; inbound arriving at Kutztown starting 2026-05-27 will be denied. Check any open Northeast/Kutztown WROs before shipping inbound inventory. (ShipBob; Operator; backlog; $328.62; msgs 192400, 192858, 192872, 192885, 192903, 192910, 192468, 192620, 192735)
  - First step: Check for any open Northeast/Kutztown WROs or inbound plans that would collide with the Bethlehem transition dates.
  - Success: Done when no risky inbound remains pointed at Kutztown past the cutoff or the risky inbound is clearly flagged.

## Conversion backlog
- **Back-in-stock notification app** — Backlog item: choose a back-in-stock notification path for the storefront. (Shopify Admin; Shared; backlog; $328.62; msgs 192400, 192858, 192872, 192885, 192903, 192910, 192468, 192620, 192735)
  - First step: Pick and test the back-in-stock app path so waitlisted traffic can be captured instead of lost.
  - Success: Done when there is a concrete app choice or install-ready shortlist with next action.
- **Bundle offers** — Backlog item: define the first bundle offers worth testing. (Shopify Admin; Shared; backlog; $328.62; msgs 192400, 192858, 192872, 192885, 192903, 192910, 192468, 192620, 192735)
  - First step: Sketch or choose the first high-confidence bundle offer worth testing instead of leaving bundles as abstract backlog.
  - Success: Done when there is a concrete first bundle candidate with products and placement.
- **Google Search Console sitemap submission** — Backlog item: submit or verify the storefront sitemap in Search Console. (Google Search Console; Operator; backlog; $328.62; msgs 192400, 192858, 192872, 192885, 192903, 192910, 192468, 192620, 192735)
  - First step: Submit or verify the Shopify sitemap in Search Console and note the active property/state.
  - Success: Done when submission state is visible in Search Console or the blocker is explicit.
- **Opinew review import verification** — Backlog item: verify the imported 1,183 reviews are truly live and rendering as expected. (Shopify Admin; Operator; backlog; $328.62; msgs 192400, 192858, 192872, 192885, 192903, 192910, 192468, 192620, 192735)
  - First step: Confirm the imported review count and whether product pages are actually showing the expected social proof.
  - Success: Done when the 1,183-review import is verified as live or the gap is pinned down.

## Launch assets
- **B2B sample kits** — Ev confirmed on 2026-05-05 that the boxes are done and kits are ready to be sent. Status: ready for outbound/send execution; do not list box production or kit assembly as blockers. Kit assets/collateral live under `gluemasters-bizdev/b2b-kit/`. (Files / collateral; Ev; backlog)
  - First step: Confirm the outbound-ready kit contents and first send targets so the finished kits actually move.
  - Success: Done when the ready kits have a concrete next-send plan.
- **Pump Accelerator 8oz** — Supplier: Xtralok, Chicago. UPC: 199874971148. Model: ACC0201. Target price: $14.99. Designer: Designcoffers/Fiverr; revisions in progress. Designcoffers says they will be on Eid al-Adha vacation 2026-05-26 through 2026-05-30 and asks for any revisions/questions before 2026-05-26. Files: `gluemasters-bizdev/labels/pump-accelerator-8oz/`. (Files / collateral; Shared; backlog)
  - First step: Review the latest label/design state and capture the next unblocker to get Pump Accelerator 8oz launch-ready.
  - Success: Done when the next asset decision is obvious instead of buried in files.

