#!/usr/bin/env python3
"""build_order_ops_desk.py

Build a morning order-closure desk from BUSINESS_STATE.md.

Outputs:
- reports/order-ops-desk-YYYY-MM-DD.md
- reports/order-ops-desk-YYYY-MM-DD.html
- reports/order-ops-desk-YYYY-MM-DD.json
- reports/order-ops-handoff-YYYY-MM-DD.csv
- reports/order-ops-desk-latest.md/html/json
- reports/order-ops-handoff-latest.csv
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import shutil
from dataclasses import asdict, dataclass
from datetime import datetime
from html import escape
from pathlib import Path
from typing import Any

from build_decision_brief import Item, parse_business_state

ROOT = Path(__file__).resolve().parents[1]
REPORTS = ROOT / "reports"
BUSINESS_STATE = ROOT / "BUSINESS_STATE.md"


@dataclass
class OrderOpsItem:
    title: str
    detail: str
    bucket: str
    urgency: str
    owner: str
    first_step: str
    success_check: str
    amount: float | None
    due_date: str | None
    due_status: str
    sources: list[str]
    refs: list[str]
    score: int


def _clone_latest(versioned: Path, latest: Path) -> None:
    shutil.copyfile(versioned, latest)


def _fmt_money(value: float | int | None) -> str:
    if value is None:
        return "-"
    value = float(value)
    if abs(value - round(value)) < 1e-9:
        return f"${int(round(value)):,}"
    return f"${value:,.2f}"


def _plain(text: str) -> str:
    text = re.sub(r"`([^`]+)`", r"\1", text)
    text = text.replace("**", "")
    return re.sub(r"\s+", " ", text).strip()


def _refs(text: str) -> list[str]:
    patterns = [
        r"\border\s+#?([A-Z0-9-]{4,})",
        r"\bPO\s+#?([A-Z0-9-]{4,})",
        r"\binvoice\s+([A-Z0-9/-]{4,})",
        r"\btracking\s+([A-Z0-9]{10,})",
        r"\b(SO\d{4,})\b",
        r"\b(INV/\d{4}/\d{2}/\d{6})\b",
    ]
    out: list[str] = []
    seen: set[str] = set()
    for pattern in patterns:
        for match in re.findall(pattern, text, flags=re.I):
            value = match.strip(" .,;:")
            if value not in seen:
                out.append(value)
                seen.add(value)
    return out


def _extract_sources(text: str) -> list[str]:
    out: list[str] = []
    seen: set[str] = set()
    for block in re.findall(r"msgs?\s+((?:\*\*\d+\*\*(?:,\s*)?)+|(?:\d+(?:,\s*\d+)*))", text, flags=re.I):
        for num in re.findall(r"\d+", block):
            if num not in seen:
                out.append(num)
                seen.add(num)
    return out


def _manual_h3_items() -> list[Item]:
    text = BUSINESS_STATE.read_text(encoding="utf-8")
    wanted = {"Walmart Marketplace performance/pricing"}
    items: list[Item] = []
    for title in wanted:
        pattern = rf"^### {re.escape(title)}\n(?P<body>.*?)(?=^### |\n## |\Z)"
        match = re.search(pattern, text, flags=re.M | re.S)
        if not match:
            continue
        body = " ".join(
            line.strip()[2:].strip() if line.strip().startswith("- ") else line.strip()
            for line in match.group("body").splitlines()
            if line.strip()
        )
        items.append(Item(
            title=title,
            detail=body,
            source_section="urgent",
            sources=_extract_sources(body),
            amount=None,
            tags=["customer", "verify"],
            draft_paths=[],
        ))
    return items


def _due_date(text: str) -> str | None:
    matches = re.findall(r"\b(20\d{2}-\d{2}-\d{2})\b", text)
    if not matches:
        return None
    return min(matches)


def _bucket(text: str) -> str | None:
    lower = text.lower()
    if any(tok in lower for tok in ["walmart", "auto-cancel", "cancellation request", "valid tracking"]):
        return "Marketplace firebreak"
    if any(tok in lower for tok in ["shipux", "tracking update", "customer is waiting for tracking"]):
        return "Customer tracking closure"
    if any(tok in lower for tok in ["larry trammell", "justin schuhmann", "thomas oconnell", "ethan miller"]):
        return "Customer promise closure"
    if any(tok in lower for tok in ["watch for payment before treating as paid", "watch for payment"]):
        return "Cash and invoice verification"
    if any(tok in lower for tok in ["fulfill", "ship the paid", "ready for fulfillment", "paid order", "ship only to"]):
        return "Paid fulfillment release"
    if any(tok in lower for tok in ["buy with prime", "shopify api token", "quickbooks", "bank connection"]):
        return "Access and compliance unblock"
    if any(tok in lower for tok in ["invoice", "open balance", "deposit/review", "payment", "payout"]):
        return "Cash and invoice verification"
    return None


def _owner(item: Item, bucket: str) -> str:
    text = f"{item.title} {item.detail}".lower()
    if bucket == "Marketplace firebreak":
        return "Operator"
    if "needs ev" in item.tags or any(tok in text for tok in ["decide", "decision", "reauthorizes", "regeneration", "authorized"]):
        return "Ev"
    if bucket in {"Marketplace firebreak", "Customer tracking closure", "Customer promise closure"}:
        return "Operator"
    if bucket == "Paid fulfillment release":
        return "Shared"
    return "Ev"


def _urgency(text: str, bucket: str, due: str | None) -> str:
    lower = text.lower()
    if any(tok in lower for tok in ["today", "past expected ship date", "auto-cancel", "customer is waiting", "followed up again"]):
        return "now"
    if due and due <= "2026-05-27":
        return "soon"
    if bucket in {"Marketplace firebreak", "Customer tracking closure"}:
        return "now"
    if bucket == "Customer promise closure" and any(tok in lower for tok in ["replacement", "follow-up", "followed up", "not created", "keeps getting glued"]):
        return "now"
    return "next"


def _first_step(item: Item, bucket: str) -> str:
    title = item.title.lower()
    text = f"{item.title} {item.detail}".lower()
    if "walmart" in title or "walmart" in text:
        return "Open Seller Center unshipped/cancellation queues, identify the fresh past-ship-date order, then either upload valid tracking or cancel it."
    if "larry trammell" in title:
        return "Verify whether Larry's replacement nozzle/bottle shipped; if not, create the replacement shipment and capture tracking."
    if "justin schuhmann" in title:
        return "Decide whether to send a replacement 8oz cap/lid or a replacement bottle path, then reply with the concrete path."
    if "shipux" in title:
        return "Send the waiting customer UPS tracking 1ZYV02810391168524, then verify Shipux invoice INV/2026/05/001308 is paid or queued."
    if "quickbooks" in title:
        return "Reauthorize the bank connection in QuickBooks so missed transactions can download."
    if "shopify api token" in title:
        return "Regenerate the Shopify API token or use authenticated browser access as the inventory visibility fallback."
    if "buy with prime" in title:
        return "Choose the remediation path: keep only one integration active and remove or replace the incorrect Add to Cart path."
    if "a3 partners" in title:
        return "Compare A3's open-balance statement against bank/QuickBooks truth before treating the supplier balance as payable."
    if bucket == "Paid fulfillment release":
        return "Turn the paid order into a warehouse handoff with address/payment caveats visible before release."
    if bucket == "Cash and invoice verification":
        return "Verify the payment, invoice, or payout in its source system and mark whether it is collect, pay, or passive watch."
    return "Open the source thread/system and reduce this to one concrete close-out action."


def _success_check(item: Item, bucket: str) -> str:
    title = item.title.lower()
    if "walmart" in title:
        return "Done when the cancellation request and fresh auto-cancel warning both have explicit tracking/cancel states."
    if "larry trammell" in title:
        return "Done when Larry has tracking or the shipment blocker is explicit."
    if "justin schuhmann" in title:
        return "Done when Justin has a reply with a replacement cap/lid or replacement-bottle path."
    if "shipux" in title:
        return "Done when the customer has tracking and the $36.92 Shipux invoice state is known."
    if bucket == "Paid fulfillment release":
        return "Done when the order is shipped, queued to ship, or explicitly held with the reason."
    if bucket == "Access and compliance unblock":
        return "Done when the login/compliance blocker has a chosen path and next credentialed action."
    return "Done when the owner, source evidence, and completion state are explicit."


def _score(item: Item, bucket: str, urgency: str) -> int:
    text = f"{item.title} {item.detail}".lower()
    score = 0
    if urgency == "now":
        score += 8
    elif urgency == "soon":
        score += 4
    if bucket == "Marketplace firebreak":
        score += 8
    elif bucket in {"Customer promise closure", "Customer tracking closure"}:
        score += 7
    elif bucket == "Paid fulfillment release":
        score += 5
    elif bucket == "Access and compliance unblock":
        score += 4
    if any(tok in text for tok in ["followed up again", "customer is waiting", "past expected ship date", "suspension"]):
        score += 4
    if item.amount:
        score += min(int(item.amount // 500) + 1, 5)
    if item.sources:
        score += 1
    return score


def _derive(item: Item) -> OrderOpsItem | None:
    raw = f"{item.title} {item.detail}"
    lower = raw.lower()
    title_lower = item.title.lower()
    allowed_sections = {"urgent", "queue"}
    allowed_system_titles = {"shopify api token"}
    if item.source_section not in allowed_sections and title_lower not in allowed_system_titles:
        return None
    if "walmart marketplace performance/pricing" not in title_lower and any(tok in lower for tok in [
        "low-priority",
        "low priority",
        "unless ev wants",
        "unless ev recognizes",
        "treat complaint as resolved",
        "resolved/warm",
        "auto-submitted the response",
        "bank decision may take",
        "no immediate action remains",
        "completion notice later arrived",
        "passive monitoring",
    ]):
        return None
    if title_lower == "walmart marketplace announced a **2026-06-01** api behavior change for `get /v3/inventories`: sequential cursor pagination will be enforced, and parallel/out-of-order cursor requests will return `400`.":
        return None
    bucket = _bucket(raw)
    if not bucket:
        return None
    # Avoid bringing resolved/passive-only records back into the closure desk.
    lower = raw.lower()
    if "walmart marketplace performance/pricing" not in title_lower and (
        "do not resurface" in lower or ("passive monitoring" in lower and "unless" in lower)
    ):
        return None
    due = _due_date(raw)
    urgency = _urgency(raw, bucket, due)
    return OrderOpsItem(
        title=item.title,
        detail=item.detail,
        bucket=bucket,
        urgency=urgency,
        owner=_owner(item, bucket),
        first_step=_first_step(item, bucket),
        success_check=_success_check(item, bucket),
        amount=item.amount,
        due_date=due,
        due_status="dated" if due else ("due now" if urgency == "now" else "undated"),
        sources=item.sources,
        refs=_refs(raw),
        score=_score(item, bucket, urgency),
    )


def build_payload(date_str: str, generated_at: str) -> dict[str, Any]:
    parsed = parse_business_state(BUSINESS_STATE)
    parsed_titles = {item.title for item in parsed}
    parsed.extend(item for item in _manual_h3_items() if item.title not in parsed_titles)
    items = [_derive(item) for item in parsed]
    order_items = [item for item in items if item is not None]
    order_items.sort(key=lambda item: (-item.score, item.urgency, item.title.lower()))
    buckets = sorted(set(item.bucket for item in order_items))
    by_bucket = {
        bucket: [asdict(item) for item in order_items if item.bucket == bucket]
        for bucket in buckets
    }
    do_now = [item for item in order_items if item.urgency == "now"]
    ev_needed = [item for item in order_items if item.owner == "Ev"]
    return {
        "date": date_str,
        "generated_at": generated_at,
        "summary": {
            "total_items": len(order_items),
            "do_now": len(do_now),
            "ev_needed": len(ev_needed),
            "marketplace_firebreak": len(by_bucket.get("Marketplace firebreak", [])),
            "customer_closure": len(by_bucket.get("Customer promise closure", [])) + len(by_bucket.get("Customer tracking closure", [])),
            "paid_fulfillment": len(by_bucket.get("Paid fulfillment release", [])),
            "cash_verify_total": round(sum(item.amount or 0 for item in order_items), 2),
        },
        "do_now": [asdict(item) for item in do_now[:12]],
        "by_bucket": by_bucket,
        "all_items": [asdict(item) for item in order_items],
    }


def _item_md(item: dict[str, Any]) -> str:
    meta: list[str] = [item["bucket"], item["owner"], item["urgency"]]
    if item.get("amount"):
        meta.append(_fmt_money(item["amount"]))
    if item.get("refs"):
        meta.append("refs " + ", ".join(item["refs"][:3]))
    if item.get("sources"):
        meta.append("msgs " + ", ".join(item["sources"]))
    return (
        f"**{item['title']}** - {_plain(item['detail'])} ({'; '.join(meta)})\n"
        f"  - First step: {item['first_step']}\n"
        f"  - Success: {item['success_check']}"
    )


def render_markdown(payload: dict[str, Any]) -> str:
    summary = payload["summary"]
    lines = [
        f"# Order Ops Closure Desk - {payload['date']}",
        "",
        f"Generated: {payload['generated_at']}",
        "",
        "## Snapshot",
        f"- Closure items: **{summary['total_items']}**",
        f"- Do-now items: **{summary['do_now']}**",
        f"- Needs Ev / credentialed owner: **{summary['ev_needed']}**",
        f"- Marketplace firebreaks: **{summary['marketplace_firebreak']}**",
        f"- Customer closure items: **{summary['customer_closure']}**",
        f"- Paid fulfillment releases: **{summary['paid_fulfillment']}**",
        f"- Visible cash/invoice amount: **{_fmt_money(summary['cash_verify_total'])}**",
        "",
        "## Do Now",
    ]
    for item in payload["do_now"]:
        lines.append(f"- {_item_md(item)}")
    if not payload["do_now"]:
        lines.append("- None")
    for bucket, items in payload["by_bucket"].items():
        lines.extend(["", f"## {bucket}"])
        for item in items:
            lines.append(f"- {_item_md(item)}")
    return "\n".join(lines) + "\n"


def render_html(payload: dict[str, Any]) -> str:
    summary = payload["summary"]
    cards = [
        ("Closure items", summary["total_items"]),
        ("Do now", summary["do_now"]),
        ("Needs Ev", summary["ev_needed"]),
        ("Marketplace", summary["marketplace_firebreak"]),
        ("Customer closure", summary["customer_closure"]),
        ("Paid fulfillment", summary["paid_fulfillment"]),
        ("Cash visible", _fmt_money(summary["cash_verify_total"])),
    ]
    cards_html = "".join(
        f"<div class='card'><div class='k'>{escape(label)}</div><div class='v'>{escape(str(value))}</div></div>"
        for label, value in cards
    )

    def render_items(items: list[dict[str, Any]]) -> str:
        if not items:
            return "<li class='muted'>Nothing surfaced.</li>"
        rows = []
        for item in items:
            refs = ", ".join(item.get("refs") or [])
            sources = ", ".join(item.get("sources") or [])
            meta = " · ".join(part for part in [
                item["bucket"],
                item["owner"],
                item["urgency"],
                _fmt_money(item.get("amount")) if item.get("amount") else "",
                f"refs {refs}" if refs else "",
                f"msgs {sources}" if sources else "",
            ] if part)
            rows.append(
                "<li>"
                f"<div><b>{escape(item['title'])}</b> <span class='badge'>{escape(meta)}</span></div>"
                f"<div class='detail'>{escape(_plain(item['detail']))}</div>"
                f"<div class='steps'><b>First:</b> {escape(item['first_step'])}<br><b>Done:</b> {escape(item['success_check'])}</div>"
                "</li>"
            )
        return "".join(rows)

    bucket_sections = "".join(
        f"<section class='panel'><h2>{escape(bucket)}</h2><ul>{render_items(items)}</ul></section>"
        for bucket, items in payload["by_bucket"].items()
    )
    copy_text = "\n".join(
        f"- [ ] {item['title']}: {item['first_step']}"
        for item in payload["do_now"][:8]
    )
    data_json = json.dumps(payload, ensure_ascii=False)
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Order Ops Closure Desk - {escape(payload['date'])}</title>
<style>
:root{{--bg:#0A1628;--surface:#111B2E;--surface2:#0F1A2C;--border:#1E293B;--text:#fff;--muted:#94A3B8;--accent:#3B82F6;--good:#22c55e;--warn:#f59e0b;}}
*{{box-sizing:border-box}} body{{margin:0;padding:24px;background:var(--bg);color:var(--text);font-family:Inter,-apple-system,sans-serif}}
.wrap{{max-width:1240px;margin:0 auto}} h1{{margin:0 0 6px}} h2{{margin:0 0 8px;font-size:18px}}
.muted,.detail{{color:var(--muted)}} .detail{{margin-top:4px;line-height:1.45}}
a{{color:#93C5FD}} .links{{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0 18px}}
.link{{background:#102446;border:1px solid var(--border);border-radius:8px;padding:6px 10px;text-decoration:none;font-size:13px}}
.grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:14px 0 18px}}
.card,.panel{{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:14px}}
.k{{color:var(--muted);font-size:12px}} .v{{font-size:24px;font-weight:760;margin-top:4px}}
.two{{display:grid;grid-template-columns:1fr 1fr;gap:12px}} @media(max-width:900px){{.two{{grid-template-columns:1fr}}}}
ul{{margin:8px 0 0 18px;padding:0}} li{{margin:10px 0}} .steps{{margin-top:6px;color:#dbeafe;line-height:1.45}}
.badge{{display:inline-block;border:1px solid var(--border);border-radius:999px;padding:2px 8px;font-size:12px;color:var(--muted);font-weight:500}}
button{{background:var(--accent);border:none;color:white;border-radius:8px;padding:8px 10px;font-weight:700;cursor:pointer}}
input{{background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:8px 10px;color:var(--text);min-width:260px}}
table{{width:100%;border-collapse:collapse;font-size:13px}} th,td{{border-bottom:1px solid var(--border);padding:8px;text-align:left;vertical-align:top}} th{{color:var(--muted);font-size:11px;text-transform:uppercase}}
</style>
</head>
<body>
<div class="wrap">
  <h1>Order Ops Closure Desk</h1>
  <div class="muted">{escape(payload['generated_at'])} - shipment, customer, marketplace, and access blockers for the first work block.</div>
  <div class="links">
    <a class="link" href="./morning-ops-hub-latest.html">Morning Ops Hub</a>
    <a class="link" href="./morning-customer-desk-latest.html">Customer Desk</a>
    <a class="link" href="./supplier-ops-desk-latest.html">Supplier Ops Desk</a>
    <a class="link" href="./order-ops-handoff-latest.csv">Handoff CSV</a>
    <a class="link" href="../BUSINESS_STATE.md">Business State</a>
  </div>
  <button id="copyBtn">Copy do-now checklist</button>
  <div class="grid">{cards_html}</div>
  <div class="two">
    <section class="panel"><h2>Do Now</h2><ul>{render_items(payload['do_now'])}</ul></section>
    <section class="panel"><h2>Morning Rule</h2><ul>
      <li>Close customer-visible promises before passive money/watch items.</li>
      <li>Do not resurface resolved Walmart PO 119113590713297 unless fresh evidence appears.</li>
      <li>Louise remains passive chargeback wait unless Shopify or Louise sends fresh evidence.</li>
    </ul></section>
  </div>
  {bucket_sections}
  <section class="panel">
    <h2>All Items</h2>
    <input id="search" placeholder="Search owner, order, source, bucket" />
    <table><thead><tr><th>#</th><th>Bucket</th><th>Owner</th><th>Item</th><th>First Step</th><th>Score</th></tr></thead><tbody id="rows"></tbody></table>
  </section>
</div>
<script>
const DATA = {data_json};
const copyText = {json.dumps(copy_text)};
document.getElementById('copyBtn').addEventListener('click', () => navigator.clipboard.writeText(copyText).catch(() => window.prompt('Copy this text:', copyText)));
function drawRows() {{
  const q = (document.getElementById('search').value || '').toLowerCase();
  const rows = DATA.all_items.filter(item => JSON.stringify(item).toLowerCase().includes(q)).map((item, idx) =>
    `<tr><td>${{idx + 1}}</td><td>${{item.bucket}}</td><td>${{item.owner}}</td><td><b>${{item.title}}</b><div class='muted'>${{(item.refs||[]).join(', ')}}</div></td><td>${{item.first_step}}</td><td>${{item.score}}</td></tr>`
  ).join('');
  document.getElementById('rows').innerHTML = rows || "<tr><td colspan='6' class='muted'>No matching items.</td></tr>";
}}
document.getElementById('search').addEventListener('input', drawRows);
drawRows();
</script>
</body>
</html>
"""


def write_csv(payload: dict[str, Any], path: Path) -> None:
    with path.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(
            fh,
            fieldnames=["priority", "bucket", "urgency", "owner", "title", "first_step", "success_check", "amount", "refs", "sources"],
        )
        writer.writeheader()
        for idx, item in enumerate(payload["all_items"], 1):
            writer.writerow({
                "priority": idx,
                "bucket": item["bucket"],
                "urgency": item["urgency"],
                "owner": item["owner"],
                "title": item["title"],
                "first_step": item["first_step"],
                "success_check": item["success_check"],
                "amount": item.get("amount") or "",
                "refs": "; ".join(item.get("refs") or []),
                "sources": "; ".join(item.get("sources") or []),
            })


def main() -> int:
    parser = argparse.ArgumentParser(description="Build order ops closure desk from BUSINESS_STATE.md")
    parser.add_argument("--date", help="Output date YYYY-MM-DD")
    args = parser.parse_args()

    now = datetime.now().astimezone()
    date_str = args.date or now.strftime("%Y-%m-%d")
    generated_at = now.strftime("%Y-%m-%d %H:%M %Z")
    payload = build_payload(date_str, generated_at)
    REPORTS.mkdir(parents=True, exist_ok=True)

    md_path = REPORTS / f"order-ops-desk-{date_str}.md"
    html_path = REPORTS / f"order-ops-desk-{date_str}.html"
    json_path = REPORTS / f"order-ops-desk-{date_str}.json"
    csv_path = REPORTS / f"order-ops-handoff-{date_str}.csv"

    md_path.write_text(render_markdown(payload), encoding="utf-8")
    html_path.write_text(render_html(payload), encoding="utf-8")
    json_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    write_csv(payload, csv_path)

    _clone_latest(md_path, REPORTS / "order-ops-desk-latest.md")
    _clone_latest(html_path, REPORTS / "order-ops-desk-latest.html")
    _clone_latest(json_path, REPORTS / "order-ops-desk-latest.json")
    _clone_latest(csv_path, REPORTS / "order-ops-handoff-latest.csv")

    print(f"Built {md_path.relative_to(ROOT)}")
    print(f"Built {html_path.relative_to(ROOT)}")
    print(f"Built {json_path.relative_to(ROOT)}")
    print(f"Built {csv_path.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
