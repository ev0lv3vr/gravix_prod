#!/usr/bin/env python3
"""build_customer_response_desk.py

Build a morning customer-response desk from BUSINESS_STATE.md.

Outputs:
- reports/morning-customer-desk-YYYY-MM-DD.md
- reports/morning-customer-desk-YYYY-MM-DD.html
- reports/morning-customer-desk-YYYY-MM-DD.json
- reports/morning-customer-desk-latest.md
- reports/morning-customer-desk-latest.html
- reports/morning-customer-desk-latest.json
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

from build_decision_brief import parse_business_state

ROOT = Path(__file__).resolve().parents[1]
REPORTS = ROOT / "reports"


@dataclass
class CustomerItem:
    title: str
    detail: str
    amount: float | None
    sources: list[str]
    draft_paths: list[str]
    tags: list[str]
    order_refs: list[str]
    severity: str
    status: str
    score: int


def _clone_latest(versioned: Path, latest: Path) -> None:
    shutil.copyfile(versioned, latest)


def _fmt_money(v: float | None) -> str:
    if v is None:
        return "—"
    if abs(v - round(v)) < 1e-9:
        return f"${int(round(v)):,}"
    return f"${v:,.2f}"


def _extract_orders(text: str) -> list[str]:
    matches = re.findall(r"(?:order\s*#?\s*|order\s+)([A-Z0-9-]{4,})", text, flags=re.I)
    out: list[str] = []
    seen: set[str] = set()
    for match in matches:
        value = match.strip(" .,")
        if not any(ch.isdigit() for ch in value):
            continue
        if value not in seen:
            out.append(value)
            seen.add(value)
    return out


def _derive(item: Any) -> CustomerItem:
    text = f"{item.title} {item.detail}".lower()
    score = 0
    if any(tok in text for tok in ["a-to-z", "risk", "not arrived", "refund", "unshipped", "auto-cancel"]):
        score += 5
    if any(tok in text for tok in ["overdue", "stale", "followed up", "urgent", "complaint", "replacement"]):
        score += 3
    if item.amount:
        score += 2
    if item.draft_paths:
        score += 1
    if "decision" in text or "needs shipping fields" in text or "pending" in text:
        score += 1

    severity = "hot" if score >= 6 else "warm" if score >= 3 else "normal"

    if item.draft_paths:
        status = "draft_ready"
    elif any(tok in text for tok in ["needs shipping fields", "decision", "pending", "not created"]):
        status = "needs_info"
    elif any(tok in text for tok in ["stale", "overdue", "followed up", "not arrived", "refund", "unshipped"]):
        status = "needs_reply"
    else:
        status = "watch"

    return CustomerItem(
        title=item.title,
        detail=item.detail,
        amount=item.amount,
        sources=item.sources,
        draft_paths=item.draft_paths,
        tags=item.tags,
        order_refs=_extract_orders(f"{item.title} {item.detail}"),
        severity=severity,
        status=status,
        score=score,
    )


def build_payload(date_str: str, generated_at: str) -> dict[str, Any]:
    raw_items = parse_business_state(ROOT / "BUSINESS_STATE.md")
    customer_items = [_derive(item) for item in raw_items if item.source_section == "queue"]
    customer_items.sort(key=lambda item: (-item.score, -(item.amount or 0), item.title.lower()))

    hot = [item for item in customer_items if item.severity == "hot"][:8]
    draft_ready = [item for item in customer_items if item.status == "draft_ready"][:8]
    needs_info = [item for item in customer_items if item.status == "needs_info"][:8]
    money = [item for item in customer_items if item.amount]

    return {
        "date": date_str,
        "generated_at": generated_at,
        "summary": {
            "total_queue": len(customer_items),
            "hot_risks": len([item for item in customer_items if item.severity == "hot"]),
            "draft_ready": len([item for item in customer_items if item.status == "draft_ready"]),
            "needs_info": len([item for item in customer_items if item.status == "needs_info"]),
            "money_visible": round(sum(item.amount or 0 for item in money), 2),
        },
        "hot_risks": [asdict(item) for item in hot],
        "draft_ready": [asdict(item) for item in draft_ready],
        "needs_info": [asdict(item) for item in needs_info],
        "all_queue": [asdict(item) for item in customer_items],
    }


def _render_item_md(item: dict[str, Any]) -> str:
    meta: list[str] = []
    if item.get("order_refs"):
        meta.append("orders " + ", ".join(item["order_refs"]))
    if item.get("amount"):
        meta.append(_fmt_money(float(item["amount"])))
    if item.get("sources"):
        meta.append("msgs " + ", ".join(item["sources"]))
    if item.get("draft_paths"):
        meta.append("refs: " + ", ".join(item["draft_paths"][:2]))
    meta_text = f" ({'; '.join(meta)})" if meta else ""
    return f"**{item['title']}** — {item['detail']}{meta_text}"


def render_markdown(payload: dict[str, Any]) -> str:
    s = payload["summary"]
    out = [
        f"# Morning Customer Desk — {payload['date']}",
        "",
        f"Generated: {payload['generated_at']}",
        "",
        "## Snapshot",
        f"- Customer queue: **{s['total_queue']}**",
        f"- Hot risks: **{s['hot_risks']}**",
        f"- Draft-backed replies: **{s['draft_ready']}**",
        f"- Needs missing info / decision: **{s['needs_info']}**",
        f"- Visible money in queue: **{_fmt_money(s['money_visible'])}**",
        "",
    ]
    for title, key in [
        ("Hot risks first", "hot_risks"),
        ("Draft-backed replies", "draft_ready"),
        ("Needs info before reply", "needs_info"),
        ("Full queue", "all_queue"),
    ]:
        out.append(f"## {title}")
        items = payload[key]
        if not items:
            out.append("- None")
        else:
            for item in items:
                out.append(f"- {_render_item_md(item)}")
        out.append("")
    return "\n".join(out) + "\n"


def render_html(payload: dict[str, Any]) -> str:
    def section(title: str, items: list[dict[str, Any]]) -> str:
        if not items:
            body = "<li class='muted'>Nothing surfaced.</li>"
        else:
            body = "".join(
                "<li>"
                f"<b>{escape(item['title'])}</b> — {escape(item['detail'])}"
                + (f" <span class='meta'>· orders {escape(', '.join(item.get('order_refs') or []))}</span>" if item.get("order_refs") else "")
                + (f" <span class='meta'>· {_fmt_money(float(item['amount']))}</span>" if item.get("amount") else "")
                + (f" <span class='meta'>· msgs {escape(', '.join(item.get('sources') or []))}</span>" if item.get("sources") else "")
                + (f" <span class='meta'>· {escape(', '.join((item.get('draft_paths') or [])[:2]))}</span>" if item.get("draft_paths") else "")
                + f" <span class='badge'>{escape(item['status'])}</span>"
                + "</li>"
                for item in items
            )
        return f"<div class='panel'><h3>{escape(title)}</h3><ul>{body}</ul></div>"

    copy_text = "\n".join([
        f"Customer desk — {payload['date']}",
        "",
        *[f"- [ ] {item['title']} — {item['detail']}" for item in payload['hot_risks'][:5]],
    ])
    s = payload["summary"]
    cards = [
        ("Queue", s["total_queue"]),
        ("Hot risks", s["hot_risks"]),
        ("Draft-ready", s["draft_ready"]),
        ("Needs info", s["needs_info"]),
        ("Money visible", _fmt_money(s["money_visible"])),
    ]
    cards_html = "".join(f"<div class='card'><div class='k'>{escape(str(k))}</div><div class='v'>{escape(str(v))}</div></div>" for k, v in cards)
    return f"""<!doctype html>
<html lang=\"en\">
<head>
<meta charset=\"utf-8\" />
<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
<title>Morning Customer Desk — {escape(payload['date'])}</title>
<style>
:root {{--bg:#0A1628;--surface:#111B2E;--border:#1E293B;--text:#fff;--muted:#94A3B8;--accent:#3B82F6;}}
*{{box-sizing:border-box}} body{{margin:0;padding:24px;background:var(--bg);color:var(--text);font-family:Inter,-apple-system,sans-serif}}
.wrap{{max-width:1200px;margin:0 auto}} .grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}}
.card,.panel{{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px}}
.k{{color:var(--muted);font-size:12px}} .v{{font-size:26px;font-weight:750;margin-top:4px}} .meta,.muted{{color:var(--muted)}}
.two{{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}} @media (max-width: 900px){{.two{{grid-template-columns:1fr}}}}
ul{{margin:8px 0 0 18px}} li{{margin:7px 0}} button{{background:var(--accent);border:none;color:white;border-radius:10px;padding:8px 10px;font-weight:650;cursor:pointer}} a{{color:#93C5FD}} .badge{{display:inline-block;border:1px solid var(--border);border-radius:999px;padding:2px 8px;font-size:12px;color:var(--muted);margin-left:6px}}
</style>
</head>
<body>
<div class=\"wrap\">
  <h1>Morning Customer Desk</h1>
  <div class=\"muted\">{escape(payload['generated_at'])} · customer/B2B reply queue with draft refs and missing-info flags</div>
  <p><a href=\"./morning-ops-hub-latest.html\">Open full ops hub</a> · <a href=\"./morning-decision-desk-latest.html\">Decision desk</a> · <a href=\"../BUSINESS_STATE.md\">Business State</a></p>
  <p><button id=\"copyBtn\">Copy hot reply list</button></p>
  <div class=\"grid\">{cards_html}</div>
  <div class=\"two\">
    {section('Hot risks first', payload['hot_risks'])}
    {section('Draft-backed replies', payload['draft_ready'])}
  </div>
  <div class=\"two\">
    {section('Needs info before reply', payload['needs_info'])}
    {section('Full queue', payload['all_queue'])}
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
    parser = argparse.ArgumentParser(description="Build morning customer-response desk from BUSINESS_STATE.md")
    parser.add_argument("--date", help="Output date YYYY-MM-DD")
    args = parser.parse_args()

    now = datetime.now().astimezone()
    date_str = args.date or now.strftime("%Y-%m-%d")
    generated_at = now.strftime("%Y-%m-%d %H:%M %Z")
    payload = build_payload(date_str, generated_at)

    REPORTS.mkdir(parents=True, exist_ok=True)
    md_path = REPORTS / f"morning-customer-desk-{date_str}.md"
    html_path = REPORTS / f"morning-customer-desk-{date_str}.html"
    json_path = REPORTS / f"morning-customer-desk-{date_str}.json"

    md_path.write_text(render_markdown(payload), encoding="utf-8")
    html_path.write_text(render_html(payload), encoding="utf-8")
    json_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    _clone_latest(md_path, REPORTS / "morning-customer-desk-latest.md")
    _clone_latest(html_path, REPORTS / "morning-customer-desk-latest.html")
    _clone_latest(json_path, REPORTS / "morning-customer-desk-latest.json")

    print(f"Built {md_path.relative_to(ROOT)}")
    print(f"Built {html_path.relative_to(ROOT)}")
    print(f"Built {json_path.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
