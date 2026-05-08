#!/usr/bin/env python3
"""Build daily tracker for the approved Amazon Ads growth plan execution.

Outputs:
- reports/ads-growth-execution-YYYY-MM-DD.{md,html,json}
- reports/ads-growth-execution-latest.{md,html,json}

Tracks two things separately:
1) Live-change execution percentage: applied actions / planned first-batch actions.
2) Monitoring completion percentage: valid daily pulls observed after implementation / 7-day watch window.
"""
from __future__ import annotations

import argparse
import json
import re
import shutil
from datetime import datetime, date
from html import escape
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
REPORTS = ROOT / "reports"
MS = ROOT / "moneysamurai"
MS_REPORTS = MS / "reports"
ADS_DAILY = MS / "data" / "ads" / "daily"
WATCH_DAYS = 7
IMPLEMENTATION_WEIGHT = 0.40


def _load(path: Path, default: Any = None) -> Any:
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def _clone(src: Path, dst: Path) -> None:
    shutil.copyfile(src, dst)


def _fmt_money(v: float | int | None) -> str:
    if v is None:
        return "—"
    return f"${float(v):,.2f}"


def _pct(v: float | None) -> str:
    if v is None:
        return "—"
    return f"{v * 100:.0f}%"


def _latest_execution_log() -> Path | None:
    latest = MS_REPORTS / "ads-master-actions-execution-latest.json"
    if latest.exists():
        return latest
    matches = sorted(MS_REPORTS.glob("ads-master-actions-execution-*.json"))
    return matches[-1] if matches else None


def _execution_timestamp(path: Path | None, payload: dict[str, Any] | None) -> str | None:
    if not path:
        return None
    candidates = []
    if path.name == "ads-master-actions-execution-latest.json":
        candidates = sorted(MS_REPORTS.glob("ads-master-actions-execution-*.json"))
    else:
        candidates = [path]
    if candidates:
        m = re.search(r"(\d{8}T\d{6})", candidates[-1].name)
        if m:
            try:
                return datetime.strptime(m.group(1), "%Y%m%dT%H%M%S").isoformat(timespec="seconds")
            except Exception:
                return m.group(1)
    return None


def _count_execution(log: dict[str, Any] | None) -> dict[str, Any]:
    results = (log or {}).get("results") or []
    planned = {"negatives": 0, "bids": 0, "budgets": 0}
    executed = {"negatives": 0, "bids": 0, "budgets": 0}
    failures: list[dict[str, Any]] = []

    for r in results:
        typ = r.get("type")
        ok = r.get("ok") is True
        if typ == "negative_batch":
            n = int(r.get("count") or 0)
            planned["negatives"] += n
            if ok:
                executed["negatives"] += n
        elif typ == "negative":
            # Dry-run logs use individual negative rows; live logs batch negatives.
            if (log or {}).get("mode") != "EXECUTE":
                planned["negatives"] += 1
                if ok:
                    executed["negatives"] += 1
        elif typ == "bid":
            planned["bids"] += 1
            if ok:
                executed["bids"] += 1
        elif typ == "budget":
            planned["budgets"] += 1
            if ok:
                executed["budgets"] += 1
        if ok is False:
            failures.append(r)

    planned_total = sum(planned.values())
    executed_total = sum(executed.values())
    execution_pct = executed_total / planned_total if planned_total else 0.0
    return {
        "planned": planned,
        "executed": executed,
        "planned_total": planned_total,
        "executed_total": executed_total,
        "execution_pct": execution_pct,
        "failures": failures,
    }


def _valid_daily_rows_after(start_day: str = "2026-05-07") -> list[dict[str, Any]]:
    rows = []
    for d in sorted(ADS_DAILY.glob("20*")):
        if not d.is_dir() or d.name < start_day:
            continue
        status = _load(d / "pull-status.json", {}) or {}
        valid = bool(status.get("isValid"))
        if not valid:
            continue
        campaigns = _load(d / "campaigns.json", []) or []
        spend = sum(float(c.get("cost") or 0) for c in campaigns)
        sales = sum(float(c.get("sales14d") or c.get("sales7d") or 0) for c in campaigns)
        orders = sum(int(c.get("purchases14d") or c.get("purchases7d") or 0) for c in campaigns)
        clicks = sum(int(c.get("clicks") or 0) for c in campaigns)
        rows.append({
            "date": d.name,
            "spend": spend,
            "sales": sales,
            "orders": orders,
            "clicks": clicks,
            "acos": spend / sales if sales else None,
            "cvr": orders / clicks if clicks else None,
        })
    return rows


def build_payload(date_str: str) -> dict[str, Any]:
    log_path = _latest_execution_log()
    log = _load(log_path, {}) if log_path else {}
    counts = _count_execution(log)
    daily_rows = _valid_daily_rows_after("2026-05-07")
    monitoring_days = min(len(daily_rows), WATCH_DAYS)
    monitoring_pct = monitoring_days / WATCH_DAYS
    overall_pct = IMPLEMENTATION_WEIGHT * counts["execution_pct"] + (1 - IMPLEMENTATION_WEIGHT) * monitoring_pct

    return {
        "date": date_str,
        "generated_at": datetime.now().astimezone().strftime("%Y-%m-%d %H:%M %Z"),
        "plan_name": "Amazon Ads guarded sales-growth batch",
        "execution_log": str(log_path.relative_to(ROOT)) if log_path else None,
        "execution_timestamp": _execution_timestamp(log_path, log),
        "watch_days_required": WATCH_DAYS,
        "implementation_weight": IMPLEMENTATION_WEIGHT,
        "execution": counts,
        "monitoring": {
            "valid_days_observed": monitoring_days,
            "monitoring_pct": monitoring_pct,
            "days_remaining": max(WATCH_DAYS - monitoring_days, 0),
            "daily_rows": daily_rows[-WATCH_DAYS:],
        },
        "overall_completion_pct": overall_pct,
        "status": "complete" if overall_pct >= 0.999 else "monitoring",
        "next_rule": "Do not run a second scale wave until 7 valid post-change daily pulls are reviewed, unless Ev explicitly overrides.",
    }


def render_md(p: dict[str, Any]) -> str:
    e = p["execution"]
    m = p["monitoring"]
    rows = m.get("daily_rows") or []
    lines = [
        f"# Ads Growth Execution Tracker — {p['date']}",
        "",
        f"Generated: {p['generated_at']}",
        f"Plan: **{p['plan_name']}**",
        f"Execution log: `{p.get('execution_log') or '—'}`",
        "",
        "## Completion",
        f"- Overall completion: **{_pct(p['overall_completion_pct'])}**",
        f"- Live execution: **{_pct(e['execution_pct'])}** ({e['executed_total']}/{e['planned_total']} actions)",
        f"- Monitoring completion: **{_pct(m['monitoring_pct'])}** ({m['valid_days_observed']}/{p['watch_days_required']} valid post-change daily pulls)",
        f"- Days remaining before next default scale wave: **{m['days_remaining']}**",
        "",
        "## Executed action mix",
        f"- Negatives: {e['executed']['negatives']}/{e['planned']['negatives']}",
        f"- Bid raises: {e['executed']['bids']}/{e['planned']['bids']}",
        f"- Budget raises: {e['executed']['budgets']}/{e['planned']['budgets']}",
        "",
        "## Post-change daily checks",
    ]
    if not rows:
        lines.append("- No valid post-change daily pulls yet.")
    else:
        lines.append("| Date | Spend | Sales | Orders | ACOS | CVR |")
        lines.append("|---|---:|---:|---:|---:|---:|")
        for r in rows:
            lines.append(f"| {r['date']} | {_fmt_money(r['spend'])} | {_fmt_money(r['sales'])} | {r['orders']} | {_pct(r['acos'])} | {_pct(r['cvr'])} |")
    lines += ["", f"Rule: {p['next_rule']}", ""]
    return "\n".join(lines)


def render_html(p: dict[str, Any]) -> str:
    e = p["execution"]
    m = p["monitoring"]
    rows = m.get("daily_rows") or []
    daily = "<tr><td colspan='6'>No valid post-change daily pulls yet.</td></tr>" if not rows else "".join(
        f"<tr><td>{escape(r['date'])}</td><td>{_fmt_money(r['spend'])}</td><td>{_fmt_money(r['sales'])}</td><td>{r['orders']}</td><td>{_pct(r['acos'])}</td><td>{_pct(r['cvr'])}</td></tr>" for r in rows
    )
    return f"""<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ads Growth Execution — {escape(p['date'])}</title>
<style>
body{{margin:0;padding:24px;background:#0A1628;color:#fff;font-family:Inter,-apple-system,sans-serif}}.wrap{{max-width:1000px;margin:auto}}.card{{background:#111B2E;border:1px solid #1E293B;border-radius:14px;padding:16px;margin:12px 0}}.big{{font-size:42px;font-weight:800;color:#93C5FD}}.muted{{color:#94A3B8}}table{{width:100%;border-collapse:collapse}}td,th{{border-bottom:1px solid #1E293B;padding:8px;text-align:left}}th{{color:#94A3B8}}
</style></head><body><div class="wrap">
<h1>Ads Growth Execution Tracker</h1><div class="muted">{escape(p['generated_at'])}</div>
<div class="card"><div class="muted">Overall completion</div><div class="big">{_pct(p['overall_completion_pct'])}</div><p>{escape(p['next_rule'])}</p></div>
<div class="card"><h3>Execution</h3><ul><li>Live execution: <b>{_pct(e['execution_pct'])}</b> ({e['executed_total']}/{e['planned_total']} actions)</li><li>Monitoring: <b>{_pct(m['monitoring_pct'])}</b> ({m['valid_days_observed']}/{p['watch_days_required']} valid daily pulls)</li><li>Days remaining: <b>{m['days_remaining']}</b></li></ul></div>
<div class="card"><h3>Action mix</h3><ul><li>Negatives: {e['executed']['negatives']}/{e['planned']['negatives']}</li><li>Bid raises: {e['executed']['bids']}/{e['planned']['bids']}</li><li>Budget raises: {e['executed']['budgets']}/{e['planned']['budgets']}</li></ul></div>
<div class="card"><h3>Post-change daily checks</h3><table><tr><th>Date</th><th>Spend</th><th>Sales</th><th>Orders</th><th>ACOS</th><th>CVR</th></tr>{daily}</table></div>
</div></body></html>"""


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--date")
    args = ap.parse_args()
    date_str = args.date or date.today().isoformat()
    REPORTS.mkdir(exist_ok=True)
    payload = build_payload(date_str)

    json_path = REPORTS / f"ads-growth-execution-{date_str}.json"
    md_path = REPORTS / f"ads-growth-execution-{date_str}.md"
    html_path = REPORTS / f"ads-growth-execution-{date_str}.html"
    json_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    md_path.write_text(render_md(payload), encoding="utf-8")
    html_path.write_text(render_html(payload), encoding="utf-8")
    _clone(json_path, REPORTS / "ads-growth-execution-latest.json")
    _clone(md_path, REPORTS / "ads-growth-execution-latest.md")
    _clone(html_path, REPORTS / "ads-growth-execution-latest.html")
    print("Built reports/ads-growth-execution-latest.html")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
