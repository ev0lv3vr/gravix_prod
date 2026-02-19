# KANBAN — Last updated: 2026-02-18 11:10 PM PST

## 🔴 URGENT / BLOCKED
- [ ] **Medium restock** — 8oz: ~5 days, 2oz: ~6 days (could be OOS by weekend) — needs Ev to place PO
- [ ] **ShipBob PAT expired** — blocking fulfillment data since 2/14 — needs Ev to regenerate
- [ ] **ShipBob UROs accruing fees** — 2 shipments On-Hold Receiving, ~$490+ accrued (~$18/day) — needs Ev action
- [ ] **Ethan Miller replacement** — order #5786, 4× Thick 16oz not yet created at ShipBob (spot-check initiated, awaiting result)
- [ ] **Josue Saravia (#5852)** — wants both bottles switched to Ultra Thin — Shopify order edit needed
- [ ] **OOS products still running ads** — $668/mo projected waste: Thick 2oz ($282/mo), Gel 20g ($204/mo), Accelerator ($182/mo) — pause keywords or restock

## 🟡 NEEDS EV / WAITING
- [ ] **Amazon CA/NARF** — disable for chemical ASINs or submit SDS (30-day clock from ~2/15)
- [ ] **Designcoffers** — 2nd revision delivered on Fiverr, awaiting Ev's review
- [ ] **Oversold inventory** — Gel 20g (-6), Thick 2oz (-1)
- [ ] **Back-in-stock notification app** — Shopify App Store
- [ ] **Refund policy** — still links to gravixadhesives.com (needs `write_legal_policies` scope)
- [ ] **Google Search Console** — sitemap submission (needs manual access)
- [ ] **Opinew reviews** — verify 1,183 imported (needs dashboard login)
- [ ] **Thomas Routzon (FEDCON)** — wants to reconnect re: gov't contracting. Ev's call.
- [ ] **Google Cloud** — budget alerts on new paid account
- [ ] **Amazon Ads optimizer** — switch from --dry-run to --execute after verifying actions (3-5 days)
- [ ] **Teikametrics** — disable auto-bidding, set budget cap, phase out (our API handles it now)

## 🔵 IN PROGRESS
- [x] **Amazon Ads Flywheel — All 4 weeks built** — daily pull, optimizer, harvester, weekly reports, anomaly detection, dashboard, war room
- [x] **Amazon Ads API connected** — OAuth complete, 30-day data pulled, 3 new campaigns created
- [x] **Amazon Ads — 3 Cerebro campaigns launched** — Core $50/d, Defense $40/d, Conquest $25/d (starting 2/19)
- [x] **Amazon Ads — bleeders paused** — 2 Teika preset campaigns + catch-all cut 50% ($4,050/mo savings)
- [x] **Noveon Magnetics** — PDF quote sent ($4,140), awaiting buyer approval
- [x] **Quintex Molding** — trial kit + order #5836, USPS redelivery was 2/17, confirm delivery
- [x] **OTL (Mitch Hamilton)** — follow-up email sent 2/16, due for nudge 2/19

## ✅ DONE TODAY (2/18)
- [x] Amazon Ads API connected (OAuth, refresh token, profile ID)
- [x] First 30-day pull: 100 campaigns, 2,468 search terms, $6,959 spend → $10,183 sales (68.3% ACoS)
- [x] Paused 2 bleeding campaigns ($2,549 combined → 193% + 356% ACoS)
- [x] Cut Awareness catch-all budget $100→$50/day
- [x] New "Super Glue Exact" campaign ($30/day, 14 exact keywords)
- [x] 26 negative keywords added to catch-all
- [x] Boosted "2oz thick & 8oz medium" budget $200→$250/day, bid $0.80→$1.20
- [x] Cerebro analysis: 3,970 our keywords, 2,533 competitor keywords, 926 gaps
- [x] 3 new Cerebro campaigns via API (Core, Defense, Conquest) — total +$115/day
- [x] Ads strategy plan → `moneysamurai/plans/amazon-ads-strategy.md`
- [x] SEO blog post #4 published ("CA Glue Fogging and Blooming")
- [x] ShipBob/Ethan Miller: spot-check initiated, $42 mfg credit submitted
- [x] Morning + midday + EOD briefings delivered

## ✅ NIGHTLY BUILD (2/18 11PM)
- [x] **Ads War Room Dashboard** — `moneysamurai/data/ads/warroom.html` (29KB, self-contained)
  - Combines: campaign performance + keyword intelligence + search term analysis + inventory risk + optimizer actions
  - Color-coded KPIs, strategy mix bars, bleeding keywords, search term funnel
- [x] **B2B Follow-Up Tracker** — `gluemasters-bizdev/tools/b2b-followup-tracker.py`
  - 12 prospects tracked, overdue detection, auto-generated follow-up drafts
  - Weekly calendar view, pipeline value by stage, Telegram summary mode
- [x] **Inventory × Ads Waste Calculator** — `gluemasters-bizdev/tools/inventory-ads-waste.py`
  - Cross-references ad spend with inventory levels
  - Found: $156/wk ($668/mo) wasted on 3 OOS products (23 keywords, 80 search terms)
  - Actionable breakdown: which keywords to pause per product
- [x] **Morning War Room runner** — `gluemasters-bizdev/tools/morning-warroom.sh`
  - One-shot script: pulls ads data → optimizer → digest → war room → waste report → B2B status
- [x] B2B pipeline report generated → `gluemasters-bizdev/reports/`

## ✅ DONE RECENTLY
- [x] Ads Flywheel Week 1-4 complete (daily pull, optimizer, harvester, weekly reports, dashboard)
- [x] SEO blog post #3 published (CA Glue for Woodworking)
- [x] Nightly build (2/17): Customer Intelligence, Competitive Intel, B2B Pipeline dashboards
- [x] Morning Command Center dashboard + Restock PO Calculator
- [x] GSC indexing investigation (non-issue confirmed)
- [x] Full site audit, brand merge, product pages, SEO overhaul (2/12)

## 📋 BACKLOG
- [ ] Bundle offers (Phase 4 — needs product strategy)
- [ ] Quintex follow-up — confirm USPS delivery or escalate (due 2/19)
- [ ] OTL follow-up — 3 days since email, gentle nudge (due 2/19)
- [ ] Jaan Malik tracking email (overdue)
- [ ] 5 queued B2B prospects — Frame My TV, The Escape Game, Hess Pumice, Olympus Group, Crown Trophy (~$17K/mo pipeline)
- [ ] Wire flywheel data into MoneySamurai PPC Diagnostic frontend
- [ ] Fix $0 Accelerator campaign (diagnose why no impressions)
- [ ] Competitor ASIN identification for product targeting
- [ ] Teikametrics monthly budget cap
