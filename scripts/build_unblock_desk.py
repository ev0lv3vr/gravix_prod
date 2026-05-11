#!/usr/bin/env python3
"""build_unblock_desk.py

Build a morning unblock/verification desk from BUSINESS_STATE.md.

Outputs:
- reports/morning-unblock-desk-YYYY-MM-DD.md
- reports/morning-unblock-desk-YYYY-MM-DD.html
- reports/morning-unblock-desk-YYYY-MM-DD.json
- reports/morning-unblock-desk-latest.md
- reports/morning-unblock-desk-latest.html
- reports/morning-unblock-desk-latest.json
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
BUSINESS_STATE = ROOT / "BUSINESS_STATE.md"


@dataclass
class UnblockItem:
    title: str
    detail: str
    source_section: str
    sources: list[str]
    tags: list[str]
    surface: str
    owner: str
    lane: str
    first_step: str
    success_check: str
    urgency: str
    score: int


def _clone_latest(versioned: Path, latest: Path) -> None:
    shutil.copyfile(versioned, latest)


def _clean(text: str) -> str:
    return " ".join(text.replace("**", "").split())


def _match_any(text: str, terms: list[str]) -> bool:
    return any(term in text for term in terms)


def _derive_surface(text: str) -> str:
    if _match_any(text, ["seller central", "amazon account", "amazon buyer message", "fba"]):
        return "Amazon Seller Central"
    if "shopify" in text or "cart upsell" in text:
        return "Shopify Admin"
    if _match_any(text, ["walmart", "marketplace"]):
        return "Walmart Marketplace"
    if _match_any(text, ["shipment", "tracking", "ups"]):
        return "ShipBob / UPS"
    if _match_any(text, ["paypal", "invoice"]):
        return "PayPal / finance trail"
    if _match_any(text, ["trademark", "uspto"]):
        return "Trademark / USPTO watch"
    return "Browser / manual verify"


def _derive_owner(text: str) -> str:
    if _match_any(text, ["ev must", "needs ev", "ev should", "ev asked", "if this was not ev", "he should verify"]):
        return "Ev"
    if _match_any(text, ["reply", "tracking", "shipment", "verify", "token", "refresh", "open"]):
        return "Operator"
    return "Shared"


def _derive_lane(text: str) -> str:
    if _match_any(text, ["security", "password recovery", "verify account"]):
        return "security"
    if _match_any(text, ["token", "access", "api", "app"]):
        return "access"
    if _match_any(text, ["shipment", "tracking", "removal", "inventory"]):
        return "ops"
    if _match_any(text, ["reply", "buyer message", "customer"]):
        return "customer"
    if _match_any(text, ["price competitiveness", "price cuts", "performance"]):
        return "marketplace"
    return "verify"


def _derive_steps(title: str, detail: str) -> tuple[str, str]:
    text = f"{title} {detail}".lower()
    if "amazon account security check" in text or "password recovery" in text:
        return (
            "Open Amazon account security activity directly in-browser and confirm whether the Washington/macOS reset attempt was yours.",
            "Marked done once recent sign-in / recovery activity is confirmed legitimate or the password + MFA are changed.",
        )
    if "shopify api token" in text:
        return (
            "Open Shopify admin, regenerate or replace the broken API credential, then re-test inventory visibility in the affected workflow.",
            "Done when inventory visibility is back and the dependent workflow no longer shows blind/dead API access.",
        )
    if "icu shopify upsell" in text or "cart upsell" in text:
        return (
            "Open the In Cart Upsell app inside Shopify admin so the store token refreshes before offers stay paused.",
            "Done when the app loads cleanly and the expiry/pause warning is gone or extended.",
        )
    if "amazon buyer message" in text:
        return (
            "Open Seller Central buyer messages for order 113-4386244-8272243 and draft/send the reply from the existing order context.",
            "Done when the message is answered in Seller Central and the thread is moved out of the active queue.",
        )
    if "fba unfulfillable removal" in text:
        return (
            "Open FBA removal settings/order gZRKfHwQJb and verify destination, cadence, and whether any additional unfulfillable inventory is queued.",
            "Done when the settings are confirmed or adjusted and any follow-up action is recorded.",
        )
    if "r&r fabrications shipment" in text:
        return (
            "Create the shipment for the 30-bottle R&R order, then capture the UPS tracking number for follow-up.",
            "Done when tracking exists and the item can move from reminder state to shipped/awaiting delivery.",
        )
    if "walmart marketplace performance/pricing" in text:
        return (
            "Open the Walmart performance/pricing dashboards and decide whether to act on on-time delivery risk and the suggested price cuts.",
            "Done when Ev accepts or rejects the pricing/performance actions and the decision is recorded.",
        )
    if "a3 partners gemiflex" in text:
        return (
            "Verify delivery status for tracking 1Z43A99A0348588986 and confirm whether invoice 26-04271 needs a reminder or calendar hold.",
            "Done when delivery is confirmed and the payable follow-up is clearly parked.",
        )
    if "trademark maintenance filing" in text:
        return (
            "No active browser work unless a new PCH/USPTO irregularity appears; leave this on passive monitor.",
            "Done stays passive unless a new Office action or attorney request lands.",
        )
    return (
        "Open the source system in-browser and clear the blocker from the live operating surface, not from email.",
        "Done when the live surface confirms the blocker is cleared and the state file can be updated confidently.",
    )


def _score(text: str) -> int:
    score = 0
    if _match_any(text, ["security", "password recovery", "expired", "expires", "pause", "buyer message", "first thing"]):
        score += 5
    if _match_any(text, ["token", "access", "verify", "tracking", "shipment", "removal"]):
        score += 3
    if _match_any(text, ["needs ev", "ev must", "time-sensitive", "urgent"]):
        score += 2
    return score


def _urgency(score: int, text: str) -> str:
    if score >= 8 or _match_any(text, ["security", "expires", "pause", "buyer message"]):
        return "now"
    if score >= 5:
        return "soon"
    return "watch"


def build_payload(date_str: str, generated_at: str) -> dict[str, Any]:
    raw_items = parse_business_state(BUSINESS_STATE)
    selected = []
    for item in raw_items:
        text = f"{item.title} {item.detail}".lower()
        if item.source_section not in {"urgent", "queue"}:
            continue
        if _match_any(text, ["watch item", "not an active integration blocker", "do not resurface", "passive monitoring"]):
            continue
        if not (
            "unblocker" in item.tags
            or "verify" in item.tags
            or _match_any(text, ["token", "security", "verify", "shipment", "tracking", "buyer message", "removal", "price competitiveness", "delivery"])
        ):
            continue
        score = _score(text)
        first_step, success_check = _derive_steps(item.title, item.detail)
        selected.append(
            UnblockItem(
                title=item.title,
                detail=_clean(item.detail),
                source_section=item.source_section,
                sources=item.sources,
                tags=item.tags,
                surface=_derive_surface(text),
                owner=_derive_owner(text),
                lane=_derive_lane(text),
                first_step=first_step,
                success_check=success_check,
                urgency=_urgency(score, text),
                score=score,
            )
        )

    selected.sort(key=lambda item: (-item.score, item.owner != "Ev", item.title.lower()))
    do_now = [item for item in selected if item.urgency == "now"][:8]
    operator = [item for item in selected if item.owner == "Operator"][:8]
    ev_only = [item for item in selected if item.owner == "Ev"][:8]
    watch = [item for item in selected if item.urgency == "watch"][:8]

    return {
        "date": date_str,
        "generated_at": generated_at,
        "summary": {
            "total_items": len(selected),
            "do_now": len([item for item in selected if item.urgency == "now"]),
            "operator_owned": len([item for item in selected if item.owner == "Operator"]),
            "ev_owned": len([item for item in selected if item.owner == "Ev"]),
            "surfaces": sorted({item.surface for item in selected}),
        },
        "do_now": [asdict(item) for item in do_now],
        "operator_owned": [asdict(item) for item in operator],
        "ev_owned": [asdict(item) for item in ev_only],
        "watch_list": [asdict(item) for item in watch],
        "all_items": [asdict(item) for item in selected],
    }


def _render_item_md(item: dict[str, Any]) -> str:
    meta = [item["surface"], item["owner"], item["lane"]]
    if item.get("sources"):
        meta.append("msgs " + ", ".join(item["sources"]))
    return (
        f"**{item['title']}** — {item['detail']} "
        f"({'; '.join(meta)})\n"
        f"  - First step: {item['first_step']}\n"
        f"  - Success: {item['success_check']}"
    )


def render_markdown(payload: dict[str, Any]) -> str:
    s = payload["summary"]
    out = [
        f"# Morning Unblock Desk — {payload['date']}",
        "",
        f"Generated: {payload['generated_at']}",
        "",
        "## Snapshot",
        f"- Total unblock / verify items: **{s['total_items']}**",
        f"- Do now: **{s['do_now']}**",
        f"- Operator-owned: **{s['operator_owned']}**",
        f"- Ev-owned: **{s['ev_owned']}**",
        f"- Surfaces: **{', '.join(s['surfaces']) if s['surfaces'] else '—'}**",
        "",
    ]
    for title, key in [
        ("Do now", "do_now"),
        ("Operator-owned clears", "operator_owned"),
        ("Needs Ev in-browser", "ev_owned"),
        ("Watch / lower urgency", "watch_list"),
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
    def cards() -> str:
        s = payload["summary"]
        items = [
            ("Unblock items", s["total_items"]),
            ("Do now", s["do_now"]),
            ("Operator-owned", s["operator_owned"]),
            ("Needs Ev", s["ev_owned"]),
            ("Surfaces", len(s["surfaces"])),
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
                f"<div class='meta'>{escape(item['surface'])} · {escape(item['owner'])} · {escape(item['lane'])}"
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
        f"Morning unblock stack — {payload['date']}",
        "",
        *[f"- [ ] {item['title']} — {item['first_step']}" for item in payload['do_now'][:6]],
    ])

    return f"""<!doctype html>
<html lang=\"en\">
<head>
<meta charset=\"utf-8\" />
<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
<title>Morning Unblock Desk — {escape(payload['date'])}</title>
<style>
:root {{--bg:#0A1628;--surface:#111B2E;--border:#1E293B;--text:#fff;--muted:#94A3B8;--accent:#3B82F6;}}
*{{box-sizing:border-box}} body{{margin:0;padding:24px;background:var(--bg);color:var(--text);font-family:Inter,-apple-system,sans-serif}}
.wrap{{max-width:1200px;margin:0 auto}} .grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}}
.card,.panel{{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px}}
.k{{color:var(--muted);font-size:12px}} .v{{font-size:26px;font-weight:750;margin-top:4px}} .meta,.muted{{color:var(--muted)}}
.two{{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}} @media (max-width: 900px){{.two{{grid-template-columns:1fr}}}}
ul{{margin:8px 0 0 18px}} li{{margin:10px 0}} button{{background:var(--accent);border:none;color:white;border-radius:10px;padding:8px 10px;font-weight:650;cursor:pointer}} a{{color:#93C5FD}} .badge{{display:inline-block;border:1px solid var(--border);border-radius:999px;padding:2px 8px;font-size:12px;color:var(--muted);margin-left:6px}} .step{{margin-top:4px}}
</style>
</head>
<body>
<div class=\"wrap\">
  <h1>Morning Unblock Desk</h1>
  <div class=\"muted\">{escape(payload['generated_at'])} · browser-first checklist for access, verification, and stuck queue items</div>
  <p><a href=\"./morning-ops-hub-latest.html\">Open full ops hub</a> · <a href=\"./morning-decision-desk-latest.html\">Decision desk</a> · <a href=\"../BUSINESS_STATE.md\">Business State</a></p>
  <p><button id=\"copyBtn\">Copy unblock checklist</button></p>
  <div class=\"grid\">{cards()}</div>
  <div class=\"two\">
    {section('Do now', payload['do_now'])}
    {section('Operator-owned clears', payload['operator_owned'])}
  </div>
  <div class=\"two\">
    {section('Needs Ev in-browser', payload['ev_owned'])}
    {section('Watch / lower urgency', payload['watch_list'])}
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
    parser = argparse.ArgumentParser(description="Build morning unblock desk from BUSINESS_STATE.md")
    parser.add_argument("--date", help="Output date YYYY-MM-DD")
    args = parser.parse_args()

    if not BUSINESS_STATE.exists():
        raise SystemExit(f"Missing {BUSINESS_STATE}")

    now = datetime.now().astimezone()
    date_str = args.date or now.strftime("%Y-%m-%d")
    generated_at = now.strftime("%Y-%m-%d %H:%M %Z")
    payload = build_payload(date_str, generated_at)

    REPORTS.mkdir(parents=True, exist_ok=True)
    md_path = REPORTS / f"morning-unblock-desk-{date_str}.md"
    html_path = REPORTS / f"morning-unblock-desk-{date_str}.html"
    json_path = REPORTS / f"morning-unblock-desk-{date_str}.json"

    md_path.write_text(render_markdown(payload), encoding="utf-8")
    html_path.write_text(render_html(payload), encoding="utf-8")
    json_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    _clone_latest(md_path, REPORTS / "morning-unblock-desk-latest.md")
    _clone_latest(html_path, REPORTS / "morning-unblock-desk-latest.html")
    _clone_latest(json_path, REPORTS / "morning-unblock-desk-latest.json")

    print(f"Built {md_path.relative_to(ROOT)}")
    print(f"Built {html_path.relative_to(ROOT)}")
    print(f"Built {json_path.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
