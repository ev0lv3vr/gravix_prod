# BSR Recovery Dashboard

Interactive dashboard for tracking Glue Masters' BSR recovery from #2,800 back to #1,200.

## Quick Start

Open in browser:
```bash
open index.html
# or
python3 -m http.server 8080  # then visit http://localhost:8080
```

## Features

- **Key Metrics**: Sessions, Units, Revenue, Conversion (YoY comparison)
- **Revenue Chart**: YoY comparison by SKU with prior/current year bars
- **Session Changes**: Horizontal bar chart showing traffic changes per SKU
- **Critical Issues**: 4 tracked issues with checkboxes for action items
  - Accelerator vanished (highest priority)
  - 2oz Thin conversion collapsed
  - Large sizes traffic evaporated
  - Buy Box leak on 2oz Medium
- **Recovery Potential**: +185 units/mo, +8% revenue, 60-90 days to target
- **Recovery Timeline**: 4-phase plan with dates
- **SKU Performance Table**: Full comparison with all metrics

## Data

- **Period**: Dec 29 – Jan 29 (YoY)
- **Source**: Business Reports from Seller Central
- **Analysis**: Based on `analysis/bsr-turnaround-analysis-2026-01.md`

## Checkbox Persistence

Action item checkboxes save state to localStorage, so progress persists across browser sessions.

---

Built by Clyde 🦞 | January 31, 2026
