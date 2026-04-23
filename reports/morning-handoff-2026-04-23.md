# Morning Handoff — 2026-04-23

Generated: 2026-04-22 23:04 PDT
Source: morning execution board + ops debt + cron watchlist/trend

## Do first
1. ShipBob UROs — 56+ days, ~$1K accrued ($18/day). Harsh Khanna escalated 3/26. (~25m)
2. Insurance audit — 63+ days overdue. Ashlin Hadden / Veracity. Data ready ($637K). Ev must submit PDF. (~20m)
3. Heather (Amazon) — 20+ days no reply. A-to-Z claim risk. Details recovered (Himalaya msg id 191366, 2026-03-24, Order 114-0636756-1872255): buyer says they have not received an update from Amazon nor a replacement. Draft path: `moneysamurai/drafts/b2b-email-drafts-2026-03-24.md` (updated 2026-04-13, ready to send once logged in). (~8m)
4. Shopify API dead — 42+ days. No inventory visibility. Needs token regen. (~20m)
5. Teikametrics $149 — they replied 4/8: no refund (claims cancellation was 2 days into cycle); promised no further billing + stop pacing emails, but pacing email still arrived (e.g. 4/9 msg id 191754). Chargeback deadline (Apr 14 EOD) has passed → Ev: check if bank still allows; otherwise treat as sunk + ensure no more billing. (~7m)

## Needs Ev
- Insurance audit — 63+ days overdue. Ashlin Hadden / Veracity. Data ready ($637K). Ev must submit PDF.
- Teikametrics $149 — they replied 4/8: no refund (claims cancellation was 2 days into cycle); promised no further billing + stop pacing emails, but pacing email still arrived (e.g. 4/9 msg id 191754). Chargeback deadline (Apr 14 EOD) has passed → Ev: check if bank still allows; otherwise treat as sunk + ensure no more billing.
- Walmart unshipped order — auto-cancel risk.
- Josh Mintz — 8oz Medium sample to New Orleans, overdue since 3/24 (12 days).
- Cron timeouts — newly observed on 2026-04-18: `moneysamurai-sync-trigger`, `gravix-aggregate-knowledge`, and `gravix-send-followups` all hit their timeout on latest run. Nightly 2026-04-19: triage dashboard + report built (`reports/cron-timeout-dashboard-2026-04-19.{html,md,json}`) plus reusable renderer (`scripts/build_cron_timeout_dashboard.py`). Findings: all three share a hard ~60s timeout signature; likely wrapper/runtime budget issue first, with MoneySamurai also carrying cleanup-schema mismatch noise. Late-night 2026-04-19: added live config snapshot + timeout-headroom watchlist (`reports/cron-list-snapshot-2026-04-19.json`, `reports/cron-watchlist-2026-04-19.{html,md,json}`, `scripts/build_cron_watchlist.py`). Midday 2026-04-20: applied the ready live patch for `moneysamurai-sync-trigger`, raising `timeoutSeconds` from 60 → 120 on job `c6565127-2875-4a1d-be8f-1c0021dd0ade`. Nightly 2026-04-20: refreshed the live cron snapshot/watchlist (`reports/cron-list-snapshot-2026-04-21.json`, `reports/cron-watchlist-2026-04-21.{html,md,json}`) and folded cron watchlist links + summary into the morning ops build (`scripts/ops_build.py`, `scripts/kanban_morning_builder.py`). Midday 2026-04-21: live cron state showed `moneysamurai-sync-trigger` still green, `gravix-aggregate-knowledge` no longer red, and a new repeated timeout on `sales-email-monitor`; patched `sales-email-monitor` (`280c5ddc-93ca-4011-980e-4740a51a4eb5`) from 120 → 180. Midday 2026-04-22: `sales-email-monitor` is now healthy; `ads-daily-pull` remained the main live blocker after 3 straight timeout failures, so job `05a6e66b-d1df-46af-b164-4e55cbb6bb9f` was patched from 1800 → 3600. Remaining blocker: verify the next `ads-daily-pull` run and keep watching `moneysamurai-sync-trigger`, which is healthy but back in the medium-risk runtime band.
- Gemifly LLC — $1,513.23 PayPal invoice outstanding (auto-reminder sent 4/3).

## Customer risk
- Heather (Amazon) — 20+ days no reply. A-to-Z claim risk. Details recovered (Himalaya msg id 191366, 2026-03-24, Order 114-0636756-1872255): buyer says they have not received an update from Amazon nor a replacement. Draft path: `moneysamurai/drafts/b2b-email-drafts-2026-03-24.md` (updated 2026-04-13, ready to send once logged in).
- Teikametrics $149 — they replied 4/8: no refund (claims cancellation was 2 days into cycle); promised no further billing + stop pacing emails, but pacing email still arrived (e.g. 4/9 msg id 191754). Chargeback deadline (Apr 14 EOD) has passed → Ev: check if bank still allows; otherwise treat as sunk + ensure no more billing.
- Walmart unshipped order — auto-cancel risk.
- Jason F return — decision pending.
- 2026-04-20 — Nudge Petite Keep (Kaylee Hobbs) re: reorder
- Reply: Eric Patrick (Shopify contact form) — asked how to open 8oz bottle (inner plastic cap/plug). Email: epatrick@americansteelfabllc.com, phone 248-941-8433. Draft ready (`moneysamurai/drafts/customer-replies-2026-04-09.md`), msg id 5941.

## Unblock / verify
- Heather (Amazon) — 20+ days no reply. A-to-Z claim risk. Details recovered (Himalaya msg id 191366, 2026-03-24, Order 114-0636756-1872255): buyer says they have not received an update from Amazon nor a replacement. Draft path: `moneysamurai/drafts/b2b-email-drafts-2026-03-24.md` (updated 2026-04-13, ready to send once logged in).
- Shopify API dead — 42+ days. No inventory visibility. Needs token regen.
- Ramp sign-in alert — msg id 191928 (2026-04-16). Login method Google; device Chrome on Mac OS X 10.15.7; IP 136.226.54.172 (ZSCALER). Action: confirm if this was you; if not, use “sign out everywhere” + reset Google pw. EOD 2026-04-19: still unconfirmed in visible context.
- Ads daily pull — ✅ confirmed working 2026-04-12 (snapshot 2026-04-11): campaigns (10) + keywords (97) + search-terms (308; 57 new) pulled successfully; digest + dashboard generated. Latest run logs: `logs/ads-daily/2026-04-12/01_pull_reports.log` + `04_generate_digest.log` + `05_dashboard_gen.log`. Code fix: `moneysamurai@93bbb4e` (fallbacks/chunking + better failure surfacing).
- Timeout watchlist: 1 critical, 1 medium, 3 ready timeout patches.
- Verify ads-daily-pull after the 3600s bump; latest observed run hit 1800057 ms on a 1800s timeout.
- Trend: 1 regressing, 1 improving, 0 newly surfaced risks across 3 saved days.
- Ops debt exposure: $3,362.54 open, $33/day true burn, $990 30-day burn exposure.

## Copy/paste starter
Morning stack for 2026-04-23:
- [ ] ShipBob UROs — 56+ days, ~$1K accrued ($18/day). Harsh Khanna escalated 3/26.
- [ ] Insurance audit — 63+ days overdue. Ashlin Hadden / Veracity. Data ready ($637K). Ev must submit PDF.
- [ ] Heather (Amazon) — 20+ days no reply. A-to-Z claim risk. Details recovered (Himalaya msg id 191366, 2026-03-24, Order 114-0636756-1872255): buyer says they have not received an update from Amazon nor a replacement. Draft path: `moneysamurai/drafts/b2b-email-drafts-2026-03-24.md` (updated 2026-04-13, ready to send once logged in).
- [ ] Shopify API dead — 42+ days. No inventory visibility. Needs token regen.
- [ ] Teikametrics $149 — they replied 4/8: no refund (claims cancellation was 2 days into cycle); promised no further billing + stop pacing emails, but pacing email still arrived (e.g. 4/9 msg id 191754). Chargeback deadline (Apr 14 EOD) has passed → Ev: check if bank still allows; otherwise treat as sunk + ensure no more billing.

