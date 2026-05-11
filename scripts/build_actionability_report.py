#!/usr/bin/env python3
"""build_actionability_report.py

Build a morning-ready report showing which active BUSINESS_STATE items are:
- blocked on access/tokens/login
- watch/passive context that should not crowd the first work block
- carrying stale date refs
- surfacing high in the rank despite low immediate actionability

Outputs:
- reports/morning-actionability-YYYY-MM-DD.{md,html,json}
- reports/morning-actionability-latest.{md,html,json}
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
from dataclasses import asdict, dataclass
from datetime import datetime
from html import escape
from pathlib import Path
from typing import Any

from build_state_audit_report import extract_stale_date_refs, has_source
from kanban_morning_builder import REPORTS, build_tasks, parse_business_state_tasks, BUSINESS_STATE

ROOT = Path(__file__).resolve().parents[1]

ACCESS_TOKENS = [
    "access", "login", "logged out", "security", "token", "seller central", "shopify admin",
    "browser/api workaround", "verify account", "reset",
]
PASSIVE_TOKENS = [
    "wait for", "passive monitoring", "watch item", "review only if", "if ev wants",
    "recommendations only", "not urgent", "keep it low priority", "unless",
]
ACTION_TOKENS = [
    "needs", "reply", "decision", "verify", "check", "follow-up", "follow up", "refund",
    "ship", "shipment", "invoice", "token", "security", "regeneration",
]


@dataclass
class Summary:
    target_date: str
    generated_at: str
    total_active_items: int
    blocked_access_items: int
    passive_watch_items: int
    stale_date_items: int
    top_ranked_low_action: int


@dataclass
class Item:
    section: str
    rank: int
    score: float
    kind: str
    task: str
    refs: list[str]
    note: str


def _clone_latest(versioned: Path, latest: Path) -> None:
    shutil.copyfile(versioned, latest)


def _match_any(text: str, tokens: list[str]) -> bool:
    lt = text.lower()
    return any(token in lt for token in tokens)


def _action_signals(text: str) -> int:
    lt = text.lower()
    return sum(1 for token in ACTION_TOKENS if token in lt)


def build_payload(target_date: str, generated_at: str) -> dict[str, Any]:
    if not BUSINESS_STATE.exists():
        raise SystemExit(f"Missing {BUSINESS_STATE}")

    buckets = parse_business_state_tasks(BUSINESS_STATE.read_text(encoding="utf-8"))
    tasks = build_tasks(buckets)
    now_date = datetime.strptime(target_date, "%Y-%m-%d").date()

    blocked_access: list[Item] = []
    passive_watch: list[Item] = []
    stale_date: list[Item] = []
    low_action_top: list[Item] = []

    for idx, task in enumerate(tasks, start=1):
        refs: list[str] = []
        if _match_any(task.text, ACCESS_TOKENS):
            blocked_access.append(Item(
                section=task.section,
                rank=idx,
                score=task.score,
                kind="blocked_access",
                task=task.text,
                refs=[],
                note="Needs authenticated access, token refresh, or direct account/security check before progress.",
            ))

        if _match_any(task.text, PASSIVE_TOKENS):
            passive_watch.append(Item(
                section=task.section,
                rank=idx,
                score=task.score,
                kind="passive_watch",
                task=task.text,
                refs=[],
                note="Useful context, but likely not first-block execution work.",
            ))

        stale_refs = extract_stale_date_refs(task.text, now_date)
        if stale_refs:
            stale_date.append(Item(
                section=task.section,
                rank=idx,
                score=task.score,
                kind="stale_date_ref",
                task=task.text,
                refs=stale_refs,
                note="Contains past-dated reference; may need rewrite, confirmation, or demotion.",
            ))

        if idx <= 12 and _action_signals(task.text) <= 1 and (_match_any(task.text, PASSIVE_TOKENS) or "pending" in task.text.lower()):
            low_action_top.append(Item(
                section=task.section,
                rank=idx,
                score=task.score,
                kind="top_ranked_low_action",
                task=task.text,
                refs=stale_refs,
                note="Surfaced high in the ranked board despite weak immediate action signal.",
            ))

    urgent_without_source = [
        Item(
            section=task.section,
            rank=idx,
            score=task.score,
            kind="urgent_without_source",
            task=task.text,
            refs=[],
            note="Urgent item has no explicit message/source pointer.",
        )
        for idx, task in enumerate(tasks, start=1)
        if task.section == "urgent" and not has_source(task.text)
    ]

    payload = {
        "summary": asdict(Summary(
            target_date=target_date,
            generated_at=generated_at,
            total_active_items=len(tasks),
            blocked_access_items=len(blocked_access),
            passive_watch_items=len(passive_watch),
            stale_date_items=len(stale_date),
            top_ranked_low_action=len(low_action_top),
        )),
        "blocked_access": [asdict(item) for item in blocked_access[:12]],
        "passive_watch": [asdict(item) for item in passive_watch[:12]],
        "stale_date": [asdict(item) for item in stale_date[:12]],
        "top_ranked_low_action": [asdict(item) for item in low_action_top[:12]],
        "urgent_without_source": [asdict(item) for item in urgent_without_source[:12]],
    }
    return payload


def render_markdown(payload: dict[str, Any]) -> str:
    s = payload["summary"]
    lines = [
        f"# Morning Actionability Desk — {s['target_date']}",
        "",
        f"Generated: {s['generated_at']}",
        "",
        "## Snapshot",
        f"- Active items scanned: **{s['total_active_items']}**",
        f"- Access / token blockers: **{s['blocked_access_items']}**",
        f"- Passive / watch-only items: **{s['passive_watch_items']}**",
        f"- Stale date refs still active: **{s['stale_date_items']}**",
        f"- High-ranked but low-action items: **{s['top_ranked_low_action']}**",
        "",
    ]

    sections = [
        ("blocked_access", "Blocked on access / token / login"),
        ("passive_watch", "Passive / watch-only context"),
        ("stale_date", "Past-dated active items"),
        ("top_ranked_low_action", "High-ranked but low-action items"),
        ("urgent_without_source", "Urgent items missing source evidence"),
    ]
    for key, title in sections:
        lines.append(f"## {title}")
        items = payload.get(key) or []
        if not items:
            lines.append("- None surfaced.")
            lines.append("")
            continue
        for item in items:
            ref_suffix = f" Refs: {', '.join(item['refs'])}." if item.get("refs") else ""
            lines.append(
                f"- **#{item['rank']} · {item['section']} · score {item['score']}** — {item['note']}{ref_suffix}"
            )
            lines.append(f"  - {item['task']}")
        lines.append("")
    return "\n".join(lines)


def _render_rows(items: list[dict[str, Any]]) -> str:
    rows = []
    for item in items:
        rows.append(
            "<tr>"
            f"<td>{item['rank']}</td>"
            f"<td>{escape(item['section'])}</td>"
            f"<td>{item['score']}</td>"
            f"<td>{escape(item['note'])}</td>"
            f"<td>{escape(', '.join(item.get('refs') or []) or '—')}</td>"
            f"<td>{escape(item['task'])}</td>"
            "</tr>"
        )
    return ''.join(rows) or '<tr><td colspan="6" class="muted">None surfaced.</td></tr>'


def render_html(payload: dict[str, Any]) -> str:
    s = payload["summary"]
    return f"""<!doctype html>
<html lang=\"en\">
<head>
<meta charset=\"utf-8\" />
<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
<title>Morning Actionability Desk — {escape(s['target_date'])}</title>
<style>
:root {{--bg:#0A1628;--surface:#111B2E;--border:#1E293B;--text:#fff;--muted:#94A3B8;}}
*{{box-sizing:border-box}} body{{margin:0;padding:24px;background:var(--bg);color:var(--text);font-family:Inter,-apple-system,sans-serif}}
.wrap{{max-width:1280px;margin:0 auto}} .grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}}
.card,.panel{{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px}}
.k{{color:var(--muted);font-size:12px}} .v{{font-size:26px;font-weight:750;margin-top:4px}} .muted{{color:var(--muted)}}
table{{width:100%;border-collapse:collapse;font-size:13px}} th,td{{padding:8px;border-bottom:1px solid var(--border);text-align:left;vertical-align:top}} th{{color:var(--muted);font-size:11px;text-transform:uppercase}}
a{{color:#93C5FD;text-decoration:none}}
</style>
</head>
<body>
<div class=\"wrap\">
  <h1>Morning Actionability Desk</h1>
  <div class=\"muted\">{escape(s['generated_at'])} · keep the first work block pointed at executable work</div>
  <p><a href=\"./morning-ops-hub-latest.html\">Open morning ops hub</a></p>
  <div class=\"grid\">
    <div class=\"card\"><div class=\"k\">Active items scanned</div><div class=\"v\">{s['total_active_items']}</div></div>
    <div class=\"card\"><div class=\"k\">Access / token blockers</div><div class=\"v\">{s['blocked_access_items']}</div></div>
    <div class=\"card\"><div class=\"k\">Passive / watch-only</div><div class=\"v\">{s['passive_watch_items']}</div></div>
    <div class=\"card\"><div class=\"k\">Stale date refs</div><div class=\"v\">{s['stale_date_items']}</div></div>
    <div class=\"card\"><div class=\"k\">High-ranked low-action</div><div class=\"v\">{s['top_ranked_low_action']}</div></div>
  </div>
  <div class=\"panel\" style=\"margin-top:12px\"><h3>Blocked on access / token / login</h3><table><thead><tr><th>Rank</th><th>Section</th><th>Score</th><th>Note</th><th>Refs</th><th>Task</th></tr></thead><tbody>{_render_rows(payload.get('blocked_access') or [])}</tbody></table></div>
  <div class=\"panel\" style=\"margin-top:12px\"><h3>Passive / watch-only context</h3><table><thead><tr><th>Rank</th><th>Section</th><th>Score</th><th>Note</th><th>Refs</th><th>Task</th></tr></thead><tbody>{_render_rows(payload.get('passive_watch') or [])}</tbody></table></div>
  <div class=\"panel\" style=\"margin-top:12px\"><h3>Past-dated active items</h3><table><thead><tr><th>Rank</th><th>Section</th><th>Score</th><th>Note</th><th>Refs</th><th>Task</th></tr></thead><tbody>{_render_rows(payload.get('stale_date') or [])}</tbody></table></div>
  <div class=\"panel\" style=\"margin-top:12px\"><h3>High-ranked but low-action items</h3><table><thead><tr><th>Rank</th><th>Section</th><th>Score</th><th>Note</th><th>Refs</th><th>Task</th></tr></thead><tbody>{_render_rows(payload.get('top_ranked_low_action') or [])}</tbody></table></div>
  <div class=\"panel\" style=\"margin-top:12px\"><h3>Urgent items missing source evidence</h3><table><thead><tr><th>Rank</th><th>Section</th><th>Score</th><th>Note</th><th>Refs</th><th>Task</th></tr></thead><tbody>{_render_rows(payload.get('urgent_without_source') or [])}</tbody></table></div>
</div>
</body>
</html>
"""


def main() -> int:
    parser = argparse.ArgumentParser(description="Build morning actionability desk")
    parser.add_argument("--date", help="Output date YYYY-MM-DD")
    args = parser.parse_args()

    now = datetime.now().astimezone()
    date_str = args.date or now.strftime("%Y-%m-%d")
    generated_at = now.strftime("%Y-%m-%d %H:%M %Z")
    payload = build_payload(date_str, generated_at)

    REPORTS.mkdir(parents=True, exist_ok=True)
    md_path = REPORTS / f"morning-actionability-{date_str}.md"
    html_path = REPORTS / f"morning-actionability-{date_str}.html"
    json_path = REPORTS / f"morning-actionability-{date_str}.json"

    md_path.write_text(render_markdown(payload) + "\n", encoding="utf-8")
    html_path.write_text(render_html(payload), encoding="utf-8")
    json_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    _clone_latest(md_path, REPORTS / "morning-actionability-latest.md")
    _clone_latest(html_path, REPORTS / "morning-actionability-latest.html")
    _clone_latest(json_path, REPORTS / "morning-actionability-latest.json")

    print(f"Built {md_path.relative_to(ROOT)}")
    print(f"Built {html_path.relative_to(ROOT)}")
    print(f"Built {json_path.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
