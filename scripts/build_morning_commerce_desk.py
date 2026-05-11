#!/usr/bin/env python3
"""build_morning_commerce_desk.py

Build a morning commerce desk from BUSINESS_STATE.md.

Focus:
- catalog truth / inventory visibility blockers
- marketplace guardrails
- conversion backlog
- launch / merchandising assets

Outputs:
- reports/morning-commerce-desk-YYYY-MM-DD.md
- reports/morning-commerce-desk-YYYY-MM-DD.html
- reports/morning-commerce-desk-YYYY-MM-DD.json
- reports/morning-commerce-desk-latest.md
- reports/morning-commerce-desk-latest.html
- reports/morning-commerce-desk-latest.json
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

from build_decision_brief import Item, parse_business_state

ROOT = Path(__file__).resolve().parents[1]
REPORTS = ROOT / "reports"
BUSINESS_STATE = ROOT / "BUSINESS_STATE.md"


@dataclass
class CommerceItem:
    title: str
    detail: str
    bucket: str
    surface: str
    owner: str
    urgency: str
    score: int
    first_step: str
    success_check: str
    source_section: str
    sources: list[str]
    amount: float | None = None


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


def _match_any(text: str, terms: list[str]) -> bool:
    lt = text.lower()
    return any(term in lt for term in terms)


def _surface(text: str) -> str:
    if _match_any(text, ["shopify", "opinew", "bundle", "back-in-stock", "refund policy"]):
        return "Shopify Admin"
    if _match_any(text, ["walmart", "buy box", "price competitiveness", "late origin scan"]):
        return "Walmart Marketplace"
    if _match_any(text, ["search console", "sitemap"]):
        return "Google Search Console"
    if _match_any(text, ["shipbob", "wro", "bethlehem", "kutztown"]):
        return "ShipBob"
    if _match_any(text, ["pump accelerator", "label", "design", "sample kit"]):
        return "Files / collateral"
    return "Browser / manual verify"


def _owner(text: str) -> str:
    if _match_any(text, ["needs ev", "ev should decide", "ev should", "ev confirmed"]):
        return "Ev"
    if _match_any(text, ["verify", "token", "submission", "import", "watch", "check", "open", "refresh"]):
        return "Operator"
    return "Shared"


def _bucket(text: str) -> str:
    if _match_any(text, ["walmart", "late origin scan", "price competitiveness", "buy box", "shipbob northeast hub move", "wro", "unshipped order", "inventories"]):
        return "Marketplace guardrails"
    if _match_any(text, ["ultra thin", "inventory visibility", "oversold inventory", "refund policy", "purchase option", "sellable", "john l ortman"]):
        return "Catalog truth"
    if _match_any(text, ["back-in-stock", "bundle", "opinew", "review import", "sitemap"]):
        return "Conversion backlog"
    return "Launch assets"


def _first_step(title: str, detail: str) -> tuple[str, str]:
    text = f"{title} {detail}".lower()
    if "shopify api token" in text:
        return (
            "Regenerate or replace the dead Shopify API credential, then re-test the inventory-dependent workflow.",
            "Done when inventory visibility is restored and the dependent workflow is no longer blind.",
        )
    if "ultra thin" in text or "john l ortman" in text:
        return (
            "Verify whether 2oz / 8oz Ultra Thin are actually live and sellable across storefront, product feed, and internal SKU truth.",
            "Done when the sellable truth is clear enough to answer John without hedging.",
        )
    if "walmart marketplace performance/pricing" in text:
        return (
            "Open Walmart performance + pricing views, identify the late-origin-scan order, and decide whether any recommended price cuts are worth acting on.",
            "Done when the late-scan order is identified/cleared and pricing changes are either accepted or explicitly parked.",
        )
    if "shipbob northeast hub move" in text:
        return (
            "Check for any open Northeast/Kutztown WROs or inbound plans that would collide with the Bethlehem transition dates.",
            "Done when no risky inbound remains pointed at Kutztown past the cutoff or the risky inbound is clearly flagged.",
        )
    if "back-in-stock notification app" in text:
        return (
            "Pick and test the back-in-stock app path so waitlisted traffic can be captured instead of lost.",
            "Done when there is a concrete app choice or install-ready shortlist with next action.",
        )
    if "refund policy links" in text or "gravixadhesives.com" in text:
        return (
            "Trace the live refund-policy links and replace any gravixadhesives.com destinations with the correct storefront target.",
            "Done when the live policy links resolve to the correct domain/path.",
        )
    if "sitemap" in text:
        return (
            "Submit or verify the Shopify sitemap in Search Console and note the active property/state.",
            "Done when submission state is visible in Search Console or the blocker is explicit.",
        )
    if "opinew" in text or "review import" in text:
        return (
            "Confirm the imported review count and whether product pages are actually showing the expected social proof.",
            "Done when the 1,183-review import is verified as live or the gap is pinned down.",
        )
    if "bundle offers" in text:
        return (
            "Sketch or choose the first high-confidence bundle offer worth testing instead of leaving bundles as abstract backlog.",
            "Done when there is a concrete first bundle candidate with products and placement.",
        )
    if "oversold inventory" in text:
        return (
            "Check the oversold SKUs and decide whether to correct inventory, pause exposure, or treat them as false alarms.",
            "Done when Gel 20g / Thick 2oz oversell risk is either cleared or explicitly contained.",
        )
    if "pump accelerator 8oz" in text:
        return (
            "Review the latest label/design state and capture the next unblocker to get Pump Accelerator 8oz launch-ready.",
            "Done when the next asset decision is obvious instead of buried in files.",
        )
    if "b2b sample kits" in text:
        return (
            "Confirm the outbound-ready kit contents and first send targets so the finished kits actually move.",
            "Done when the ready kits have a concrete next-send plan.",
        )
    return (
        "Open the live surface tied to this commerce task and clear the ambiguity from the source system.",
        "Done when the live system confirms the truth and the state can be updated cleanly.",
    )


def _score(item: Item) -> int:
    text = f"{item.title} {item.detail}".lower()
    score = 0
    if item.source_section == "urgent":
        score += 6
    elif item.source_section == "queue":
        score += 4
    else:
        score += 2

    if _match_any(text, ["shopify api token", "inventory visibility", "blind"]):
        score += 7
    if _match_any(text, ["ultra thin", "john l ortman", "sellable", "purchase option", "oversold inventory"]):
        score += 6
    if _match_any(text, ["walmart", "late origin scan", "price competitiveness", "buy box"]):
        score += 6
    if _match_any(text, ["refund policy", "back-in-stock", "opinew", "review import", "bundle offers", "sitemap"]):
        score += 4
    if _match_any(text, ["pump accelerator", "sample kits", "shipbob northeast hub move"]):
        score += 3
    return score


def _urgency(text: str, score: int) -> str:
    if _match_any(text, ["late origin scan", "shopify api token", "inventory visibility", "ultra thin", "john l ortman", "oversold inventory"]):
        return "now"
    if score >= 8:
        return "soon"
    return "backlog"


def _commerce_candidates(items: list[Item]) -> list[Item]:
    picked: list[Item] = []
    for item in items:
        text = f"{item.title} {item.detail}".lower()
        if _match_any(text, [
            "shopify api token",
            "ultra thin",
            "john l ortman",
            "inventory visibility",
            "small-format size",
            "walmart",
            "shipbob northeast hub move",
            "back-in-stock",
            "refund policy",
            "gravixadhesives.com",
            "sitemap",
            "opinew",
            "review import",
            "bundle offers",
            "oversold inventory",
            "pump accelerator 8oz",
            "b2b sample kits",
        ]):
            picked.append(item)
    return picked


def _expand_backlog_item(item: Item) -> list[Item]:
    text = f"{item.title} {item.detail}".lower()
    if "shopify / marketplace backlog" not in text:
        return [item]

    subitems = [
        ("ShipBob Northeast Hub move", "ShipBob is moving from Kutztown to 4755 Hanoverville Road, Building E, Bethlehem, PA 18020. Transition window 2026-05-11 to 2026-05-29; no Kutztown appointments after 2026-05-22; new WRO labels show new address starting 2026-05-27; inbound arriving at Kutztown starting 2026-05-27 will be denied. Check any open Northeast/Kutztown WROs before shipping inbound inventory."),
        ("Back-in-stock notification app", "Backlog item: choose a back-in-stock notification path for the storefront."),
        ("Refund policy links", "Backlog item: refund policy links currently point to gravixadhesives.com and should be corrected."),
        ("Google Search Console sitemap submission", "Backlog item: submit or verify the storefront sitemap in Search Console."),
        ("Opinew review import verification", "Backlog item: verify the imported 1,183 reviews are truly live and rendering as expected."),
        ("Bundle offers", "Backlog item: define the first bundle offers worth testing."),
        ("Oversold inventory watch", "Backlog item: oversold inventory watch shows Gel 20g (-6) and Thick 2oz (-1)."),
    ]
    expanded: list[Item] = []
    for title, detail in subitems:
        expanded.append(Item(
            title=title,
            detail=detail,
            source_section=item.source_section,
            sources=item.sources,
            amount=item.amount,
            tags=item.tags,
            draft_paths=item.draft_paths,
        ))
    return expanded


def _manual_fallback_items() -> list[Item]:
    text = BUSINESS_STATE.read_text(encoding="utf-8")
    fallback: list[Item] = []

    john_match = re.search(r"- \*\*John L Ortman\*\* — (.+)", text)
    if john_match:
        fallback.append(Item(
            title="John L Ortman",
            detail=john_match.group(1).strip(),
            source_section="queue",
            sources=["6174"],
            amount=None,
            tags=[],
            draft_paths=[],
        ))
    return fallback


def build_payload(date_str: str, generated_at: str) -> dict[str, Any]:
    raw_items = parse_business_state(BUSINESS_STATE)
    raw_items.extend(_manual_fallback_items())
    expanded: list[Item] = []
    for item in _commerce_candidates(raw_items):
        expanded.extend(_expand_backlog_item(item))

    rendered: list[CommerceItem] = []
    seen: set[tuple[str, str]] = set()
    for item in expanded:
        key = (item.title, item.detail)
        if key in seen:
            continue
        seen.add(key)
        text = f"{item.title} {item.detail}".lower()
        score = _score(item)
        first_step, success_check = _first_step(item.title, item.detail)
        rendered.append(CommerceItem(
            title=item.title,
            detail=_clean(item.detail),
            bucket=_bucket(text),
            surface=_surface(text),
            owner=_owner(text),
            urgency=_urgency(text, score),
            score=score,
            first_step=first_step,
            success_check=success_check,
            source_section=item.source_section,
            sources=item.sources,
            amount=item.amount,
        ))

    rendered.sort(key=lambda item: (-item.score, item.bucket, item.title.lower()))

    def pick(bucket: str) -> list[dict[str, Any]]:
        return [asdict(item) for item in rendered if item.bucket == bucket]

    payload = {
        "date": date_str,
        "generated_at": generated_at,
        "summary": {
            "total_items": len(rendered),
            "catalog_truth": len([x for x in rendered if x.bucket == "Catalog truth"]),
            "marketplace_guardrails": len([x for x in rendered if x.bucket == "Marketplace guardrails"]),
            "conversion_backlog": len([x for x in rendered if x.bucket == "Conversion backlog"]),
            "launch_assets": len([x for x in rendered if x.bucket == "Launch assets"]),
            "do_now": len([x for x in rendered if x.urgency == "now"]),
        },
        "do_now": [asdict(x) for x in rendered if x.urgency == "now"][:8],
        "catalog_truth": pick("Catalog truth"),
        "marketplace_guardrails": pick("Marketplace guardrails"),
        "conversion_backlog": pick("Conversion backlog"),
        "launch_assets": pick("Launch assets"),
        "all_items": [asdict(item) for item in rendered],
    }
    return payload


def _render_item_md(item: dict[str, Any]) -> str:
    meta = [item["surface"], item["owner"], item["urgency"]]
    if item.get("amount"):
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
    out = [
        f"# Morning Commerce Desk — {payload['date']}",
        "",
        f"Generated: {payload['generated_at']}",
        "",
        "## Snapshot",
        f"- Total commerce items: **{s['total_items']}**",
        f"- Do now: **{s['do_now']}**",
        f"- Catalog truth: **{s['catalog_truth']}**",
        f"- Marketplace guardrails: **{s['marketplace_guardrails']}**",
        f"- Conversion backlog: **{s['conversion_backlog']}**",
        f"- Launch assets: **{s['launch_assets']}**",
        "",
    ]
    for title, key in [
        ("Do now", "do_now"),
        ("Catalog truth", "catalog_truth"),
        ("Marketplace guardrails", "marketplace_guardrails"),
        ("Conversion backlog", "conversion_backlog"),
        ("Launch assets", "launch_assets"),
    ]:
        out.append(f"## {title}")
        items = payload.get(key) or []
        if not items:
            out.append("- None")
        else:
            for item in items:
                out.append(f"- {_render_item_md(item)}")
        out.append("")
    return "\n".join(out) + "\n"


def render_html(payload: dict[str, Any]) -> str:
    s = payload["summary"]

    def cards() -> str:
        items = [
            ("Commerce items", s["total_items"]),
            ("Do now", s["do_now"]),
            ("Catalog truth", s["catalog_truth"]),
            ("Marketplace", s["marketplace_guardrails"]),
            ("Conversion", s["conversion_backlog"]),
            ("Launch", s["launch_assets"]),
        ]
        return "".join(
            f"<div class='card'><div class='k'>{escape(str(k))}</div><div class='v'>{escape(str(v))}</div></div>"
            for k, v in items
        )

    def section(title: str, items: list[dict[str, Any]]) -> str:
        if not items:
            body = "<li class='muted'>Nothing surfaced.</li>"
        else:
            body = "".join(
                "<li>"
                f"<b>{escape(item['title'])}</b> <span class='badge'>{escape(item['urgency'])}</span>"
                f"<div class='meta'>{escape(item['surface'])} · {escape(item['owner'])}"
                + (f" · {_fmt_money(float(item['amount']))}" if item.get('amount') else "")
                + (f" · msgs {escape(', '.join(item.get('sources') or []))}" if item.get('sources') else "")
                + "</div>"
                f"<div>{escape(item['detail'])}</div>"
                f"<div class='step'><b>First step:</b> {escape(item['first_step'])}</div>"
                f"<div class='step'><b>Success:</b> {escape(item['success_check'])}</div>"
                "</li>"
                for item in items
            )
        return f"<div class='panel'><h3>{escape(title)}</h3><ul>{body}</ul></div>"

    copy_text = "\n".join([
        f"Morning commerce stack — {payload['date']}",
        "",
        *[f"- [ ] {item['title']} — {item['first_step']}" for item in payload['do_now'][:6]],
    ])

    return f"""<!doctype html>
<html lang=\"en\">
<head>
<meta charset=\"utf-8\" />
<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
<title>Morning Commerce Desk — {escape(payload['date'])}</title>
<style>
:root {{--bg:#0A1628;--surface:#111B2E;--border:#1E293B;--text:#fff;--muted:#94A3B8;--accent:#3B82F6;}}
*{{box-sizing:border-box}} body{{margin:0;padding:24px;background:var(--bg);color:var(--text);font-family:Inter,-apple-system,sans-serif}}
.wrap{{max-width:1200px;margin:0 auto}} .grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px}}
.card,.panel{{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px}}
.k{{color:var(--muted);font-size:12px}} .v{{font-size:26px;font-weight:750;margin-top:4px}} .meta,.muted{{color:var(--muted)}}
.two{{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}} @media (max-width: 900px){{.two{{grid-template-columns:1fr}}}}
ul{{margin:8px 0 0 18px}} li{{margin:10px 0}} button{{background:var(--accent);border:none;color:white;border-radius:10px;padding:8px 10px;font-weight:650;cursor:pointer}} a{{color:#93C5FD}} .badge{{display:inline-block;border:1px solid var(--border);border-radius:999px;padding:2px 8px;font-size:12px;color:var(--muted);margin-left:6px}} .step{{margin-top:4px}}
</style>
</head>
<body>
<div class=\"wrap\">
  <h1>Morning Commerce Desk</h1>
  <div class=\"muted\">{escape(payload['generated_at'])} · catalog truth, marketplace guardrails, and conversion backlog</div>
  <p><a href=\"./morning-ops-hub-latest.html\">Open full ops hub</a> · <a href=\"./morning-customer-desk-latest.html\">Customer desk</a> · <a href=\"../BUSINESS_STATE.md\">Business State</a></p>
  <p><button id=\"copyBtn\">Copy commerce checklist</button></p>
  <div class=\"grid\">{cards()}</div>
  <div class=\"two\">{section('Do now', payload['do_now'])}{section('Catalog truth', payload['catalog_truth'])}</div>
  <div class=\"two\">{section('Marketplace guardrails', payload['marketplace_guardrails'])}{section('Conversion backlog', payload['conversion_backlog'])}</div>
  <div class=\"two\">{section('Launch assets', payload['launch_assets'])}<div></div></div>
</div>
<script>
const text = {json.dumps(copy_text)};
document.getElementById('copyBtn').addEventListener('click', () => navigator.clipboard.writeText(text).catch(() => window.prompt('Copy this text:', text)));
</script>
</body>
</html>
"""


def main() -> int:
    parser = argparse.ArgumentParser(description="Build morning commerce desk from BUSINESS_STATE.md")
    parser.add_argument("--date", help="Output date YYYY-MM-DD")
    args = parser.parse_args()

    if not BUSINESS_STATE.exists():
        raise SystemExit(f"Missing {BUSINESS_STATE}")

    now = datetime.now().astimezone()
    date_str = args.date or now.strftime("%Y-%m-%d")
    generated_at = now.strftime("%Y-%m-%d %H:%M %Z")
    payload = build_payload(date_str, generated_at)

    REPORTS.mkdir(parents=True, exist_ok=True)
    md_path = REPORTS / f"morning-commerce-desk-{date_str}.md"
    html_path = REPORTS / f"morning-commerce-desk-{date_str}.html"
    json_path = REPORTS / f"morning-commerce-desk-{date_str}.json"

    md_path.write_text(render_markdown(payload), encoding="utf-8")
    html_path.write_text(render_html(payload), encoding="utf-8")
    json_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    _clone_latest(md_path, REPORTS / "morning-commerce-desk-latest.md")
    _clone_latest(html_path, REPORTS / "morning-commerce-desk-latest.html")
    _clone_latest(json_path, REPORTS / "morning-commerce-desk-latest.json")

    print(f"Built {md_path.relative_to(ROOT)}")
    print(f"Built {html_path.relative_to(ROOT)}")
    print(f"Built {json_path.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
