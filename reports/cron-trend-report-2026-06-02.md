# Cron risk trend report

Generated: 2026-06-02 14:02:58 PDT

## Summary

- **days compared:** 3
- **latest date:** 2026-04-22
- **latest:** {'date': '2026-04-22', 'jobs_scanned': 13, 'critical': 1, 'high': 0, 'medium': 1, 'patches_ready': 3}
- **delta vs previous:** {'critical': 0, 'high': 0, 'medium': 0, 'patches_ready': 0}
- **regressing jobs:** 1
- **improving jobs:** 1
- **new risks:** 0
- **stable open risks:** 0

## Source freshness

- **status:** stale
- **report date:** 2026-06-02
- **latest watchlist date:** 2026-04-22
- **age days:** 41
- **note:** Cron trend is historical only; do not treat listed risks as current blockers without a fresh cron snapshot.

## Day-by-day

- 2026-04-19: critical=1, high=0, medium=0, patches_ready=1
- 2026-04-21: critical=1, high=0, medium=1, patches_ready=3
- 2026-04-22: critical=1, high=0, medium=1, patches_ready=3

## Regressing jobs

### ads-daily-pull
- job id: `05a6e66b-d1df-46af-b164-4e55cbb6bb9f`
- risk move: `ok` → `critical`
- last status: `error`
- timeout: `1800` s
- last duration: `1800057` ms
- last error: `cron: job execution timed out`
- series: 2026-04-19:ok → 2026-04-21:medium → 2026-04-22:critical


## New risks

- none

## Stable open risks

- none

## Improving jobs

### moneysamurai-sync-trigger
- job id: `c6565127-2875-4a1d-be8f-1c0021dd0ade`
- risk move: `critical` → `medium`
- last status: `ok`
- timeout: `120` s
- last duration: `78754` ms
- series: 2026-04-19:critical → 2026-04-21:ok → 2026-04-22:medium

