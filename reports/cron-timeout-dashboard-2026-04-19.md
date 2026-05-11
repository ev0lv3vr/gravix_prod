# Nightly cron timeout triage — 2026-04-19

Built from live cron run history for the three jobs called out in KANBAN.

## What I found

All three problem jobs share the same failure signature:

- failure text: `cron: job execution timed out`
- duration: almost exactly `60000 ms`
- normal healthy runtime: usually `15–45s`
- worst healthy runtime observed: `53.8s` for Gravix aggregation, `54.6s` for MoneySamurai trigger

That points to **wrapper/runtime budget exhaustion** much more than backend logic suddenly breaking.

## Job-by-job

### 1) gravix-aggregate-knowledge
- Job ID: `4b6e8fa4-c145-4a72-9496-74ebfb9a0683`
- Healthy baseline: ~18–24s
- Risk signal: one success at `53861 ms`
- Recent timeout: `2026-04-17 04:01 PT` at `60080 ms`
- Take: bump timeout first, then inspect Gravix `cron_run_log` to see whether backend work finished after the wrapper died.

### 2) gravix-send-followups
- Job ID: `47169cc0-9df9-4539-bdec-60405109e017`
- Healthy baseline: ~10–34s
- Recent timeout: `2026-04-17 10:01 PT` at `60073 ms`
- Important detail: it has succeeded on real-send days too, so the send logic itself is not obviously broken.
- Take: increase budget first; if still flaky, add per-phase timing around fetch/render/send/update.

### 3) moneysamurai-sync-trigger
- Job ID: `c6565127-2875-4a1d-be8f-1c0021dd0ade`
- Healthy baseline: ~25–56s
- Recent timeout cluster: many runs on Apr 15–18 pinned at ~60s
- Important detail: historical summaries show cleanup schema mismatches:
  - wrong path attempted: `public.sync_status`
  - working path noted later: `amazon_accounts.sync_status`
  - wrong column attempted: `sync_jobs.error_message`
  - working column hinted later: `sync_jobs.error`
- Take: this job needs both a higher timeout **and** a trimmed preflight path so cleanup doesn’t waste budget.

## Deliverables

- HTML dashboard: `reports/cron-timeout-dashboard-2026-04-19.html`
- Source data: `reports/cron-timeout-dashboard-2026-04-19.json`
- Reusable renderer: `scripts/build_cron_timeout_dashboard.py`

Open the HTML file in a browser tomorrow morning for the quick view.

## Suggested morning sequence

1. Open the dashboard HTML.
2. Raise cron timeout budget above 60s for the three degraded jobs.
3. For Gravix aggregation, query backend `cron_run_log` for the timeout timestamps.
4. For MoneySamurai, patch/reset script references to the known-good schema names before the next trigger cycle.
5. Re-watch next two runs instead of touching business logic immediately.
