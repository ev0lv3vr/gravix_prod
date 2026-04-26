#!/usr/bin/env python3
"""ops_build.py

One command to regenerate the morning ops artifacts + a plain-text brief.

Builds:
- reports/morning-priority-pack-YYYY-MM-DD.md (+ latest)
- reports/morning-execution-board-YYYY-MM-DD.html (+ latest)
- reports/morning-ops-hub-YYYY-MM-DD.html (+ latest)
- reports/morning-handoff-YYYY-MM-DD.{md,html,json} (+ latest)
- reports/morning-decision-desk-YYYY-MM-DD.{md,html,json} (+ latest)
- reports/ops-debt-dashboard-YYYY-MM-DD.html (+ latest)
- reports/ads-pull-incident-YYYY-MM-DD.{md,html,json} (+ latest)
- reports/cron-trend-report-YYYY-MM-DD.html (+ latest, when dated watchlists exist)
- reports/ops-build-brief-YYYY-MM-DD.txt (+ latest)

Usage:
  python3 scripts/ops_build.py
  python3 scripts/ops_build.py --tomorrow
  python3 scripts/ops_build.py --date 2026-04-09
  python3 scripts/ops_build.py --open
"""

from __future__ import annotations

import argparse
import glob
import json
import os
import shutil
import subprocess
import sys
from dataclasses import dataclass
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
REPORTS = ROOT / "reports"


def _run(cmd: list[str]) -> None:
    subprocess.run(cmd, cwd=str(ROOT), check=True)


def _clone_latest(versioned: Path, latest: Path) -> None:
    shutil.copyfile(versioned, latest)


def _load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def _fmt_money(v: float | int | None) -> str:
    if v is None:
        return "—"
    try:
        x = float(v)
    except Exception:
        return str(v)
    if abs(x) < 1e-9:
        return "$0"
    rounded = abs(x - round(x)) < 1e-9
    return f"${int(round(x)):,}" if rounded else f"${x:,.2f}"


@dataclass
class Brief:
    date: str
    generated_at: str
    kanban: dict[str, Any]
    ops_debt: dict[str, Any]
    ads_pull: dict[str, Any] | None = None
    ads_incident: dict[str, Any] | None = None
    cron_watchlist: dict[str, Any] | None = None
    cron_trend: dict[str, Any] | None = None


def _latest_report(pattern: str) -> Path | None:
    matches = sorted(glob.glob(str(REPORTS / pattern)))
    if not matches:
        return None
    return Path(matches[-1])


def render_brief(b: Brief) -> str:
    k = b.kanban
    o = b.ops_debt
    a = b.ads_pull or {}
    ai = b.ads_incident or {}

    k_top = (k.get("top_actions") or [])[:8]
    o_sum = (o.get("summary") or {})

    lines: list[str] = []
    lines.append(f"OPS BUILD BRIEF — {b.date}")
    lines.append(f"Generated: {b.generated_at}")
    lines.append("")

    lines.append("Artifacts:")
    lines.append("- reports/morning-ops-hub-latest.html")
    lines.append("- reports/morning-priority-pack-latest.md")
    lines.append("- reports/ops-debt-dashboard-latest.html")
    lines.append("- reports/ads-pull-dashboard-latest.html")
    lines.append("- reports/ads-pull-incident-latest.html")
    lines.append("- reports/morning-handoff-latest.html")
    lines.append("- reports/morning-decision-desk-latest.html")
    if b.cron_watchlist:
        lines.append("- latest cron-watchlist-*.html (dated report)")
    if b.cron_trend:
        lines.append("- reports/cron-trend-report-latest.html")
    lines.append("")

    # Ads pull summary (optional)
    a_sum = (a.get("summary") or {}) if isinstance(a, dict) else {}
    if a_sum:
        lines.append("Amazon Ads daily pull (local status):")
        lines.append(f"- Latest day: {a_sum.get('latest_day','—')}")
        latest_is_valid = a_sum.get("latest_is_valid")
        if latest_is_valid is not None:
            ok = "OK" if latest_is_valid else "DEGRADED"
            lines.append(f"- Latest status: {ok} (failed: {', '.join(a_sum.get('latest_failed_reports') or []) or '—'})")
        if a_sum.get("current_invalid_streak") is not None:
            lines.append(f"- Current invalid streak: {a_sum.get('current_invalid_streak')}")
        if a.get("latest_pull_log"):
            lines.append(f"- Latest pull log: {a.get('latest_pull_log')}")
        ai_sum = (ai.get("summary") or {}) if isinstance(ai, dict) else {}
        if ai_sum and latest_is_valid is False:
            lines.append(
                f"- Incident diagnosis: {', '.join(ai_sum.get('core_reports_failed') or ai_sum.get('failed_reports') or ['none'])} failed; {ai_sum.get('core_duplicate_pending_retries', '—')} core duplicate retry loops; {ai_sum.get('core_timeouts', '—')} core timed-out polls"
            )
        lines.append("")

    cw = (b.cron_watchlist.get("summary") or {}) if isinstance(b.cron_watchlist, dict) else {}
    if cw:
        lines.append("Cron timeout watchlist:")
        lines.append(f"- Jobs scanned: {cw.get('jobs_scanned','—')}")
        lines.append(f"- Critical: {cw.get('critical','—')}")
        lines.append(f"- High: {cw.get('high','—')}")
        lines.append(f"- Medium: {cw.get('medium','—')}")
        lines.append(f"- Ready timeout patches: {cw.get('patches_ready','—')}")
        jobs = b.cron_watchlist.get("jobs") or []
        hottest = jobs[0] if jobs else None
        if hottest:
            lines.append(
                f"- Hottest job: {hottest.get('name','—')} ({hottest.get('risk','—')}, last {hottest.get('last_duration_ms','—')} ms on {hottest.get('timeout_seconds','—')} s timeout)"
            )
        lines.append("")

    ct = (b.cron_trend.get("summary") or {}) if isinstance(b.cron_trend, dict) else {}
    if ct:
        lines.append("Cron trend (multi-day):")
        lines.append(f"- Days compared: {ct.get('days_compared','—')}")
        lines.append(f"- Regressing jobs: {ct.get('regressing_jobs','—')}")
        lines.append(f"- Improving jobs: {ct.get('improving_jobs','—')}")
        lines.append(f"- New risks: {ct.get('new_risks','—')}")
        delta = ct.get('delta_vs_previous') or {}
        if delta:
            lines.append(
                f"- Delta vs previous: critical {delta.get('critical','—')}, high {delta.get('high','—')}, medium {delta.get('medium','—')}, patches {delta.get('patches_ready','—')}"
            )
        regressions = b.cron_trend.get("regressing_jobs") or []
        if regressions:
            top = regressions[0]
            lines.append(
                f"- Worst regression: {top.get('name','—')} ({top.get('first',{}).get('risk','—')} → {top.get('last',{}).get('risk','—')})"
            )
        new_risks = b.cron_trend.get("new_risks") or []
        if new_risks:
            top = new_risks[0]
            lines.append(f"- Newest surfaced risk: {top.get('name','—')} ({top.get('last',{}).get('risk','—')})")
        lines.append("")

    # Ops debt summary (from ops-debt-dashboard payload)
    lines.append("Ops debt (from ops-debt.json):")
    lines.append(
        f"- Open items: {o_sum.get('items_open','—')} (active/critical: {o_sum.get('items_active','—')})"
    )
    lines.append(f"- Daily burn (true): {_fmt_money(o_sum.get('daily_burn'))}/day")
    lines.append(f"- Accrued (open): {_fmt_money(o_sum.get('total_accrued'))}")
    if o_sum.get("burn_30d") is not None:
        lines.append(f"- 30-day burn exposure: {_fmt_money(o_sum.get('burn_30d'))}")
    if o_sum.get("one_time_open") is not None:
        lines.append(f"- One-time dollars open: {_fmt_money(o_sum.get('one_time_open'))}")
    lines.append("")

    # Morning ranking summary (from active business-state builder)
    sc = k.get("section_counts") or {}
    source_name = k.get("source_name") or "active state"
    lines.append(f"{source_name} queue depth:")
    lines.append(f"- 🔴 Urgent: {sc.get('urgent','—')}")
    lines.append(f"- 🟡 Needs Ev: {sc.get('needs_ev','—')}")
    lines.append(f"- 🔵 In progress: {sc.get('in_progress','—')}")
    lines.append(f"- 📋 Backlog: {sc.get('backlog','—')}")
    lines.append(f"- Total open tasks ranked: {k.get('total_open','—')}")
    lines.append("")

    lines.append("Top 8 morning actions (ranked):")
    if not k_top:
        lines.append("- (none)")
    else:
        for i, t in enumerate(k_top, 1):
            # keep this terse for copy/paste
            text = str(t.get("text") or "").replace("\n", " ").strip()
            eta = t.get("est_minutes")
            extra = f" ({eta}m)" if eta else ""
            lines.append(f"{i}. {text}{extra}")

    lines.append("")
    lines.append("Build again:")
    lines.append("- ./scripts/ops_build.py")
    lines.append("")
    return "\n".join(lines) + "\n"


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description="Build morning ops artifacts + brief")
    p.add_argument("--date", help="Output date (YYYY-MM-DD). Defaults to local today.")
    p.add_argument("--tomorrow", action="store_true", help="Use local tomorrow as the output date.")
    p.add_argument("--open", action="store_true", help="Open the hub in the default browser (macOS: open).")
    args = p.parse_args(argv)

    now = datetime.now().astimezone()
    date_str = args.date
    if args.tomorrow and not date_str:
        date_str = (now + timedelta(days=1)).strftime("%Y-%m-%d")
    if not date_str:
        date_str = now.strftime("%Y-%m-%d")

    generated_at = now.strftime("%Y-%m-%d %H:%M %Z")

    # Build artifacts (keep these as separate scripts so each remains runnable alone).
    _run([sys.executable, "scripts/ops_debt_dashboard.py", "--date", date_str])
    _run([sys.executable, "scripts/kanban_morning_builder.py", "--date", date_str])
    _run([sys.executable, "scripts/ads_pull_dashboard.py", "--date", date_str])
    _run([sys.executable, "scripts/ads_pull_incident_report.py", "--date", date_str])
    if _latest_report("cron-watchlist-*.json"):
        _run([sys.executable, "scripts/build_cron_trend_report.py", "--output-prefix", f"reports/cron-trend-report-{date_str}"])
    _run([sys.executable, "scripts/build_morning_handoff.py", "--date", date_str])
    _run([sys.executable, "scripts/build_decision_brief.py", "--date", date_str])

    # Compose brief from the latest JSON payloads
    ops_json = REPORTS / "ops-debt-dashboard-latest.json"
    kanban_json = REPORTS / "morning-execution-board-latest.json"
    ads_json = REPORTS / "ads-pull-dashboard-latest.json"
    ads_incident_json = REPORTS / "ads-pull-incident-latest.json"
    cron_watchlist_json = _latest_report("cron-watchlist-*.json")
    cron_trend_json = REPORTS / "cron-trend-report-latest.json"
    if not ops_json.exists():
        raise SystemExit(f"Missing expected artifact: {ops_json}")
    if not kanban_json.exists():
        raise SystemExit(f"Missing expected artifact: {kanban_json}")

    brief = Brief(
        date=date_str,
        generated_at=generated_at,
        kanban=_load_json(kanban_json),
        ops_debt=_load_json(ops_json),
        ads_pull=_load_json(ads_json) if ads_json.exists() else None,
        ads_incident=_load_json(ads_incident_json) if ads_incident_json.exists() else None,
        cron_watchlist=_load_json(cron_watchlist_json) if cron_watchlist_json and cron_watchlist_json.exists() else None,
        cron_trend=_load_json(cron_trend_json) if cron_trend_json.exists() else None,
    )

    REPORTS.mkdir(parents=True, exist_ok=True)
    brief_path = REPORTS / f"ops-build-brief-{date_str}.txt"
    latest_path = REPORTS / "ops-build-brief-latest.txt"
    brief_path.write_text(render_brief(brief), encoding="utf-8")
    _clone_latest(brief_path, latest_path)

    print(f"Built {brief_path.relative_to(ROOT)}")
    print(f"Built {latest_path.relative_to(ROOT)}")
    print("Built reports/morning-ops-hub-latest.html")
    print("Built reports/ops-debt-dashboard-latest.html")
    print("Built reports/ads-pull-dashboard-latest.html")
    print("Built reports/ads-pull-incident-latest.html")
    print("Built reports/morning-handoff-latest.html")
    print("Built reports/morning-decision-desk-latest.html")
    if cron_trend_json.exists():
        print("Built reports/cron-trend-report-latest.html")

    if args.open:
        hub = REPORTS / "morning-ops-hub-latest.html"
        if hub.exists():
            # Best effort; don't fail the build if 'open' isn't available.
            opener = "open" if sys.platform == "darwin" else None
            if opener and shutil.which(opener):
                subprocess.run([opener, str(hub)], cwd=str(ROOT), check=False)
            else:
                print(f"Open manually: {hub}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
