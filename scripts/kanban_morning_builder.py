#!/usr/bin/env python3
"""
Build a focused morning execution board from KANBAN.md (+ latest memory context).

Outputs:
- reports/morning-priority-pack-YYYY-MM-DD.md
- reports/morning-execution-board-YYYY-MM-DD.html
- reports/morning-execution-board-YYYY-MM-DD.json
- reports/morning-priority-pack-latest.md
- reports/morning-execution-board-latest.html
- reports/morning-execution-board-latest.json

Usage:
  python3 scripts/kanban_morning_builder.py
  python3 scripts/kanban_morning_builder.py --date 2026-04-06
"""

from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import datetime
from html import escape
from pathlib import Path
import argparse
import json
import re
import shutil
from typing import Iterable

ROOT = Path(__file__).resolve().parents[1]
KANBAN = ROOT / "KANBAN.md"
MEMORY_DIR = ROOT / "memory"
REPORTS = ROOT / "reports"

SECTION_ORDER = [
    ("urgent", "🔴 URGENT"),
    ("needs_ev", "🟡 NEEDS EV"),
    ("in_progress", "🔵 IN PROGRESS"),
    ("backlog", "📋 BACKLOG"),
]

SECTION_BASE_SCORE = {
    "urgent": 40,
    "needs_ev": 25,
    "in_progress": 14,
    "backlog": 6,
}

RISK_BONUS = {
    "risk": 12,
    "urgent": 10,
    "overdue": 10,
    "suppressed": 9,
    "chargeback": 8,
    "a-to-z": 8,
    "unshipped": 7,
    "pending": 4,
    "deadline": 6,
}

MINUTE_HINTS = [
    ("refund", 7),
    ("reply", 8),
    ("submit", 20),
    ("ship", 25),
    ("regen", 20),
    ("token", 20),
    ("appeal", 45),
    ("audit", 25),
    ("decision", 10),
]


@dataclass
class Task:
    section: str
    section_label: str
    text: str
    days: int | None
    amount: float | None
    daily_burn: float | None
    score: float
    est_minutes: int


@dataclass
class BuildOutput:
    date: str
    generated_at: str
    total_open: int
    section_counts: dict[str, int]
    top_actions: list[Task]
    all_tasks_ranked: list[Task]
    memory_context: list[str]
    quick_math: dict[str, float]


def _normalize_header(line: str) -> str:
    return line.strip().lower()


def _find_section(normalized: str) -> tuple[str, str] | None:
    if not normalized.startswith("##"):
        return None
    for key, label in SECTION_ORDER:
        if key.replace("_", " ") in normalized or label.lower() in normalized:
            return key, label
    return None


def parse_kanban_tasks(text: str) -> dict[str, list[str]]:
    buckets: dict[str, list[str]] = {k: [] for k, _ in SECTION_ORDER}
    current: str | None = None

    for raw in text.splitlines():
        line = raw.rstrip()
        section = _find_section(_normalize_header(line))
        if section:
            current = section[0]
            continue

        if current is None:
            continue

        m = re.match(r"^\s*- \[( |x)\]\s+(.+)$", line)
        if not m:
            continue
        if m.group(1).lower() == "x":
            continue
        buckets[current].append(m.group(2).strip())

    return buckets


def parse_days(text: str) -> int | None:
    patterns = [
        r"(\d{1,3})\s*\+?\s*days?",
        r"day\s*(\d{1,3})",
        r"(\d{1,3})\s*d\b",
    ]
    for p in patterns:
        m = re.search(p, text.lower())
        if m:
            return int(m.group(1))
    return None


def parse_amount(text: str) -> float | None:
    m = re.search(r"\$(\d{1,3}(?:,\d{3})*(?:\.\d+)?)([kKmM])?", text)
    if not m:
        return None
    value = float(m.group(1).replace(",", ""))
    suffix = (m.group(2) or "").lower()
    if suffix == "k":
        value *= 1000
    elif suffix == "m":
        value *= 1_000_000
    return value


def parse_daily_burn(text: str) -> float | None:
    """Parse true loss/burn signals, not normal spend/budgets.

    Accepts "$18/day", "$18/d", "$18 per day" when language implies loss.
    """
    lt = text.lower()
    if any(token in lt for token in ["spend", "budget increase", "budget", "roas", "acos"]):
        return None

    if not any(token in lt for token in ["burn", "lost", "loss", "accrued", "suppressed", "risk", "debt"]):
        return None

    m = re.search(r"\$(\d+(?:\.\d+)?)\s*(?:/\s*(?:day|d)|per\s+day)", lt)
    if not m:
        return None
    return float(m.group(1))


def estimate_minutes(text: str, section: str) -> int:
    t = text.lower()
    for token, minutes in MINUTE_HINTS:
        if token in t:
            return minutes
    return {"urgent": 18, "needs_ev": 15, "in_progress": 20, "backlog": 30}[section]


def actionable_amount(text: str, amount: float | None) -> float | None:
    if amount is None:
        return None
    lt = text.lower()
    # Ignore reference/context amounts that are not immediate financial exposure.
    if any(token in lt for token in ["data ready", "sales data", "run rate", "revenue"]):
        return None
    return amount


def score_task(section: str, text: str, days: int | None, amount: float | None, daily_burn: float | None) -> float:
    s = float(SECTION_BASE_SCORE[section])
    if days is not None:
        s += min(days, 90) * 0.7
    if amount is not None:
        s += min(amount / 120, 28)
    if daily_burn is not None:
        s += min(daily_burn * 1.5, 20)

    lt = text.lower()
    for token, bonus in RISK_BONUS.items():
        if token in lt:
            s += bonus
    return round(s, 2)


def get_recent_memory_context(limit_files: int = 3) -> list[str]:
    if not MEMORY_DIR.exists():
        return []

    files = sorted(
        [p for p in MEMORY_DIR.glob("2026-*.md") if p.name != "error-log.md"],
        key=lambda p: p.name,
        reverse=True,
    )[:limit_files]

    context: list[str] = []
    for path in files:
        lines = path.read_text(encoding="utf-8").splitlines()
        # pick concise high-signal bullets
        for line in lines:
            l = line.strip()
            if not l.startswith("-"):
                continue
            if any(k in l.lower() for k in ["risk", "overdue", "follow up", "needs", "deadline", "outstanding", "urgent"]):
                context.append(f"{path.name}: {l[1:].strip()}")
                if len(context) >= 8:
                    return context
    return context[:8]


def build_tasks(buckets: dict[str, list[str]]) -> list[Task]:
    label_map = dict(SECTION_ORDER)
    tasks: list[Task] = []
    for section, items in buckets.items():
        for text in items:
            days = parse_days(text)
            amount = actionable_amount(text, parse_amount(text))
            burn = parse_daily_burn(text)
            tasks.append(
                Task(
                    section=section,
                    section_label=label_map[section],
                    text=text,
                    days=days,
                    amount=amount,
                    daily_burn=burn,
                    score=score_task(section, text, days, amount, burn),
                    est_minutes=estimate_minutes(text, section),
                )
            )
    return sorted(tasks, key=lambda t: t.score, reverse=True)


def fmt_money(v: float | None) -> str:
    if v is None:
        return "—"
    return f"${v:,.2f}" if abs(v - round(v)) > 0 else f"${v:,.0f}"


def render_markdown(report: BuildOutput) -> str:
    lines: list[str] = []
    lines.append(f"# Morning Priority Pack — {report.date}")
    lines.append("")
    lines.append(f"Generated: {report.generated_at}")
    lines.append("Source: `KANBAN.md` + recent `memory/*.md`")
    lines.append("")
    lines.append("## Queue Depth")
    for key, label in SECTION_ORDER:
        lines.append(f"- {label}: **{report.section_counts.get(key, 0)}**")
    lines.append(f"- Total open: **{report.total_open}**")
    lines.append("")
    lines.append("## Top 8 morning actions (ranked)")
    for i, t in enumerate(report.top_actions, 1):
        extras = []
        if t.days is not None:
            extras.append(f"{t.days}d")
        if t.amount is not None:
            extras.append(fmt_money(t.amount))
        if t.daily_burn is not None:
            extras.append(f"${t.daily_burn:.0f}/day")
        suffix = f" ({', '.join(extras)})" if extras else ""
        lines.append(f"{i}. [{t.section_label}] {t.text}{suffix} — score {t.score}, ~{t.est_minutes}m")
    lines.append("")
    lines.append("## 90-minute execution block")
    block = report.top_actions[:4]
    total = 0
    for t in block:
        total += t.est_minutes
        lines.append(f"- {t.est_minutes:>2}m • {t.text}")
    lines.append(f"- Planned time: **{total}m**")
    lines.append("")
    if report.memory_context:
        lines.append("## Context from recent conversation memory")
        for c in report.memory_context:
            lines.append(f"- {c}")
        lines.append("")
    lines.append("## Financial quick math")
    lines.append(f"- One-time dollars visible in tasks: **{fmt_money(report.quick_math['one_time_total'])}**")
    lines.append(f"- Daily burn visible in tasks: **${report.quick_math['daily_burn_total']:.0f}/day**")
    lines.append(f"- 30-day burn exposure: **{fmt_money(report.quick_math['daily_burn_total'] * 30)}**")

    return "\n".join(lines) + "\n"


def render_html(report: BuildOutput) -> str:
    cards = []
    for key, label in SECTION_ORDER:
        cards.append(
            f"<div class='card'><div class='k'>{escape(label)}</div><div class='v'>{report.section_counts.get(key, 0)}</div></div>"
        )

    rows = []
    for i, t in enumerate(report.all_tasks_ranked[:16], 1):
        rows.append(
            "<tr>"
            f"<td>{i}</td>"
            f"<td>{escape(t.section_label)}</td>"
            f"<td>{escape(t.text)}</td>"
            f"<td>{t.days if t.days is not None else '—'}</td>"
            f"<td>{fmt_money(t.amount)}</td>"
            f"<td>{fmt_money(t.daily_burn)}</td>"
            f"<td>{t.est_minutes}m</td>"
            f"<td>{t.score}</td>"
            "</tr>"
        )

    context = "".join(f"<li>{escape(c)}</li>" for c in report.memory_context) or "<li>No memory context found.</li>"

    return f"""<!doctype html>
<html lang=\"en\">
<head>
<meta charset=\"utf-8\" />
<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
<title>Morning Execution Board — {escape(report.date)}</title>
<style>
:root {{--bg:#0A1628;--surface:#111B2E;--accent:#3B82F6;--text:#fff;--muted:#94A3B8;--border:#1E293B;}}
*{{box-sizing:border-box}} body{{margin:0;padding:24px;background:var(--bg);color:var(--text);font-family:Inter,-apple-system,sans-serif}}
h1{{margin:0 0 8px}} .sub{{color:var(--muted);margin-bottom:18px}}
.grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin:14px 0 22px}}
.card{{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:12px}}
.k{{color:var(--muted);font-size:12px}} .v{{font-size:26px;font-weight:700;margin-top:4px}}
.panel{{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:14px;margin-top:12px}}
table{{width:100%;border-collapse:collapse;font-size:13px}} th,td{{padding:8px;border-bottom:1px solid var(--border);text-align:left;vertical-align:top}}
th{{color:var(--muted);font-size:11px;text-transform:uppercase}}
ul{{margin:8px 0 0 18px}} li{{margin:6px 0;color:var(--muted)}}
.tag{{display:inline-block;background:#1E3A5F;border-radius:6px;padding:2px 8px;color:#93C5FD;font-size:12px}}
</style>
</head>
<body>
  <h1>⚡ Morning Execution Board</h1>
  <div class=\"sub\">{escape(report.generated_at)} · Ranked from KANBAN + recent memory context</div>

  <div class=\"grid\">
    {''.join(cards)}
    <div class='card'><div class='k'>Total Open</div><div class='v'>{report.total_open}</div></div>
    <div class='card'><div class='k'>One-Time $ at Stake</div><div class='v'>{fmt_money(report.quick_math['one_time_total'])}</div></div>
    <div class='card'><div class='k'>Daily Burn</div><div class='v'>${report.quick_math['daily_burn_total']:.0f}/d</div></div>
  </div>

  <div class=\"panel\">
    <div class=\"tag\">90-minute block</div>
    <ul>
      {''.join(f'<li><b>{t.est_minutes}m</b> — {escape(t.text)}</li>' for t in report.top_actions[:4])}
    </ul>
  </div>

  <div class=\"panel\">
    <h3 style=\"margin:0 0 8px\">Ranked tasks (top 16)</h3>
    <table>
      <thead><tr><th>#</th><th>Section</th><th>Task</th><th>Days</th><th>Amount</th><th>Burn/day</th><th>ETA</th><th>Score</th></tr></thead>
      <tbody>{''.join(rows)}</tbody>
    </table>
  </div>

  <div class=\"panel\">
    <h3 style=\"margin:0 0 8px\">Recent memory context</h3>
    <ul>{context}</ul>
  </div>
</body>
</html>
"""


def clone_latest(versioned: Path, latest: Path) -> None:
    shutil.copyfile(versioned, latest)


def main(argv: Iterable[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Generate morning execution board from KANBAN.md")
    parser.add_argument("--date", help="Output date (YYYY-MM-DD). Defaults to local today.")
    args = parser.parse_args(list(argv) if argv is not None else None)

    if not KANBAN.exists():
        raise SystemExit(f"KANBAN missing: {KANBAN}")

    now = datetime.now().astimezone()
    date_str = args.date or now.strftime("%Y-%m-%d")
    generated_at = now.strftime("%Y-%m-%d %H:%M %Z")

    buckets = parse_kanban_tasks(KANBAN.read_text(encoding="utf-8"))
    tasks = build_tasks(buckets)

    section_counts = {k: len(v) for k, v in buckets.items()}
    one_time_total = sum(t.amount or 0.0 for t in tasks)
    daily_burn_total = sum(t.daily_burn or 0.0 for t in tasks)

    report = BuildOutput(
        date=date_str,
        generated_at=generated_at,
        total_open=len(tasks),
        section_counts=section_counts,
        top_actions=tasks[:8],
        all_tasks_ranked=tasks,
        memory_context=get_recent_memory_context(limit_files=3),
        quick_math={
            "one_time_total": round(one_time_total, 2),
            "daily_burn_total": round(daily_burn_total, 2),
        },
    )

    REPORTS.mkdir(parents=True, exist_ok=True)
    md_path = REPORTS / f"morning-priority-pack-{date_str}.md"
    html_path = REPORTS / f"morning-execution-board-{date_str}.html"
    json_path = REPORTS / f"morning-execution-board-{date_str}.json"

    md_path.write_text(render_markdown(report), encoding="utf-8")
    html_path.write_text(render_html(report), encoding="utf-8")
    json_path.write_text(json.dumps(
        {
            "date": report.date,
            "generated_at": report.generated_at,
            "total_open": report.total_open,
            "section_counts": report.section_counts,
            "top_actions": [asdict(t) for t in report.top_actions],
            "all_tasks_ranked": [asdict(t) for t in report.all_tasks_ranked],
            "memory_context": report.memory_context,
            "quick_math": report.quick_math,
        },
        ensure_ascii=False,
        indent=2,
    ) + "\n", encoding="utf-8")

    clone_latest(md_path, REPORTS / "morning-priority-pack-latest.md")
    clone_latest(html_path, REPORTS / "morning-execution-board-latest.html")
    clone_latest(json_path, REPORTS / "morning-execution-board-latest.json")

    # concise terminal summary
    print(f"Built {md_path.relative_to(ROOT)}")
    print(f"Built {html_path.relative_to(ROOT)}")
    print(f"Built {json_path.relative_to(ROOT)}")
    print(f"Top action: {report.top_actions[0].text if report.top_actions else 'none'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
