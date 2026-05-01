#!/usr/bin/env python3
"""build_state_audit_report.py

Audit active BUSINESS_STATE.md items for stale wording, old date refs, weak sourcing,
and other maintenance smells that make the morning ops stack less trustworthy.

Outputs:
- reports/state-audit-YYYY-MM-DD.md
- reports/state-audit-YYYY-MM-DD.html
- reports/state-audit-YYYY-MM-DD.json
- reports/state-audit-latest.md
- reports/state-audit-latest.html
- reports/state-audit-latest.json
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
from collections import defaultdict
from dataclasses import asdict, dataclass
from datetime import date, datetime
from html import escape
from pathlib import Path
from typing import Any

from kanban_morning_builder import BUSINESS_STATE, REPORTS, parse_business_state_tasks

ROOT = Path(__file__).resolve().parents[1]

RELATIVE_TOKENS = [
    "first thing",
    "tomorrow",
    "today",
    "this morning",
    "tonight",
    "eod",
    "midday",
    "morning",
]

MONTH_PATTERN = r"(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)"
DATE_PATTERNS = [
    re.compile(rf"\b(?:ETA|expires?|expired|expiring|first thing|by|due|next|on|through)\b[^\n]{{0,40}}?(20\d{{2}}-\d{{2}}-\d{{2}})", re.IGNORECASE),
    re.compile(rf"\b(?:ETA|expires?|expired|expiring|first thing|by|due|next|on|through)\b[^\n]{{0,40}}?({MONTH_PATTERN}\s+\d{{1,2}})\b", re.IGNORECASE),
]
SOURCE_ID_RE = re.compile(r"msgs?\s*\*\*(\d+)\*\*|msgs?\s*(\d+)", re.IGNORECASE)


@dataclass
class Finding:
    severity: str
    kind: str
    section: str
    task: str
    note: str
    refs: list[str]


@dataclass
class Summary:
    target_date: str
    generated_at: str
    total_active_items: int
    stale_date_refs: int
    stale_relative_refs: int
    urgent_without_source: int
    duplicate_source_ids: int
    total_findings: int


def _clone_latest(versioned: Path, latest: Path) -> None:
    shutil.copyfile(versioned, latest)


def _parse_month_day(value: str, year: int) -> date | None:
    for fmt in ("%b %d", "%B %d"):
        try:
            parsed = datetime.strptime(value, fmt)
            return date(year, parsed.month, parsed.day)
        except ValueError:
            continue
    return None


def extract_stale_date_refs(task: str, now_date: date) -> list[str]:
    refs: list[str] = []
    for pattern in DATE_PATTERNS:
        for match in pattern.finditer(task):
            raw = match.group(1)
            parsed: date | None = None
            if re.fullmatch(r"20\d{2}-\d{2}-\d{2}", raw):
                try:
                    parsed = datetime.strptime(raw, "%Y-%m-%d").date()
                except ValueError:
                    parsed = None
            else:
                parsed = _parse_month_day(raw, now_date.year)
                if parsed and (parsed - now_date).days < -180:
                    parsed = date(now_date.year + 1, parsed.month, parsed.day)
            if parsed and parsed < now_date:
                refs.append(raw)
    return refs


def extract_relative_tokens(task: str) -> list[str]:
    lt = task.lower()
    hits: list[str] = []
    for token in RELATIVE_TOKENS:
        if token in lt:
            hits.append(token)
    return hits


def has_source(task: str) -> bool:
    lt = task.lower()
    return any(token in lt for token in ["source:", "sources:", "msg ", "msgs ", "msg**", "`sales`", "`gluemasters`"])


def source_ids(task: str) -> list[str]:
    ids: list[str] = []
    for match in SOURCE_ID_RE.finditer(task):
        ids.append(match.group(1) or match.group(2))
    return ids


def build_payload(target_date: str, generated_at: str) -> dict[str, Any]:
    if not BUSINESS_STATE.exists():
        raise SystemExit(f"Missing {BUSINESS_STATE}")

    buckets = parse_business_state_tasks(BUSINESS_STATE.read_text(encoding="utf-8"))
    task_rows: list[tuple[str, str]] = []
    for section, items in buckets.items():
        for task in items:
            task_rows.append((section, task))

    now_date = datetime.strptime(target_date, "%Y-%m-%d").date()
    findings: list[Finding] = []
    source_map: dict[str, list[tuple[str, str]]] = defaultdict(list)

    for section, task in task_rows:
        stale_dates = extract_stale_date_refs(task, now_date)
        if stale_dates:
            findings.append(Finding(
                severity="high",
                kind="stale_date_ref",
                section=section,
                task=task,
                note="Active task still contains a past-dated reference; verify whether it should be rewritten, resolved, or escalated.",
                refs=stale_dates,
            ))

        relative_hits = extract_relative_tokens(task)
        if relative_hits:
            findings.append(Finding(
                severity="medium",
                kind="stale_relative_ref",
                section=section,
                task=task,
                note="Active task uses relative timing language that will go stale in durable state.",
                refs=relative_hits,
            ))

        if section == "urgent" and not has_source(task):
            findings.append(Finding(
                severity="medium",
                kind="urgent_without_source",
                section=section,
                task=task,
                note="Urgent item lacks explicit source evidence/message reference.",
                refs=[],
            ))

        for msg_id in source_ids(task):
            source_map[msg_id].append((section, task))

    duplicate_findings: list[Finding] = []
    for msg_id, rows in sorted(source_map.items()):
        unique_tasks = {task for _, task in rows}
        if len(unique_tasks) < 2:
            continue
        joined = [f"{section}: {task}" for section, task in rows[:4]]
        duplicate_findings.append(Finding(
            severity="low",
            kind="duplicate_source_id",
            section="multiple",
            task=joined[0],
            note="Same source message ID appears in multiple active items; double-check for accidental duplicate tracking.",
            refs=[msg_id],
        ))
    findings.extend(duplicate_findings)

    findings_sorted = sorted(
        findings,
        key=lambda f: ({"high": 0, "medium": 1, "low": 2}.get(f.severity, 3), f.kind, f.section, f.task.lower()),
    )

    payload = {
        "summary": asdict(Summary(
            target_date=target_date,
            generated_at=generated_at,
            total_active_items=len(task_rows),
            stale_date_refs=sum(1 for f in findings if f.kind == "stale_date_ref"),
            stale_relative_refs=sum(1 for f in findings if f.kind == "stale_relative_ref"),
            urgent_without_source=sum(1 for f in findings if f.kind == "urgent_without_source"),
            duplicate_source_ids=sum(1 for f in findings if f.kind == "duplicate_source_id"),
            total_findings=len(findings),
        )),
        "findings": [asdict(f) for f in findings_sorted],
        "sample_tasks": [
            {"section": section, "task": task}
            for section, task in task_rows[:12]
        ],
    }
    return payload


def render_markdown(payload: dict[str, Any]) -> str:
    s = payload["summary"]
    lines = [
        f"# Business State Audit — {s['target_date']}",
        "",
        f"Generated: {s['generated_at']}",
        "",
        "## Snapshot",
        f"- Active items scanned: **{s['total_active_items']}**",
        f"- Past-date references in active items: **{s['stale_date_refs']}**",
        f"- Relative time phrases to clean up: **{s['stale_relative_refs']}**",
        f"- Urgent items missing source evidence: **{s['urgent_without_source']}**",
        f"- Possible duplicate source IDs: **{s['duplicate_source_ids']}**",
        f"- Total findings: **{s['total_findings']}**",
        "",
        "## Findings",
    ]
    if not payload["findings"]:
        lines.append("- No issues surfaced. Active state looks clean.")
    for item in payload["findings"]:
        refs = f" Refs: {', '.join(item['refs'])}." if item["refs"] else ""
        lines.append(
            f"- **{item['severity'].upper()} · {item['kind']} · {item['section']}** — {item['note']}{refs}"
        )
        lines.append(f"  - {item['task']}")
    lines.append("")
    return "\n".join(lines)


def render_html(payload: dict[str, Any]) -> str:
    s = payload["summary"]
    rows = []
    for item in payload["findings"]:
        rows.append(
            "<tr>"
            f"<td><span class='badge {escape(item['severity'])}'>{escape(item['severity'].upper())}</span></td>"
            f"<td>{escape(item['kind'])}</td>"
            f"<td>{escape(item['section'])}</td>"
            f"<td>{escape(item['note'])}</td>"
            f"<td>{escape(', '.join(item['refs']) or '—')}</td>"
            f"<td>{escape(item['task'])}</td>"
            "</tr>"
        )
    return f"""<!doctype html>
<html lang=\"en\">
<head>
<meta charset=\"utf-8\" />
<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
<title>Business State Audit — {escape(s['target_date'])}</title>
<style>
:root {{--bg:#0A1628;--surface:#111B2E;--border:#1E293B;--text:#fff;--muted:#94A3B8;--good:#22c55e;--warn:#f59e0b;--bad:#ef4444;}}
*{{box-sizing:border-box}} body{{margin:0;padding:24px;background:var(--bg);color:var(--text);font-family:Inter,-apple-system,sans-serif}}
.wrap{{max-width:1280px;margin:0 auto}} .grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}}
.card,.panel{{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px}}
.k{{color:var(--muted);font-size:12px}} .v{{font-size:26px;font-weight:750;margin-top:4px}} .muted{{color:var(--muted)}}
table{{width:100%;border-collapse:collapse;font-size:13px}} th,td{{padding:8px;border-bottom:1px solid var(--border);text-align:left;vertical-align:top}} th{{color:var(--muted);font-size:11px;text-transform:uppercase}}
.badge{{display:inline-block;border-radius:999px;padding:3px 9px;font-size:12px;font-weight:700}} .badge.high{{background:#3d1616;color:#fca5a5}} .badge.medium{{background:#3b2a10;color:#fcd34d}} .badge.low{{background:#102446;color:#93C5FD}}
a{{color:#93C5FD;text-decoration:none}}
</style>
</head>
<body>
<div class=\"wrap\">
  <h1>Business State Audit</h1>
  <div class=\"muted\">{escape(s['generated_at'])} · maintenance/trust check for active BUSINESS_STATE.md</div>
  <p><a href=\"./morning-ops-hub-latest.html\">Open morning ops hub</a></p>
  <div class=\"grid\">
    <div class=\"card\"><div class=\"k\">Active items scanned</div><div class=\"v\">{s['total_active_items']}</div></div>
    <div class=\"card\"><div class=\"k\">Past-date refs</div><div class=\"v\">{s['stale_date_refs']}</div></div>
    <div class=\"card\"><div class=\"k\">Relative-time refs</div><div class=\"v\">{s['stale_relative_refs']}</div></div>
    <div class=\"card\"><div class=\"k\">Urgent without source</div><div class=\"v\">{s['urgent_without_source']}</div></div>
    <div class=\"card\"><div class=\"k\">Duplicate source IDs</div><div class=\"v\">{s['duplicate_source_ids']}</div></div>
  </div>
  <div class=\"panel\" style=\"margin-top:12px\">
    <table>
      <thead><tr><th>Severity</th><th>Kind</th><th>Section</th><th>Note</th><th>Refs</th><th>Task</th></tr></thead>
      <tbody>{''.join(rows) or '<tr><td colspan="6" class="muted">No issues surfaced. Active state looks clean.</td></tr>'}</tbody>
    </table>
  </div>
</div>
</body>
</html>
"""


def main() -> int:
    parser = argparse.ArgumentParser(description="Build BUSINESS_STATE audit report")
    parser.add_argument("--date", help="Output date YYYY-MM-DD")
    args = parser.parse_args()

    now = datetime.now().astimezone()
    date_str = args.date or now.strftime("%Y-%m-%d")
    generated_at = now.strftime("%Y-%m-%d %H:%M %Z")
    payload = build_payload(date_str, generated_at)

    REPORTS.mkdir(parents=True, exist_ok=True)
    md_path = REPORTS / f"state-audit-{date_str}.md"
    html_path = REPORTS / f"state-audit-{date_str}.html"
    json_path = REPORTS / f"state-audit-{date_str}.json"

    md_path.write_text(render_markdown(payload), encoding="utf-8")
    html_path.write_text(render_html(payload), encoding="utf-8")
    json_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    _clone_latest(md_path, REPORTS / "state-audit-latest.md")
    _clone_latest(html_path, REPORTS / "state-audit-latest.html")
    _clone_latest(json_path, REPORTS / "state-audit-latest.json")

    print(f"Built {md_path.relative_to(ROOT)}")
    print(f"Built {html_path.relative_to(ROOT)}")
    print(f"Built {json_path.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
