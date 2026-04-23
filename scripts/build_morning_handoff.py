#!/usr/bin/env python3
"""build_morning_handoff.py

Generate a compact morning handoff pack from existing local artifacts.

Outputs:
- reports/morning-handoff-YYYY-MM-DD.md
- reports/morning-handoff-YYYY-MM-DD.html
- reports/morning-handoff-YYYY-MM-DD.json
- reports/morning-handoff-latest.md
- reports/morning-handoff-latest.html
- reports/morning-handoff-latest.json

Purpose:
- Give Ev one fast view of what to attack first in the morning
- Separate operator-verifiable items from things that need Ev action
- Surface cron checks without burying the business queue
"""

from __future__ import annotations

from datetime import datetime
from html import escape
from pathlib import Path
import argparse
import glob
import json
import shutil
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
REPORTS = ROOT / "reports"


def _latest(pattern: str) -> Path | None:
    matches = sorted(glob.glob(str(REPORTS / pattern)))
    return Path(matches[-1]) if matches else None


def _load_json(path: Path | None) -> dict[str, Any] | None:
    if not path or not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def _clone_latest(versioned: Path, latest: Path) -> None:
    shutil.copyfile(versioned, latest)


def _fmt_money(v: float | int | None) -> str:
    if v is None:
        return "—"
    x = float(v)
    if abs(x - round(x)) < 1e-9:
        return f"${int(round(x)):,}"
    return f"${x:,.2f}"


def _clean(text: str) -> str:
    return " ".join(text.replace("**", "").split())


def _task_flags(task: dict[str, Any]) -> dict[str, bool]:
    text = (task.get("text") or "").lower()
    return {
        "needs_ev": task.get("section") == "needs_ev" or "ev must" in text or "ev:" in text or "confirm" in text,
        "customer_risk": any(tok in text for tok in ["customer", "reply", "refund", "a-to-z", "order", "unshipped", "return", "buyer"]),
        "access_blocked": any(tok in text for tok in ["login", "logged in", "token", "regen", "access", "confirm"]),
        "money": bool(task.get("amount")) or bool(task.get("daily_burn")),
    }


def _derive_sections(board: dict[str, Any], ops_debt: dict[str, Any] | None, watchlist: dict[str, Any] | None, trend: dict[str, Any] | None) -> dict[str, Any]:
    tasks = board.get("all_tasks_ranked") or []
    top = board.get("top_actions") or []

    do_first = []
    needs_ev = []
    customer_risk = []
    unblock = []

    for task in tasks:
        flags = _task_flags(task)
        if len(do_first) < 5 and task.get("section") != "backlog":
            do_first.append(task)
        if flags["needs_ev"] and len(needs_ev) < 6:
            needs_ev.append(task)
        if flags["customer_risk"] and len(customer_risk) < 6:
            customer_risk.append(task)
        if flags["access_blocked"] and len(unblock) < 6:
            unblock.append(task)

    cron_checks: list[str] = []
    if watchlist:
        summary = watchlist.get("summary") or {}
        jobs = watchlist.get("jobs") or []
        hottest = jobs[0] if jobs else None
        cron_checks.append(
            f"Timeout watchlist: {summary.get('critical', '—')} critical, {summary.get('medium', '—')} medium, {summary.get('patches_ready', '—')} ready timeout patches."
        )
        if hottest:
            cron_checks.append(
                f"Verify {hottest.get('name', '—')} after the 3600s bump; latest observed run hit {hottest.get('last_duration_ms', '—')} ms on a {hottest.get('timeout_seconds', '—')}s timeout."
            )
    if trend:
        t = trend.get("summary") or {}
        if t:
            cron_checks.append(
                f"Trend: {t.get('regressing_jobs', '—')} regressing, {t.get('improving_jobs', '—')} improving, {t.get('new_risks', '—')} newly surfaced risks across {t.get('days_compared', '—')} saved days."
            )

    debt_checks: list[str] = []
    if ops_debt:
        s = ops_debt.get("summary") or {}
        debt_checks.append(
            f"Ops debt exposure: {_fmt_money(s.get('total_accrued'))} open, {_fmt_money(s.get('daily_burn'))}/day true burn, {_fmt_money(s.get('burn_30d'))} 30-day burn exposure."
        )

    return {
        "do_first": do_first,
        "needs_ev": needs_ev,
        "customer_risk": customer_risk,
        "unblock": unblock,
        "cron_checks": cron_checks,
        "debt_checks": debt_checks,
        "top": top,
    }


def render_markdown(payload: dict[str, Any]) -> str:
    out = []
    out.append(f"# Morning Handoff — {payload['date']}")
    out.append("")
    out.append(f"Generated: {payload['generated_at']}")
    out.append("Source: morning execution board + ops debt + cron watchlist/trend")
    out.append("")
    out.append("## Do first")
    for i, task in enumerate(payload["sections"]["do_first"], 1):
        out.append(f"{i}. {_clean(task['text'])} (~{task.get('est_minutes', '—')}m)")
    out.append("")
    out.append("## Needs Ev")
    for task in payload["sections"]["needs_ev"]:
        out.append(f"- {_clean(task['text'])}")
    out.append("")
    out.append("## Customer risk")
    for task in payload["sections"]["customer_risk"]:
        out.append(f"- {_clean(task['text'])}")
    out.append("")
    out.append("## Unblock / verify")
    for task in payload["sections"]["unblock"]:
        out.append(f"- {_clean(task['text'])}")
    for line in payload["sections"]["cron_checks"]:
        out.append(f"- {line}")
    for line in payload["sections"]["debt_checks"]:
        out.append(f"- {line}")
    out.append("")
    out.append("## Copy/paste starter")
    out.append(f"Morning stack for {payload['date']}:")
    for task in payload["sections"]["top"][:5]:
        out.append(f"- [ ] {_clean(task['text'])}")
    out.append("")
    return "\n".join(out) + "\n"


def render_html(payload: dict[str, Any]) -> str:
    def li(tasks: list[dict[str, Any]], with_eta: bool = False) -> str:
        if not tasks:
            return "<li class='muted'>Nothing surfaced.</li>"
        items = []
        for t in tasks:
            eta = f" <span class='muted'>(~{t.get('est_minutes','—')}m)</span>" if with_eta else ""
            items.append(f"<li>{escape(_clean(t.get('text') or ''))}{eta}</li>")
        return "".join(items)

    lines = "".join(f"<li>{escape(x)}</li>" for x in payload["sections"]["cron_checks"] + payload["sections"]["debt_checks"]) or "<li class='muted'>No checks surfaced.</li>"
    copy_text = "\n".join(
        [f"Morning stack for {payload['date']}:", ""] + [f"- [ ] {_clean(t.get('text') or '')}" for t in payload['sections']['top'][:5]] + [""]
    )

    return f"""<!doctype html>
<html lang=\"en\">
<head>
<meta charset=\"utf-8\" />
<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
<title>Morning Handoff — {escape(payload['date'])}</title>
<style>
:root {{--bg:#0A1628;--surface:#111B2E;--border:#1E293B;--text:#fff;--muted:#94A3B8;--accent:#3B82F6;}}
*{{box-sizing:border-box}} body{{margin:0;padding:24px;background:var(--bg);color:var(--text);font-family:Inter,-apple-system,sans-serif}}
.wrap{{max-width:1100px;margin:0 auto}} .grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px}}
.panel{{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px}} h1{{margin:0 0 6px}} .sub,.muted{{color:var(--muted)}}
ul{{margin:8px 0 0 18px}} li{{margin:6px 0}} button{{background:var(--accent);border:none;color:white;border-radius:10px;padding:8px 10px;font-weight:650;cursor:pointer}}
a{{color:#93C5FD}}
</style>
</head>
<body>
<div class=\"wrap\">
  <h1>Morning Handoff</h1>
  <div class=\"sub\">{escape(payload['generated_at'])} · tight operator view for the first hour</div>
  <p><a href=\"./morning-ops-hub-latest.html\">Open full ops hub</a></p>
  <p><button id=\"copyBtn\">Copy starter checklist</button></p>
  <div class=\"grid\">
    <div class=\"panel\"><h3>Do first</h3><ul>{li(payload['sections']['do_first'], with_eta=True)}</ul></div>
    <div class=\"panel\"><h3>Needs Ev</h3><ul>{li(payload['sections']['needs_ev'])}</ul></div>
    <div class=\"panel\"><h3>Customer risk</h3><ul>{li(payload['sections']['customer_risk'])}</ul></div>
    <div class=\"panel\"><h3>Unblock / verify</h3><ul>{li(payload['sections']['unblock'])}{lines}</ul></div>
  </div>
</div>
<script>
const text = {json.dumps(copy_text)};
document.getElementById('copyBtn').addEventListener('click', () => navigator.clipboard.writeText(text).catch(() => window.prompt('Copy this text:', text)));
</script>
</body>
</html>
"""


def main() -> int:
    parser = argparse.ArgumentParser(description="Build morning handoff pack")
    parser.add_argument("--date", help="Output date YYYY-MM-DD")
    args = parser.parse_args()

    now = datetime.now().astimezone()
    date_str = args.date or now.strftime("%Y-%m-%d")
    generated_at = now.strftime("%Y-%m-%d %H:%M %Z")

    board = _load_json(REPORTS / "morning-execution-board-latest.json")
    if not board:
        raise SystemExit("Missing morning-execution-board-latest.json; run kanban_morning_builder first")
    ops_debt = _load_json(REPORTS / "ops-debt-dashboard-latest.json")
    watchlist = _load_json(_latest("cron-watchlist-*.json"))
    trend = _load_json(REPORTS / "cron-trend-report-latest.json")

    payload = {
        "date": date_str,
        "generated_at": generated_at,
        "sections": _derive_sections(board, ops_debt, watchlist, trend),
    }

    REPORTS.mkdir(parents=True, exist_ok=True)
    md_path = REPORTS / f"morning-handoff-{date_str}.md"
    html_path = REPORTS / f"morning-handoff-{date_str}.html"
    json_path = REPORTS / f"morning-handoff-{date_str}.json"

    md_path.write_text(render_markdown(payload), encoding="utf-8")
    html_path.write_text(render_html(payload), encoding="utf-8")
    json_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    _clone_latest(md_path, REPORTS / "morning-handoff-latest.md")
    _clone_latest(html_path, REPORTS / "morning-handoff-latest.html")
    _clone_latest(json_path, REPORTS / "morning-handoff-latest.json")

    print(f"Built {md_path.relative_to(ROOT)}")
    print(f"Built {html_path.relative_to(ROOT)}")
    print(f"Built {json_path.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
