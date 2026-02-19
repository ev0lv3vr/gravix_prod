# Error Log

## 2026-02-19 — Wrong B2B pricing quoted to Pacmin Studios
- **What:** Sent Moises Bobadilla wholesale quote with wrong case size (12 instead of 30) and wrong price tier (40% off instead of 20% intro tier)
- **Root cause:** Used template in `retail-to-wholesale-sequences.md` which had "MOQ: 1 case (12 bottles)" and "40% off retail" as defaults — neither was correct
- **Correct case packs:** 16oz = 30 units, 8oz = 20 units, 2oz = 120 units
- **Correct intro pricing:** 1-49 bottles/mo = $34.39 (20% off), NOT $25.79 (that's 200+/mo tier)
- **Fix:** Sent correction email, updated templates + playbook
- **Lesson:** Always verify case sizes and pricing tiers against the LIVE wholesale page (gluemasters.com/pages/wholesale) before quoting. Don't trust playbook/template defaults — they were out of date. The live page is the source of truth.
- **Live pricing (16oz):** Starter $39/bottle (30 units), Growth $34.50 (90+), Pro $30 (150+), Partner $26 (300+)
- **Case packs:** 16oz = 30, 8oz = 20, 2oz = 120
- **Sent 3 emails to correct this.** Embarrassing. Check the live page first next time.
- **ALSO sent a fake /pages/wholesale URL** that doesn't exist — Moises reported 404. Correct pages are /pages/b2b (overview) and /pages/order-cases (direct case ordering). Added Shopify redirect /pages/wholesale → /pages/b2b.
- **Key URLs to remember:** B2B = /pages/b2b, Case orders = /pages/order-cases. NEVER guess URLs.
