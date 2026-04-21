# KANBAN — Last updated: 2026-04-20 6:00 PM PT

## 🔴 URGENT
- [ ] **Heather (Amazon)** — 20+ days no reply. A-to-Z claim risk. **Details recovered** (Himalaya msg id **191366**, 2026-03-24, Order **114-0636756-1872255**): buyer says **they have not received an update from Amazon nor a replacement**. Draft path: `moneysamurai/drafts/b2b-email-drafts-2026-03-24.md` (**updated 2026-04-13**, ready to send once logged in).
- [ ] **Insurance audit** — 63+ days overdue. Ashlin Hadden / Veracity. Data ready ($637K). Ev must submit PDF.
- [ ] **ShipBob UROs** — 56+ days, ~$1K accrued ($18/day). Harsh Khanna escalated 3/26.
- [ ] **Shopify API dead** — 42+ days. No inventory visibility. Needs token regen.

## 🟡 NEEDS EV
- [ ] **Ramp sign-in alert** — msg id **191928** (2026-04-16). Login method Google; device **Chrome on Mac OS X 10.15.7**; IP **136.226.54.172** (ZSCALER). **Action:** confirm if this was you; if not, use “sign out everywhere” + reset Google pw. **EOD 2026-04-19:** still unconfirmed in visible context.
- [ ] **Reply: Eric Patrick (Shopify contact form)** — asked how to open 8oz bottle (inner plastic cap/plug). Email: epatrick@americansteelfabllc.com, phone 248-941-8433. Draft ready (`moneysamurai/drafts/customer-replies-2026-04-09.md`), msg id **5941**.
- [ ] **Reply: Antonio Gutierrez (Shopify)** — order **#6000**: asking if shipped + ship date. Email: gluemasters@vividcreativeaquatics.com, phone 602-284-2106. Draft ready (`moneysamurai/drafts/customer-replies-2026-04-09.md`), msg id **5930** (needs ship status fields filled).
- [ ] **Michael Nasholm** — 20% partial refund on Shopify PROMISED, NOT DONE. Customer followed up 4/3.
- [ ] **Gemifly LLC** — $1,513.23 PayPal invoice outstanding (auto-reminder sent 4/3).
- [ ] **Dynasty Global (Eli)** — dealer inquiry, Ev decision needed.
- [ ] **Teikametrics $149** — they replied 4/8: **no refund** (claims cancellation was 2 days into cycle); promised no further billing + stop pacing emails, but pacing email still arrived (e.g. **4/9 msg id 191754**). **Chargeback deadline (Apr 14 EOD) has passed** → Ev: check if bank still allows; otherwise treat as sunk + ensure no more billing.
- [ ] **Ethan Miller** — order #5786, 4× Thick 16oz replacement not created at ShipBob.
- [ ] **Josh Mintz** — 8oz Medium sample to New Orleans, overdue since 3/24 (12 days).
- [ ] **Walmart unshipped order** — auto-cancel risk.
- [ ] **KMS LLC (Brittni)** — wholesale distributor, 15+ days silence.
- [ ] **Christopher Webber** — B2B inquiry, 11+ days.
- [ ] **Jason F return** — decision pending.
- [ ] **Claude/Anthropic billing** — Opus cron failed w/ billing/usage error on **2026-04-17**. **Mitigation verified active on 2026-04-18:** summary crons are running on **openai-codex/gpt-5.4** (Midday/Morning/EOD/Nightly). Still needs credit claim / billing fix if we want Anthropic models.
- [ ] **Cron timeouts** — newly observed on **2026-04-18**: `moneysamurai-sync-trigger`, `gravix-aggregate-knowledge`, and `gravix-send-followups` all hit their timeout on latest run. **Nightly 2026-04-19:** triage dashboard + report built (`reports/cron-timeout-dashboard-2026-04-19.{html,md,json}`) plus reusable renderer (`scripts/build_cron_timeout_dashboard.py`). Findings: all three share a hard ~60s timeout signature; likely wrapper/runtime budget issue first, with MoneySamurai also carrying cleanup-schema mismatch noise. **Late-night 2026-04-19:** added live config snapshot + timeout-headroom watchlist (`reports/cron-list-snapshot-2026-04-19.json`, `reports/cron-watchlist-2026-04-19.{html,md,json}`, `scripts/build_cron_watchlist.py`). **Midday 2026-04-20:** applied the ready live patch for `moneysamurai-sync-trigger`, raising `timeoutSeconds` from **60 → 120** on job `c6565127-2875-4a1d-be8f-1c0021dd0ade`. **Nightly 2026-04-20:** refreshed the live cron snapshot/watchlist (`reports/cron-list-snapshot-2026-04-21.json`, `reports/cron-watchlist-2026-04-21.{html,md,json}`) and folded cron watchlist links + summary into the morning ops build (`scripts/ops_build.py`, `scripts/kanban_morning_builder.py`). Latest live picture: `moneysamurai-sync-trigger` is green after the timeout bump; `gravix-aggregate-knowledge` is still the only current timeout-critical job on a 60s budget. Remaining blocker: patch the Gravix timeout and still patch the MoneySamurai cleanup path/schema drift if sync timeouts recur.
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
| Teikametrics | 5 | $149 |
| Gemifly LLC | — | $1,513.23 |
| Shopify API | 42+ | blind |
| Insurance | 63+ | non-renewal |
| **Total** | | **$2,940+** |

## 📅 REMINDERS
- [ ] **2026-04-20** — Nudge Petite Keep (Kaylee Hobbs) re: reorder

## EOD 2026-04-20
- Reviewed today’s journal, yesterday’s journal, MEMORY, KANBAN, and all visible same-day session context available to this cron run before closeout.
- No additional late-day work or resolved items surfaced beyond the midday cron patch on `moneysamurai-sync-trigger`.
- Nightly build added a fresh live cron snapshot/watchlist for **2026-04-21** plus regenerated morning ops artifacts for tomorrow (`morning-priority-pack`, execution board, ops hub, ops build brief).
- Priority stack remains unchanged for tomorrow: ShipBob UROs, insurance audit, Heather/Amazon, Shopify API token regeneration, then the remaining cron timeout follow-up on `gravix-aggregate-knowledge` and Petite Keep.
