#!/usr/bin/env python3
"""build_decision_brief.py

Build a morning decision desk from BUSINESS_STATE.md.

Outputs:
- reports/morning-decision-desk-YYYY-MM-DD.md
- reports/morning-decision-desk-YYYY-MM-DD.html
- reports/morning-decision-desk-YYYY-MM-DD.json
- reports/morning-decision-desk-latest.md
- reports/morning-decision-desk-latest.html
- reports/morning-decision-desk-latest.json
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

ROOT = Path(__file__).resolve().parents[1]
BUSINESS_STATE = ROOT / "BUSINESS_STATE.md"
REPORTS = ROOT / "reports"

SECTION_MAP = {
    "## 🔴 needs ev / time-sensitive": "urgent",
    "## 🟡 customer / b2b follow-up queue": "queue",
    "## 🔵 active product / growth": "growth",
    "## 🟣 moneysamurai / systems": "systems",
}


@dataclass
class Item:
    title: str
    detail: str
    source_section: str
    sources: list[str]
    amount: float | None
    tags: list[str]
    draft_paths: list[str]



def _clone_latest(versioned: Path, latest: Path) -> None:
    shutil.copyfile(versioned, latest)



def _fmt_money(v: float | None) -> str:
    if v is None:
        return "—"
    if abs(v - round(v)) < 1e-9:
        return f"${int(round(v)):,}"
    return f"${v:,.2f}"



def _parse_amount(text: str) -> float | None:
    m = re.search(r"\$(\d{1,3}(?:,\d{3})*(?:\.\d+)?)([kKmM])?", text)
    if not m:
        return None
    value = float(m.group(1).replace(",", ""))
    suffix = (m.group(2) or "").lower()
    if suffix == "k":
        value *= 1000
    elif suffix == "m":
        value *= 1_000_000
    lower = text.lower()
    if any(tok in lower for tok in ["run rate", "target price", "spend", "roas", "acos", "revenue", "tracked state", "data reportedly ready around"]):
        return None
    return value



def _extract_sources(text: str) -> list[str]:
    found = re.findall(r"msgs?\s+((?:\*\*\d+\*\*(?:,\s*)?)+|(?:\d+(?:,\s*\d+)*))", text, flags=re.I)
    out: list[str] = []
    seen: set[str] = set()
    for block in found:
        for num in re.findall(r"\d+", block):
            if num not in seen:
                out.append(num)
                seen.add(num)
    return out



def _extract_paths(text: str) -> list[str]:
    return re.findall(r"`([^`]+)`", text)



def _classify(title: str, detail: str, section: str) -> list[str]:
    text = f"{title} {detail}".lower()
    tags: list[str] = []
    if section == "urgent" or any(tok in text for tok in ["ev must", "needs ev", "verify", "decision", "accept", "handle"]):
        tags.append("needs_ev")
    if any(tok in text for tok in ["customer", "reply", "order", "refund", "package", "a-to-z", "unshipped", "return", "wholesale", "dealer inquiry"]):
        tags.append("customer")
    if any(tok in text for tok in ["token", "access", "api", "browser", "login", "security", "password recovery", "verify account"]):
        tags.append("unblocker")
    if any(tok in text for tok in ["security", "password recovery", "past-due", "declined", "due "]):
        tags.append("verify")
    if any(tok in text for tok in ["invoice", "payment", "paypal", "amex", "statement", "refund"]):
        tags.append("money")
    if section == "systems":
        tags.append("systems")
    return sorted(set(tags))



def parse_business_state(path: Path) -> list[Item]:
    text = path.read_text(encoding="utf-8")
    items: list[Item] = []
    section: str | None = None
    current_h3: str | None = None
    h3_lines: list[str] = []

    def flush_h3() -> None:
        nonlocal current_h3, h3_lines
        if not current_h3 or not section:
            current_h3 = None
            h3_lines = []
            return
        detail = " ".join(x.strip() for x in h3_lines if x.strip())
        if any(tok in detail.lower() for tok in ["resolved", "do not resurface", "should keep running", "latest checked ads folder", "recent timeout patches"]):
            current_h3 = None
            h3_lines = []
            return
        items.append(Item(
            title=current_h3.strip(),
            detail=detail,
            source_section=section,
            sources=_extract_sources(detail),
            amount=_parse_amount(detail),
            tags=_classify(current_h3, detail, section),
            draft_paths=[p for p in _extract_paths(detail) if "/" in p or p.endswith(".md") or p.endswith(".html")],
        ))
        current_h3 = None
        h3_lines = []

    for raw in text.splitlines():
        stripped = raw.strip()
        lower = stripped.lower()
        if lower.startswith("## "):
            flush_h3()
            section = SECTION_MAP.get(lower)
            continue
        if stripped.startswith("### "):
            flush_h3()
            current_h3 = stripped[4:].strip()
            continue
        if section is None:
            continue
        if stripped.startswith("- "):
            bullet = stripped[2:].strip()
            if current_h3:
                h3_lines.append(bullet)
            else:
                if any(tok in bullet.lower() for tok in ["resolved / do not resurface", "do not re-enable", "do not resurface unless"]):
                    continue
                title, _, rest = bullet.partition(" — ")
                detail = rest or bullet
                items.append(Item(
                    title=title.strip("* "),
                    detail=detail.strip(),
                    source_section=section,
                    sources=_extract_sources(bullet),
                    amount=_parse_amount(bullet),
                    tags=_classify(title, detail, section),
                    draft_paths=[p for p in _extract_paths(bullet) if "/" in p or p.endswith(".md") or p.endswith(".html")],
                ))
            continue
        if stripped and current_h3:
            h3_lines.append(stripped)

    flush_h3()
    return items



def build_payload(date_str: str, generated_at: str, items: list[Item]) -> dict[str, Any]:
    needs_ev = [i for i in items if "needs_ev" in i.tags][:8]
    customer = [i for i in items if "customer" in i.tags][:10]
    unblockers = [i for i in items if "unblocker" in i.tags][:8]
    verify = [i for i in items if "verify" in i.tags][:8]
    money = sorted([i for i in items if i.amount], key=lambda x: x.amount or 0, reverse=True)[:8]
    summaries = {
        "total_items": len(items),
        "needs_ev": len([i for i in items if "needs_ev" in i.tags]),
        "customer": len([i for i in items if "customer" in i.tags]),
        "unblockers": len([i for i in items if "unblocker" in i.tags]),
        "verify": len([i for i in items if "verify" in i.tags]),
        "money_total": round(sum(i.amount or 0 for i in items), 2),
    }
    return {
        "date": date_str,
        "generated_at": generated_at,
        "summary": summaries,
        "needs_ev": [asdict(i) for i in needs_ev],
        "customer_queue": [asdict(i) for i in customer],
        "unblockers": [asdict(i) for i in unblockers],
        "verify_now": [asdict(i) for i in verify],
        "money_at_stake": [asdict(i) for i in money],
        "all_items": [asdict(i) for i in items],
    }



def _render_item_md(item: dict[str, Any]) -> str:
    bits = [f"**{item['title']}** — {item['detail']}"]
    meta: list[str] = []
    if item.get("amount"):
        meta.append(_fmt_money(float(item["amount"])))
    if item.get("sources"):
        meta.append("msgs " + ", ".join(item["sources"]))
    if item.get("draft_paths"):
        meta.append("refs: " + ", ".join(item["draft_paths"][:2]))
    if meta:
        bits.append(f" ({'; '.join(meta)})")
    return "".join(bits)



def render_markdown(payload: dict[str, Any]) -> str:
    out = []
    out.append(f"# Morning Decision Desk — {payload['date']}")
    out.append("")
    out.append(f"Generated: {payload['generated_at']}")
    out.append("")
    s = payload["summary"]
    out.append("## Snapshot")
    out.append(f"- Needs Ev: **{s['needs_ev']}**")
    out.append(f"- Customer queue: **{s['customer']}**")
    out.append(f"- Unblockers: **{s['unblockers']}**")
    out.append(f"- Verify now: **{s['verify']}**")
    out.append(f"- Visible money at stake: **{_fmt_money(s['money_total'])}**")
    out.append("")
    for title, key in [
        ("Needs Ev first", "needs_ev"),
        ("Verify / account checks", "verify_now"),
        ("Unblockers", "unblockers"),
        ("Customer queue", "customer_queue"),
        ("Money at stake", "money_at_stake"),
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
    def block(title: str, items: list[dict[str, Any]]) -> str:
        if not items:
            lis = "<li class='muted'>Nothing surfaced.</li>"
        else:
            lis = "".join(
                f"<li><b>{escape(i['title'])}</b> — {escape(i['detail'])}"
                + (f" <span class='meta'>· {_fmt_money(float(i['amount']))}</span>" if i.get('amount') else "")
                + (f" <span class='meta'>· msgs {escape(', '.join(i.get('sources') or []))}</span>" if i.get('sources') else "")
                + (f" <span class='meta'>· {escape(', '.join((i.get('draft_paths') or [])[:2]))}</span>" if i.get('draft_paths') else "")
                + "</li>"
                for i in items
            )
        return f"<div class='panel'><h3>{escape(title)}</h3><ul>{lis}</ul></div>"

    copy_text = "\n".join([
        f"Decision desk — {payload['date']}",
        "",
        *[f"- [ ] {i['title']} — {i['detail']}" for i in payload['needs_ev'][:6]],
        "",
    ])
    s = payload["summary"]
    cards = [
        ("Needs Ev", s["needs_ev"]),
        ("Customer queue", s["customer"]),
        ("Unblockers", s["unblockers"]),
        ("Verify now", s["verify"]),
        ("Money visible", _fmt_money(s["money_total"])),
    ]
    cards_html = "".join(f"<div class='card'><div class='k'>{escape(str(k))}</div><div class='v'>{escape(str(v))}</div></div>" for k, v in cards)
    return f"""<!doctype html>
<html lang=\"en\">
<head>
<meta charset=\"utf-8\" />
<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
<title>Morning Decision Desk — {escape(payload['date'])}</title>
<style>
:root {{--bg:#0A1628;--surface:#111B2E;--border:#1E293B;--text:#fff;--muted:#94A3B8;--accent:#3B82F6;}}
*{{box-sizing:border-box}} body{{margin:0;padding:24px;background:var(--bg);color:var(--text);font-family:Inter,-apple-system,sans-serif}}
.wrap{{max-width:1200px;margin:0 auto}} .grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}}
.card,.panel{{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px}}
.k{{color:var(--muted);font-size:12px}} .v{{font-size:26px;font-weight:750;margin-top:4px}} .meta,.muted{{color:var(--muted)}}
.two{{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}} @media (max-width: 900px){{.two{{grid-template-columns:1fr}}}}
ul{{margin:8px 0 0 18px}} li{{margin:7px 0}} button{{background:var(--accent);border:none;color:white;border-radius:10px;padding:8px 10px;font-weight:650;cursor:pointer}} a{{color:#93C5FD}}
</style>
</head>
<body>
<div class=\"wrap\">
  <h1>Morning Decision Desk</h1>
  <div class=\"muted\">{escape(payload['generated_at'])} · one-screen view of decisions, verifications, and unblockers</div>
  <p><a href=\"./morning-ops-hub-latest.html\">Open full ops hub</a> · <a href=\"../BUSINESS_STATE.md\">Business State</a></p>
  <p><button id=\"copyBtn\">Copy top decision list</button></p>
  <div class=\"grid\">{cards_html}</div>
  <div class=\"two\">
    {block('Needs Ev first', payload['needs_ev'])}
    {block('Verify / account checks', payload['verify_now'])}
  </div>
  <div class=\"two\">
    {block('Unblockers', payload['unblockers'])}
    {block('Money at stake', payload['money_at_stake'])}
  </div>
  <div class=\"panel" style=\"margin-top:12px\">{block('Customer queue', payload['customer_queue'])}</div>
</div>
<script>
const text = {json.dumps(copy_text)};
document.getElementById('copyBtn').addEventListener('click', () => navigator.clipboard.writeText(text).catch(() => window.prompt('Copy this text:', text)));
</script>
</body>
</html>
"""



def main() -> int:
    parser = argparse.ArgumentParser(description="Build morning decision desk from BUSINESS_STATE.md")
    parser.add_argument("--date", help="Output date YYYY-MM-DD")
    args = parser.parse_args()

    if not BUSINESS_STATE.exists():
        raise SystemExit(f"Missing {BUSINESS_STATE}")

    now = datetime.now().astimezone()
    date_str = args.date or now.strftime("%Y-%m-%d")
    generated_at = now.strftime("%Y-%m-%d %H:%M %Z")
    items = parse_business_state(BUSINESS_STATE)
    payload = build_payload(date_str, generated_at, items)

    REPORTS.mkdir(parents=True, exist_ok=True)
    md_path = REPORTS / f"morning-decision-desk-{date_str}.md"
    html_path = REPORTS / f"morning-decision-desk-{date_str}.html"
    json_path = REPORTS / f"morning-decision-desk-{date_str}.json"

    md_path.write_text(render_markdown(payload), encoding="utf-8")
    html_path.write_text(render_html(payload), encoding="utf-8")
    json_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    _clone_latest(md_path, REPORTS / "morning-decision-desk-latest.md")
    _clone_latest(html_path, REPORTS / "morning-decision-desk-latest.html")
    _clone_latest(json_path, REPORTS / "morning-decision-desk-latest.json")

    print(f"Built {md_path.relative_to(ROOT)}")
    print(f"Built {html_path.relative_to(ROOT)}")
    print(f"Built {json_path.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
