#!/usr/bin/env python3
"""build_morning_money_desk.py

Build a morning money desk from BUSINESS_STATE.md.

Outputs:
- reports/morning-money-desk-YYYY-MM-DD.md
- reports/morning-money-desk-YYYY-MM-DD.html
- reports/morning-money-desk-YYYY-MM-DD.json
- reports/morning-money-desk-latest.md
- reports/morning-money-desk-latest.html
- reports/morning-money-desk-latest.json
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
from dataclasses import asdict, dataclass
from datetime import date, datetime
from html import escape
from pathlib import Path
from typing import Any

from build_decision_brief import BUSINESS_STATE, REPORTS, parse_business_state

ROOT = Path(__file__).resolve().parents[1]
MONEY_RE = re.compile(r"\$(\d{1,3}(?:,\d{3})*(?:\.\d+)?)")
DUE_DATE_RE = re.compile(r"(?:due|eta|by)\s+\**(20\d{2}-\d{2}-\d{2})\**", re.I)


@dataclass
class MoneyItem:
    lane: str
    title: str
    detail: str
    amount: float | None
    due_date: str | None
    due_status: str
    owner: str
    sources: list[str]
    note: str


def _clone_latest(versioned: Path, latest: Path) -> None:
    shutil.copyfile(versioned, latest)


def _fmt_money(v: float | None) -> str:
    if v is None:
        return "—"
    if abs(v - round(v)) < 1e-9:
        return f"${int(round(v)):,}"
    return f"${v:,.2f}"


def _clean(text: str) -> str:
    return " ".join(text.replace("**", "").split())


def _money_values(text: str) -> list[float]:
    return [float(m.group(1).replace(",", "")) for m in MONEY_RE.finditer(text)]


def _first_due_date(text: str) -> str | None:
    dates = DUE_DATE_RE.findall(text)
    if not dates:
        return None
    return min(dates)


def _due_status(target: date, due_text: str | None, raw_text: str) -> str:
    lower = raw_text.lower()
    if "due on receipt" in lower:
        return "due now"
    if not due_text:
        return "undated"
    due = date.fromisoformat(due_text)
    delta = (due - target).days
    if delta < 0:
        return f"overdue {abs(delta)}d"
    if delta == 0:
        return "due today"
    return f"due in {delta}d"


def _lane(text: str) -> str | None:
    lower = text.lower()
    if "target price" in lower:
        return None
    if any(tok in lower for tok in ["refund", "chargeback", "a-to-z", "price competitiveness", "late shipment", "unshipped", "return"]):
        return "protect"
    if any(tok in lower for tok in ["supplier", "open balance", "past-due balance", "ach form"]):
        return "pay"
    if "invoice" in lower or "remains unpaid" in lower or "paypal invoice" in lower:
        if any(tok in lower for tok in ["a3 partners", "supplier", "caroline", "fastenal"]):
            return "pay"
        if "quote" in lower:
            return "upside"
        return "collect"
    if any(tok in lower for tok in ["quote", "wholesale", "dealer inquiry", "b2b inquiry", "bulk inquiry", "pakistan", "donaldson", "arka", "shohreh"]):
        return "upside"
    return None


def _amount_for_lane(text: str, lane: str) -> float | None:
    values = _money_values(text)
    if not values:
        return None
    lower = text.lower()
    if lane == "protect":
        if "refund" in lower or "chargeback" in lower:
            return round(sum(values), 2)
        return max(values)
    if lane == "pay":
        if any(tok in lower for tok in ["open balance", "past-due balance", "still shows", "unsupported transactional supplier"]):
            return max(values)
        return values[0]
    if lane == "collect":
        if "superseded" in lower or "new larger invoice" in lower:
            return max(values)
        return values[0]
    if lane == "upside":
        return max(values)
    return values[0]


def _owner(lane: str, text: str) -> str:
    lower = text.lower()
    if lane == "pay" or "needs ev" in lower or "ev should" in lower:
        return "Ev"
    if lane == "protect" and any(tok in lower for tok in ["price competitiveness", "late shipment", "walmart"]):
        return "Ev"
    return "Operator"


def _note(lane: str, due_status: str, text: str) -> str:
    lower = text.lower()
    if lane == "collect":
        return "Collect or reconcile inbound cash."
    if lane == "pay":
        if "open balance" in lower or "past-due balance" in lower:
            return "Verify supplier-side balance before asserting internal non-payment."
        return "Confirm payable timing and avoid surprise outbound cash." 
    if lane == "protect":
        if "price competitiveness" in lower:
            return "Margin / marketplace decision, not an automatic price cut."
        return "Reduce leakage from refunds, disputes, or fulfillment misses."
    if lane == "upside":
        return "Revenue opportunity waiting for quote, response, or decision."
    return due_status


def build_payload(date_str: str, generated_at: str) -> dict[str, Any]:
    target = date.fromisoformat(date_str)
    items = parse_business_state(BUSINESS_STATE)

    selected: list[MoneyItem] = []
    for item in items:
        text = _clean(f"{item.title} — {item.detail}")
        lane = _lane(text)
        if not lane:
            continue
        amount = _amount_for_lane(text, lane)
        if lane != "upside" and amount is None:
            continue
        due_date = _first_due_date(text)
        due_status = _due_status(target, due_date, text)
        selected.append(MoneyItem(
            lane=lane,
            title=item.title,
            detail=_clean(item.detail),
            amount=amount,
            due_date=due_date,
            due_status=due_status,
            owner=_owner(lane, text),
            sources=item.sources,
            note=_note(lane, due_status, text),
        ))

    lane_order = {"collect": 0, "pay": 1, "protect": 2, "upside": 3}
    status_weight = {"due now": 0, "due today": 1}

    def sort_key(item: MoneyItem) -> tuple[Any, ...]:
        overdue_match = re.match(r"overdue (\d+)d", item.due_status)
        overdue_days = -int(overdue_match.group(1)) if overdue_match else 9999
        due_rank = status_weight.get(item.due_status, 50)
        amt = -(item.amount or 0)
        return (lane_order.get(item.lane, 99), overdue_days, due_rank, amt, item.title.lower())

    selected.sort(key=sort_key)

    groups: dict[str, list[dict[str, Any]]] = {lane: [] for lane in lane_order}
    for item in selected:
        groups[item.lane].append(asdict(item))

    summary = {
        "target_date": date_str,
        "generated_at": generated_at,
        "collect_total": round(sum(item.amount or 0 for item in selected if item.lane == "collect"), 2),
        "pay_total": round(sum(item.amount or 0 for item in selected if item.lane == "pay"), 2),
        "protect_total": round(sum(item.amount or 0 for item in selected if item.lane == "protect"), 2),
        "upside_total": round(sum(item.amount or 0 for item in selected if item.lane == "upside"), 2),
        "overdue_count": len([item for item in selected if item.due_status.startswith("overdue") or item.due_status == "due now"]),
        "undated_count": len([item for item in selected if item.due_status == "undated"]),
        "items_total": len(selected),
    }

    return {
        "summary": summary,
        "collect_now": groups["collect"][:8],
        "pay_verify": groups["pay"][:8],
        "protect_margin": groups["protect"][:8],
        "upside_queue": groups["upside"][:8],
        "all_items": [asdict(item) for item in selected],
    }


def _render_item_md(item: dict[str, Any]) -> str:
    meta = [item["due_status"], item["owner"]]
    if item.get("amount") is not None:
        meta.append(_fmt_money(float(item["amount"])))
    if item.get("sources"):
        meta.append("msgs " + ", ".join(item["sources"]))
    return (
        f"**{item['title']}** — {item['detail']} ({'; '.join(meta)})\n"
        f"  - {item['note']}"
    )


def render_markdown(payload: dict[str, Any]) -> str:
    s = payload["summary"]
    lines = [
        f"# Morning Money Desk — {s['target_date']}",
        "",
        f"Generated: {s['generated_at']}",
        "",
        "## Snapshot",
        f"- Collect / receivables visible: **{_fmt_money(s['collect_total'])}**",
        f"- Payables / outbound cash visible: **{_fmt_money(s['pay_total'])}**",
        f"- Leakage / disputes visible: **{_fmt_money(s['protect_total'])}**",
        f"- Pipeline / upside visible: **{_fmt_money(s['upside_total'])}**",
        f"- Overdue or due-now items: **{s['overdue_count']}**",
        f"- Undated money items: **{s['undated_count']}**",
        "",
    ]
    sections = [
        ("Collect now", "collect_now"),
        ("Pay / verify outbound", "pay_verify"),
        ("Protect margin / leakage", "protect_margin"),
        ("Pipeline / upside", "upside_queue"),
    ]
    for title, key in sections:
        lines.append(f"## {title}")
        items = payload.get(key) or []
        if not items:
            lines.append("- None surfaced.")
        else:
            for item in items:
                lines.append(f"- {_render_item_md(item)}")
        lines.append("")
    return "\n".join(lines)


def _render_rows(items: list[dict[str, Any]]) -> str:
    if not items:
        return "<tr><td colspan='6' class='muted'>Nothing surfaced.</td></tr>"
    rows = []
    for item in items:
        rows.append(
            "<tr>"
            f"<td>{escape(item['title'])}</td>"
            f"<td>{escape(item['due_status'])}</td>"
            f"<td>{escape(item['owner'])}</td>"
            f"<td>{escape(_fmt_money(float(item['amount'])) if item.get('amount') is not None else '—')}</td>"
            f"<td>{escape(', '.join(item.get('sources') or []) or '—')}</td>"
            f"<td>{escape(item['note'])}<div class='detail'>{escape(item['detail'])}</div></td>"
            "</tr>"
        )
    return "".join(rows)


def render_html(payload: dict[str, Any]) -> str:
    s = payload["summary"]
    copy_text = "\n".join([
        f"Morning money desk — {s['target_date']}",
        "",
        *[f"- [ ] {item['title']} — {item['due_status']} — {_fmt_money(float(item['amount'])) if item.get('amount') is not None else '—'}" for item in (payload.get('collect_now') or [])[:4]],
        *[f"- [ ] {item['title']} — {item['due_status']} — {_fmt_money(float(item['amount'])) if item.get('amount') is not None else '—'}" for item in (payload.get('pay_verify') or [])[:4]],
    ])
    return f"""<!doctype html>
<html lang=\"en\">
<head>
<meta charset=\"utf-8\" />
<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
<title>Morning Money Desk — {escape(s['target_date'])}</title>
<style>
:root {{--bg:#0A1628;--surface:#111B2E;--border:#1E293B;--text:#fff;--muted:#94A3B8;--accent:#3B82F6;}}
*{{box-sizing:border-box}} body{{margin:0;padding:24px;background:var(--bg);color:var(--text);font-family:Inter,-apple-system,sans-serif}}
.wrap{{max-width:1280px;margin:0 auto}} .grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}}
.card,.panel{{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px}}
.k{{color:var(--muted);font-size:12px}} .v{{font-size:26px;font-weight:750;margin-top:4px}} .muted,.detail{{color:var(--muted)}}
.two{{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}} @media (max-width: 960px){{.two{{grid-template-columns:1fr}}}}
table{{width:100%;border-collapse:collapse;font-size:13px}} th,td{{padding:8px;border-bottom:1px solid var(--border);text-align:left;vertical-align:top}} th{{color:var(--muted);font-size:11px;text-transform:uppercase}} button{{background:var(--accent);border:none;color:#fff;border-radius:10px;padding:8px 10px;font-weight:650;cursor:pointer}} a{{color:#93C5FD}}
</style>
</head>
<body>
<div class=\"wrap\">
  <h1>Morning Money Desk</h1>
  <div class=\"muted\">{escape(s['generated_at'])} · cash collection, leakage, and supplier pressure in one screen</div>
  <p><a href=\"./morning-ops-hub-latest.html\">Open full ops hub</a> · <a href=\"./morning-decision-desk-latest.html\">Decision desk</a> · <a href=\"../BUSINESS_STATE.md\">Business State</a></p>
  <p><button id=\"copyBtn\">Copy money checklist</button></p>
  <div class=\"grid\">
    <div class=\"card\"><div class=\"k\">Collect</div><div class=\"v\">{escape(_fmt_money(s['collect_total']))}</div></div>
    <div class=\"card\"><div class=\"k\">Pay / verify</div><div class=\"v\">{escape(_fmt_money(s['pay_total']))}</div></div>
    <div class=\"card\"><div class=\"k\">Leakage / disputes</div><div class=\"v\">{escape(_fmt_money(s['protect_total']))}</div></div>
    <div class=\"card\"><div class=\"k\">Upside</div><div class=\"v\">{escape(_fmt_money(s['upside_total']))}</div></div>
    <div class=\"card\"><div class=\"k\">Overdue / due now</div><div class=\"v\">{s['overdue_count']}</div></div>
  </div>
  <div class=\"two\">
    <div class=\"panel\"><h3>Collect now</h3><table><thead><tr><th>Item</th><th>Status</th><th>Owner</th><th>Amount</th><th>Sources</th><th>Note</th></tr></thead><tbody>{_render_rows(payload.get('collect_now') or [])}</tbody></table></div>
    <div class=\"panel\"><h3>Pay / verify outbound</h3><table><thead><tr><th>Item</th><th>Status</th><th>Owner</th><th>Amount</th><th>Sources</th><th>Note</th></tr></thead><tbody>{_render_rows(payload.get('pay_verify') or [])}</tbody></table></div>
  </div>
  <div class=\"two\">
    <div class=\"panel\"><h3>Protect margin / leakage</h3><table><thead><tr><th>Item</th><th>Status</th><th>Owner</th><th>Amount</th><th>Sources</th><th>Note</th></tr></thead><tbody>{_render_rows(payload.get('protect_margin') or [])}</tbody></table></div>
    <div class=\"panel\"><h3>Pipeline / upside</h3><table><thead><tr><th>Item</th><th>Status</th><th>Owner</th><th>Amount</th><th>Sources</th><th>Note</th></tr></thead><tbody>{_render_rows(payload.get('upside_queue') or [])}</tbody></table></div>
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
    parser = argparse.ArgumentParser(description="Build morning money desk from BUSINESS_STATE.md")
    parser.add_argument("--date", help="Output date YYYY-MM-DD")
    args = parser.parse_args()

    if not BUSINESS_STATE.exists():
        raise SystemExit(f"Missing {BUSINESS_STATE}")

    now = datetime.now().astimezone()
    date_str = args.date or now.strftime("%Y-%m-%d")
    generated_at = now.strftime("%Y-%m-%d %H:%M %Z")
    payload = build_payload(date_str, generated_at)

    REPORTS.mkdir(parents=True, exist_ok=True)
    md_path = REPORTS / f"morning-money-desk-{date_str}.md"
    html_path = REPORTS / f"morning-money-desk-{date_str}.html"
    json_path = REPORTS / f"morning-money-desk-{date_str}.json"

    md_path.write_text(render_markdown(payload) + "\n", encoding="utf-8")
    html_path.write_text(render_html(payload), encoding="utf-8")
    json_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    _clone_latest(md_path, REPORTS / "morning-money-desk-latest.md")
    _clone_latest(html_path, REPORTS / "morning-money-desk-latest.html")
    _clone_latest(json_path, REPORTS / "morning-money-desk-latest.json")

    print(f"Built {md_path.relative_to(ROOT)}")
    print(f"Built {html_path.relative_to(ROOT)}")
    print(f"Built {json_path.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
