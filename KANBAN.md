# KANBAN — Last updated: 2026-04-16 11:30 PM PT

## 🔴 URGENT
- [ ] **Heather (Amazon)** — 20+ days no reply. A-to-Z claim risk. **Details recovered** (Himalaya msg id **191366**, 2026-03-24, Order **114-0636756-1872255**): buyer says **they have not received an update from Amazon nor a replacement**. Draft path: `moneysamurai/drafts/b2b-email-drafts-2026-03-24.md` (**updated 2026-04-13**, ready to send once logged in).
- [ ] **Insurance audit** — 63+ days overdue. Ashlin Hadden / Veracity. Data ready ($637K). Ev must submit PDF.
- [ ] **ShipBob UROs** — 56+ days, ~$1K accrued ($18/day). Harsh Khanna escalated 3/26.
- [ ] **Shopify API dead** — 42+ days. No inventory visibility. Needs token regen.
- [ ] **Amazon CA suppressed** — 18+ days, ~$270+ lost ($15/day). Needs WHMIS SDS submission. **Blocked:** Seller Central access (OpenClaw browser currently logged out; user Chrome attach requires Chrome running).
  - Re-checked **2026-04-15 2:00 PM PT**: openclaw Seller Central **US + CA** still show the public “Create/Become a seller” marketing pages with **“Log in”** (not authenticated).
  - **2026-04-16 EOD:** no progress; still blocked on Seller Central access.

## 🟡 NEEDS EV
- [ ] **Ramp sign-in alert** — msg id **191928** (2026-04-16). Login method Google; device **Chrome on Mac OS X 10.15.7**; IP **136.226.54.172** (ZSCALER). **Action:** confirm if this was you; if not, use “sign out everywhere” + reset Google pw. **EOD:** still unconfirmed.
- [ ] **Reply: Eric Patrick (Shopify contact form)** — asked how to open 8oz bottle (inner plastic cap/plug). Email: epatrick@americansteelfabllc.com, phone 248-941-8433. Draft ready (`moneysamurai/drafts/customer-replies-2026-04-09.md`), msg id **5941**.
- [ ] **Reply: Antonio Gutierrez (Shopify)** — order **#6000**: asking if shipped + ship date. Email: gluemasters@vividcreativeaquatics.com, phone 602-284-2106. Draft ready (`moneysamurai/drafts/customer-replies-2026-04-09.md`), msg id **5930** (needs ship status fields filled).
- [ ] **Michael Nasholm** — 20% partial refund on Shopify PROMISED, NOT DONE. Customer followed up 4/3.
- [ ] **Donaldson $2,340** — paid, needs to ship. 1801 W Vine St, Harrisonville MO 64701. Weekend lost. Note: procurement says they’re **closed May 25 (Memorial Day)** → **don’t schedule deliveries** that date. NET30 request is generally possible (submit justification). **EOD:** still pending shipping execution.
- [ ] **Gemifly LLC** — $1,513.23 PayPal invoice outstanding (auto-reminder sent 4/3).
- [ ] **Dynasty Global (Eli)** — dealer inquiry, Ev decision needed.
- [ ] **Teikametrics $149** — they replied 4/8: **no refund** (claims cancellation was 2 days into cycle); promised no further billing + stop pacing emails, but pacing email still arrived (e.g. **4/9 msg id 191754**). **Chargeback deadline (Apr 14 EOD) has passed** → Ev: check if bank still allows; otherwise treat as sunk + ensure no more billing.
- [ ] **Ethan Miller** — order #5786, 4× Thick 16oz replacement not created at ShipBob.
- [ ] **Josh Mintz** — 8oz Medium sample to New Orleans, overdue since 3/24 (12 days).
- [ ] **Walmart unshipped order** — auto-cancel risk.
- [ ] **KMS LLC (Brittni)** — wholesale distributor, 15+ days silence.
- [ ] **Christopher Webber** — B2B inquiry, 11+ days.
- [ ] **Jason F return** — decision pending.
- [ ] **Claude/Anthropic billing** — billing block hit earlier cron run; fix billing/credits or switch affected jobs to another model.
- [ ] **Vercel billing** — $53.31 card retry.

## 🔵 IN PROGRESS
- [ ] **Amazon PPC** — 11 campaigns, ~$773/day spend, 2.42× ROAS, 41% ACoS.
- [ ] **A3 Partners PO 28** — UPS ETA Apr 3. Invoice $3,312.37 due 4/25.
- [ ] **Designcoffers** — pump accelerator label revisions (Fiverr).
- [ ] **Ads daily pull** — ✅ **confirmed working 2026-04-12** (snapshot **2026-04-11**): campaigns (10) + keywords (97) + search-terms (308; 57 new) pulled successfully; digest + dashboard generated. Latest run logs: `logs/ads-daily/2026-04-12/01_pull_reports.log` + `04_generate_digest.log` + `05_dashboard_gen.log`. Code fix: `moneysamurai@93bbb4e` (fallbacks/chunking + better failure surfacing).
  - **Recovered:** re-pulled the two bad snapshots successfully:
    - **2026-04-13** → keywords **102** rows, search-terms **305**
    - **2026-04-14** → keywords **104** rows, search-terms **313**
  - **Resilience added (2026-04-16):** `ads-daily-pull.py` now tries **DAILY** timeUnit fallback before chunking if SUMMARY returns suspicious empty `[]` (and aggregates back to SUMMARY). Added offline triage tool: `moneysamurai/scripts/ads-pull-triage.py` (commit `moneysamurai@479b054`).
  - Digest status fix is **committed** in `moneysamurai@f0d81f0` (plus consistency tweak in `e5eebb2`).

## 📋 BACKLOG
- [ ] Wire flywheel data into MoneySamurai PPC frontend
- [ ] Back-in-stock notification app (Shopify)
- [ ] Refund policy links to gravixadhesives.com (needs `write_legal_policies`)
- [ ] Google Search Console sitemap submission
- [ ] Opinew review import verification (1,183 reviews)
- [ ] Bundle offers (needs product strategy)
- [ ] B2B Batch 1 outreach (EDCO, Crown Awards, PersonalizationMall)
- [ ] 2oz Thick Auto budget increase ($25→$50/day)
- [ ] Oversold inventory: Gel 20g (-6), Thick 2oz (-1)

## 💸 OPS DEBT ($33/day burn)
| Item | Days | Accrued |
|------|------|---------|
| ShipBob UROs | 56+ | ~$1,008 |
| Amazon CA | 18+ | ~$270 |
| Teikametrics | 5 | $149 |
| Gemifly LLC | — | $1,513.23 |
| Shopify API | 42+ | blind |
| Insurance | 63+ | non-renewal |
| **Total** | | **$2,940+** |

## 📅 REMINDERS
- [ ] **2026-04-20** — Nudge Petite Keep (Kaylee Hobbs) re: reorder
