#!/usr/bin/env python3
"""build_supplier_ops_desk.py

Build a morning supplier / fulfillment desk from BUSINESS_STATE.md.

Focus:
- inbound cash tied to supplier/B2B invoices and POs
- outbound supplier pressure / balance verification
- fulfillment / warehouse cutovers and shipments to confirm
- onboarding / account-state follow-ups with vendors and channels

Outputs:
- reports/supplier-ops-desk-YYYY-MM-DD.{md,html,json}
- reports/supplier-ops-desk-latest.{md,html,json}
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

from build_decision_brief import BUSINESS_STATE, Item, REPORTS, parse_business_state

ROOT = Path(__file__).resolve().parents[1]
MONEY_RE = re.compile(r"\$(\d{1,3}(?:,\d{3})*(?:\.\d+)?)")
DATE_RE = re.compile(r"(?:due|eta|by|starting|after)\s+\**(20\d{2}-\d{2}-\d{2})\**", re.I)


@dataclass
class SupplierItem:
    title: str
    detail: str
    bucket: str
    owner: str
    urgency: str
    surface: str
    first_step: str
    success_check: str
    due_date: str | None
    due_status: str
    sources: list[str]
    amount: float | None
    score: int


BUCKET_ORDER = {
    "Collect / confirm inbound cash": 0,
    "Pay / verify supplier pressure": 1,
    "Fulfillment / warehouse watch": 2,
    "Onboarding / relationship follow-up": 3,
}


def _clone_latest(versioned: Path, latest: Path) -> None:
    shutil.copyfile(versioned, latest)


def _clean(text: str) -> str:
    return " ".join(text.replace("**", "").split())


def _match_any(text: str, terms: list[str]) -> bool:
    lt = text.lower()
    return any(term in lt for term in terms)


def _fmt_money(v: float | None) -> str:
    if v is None:
        return "—"
    if abs(v - round(v)) < 1e-9:
        return f"${int(round(v)):,}"
    return f"${v:,.2f}"


def _all_amounts(text: str) -> list[float]:
    return [float(m.group(1).replace(",", "")) for m in MONEY_RE.finditer(text)]


def _first_date(text: str) -> str | None:
    dates = DATE_RE.findall(text)
    if not dates:
        return None
    return min(dates)


def _due_status(target: date, due_date: str | None, text: str) -> str:
    lt = text.lower()
    if "due on receipt" in lt:
        return "due now"
    if due_date is None:
        return "undated"
    delta = (date.fromisoformat(due_date) - target).days
    if delta < 0:
        return f"overdue {abs(delta)}d"
    if delta == 0:
        return "due today"
    return f"due in {delta}d"


def _bucket(item: Item) -> str | None:
    text = f"{item.title} {item.detail}".lower()
    if _match_any(text, ["garcor", "gemifly", "paypal invoice", "purchase order", "po4046132"]):
        return "Collect / confirm inbound cash"
    if _match_any(text, ["a3 partners", "a3 balance", "supplier onboarding", "fastenal", "open balance", "past-due balance"]):
        return "Pay / verify supplier pressure"
    if _match_any(text, ["shipbob northeast hub move", "warehouse", "wro", "kutztown", "bethlehem", "shipment", "tracking 1z43a99a0348588986", "late origin scan"]):
        return "Fulfillment / warehouse watch"
    if _match_any(text, ["donaldson", "account setup", "finance side", "supported transactional supplier"]):
        return "Onboarding / relationship follow-up"
    return None


def _surface(bucket: str, text: str) -> str:
    if bucket == "Collect / confirm inbound cash":
        return "PayPal / inbox trail"
    if bucket == "Pay / verify supplier pressure":
        if "fastenal" in text:
            return "Fastenal / Smartsheet"
        return "Supplier ledger / bank"
    if bucket == "Fulfillment / warehouse watch":
        if "late origin scan" in text:
            return "Walmart Marketplace"
        return "ShipBob / carrier"
    return "Email / vendor portal"


def _owner(bucket: str, text: str) -> str:
    if bucket in {"Collect / confirm inbound cash", "Pay / verify supplier pressure"}:
        return "Ev"
    if "donaldson" in text:
        return "Operator"
    if "late origin scan" in text:
        return "Operator"
    return "Shared"


def _amount(item: Item, bucket: str) -> float | None:
    text = f"{item.title} {item.detail}".lower()
    values = _all_amounts(f"{item.title} — {item.detail}")
    if not values:
        return None
    if bucket == "Collect / confirm inbound cash":
        if "gemifly" in text or "superseded" in text or "new larger invoice" in text:
            return max(values)
        return values[0]
    if bucket == "Pay / verify supplier pressure":
        if _match_any(text, ["open balance", "past-due balance", "still shows"]):
            return max(values)
        return values[0]
    return None


def _first_step(title: str, detail: str, bucket: str) -> tuple[str, str]:
    text = f"{title} {detail}".lower()
    if "garcor" in text:
        return (
            "Confirm whether PayPal invoice 1001-0244 for the PO has been paid; if not, prep the clean receipt/processing confirmation follow-up.",
            "Done when Garcor is either marked paid or has a ready next-touch note tied to the PO + invoice.",
        )
    if "gemifly" in text:
        return (
            "Check whether PayPal invoice 1001-0243 landed and reconcile the visible amount before nudging again.",
            "Done when the invoice is either paid/reconciled or has a clear next collection step.",
        )
    if "a3 partners" in text:
        return (
            "Verify the 165-unit Gemiflex shipment landed and compare A3's stated open balance against bank / QuickBooks truth before treating it as confirmed payable.",
            "Done when delivery status and the real payable posture are both explicit.",
        )
    if "fastenal" in text:
        return (
            "Package the supplier-onboarding path into one morning checklist: self-assessment, onboarding request, and ACH form, plus whether Ev wants to pursue Level 3 later.",
            "Done when the onboarding path is clear enough to execute without rereading the whole thread.",
        )
    if "shipbob northeast hub move" in text:
        return (
            "Check for any open Northeast/Kutztown inbound or WRO work that would hit the Bethlehem cutover dates.",
            "Done when no risky inbound remains pointed at Kutztown past the cutoff or the at-risk move is flagged.",
        )
    if "donaldson" in text:
        return (
            "Capture the exact current state of Donaldson finance onboarding and whether anything is actually waiting on us.",
            "Done when the thread is clearly either waiting on Donaldson or has a next outbound ask.",
        )
    if "late origin scan" in text:
        return (
            "Find the affected Walmart order and confirm whether the carrier scan/tracking story is clean within the 24-hour window.",
            "Done when the order is identified and either cleared or escalated.",
        )
    return (
        "Open the live source of truth and turn this supplier / fulfillment item into a single clear next action.",
        "Done when the next action is explicit enough to execute without thread archaeology.",
    )


def _urgency(bucket: str, text: str, due_status: str) -> str:
    if due_status in {"due now", "due today"} or due_status.startswith("overdue"):
        return "now"
    if _match_any(text, ["late origin scan", "shipbob northeast hub move", "purchase order", "open balance", "past-due balance"]):
        return "now"
    if bucket in {"Collect / confirm inbound cash", "Pay / verify supplier pressure"}:
        return "soon"
    return "watch"


def _score(bucket: str, text: str, amount: float | None, due_status: str) -> int:
    score = {"Collect / confirm inbound cash": 8, "Pay / verify supplier pressure": 8, "Fulfillment / warehouse watch": 6, "Onboarding / relationship follow-up": 4}[bucket]
    if amount:
        score += min(int(amount // 1000), 6)
    if due_status == "due now":
        score += 4
    elif due_status == "due today":
        score += 3
    elif due_status.startswith("overdue"):
        score += 4
    if _match_any(text, ["late origin scan", "open balance", "past-due balance", "purchase order", "unsupported transactional supplier"]):
        score += 3
    return score


def _candidates(items: list[Item]) -> list[Item]:
    picked: list[Item] = []
    for item in items:
        text = f"{item.title} {item.detail}".lower()
        if _match_any(text, [
            "garcor",
            "gemifly",
            "a3 partners",
            "fastenal",
            "donaldson",
            "shipbob northeast hub move",
            "late origin scan",
            "po4046132",
            "paypal invoice 1001-0244",
            "paypal invoice 1001-0243",
            "unsupported transactional supplier",
        ]):
            picked.append(item)
    return picked


def _expand_backlog_item(item: Item) -> list[Item]:
    text = f"{item.title} {item.detail}".lower()
    if "shopify / marketplace backlog" not in text:
        return [item]
    return [Item(
        title="ShipBob Northeast Hub move",
        detail="ShipBob is moving from Kutztown to 4755 Hanoverville Road, Building E, Bethlehem, PA 18020. Transition window 2026-05-11 to 2026-05-29; no Kutztown appointments after 2026-05-22; new WRO labels show new address starting 2026-05-27; inbound arriving at Kutztown starting 2026-05-27 will be denied. Check any open Northeast/Kutztown WROs before shipping inbound inventory.",
        source_section=item.source_section,
        sources=item.sources,
        amount=None,
        tags=item.tags,
        draft_paths=item.draft_paths,
    )]


def build_payload(date_str: str, generated_at: str) -> dict[str, Any]:
    target = date.fromisoformat(date_str)
    raw_items = parse_business_state(BUSINESS_STATE)
    expanded: list[Item] = []
    for item in _candidates(raw_items):
        expanded.extend(_expand_backlog_item(item))

    seen: set[tuple[str, str]] = set()
    selected: list[SupplierItem] = []
    for item in expanded:
        key = (item.title, item.detail)
        if key in seen:
            continue
        seen.add(key)
        bucket = _bucket(item)
        if not bucket:
            continue
        detail = _clean(item.detail)
        text = f"{item.title} {detail}".lower()
        amount = _amount(item, bucket)
        due_date = _first_date(detail)
        due_status = _due_status(target, due_date, detail)
        urgency = _urgency(bucket, text, due_status)
        first_step, success_check = _first_step(item.title, detail, bucket)
        selected.append(SupplierItem(
            title=item.title,
            detail=detail,
            bucket=bucket,
            owner=_owner(bucket, text),
            urgency=urgency,
            surface=_surface(bucket, text),
            first_step=first_step,
            success_check=success_check,
            due_date=due_date,
            due_status=due_status,
            sources=item.sources,
            amount=amount,
            score=_score(bucket, text, amount, due_status),
        ))

    selected.sort(key=lambda item: (BUCKET_ORDER[item.bucket], -item.score, item.owner != "Ev", item.title.lower()))

    def pack(bucket: str) -> list[dict[str, Any]]:
        return [asdict(item) for item in selected if item.bucket == bucket]

    payload = {
        "date": date_str,
        "generated_at": generated_at,
        "summary": {
            "total_items": len(selected),
            "collect_total": round(sum((item.amount or 0) for item in selected if item.bucket == "Collect / confirm inbound cash"), 2),
            "pay_total": round(sum((item.amount or 0) for item in selected if item.bucket == "Pay / verify supplier pressure"), 2),
            "watch_total": len([item for item in selected if item.bucket == "Fulfillment / warehouse watch"]),
            "relationship_total": len([item for item in selected if item.bucket == "Onboarding / relationship follow-up"]),
            "do_now": len([item for item in selected if item.urgency == "now"]),
        },
        "do_now": [asdict(item) for item in selected if item.urgency == "now"][:8],
        "collect_confirm": pack("Collect / confirm inbound cash"),
        "pay_verify": pack("Pay / verify supplier pressure"),
        "fulfillment_watch": pack("Fulfillment / warehouse watch"),
        "relationship_followup": pack("Onboarding / relationship follow-up"),
        "all_items": [asdict(item) for item in selected],
    }
    return payload


def _render_item_md(item: dict[str, Any]) -> str:
    meta = [item["surface"], item["owner"], item["due_status"]]
    if item.get("amount") is not None:
        meta.append(_fmt_money(float(item["amount"])))
    if item.get("sources"):
        meta.append("msgs " + ", ".join(item["sources"]))
    return (
        f"**{item['title']}** — {item['detail']} ({'; '.join(meta)})\n"
        f"  - First step: {item['first_step']}\n"
        f"  - Success: {item['success_check']}"
    )


def render_markdown(payload: dict[str, Any]) -> str:
    s = payload["summary"]
    lines = [
        f"# Supplier Ops Desk — {payload['date']}",
        "",
        f"Generated: {payload['generated_at']}",
        "",
        "## Snapshot",
        f"- Collect / confirm inbound cash visible: **{_fmt_money(s['collect_total'])}**",
        f"- Pay / verify supplier pressure visible: **{_fmt_money(s['pay_total'])}**",
        f"- Fulfillment / warehouse watch items: **{s['watch_total']}**",
        f"- Onboarding / relationship follow-ups: **{s['relationship_total']}**",
        f"- Do now: **{s['do_now']}**",
        "",
    ]
    for title, key in [
        ("Do now", "do_now"),
        ("Collect / confirm inbound cash", "collect_confirm"),
        ("Pay / verify supplier pressure", "pay_verify"),
        ("Fulfillment / warehouse watch", "fulfillment_watch"),
        ("Onboarding / relationship follow-up", "relationship_followup"),
    ]:
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
            f"<td>{escape(item['first_step'])}<div class='detail'>{escape(item['detail'])}</div></td>"
            "</tr>"
        )
    return "".join(rows)


def render_html(payload: dict[str, Any]) -> str:
    s = payload["summary"]
    copy_text = "\n".join([
        f"Supplier ops desk — {payload['date']}",
        "",
        *[f"- [ ] {item['title']} — {item['first_step']}" for item in payload['do_now'][:6]],
    ])
    return f"""<!doctype html>
<html lang=\"en\">
<head>
<meta charset=\"utf-8\" />
<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
<title>Supplier Ops Desk — {escape(payload['date'])}</title>
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
  <h1>Supplier Ops Desk</h1>
  <div class=\"muted\">{escape(payload['generated_at'])} · supplier cash, fulfillment watchpoints, and vendor follow-through in one screen</div>
  <p><a href=\"./morning-ops-hub-latest.html\">Open full ops hub</a> · <a href=\"./morning-money-desk-latest.html\">Money desk</a> · <a href=\"../BUSINESS_STATE.md\">Business State</a></p>
  <p><button id=\"copyBtn\">Copy supplier checklist</button></p>
  <div class=\"grid\">
    <div class=\"card\"><div class=\"k\">Collect / confirm</div><div class=\"v\">{escape(_fmt_money(s['collect_total']))}</div></div>
    <div class=\"card\"><div class=\"k\">Pay / verify</div><div class=\"v\">{escape(_fmt_money(s['pay_total']))}</div></div>
    <div class=\"card\"><div class=\"k\">Fulfillment watch</div><div class=\"v\">{s['watch_total']}</div></div>
    <div class=\"card\"><div class=\"k\">Relationship follow-up</div><div class=\"v\">{s['relationship_total']}</div></div>
    <div class=\"card\"><div class=\"k\">Do now</div><div class=\"v\">{s['do_now']}</div></div>
  </div>
  <div class=\"panel\" style=\"margin-top:12px\"><h3>Do now</h3><table><thead><tr><th>Item</th><th>Status</th><th>Owner</th><th>Amount</th><th>Sources</th><th>First step</th></tr></thead><tbody>{_render_rows(payload.get('do_now') or [])}</tbody></table></div>
  <div class=\"two\">
    <div class=\"panel\"><h3>Collect / confirm inbound cash</h3><table><thead><tr><th>Item</th><th>Status</th><th>Owner</th><th>Amount</th><th>Sources</th><th>First step</th></tr></thead><tbody>{_render_rows(payload.get('collect_confirm') or [])}</tbody></table></div>
    <div class=\"panel\"><h3>Pay / verify supplier pressure</h3><table><thead><tr><th>Item</th><th>Status</th><th>Owner</th><th>Amount</th><th>Sources</th><th>First step</th></tr></thead><tbody>{_render_rows(payload.get('pay_verify') or [])}</tbody></table></div>
  </div>
  <div class=\"two\">
    <div class=\"panel\"><h3>Fulfillment / warehouse watch</h3><table><thead><tr><th>Item</th><th>Status</th><th>Owner</th><th>Amount</th><th>Sources</th><th>First step</th></tr></thead><tbody>{_render_rows(payload.get('fulfillment_watch') or [])}</tbody></table></div>
    <div class=\"panel\"><h3>Onboarding / relationship follow-up</h3><table><thead><tr><th>Item</th><th>Status</th><th>Owner</th><th>Amount</th><th>Sources</th><th>First step</th></tr></thead><tbody>{_render_rows(payload.get('relationship_followup') or [])}</tbody></table></div>
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
    parser = argparse.ArgumentParser(description="Build supplier ops desk from BUSINESS_STATE.md")
    parser.add_argument("--date", help="Output date YYYY-MM-DD")
    args = parser.parse_args()

    if not BUSINESS_STATE.exists():
        raise SystemExit(f"Missing {BUSINESS_STATE}")

    now = datetime.now().astimezone()
    date_str = args.date or now.strftime("%Y-%m-%d")
    generated_at = now.strftime("%Y-%m-%d %H:%M %Z")
    payload = build_payload(date_str, generated_at)

    REPORTS.mkdir(parents=True, exist_ok=True)
    md_path = REPORTS / f"supplier-ops-desk-{date_str}.md"
    html_path = REPORTS / f"supplier-ops-desk-{date_str}.html"
    json_path = REPORTS / f"supplier-ops-desk-{date_str}.json"

    md_path.write_text(render_markdown(payload) + "\n", encoding="utf-8")
    html_path.write_text(render_html(payload), encoding="utf-8")
    json_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    _clone_latest(md_path, REPORTS / "supplier-ops-desk-latest.md")
    _clone_latest(html_path, REPORTS / "supplier-ops-desk-latest.html")
    _clone_latest(json_path, REPORTS / "supplier-ops-desk-latest.json")

    print(f"Built {md_path.relative_to(ROOT)}")
    print(f"Built {html_path.relative_to(ROOT)}")
    print(f"Built {json_path.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
