# BUSINESS_STATE.md — Active Business State

Last updated: 2026-04-23 6:25 PM PT

This replaces `KANBAN.md`. `KANBAN.md` is retired and must not be used as an active source of truth.

## 🔴 Needs Ev / time-sensitive

### Donaldson onboarding
- Rachael Fitzgerald says onboarding is almost finished.
- Needs either Quality/ISO certification copies or one final super-glue certification form.
- Source: `sales` msg **6048**.

### Jeremy Embry / Aquarium Artisans
- Wants urgent CA + accelerator support for Monday aquascape job.
- Needs 16oz Medium + 16oz Thick with accelerator ASAP.
- Also wants 2oz Medium + 2oz Thick for store.
- Source: `sales` msg **6046**.

### American Express past-due notice
- Notice says account ending **271002** is past due and may lose spending privileges.
- Ev should verify/pay directly through Amex, not email links.
- Source: `gluemasters` msg **192094**.

### Insurance audit
- Overdue; data reportedly ready around **$637K**.
- Ev must submit/handle final PDF.

### Shopify API token
- Current API access is dead; inventory visibility is degraded/blind.
- Needs token regeneration or browser/API workaround.

## 🟡 Customer / B2B follow-up queue

- **Heather / Amazon** — A-to-Z risk. Order **114-0636756-1872255**. Source msg **191366**. Draft exists at `moneysamurai/drafts/b2b-email-drafts-2026-03-24.md`.
- **Eric Patrick** — asked how to open 8oz bottle. Draft exists at `moneysamurai/drafts/customer-replies-2026-04-09.md`; source msg **5941**.
- **Antonio Gutierrez** — order **#6000**, asks if shipped + ship date. Draft exists, needs shipping fields; source msg **5930**.
- **Michael Nasholm** — 20% partial refund was promised but not done; customer followed up.
- **Gemifly LLC** — **$1,513.23** PayPal invoice outstanding.
- **Dynasty Global / Eli** — dealer inquiry; needs Ev decision.
- **Ethan Miller** — order **#5786**, 4× Thick 16oz replacement not created at ShipBob.
- **Josh Mintz** — 8oz Medium sample to New Orleans overdue.
- **Walmart unshipped order** — auto-cancel risk.
- **KMS LLC / Brittni** — wholesale distributor inquiry stale.
- **Christopher Webber** — B2B inquiry stale.
- **Jason F return** — decision pending.

## 🔵 Active product / growth

### Pump Accelerator 8oz
- Supplier: Xtralok, Chicago.
- UPC: **199874971148**.
- Model: **ACC0201**.
- Target price: **$14.99**.
- Designer: Designcoffers/Fiverr; revisions in progress.
- Files: `gluemasters-bizdev/labels/pump-accelerator-8oz/`.

### Amazon PPC
- Tracked state: 11 campaigns, ~$773/day spend, 2.42× ROAS, 41% ACoS.
- Backlog: wire flywheel data into MoneySamurai PPC frontend; consider 2oz Thick Auto budget increase.

### Shopify / marketplace backlog
- Back-in-stock notification app.
- Refund policy links to gravixadhesives.com.
- Google Search Console sitemap submission.
- Opinew review import verification: **1,183 reviews**.
- Bundle offers.
- Oversold inventory watch: Gel 20g (-6), Thick 2oz (-1).

## 🟣 MoneySamurai / systems

- MoneySamurai is the internal analytics/ops platform.
- Ads daily pull latest checked folder: **2026-04-22**.
- If `ads-daily-pull` dies again at **3600s**, stop increasing timeout and do deeper pipeline/log triage.
- Recent timeout patches:
  - `sales-email-monitor`: **180s → 240s**.
  - `evgueni-email-monitor`: **120s → 180s**.
  - `ads-daily-pull`: **1800s → 3600s**.
- Need to verify next monitor runs.

## 🟢 Resolved / do not resurface without fresh evidence

- **ShipBob UROs** — resolved before 2026-04-23. Do not list as active debt/priority unless a new URO issue appears.
- **Canada marketplace noise** — Gluemasters is not actively selling in Canada unless Ev says otherwise; do not treat Amazon CA / WHMIS / SDS noise as a live priority.

## ⚙️ Agent / comms preferences

- Telegram updates should be pretty, colorful, concise, and strongly structured.
- No raw tool output or implementation chatter.
- Surface only results, blockers, risks, and decisions needed.
