#!/usr/bin/env python3
"""Build a morning-ready desk for Amazon Ads post-scale monitoring.

Outputs:
- reports/ads-growth-readiness-YYYY-MM-DD.{md,html,json}
- reports/ads-growth-readiness-latest.{md,html,json}

Purpose:
- Turn the executed Amazon Ads growth batch into one review surface Ev can test in the morning.
- Show the exact campaigns/keywords touched, the waste controls added, and whether enough post-change data exists yet.
"""
from __future__ import annotations

import argparse
import csv
import json
import shutil
from collections import Counter, defaultdict
from datetime import date, datetime
from html import escape
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
REPORTS = ROOT / "reports"
MS = ROOT / "moneysamurai"
MS_REPORTS = MS / "reports"
ADS_DAILY = MS / "data" / "ads" / "daily"
WATCH_DAYS = 7
POST_CHANGE_START = "2026-05-07"
DEFAULT_TARGET_ACOS = 0.30


def _load_json(path: Path, default: Any = None) -> Any:
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def _clone(src: Path, dst: Path) -> None:
    shutil.copyfile(src, dst)


def _fmt_money(v: float | int | None) -> str:
    if v is None:
        return "—"
    return f"${float(v):,.2f}"


def _fmt_pct(v: float | None, digits: int = 1) -> str:
    if v is None:
        return "—"
    return f"{v * 100:.{digits}f}%"


def _latest_execution_log() -> Path | None:
    latest = MS_REPORTS / "ads-master-actions-execution-latest.json"
    if latest.exists():
        return latest
    matches = sorted(MS_REPORTS.glob("ads-master-actions-execution-*.json"))
    return matches[-1] if matches else None


def _load_actions_csv() -> list[dict[str, str]]:
    latest = MS_REPORTS / "ads-master-actions-latest.csv"
    if latest.exists():
        path = latest
    else:
        matches = sorted(MS_REPORTS.glob("ads-master-actions-*.csv"))
        if not matches:
            return []
        path = matches[-1]
    with path.open(encoding="utf-8", newline="") as fh:
        return list(csv.DictReader(fh))


def _load_plan() -> dict[str, Any]:
    latest = MS_REPORTS / "ads-master-plan-latest.json"
    if latest.exists():
        return _load_json(latest, {}) or {}
    matches = sorted(MS_REPORTS.glob("ads-master-plan-*.json"))
    return _load_json(matches[-1], {}) if matches else {}


def _campaign_daily_map(day_name: str) -> dict[str, dict[str, Any]]:
    campaigns = _load_json(ADS_DAILY / day_name / "campaigns.json", []) or []
    by_name: dict[str, dict[str, Any]] = {}
    for row in campaigns:
        by_name[str(row.get("campaignName") or "")] = row
    return by_name


def _valid_post_change_rows() -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for day_dir in sorted(ADS_DAILY.glob("20*")):
        if not day_dir.is_dir() or day_dir.name < POST_CHANGE_START:
            continue
        status = _load_json(day_dir / "pull-status.json", {}) or {}
        if not status.get("isValid"):
            continue
        campaigns = _load_json(day_dir / "campaigns.json", []) or []
        spend = sum(float(c.get("cost") or 0) for c in campaigns)
        sales = sum(float(c.get("sales14d") or c.get("sales7d") or 0) for c in campaigns)
        orders = sum(int(c.get("purchases14d") or c.get("purchases7d") or 0) for c in campaigns)
        clicks = sum(int(c.get("clicks") or 0) for c in campaigns)
        rows.append({
            "date": day_dir.name,
            "spend": spend,
            "sales": sales,
            "orders": orders,
            "clicks": clicks,
            "acos": spend / sales if sales else None,
            "cvr": orders / clicks if clicks else None,
        })
    return rows


def build_payload(date_str: str) -> dict[str, Any]:
    plan = _load_plan()
    actions_csv = _load_actions_csv()
    execution_path = _latest_execution_log()
    execution_log = _load_json(execution_path, {}) if execution_path else {}
    valid_rows = _valid_post_change_rows()
    latest_daily_folder = str(plan.get("latest_daily_folder") or "")
    latest_campaigns = _campaign_daily_map(latest_daily_folder) if latest_daily_folder else {}
    target_acos = float(plan.get("assumed_target_acos") or DEFAULT_TARGET_ACOS)

    bid_exec = {
        str(r.get("keyword") or ""): r
        for r in (execution_log.get("results") or [])
        if r.get("type") == "bid" and r.get("ok") is True
    }
    budget_exec = {
        str(r.get("campaign") or ""): r
        for r in (execution_log.get("results") or [])
        if r.get("type") == "budget" and r.get("ok") is True
    }

    scale_candidates = {str(r.get("name") or ""): r for r in (plan.get("scale_candidates") or [])}
    bid_candidates = {str(r.get("name") or ""): r for r in (plan.get("bid_candidates") or [])}

    campaign_rollup: dict[str, dict[str, Any]] = {}
    for campaign_name, row in scale_candidates.items():
        current = latest_campaigns.get(campaign_name, {})
        budget_change = budget_exec.get(campaign_name)
        campaign_rollup[campaign_name] = {
            "campaign": campaign_name,
            "baseline_spend": float(row.get("spend") or 0),
            "baseline_sales": float(row.get("sales") or 0),
            "baseline_orders": int(row.get("orders") or 0),
            "baseline_acos": float(row.get("acos") or 0) if row.get("acos") is not None else None,
            "baseline_budget": float(row.get("budget") or 0),
            "live_budget": float(budget_change.get("new_budget") or current.get("campaignBudgetAmount") or row.get("budget") or 0),
            "budget_delta": (float(budget_change.get("new_budget") or 0) - float(budget_change.get("old_budget") or 0)) if budget_change else None,
            "latest_day_spend": float(current.get("cost") or 0) if current else None,
            "latest_day_sales": float(current.get("sales14d") or current.get("sales7d") or 0) if current else None,
            "latest_day_orders": int(current.get("purchases14d") or current.get("purchases7d") or 0) if current else None,
            "latest_day_acos": (float(current.get("cost") or 0) / float(current.get("sales14d") or current.get("sales7d") or 0)) if current and float(current.get("sales14d") or current.get("sales7d") or 0) else None,
        }

    bid_rollup: dict[str, dict[str, Any]] = defaultdict(lambda: {
        "campaign": "",
        "keyword_count": 0,
        "avg_old_bid": 0.0,
        "avg_new_bid": 0.0,
        "total_baseline_spend": 0.0,
        "total_baseline_sales": 0.0,
        "total_baseline_orders": 0,
        "keywords": [],
    })
    for row in actions_csv:
        if row.get("type") != "bid_raise_candidate":
            continue
        keyword_name = str(row.get("keyword") or "")
        campaign = str(row.get("campaign") or "")
        if keyword_name not in bid_exec:
            continue
        base = bid_candidates.get(keyword_name, {})
        bucket = bid_rollup[campaign]
        bucket["campaign"] = campaign
        bucket["keyword_count"] += 1
        old_bid = float(row.get("current_bid") or base.get("bid") or 0)
        new_bid = float(row.get("suggested_bid") or bid_exec[keyword_name].get("new_bid") or 0)
        bucket["avg_old_bid"] += old_bid
        bucket["avg_new_bid"] += new_bid
        bucket["total_baseline_spend"] += float(base.get("spend") or 0)
        bucket["total_baseline_sales"] += float(base.get("sales") or 0)
        bucket["total_baseline_orders"] += int(base.get("orders") or 0)
        bucket["keywords"].append({
            "keyword": keyword_name,
            "old_bid": old_bid,
            "new_bid": new_bid,
            "acos": float(base.get("acos") or 0) if base.get("acos") is not None else None,
            "sales": float(base.get("sales") or 0),
            "orders": int(base.get("orders") or 0),
        })
    for bucket in bid_rollup.values():
        count = bucket["keyword_count"] or 1
        bucket["avg_old_bid"] /= count
        bucket["avg_new_bid"] /= count
        bucket["lift_pct"] = (bucket["avg_new_bid"] / bucket["avg_old_bid"] - 1) if bucket["avg_old_bid"] else None
        bucket["baseline_acos"] = (bucket["total_baseline_spend"] / bucket["total_baseline_sales"]) if bucket["total_baseline_sales"] else None
        bucket["keywords"] = sorted(bucket["keywords"], key=lambda x: x["sales"], reverse=True)

    negative_rows = [row for row in actions_csv if row.get("type") == "negative_or_bid_down"]
    executed_negative_rows = negative_rows[: int((execution_log.get("results") or [{}])[0].get("count") or 0)]
    negative_by_campaign: dict[str, dict[str, Any]] = defaultdict(lambda: {"campaign": "", "count": 0, "estimated_spend_blocked": 0.0, "terms": []})
    for row in executed_negative_rows:
        campaign = str(row.get("campaign") or "")
        bucket = negative_by_campaign[campaign]
        bucket["campaign"] = campaign
        bucket["count"] += 1
        spend = 0.0
        evidence = str(row.get("evidence") or "")
        if evidence.startswith("$"):
            try:
                spend = float(evidence.split(" spend", 1)[0].replace("$", "").replace(",", ""))
            except Exception:
                spend = 0.0
        bucket["estimated_spend_blocked"] += spend
        bucket["terms"].append({
            "search_term": row.get("search_term") or "",
            "evidence": evidence,
            "estimated_spend": spend,
        })
    for bucket in negative_by_campaign.values():
        bucket["terms"] = sorted(bucket["terms"], key=lambda x: x["estimated_spend"], reverse=True)

    impacted_campaigns = sorted(
        set(campaign_rollup) | set(bid_rollup) | set(negative_by_campaign),
        key=lambda name: (
            -float(campaign_rollup.get(name, {}).get("baseline_sales") or 0)
            - float(bid_rollup.get(name, {}).get("total_baseline_sales") or 0)
            - float(negative_by_campaign.get(name, {}).get("estimated_spend_blocked") or 0)
        ),
    )

    watch_checks = [
        f"Hold the next scale wave until {WATCH_DAYS} valid post-change daily pulls are available.",
        f"If touched winner campaigns drift above the provisional {_fmt_pct(target_acos)} ACOS guardrail, stop scaling and inspect query mix.",
        "If the 8oz Medium waste pocket stays ugly after the negative batch, widen cleanup before new budget adds.",
        "When the first valid post-change pull lands, compare touched-campaign spend share and sales share before changing anything else.",
    ]

    status = "waiting_for_post_change_data"
    if valid_rows:
        status = "monitoring"
    if len(valid_rows) >= WATCH_DAYS:
        status = "ready_for_review"

    readiness_summary = {
        "status": status,
        "valid_days_observed": len(valid_rows),
        "days_remaining": max(WATCH_DAYS - len(valid_rows), 0),
        "executed_budget_campaigns": len(budget_exec),
        "executed_bid_keywords": len(bid_exec),
        "executed_negative_terms": len(executed_negative_rows),
        "negative_campaigns": len(negative_by_campaign),
        "guardrail_target_acos": target_acos,
        "latest_baseline_day": latest_daily_folder or None,
        "latest_post_change_day": valid_rows[-1]["date"] if valid_rows else None,
    }

    return {
        "date": date_str,
        "generated_at": datetime.now().astimezone().strftime("%Y-%m-%d %H:%M %Z"),
        "summary": readiness_summary,
        "execution_log": str(execution_path.relative_to(ROOT)) if execution_path else None,
        "plan_path": "moneysamurai/reports/ads-master-plan-latest.json",
        "actions_csv_path": "moneysamurai/reports/ads-master-actions-2026-05-06.csv",
        "valid_post_change_days": valid_rows,
        "campaign_rollup": [campaign_rollup[name] for name in impacted_campaigns if name in campaign_rollup],
        "bid_rollup": [bid_rollup[name] for name in impacted_campaigns if name in bid_rollup],
        "negative_rollup": [negative_by_campaign[name] for name in impacted_campaigns if name in negative_by_campaign],
        "impacted_campaigns": impacted_campaigns,
        "watch_checks": watch_checks,
        "topline": {
            "plan_generated": plan.get("generated"),
            "lookback_days_loaded": plan.get("lookback_days_loaded"),
            "total_actions_csv": len(actions_csv),
            "action_mix": dict(Counter(row.get("type") for row in actions_csv)),
        },
    }


def render_md(payload: dict[str, Any]) -> str:
    s = payload["summary"]
    lines = [
        f"# Ads Growth Readiness Desk — {payload['date']}",
        "",
        f"Generated: {payload['generated_at']}",
        f"Execution log: `{payload.get('execution_log') or '—'}`",
        f"Plan source: `{payload.get('plan_path') or '—'}`",
        "",
        "## Morning read",
        f"- Status: **{s['status']}**",
        f"- Post-change daily pulls observed: **{s['valid_days_observed']}/{WATCH_DAYS}**",
        f"- Days remaining before next default scale wave: **{s['days_remaining']}**",
        f"- Live changes executed: **{s['executed_budget_campaigns']} budget campaigns**, **{s['executed_bid_keywords']} bid raises**, **{s['executed_negative_terms']} negative terms**",
        f"- Provisional ACOS guardrail for touched winners: **{_fmt_pct(s['guardrail_target_acos'])}**",
        "",
        "## What to inspect next",
    ]
    for check in payload.get("watch_checks") or []:
        lines.append(f"- {check}")

    lines += ["", "## Touched winner campaigns"]
    campaigns = payload.get("campaign_rollup") or []
    if not campaigns:
        lines.append("- None found.")
    else:
        lines.append("| Campaign | Budget | Baseline Sales | Baseline ACOS | Latest baseline day |")
        lines.append("|---|---:|---:|---:|---|")
        latest_baseline_day = s.get("latest_baseline_day") or "—"
        for row in campaigns:
            budget = f"{_fmt_money(row['baseline_budget'])} → {_fmt_money(row['live_budget'])}"
            lines.append(
                f"| {row['campaign']} | {budget} | {_fmt_money(row['baseline_sales'])} | {_fmt_pct(row['baseline_acos'])} | {latest_baseline_day} |"
            )

    lines += ["", "## Bid raises by campaign"]
    bid_rollup = payload.get("bid_rollup") or []
    if not bid_rollup:
        lines.append("- None found.")
    else:
        lines.append("| Campaign | Keywords | Avg bid | Lift | Baseline Sales | Baseline ACOS |")
        lines.append("|---|---:|---:|---:|---:|---:|")
        for row in bid_rollup:
            lines.append(
                f"| {row['campaign']} | {row['keyword_count']} | {_fmt_money(row['avg_old_bid'])} → {_fmt_money(row['avg_new_bid'])} | {_fmt_pct(row['lift_pct'])} | {_fmt_money(row['total_baseline_sales'])} | {_fmt_pct(row['baseline_acos'])} |"
            )

    lines += ["", "## Negative controls executed"]
    neg = payload.get("negative_rollup") or []
    if not neg:
        lines.append("- None found.")
    else:
        lines.append("| Campaign | Terms added | Historical zero-sale spend targeted | Heaviest term |")
        lines.append("|---|---:|---:|---|")
        for row in neg:
            top_term = (row.get("terms") or [{}])[0].get("search_term") or "—"
            lines.append(
                f"| {row['campaign']} | {row['count']} | {_fmt_money(row['estimated_spend_blocked'])} | {top_term} |"
            )

    lines += ["", "## Post-change daily pulls"]
    post = payload.get("valid_post_change_days") or []
    if not post:
        lines.append("- No valid post-change daily pulls yet.")
    else:
        lines.append("| Date | Spend | Sales | Orders | ACOS | CVR |")
        lines.append("|---|---:|---:|---:|---:|---:|")
        for row in post:
            lines.append(
                f"| {row['date']} | {_fmt_money(row['spend'])} | {_fmt_money(row['sales'])} | {row['orders']} | {_fmt_pct(row['acos'])} | {_fmt_pct(row['cvr'])} |"
            )

    lines.append("")
    return "\n".join(lines)


def render_html(payload: dict[str, Any]) -> str:
    s = payload["summary"]
    status_color = {
        "waiting_for_post_change_data": "#f59e0b",
        "monitoring": "#3B82F6",
        "ready_for_review": "#22c55e",
    }.get(s["status"], "#94A3B8")
    campaign_rows = "".join(
        f"<tr><td>{escape(row['campaign'])}</td><td>{_fmt_money(row['baseline_budget'])} → {_fmt_money(row['live_budget'])}</td><td>{_fmt_money(row['baseline_sales'])}</td><td>{_fmt_pct(row['baseline_acos'])}</td></tr>"
        for row in (payload.get("campaign_rollup") or [])
    ) or "<tr><td colspan='4'>None</td></tr>"
    bid_rows = "".join(
        f"<tr><td>{escape(row['campaign'])}</td><td>{row['keyword_count']}</td><td>{_fmt_money(row['avg_old_bid'])} → {_fmt_money(row['avg_new_bid'])}</td><td>{_fmt_pct(row['lift_pct'])}</td><td>{_fmt_money(row['total_baseline_sales'])}</td><td>{_fmt_pct(row['baseline_acos'])}</td></tr>"
        for row in (payload.get("bid_rollup") or [])
    ) or "<tr><td colspan='6'>None</td></tr>"
    negative_rows = "".join(
        f"<tr><td>{escape(row['campaign'])}</td><td>{row['count']}</td><td>{_fmt_money(row['estimated_spend_blocked'])}</td><td>{escape(((row.get('terms') or [{}])[0].get('search_term') or '—'))}</td></tr>"
        for row in (payload.get("negative_rollup") or [])
    ) or "<tr><td colspan='4'>None</td></tr>"
    post_rows = "".join(
        f"<tr><td>{escape(row['date'])}</td><td>{_fmt_money(row['spend'])}</td><td>{_fmt_money(row['sales'])}</td><td>{row['orders']}</td><td>{_fmt_pct(row['acos'])}</td><td>{_fmt_pct(row['cvr'])}</td></tr>"
        for row in (payload.get("valid_post_change_days") or [])
    ) or "<tr><td colspan='6'>No valid post-change daily pulls yet.</td></tr>"
    watch_checks = "".join(f"<li>{escape(item)}</li>" for item in (payload.get("watch_checks") or []))
    return f"""<!doctype html>
<html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">
<title>Ads Growth Readiness Desk — {escape(payload['date'])}</title>
<style>
body{{margin:0;padding:24px;background:#0A1628;color:#fff;font-family:Inter,-apple-system,sans-serif}} .wrap{{max-width:1180px;margin:auto}} .panel{{background:#111B2E;border:1px solid #1E293B;border-radius:14px;padding:16px;margin:12px 0}} .grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px}} .k{{color:#94A3B8;font-size:12px}} .v{{font-size:30px;font-weight:800;margin-top:4px}} table{{width:100%;border-collapse:collapse}} th,td{{padding:8px;border-bottom:1px solid #1E293B;text-align:left;vertical-align:top}} th{{color:#94A3B8;font-size:12px;text-transform:uppercase}} .badge{{display:inline-block;padding:4px 10px;border-radius:999px;border:1px solid #1E293B;color:{status_color};background:#0f1a2c;font-weight:700}} a{{color:#93C5FD}} ul{{margin:8px 0 0 18px;color:#94A3B8}}
</style></head><body><div class=\"wrap\">
<h1>Ads Growth Readiness Desk</h1>
<div style=\"color:#94A3B8;margin-bottom:10px\">Generated {escape(payload['generated_at'])} · <span class=\"badge\">{escape(s['status'])}</span></div>
<div class=\"grid\">
  <div class=\"panel\"><div class=\"k\">Post-change daily pulls</div><div class=\"v\">{s['valid_days_observed']}/{WATCH_DAYS}</div></div>
  <div class=\"panel\"><div class=\"k\">Budget campaigns touched</div><div class=\"v\">{s['executed_budget_campaigns']}</div></div>
  <div class=\"panel\"><div class=\"k\">Bid raises executed</div><div class=\"v\">{s['executed_bid_keywords']}</div></div>
  <div class=\"panel\"><div class=\"k\">Negative terms added</div><div class=\"v\">{s['executed_negative_terms']}</div></div>
</div>
<div class=\"panel\"><h3>What to inspect next</h3><ul>{watch_checks}</ul><p><a href=\"./ads-growth-execution-latest.html\">Execution tracker</a> · <a href=\"./morning-ops-hub-latest.html\">Morning ops hub</a></p></div>
<div class=\"panel\"><h3>Touched winner campaigns</h3><table><tr><th>Campaign</th><th>Budget</th><th>Baseline Sales</th><th>Baseline ACOS</th></tr>{campaign_rows}</table></div>
<div class=\"panel\"><h3>Bid raises by campaign</h3><table><tr><th>Campaign</th><th>Keywords</th><th>Avg bid</th><th>Lift</th><th>Baseline Sales</th><th>Baseline ACOS</th></tr>{bid_rows}</table></div>
<div class=\"panel\"><h3>Negative controls executed</h3><table><tr><th>Campaign</th><th>Terms added</th><th>Historical zero-sale spend targeted</th><th>Heaviest term</th></tr>{negative_rows}</table></div>
<div class=\"panel\"><h3>Post-change daily pulls</h3><table><tr><th>Date</th><th>Spend</th><th>Sales</th><th>Orders</th><th>ACOS</th><th>CVR</th></tr>{post_rows}</table></div>
</div></body></html>"""


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--date")
    args = ap.parse_args()
    date_str = args.date or date.today().isoformat()
    REPORTS.mkdir(exist_ok=True)
    payload = build_payload(date_str)

    json_path = REPORTS / f"ads-growth-readiness-{date_str}.json"
    md_path = REPORTS / f"ads-growth-readiness-{date_str}.md"
    html_path = REPORTS / f"ads-growth-readiness-{date_str}.html"
    json_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    md_path.write_text(render_md(payload), encoding="utf-8")
    html_path.write_text(render_html(payload), encoding="utf-8")
    _clone(json_path, REPORTS / "ads-growth-readiness-latest.json")
    _clone(md_path, REPORTS / "ads-growth-readiness-latest.md")
    _clone(html_path, REPORTS / "ads-growth-readiness-latest.html")
    print("Built reports/ads-growth-readiness-latest.html")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
