#!/usr/bin/env python3
"""build_morning_exception_desk.py

Build a morning trust/exception desk highlighting active-state items that are
most likely to mislead the morning review: stale dates, ambiguous multi-amount
money lines, passive items still living in urgent, and urgent items missing
source evidence.

Outputs:
- reports/morning-exception-desk-YYYY-MM-DD.{md,html,json}
- reports/morning-exception-desk-latest.{md,html,json}
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
from kanban_morning_builder import BUSINESS_STATE, REPORTS, parse_amount, parse_business_state_tasks

ROOT = Path(__file__).resolve().parents[1]
PASSIVE_TOKENS = [
    "passive monitoring",
    "wait for",
    "not urgent",
    "review only if",
    "recommendations only",
    "keep it low priority",
]


@dataclass
class Finding:
    kind: str
    severity: str
    section: str
    task: str
    note: str
    refs: list[str]
    current_amount: float | None = None
    recommended_amount: float | None = None


def _clone_latest(versioned: Path, latest: Path) -> None:
    shutil.copyfile(versioned, latest)


def _fmt_money(v: float | None) -> str:
    if v is None:
        return "—"
    return f"${v:,.2f}"


def _extract_amounts(text: str) -> list[float]:
    out: list[float] = []
    for m in re.finditer(r"\$(\d{1,3}(?:,\d{3})*(?:\.\d+)?)", text):
        out.append(float(m.group(1).replace(",", "")))
    return out


def build_payload(target_date: str, generated_at: str) -> dict[str, Any]:
    tasks = parse_business_state_tasks(BUSINESS_STATE.read_text(encoding="utf-8"))
    now_date = datetime.strptime(target_date, "%Y-%m-%d").date()
    findings: list[Finding] = []

    for section, items in tasks.items():
        for task in items:
            lt = task.lower()
            stale_refs = extract_stale_date_refs(task, now_date)
            if stale_refs:
                findings.append(Finding(
                    kind="stale_date",
                    severity="high",
                    section=section,
                    task=task,
                    note="Past-dated reference is still active and may need confirmation, rewrite, or cleanup.",
                    refs=stale_refs,
                ))

            if section == "urgent" and not has_source(task):
                findings.append(Finding(
                    kind="missing_source",
                    severity="medium",
                    section=section,
                    task=task,
                    note="Urgent item lacks explicit source evidence/message reference.",
                    refs=[],
                ))

            if section == "urgent" and any(token in lt for token in PASSIVE_TOKENS):
                findings.append(Finding(
                    kind="passive_urgent",
                    severity="medium",
                    section=section,
                    task=task,
                    note="Passive/watch-only language is still living in the urgent lane.",
                    refs=[],
                ))

            amounts = _extract_amounts(task)
            if len(amounts) >= 2:
                current_amount = parse_amount(task)
                recommended_amount = None
                note = "Multiple dollar amounts are present; morning money views may need a clearer canonical number."
                if "refund" in lt:
                    recommended_amount = round(sum(amounts), 2)
                    note = "Multiple refund amounts detected; summed exposure is likely the morning-safe number."
                elif any(token in lt for token in ["superseded", "supersedes", "replacing", "replaces", "new larger invoice"]):
                    recommended_amount = max(amounts)
                    note = "Superseded/updated money line detected; the larger/latest amount is probably the canonical one."
                if recommended_amount is not None and current_amount != recommended_amount:
                    findings.append(Finding(
                        kind="amount_parser_risk",
                        severity="high",
                        section=section,
                        task=task,
                        note=note,
                        refs=[],
                        current_amount=current_amount,
                        recommended_amount=recommended_amount,
                    ))

    findings.sort(key=lambda f: ({"high": 0, "medium": 1, "low": 2}.get(f.severity, 3), f.kind, f.section, f.task.lower()))
    return {
        "summary": {
            "target_date": target_date,
            "generated_at": generated_at,
            "total_findings": len(findings),
            "stale_date": sum(1 for f in findings if f.kind == "stale_date"),
            "amount_parser_risk": sum(1 for f in findings if f.kind == "amount_parser_risk"),
            "missing_source": sum(1 for f in findings if f.kind == "missing_source"),
            "passive_urgent": sum(1 for f in findings if f.kind == "passive_urgent"),
        },
        "findings": [asdict(f) for f in findings],
    }


def render_markdown(payload: dict[str, Any]) -> str:
    s = payload["summary"]
    lines = [
        f"# Morning Exception Desk — {s['target_date']}",
        "",
        f"Generated: {s['generated_at']}",
        "",
        "## Snapshot",
        f"- Total findings: **{s['total_findings']}**",
        f"- Past-dated active items: **{s['stale_date']}**",
        f"- Amount parser risks: **{s['amount_parser_risk']}**",
        f"- Urgent items missing source: **{s['missing_source']}**",
        f"- Passive items still in urgent: **{s['passive_urgent']}**",
        "",
        "## Findings",
    ]
    if not payload["findings"]:
        lines.append("- No trust exceptions surfaced.")
    for item in payload["findings"]:
        money_note = ""
        if item.get("recommended_amount") is not None:
            money_note = f" Current parser: {_fmt_money(item.get('current_amount'))}. Recommended: {_fmt_money(item.get('recommended_amount'))}."
        refs = f" Refs: {', '.join(item['refs'])}." if item.get("refs") else ""
        lines.append(f"- **{item['severity'].upper()} · {item['kind']} · {item['section']}** — {item['note']}{money_note}{refs}")
        lines.append(f"  - {item['task']}")
    lines.append("")
    return "\n".join(lines)


def render_html(payload: dict[str, Any]) -> str:
    s = payload["summary"]
    rows = []
    for item in payload["findings"]:
        money = "—"
        if item.get("recommended_amount") is not None:
            money = f"{_fmt_money(item.get('current_amount'))} → {_fmt_money(item.get('recommended_amount'))}"
        rows.append(
            "<tr>"
            f"<td>{escape(item['severity'].upper())}</td>"
            f"<td>{escape(item['kind'])}</td>"
            f"<td>{escape(item['section'])}</td>"
            f"<td>{escape(item['note'])}</td>"
            f"<td>{escape(', '.join(item.get('refs') or []) or '—')}</td>"
            f"<td>{escape(money)}</td>"
            f"<td>{escape(item['task'])}</td>"
            "</tr>"
        )
    return f"""<!doctype html>
<html lang=\"en\">
<head>
<meta charset=\"utf-8\" />
<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
<title>Morning Exception Desk — {escape(s['target_date'])}</title>
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
  <h1>Morning Exception Desk</h1>
  <div class=\"muted\">{escape(s['generated_at'])} · trust issues worth checking before acting fast</div>
  <p><a href=\"./morning-ops-hub-latest.html\">Open morning ops hub</a></p>
  <div class=\"grid\">
    <div class=\"card\"><div class=\"k\">Total findings</div><div class=\"v\">{s['total_findings']}</div></div>
    <div class=\"card\"><div class=\"k\">Past-dated active items</div><div class=\"v\">{s['stale_date']}</div></div>
    <div class=\"card\"><div class=\"k\">Amount parser risks</div><div class=\"v\">{s['amount_parser_risk']}</div></div>
    <div class=\"card\"><div class=\"k\">Urgent without source</div><div class=\"v\">{s['missing_source']}</div></div>
    <div class=\"card\"><div class=\"k\">Passive in urgent</div><div class=\"v\">{s['passive_urgent']}</div></div>
  </div>
  <div class=\"panel\" style=\"margin-top:12px\"><table><thead><tr><th>Severity</th><th>Kind</th><th>Section</th><th>Note</th><th>Refs</th><th>Parser</th><th>Task</th></tr></thead><tbody>{''.join(rows) or '<tr><td colspan="7" class="muted">No trust exceptions surfaced.</td></tr>'}</tbody></table></div>
</div>
</body>
</html>
"""


def main() -> int:
    parser = argparse.ArgumentParser(description="Build morning exception desk")
    parser.add_argument("--date", help="Output date YYYY-MM-DD")
    args = parser.parse_args()

    now = datetime.now().astimezone()
    date_str = args.date or now.strftime("%Y-%m-%d")
    generated_at = now.strftime("%Y-%m-%d %H:%M %Z")
    payload = build_payload(date_str, generated_at)

    REPORTS.mkdir(parents=True, exist_ok=True)
    md_path = REPORTS / f"morning-exception-desk-{date_str}.md"
    html_path = REPORTS / f"morning-exception-desk-{date_str}.html"
    json_path = REPORTS / f"morning-exception-desk-{date_str}.json"

    md_path.write_text(render_markdown(payload) + "\n", encoding="utf-8")
    html_path.write_text(render_html(payload), encoding="utf-8")
    json_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    _clone_latest(md_path, REPORTS / "morning-exception-desk-latest.md")
    _clone_latest(html_path, REPORTS / "morning-exception-desk-latest.html")
    _clone_latest(json_path, REPORTS / "morning-exception-desk-latest.json")

    print(f"Built {md_path.relative_to(ROOT)}")
    print(f"Built {html_path.relative_to(ROOT)}")
    print(f"Built {json_path.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
