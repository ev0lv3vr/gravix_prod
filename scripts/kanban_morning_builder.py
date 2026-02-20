#!/usr/bin/env python3
"""
Build a focused morning-priority pack from KANBAN.md.

Outputs:
- reports/morning-priority-pack-YYYY-MM-DD.md
- stdout telegram-friendly summary with top actions
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
KANBAN = ROOT / "KANBAN.md"
REPORTS = ROOT / "reports"

SECTION_HEADERS = {
    "urgent": "## 🔴 URGENT / BLOCKED",
    "needs_ev": "## 🟡 NEEDS EV / WAITING",
    "in_progress": "## 🔵 IN PROGRESS",
    "backlog": "## 📋 BACKLOG",
}


@dataclass
class Task:
    text: str
    checked: bool


def parse_section(lines: list[str], header: str) -> list[Task]:
    start = None
    for i, line in enumerate(lines):
        if line.strip() == header:
            start = i + 1
            break
    if start is None:
        return []

    end = len(lines)
    for j in range(start, len(lines)):
        if lines[j].startswith("## "):
            end = j
            break

    tasks: list[Task] = []
    for line in lines[start:end]:
        m = re.match(r"^- \[( |x)\] (.+)$", line.strip())
        if not m:
            continue
        tasks.append(Task(text=m.group(2).strip(), checked=(m.group(1) == "x")))
    return tasks


def severity(task_text: str) -> int:
    t = task_text.lower()
    if any(k in t for k in ["oos", "out of stock", "risk", "urgent", "blocked", "fees", "deactivated"]):
        return 3
    if any(k in t for k in ["pending", "review", "disable", "monitor", "waiting"]):
        return 2
    return 1


def main() -> int:
    if not KANBAN.exists():
        print(f"KANBAN not found: {KANBAN}", file=sys.stderr)
        return 1

    lines = KANBAN.read_text().splitlines()

    urgent = [t for t in parse_section(lines, SECTION_HEADERS["urgent"]) if not t.checked]
    needs_ev = [t for t in parse_section(lines, SECTION_HEADERS["needs_ev"]) if not t.checked]
    in_progress = [t for t in parse_section(lines, SECTION_HEADERS["in_progress"]) if not t.checked]
    backlog = [t for t in parse_section(lines, SECTION_HEADERS["backlog"]) if not t.checked]

    top_actions = sorted(urgent, key=lambda t: severity(t.text), reverse=True)[:5]
    next_actions = sorted(needs_ev, key=lambda t: severity(t.text), reverse=True)[:6]
    watch_items = in_progress[:5]

    now = datetime.now()
    stamp = now.strftime("%Y-%m-%d")
    REPORTS.mkdir(parents=True, exist_ok=True)
    out = REPORTS / f"morning-priority-pack-{stamp}.md"

    md: list[str] = []
    md.append(f"# Morning Priority Pack — {stamp}")
    md.append("")
    md.append("Source: `KANBAN.md`")
    md.append("")
    md.append("## 1) Top 5 must-do first")
    if top_actions:
        for t in top_actions:
            md.append(f"- {t.text}")
    else:
        md.append("- No open urgent items.")

    md.append("")
    md.append("## 2) Needs Ev decision/input")
    if next_actions:
        for t in next_actions:
            md.append(f"- {t.text}")
    else:
        md.append("- No open items.")

    md.append("")
    md.append("## 3) In progress watchlist")
    if watch_items:
        for t in watch_items:
            md.append(f"- {t.text}")
    else:
        md.append("- No active in-progress items.")

    md.append("")
    md.append("## 4) Queue depth")
    md.append(f"- Urgent open: **{len(urgent)}**")
    md.append(f"- Needs Ev open: **{len(needs_ev)}**")
    md.append(f"- In progress open: **{len(in_progress)}**")
    md.append(f"- Backlog open: **{len(backlog)}**")

    out.write_text("\n".join(md) + "\n")

    tg: list[str] = []
    tg.append("🌅 Morning Priority Pack")
    tg.append(f"Date: {stamp}")
    tg.append("")
    tg.append(f"🔴 Urgent: {len(urgent)} | 🟡 Needs Ev: {len(needs_ev)} | 🔵 In Progress: {len(in_progress)}")
    tg.append("Top actions:")
    for i, t in enumerate(top_actions, 1):
        short = t.text if len(t.text) <= 95 else t.text[:92] + "..."
        tg.append(f"{i}. {short}")

    print("\n".join(tg))
    print(f"\nSaved: {out}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
