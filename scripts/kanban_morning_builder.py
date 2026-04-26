#!/usr/bin/env python3
"""
Build a focused morning execution board from the active business state (+ latest memory context).

Outputs:
- reports/morning-priority-pack-YYYY-MM-DD.md
- reports/morning-execution-board-YYYY-MM-DD.html
- reports/morning-execution-board-YYYY-MM-DD.json
- reports/morning-ops-hub-YYYY-MM-DD.html
- reports/morning-priority-pack-latest.md
- reports/morning-execution-board-latest.html
- reports/morning-execution-board-latest.json
- reports/morning-ops-hub-latest.html

Usage:
  python3 scripts/kanban_morning_builder.py
  python3 scripts/kanban_morning_builder.py --date 2026-04-06
"""

from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import date, datetime
from html import escape
from pathlib import Path
import argparse
import json
import re
import shutil
from typing import Iterable


def latest_report_href(pattern: str) -> str | None:
    matches = sorted((ROOT / "reports").glob(pattern))
    if not matches:
        return None
    return f"./{matches[-1].name}"

ROOT = Path(__file__).resolve().parents[1]
BUSINESS_STATE = ROOT / "BUSINESS_STATE.md"
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


MONTHS = {
    "jan": 1,
    "january": 1,
    "feb": 2,
    "february": 2,
    "mar": 3,
    "march": 3,
    "apr": 4,
    "april": 4,
    "may": 5,
    "jun": 6,
    "june": 6,
    "jul": 7,
    "july": 7,
    "aug": 8,
    "august": 8,
    "sep": 9,
    "sept": 9,
    "september": 9,
    "oct": 10,
    "october": 10,
    "nov": 11,
    "november": 11,
    "dec": 12,
    "december": 12,
}


@dataclass
class Task:
    section: str
    section_label: str
    text: str
    days: int | None
    amount: float | None
    daily_burn: float | None
    deadline: str | None
    days_to_deadline: int | None
    score: float
    est_minutes: int


@dataclass
class BuildOutput:
    date: str
    generated_at: str
    source_name: str
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


def _skip_business_state_line(text: str, current: str | None) -> bool:
    lt = text.lower()
    if any(token in lt for token in [
        "resolved / do not resurface",
        "do not resurface unless",
        "should keep running",
        "do not re-enable",
    ]):
        return True
    if current == "in_progress" and any(token in lt for token in [
        "is the internal analytics/ops platform",
        "is resolved as of",
        "latest checked ads folder",
        "regenerated for",
        "completed cleanly",
        "new local triage artifact is live",
        "recent timeout patches",
        "delivery silenced",
        "latest valid ads snapshot remained",
        "no fresh amazon ads regression",
    ]):
        return True
    return False


def parse_business_state_tasks(text: str) -> dict[str, list[str]]:
    buckets: dict[str, list[str]] = {k: [] for k, _ in SECTION_ORDER}
    current: str | None = None
    current_h3: str | None = None
    h3_lines: list[str] = []

    section_map = {
        "## 🔴 needs ev / time-sensitive": "urgent",
        "## 🟡 customer / b2b follow-up queue": "needs_ev",
        "## 🔵 active product / growth": "in_progress",
        "## 🟣 moneysamurai / systems": "in_progress",
        "## 🟢 resolved / do not resurface without fresh evidence": None,
        "## ⚙️ agent / comms preferences": None,
    }

    def flush_h3() -> None:
        nonlocal current_h3, h3_lines
        if not current_h3 or not current:
            current_h3 = None
            h3_lines = []
            return
        detail = " ".join(line.strip() for line in h3_lines if line.strip())
        task_text = current_h3.strip()
        if detail:
            task_text = f"{task_text} — {detail}"
        if _skip_business_state_line(task_text, current):
            current_h3 = None
            h3_lines = []
            return
        target = current
        combined = f"{current_h3} {detail}".lower()
        if current == "in_progress" and "backlog" in combined:
            target = "backlog"
        buckets[target].append(task_text)
        current_h3 = None
        h3_lines = []

    for raw in text.splitlines():
        line = raw.rstrip()
        stripped = line.strip()
        normalized = _normalize_header(line)

        if normalized.startswith("## "):
            flush_h3()
            current = section_map.get(normalized)
            continue

        if stripped.startswith("### "):
            flush_h3()
            current_h3 = stripped[4:].strip()
            continue

        if current is None:
            continue

        if stripped.startswith("- "):
            bullet = stripped[2:].strip()
            if current_h3:
                h3_lines.append(bullet)
            else:
                if _skip_business_state_line(bullet, current):
                    continue
                target = current
                if current == "in_progress" and any(
                    token in bullet.lower()
                    for token in ["backlog", "bundle", "submission", "verification", "watch", "oversold"]
                ):
                    target = "backlog"
                buckets[target].append(bullet)
            continue

        if stripped and current_h3:
            h3_lines.append(stripped)

    flush_h3()
    return buckets


def parse_days(text: str) -> int | None:
    patterns = [
        r"(\d{1,3})\s*\+?\s*days?",
        r"day\s*(\d{1,3})",
        r"(?<!\d-)(\d{1,3})\s*d\b",
    ]
    lt = text.lower()
    for p in patterns:
        m = re.search(p, lt)
        if m:
            value = int(m.group(1))
            # Guard against false positives from ISO dates like 2026-04-18.
            if value >= 100 and re.search(r"20\d{2}-\d{2}-\d{2}", text):
                continue
            return value
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


def parse_deadline(text: str, now: datetime) -> date | None:
    """Extract a deadline date from a task line.

    Supports:
      - ISO: 2026-04-20
      - Month/day: Apr 14, April 14
    """

    # Allow explicit ISO date at the *start* of a line (common for reminders like
    # "2026-04-20 — Nudge ...").
    m = re.match(r"^\s*(?:\*\*)?(20\d{2}-\d{2}-\d{2})(?:\*\*)?\b", text)
    if m:
        try:
            return datetime.strptime(m.group(1), "%Y-%m-%d").date()
        except ValueError:
            return None

    lt = text.lower()

    # Only treat dates as deadlines when they are explicitly cued.
    cue_iso = re.search(r"\b(?:deadline|due|by)\b[^0-9]*(?:\*\*)?(20\d{2}-\d{2}-\d{2})(?:\*\*)?", lt)
    if cue_iso:
        try:
            return datetime.strptime(cue_iso.group(1), "%Y-%m-%d").date()
        except ValueError:
            return None

    cue_slash = re.search(r"\b(?:deadline|due|by)\b[^0-9]*(?:\*\*)?(\d{1,2})/(\d{1,2})(?:\*\*)?", lt)
    if cue_slash:
        try:
            return date(now.year, int(cue_slash.group(1)), int(cue_slash.group(2)))
        except ValueError:
            return None

    cue_month = re.search(
        r"\b(?:deadline|due|by)\b[^a-zA-Z]*(?:\*\*)?(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:\*\*)?",
        lt,
    )
    if not cue_month:
        return None

    month = MONTHS.get(cue_month.group(1))
    if not month:
        return None
    day = int(cue_month.group(2))

    try:
        d = date(now.year, month, day)
    except ValueError:
        return None

    # If this looks "in the past" by >30d, assume next year.
    if (d - now.date()).days < -30:
        try:
            return date(now.year + 1, month, day)
        except ValueError:
            return d
    return d


def deadline_bonus(deadline: date | None, now: datetime) -> tuple[float, int | None]:
    if deadline is None:
        return 0.0, None
    days_left = (deadline - now.date()).days
    if days_left <= 0:
        return 20.0, days_left
    if days_left == 1:
        return 16.0, days_left
    if days_left == 2:
        return 12.0, days_left
    if days_left <= 7:
        return 8.0, days_left
    return 4.0, days_left


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
    if any(token in lt for token in [
        "data ready",
        "reportedly ready",
        "sales data",
        "run rate",
        "revenue",
        "spend",
        "budget",
        "roas",
        "acos",
        "target price",
        "price:",
    ]):
        return None
    return amount


def score_task(
    section: str,
    text: str,
    days: int | None,
    amount: float | None,
    daily_burn: float | None,
    deadline: date | None,
    now: datetime,
) -> float:
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

    bump, _ = deadline_bonus(deadline, now)
    s += bump
    return round(s, 2)


def get_recent_memory_context(limit_files: int = 3, prioritize_dates: list[str] | None = None) -> list[str]:
    if not MEMORY_DIR.exists():
        return []

    all_files = sorted(
        [p for p in MEMORY_DIR.glob("20*.md") if p.name != "error-log.md"],
        key=lambda p: p.name,
        reverse=True,
    )

    picked: list[Path] = []
    seen: set[str] = set()

    for d in prioritize_dates or []:
        path = MEMORY_DIR / f"{d}.md"
        if path.exists() and path.name not in seen:
            picked.append(path)
            seen.add(path.name)

    for path in all_files:
        if path.name in seen:
            continue
        picked.append(path)
        seen.add(path.name)
        if len(picked) >= limit_files:
            break

    context: list[str] = []
    high_signal_tokens = [
        "risk", "overdue", "follow up", "needs", "deadline", "outstanding", "urgent",
        "blocked", "waiting", "pending", "failed", "billing", "access",
    ]

    for path in picked[:limit_files]:
        lines = path.read_text(encoding="utf-8").splitlines()
        for line in lines:
            l = line.strip()
            if not l.startswith("-"):
                continue
            if any(k in l.lower() for k in high_signal_tokens):
                context.append(f"{path.name}: {l[1:].strip()}")
                if len(context) >= 10:
                    return context
    return context[:10]


def derive_focus_sets(tasks: list[Task]) -> dict[str, list[Task]]:
    def match(task: Task, *tokens: str) -> bool:
        lt = task.text.lower()
        return any(token in lt for token in tokens)

    blockers = [
        t for t in tasks
        if match(t, "blocked", "logged out", "login", "access", "confirm", "needs ev", "waiting")
    ]
    customer_risk = [
        t for t in tasks
        if match(t, "customer", "reply", "a-to-z", "refund", "order", "unshipped", "return")
    ]
    deadlines = [t for t in tasks if t.deadline is not None or (t.days_to_deadline is not None and t.days_to_deadline <= 0)]
    burn = [t for t in tasks if (t.daily_burn or 0) > 0]

    return {
        "blockers": blockers[:8],
        "customer_risk": customer_risk[:8],
        "deadlines": sorted(deadlines, key=lambda t: (t.days_to_deadline is None, t.days_to_deadline or 999))[:8],
        "burn": burn[:8],
    }


def build_tasks(buckets: dict[str, list[str]]) -> list[Task]:
    label_map = dict(SECTION_ORDER)
    tasks: list[Task] = []
    now = datetime.now().astimezone()
    for section, items in buckets.items():
        for text in items:
            days = parse_days(text)
            amount = actionable_amount(text, parse_amount(text))
            burn = parse_daily_burn(text)
            dl = parse_deadline(text, now)
            _, days_left = deadline_bonus(dl, now)
            tasks.append(
                Task(
                    section=section,
                    section_label=label_map[section],
                    text=text,
                    days=days,
                    amount=amount,
                    daily_burn=burn,
                    deadline=dl.isoformat() if dl else None,
                    days_to_deadline=days_left,
                    score=score_task(section, text, days, amount, burn, dl, now),
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
    lines.append(f"Source: `{report.source_name}` + recent `memory/*.md`")
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
        if t.deadline is not None:
            if t.days_to_deadline is not None and t.days_to_deadline <= 0:
                extras.append(f"deadline {t.deadline} (OVERDUE)")
            elif t.days_to_deadline is not None:
                extras.append(f"deadline {t.deadline} (D-{t.days_to_deadline})")
            else:
                extras.append(f"deadline {t.deadline}")
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
            f"<td>{escape(t.deadline) if t.deadline else '—'}</td>"
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
  <div class=\"sub\">{escape(report.generated_at)} · Ranked from active business state + recent memory context</div>

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
      <thead><tr><th>#</th><th>Section</th><th>Task</th><th>Days</th><th>Amount</th><th>Burn/day</th><th>Deadline</th><th>ETA</th><th>Score</th></tr></thead>
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


def render_ops_hub_html(report: BuildOutput) -> str:
    """Single-file interactive hub with embedded data.

    This avoids `fetch()` so it works when opened directly from disk (file://).
    """

    focus = derive_focus_sets(report.all_tasks_ranked)
    data_json = json.dumps(
        {
            "date": report.date,
            "generated_at": report.generated_at,
            "total_open": report.total_open,
            "section_counts": report.section_counts,
            "top_actions": [asdict(t) for t in report.top_actions],
            "all_tasks_ranked": [asdict(t) for t in report.all_tasks_ranked],
            "memory_context": report.memory_context,
            "quick_math": report.quick_math,
            "focus": {k: [asdict(t) for t in v] for k, v in focus.items()},
        },
        ensure_ascii=False,
    )

    links = [
        ("Business State", "../BUSINESS_STATE.md"),
        ("Retired KANBAN", "../KANBAN.md"),
        ("Priority Pack (latest)", "./morning-priority-pack-latest.md"),
        ("Execution Board (latest)", "./morning-execution-board-latest.html"),
        ("Execution Board JSON (latest)", "./morning-execution-board-latest.json"),
        ("Morning Handoff (latest)", "./morning-handoff-latest.html"),
        ("Morning Decision Desk (latest)", "./morning-decision-desk-latest.html"),
        ("Ads Pull Incident (latest)", "./ads-pull-incident-latest.html"),
        ("Ops Debt Dashboard (latest)", "./ops-debt-dashboard-latest.html"),
    ]
    cron_watchlist_href = latest_report_href("cron-watchlist-*.html")
    if cron_watchlist_href:
        links.append(("Cron Watchlist (latest dated)", cron_watchlist_href))
    cron_trend_href = latest_report_href("cron-trend-report-*.html")
    if cron_trend_href:
        links.append(("Cron Trend Report (latest dated)", cron_trend_href))
    cron_timeout_href = latest_report_href("cron-timeout-dashboard-*.html")
    if cron_timeout_href:
        links.append(("Cron Timeout Dashboard (latest dated)", cron_timeout_href))
    links.append(("Reports folder", "./"))
    links_html = "".join(
        f"<a class='link' href='{escape(href)}' target='_blank' rel='noreferrer'>{escape(label)}</a>"
        for label, href in links
    )

    html = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Morning Ops Hub — __DATE__</title>
  <style>
    :root {--bg:#0A1628;--surface:#111B2E;--surface2:#0F1A2C;--accent:#3B82F6;--text:#fff;--muted:#94A3B8;--border:#1E293B;--good:#22c55e;--bad:#ef4444;}
    *{box-sizing:border-box} body{margin:0;padding:24px;background:var(--bg);color:var(--text);font-family:Inter,-apple-system,sans-serif}
    h1{margin:0 0 6px} .sub{color:var(--muted);margin-bottom:12px;display:flex;flex-wrap:wrap;gap:8px;align-items:center}
    .wrap{max-width:1200px;margin:0 auto}
    .links{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0 18px}
    a.link{color:#93C5FD;text-decoration:none;background:#102446;border:1px solid var(--border);padding:6px 10px;border-radius:10px;font-size:13px}
    a.link:hover{border-color:#2b3a52}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin:14px 0 18px}
    .card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:12px}
    .k{color:var(--muted);font-size:12px} .v{font-size:26px;font-weight:750;margin-top:4px}
    .panel{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px;margin-top:12px}
    .two{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    @media (max-width: 900px){.two{grid-template-columns:1fr}}
    .row{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
    .pill{display:inline-flex;gap:8px;align-items:center;background:var(--surface2);border:1px solid var(--border);border-radius:999px;padding:6px 10px;font-size:13px;color:var(--muted)}
    .pill input{accent-color:var(--accent)}
    input[type="text"]{background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:10px;padding:8px 10px;min-width:260px}
    button{background:var(--accent);border:none;color:white;border-radius:10px;padding:8px 10px;font-weight:650;cursor:pointer}
    button.secondary{background:transparent;border:1px solid var(--border);color:var(--text)}
    table{width:100%;border-collapse:collapse;font-size:13px}
    th,td{padding:8px;border-bottom:1px solid var(--border);text-align:left;vertical-align:top}
    th{color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.06em}
    .muted{color:var(--muted)}
    .badge{display:inline-block;border:1px solid var(--border);border-radius:999px;padding:2px 8px;font-size:12px;color:var(--muted)}
    .task{white-space:pre-wrap}
    .ok{color:var(--good)} .warn{color:var(--bad)}
    ul{margin:8px 0 0 18px} li{margin:6px 0;color:var(--muted)}
    code{font-family:"JetBrains Mono",ui-monospace,Menlo,monospace;font-size:12px;color:#93C5FD}
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Morning Ops Hub</h1>
    <div class="sub">
      <span class="badge">__DATE__</span>
      <span class="muted">Generated: __GENERATED_AT__</span>
      <span class="muted">·</span>
      <span class="muted">Local file friendly (no fetch)</span>
    </div>

    <div class="links">__LINKS__</div>

    <div id="cards" class="grid"></div>

    <div class="panel">
      <div class="row" style="justify-content:space-between">
        <div>
          <div style="font-weight:750;margin-bottom:4px">Top 8 (copy/paste checklist)</div>
          <div class="muted">This is what you do first. If you only do 4: do the first 4.</div>
        </div>
        <div class="row">
          <button id="copyTop">Copy top 8</button>
          <button id="copyBlock" class="secondary">Copy 90-min block</button>
        </div>
      </div>
      <ul id="topList"></ul>
    </div>

    <div class="two">
      <div class="panel">
        <div class="row" style="justify-content:space-between">
          <div>
            <div style="font-weight:750;margin-bottom:4px">Unblockers first</div>
            <div class="muted">Tasks blocked on access, login, confirmation, or Ev decisions.</div>
          </div>
          <button id="copyBlockers" class="secondary">Copy unblockers</button>
        </div>
        <ul id="blockerList"></ul>
      </div>

      <div class="panel">
        <div class="row" style="justify-content:space-between">
          <div>
            <div style="font-weight:750;margin-bottom:4px">Customer risk queue</div>
            <div class="muted">Anything likely to turn into churn, claims, or angry follow-up.</div>
          </div>
          <button id="copyCustomer" class="secondary">Copy customer risk</button>
        </div>
        <ul id="customerList"></ul>
      </div>
    </div>

    <div class="two">
      <div class="panel">
        <div style="font-weight:750;margin-bottom:4px">Deadline / overdue view</div>
        <div class="muted">Use this to avoid missing date-driven landmines.</div>
        <ul id="deadlineList"></ul>
      </div>

      <div class="panel">
        <div style="font-weight:750;margin-bottom:4px">True burn queue</div>
        <div class="muted">Only tasks with explicit daily bleed/loss signals.</div>
        <ul id="burnList"></ul>
      </div>
    </div>

    <div class="panel">
      <div class="row" style="justify-content:space-between;gap:14px">
        <div class="row">
          <span class="pill"><input id="fUrgent" type="checkbox" checked /> 🔴 Urgent</span>
          <span class="pill"><input id="fNeeds" type="checkbox" checked /> 🟡 Needs Ev</span>
          <span class="pill"><input id="fInProg" type="checkbox" checked /> 🔵 In Progress</span>
          <span class="pill"><input id="fBacklog" type="checkbox" /> 📋 Backlog</span>
          <span class="pill"><input id="fBurn" type="checkbox" /> Burn/day only</span>
        </div>
        <div class="row">
          <input id="search" type="text" placeholder="Search tasks (e.g. heather, refund, shipbob, sds)" />
        </div>
      </div>
      <div style="height:10px"></div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Section</th>
            <th>Task</th>
            <th>Days</th>
            <th>Amount</th>
            <th>Burn/day</th>
            <th>Deadline</th>
            <th>ETA</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody id="rows"></tbody>
      </table>
    </div>

    <div class="panel">
      <div style="font-weight:750;margin-bottom:6px">Recent memory context</div>
      <ul id="ctx"></ul>
    </div>

    <div class="panel">
      <div class="muted">Pro tip: to refresh the full morning stack, run:</div>
      <div><code>python3 scripts/ops_build.py --date YYYY-MM-DD</code></div>
    </div>
  </div>

  <script>
    const DATA = __DATA_JSON__;
    const clean = (s) => (s || '').replaceAll('**', '');
    const fmtMoney = (v) => {
      if (v === null || v === undefined) return '—';
      const rounded = Math.abs(v - Math.round(v)) < 0.0001;
      return rounded ? `$${Math.round(v).toLocaleString()}` : `$${v.toFixed(2)}`;
    };

    function renderCards() {
      const counts = DATA.section_counts || {};
      const cards = [
        { k: '🔴 Urgent', v: counts.urgent ?? 0 },
        { k: '🟡 Needs Ev', v: counts.needs_ev ?? 0 },
        { k: '🔵 In Progress', v: counts.in_progress ?? 0 },
        { k: '📋 Backlog', v: counts.backlog ?? 0 },
        { k: 'Total Open', v: DATA.total_open ?? 0 },
        { k: 'One-time $ at stake', v: fmtMoney(DATA.quick_math?.one_time_total ?? null) },
        { k: 'Daily burn', v: `$${Math.round(DATA.quick_math?.daily_burn_total ?? 0)}/d` },
      ];
      document.getElementById('cards').innerHTML = cards
        .map(c => `<div class="card"><div class="k">${c.k}</div><div class="v">${c.v}</div></div>`)
        .join('');
    }

    function renderTop() {
      const top = (DATA.top_actions || []).slice(0, 8);
      document.getElementById('topList').innerHTML = top
        .map(t => `<li><b>${t.est_minutes}m</b> — ${clean(t.text)}</li>`)
        .join('') || '<li class="muted">No tasks found.</li>';
    }

    function sectionEnabled(t) {
      const s = t.section;
      const urgent = document.getElementById('fUrgent').checked;
      const needs = document.getElementById('fNeeds').checked;
      const inprog = document.getElementById('fInProg').checked;
      const backlog = document.getElementById('fBacklog').checked;
      if (s === 'urgent') return urgent;
      if (s === 'needs_ev') return needs;
      if (s === 'in_progress') return inprog;
      if (s === 'backlog') return backlog;
      return true;
    }

    function renderRows() {
      const burnOnly = document.getElementById('fBurn').checked;
      const q = (document.getElementById('search').value || '').trim().toLowerCase();
      const tasks = (DATA.all_tasks_ranked || []).filter(t => {
        if (!sectionEnabled(t)) return false;
        if (burnOnly && !(t.daily_burn && t.daily_burn > 0)) return false;
        if (q && !clean(t.text).toLowerCase().includes(q)) return false;
        return true;
      });
      document.getElementById('rows').innerHTML = tasks
        .slice(0, 60)
        .map((t, idx) => {
          const burn = (t.daily_burn && t.daily_burn > 0) ? `<span class="warn">${fmtMoney(t.daily_burn)}</span>` : '—';
          const dl = t.deadline
            ? (t.days_to_deadline !== null && t.days_to_deadline !== undefined
              ? (t.days_to_deadline <= 0 ? `${t.deadline} (OVERDUE)` : `${t.deadline} (D-${t.days_to_deadline})`)
              : t.deadline)
            : '—';
          return `
            <tr>
              <td>${idx + 1}</td>
              <td>${clean(t.section_label)}</td>
              <td class="task">${clean(t.text)}</td>
              <td>${t.days ?? '—'}</td>
              <td>${fmtMoney(t.amount)}</td>
              <td>${burn}</td>
              <td>${dl}</td>
              <td>${t.est_minutes}m</td>
              <td>${t.score}</td>
            </tr>
          `;
        }).join('') || `<tr><td colspan="9" class="muted">No tasks matched the filter.</td></tr>`;
    }

    function renderContext() {
      const ctx = DATA.memory_context || [];
      document.getElementById('ctx').innerHTML = ctx.map(c => `<li>${c}</li>`).join('') || '<li class="muted">No memory context found.</li>';
    }

    function renderFocusLists() {
      const focus = DATA.focus || {};
      const paint = (id, items, formatter) => {
        document.getElementById(id).innerHTML = (items || []).map(formatter).join('') || '<li class="muted">Nothing surfaced.</li>';
      };
      paint('blockerList', focus.blockers, (t) => `<li>${clean(t.text)}</li>`);
      paint('customerList', focus.customer_risk, (t) => `<li>${clean(t.text)}</li>`);
      paint('deadlineList', focus.deadlines, (t) => {
        const dl = t.deadline
          ? (t.days_to_deadline !== null && t.days_to_deadline !== undefined
            ? (t.days_to_deadline <= 0 ? `${t.deadline} (OVERDUE)` : `${t.deadline} (D-${t.days_to_deadline})`)
            : t.deadline)
          : 'No explicit date';
        return `<li><b>${dl}</b> — ${clean(t.text)}</li>`;
      });
      paint('burnList', focus.burn, (t) => `<li><b>${fmtMoney(t.daily_burn)}/day</b> — ${clean(t.text)}</li>`);
    }

    function copyText(text) {
      navigator.clipboard.writeText(text).catch(() => {
        // fallback: prompt
        window.prompt('Copy this text:', text);
      });
    }

    function wireCopyButtons() {
      document.getElementById('copyTop').addEventListener('click', () => {
        const top = (DATA.top_actions || []).slice(0, 8);
        const lines = [
          `Morning Ops — ${DATA.date} (${DATA.generated_at})`,
          '',
          ...top.map((t, i) => `- [ ] ${i+1}. ${clean(t.text)} (${t.est_minutes}m)`),
          ''
        ];
        copyText(lines.join('\n'));
      });
      document.getElementById('copyBlock').addEventListener('click', () => {
        const block = (DATA.top_actions || []).slice(0, 4);
        const lines = [
          `90-min block — ${DATA.date}`,
          '',
          ...block.map(t => `- [ ] ${clean(t.text)} (${t.est_minutes}m)`),
          ''
        ];
        copyText(lines.join('\n'));
      });
      document.getElementById('copyBlockers').addEventListener('click', () => {
        const items = (DATA.focus?.blockers || []).slice(0, 8);
        copyText([`Unblockers — ${DATA.date}`, '', ...items.map(t => `- [ ] ${clean(t.text)}`), ''].join('\n'));
      });
      document.getElementById('copyCustomer').addEventListener('click', () => {
        const items = (DATA.focus?.customer_risk || []).slice(0, 8);
        copyText([`Customer risk — ${DATA.date}`, '', ...items.map(t => `- [ ] ${clean(t.text)}`), ''].join('\n'));
      });
    }

    function wireFilters() {
      for (const id of ['fUrgent','fNeeds','fInProg','fBacklog','fBurn']) {
        document.getElementById(id).addEventListener('change', renderRows);
      }
      document.getElementById('search').addEventListener('input', () => {
        // small debounce
        clearTimeout(window.__t);
        window.__t = setTimeout(renderRows, 80);
      });
    }

    renderCards();
    renderTop();
    renderContext();
    renderFocusLists();
    renderRows();
    wireCopyButtons();
    wireFilters();
  </script>
</body>
</html>
"""

    return (
        html.replace("__DATE__", escape(report.date))
        .replace("__GENERATED_AT__", escape(report.generated_at))
        .replace("__LINKS__", links_html)
        .replace("__DATA_JSON__", data_json)
    )


def clone_latest(versioned: Path, latest: Path) -> None:
    shutil.copyfile(versioned, latest)


def main(argv: Iterable[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Generate morning execution board from the active business state")
    parser.add_argument("--date", help="Output date (YYYY-MM-DD). Defaults to local today.")
    args = parser.parse_args(list(argv) if argv is not None else None)

    source_name = "BUSINESS_STATE.md"
    if BUSINESS_STATE.exists():
        buckets = parse_business_state_tasks(BUSINESS_STATE.read_text(encoding="utf-8"))
    elif KANBAN.exists():
        source_name = "KANBAN.md"
        buckets = parse_kanban_tasks(KANBAN.read_text(encoding="utf-8"))
    else:
        raise SystemExit(f"Missing active source files: {BUSINESS_STATE} and {KANBAN}")

    now = datetime.now().astimezone()
    date_str = args.date or now.strftime("%Y-%m-%d")
    generated_at = now.strftime("%Y-%m-%d %H:%M %Z")
    tasks = build_tasks(buckets)

    section_counts = {k: len(v) for k, v in buckets.items()}
    one_time_total = sum(t.amount or 0.0 for t in tasks)
    daily_burn_total = sum(t.daily_burn or 0.0 for t in tasks)

    priority_dates = [date_str]
    try:
        current_d = datetime.strptime(date_str, "%Y-%m-%d").date()
        priority_dates.append(current_d.fromordinal(current_d.toordinal() - 1).isoformat())
    except ValueError:
        pass

    report = BuildOutput(
        date=date_str,
        generated_at=generated_at,
        source_name=source_name,
        total_open=len(tasks),
        section_counts=section_counts,
        top_actions=tasks[:8],
        all_tasks_ranked=tasks,
        memory_context=get_recent_memory_context(limit_files=4, prioritize_dates=priority_dates),
        quick_math={
            "one_time_total": round(one_time_total, 2),
            "daily_burn_total": round(daily_burn_total, 2),
        },
    )

    REPORTS.mkdir(parents=True, exist_ok=True)
    md_path = REPORTS / f"morning-priority-pack-{date_str}.md"
    html_path = REPORTS / f"morning-execution-board-{date_str}.html"
    json_path = REPORTS / f"morning-execution-board-{date_str}.json"
    hub_path = REPORTS / f"morning-ops-hub-{date_str}.html"

    md_path.write_text(render_markdown(report), encoding="utf-8")
    html_path.write_text(render_html(report), encoding="utf-8")
    hub_path.write_text(render_ops_hub_html(report), encoding="utf-8")
    json_path.write_text(json.dumps(
        {
            "date": report.date,
            "generated_at": report.generated_at,
            "source_name": report.source_name,
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
    clone_latest(hub_path, REPORTS / "morning-ops-hub-latest.html")

    # concise terminal summary
    print(f"Built {md_path.relative_to(ROOT)}")
    print(f"Built {html_path.relative_to(ROOT)}")
    print(f"Built {hub_path.relative_to(ROOT)}")
    print(f"Built {json_path.relative_to(ROOT)}")
    print(f"Top action: {report.top_actions[0].text if report.top_actions else 'none'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
