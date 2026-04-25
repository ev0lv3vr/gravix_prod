#!/usr/bin/env python3
"""ads_pull_dashboard.py

Build a lightweight dashboard for Amazon Ads daily pull health.

Outputs:
- reports/ads-pull-dashboard-YYYY-MM-DD.html (+ latest)
- reports/ads-pull-dashboard-YYYY-MM-DD.json (+ latest)

Data sources:
- moneysamurai/data/ads/daily/*/pull-status.json
- moneysamurai/data/ads/api-health-log.jsonl (optional)
- logs/ads-daily/*/* (optional; for last pull log path)

No network calls — purely local inspection.
"""

from __future__ import annotations

import argparse
import json
import shutil
from dataclasses import dataclass
from datetime import datetime
from html import escape
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
REPORTS_DIR = ROOT / "reports"
ADS_DAILY_DIR = ROOT / "moneysamurai" / "data" / "ads" / "daily"
ADS_HEALTH_LOG = ROOT / "moneysamurai" / "data" / "ads" / "api-health-log.jsonl"
ADS_PULL_LOGS = ROOT / "logs" / "ads-daily"


def _clone_latest(versioned: Path, latest: Path) -> None:
    latest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(versioned, latest)


def _read_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def _safe_int(v: Any) -> int | None:
    try:
        return int(v)
    except Exception:
        return None


def _find_latest_pull_log() -> str | None:
    if not ADS_PULL_LOGS.exists():
        return None
    candidates = sorted(ADS_PULL_LOGS.rglob("*.log"), key=lambda p: p.stat().st_mtime, reverse=True)
    if not candidates:
        return None
    return str(candidates[0].relative_to(ROOT))


@dataclass
class DayRow:
    date: str
    is_valid: bool
    failed_reports: list[str]
    generated_at: str | None


def load_daily_rows(limit: int = 30) -> list[DayRow]:
    if not ADS_DAILY_DIR.exists():
        return []

    days = sorted([d for d in ADS_DAILY_DIR.iterdir() if d.is_dir()], key=lambda p: p.name)
    rows: list[DayRow] = []
    for d in days[-limit:]:
        status_path = d / "pull-status.json"
        if not status_path.exists():
            continue
        try:
            s = _read_json(status_path)
        except Exception:
            continue
        rows.append(
            DayRow(
                date=d.name,
                is_valid=bool(s.get("isValid")),
                failed_reports=list(s.get("failedReports") or []),
                generated_at=s.get("generatedAt"),
            )
        )
    return rows


def load_health_rows(limit: int = 25) -> list[dict[str, Any]]:
    if not ADS_HEALTH_LOG.exists():
        return []
    out: list[dict[str, Any]] = []
    for line in ADS_HEALTH_LOG.read_text(encoding="utf-8", errors="replace").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            out.append(json.loads(line))
        except Exception:
            continue
    return out[-limit:]


def build_payload(date_str: str) -> dict[str, Any]:
    daily = load_daily_rows(limit=45)
    health = load_health_rows(limit=40)

    # Summary stats
    last_valid = next((r.date for r in reversed(daily) if r.is_valid), None)
    last_row = daily[-1] if daily else None
    degraded_streak = 0
    for r in reversed(daily):
        if r.is_valid:
            break
        degraded_streak += 1

    return {
        "date": date_str,
        "generated_at": datetime.now().astimezone().strftime("%Y-%m-%d %H:%M %Z"),
        "latest_pull_log": _find_latest_pull_log(),
        "summary": {
            "days_seen": len(daily),
            "last_valid_day": last_valid,
            "latest_day": last_row.date if last_row else None,
            "latest_is_valid": last_row.is_valid if last_row else None,
            "latest_failed_reports": last_row.failed_reports if last_row else [],
            "current_invalid_streak": degraded_streak,
        },
        "daily": [
            {
                "date": r.date,
                "is_valid": r.is_valid,
                "failed_reports": r.failed_reports,
                "generated_at": r.generated_at,
            }
            for r in daily
        ],
        "health_checks": health,
    }


def render_html(payload: dict[str, Any]) -> str:
    s = payload.get("summary") or {}
    daily = payload.get("daily") or []
    health = payload.get("health_checks") or []

    def pill(ok: bool, text_ok: str = "OK", text_bad: str = "DEGRADED") -> str:
        if ok:
            return "<span class='pill ok'>OK</span>"
        return "<span class='pill bad'>DEGRADED</span>"

    latest_ok = bool(s.get("latest_is_valid")) if s.get("latest_is_valid") is not None else False

    latest_failed = s.get("latest_failed_reports") or []
    latest_failed_txt = ", ".join(latest_failed) if latest_failed else "—"

    latest_log = payload.get("latest_pull_log") or "—"

    health_rows = "".join(
        """
        <tr>
          <td class='mono'>{ts}</td>
          <td>{status}</td>
          <td>{detail}</td>
        </tr>
        """.format(
            ts=escape(str(h.get("timestamp", "?"))[:19]),
            status=escape(str(h.get("status", "?"))),
            detail=escape(str(h.get("detail", ""))[:200]),
        )
        for h in reversed(health[-20:])
    )

    daily_rows = "".join(
        """
        <tr>
          <td class='mono'>{date}</td>
          <td>{pill}</td>
          <td>{failed}</td>
          <td class='mono'>{gen}</td>
        </tr>
        """.format(
            date=escape(d.get("date", "?")),
            pill=pill(bool(d.get("is_valid"))),
            failed=escape(", ".join(d.get("failed_reports") or []) or "—"),
            gen=escape(str(d.get("generated_at") or "")[:19] or "—"),
        )
        for d in reversed(daily[-21:])
    )

    return f"""<!doctype html>
<html>
<head>
  <meta charset='utf-8' />
  <meta name='viewport' content='width=device-width, initial-scale=1' />
  <title>Amazon Ads Pull Dashboard — {escape(payload.get('date',''))}</title>
  <style>
    :root {{
      --bg: #0A1628;
      --surface: #111B2E;
      --text: #FFFFFF;
      --muted: #94A3B8;
      --ok: #22C55E;
      --bad: #EF4444;
      --warn: #F59E0B;
      --border: rgba(148,163,184,0.18);
      --mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      --sans: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
    }}
    body {{ margin: 0; background: var(--bg); color: var(--text); font-family: var(--sans); }}
    a {{ color: #3B82F6; text-decoration: none; }}
    a:hover {{ text-decoration: underline; }}
    .wrap {{ max-width: 1100px; margin: 0 auto; padding: 20px; }}
    .title {{ font-size: 20px; font-weight: 700; }}
    .sub {{ color: var(--muted); margin-top: 4px; }}
    .grid {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 16px 0; }}
    .card {{ background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 12px; }}
    .k {{ color: var(--muted); font-size: 12px; }}
    .v {{ margin-top: 8px; font-size: 18px; font-weight: 700; }}
    .mono {{ font-family: var(--mono); font-size: 12px; }}
    .pill {{ display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 12px; font-weight: 700; }}
    .pill.ok {{ background: rgba(34,197,94,0.14); color: var(--ok); border: 1px solid rgba(34,197,94,0.25); }}
    .pill.bad {{ background: rgba(239,68,68,0.14); color: var(--bad); border: 1px solid rgba(239,68,68,0.25); }}
    table {{ width: 100%; border-collapse: collapse; }}
    th, td {{ text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--border); vertical-align: top; }}
    th {{ color: var(--muted); font-size: 12px; font-weight: 700; }}
    .section-title {{ margin: 18px 0 10px; font-size: 14px; font-weight: 800; color: var(--muted); letter-spacing: 0.02em; text-transform: uppercase; }}
    .cmd {{ background: rgba(148,163,184,0.08); border: 1px solid var(--border); border-radius: 10px; padding: 10px; font-family: var(--mono); font-size: 12px; white-space: pre-wrap; }}
  </style>
</head>
<body>
  <div class='wrap'>
    <div class='title'>Amazon Ads Pull Dashboard</div>
    <div class='sub'>{escape(str(payload.get('generated_at','')))} · Built for {escape(str(payload.get('date','')))}</div>

    <div class='grid'>
      <div class='card'>
        <div class='k'>Latest day</div>
        <div class='v mono'>{escape(str(s.get('latest_day') or '—'))}</div>
      </div>
      <div class='card'>
        <div class='k'>Latest pull status</div>
        <div class='v'>{pill(latest_ok)}</div>
      </div>
      <div class='card'>
        <div class='k'>Invalid streak</div>
        <div class='v mono'>{escape(str(s.get('current_invalid_streak')))}</div>
      </div>
      <div class='card'>
        <div class='k'>Last valid day</div>
        <div class='v mono'>{escape(str(s.get('last_valid_day') or '—'))}</div>
      </div>
    </div>

    <div class='card'>
      <div class='k'>Latest failed reports</div>
      <div class='v mono' style='font-size: 13px; font-weight: 600;'>{escape(latest_failed_txt)}</div>
      <div class='k' style='margin-top: 10px;'>Latest pull log</div>
      <div class='mono'>{escape(str(latest_log))}</div>
    </div>

    <div class='section-title'>Quick commands</div>
    <div class='cmd'>
# Health check (no download)
python3 moneysamurai/scripts/ads-api-health-check.py

# Inspect reportIds from a pull log (status-only)
python3 moneysamurai/tools/ads-report-inspect.py --from-log {escape(str(latest_log))} --watch --interval 30 --timeout 1200

# Run the daily pull
python3 moneysamurai/scripts/ads-daily-pull.py
    </div>

    <div class='section-title'>Daily pull status (last 21)</div>
    <div class='card'>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Status</th>
            <th>Failed reports</th>
            <th>Generated at</th>
          </tr>
        </thead>
        <tbody>
          {daily_rows or "<tr><td colspan='4' class='mono'>No daily pull-status.json found.</td></tr>"}
        </tbody>
      </table>
    </div>

    <div class='section-title'>Reporting API health checks (last 20)</div>
    <div class='card'>
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Status</th>
            <th>Detail</th>
          </tr>
        </thead>
        <tbody>
          {health_rows or "<tr><td colspan='3' class='mono'>No health log found (moneysamurai/data/ads/api-health-log.jsonl).</td></tr>"}
        </tbody>
      </table>
    </div>

    <div class='sub' style='margin-top: 16px;'>
      Tip: if the daily pull prints only PENDING forever, verify Accept header negotiation with the inspector tool.
    </div>
  </div>
</body>
</html>
"""


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description="Build Amazon Ads pull dashboard")
    p.add_argument("--date", help="Output label date (YYYY-MM-DD). Defaults to local today.")
    args = p.parse_args(argv)

    now = datetime.now().astimezone()
    date_str = args.date or now.strftime("%Y-%m-%d")

    payload = build_payload(date_str)

    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    json_path = REPORTS_DIR / f"ads-pull-dashboard-{date_str}.json"
    html_path = REPORTS_DIR / f"ads-pull-dashboard-{date_str}.html"

    json_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    html_path.write_text(render_html(payload), encoding="utf-8")

    _clone_latest(json_path, REPORTS_DIR / "ads-pull-dashboard-latest.json")
    _clone_latest(html_path, REPORTS_DIR / "ads-pull-dashboard-latest.html")

    print(f"Built {json_path.relative_to(ROOT)}")
    print(f"Built {html_path.relative_to(ROOT)}")
    print("Built reports/ads-pull-dashboard-latest.html")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
