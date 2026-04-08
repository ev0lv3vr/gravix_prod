#!/usr/bin/env python3
"""ops_debt_dashboard.py

Generate a local-file-friendly Ops Debt dashboard from `moneysamurai/data/ops-debt.json`.

Outputs (tracked):
- reports/ops-debt-dashboard-YYYY-MM-DD.html
- reports/ops-debt-dashboard-latest.html

Also writes a JSON artifact next to it (ignored by repo .gitignore but useful locally):
- reports/ops-debt-dashboard-YYYY-MM-DD.json
- reports/ops-debt-dashboard-latest.json

Usage:
  python3 scripts/ops_debt_dashboard.py
  python3 scripts/ops_debt_dashboard.py --date 2026-04-08
"""

from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import date, datetime
from html import escape
from pathlib import Path
import argparse
import json
import shutil
from typing import Any, Iterable

ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "moneysamurai" / "data" / "ops-debt.json"
REPORTS = ROOT / "reports"


@dataclass
class DebtRow:
    id: str
    name: str
    status: str
    category: str | None
    start_date: str
    end_date: str | None
    days_active: int
    daily_rate: float
    estimated_daily_impact: float
    one_time: float
    accrued: float
    description: str
    fix_action: str
    fix_effort: str | None
    fix_time_minutes: int | None
    updated: str | None


STATUS_LABELS = {
    "critical": "CRITICAL",
    "active": "ACTIVE",
    "blocked": "BLOCKED",
    "uncertain": "UNCERTAIN",
    "fixed": "FIXED",
}

STATUS_ORDER = {
    "critical": 0,
    "active": 1,
    "uncertain": 2,
    "blocked": 3,
    "fixed": 9,
}

EFFORT_ORDER = {"low": 0, "medium": 1, "high": 2, "done": 9}


def _parse_date(s: str) -> date:
    return datetime.strptime(s, "%Y-%m-%d").date()


def _days_between(a: date, b: date) -> int:
    return max((b - a).days, 0)


def calculate_row(item: dict[str, Any], as_of: datetime) -> DebtRow:
    start = _parse_date(item["start_date"])
    end = _parse_date(item["end_date"]) if item.get("end_date") else None

    status = str(item.get("status") or "active").strip().lower()
    # Normalize legacy/variant statuses into the dashboard's canonical buckets.
    if status in {"in_progress", "progress", "working"}:
        status = "active"
    if status in {"done", "complete", "completed"}:
        status = "fixed"

    # If fixed, prefer end_date, otherwise use as_of.
    as_of_d = as_of.date()
    effective_end_d = end if end else as_of_d
    if status == "fixed" and end is None:
        effective_end_d = as_of_d

    days_active = _days_between(start, min(effective_end_d, as_of_d))

    daily_rate = float(item.get("daily_rate") or 0.0)
    estimated_daily_impact = float(item.get("estimated_daily_impact") or 0.0)
    one_time = float(item.get("one_time") or 0.0)

    # Accrued is conservative: only count daily_rate (true bleed) + one_time.
    accrued = one_time + (daily_rate * days_active)

    return DebtRow(
        id=str(item.get("id") or ""),
        name=str(item.get("name") or ""),
        status=status,
        category=item.get("category"),
        start_date=item["start_date"],
        end_date=item.get("end_date"),
        days_active=days_active,
        daily_rate=daily_rate,
        estimated_daily_impact=estimated_daily_impact,
        one_time=one_time,
        accrued=round(accrued, 2),
        description=str(item.get("description") or ""),
        fix_action=str(item.get("fix_action") or ""),
        fix_effort=item.get("fix_effort"),
        fix_time_minutes=item.get("fix_time_minutes"),
        updated=item.get("updated"),
    )


def fmt_money(v: float | None, *, decimals: int = 0) -> str:
    if v is None:
        return "—"
    if abs(v) < 1e-9:
        return "$0"
    if decimals == 0 and abs(v - round(v)) < 1e-9:
        return f"${int(round(v)):,}"
    return f"${v:,.{decimals}f}"


def build_json_payload(date_str: str, generated_at: str, as_of: str, rows: list[DebtRow]) -> dict[str, Any]:
    active = [r for r in rows if r.status in ("critical", "active")]
    total_accrued = round(sum(r.accrued for r in rows if r.status != "fixed"), 2)
    total_daily_burn = round(sum(r.daily_rate for r in active), 2)
    total_estimated_impact = round(sum(r.estimated_daily_impact for r in active), 2)
    one_time_open = round(sum(r.one_time for r in rows if r.status != "fixed"), 2)

    return {
        "date": date_str,
        "generated_at": generated_at,
        "as_of": as_of,
        "summary": {
            "items_total": len(rows),
            "items_open": len([r for r in rows if r.status != "fixed"]),
            "items_active": len(active),
            "total_accrued": total_accrued,
            "one_time_open": one_time_open,
            "daily_burn": total_daily_burn,
            "estimated_daily_impact": total_estimated_impact,
            "burn_30d": round(total_daily_burn * 30, 2),
        },
        "rows": [asdict(r) for r in rows],
    }


def render_html(payload: dict[str, Any]) -> str:
    date_str = str(payload["date"])
    generated_at = str(payload["generated_at"])
    summary = payload["summary"]
    rows: list[dict[str, Any]] = payload["rows"]

    data_json = json.dumps(payload, ensure_ascii=False)

    links = [
        ("KANBAN", "../KANBAN.md"),
        ("Morning Ops Hub (latest)", "./morning-ops-hub-latest.html"),
        ("Reports folder", "./"),
    ]
    links_html = "".join(
        f"<a class='link' href='{escape(href)}' target='_blank' rel='noreferrer'>{escape(label)}</a>" for label, href in links
    )

    html = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Ops Debt Dashboard — __DATE__</title>
  <style>
    :root {--bg:#0A1628;--surface:#111B2E;--surface2:#0F1A2C;--accent:#3B82F6;--text:#fff;--muted:#94A3B8;--border:#1E293B;--good:#22c55e;--bad:#ef4444;--warn:#f59e0b;}
    *{box-sizing:border-box} body{margin:0;padding:24px;background:var(--bg);color:var(--text);font-family:Inter,-apple-system,sans-serif}
    h1{margin:0 0 6px} .sub{color:var(--muted);margin-bottom:12px;display:flex;flex-wrap:wrap;gap:8px;align-items:center}
    .wrap{max-width:1200px;margin:0 auto}
    .links{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0 18px}
    a.link{color:#93C5FD;text-decoration:none;background:#102446;border:1px solid var(--border);padding:6px 10px;border-radius:10px;font-size:13px}
    a.link:hover{border-color:#2b3a52}
    .badge{display:inline-block;border:1px solid var(--border);border-radius:999px;padding:2px 8px;font-size:12px;color:var(--muted)}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px;margin:14px 0 18px}
    .card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:12px}
    .k{color:var(--muted);font-size:12px} .v{font-size:26px;font-weight:750;margin-top:4px}
    .panel{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px;margin-top:12px}
    .row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
    .pill{display:inline-flex;gap:8px;align-items:center;background:var(--surface2);border:1px solid var(--border);border-radius:999px;padding:6px 10px;font-size:13px;color:var(--muted)}
    .pill input{accent-color:var(--accent)}
    input[type="text"]{background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:10px;padding:8px 10px;min-width:260px}
    button{background:var(--accent);border:none;color:white;border-radius:10px;padding:8px 10px;font-weight:650;cursor:pointer}
    button.secondary{background:transparent;border:1px solid var(--border);color:var(--text)}
    table{width:100%;border-collapse:collapse;font-size:13px}
    th,td{padding:8px;border-bottom:1px solid var(--border);text-align:left;vertical-align:top}
    th{color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.06em}
    .muted{color:var(--muted)}
    .task{white-space:pre-wrap}
    .s-critical{color:var(--bad);font-weight:750}
    .s-active{color:#fca5a5;font-weight:750}
    .s-uncertain{color:var(--warn);font-weight:750}
    .s-blocked{color:#fb7185;font-weight:750}
    .s-fixed{color:var(--good);font-weight:750}
    code{font-family:"JetBrains Mono",ui-monospace,Menlo,monospace;font-size:12px;color:#93C5FD}
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Ops Debt Dashboard</h1>
    <div class="sub">
      <span class="badge">__DATE__</span>
      <span class="muted">Generated: __GENERATED_AT__</span>
      <span class="muted">·</span>
      <span class="muted">Local file friendly (no fetch)</span>
    </div>

    <div class="links">__LINKS__</div>

    <div class="grid" id="cards"></div>

    <div class="panel">
      <div class="row" style="justify-content:space-between">
        <div>
          <div style="font-weight:750;margin-bottom:4px">Copy/paste fix order</div>
          <div class="muted">Sorted for quick wins (effort low → burn/impact high).</div>
        </div>
        <div class="row">
          <button id="copyFixes">Copy fix list</button>
          <button id="copyBurn" class="secondary">Copy burn-only</button>
        </div>
      </div>
      <div style="height:10px"></div>
      <div class="muted">To regenerate: <code>python3 scripts/ops_debt_dashboard.py</code></div>
    </div>

    <div class="panel">
      <div class="row" style="justify-content:space-between;gap:14px">
        <div class="row">
          <span class="pill"><input id="fCritical" type="checkbox" checked /> critical</span>
          <span class="pill"><input id="fActive" type="checkbox" checked /> active</span>
          <span class="pill"><input id="fUncertain" type="checkbox" checked /> uncertain</span>
          <span class="pill"><input id="fBlocked" type="checkbox" checked /> blocked</span>
          <span class="pill"><input id="fFixed" type="checkbox" /> fixed</span>
          <span class="pill"><input id="fBurnOnly" type="checkbox" /> burn/day only</span>
        </div>
        <div class="row">
          <input id="search" type="text" placeholder="Search (shipbob, shopify, sds, insurance…)" />
        </div>
      </div>
      <div style="height:10px"></div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Status</th>
            <th>Name</th>
            <th>Days</th>
            <th>Accrued</th>
            <th>Burn/day</th>
            <th>Est. impact/day</th>
            <th>Fix ETA</th>
            <th>Fix</th>
          </tr>
        </thead>
        <tbody id="rows"></tbody>
      </table>
    </div>
  </div>

  <script>
    const DATA = __DATA_JSON__;

    const fmtMoney = (v) => {
      if (v === null || v === undefined) return '—';
      const rounded = Math.abs(v - Math.round(v)) < 0.0001;
      return rounded ? `$${Math.round(v).toLocaleString()}` : `$${v.toFixed(2)}`;
    };

    const enabled = (status) => {
      const s = (status || '').toLowerCase();
      if (s === 'critical') return document.getElementById('fCritical').checked;
      if (s === 'active') return document.getElementById('fActive').checked;
      if (s === 'uncertain') return document.getElementById('fUncertain').checked;
      if (s === 'blocked') return document.getElementById('fBlocked').checked;
      if (s === 'fixed') return document.getElementById('fFixed').checked;
      return true;
    };

    function renderCards() {
      const s = DATA.summary;
      const cards = [
        { k: 'Open items', v: s.items_open },
        { k: 'Active/critical', v: s.items_active },
        { k: 'Total accrued (open)', v: fmtMoney(s.total_accrued) },
        { k: 'One-time $ open', v: fmtMoney(s.one_time_open) },
        { k: 'Daily burn (true)', v: `$${Math.round(s.daily_burn)}/d` },
        { k: 'Est. impact/day', v: s.estimated_daily_impact ? `$${Math.round(s.estimated_daily_impact)}/d` : '—' },
        { k: '30-day burn exposure', v: fmtMoney(s.burn_30d) },
      ];
      document.getElementById('cards').innerHTML = cards
        .map(c => `<div class="card"><div class="k">${c.k}</div><div class="v">${c.v}</div></div>`)
        .join('');
    }

    function statusClass(s) {
      const x = (s || '').toLowerCase();
      return x === 'critical' ? 's-critical'
        : x === 'active' ? 's-active'
        : x === 'uncertain' ? 's-uncertain'
        : x === 'blocked' ? 's-blocked'
        : x === 'fixed' ? 's-fixed'
        : '';
    }

    function renderRows() {
      const q = (document.getElementById('search').value || '').trim().toLowerCase();
      const burnOnly = document.getElementById('fBurnOnly').checked;
      const rows = (DATA.rows || []).filter(r => {
        if (!enabled(r.status)) return false;
        if (burnOnly && !(r.daily_rate && r.daily_rate > 0)) return false;
        if (q) {
          const hay = `${r.name} ${r.description} ${r.fix_action} ${r.category || ''}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      });

      document.getElementById('rows').innerHTML = rows
        .map((r, idx) => {
          const fixEta = r.fix_time_minutes ? `${r.fix_time_minutes}m` : '—';
          const burn = (r.daily_rate && r.daily_rate > 0) ? `<span class="s-critical">${fmtMoney(r.daily_rate)}</span>` : '—';
          const impact = (r.estimated_daily_impact && r.estimated_daily_impact > 0) ? `<span class="s-uncertain">${fmtMoney(r.estimated_daily_impact)}</span>` : '—';
          return `
            <tr>
              <td>${idx + 1}</td>
              <td class="${statusClass(r.status)}">${(r.status || '').toUpperCase()}</td>
              <td class="task"><b>${r.name}</b><div class="muted">${r.description || ''}</div></td>
              <td>${r.days_active ?? '—'}</td>
              <td>${fmtMoney(r.accrued)}</td>
              <td>${burn}/d</td>
              <td>${impact}/d</td>
              <td>${fixEta}</td>
              <td class="task">${r.fix_action || '—'}</td>
            </tr>
          `;
        }).join('') || `<tr><td colspan="9" class="muted">No items matched the filter.</td></tr>`;
    }

    function copyText(text) {
      navigator.clipboard.writeText(text).catch(() => window.prompt('Copy this text:', text));
    }

    function fixOrder() {
      const open = (DATA.rows || []).filter(r => r.status !== 'fixed');
      const effort = (x) => {
        const e = (x || 'high').toLowerCase();
        return ({'low':0,'medium':1,'high':2,'done':9})[e] ?? 9;
      };
      return open.sort((a, b) => {
        const ea = effort(a.fix_effort); const eb = effort(b.fix_effort);
        if (ea !== eb) return ea - eb;
        const ba = (a.daily_rate || 0) + (a.estimated_daily_impact || 0) * 0.2;
        const bb = (b.daily_rate || 0) + (b.estimated_daily_impact || 0) * 0.2;
        return bb - ba;
      });
    }

    function wireCopyButtons() {
      document.getElementById('copyFixes').addEventListener('click', () => {
        const list = fixOrder();
        const lines = [
          `Ops Debt Fix Order — ${DATA.date} (${DATA.generated_at})`,
          '',
          ...list.map((r, i) => {
            const burn = r.daily_rate ? `${Math.round(r.daily_rate)}/d` : '0/d';
            const imp = r.estimated_daily_impact ? ` impact~${Math.round(r.estimated_daily_impact)}/d` : '';
            const eta = r.fix_time_minutes ? ` ~${r.fix_time_minutes}m` : '';
            return `- [ ] ${i+1}. ${r.name} (${burn}${imp}${eta}) — ${r.fix_action}`;
          }),
          ''
        ];
        copyText(lines.join('\n'));
      });
      document.getElementById('copyBurn').addEventListener('click', () => {
        const burn = fixOrder().filter(r => (r.daily_rate || 0) > 0);
        const lines = [
          `Burn-only items — ${DATA.date}`,
          '',
          ...burn.map(r => `- [ ] ${r.name} — $${Math.round(r.daily_rate)}/day — ${r.fix_action}`),
          ''
        ];
        copyText(lines.join('\n'));
      });
    }

    function wireFilters() {
      for (const id of ['fCritical','fActive','fUncertain','fBlocked','fFixed','fBurnOnly']) {
        document.getElementById(id).addEventListener('change', renderRows);
      }
      document.getElementById('search').addEventListener('input', () => {
        clearTimeout(window.__t);
        window.__t = setTimeout(renderRows, 80);
      });
    }

    renderCards();
    renderRows();
    wireCopyButtons();
    wireFilters();
  </script>
</body>
</html>
"""

    return (
        html.replace("__DATE__", escape(date_str))
        .replace("__GENERATED_AT__", escape(generated_at))
        .replace("__LINKS__", links_html)
        .replace("__DATA_JSON__", data_json)
    )


def clone_latest(versioned: Path, latest: Path) -> None:
    shutil.copyfile(versioned, latest)


def main(argv: Iterable[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Generate Ops Debt Dashboard")
    parser.add_argument("--date", help="Output date (YYYY-MM-DD). Defaults to local today.")
    args = parser.parse_args(list(argv) if argv is not None else None)

    if not DATA_PATH.exists():
        raise SystemExit(f"Missing ops debt data: {DATA_PATH}")

    now = datetime.now().astimezone()
    date_str = args.date or now.strftime("%Y-%m-%d")
    generated_at = now.strftime("%Y-%m-%d %H:%M %Z")
    as_of = now.isoformat()

    raw = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    rows = [calculate_row(item, now) for item in raw]

    # Sort: critical/active first, then burn desc, then accrued desc
    rows.sort(
        key=lambda r: (
            STATUS_ORDER.get(r.status, 99),
            -(r.daily_rate + (r.estimated_daily_impact * 0.2)),
            -r.accrued,
            -r.days_active,
        )
    )

    payload = build_json_payload(date_str, generated_at, as_of, rows)
    html = render_html(payload)

    REPORTS.mkdir(parents=True, exist_ok=True)

    html_path = REPORTS / f"ops-debt-dashboard-{date_str}.html"
    json_path = REPORTS / f"ops-debt-dashboard-{date_str}.json"
    html_latest = REPORTS / "ops-debt-dashboard-latest.html"
    json_latest = REPORTS / "ops-debt-dashboard-latest.json"

    html_path.write_text(html, encoding="utf-8")
    json_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    clone_latest(html_path, html_latest)
    clone_latest(json_path, json_latest)

    print(f"Built {html_path.relative_to(ROOT)}")
    print(f"Built {json_path.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
