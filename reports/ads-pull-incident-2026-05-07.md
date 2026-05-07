# Ads Pull Incident Report — 2026-05-07

Generated: 2026-05-06 23:08 PDT
Log: `logs/ads-daily/2026-04-24_060021.log`
Snapshot: `2026-04-23`

## Executive summary
- Severity: **CRITICAL**
- Failed reports: **campaigns, keywords**
- Core duplicate pending retries: **8**
- Core report timeouts: **6**

## Likely cause
- Amazon returned duplicate report IDs that remained PENDING even after fresh-name retries.
- Campaign and keyword reports appear stuck in Amazon's reporting queue, not locally failing fast.

## Findings
- Core datasets failed: campaigns, keywords. Search terms still landed, so the outage is partial rather than a total auth failure.
- Long pending windows observed: campaigns (1189s max observed), keywords (1189s max observed).
- Chunked search-term fallback succeeded and preserved 415 rows, so search-term diagnostics are still usable.
- campaigns.json and keywords.json were saved as literal empty arrays (`[]`), which matches the silent-failure pattern rather than a real zero-spend day.

## Report breakdown
| report | final | attempts | timeouts | dup pending retries | max poll | rows saved | last report id |
|---|---|---:|---:|---:|---:|---:|---|
| campaigns | failed | 3 | 3 | 4 | 1189s | 0 | cfd1a284-2fa4-4bb3-858c-5e2574d1de2e |
| keywords | failed | 3 | 3 | 4 | 1189s | 0 | 8058c988-26c3-4bed-a37d-568420ac9c0e |
| search-terms | completed | 16 | 9 | 18 | 1191s | 415 | 4c20112f-c6ae-4383-9b9a-fdf1f635f4d4 |

## Next commands
```bash
python3 moneysamurai/tools/ads-report-inspect.py --from-log logs/ads-daily/2026-04-24_060021.log --watch --interval 30 --timeout 1200
```
```bash
python3 moneysamurai/scripts/ads-daily-pull.py 2026-04-17 2026-04-23
```
```bash
python3 scripts/ads_pull_incident_report.py
```

