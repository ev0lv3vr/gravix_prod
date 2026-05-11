#!/usr/bin/env python3
"""build_morning_delta_brief.py

Generate a morning delta brief showing what changed versus the prior dated board.

Outputs:
- reports/morning-delta-brief-YYYY-MM-DD.md
- reports/morning-delta-brief-YYYY-MM-DD.html
- reports/morning-delta-brief-YYYY-MM-DD.json
- reports/morning-delta-brief-latest.md
- reports/morning-delta-brief-latest.html
- reports/morning-delta-brief-latest.json
"""

from __future__ import annotations

import argparse
import glob
import json
import re
import shutil
from datetime import datetime
from html import escape
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
REPORTS = ROOT / "reports"


def _clone_latest(versioned: Path, latest: Path) -> None:
    shutil.copyfile(versioned, latest)


def _load_json(path: Path | None) -> dict[str, Any] | None:
    if not path or not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def _clean(text: str) -> str:
    text = re.sub(r"`([^`]+)`", r"\1", text or "")
    text = text.replace("**", "")
    return " ".join(text.split())


def _task_key(task: dict[str, Any]) -> str:
    text = _clean(task.get("text") or "").lower()
    head = text.split(" — ", 1)[0].strip()
    return head or text


def _is_low_signal(task: dict[str, Any]) -> bool:
    text = _clean(task.get("text") or "").lower()
    return any(token in text for token in [
        "artifact is live for testing",
        "sales-email-monitor:",
        "evgueni-email-monitor:",
        "ads-daily-pull:",
        "recent timeout patches",
        "should keep running",
    ])


def _latest_previous_board(date_str: str) -> Path | None:
    matches = sorted(REPORTS.glob("morning-execution-board-*.json"))
    previous = [p for p in matches if p.stem.replace("morning-execution-board-", "") < date_str]
    return previous[-1] if previous else None


def _top_changes(current_tasks: list[dict[str, Any]], previous_tasks: list[dict[str, Any]]) -> dict[str, Any]:
    current_top = current_tasks[:8]
    previous_top = previous_tasks[:8]
    current_keys = {_task_key(task): i + 1 for i, task in enumerate(current_top)}
    previous_keys = {_task_key(task): i + 1 for i, task in enumerate(previous_top)}

    entered = [task for task in current_top if _task_key(task) not in previous_keys and not _is_low_signal(task)]
    exited = [task for task in previous_top if _task_key(task) not in current_keys and not _is_low_signal(task)]

    movers: list[dict[str, Any]] = []
    for task in current_top:
        key = _task_key(task)
        if key not in previous_keys:
            continue
        current_rank = current_keys[key]
        previous_rank = previous_keys[key]
        delta = previous_rank - current_rank
        if abs(delta) >= 2:
            movers.append({
                "title": _clean(task.get("text") or ""),
                "current_rank": current_rank,
                "previous_rank": previous_rank,
                "delta": delta,
            })

    return {
        "entered": entered,
        "exited": exited,
        "movers": movers,
    }


def build_payload(date_str: str, generated_at: str, current: dict[str, Any], previous: dict[str, Any] | None) -> dict[str, Any]:
    current_tasks = current.get("all_tasks_ranked") or []
    previous_tasks = (previous or {}).get("all_tasks_ranked") or []

    current_map = {_task_key(task): {**task, "rank": i + 1} for i, task in enumerate(current_tasks)}
    previous_map = {_task_key(task): {**task, "rank": i + 1} for i, task in enumerate(previous_tasks)}

    new_items = [task for key, task in current_map.items() if key not in previous_map and not _is_low_signal(task)]
    resolved_items = [task for key, task in previous_map.items() if key not in current_map and not _is_low_signal(task)]

    movers: list[dict[str, Any]] = []
    for key, task in current_map.items():
        previous_task = previous_map.get(key)
        if not previous_task:
            continue
        delta = previous_task["rank"] - task["rank"]
        section_changed = previous_task.get("section") != task.get("section")
        if _is_low_signal(task):
            continue
        if abs(delta) >= 3 or section_changed:
            movers.append({
                "title": _clean(task.get("text") or ""),
                "current_rank": task["rank"],
                "previous_rank": previous_task["rank"],
                "delta": delta,
                "current_section": task.get("section_label") or task.get("section"),
                "previous_section": previous_task.get("section_label") or previous_task.get("section"),
            })

    movers.sort(key=lambda item: (-abs(item["delta"]), item["current_rank"]))
    top_changes = _top_changes(current_tasks, previous_tasks)

    current_counts = current.get("section_counts") or {}
    previous_counts = (previous or {}).get("section_counts") or {}
    section_delta = {
        section: (current_counts.get(section, 0) - previous_counts.get(section, 0))
        for section in sorted(set(current_counts) | set(previous_counts))
    }

    return {
        "date": date_str,
        "generated_at": generated_at,
        "previous_date": (previous or {}).get("date"),
        "summary": {
            "total_open": current.get("total_open", 0),
            "previous_total_open": (previous or {}).get("total_open"),
            "new_items": len(new_items),
            "resolved_items": len(resolved_items),
            "rank_movers": len(movers),
            "top_entered": len(top_changes["entered"]),
            "top_exited": len(top_changes["exited"]),
            "section_delta": section_delta,
        },
        "new_items": [
            {
                "title": _clean(task.get("text") or ""),
                "rank": task["rank"],
                "section": task.get("section_label") or task.get("section"),
                "est_minutes": task.get("est_minutes"),
            }
            for task in sorted(new_items, key=lambda item: item["rank"])[:10]
        ],
        "resolved_items": [
            {
                "title": _clean(task.get("text") or ""),
                "previous_rank": task["rank"],
                "section": task.get("section_label") or task.get("section"),
            }
            for task in sorted(resolved_items, key=lambda item: item["rank"])[:10]
        ],
        "rank_movers": movers[:12],
        "top_changes": {
            "entered": [
                {
                    "title": _clean(task.get("text") or ""),
                    "rank": current_map[_task_key(task)]["rank"],
                    "est_minutes": task.get("est_minutes"),
                }
                for task in top_changes["entered"]
            ],
            "exited": [
                {
                    "title": _clean(task.get("text") or ""),
                    "previous_rank": previous_tasks.index(task) + 1,
                }
                for task in top_changes["exited"]
            ],
            "movers": top_changes["movers"][:8],
        },
        "memory_context": current.get("memory_context") or [],
        "current_top": [
            {
                "rank": i + 1,
                "title": _clean(task.get("text") or ""),
                "section": task.get("section_label") or task.get("section"),
                "est_minutes": task.get("est_minutes"),
            }
            for i, task in enumerate((current.get("top_actions") or [])[:8])
        ],
    }


def _delta_text(value: int) -> str:
    if value > 0:
        return f"+{value}"
    if value < 0:
        return str(value)
    return "0"


def render_markdown(payload: dict[str, Any]) -> str:
    s = payload["summary"]
    out: list[str] = []
    out.append(f"# Morning Delta Brief — {payload['date']}")
    out.append("")
    out.append(f"Generated: {payload['generated_at']}")
    if payload.get("previous_date"):
        out.append(f"Compared with: {payload['previous_date']}")
    out.append("")
    out.append("## Snapshot")
    out.append(f"- Open tasks: **{s['total_open']}** ({_delta_text(s['total_open'] - (s['previous_total_open'] or 0))} vs previous)")
    out.append(f"- New items surfaced: **{s['new_items']}**")
    out.append(f"- Items removed from board: **{s['resolved_items']}**")
    out.append(f"- Rank movers: **{s['rank_movers']}**")
    out.append(f"- Top 8 churn: **+{s['top_entered']} / -{s['top_exited']}**")
    out.append("")
    out.append("## Section deltas")
    for section, label in [("urgent", "🔴 Urgent"), ("needs_ev", "🟡 Needs Ev"), ("in_progress", "🔵 In Progress"), ("backlog", "📋 Backlog")]:
        out.append(f"- {label}: **{_delta_text(s['section_delta'].get(section, 0))}**")
    out.append("")

    sections = [
        ("New since last board", "new_items", lambda item: f"**#{item['rank']}** · {item['section']} · {item['title']} (~{item.get('est_minutes','—')}m)"),
        ("Dropped off / resolved", "resolved_items", lambda item: f"**prev #{item['previous_rank']}** · {item['section']} · {item['title']}"),
        ("Big rank moves", "rank_movers", lambda item: f"**#{item['current_rank']}** from #{item['previous_rank']} ({_delta_text(item['delta'])}) · {item['title']}"),
        ("Top 8 new entrants", ("top_changes", "entered"), lambda item: f"**#{item['rank']}** · {item['title']} (~{item.get('est_minutes','—')}m)"),
        ("Top 8 exits", ("top_changes", "exited"), lambda item: f"**prev #{item['previous_rank']}** · {item['title']}"),
    ]

    for title, key, fmt in sections:
        out.append(f"## {title}")
        items = payload[key[0]][key[1]] if isinstance(key, tuple) else payload[key]
        if not items:
            out.append("- None")
        else:
            for item in items:
                out.append(f"- {fmt(item)}")
        out.append("")

    out.append("## Recent memory context")
    memory_lines = [line for line in payload["memory_context"] if "still pending" not in line.lower()][:10]
    if not memory_lines:
        out.append("- None")
    else:
        for line in memory_lines:
            out.append(f"- {line}")
    out.append("")

    out.append("## Current top 8")
    for item in payload["current_top"]:
        out.append(f"- **#{item['rank']}** · {item['title']} (~{item.get('est_minutes','—')}m)")
    out.append("")
    return "\n".join(out) + "\n"


def render_html(payload: dict[str, Any]) -> str:
    s = payload["summary"]

    def render_list(items: list[dict[str, Any]], formatter) -> str:
        if not items:
            return "<li class='muted'>Nothing surfaced.</li>"
        return "".join(f"<li>{formatter(item)}</li>" for item in items)

    section_cards = "".join(
        f"<div class='card'><div class='muted'>{escape(label)}</div><div class='value'>{escape(_delta_text(s['section_delta'].get(key, 0)))}</div></div>"
        for key, label in [("urgent", "Urgent"), ("needs_ev", "Needs Ev"), ("in_progress", "In Progress"), ("backlog", "Backlog")]
    )

    return f"""<!doctype html>
<html lang=\"en\">
<head>
<meta charset=\"utf-8\" />
<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
<title>Morning Delta Brief — {escape(payload['date'])}</title>
<style>
:root {{--bg:#0A1628;--surface:#111B2E;--surface2:#0F1A2C;--border:#1E293B;--text:#fff;--muted:#94A3B8;--accent:#3B82F6;--good:#22c55e;--warn:#f59e0b;}}
*{{box-sizing:border-box}} body{{margin:0;padding:24px;background:var(--bg);color:var(--text);font-family:Inter,-apple-system,sans-serif}}
.wrap{{max-width:1200px;margin:0 auto}} .grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}} .two{{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}} @media (max-width:900px){{.two{{grid-template-columns:1fr}}}}
.panel,.card{{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px}} .card .value{{font-size:28px;font-weight:800;margin-top:6px}} .muted{{color:var(--muted)}} h1{{margin:0 0 6px}} h3{{margin:0 0 8px}} ul{{margin:8px 0 0 18px}} li{{margin:6px 0}} .links{{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0 18px}} a{{color:#93C5FD;text-decoration:none}} a.link{{background:#102446;border:1px solid var(--border);padding:6px 10px;border-radius:10px;font-size:13px}} .hero{{margin-bottom:12px}} .sub{{color:var(--muted)}}
</style>
</head>
<body>
<div class=\"wrap\">
  <div class=\"hero\">
    <h1>Morning Delta Brief</h1>
    <div class=\"sub\">{escape(payload['generated_at'])} · compared with {escape(payload.get('previous_date') or 'the previous saved board')}</div>
  </div>
  <div class=\"links\">
    <a class=\"link\" href=\"./morning-ops-hub-latest.html\">Morning Ops Hub</a>
    <a class=\"link\" href=\"./morning-decision-desk-latest.html\">Decision Desk</a>
    <a class=\"link\" href=\"./morning-customer-desk-latest.html\">Customer Desk</a>
    <a class=\"link\" href=\"../BUSINESS_STATE.md\">Business State</a>
  </div>
  <div class=\"grid\">
    <div class=\"card\"><div class=\"muted\">Open tasks</div><div class=\"value\">{s['total_open']}</div><div class=\"muted\">{escape(_delta_text(s['total_open'] - (s['previous_total_open'] or 0)))} vs previous</div></div>
    <div class=\"card\"><div class=\"muted\">New items</div><div class=\"value\">{s['new_items']}</div></div>
    <div class=\"card\"><div class=\"muted\">Removed items</div><div class=\"value\">{s['resolved_items']}</div></div>
    <div class=\"card\"><div class=\"muted\">Rank movers</div><div class=\"value\">{s['rank_movers']}</div></div>
  </div>
  <div class=\"grid\" style=\"margin-top:12px\">{section_cards}</div>
  <div class=\"two\">
    <div class=\"panel\"><h3>New since last board</h3><ul>{render_list(payload['new_items'], lambda item: escape(f"#{item['rank']} · {item['section']} · {item['title']} (~{item.get('est_minutes','—')}m)"))}</ul></div>
    <div class=\"panel\"><h3>Dropped off / resolved</h3><ul>{render_list(payload['resolved_items'], lambda item: escape(f"prev #{item['previous_rank']} · {item['section']} · {item['title']}"))}</ul></div>
  </div>
  <div class=\"two\">
    <div class=\"panel\"><h3>Big rank moves</h3><ul>{render_list(payload['rank_movers'], lambda item: escape(f"#{item['current_rank']} from #{item['previous_rank']} ({_delta_text(item['delta'])}) · {item['title']}"))}</ul></div>
    <div class=\"panel\"><h3>Top 8 churn</h3><ul>{render_list(payload['top_changes']['entered'], lambda item: escape(f"IN #{item['rank']} · {item['title']} (~{item.get('est_minutes','—')}m)"))}{render_list(payload['top_changes']['exited'], lambda item: escape(f"OUT prev #{item['previous_rank']} · {item['title']}"))}</ul></div>
  </div>
  <div class=\"two\">
    <div class=\"panel\"><h3>Recent memory context</h3><ul>{render_list([{'line': line} for line in payload['memory_context'][:10]], lambda item: escape(item['line']))}</ul></div>
    <div class=\"panel\"><h3>Current top 8</h3><ul>{render_list(payload['current_top'], lambda item: escape(f"#{item['rank']} · {item['title']} (~{item.get('est_minutes','—')}m)"))}</ul></div>
  </div>
</div>
</body>
</html>
"""


def main() -> int:
    parser = argparse.ArgumentParser(description="Build morning delta brief")
    parser.add_argument("--date", help="Output date YYYY-MM-DD")
    args = parser.parse_args()

    now = datetime.now().astimezone()
    date_str = args.date or now.strftime("%Y-%m-%d")
    generated_at = now.strftime("%Y-%m-%d %H:%M %Z")

    current_path = REPORTS / f"morning-execution-board-{date_str}.json"
    current = _load_json(current_path) or _load_json(REPORTS / "morning-execution-board-latest.json")
    if not current:
        raise SystemExit("Missing morning execution board; run kanban_morning_builder first")

    previous = _load_json(_latest_previous_board(date_str))
    payload = build_payload(date_str, generated_at, current, previous)

    REPORTS.mkdir(parents=True, exist_ok=True)
    md_path = REPORTS / f"morning-delta-brief-{date_str}.md"
    html_path = REPORTS / f"morning-delta-brief-{date_str}.html"
    json_path = REPORTS / f"morning-delta-brief-{date_str}.json"

    md_path.write_text(render_markdown(payload), encoding="utf-8")
    html_path.write_text(render_html(payload), encoding="utf-8")
    json_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    _clone_latest(md_path, REPORTS / "morning-delta-brief-latest.md")
    _clone_latest(html_path, REPORTS / "morning-delta-brief-latest.html")
    _clone_latest(json_path, REPORTS / "morning-delta-brief-latest.json")

    print(f"Built {md_path.relative_to(ROOT)}")
    print(f"Built {html_path.relative_to(ROOT)}")
    print(f"Built {json_path.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
