#!/usr/bin/env python3
"""Build a multi-day cron risk trend report from dated watchlists.

Usage:
  python3 scripts/build_cron_trend_report.py [--limit 7] [--output-prefix reports/cron-trend-report-YYYY-MM-DD]

Reads:
  reports/cron-watchlist-YYYY-MM-DD.json

Writes:
  <output_prefix>.json
  <output_prefix>.md
  <output_prefix>.html
  plus latest aliases when output_prefix is under reports/
"""

from __future__ import annotations

import argparse
import html
import json
import re
import shutil
from datetime import datetime
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
REPORTS = ROOT / "reports"
DATE_RE = re.compile(r"cron-watchlist-(\d{4}-\d{2}-\d{2})\.json$")
RISK_SCORE = {"critical": 4, "high": 3, "medium": 2, "ok": 1, "unknown": 0}
RISK_COLOR = {
    "critical": "#dc2626",
    "high": "#d97706",
    "medium": "#ca8a04",
    "ok": "#16a34a",
    "unknown": "#64748b",
}


def find_watchlists(limit: int) -> list[tuple[str, Path]]:
    items: list[tuple[str, Path]] = []
    for path in sorted(REPORTS.glob("cron-watchlist-*.json")):
        m = DATE_RE.search(path.name)
        if not m:
            continue
        items.append((m.group(1), path))
    return items[-limit:]


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def summarize_series(entries: list[tuple[str, dict[str, Any]]]) -> dict[str, Any]:
    summary_rows = []
    jobs: dict[str, dict[str, Any]] = {}

    for day, payload in entries:
        s = payload.get("summary") or {}
        summary_rows.append(
            {
                "date": day,
                "jobs_scanned": s.get("jobs_scanned", 0),
                "critical": s.get("critical", 0),
                "high": s.get("high", 0),
                "medium": s.get("medium", 0),
                "patches_ready": s.get("patches_ready", 0),
            }
        )
        for job in payload.get("jobs") or []:
            bucket = jobs.setdefault(
                job.get("id") or job.get("name") or f"unknown:{len(jobs)}",
                {
                    "id": job.get("id"),
                    "name": job.get("name"),
                    "series": [],
                },
            )
            bucket["series"].append(
                {
                    "date": day,
                    "risk": job.get("risk"),
                    "timeout_seconds": job.get("timeout_seconds"),
                    "last_status": job.get("last_status"),
                    "last_duration_ms": job.get("last_duration_ms"),
                    "timeout_ratio": job.get("timeout_ratio"),
                    "last_error": job.get("last_error"),
                    "proposed_timeout_seconds": job.get("proposed_timeout_seconds"),
                }
            )

    stable = []
    improving = []
    regressing = []
    new_risk = []

    for _, job in jobs.items():
        series = sorted(job["series"], key=lambda x: x["date"])
        first = series[0]
        last = series[-1]
        first_score = RISK_SCORE.get(first.get("risk") or "unknown", 0)
        last_score = RISK_SCORE.get(last.get("risk") or "unknown", 0)
        delta = last_score - first_score
        appeared_recently = len(series) == 1 and last_score >= 2
        record = {
            "id": job.get("id"),
            "name": job.get("name"),
            "first": first,
            "last": last,
            "delta": delta,
            "days_seen": len(series),
            "series": series,
        }
        if appeared_recently:
            new_risk.append(record)
        elif delta >= 1:
            regressing.append(record)
        elif delta <= -1:
            improving.append(record)
        elif last_score >= 2:
            stable.append(record)

    sort_key = lambda item: (-RISK_SCORE.get(item["last"].get("risk") or "unknown", 0), -item["delta"], item["name"] or "")
    stable.sort(key=sort_key)
    regressing.sort(key=sort_key)
    improving.sort(key=lambda item: (-abs(item["delta"]), -RISK_SCORE.get(item["first"].get("risk") or "unknown", 0), item["name"] or ""))
    new_risk.sort(key=sort_key)

    latest = summary_rows[-1] if summary_rows else {}
    previous = summary_rows[-2] if len(summary_rows) >= 2 else None
    latest_delta = None
    if previous:
        latest_delta = {
            key: latest.get(key, 0) - previous.get(key, 0)
            for key in ["critical", "high", "medium", "patches_ready"]
        }

    return {
        "generated_at": datetime.now().astimezone().strftime("%Y-%m-%d %H:%M:%S %Z"),
        "title": "Cron risk trend report",
        "days": summary_rows,
        "summary": {
            "days_compared": len(summary_rows),
            "latest_date": latest.get("date"),
            "latest": latest,
            "delta_vs_previous": latest_delta,
            "regressing_jobs": len(regressing),
            "improving_jobs": len(improving),
            "new_risks": len(new_risk),
            "stable_open_risks": len(stable),
        },
        "regressing_jobs": regressing,
        "improving_jobs": improving,
        "new_risks": new_risk,
        "stable_open_risks": stable,
    }


def render_series(series: list[dict[str, Any]]) -> str:
    return " → ".join(f"{row['date']}:{row.get('risk','unknown')}" for row in series)


def render_markdown(report: dict[str, Any]) -> str:
    lines = [
        f"# {report['title']}",
        "",
        f"Generated: {report['generated_at']}",
        "",
        "## Summary",
        "",
    ]
    for key, value in (report.get("summary") or {}).items():
        lines.append(f"- **{key.replace('_', ' ')}:** {value}")
    lines.extend(["", "## Day-by-day", ""])
    for day in report.get("days") or []:
        lines.append(
            f"- {day['date']}: critical={day['critical']}, high={day['high']}, medium={day['medium']}, patches_ready={day['patches_ready']}"
        )

    def section(title: str, rows: list[dict[str, Any]]) -> None:
        lines.extend(["", f"## {title}", ""])
        if not rows:
            lines.append("- none")
            return
        for row in rows:
            last = row["last"]
            first = row["first"]
            lines.append(f"### {row['name']}")
            lines.append(f"- job id: `{row['id']}`")
            lines.append(f"- risk move: `{first.get('risk')}` → `{last.get('risk')}`")
            lines.append(f"- last status: `{last.get('last_status')}`")
            lines.append(f"- timeout: `{last.get('timeout_seconds')}` s")
            lines.append(f"- last duration: `{last.get('last_duration_ms')}` ms")
            if last.get("last_error"):
                lines.append(f"- last error: `{last['last_error']}`")
            lines.append(f"- series: {render_series(row['series'])}")
            lines.append("")

    section("Regressing jobs", report.get("regressing_jobs") or [])
    section("New risks", report.get("new_risks") or [])
    section("Stable open risks", report.get("stable_open_risks") or [])
    section("Improving jobs", report.get("improving_jobs") or [])
    return "\n".join(lines) + "\n"


def render_html(report: dict[str, Any]) -> str:
    def esc(value: Any) -> str:
        return html.escape("" if value is None else str(value))

    def badge(risk: str) -> str:
        return f"<span class='badge' style='background:{RISK_COLOR.get(risk, '#64748b')}'>{esc((risk or 'unknown').upper())}</span>"

    def render_rows(rows: list[dict[str, Any]], empty: str) -> str:
        if not rows:
            return f"<div class='empty'>{esc(empty)}</div>"
        cards = []
        for row in rows:
            last = row["last"]
            first = row["first"]
            cards.append(f"""
            <section class='card'>
              <div class='top'>
                <div>
                  <h3>{esc(row['name'])}</h3>
                  <div class='muted mono'>{esc(row['id'])}</div>
                </div>
                {badge(last.get('risk') or 'unknown')}
              </div>
              <div class='stats'>
                <div><span>risk move</span><strong>{esc(first.get('risk'))} → {esc(last.get('risk'))}</strong></div>
                <div><span>last status</span><strong>{esc(last.get('last_status'))}</strong></div>
                <div><span>timeout</span><strong>{esc(last.get('timeout_seconds'))} s</strong></div>
                <div><span>last duration</span><strong>{esc(last.get('last_duration_ms'))} ms</strong></div>
              </div>
              <div class='series'>{esc(render_series(row['series']))}</div>
              {f"<div class='error'>{esc(last.get('last_error'))}</div>" if last.get('last_error') else ''}
            </section>
            """)
        return "".join(cards)

    summary = report.get("summary") or {}
    delta = summary.get("delta_vs_previous") or {}
    day_cards = "".join(
        f"<div class='card compact'><div class='muted'>{esc(day['date'])}</div><div class='mini'>critical {esc(day['critical'])} · high {esc(day['high'])} · medium {esc(day['medium'])}</div><div class='mini'>patches {esc(day['patches_ready'])}</div></div>"
        for day in report.get("days") or []
    )

    return f"""<!doctype html>
<html>
<head>
<meta charset='utf-8'>
<title>{esc(report['title'])}</title>
<style>
body {{ font-family: Inter, -apple-system, sans-serif; background:#0A1628; color:#fff; margin:0; padding:32px; }}
.wrap {{ max-width:1200px; margin:0 auto; }}
.grid {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:12px; }}
.card {{ background:#111B2E; border:1px solid #1E293B; border-radius:14px; padding:14px; }}
.compact {{ padding:12px; }}
.panel {{ background:#111B2E; border:1px solid #1E293B; border-radius:16px; padding:18px; margin-top:18px; }}
.top {{ display:flex; justify-content:space-between; gap:16px; align-items:flex-start; }}
.stats {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:10px; margin-top:12px; }}
.stats div {{ background:#0b1220; border:1px solid #1E293B; border-radius:10px; padding:10px; }}
.badge {{ color:#fff; padding:6px 10px; border-radius:999px; font-weight:700; font-size:12px; }}
h1,h2,h3 {{ margin:0; }}
span {{ display:block; color:#94A3B8; font-size:12px; text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px; }}
strong {{ font-size:18px; }}
.muted {{ color:#94A3B8; }}
.mono {{ font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size:13px; }}
.series {{ margin-top:12px; color:#cbd5e1; }}
.error {{ margin-top:10px; color:#fca5a5; }}
.empty {{ color:#94A3B8; }}
.mini {{ color:#cbd5e1; margin-top:6px; }}
</style>
</head>
<body><div class='wrap'>
  <h1>{esc(report['title'])}</h1>
  <p class='muted'>Generated at {esc(report['generated_at'])}</p>

  <div class='grid'>
    <div class='card'><div class='muted'>Latest date</div><div style='font-size:28px;font-weight:800'>{esc(summary.get('latest_date'))}</div></div>
    <div class='card'><div class='muted'>Days compared</div><div style='font-size:28px;font-weight:800'>{esc(summary.get('days_compared'))}</div></div>
    <div class='card'><div class='muted'>Regressing jobs</div><div style='font-size:28px;font-weight:800'>{esc(summary.get('regressing_jobs'))}</div></div>
    <div class='card'><div class='muted'>Improving jobs</div><div style='font-size:28px;font-weight:800'>{esc(summary.get('improving_jobs'))}</div></div>
    <div class='card'><div class='muted'>New risks</div><div style='font-size:28px;font-weight:800'>{esc(summary.get('new_risks'))}</div></div>
    <div class='card'><div class='muted'>Critical Δ vs prev</div><div style='font-size:28px;font-weight:800'>{esc(delta.get('critical', '—'))}</div></div>
  </div>

  <div class='panel'>
    <h2>Day-by-day summary</h2>
    <div class='grid' style='margin-top:12px'>{day_cards}</div>
  </div>

  <div class='panel'><h2>Regressing jobs</h2>{render_rows(report.get('regressing_jobs') or [], 'No regressions detected.')}</div>
  <div class='panel'><h2>New risks</h2>{render_rows(report.get('new_risks') or [], 'No newly surfaced risks.')}</div>
  <div class='panel'><h2>Stable open risks</h2>{render_rows(report.get('stable_open_risks') or [], 'No stable open risks.')}</div>
  <div class='panel'><h2>Improving jobs</h2>{render_rows(report.get('improving_jobs') or [], 'No improvements detected yet.')}</div>
</div></body>
</html>"""


def clone_latest(versioned: Path, latest: Path) -> None:
    shutil.copyfile(versioned, latest)


def main() -> int:
    parser = argparse.ArgumentParser(description="Build cron trend report from dated watchlists")
    parser.add_argument("--limit", type=int, default=7, help="How many dated watchlists to compare")
    parser.add_argument("--output-prefix", help="Output prefix path; defaults to reports/cron-trend-report-<latest-date>")
    args = parser.parse_args()

    watchlists = find_watchlists(args.limit)
    if not watchlists:
        raise SystemExit("No dated cron watchlists found under reports/")

    latest_date = watchlists[-1][0]
    output_prefix = Path(args.output_prefix) if args.output_prefix else REPORTS / f"cron-trend-report-{latest_date}"

    entries = [(day, load_json(path)) for day, path in watchlists]
    report = summarize_series(entries)

    output_prefix.parent.mkdir(parents=True, exist_ok=True)
    output_prefix.with_suffix(".json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    output_prefix.with_suffix(".md").write_text(render_markdown(report), encoding="utf-8")
    output_prefix.with_suffix(".html").write_text(render_html(report), encoding="utf-8")

    if output_prefix.parent.resolve() == REPORTS.resolve():
        clone_latest(output_prefix.with_suffix(".json"), REPORTS / "cron-trend-report-latest.json")
        clone_latest(output_prefix.with_suffix(".md"), REPORTS / "cron-trend-report-latest.md")
        clone_latest(output_prefix.with_suffix(".html"), REPORTS / "cron-trend-report-latest.html")

    print(str(output_prefix))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
