#!/usr/bin/env python3
"""build_deadline_control_desk.py

Build a deadline-first morning desk from BUSINESS_STATE.md.

Outputs:
- reports/deadline-control-desk-YYYY-MM-DD.{md,html,json}
- reports/deadline-control-desk-latest.{md,html,json}
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
DATE_RE = re.compile(r"(20\d{2}-\d{2}-\d{2})")
MONEY_RE = re.compile(r"\$(\d{1,3}(?:,\d{3})*(?:\.\d+)?)")


@dataclass
class DeadlineItem:
    title: str
    detail: str
    lane: str
    owner: str
    surface: str
    status: str
    due_date: str | None
    first_step: str
    success_check: str
    sources: list[str]
    amount: float | None
    score: int


def _clone_latest(versioned: Path, latest: Path) -> None:
    shutil.copyfile(versioned, latest)


def _clean(text: str) -> str:
    return " ".join(text.replace("**", "").split())


def _match_any(text: str, terms: list[str]) -> bool:
    return any(term in text for term in terms)


def _amount(text: str) -> float | None:
    values = [float(m.group(1).replace(",", "")) for m in MONEY_RE.finditer(text)]
    if not values:
        return None
    if "refund" in text.lower() and len(values) > 1:
        return round(sum(values), 2)
    return max(values) if len(values) > 1 else values[0]


def _fmt_money(v: float | None) -> str:
    if v is None:
        return "-"
    if abs(v - round(v)) < 1e-9:
        return f"${int(round(v)):,}"
    return f"${v:,.2f}"


def _due_date(text: str, target: date) -> str | None:
    lower = text.lower()
    if any(name in lower for name in ["gemifly", "garcor", "waterrower", "petite keep"]):
        return None
    if "buy with prime" in lower and "case 20290685991" in lower:
        return "2026-06-12"
    dates = sorted(set(DATE_RE.findall(text)))
    if not dates:
        return None
    future_or_today = [d for d in dates if date.fromisoformat(d) >= target]
    return future_or_today[0] if future_or_today else dates[-1]


def _status(due_date: str | None, target: date, text: str) -> str:
    if due_date is None:
        return "undated"
    delta = (date.fromisoformat(due_date) - target).days
    if delta < 0:
        return f"overdue {abs(delta)}d"
    if delta == 0:
        return "due today"
    if delta == 1:
        return "due tomorrow"
    return f"due in {delta}d"


def _lane(title: str, detail: str) -> str:
    text = f"{title} {detail}".lower()
    if _match_any(text, ["shipbob dg", "hazmat", "walmart", "tracking", "auto-cancel", "shipment", "fulfill/ship", "ship the paid"]):
        return "Shipment / account risk"
    if _match_any(text, ["quickbooks", "beyaz", "bank connection", "statements", "amex", "payment", "invoice", "insurance"]):
        return "Finance / admin"
    if _match_any(text, ["buy with prime", "shopify api", "token", "compliance", "upsell app"]):
        return "Access / compliance"
    if _match_any(text, ["wet work", "champion", "tyler", "quote", "donation", "pricing", "terms"]):
        return "Revenue decision"
    return "Morning follow-up"


def _owner(title: str, detail: str) -> str:
    text = f"{title} {detail}".lower()
    if _match_any(text, ["needs ev", "ev should", "ev handling", "ev decision", "if ev", "confirm whether business"]):
        return "Ev"
    if _match_any(text, ["regenerate", "upload", "cancel", "fulfill", "ship", "quote", "mapping", "browser/api workaround"]):
        return "Operator"
    return "Shared"


def _surface(title: str, detail: str) -> str:
    text = f"{title} {detail}".lower()
    if "a3 partners" in text:
        return "Supplier ledger / bank"
    if "shipbob" in text or "fulfill" in text or "ship the paid" in text:
        return "ShipBob"
    if "walmart" in text:
        return "Walmart Marketplace"
    if "quickbooks" in text:
        return "QuickBooks"
    if "beyaz" in text:
        return "Bank / ClickUp"
    if "buy with prime" in text or "amazon" in text:
        return "Amazon / Seller Central"
    if "shopify" in text or "upsell" in text:
        return "Shopify Admin"
    if "insurance" in text:
        return "Email / insurance"
    if "paypal" in text or "ramp" in text:
        return "PayPal / Ramp / ShipBob"
    return "Email / browser"


def _first_step(title: str, detail: str) -> tuple[str, str]:
    text = f"{title} {detail}".lower()
    if "shipbob dg" in text or "hazmat" in text:
        return (
            "Open ShipBob product review and fill net weight/net volume for product IDs 8696101 and 8696102; confirm the other flagged products are resolved.",
            "Done when ShipBob shows no deadline-blocking DG/HAZMAT review left for the five flagged products.",
        )
    if "walmart" in text:
        return (
            "Open Walmart Marketplace performance/pricing dashboards and decide whether to act on valid-tracking, late-shipment, and suggested price-cut issues.",
            "Done when the Walmart performance/pricing decision is recorded or no action remains.",
        )
    if "a3 partners" in text:
        return (
            "Verify A3's stated open balance against bank/QuickBooks before treating it as internally payable, and calendar invoice 26-05151 for its June due date.",
            "Done when the real payable posture is explicit and the new invoice is parked correctly.",
        )
    if "quickbooks" in text:
        return (
            "Have an authorized user reconnect the expired bank feed in Accounting > Bank transactions, then verify missed transactions start downloading.",
            "Done when QuickBooks shows the connection healthy and recent transactions visible.",
        )
    if "beyaz" in text:
        return (
            "Gather/send all Beyaz bank statements or confirm they were already sent outside visible email/task context.",
            "Done when the ClickUp reminder can be closed with evidence.",
        )
    if "buy with prime" in text:
        return (
            "Open the flagged collection/product URLs and choose the remediation: one active integration plus Collections for Buy with Prime or remove the conflicting Add to Cart CTA.",
            "Done when case 20290685991 has a concrete fix path and the visible storefront no longer conflicts with the widget.",
        )
    if "shopify api token" in text:
        return (
            "Regenerate or replace the dead Shopify API credential, then re-test the inventory-dependent workflow.",
            "Done when inventory visibility is back for the affected tooling.",
        )
    if "gemifly" in text:
        return (
            "Create the paid fulfillment handoff for 815 Gemiflex V1, 10,000 dispensing tips, and 500 Natural Pin Cap EXTRA, keeping PayPal unconfirmed-address caution visible.",
            "Done when the order is released or blocked by a named fulfillment/cash policy issue.",
        )
    if "garcor" in text:
        return (
            "Release only the valid paid invoice 1001-0245 order for 420x 20g Gel; do not duplicate invoice 1001-0244.",
            "Done when one Garcor order is fulfilled and the wrong-card refund context stays preserved.",
        )
    if "waterrower" in text:
        return (
            "Release the paid PO 00039435 order for 15x 16oz CA Medium 700 CPS using unconfirmed-address caution.",
            "Done when tracking exists or the exact fulfillment blocker is recorded.",
        )
    if "petite keep" in text:
        return (
            "Confirm internal cash-clearance policy on the Ramp receipt, then ship exactly 60x 16oz Medium to 1093 N Warson Rd.",
            "Done when shipment is released only to the confirmed St Louis address.",
        )
    if "wet work" in text:
        return (
            "Get pricing/terms approval for the 80x 16oz Ultra Thin wholesale account reply.",
            "Done when the draft can be sent without pricing ambiguity.",
        )
    if "champion fiberglass" in text:
        return (
            "Map the requested 52x 2g 4 ct 1500 CPS product to sellable Glue Masters SKU/pack truth and prepare the quote.",
            "Done when product mapping and price are ready to send.",
        )
    if "tyler panzer" in text or "tjp art" in text:
        return (
            "Decide whether to support the July 25 gallery-show donation and, if yes, what samples/promotional material to send.",
            "Done when the yes/no and sample bundle are explicit.",
        )
    if "insurance" in text:
        return (
            "Confirm whether sales pace/product mix changed materially from the estimated $900k annual sales posture.",
            "Done when Ashlin Hadden has either a no-change confirmation or updated business/product details.",
        )
    return (
        "Open the source system and reduce this item to one executable next action.",
        "Done when the blocker, owner, and completion evidence are explicit.",
    )


def _manual_items() -> list[Item]:
    return [
        Item(
            title="ShipBob DG/HAZMAT product review",
            detail="ShipBob says flagged DG/HAZMAT items must be reviewed/resolved by 2026-05-19 or affected products may experience order delays, order holds, or inventory quarantine. Product IDs 8696101 and 8696102 need net weight and net volume filled in; ShipBob says 5 products need review total. Source: gluemasters msg 192586.",
            source_section="urgent",
            sources=["192586"],
            amount=None,
            tags=["needs_ev"],
            draft_paths=[],
        )
    ]


def _is_candidate(item: Item) -> bool:
    text = f"{item.title} {item.detail}".lower()
    if any(tok in text for tok in ["do not resurface", "passive monitoring", "receipt-only"]):
        return False
    if "api behavior change" in text or "get /v3/inventories" in text:
        return False
    terms = [
        "2026-05-19",
        "shipbob dg",
        "hazmat",
        "walmart",
        "quickbooks",
        "beyaz",
        "buy with prime",
        "insurance midterm",
        "shopify api token",
        "gemifly",
        "garcor",
        "waterrower",
        "petite keep",
        "wet work",
        "champion fiberglass",
        "tyler panzer",
        "tjp art",
    ]
    return _match_any(text, terms)


def build_payload(date_str: str, generated_at: str) -> dict[str, Any]:
    target = date.fromisoformat(date_str)
    rendered: list[DeadlineItem] = []
    seen: set[tuple[str, str]] = set()

    for item in [*parse_business_state(BUSINESS_STATE), *_manual_items()]:
        if not _is_candidate(item):
            continue
        key = (item.title, item.detail)
        if key in seen:
            continue
        seen.add(key)
        detail = _clean(item.detail)
        full_text = f"{item.title} {detail}"
        due = _due_date(full_text, target)
        status = _status(due, target, full_text)
        lane = _lane(item.title, detail)
        first_step, success = _first_step(item.title, detail)
        amount = item.amount if item.amount is not None else _amount(f"{item.title} {detail}")
        score = 0
        if status == "due today":
            score += 12
        elif status.startswith("overdue"):
            score += 10
        elif status == "due tomorrow":
            score += 7
        if lane == "Shipment / account risk":
            score += 7
        elif lane in {"Finance / admin", "Access / compliance"}:
            score += 5
        elif lane == "Revenue decision":
            score += 3
        if amount:
            score += min(int(amount // 1000), 6)
        rendered.append(DeadlineItem(
            title=item.title,
            detail=detail,
            lane=lane,
            owner=_owner(item.title, detail),
            surface=_surface(item.title, detail),
            status=status,
            due_date=due,
            first_step=first_step,
            success_check=success,
            sources=item.sources,
            amount=amount,
            score=score,
        ))

    lane_order = {
        "Shipment / account risk": 0,
        "Finance / admin": 1,
        "Access / compliance": 2,
        "Revenue decision": 3,
        "Morning follow-up": 4,
    }
    def status_rank(value: str) -> int:
        if value == "due today":
            return 0
        if value.startswith("overdue"):
            return 1
        if value == "due tomorrow":
            return 2
        if value.startswith("due in"):
            return 3
        return 4

    rendered.sort(key=lambda x: (lane_order.get(x.lane, 9), status_rank(x.status), -x.score, x.owner != "Operator", x.title.lower()))

    def lane_items(lane: str) -> list[dict[str, Any]]:
        return [asdict(x) for x in rendered if x.lane == lane]

    return {
        "date": date_str,
        "generated_at": generated_at,
        "summary": {
            "total_items": len(rendered),
            "due_today": sum(1 for x in rendered if x.status == "due today"),
            "overdue": sum(1 for x in rendered if x.status.startswith("overdue")),
            "operator_owned": sum(1 for x in rendered if x.owner == "Operator"),
            "ev_owned": sum(1 for x in rendered if x.owner == "Ev"),
            "shipment_risk": len(lane_items("Shipment / account risk")),
            "finance_admin": len(lane_items("Finance / admin")),
            "access_compliance": len(lane_items("Access / compliance")),
            "revenue_decision": len(lane_items("Revenue decision")),
        },
        "do_first": [asdict(x) for x in rendered[:8]],
        "shipment_account_risk": lane_items("Shipment / account risk"),
        "finance_admin": lane_items("Finance / admin"),
        "access_compliance": lane_items("Access / compliance"),
        "revenue_decision": lane_items("Revenue decision"),
        "all_items": [asdict(x) for x in rendered],
    }


def _item_md(item: dict[str, Any]) -> str:
    meta = [item["status"], item["surface"], item["owner"]]
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
        f"# Deadline Control Desk — {payload['date']}",
        "",
        f"Generated: {payload['generated_at']}",
        "",
        "## Snapshot",
        f"- Total deadline items: **{s['total_items']}**",
        f"- Due today: **{s['due_today']}**",
        f"- Overdue: **{s['overdue']}**",
        f"- Operator-owned: **{s['operator_owned']}**",
        f"- Ev-owned: **{s['ev_owned']}**",
        "",
    ]
    for title, key in [
        ("Do first", "do_first"),
        ("Shipment / account risk", "shipment_account_risk"),
        ("Finance / admin", "finance_admin"),
        ("Access / compliance", "access_compliance"),
        ("Revenue decision", "revenue_decision"),
    ]:
        lines.append(f"## {title}")
        items = payload.get(key) or []
        if not items:
            lines.append("- None surfaced.")
        else:
            for item in items:
                lines.append(f"- {_item_md(item)}")
        lines.append("")
    return "\n".join(lines)


def _rows(items: list[dict[str, Any]]) -> str:
    if not items:
        return "<tr><td colspan='6' class='muted'>Nothing surfaced.</td></tr>"
    out = []
    for item in items:
        out.append(
            "<tr>"
            f"<td>{escape(item['title'])}</td>"
            f"<td>{escape(item['status'])}</td>"
            f"<td>{escape(item['surface'])}</td>"
            f"<td>{escape(item['owner'])}</td>"
            f"<td>{escape(_fmt_money(float(item['amount'])) if item.get('amount') is not None else '-')}</td>"
            f"<td>{escape(item['first_step'])}<div class='detail'>{escape(item['detail'])}</div></td>"
            "</tr>"
        )
    return "".join(out)


def render_html(payload: dict[str, Any]) -> str:
    s = payload["summary"]
    copy_text = "\n".join([
        f"Deadline control stack - {payload['date']}",
        "",
        *[f"- [ ] {item['title']} - {item['first_step']}" for item in payload["do_first"][:8]],
    ])
    return f"""<!doctype html>
<html lang=\"en\">
<head>
<meta charset=\"utf-8\" />
<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
<title>Deadline Control Desk - {escape(payload['date'])}</title>
<style>
:root {{--bg:#0A1628;--surface:#111B2E;--border:#1E293B;--text:#fff;--muted:#94A3B8;--accent:#3B82F6;--risk:#f97316;}}
*{{box-sizing:border-box}} body{{margin:0;padding:24px;background:var(--bg);color:var(--text);font-family:Inter,-apple-system,sans-serif}}
.wrap{{max-width:1280px;margin:0 auto}} .grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px}}
.card,.panel{{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:14px}}
.k{{color:var(--muted);font-size:12px}} .v{{font-size:26px;font-weight:750;margin-top:4px}} .muted,.detail{{color:var(--muted)}} .detail{{margin-top:4px}}
.two{{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}} @media (max-width: 960px){{.two{{grid-template-columns:1fr}}}}
table{{width:100%;border-collapse:collapse;font-size:13px}} th,td{{padding:8px;border-bottom:1px solid var(--border);text-align:left;vertical-align:top}} th{{color:var(--muted);font-size:11px;text-transform:uppercase}}
button{{background:var(--accent);border:none;color:white;border-radius:8px;padding:8px 10px;font-weight:650;cursor:pointer}} a{{color:#93C5FD}}
</style>
</head>
<body>
<div class=\"wrap\">
  <h1>Deadline Control Desk</h1>
  <div class=\"muted\">{escape(payload['generated_at'])} · date-driven control surface for the first morning pass</div>
  <p><a href=\"./morning-ops-hub-latest.html\">Open full ops hub</a> · <a href=\"./supplier-ops-desk-latest.html\">Supplier ops</a> · <a href=\"./morning-money-desk-latest.html\">Money desk</a></p>
  <p><button id=\"copyBtn\">Copy first-pass checklist</button></p>
  <div class=\"grid\">
    <div class=\"card\"><div class=\"k\">Total items</div><div class=\"v\">{s['total_items']}</div></div>
    <div class=\"card\"><div class=\"k\">Due today</div><div class=\"v\">{s['due_today']}</div></div>
    <div class=\"card\"><div class=\"k\">Overdue</div><div class=\"v\">{s['overdue']}</div></div>
    <div class=\"card\"><div class=\"k\">Shipment risk</div><div class=\"v\">{s['shipment_risk']}</div></div>
    <div class=\"card\"><div class=\"k\">Finance/admin</div><div class=\"v\">{s['finance_admin']}</div></div>
  </div>
  <div class=\"panel\" style=\"margin-top:12px\"><h3>Do first</h3><table><thead><tr><th>Item</th><th>Status</th><th>Surface</th><th>Owner</th><th>Amount</th><th>First step</th></tr></thead><tbody>{_rows(payload.get('do_first') or [])}</tbody></table></div>
  <div class=\"two\">
    <div class=\"panel\"><h3>Shipment / account risk</h3><table><thead><tr><th>Item</th><th>Status</th><th>Surface</th><th>Owner</th><th>Amount</th><th>First step</th></tr></thead><tbody>{_rows(payload.get('shipment_account_risk') or [])}</tbody></table></div>
    <div class=\"panel\"><h3>Finance / admin</h3><table><thead><tr><th>Item</th><th>Status</th><th>Surface</th><th>Owner</th><th>Amount</th><th>First step</th></tr></thead><tbody>{_rows(payload.get('finance_admin') or [])}</tbody></table></div>
  </div>
  <div class=\"two\">
    <div class=\"panel\"><h3>Access / compliance</h3><table><thead><tr><th>Item</th><th>Status</th><th>Surface</th><th>Owner</th><th>Amount</th><th>First step</th></tr></thead><tbody>{_rows(payload.get('access_compliance') or [])}</tbody></table></div>
    <div class=\"panel\"><h3>Revenue decision</h3><table><thead><tr><th>Item</th><th>Status</th><th>Surface</th><th>Owner</th><th>Amount</th><th>First step</th></tr></thead><tbody>{_rows(payload.get('revenue_decision') or [])}</tbody></table></div>
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
    parser = argparse.ArgumentParser(description="Build deadline control desk from BUSINESS_STATE.md")
    parser.add_argument("--date", help="Output date YYYY-MM-DD")
    args = parser.parse_args()

    now = datetime.now().astimezone()
    date_str = args.date or now.strftime("%Y-%m-%d")
    generated_at = now.strftime("%Y-%m-%d %H:%M %Z")
    payload = build_payload(date_str, generated_at)

    REPORTS.mkdir(parents=True, exist_ok=True)
    md_path = REPORTS / f"deadline-control-desk-{date_str}.md"
    html_path = REPORTS / f"deadline-control-desk-{date_str}.html"
    json_path = REPORTS / f"deadline-control-desk-{date_str}.json"

    md_path.write_text(render_markdown(payload) + "\n", encoding="utf-8")
    html_path.write_text(render_html(payload), encoding="utf-8")
    json_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    _clone_latest(md_path, REPORTS / "deadline-control-desk-latest.md")
    _clone_latest(html_path, REPORTS / "deadline-control-desk-latest.html")
    _clone_latest(json_path, REPORTS / "deadline-control-desk-latest.json")

    print(f"Built {md_path.relative_to(ROOT)}")
    print(f"Built {html_path.relative_to(ROOT)}")
    print(f"Built {json_path.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
