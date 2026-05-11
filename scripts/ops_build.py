#!/usr/bin/env python3
"""ops_build.py

One command to regenerate the morning ops artifacts + a plain-text brief.

Builds:
- reports/morning-priority-pack-YYYY-MM-DD.md (+ latest)
- reports/morning-execution-board-YYYY-MM-DD.html (+ latest)
- reports/morning-ops-hub-YYYY-MM-DD.html (+ latest)
- reports/morning-handoff-YYYY-MM-DD.{md,html,json} (+ latest)
- reports/morning-decision-desk-YYYY-MM-DD.{md,html,json} (+ latest)
- reports/morning-customer-desk-YYYY-MM-DD.{md,html,json} (+ latest)
- reports/morning-money-desk-YYYY-MM-DD.{md,html,json} (+ latest)
- reports/supplier-ops-desk-YYYY-MM-DD.{md,html,json} (+ latest)
- reports/morning-commerce-desk-YYYY-MM-DD.{md,html,json} (+ latest)
- reports/brand-narrative-desk-YYYY-MM-DD.{md,html,json} (+ latest)
- reports/b2b-kit-dispatch-desk-YYYY-MM-DD.{md,html,json} (+ latest)
- reports/b2b-kit-dispatch-labels-YYYY-MM-DD.csv (+ latest)
- reports/morning-unblock-desk-YYYY-MM-DD.{md,html,json} (+ latest)
- reports/morning-delta-brief-YYYY-MM-DD.{md,html,json} (+ latest)
- reports/morning-exception-desk-YYYY-MM-DD.{md,html,json} (+ latest)
- reports/artifact-freshness-YYYY-MM-DD.{md,html,json} (+ latest)
- reports/git-hygiene-YYYY-MM-DD.{md,html,json} (+ latest)
- reports/state-audit-YYYY-MM-DD.{md,html,json} (+ latest)
- reports/morning-actionability-YYYY-MM-DD.{md,html,json} (+ latest)
- reports/ops-debt-dashboard-YYYY-MM-DD.html (+ latest)
- reports/ads-pull-incident-YYYY-MM-DD.{md,html,json} (+ latest)
- reports/ads-growth-readiness-YYYY-MM-DD.{md,html,json} (+ latest)
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
    artifact_freshness: dict[str, Any] | None = None
    git_hygiene: dict[str, Any] | None = None
    state_audit: dict[str, Any] | None = None
    brand_narrative: dict[str, Any] | None = None
    morning_money: dict[str, Any] | None = None
    supplier_ops: dict[str, Any] | None = None
    cron_watchlist: dict[str, Any] | None = None
    cron_trend: dict[str, Any] | None = None
    ads_growth_execution: dict[str, Any] | None = None


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
    lines.append("- reports/ads-growth-execution-latest.html")
    lines.append("- reports/ads-growth-readiness-latest.html")
    lines.append("- reports/morning-handoff-latest.html")
    lines.append("- reports/morning-decision-desk-latest.html")
    lines.append("- reports/morning-customer-desk-latest.html")
    lines.append("- reports/morning-money-desk-latest.html")
    lines.append("- reports/supplier-ops-desk-latest.html")
    lines.append("- reports/morning-commerce-desk-latest.html")
    lines.append("- reports/brand-narrative-desk-latest.html")
    lines.append("- reports/b2b-kit-dispatch-desk-latest.html")
    lines.append("- reports/b2b-kit-dispatch-labels-latest.csv")
    lines.append("- reports/morning-unblock-desk-latest.html")
    lines.append("- reports/morning-delta-brief-latest.html")
    lines.append("- reports/morning-exception-desk-latest.html")
    lines.append("- reports/artifact-freshness-latest.html")
    lines.append("- reports/git-hygiene-latest.html")
    lines.append("- reports/state-audit-latest.html")
    lines.append("- reports/morning-actionability-latest.html")
    if b.cron_watchlist:
        lines.append("- latest cron-watchlist-*.html (dated report)")
    if b.cron_trend:
        lines.append("- reports/cron-trend-report-latest.html")
    lines.append("")

    freshness = k.get("freshness") or {}
    if freshness:
        lines.append("Morning pack freshness:")
        lines.append(f"- Status: {str(freshness.get('status', 'unknown')).upper()}")
        lines.append(f"- Newest source edit: {freshness.get('newest_source_at', '—')}")
        lines.append(f"- Build lag vs newest source: {freshness.get('lag_minutes', 0)} min")
        for source in (freshness.get('sources') or [])[:4]:
            lines.append(f"- {source.get('label','—')}: {source.get('updated_at','—')} ({source.get('age_minutes','—')} min old)")
        lines.append("")

    artifact_freshness = (b.artifact_freshness or {}).get("summary") or {}
    if artifact_freshness:
        lines.append("Artifact trust check:")
        lines.append(f"- OK: {artifact_freshness.get('ok','—')} / {artifact_freshness.get('total_artifacts','—')}")
        lines.append(f"- Stale: {artifact_freshness.get('stale','—')}")
        lines.append(f"- Missing: {artifact_freshness.get('missing','—')}")
        lines.append(f"- Mismatched latest vs dated: {artifact_freshness.get('mismatched','—')}")
        lines.append("")

    git_hygiene = (b.git_hygiene or {}).get("summary") or {}
    if git_hygiene:
        lines.append("Git hygiene:")
        lines.append(f"- Repos scanned: {git_hygiene.get('repos_scanned','—')}")
        lines.append(f"- High risk: {git_hygiene.get('high','—')}")
        lines.append(f"- Medium risk: {git_hygiene.get('medium','—')}")
        lines.append(f"- Low/noise only: {git_hygiene.get('low','—')}")
        lines.append(f"- Changed files visible: {git_hygiene.get('total_changed_files','—')}")
        repos = (b.git_hygiene or {}).get("repos") or []
        if repos:
            hottest = repos[0]
            lines.append(f"- Hottest repo: {hottest.get('name','—')} — {hottest.get('summary','—')}")
        lines.append("")

    state_audit = (b.state_audit or {}).get("summary") or {}
    if state_audit:
        lines.append("Business state audit:")
        lines.append(f"- Active items scanned: {state_audit.get('total_active_items','—')}")
        lines.append(f"- Past-date refs: {state_audit.get('stale_date_refs','—')}")
        lines.append(f"- Relative-time refs: {state_audit.get('stale_relative_refs','—')}")
        lines.append(f"- Urgent items missing source: {state_audit.get('urgent_without_source','—')}")
        lines.append(f"- Duplicate source IDs: {state_audit.get('duplicate_source_ids','—')}")
        lines.append("")

    brand_narrative = (b.brand_narrative or {}).get("summary") or {}
    if brand_narrative:
        lines.append("Brand narrative desk:")
        lines.append(f"- Reviews surfaced as proof: {brand_narrative.get('review_count','—')}")
        lines.append(f"- Proof points packaged: {brand_narrative.get('proof_points','—')}")
        lines.append(f"- Narrative gaps flagged: {brand_narrative.get('gaps','—')}")
        lines.append(f"- Messaging inconsistencies to verify: {brand_narrative.get('inconsistencies','—')}")
        lines.append("")

    morning_money = (b.morning_money or {}).get("summary") or {}
    if morning_money:
        lines.append("Morning money desk:")
        lines.append(f"- Collect visible: {_fmt_money(morning_money.get('collect_total'))}")
        lines.append(f"- Pay / verify visible: {_fmt_money(morning_money.get('pay_total'))}")
        lines.append(f"- Leakage / disputes visible: {_fmt_money(morning_money.get('protect_total'))}")
        lines.append(f"- Pipeline / upside visible: {_fmt_money(morning_money.get('upside_total'))}")
        lines.append(f"- Overdue or due-now items: {morning_money.get('overdue_count','—')}")
        lines.append("")

    supplier_ops = (b.supplier_ops or {}).get("summary") or {}
    if supplier_ops:
        lines.append("Supplier ops desk:")
        lines.append(f"- Collect / confirm inbound cash: {_fmt_money(supplier_ops.get('collect_total'))}")
        lines.append(f"- Pay / verify supplier pressure: {_fmt_money(supplier_ops.get('pay_total'))}")
        lines.append(f"- Fulfillment / warehouse watch items: {supplier_ops.get('watch_total','—')}")
        lines.append(f"- Relationship follow-ups: {supplier_ops.get('relationship_total','—')}")
        lines.append(f"- Do-now supplier items: {supplier_ops.get('do_now','—')}")
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

    ag = b.ads_growth_execution or {}
    if ag:
        ex = ag.get("execution") or {}
        mon = ag.get("monitoring") or {}
        lines.append("Amazon Ads growth plan execution:")
        lines.append(f"- Overall completion: {float(ag.get('overall_completion_pct') or 0) * 100:.0f}%")
        lines.append(f"- Live changes executed: {float(ex.get('execution_pct') or 0) * 100:.0f}% ({ex.get('executed_total','—')}/{ex.get('planned_total','—')} actions)")
        lines.append(f"- Monitoring completion: {float(mon.get('monitoring_pct') or 0) * 100:.0f}% ({mon.get('valid_days_observed','—')}/{ag.get('watch_days_required','—')} valid post-change pulls)")
        lines.append(f"- Days remaining before default next scale wave: {mon.get('days_remaining','—')}")
        daily = mon.get('daily_rows') or []
        if daily:
            latest = daily[-1]
            lines.append(f"- Latest post-change day: {latest.get('date','—')} — spend {_fmt_money(latest.get('spend'))}, sales {_fmt_money(latest.get('sales'))}, ACOS {float(latest.get('acos') or 0) * 100:.1f}%")
        lines.append(f"- Rule: {ag.get('next_rule','—')}")
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
    _run([sys.executable, "scripts/build_ads_growth_execution_tracker.py", "--date", date_str])
    _run([sys.executable, "scripts/build_ads_growth_readiness_desk.py", "--date", date_str])
    if _latest_report("cron-watchlist-*.json"):
        _run([sys.executable, "scripts/build_cron_trend_report.py", "--output-prefix", f"reports/cron-trend-report-{date_str}"])
    _run([sys.executable, "scripts/build_morning_handoff.py", "--date", date_str])
    _run([sys.executable, "scripts/build_decision_brief.py", "--date", date_str])
    _run([sys.executable, "scripts/build_customer_response_desk.py", "--date", date_str])
    _run([sys.executable, "scripts/build_morning_money_desk.py", "--date", date_str])
    _run([sys.executable, "scripts/build_supplier_ops_desk.py", "--date", date_str])
    _run([sys.executable, "scripts/build_morning_commerce_desk.py", "--date", date_str])
    _run([sys.executable, "scripts/build_brand_narrative_desk.py", "--date", date_str])
    _run([sys.executable, "scripts/build_b2b_kit_dispatch_desk.py", "--date", date_str])
    _run([sys.executable, "scripts/build_unblock_desk.py", "--date", date_str])
    _run([sys.executable, "scripts/build_morning_delta_brief.py", "--date", date_str])
    _run([sys.executable, "scripts/build_morning_exception_desk.py", "--date", date_str])
    _run([sys.executable, "scripts/build_git_hygiene_report.py", "--date", date_str])
    _run([sys.executable, "scripts/build_state_audit_report.py", "--date", date_str])
    _run([sys.executable, "scripts/build_actionability_report.py", "--date", date_str])

    # Compose brief from the latest JSON payloads
    ops_json = REPORTS / "ops-debt-dashboard-latest.json"
    kanban_json = REPORTS / "morning-execution-board-latest.json"
    ads_json = REPORTS / "ads-pull-dashboard-latest.json"
    ads_incident_json = REPORTS / "ads-pull-incident-latest.json"
    artifact_freshness_json = REPORTS / "artifact-freshness-latest.json"
    ads_growth_execution_json = REPORTS / "ads-growth-execution-latest.json"
    git_hygiene_json = REPORTS / "git-hygiene-latest.json"
    state_audit_json = REPORTS / "state-audit-latest.json"
    morning_money_json = REPORTS / "morning-money-desk-latest.json"
    supplier_ops_json = REPORTS / "supplier-ops-desk-latest.json"
    brand_narrative_json = REPORTS / "brand-narrative-desk-latest.json"
    cron_watchlist_json = _latest_report("cron-watchlist-*.json")
    cron_trend_json = REPORTS / "cron-trend-report-latest.json"
    if not ops_json.exists():
        raise SystemExit(f"Missing expected artifact: {ops_json}")
    if not kanban_json.exists():
        raise SystemExit(f"Missing expected artifact: {kanban_json}")

    REPORTS.mkdir(parents=True, exist_ok=True)
    brief_path = REPORTS / f"ops-build-brief-{date_str}.txt"
    latest_path = REPORTS / "ops-build-brief-latest.txt"

    def make_brief() -> Brief:
        return Brief(
            date=date_str,
            generated_at=generated_at,
            kanban=_load_json(kanban_json),
            ops_debt=_load_json(ops_json),
            ads_pull=_load_json(ads_json) if ads_json.exists() else None,
            ads_incident=_load_json(ads_incident_json) if ads_incident_json.exists() else None,
            artifact_freshness=_load_json(artifact_freshness_json) if artifact_freshness_json.exists() else None,
            ads_growth_execution=_load_json(ads_growth_execution_json) if ads_growth_execution_json.exists() else None,
            git_hygiene=_load_json(git_hygiene_json) if git_hygiene_json.exists() else None,
            state_audit=_load_json(state_audit_json) if state_audit_json.exists() else None,
            brand_narrative=_load_json(brand_narrative_json) if brand_narrative_json.exists() else None,
            morning_money=_load_json(morning_money_json) if morning_money_json.exists() else None,
            supplier_ops=_load_json(supplier_ops_json) if supplier_ops_json.exists() else None,
            cron_watchlist=_load_json(cron_watchlist_json) if cron_watchlist_json and cron_watchlist_json.exists() else None,
            cron_trend=_load_json(cron_trend_json) if cron_trend_json.exists() else None,
        )

    # First write the brief so artifact freshness can inspect it, then rebuild the brief with final trust numbers.
    brief_path.write_text(render_brief(make_brief()), encoding="utf-8")
    _clone_latest(brief_path, latest_path)

    _run([sys.executable, "scripts/build_artifact_freshness_report.py", "--date", date_str])

    brief_path.write_text(render_brief(make_brief()), encoding="utf-8")
    _clone_latest(brief_path, latest_path)

    print(f"Built {brief_path.relative_to(ROOT)}")
    print(f"Built {latest_path.relative_to(ROOT)}")
    print("Built reports/morning-ops-hub-latest.html")
    print("Built reports/ops-debt-dashboard-latest.html")
    print("Built reports/ads-pull-dashboard-latest.html")
    print("Built reports/ads-pull-incident-latest.html")
    print("Built reports/ads-growth-execution-latest.html")
    print("Built reports/ads-growth-readiness-latest.html")
    print("Built reports/morning-handoff-latest.html")
    print("Built reports/morning-decision-desk-latest.html")
    print("Built reports/morning-customer-desk-latest.html")
    print("Built reports/morning-money-desk-latest.html")
    print("Built reports/supplier-ops-desk-latest.html")
    print("Built reports/morning-commerce-desk-latest.html")
    print("Built reports/brand-narrative-desk-latest.html")
    print("Built reports/b2b-kit-dispatch-desk-latest.html")
    print("Built reports/b2b-kit-dispatch-labels-latest.csv")
    print("Built reports/morning-unblock-desk-latest.html")
    print("Built reports/morning-delta-brief-latest.html")
    print("Built reports/morning-exception-desk-latest.html")
    print("Built reports/artifact-freshness-latest.html")
    print("Built reports/git-hygiene-latest.html")
    print("Built reports/state-audit-latest.html")
    print("Built reports/morning-actionability-latest.html")
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
