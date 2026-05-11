#!/usr/bin/env python3
"""build_brand_narrative_desk.py

Build a morning brand / founder-narrative desk from local Glue Masters strategy docs.

Outputs:
- reports/brand-narrative-desk-YYYY-MM-DD.md
- reports/brand-narrative-desk-YYYY-MM-DD.html
- reports/brand-narrative-desk-YYYY-MM-DD.json
- reports/brand-narrative-desk-latest.md
- reports/brand-narrative-desk-latest.html
- reports/brand-narrative-desk-latest.json
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
from datetime import datetime
from html import escape
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
REPORTS = ROOT / "reports"
SITE_AUDIT = ROOT / "gluemasters-bizdev/strategy/site-audit.md"
CMO_REVIEW = ROOT / "gluemasters-bizdev/b2b/archive/review-cmo.md"
STRATEGY_REVIEW = ROOT / "gluemasters-bizdev/b2b/strategy-review.md"
MEMORY = ROOT / "MEMORY.md"
BUSINESS_STATE = ROOT / "BUSINESS_STATE.md"


def _clone_latest(versioned: Path, latest: Path) -> None:
    shutil.copyfile(versioned, latest)


def _read(path: Path) -> str:
    return path.read_text(encoding="utf-8") if path.exists() else ""


def _extract_int(pattern: str, text: str) -> int | None:
    match = re.search(pattern, text, flags=re.I)
    if not match:
        return None
    return int(match.group(1).replace(",", ""))


def _extract_money(pattern: str, text: str) -> str | None:
    match = re.search(pattern, text, flags=re.I)
    return match.group(1) if match else None


def _fmt_int(value: int | None) -> str:
    return f"{value:,}" if value is not None else "—"


def _proof_points(site_audit: str, memory_text: str) -> list[dict[str, str]]:
    review_count = _extract_int(r"(\d{1,3}(?:,\d{3})*) reviews", site_audit)
    amazon_revenue = _extract_money(r"Amazon \$(\d+(?:,\d+)?K)", memory_text)
    shopify_revenue = _extract_money(r"Shopify \$(\d+(?:,\d+)?K)", memory_text)
    run_rate = _extract_money(r"Revenue run rate:\*\* ~\$(\d+(?:,\d+)?K)", memory_text)

    points = [
        {
            "label": "Review moat",
            "value": f"{_fmt_int(review_count)} reviews",
            "source": "site-audit.md",
            "note": "Audit says this social proof is currently buried instead of featured above the fold.",
        },
        {
            "label": "Amazon proof",
            "value": "Amazon #1 New Release history",
            "source": "site-audit.md",
            "note": "Strong credibility signal for DTC buyers if surfaced clearly.",
        },
        {
            "label": "Revenue scale",
            "value": f"~${run_rate} run rate" if run_rate else "~$638K run rate",
            "source": "MEMORY.md",
            "note": f"Current mix remembered as Amazon ${amazon_revenue} + Shopify ${shopify_revenue}." if amazon_revenue and shopify_revenue else "Current mix is already meaningful enough to support authority messaging.",
        },
        {
            "label": "B2B readiness",
            "value": "Sample kits ready to send",
            "source": "BUSINESS_STATE.md",
            "note": "Brand copy can now point to a real offline trial path instead of a vague contact form.",
        },
        {
            "label": "Core promise",
            "value": "Reliable CA supply that doesn't slow production",
            "source": "review-cmo.md + strategy-review.md",
            "note": "This outcome language appears repeatedly across the strategy docs and is sharper than generic 'partner' wording.",
        },
    ]
    return points


def build_payload(date_str: str, generated_at: str) -> dict[str, Any]:
    site_audit = _read(SITE_AUDIT)
    memory_text = _read(MEMORY)

    review_count = _extract_int(r"(\d{1,3}(?:,\d{3})*) reviews", site_audit)
    sold_out = _extract_int(r"(\d+) of 16 products are \"Sold out\"", site_audit)

    gaps = [
        {
            "gap": "No founder story on-site",
            "impact": "B2B/DTC buyers do not get a human reason to trust Glue Masters.",
            "source": "site-audit.md / review-cmo.md",
        },
        {
            "gap": "No founder photo or visual about-page proof",
            "impact": "The About page reads like copy, not a real business with a real operator behind it.",
            "source": "site-audit.md",
        },
        {
            "gap": "Proof is buried",
            "impact": f"{_fmt_int(review_count)} reviews and Amazon credibility are not carrying the homepage.",
            "source": "site-audit.md",
        },
        {
            "gap": "PetiteKeep / Shark Tank credibility is not packaged",
            "impact": "The best DTC pattern-match asset still is not a case study, testimonial, or short founder-facing narrative.",
            "source": "strategy-review.md",
        },
    ]

    inconsistencies = [
        {
            "issue": "Largest partner volume is described inconsistently",
            "detail": "site-audit says '3,000 bottles/month' while strategy-review frames PetiteKeep as '3,000 lbs/month'.",
            "action": "Pick one verified number before it appears on any public page.",
        },
        {
            "issue": "Supplier / origin wording is fuzzy",
            "detail": "Audit suggests 'Manufactured in the USA, domestic supplier in Chicago' while other docs center Glue Masters brand trust more than manufacturing origin.",
            "action": "Lock the exact compliant wording for origin / supplier story before publishing B2B copy.",
        },
    ]

    copy_blocks = {
        "homepage_hero": [
            {
                "headline": "Professional-grade CA glue trusted by makers, builders, and growing production teams.",
                "subhead": f"Surface {_fmt_int(review_count)} reviews, Amazon credibility, and a clean B2B path instead of leading with a product grid.",
                "cta_primary": "Shop by viscosity",
                "cta_secondary": "Get volume pricing",
            },
            {
                "headline": "The glue that shows up right, every time.",
                "subhead": "Use the reliability angle from the CMO review instead of generic supplier language.",
                "cta_primary": "Shop Glue Masters",
                "cta_secondary": "See wholesale options",
            },
        ],
        "b2b_hero": [
            {
                "headline": "You scaled a brand. We make sure the glue never slows you down.",
                "subhead": "Best fit for DTC founder / COO buyers per strategy-review.md.",
                "cta": "Request a sample kit",
            },
            {
                "headline": "Eliminate adhesive as a variable in your production line.",
                "subhead": "Works for more industrial buyers; pair it with proof, not generic 'partner' language.",
                "cta": "Talk pricing",
            },
        ],
        "trust_bar": [
            f"{_fmt_int(review_count)} reviews",
            "Amazon-proven formulas",
            "Sample kits ready",
            "Wholesale support for repeat production",
        ],
        "about_page_skeleton": [
            "Who Ev is and what made commodity glue supply feel broken",
            "Why consistency / availability matters more than clever marketing in production",
            "What Glue Masters obsesses over: viscosity consistency, response speed, and no-surprise replenishment",
            "Proof: reviews, B2B buyers, sample kits, and the strongest named or anonymized case study",
            "A clean call to action: buy retail, request volume pricing, or request a kit",
        ],
    }

    founder_inputs = [
        "One honest sentence on origin: what problem Ev saw first-hand that made Glue Masters worth building.",
        "A specific obsession statement: what Glue Masters refuses to be sloppy about (consistency, speed, support, etc.).",
        "Whether PetiteKeep / Shark Tank can be named publicly, anonymized, or only referenced privately.",
        "The exact verified high-volume proof number (bottles/month vs lbs/month).",
        "Final approved origin/manufacturing wording for the B2B page.",
    ]

    quick_wins = [
        "Add one founder block to the About page before doing a full redesign.",
        "Promote reviews + Amazon proof into the homepage hero/trust bar.",
        "Swap vague B2B CTA copy for 'Request sample kit' now that kits are ready.",
        f"Hide or fix the {sold_out} sold-out products before asking B2B buyers to trust supply reliability." if sold_out is not None else "Hide or fix sold-out products before asking B2B buyers to trust supply reliability.",
    ]

    return {
        "date": date_str,
        "generated_at": generated_at,
        "summary": {
            "review_count": review_count,
            "proof_points": len(_proof_points(site_audit, memory_text)),
            "gaps": len(gaps),
            "inconsistencies": len(inconsistencies),
            "copy_blocks": sum(len(v) for v in copy_blocks.values() if isinstance(v, list)),
        },
        "proof_points": _proof_points(site_audit, memory_text),
        "narrative_gaps": gaps,
        "inconsistencies": inconsistencies,
        "copy_blocks": copy_blocks,
        "founder_inputs_needed": founder_inputs,
        "quick_wins": quick_wins,
        "sources": [
            str(SITE_AUDIT.relative_to(ROOT)),
            str(CMO_REVIEW.relative_to(ROOT)),
            str(STRATEGY_REVIEW.relative_to(ROOT)),
            str(MEMORY.relative_to(ROOT)),
            str(BUSINESS_STATE.relative_to(ROOT)),
        ],
    }


def render_markdown(payload: dict[str, Any]) -> str:
    s = payload["summary"]
    out = [
        f"# Brand Narrative Desk — {payload['date']}",
        "",
        f"Generated: {payload['generated_at']}",
        "",
        "## Snapshot",
        f"- Review proof available: **{_fmt_int(s['review_count'])} reviews**",
        f"- Usable proof points packaged: **{s['proof_points']}**",
        f"- Narrative gaps blocking trust: **{s['gaps']}**",
        f"- Messaging inconsistencies to verify: **{s['inconsistencies']}**",
        "",
        "## Proof points ready to use",
    ]
    for item in payload["proof_points"]:
        out.append(f"- **{item['label']}** — {item['value']} ({item['note']}; source: {item['source']})")
    out.extend([
        "",
        "## Biggest narrative gaps",
    ])
    for item in payload["narrative_gaps"]:
        out.append(f"- **{item['gap']}** — {item['impact']} (source: {item['source']})")
    out.extend([
        "",
        "## Copy blocks to test tomorrow",
        "### Homepage hero options",
    ])
    for item in payload["copy_blocks"]["homepage_hero"]:
        out.append(f"- **{item['headline']}** — {item['subhead']} CTA: `{item['cta_primary']}` / `{item['cta_secondary']}`")
    out.append("")
    out.append("### B2B hero options")
    for item in payload["copy_blocks"]["b2b_hero"]:
        out.append(f"- **{item['headline']}** — {item['subhead']} CTA: `{item['cta']}`")
    out.append("")
    out.append("### Trust bar")
    for line in payload["copy_blocks"]["trust_bar"]:
        out.append(f"- {line}")
    out.append("")
    out.append("### About page skeleton")
    for line in payload["copy_blocks"]["about_page_skeleton"]:
        out.append(f"- {line}")
    out.extend([
        "",
        "## Founder inputs still needed",
    ])
    for line in payload["founder_inputs_needed"]:
        out.append(f"- {line}")
    out.extend([
        "",
        "## Inconsistencies to resolve before publishing",
    ])
    for item in payload["inconsistencies"]:
        out.append(f"- **{item['issue']}** — {item['detail']} Next: {item['action']}")
    out.extend([
        "",
        "## Fastest wins",
    ])
    for line in payload["quick_wins"]:
        out.append(f"- {line}")
    out.append("")
    return "\n".join(out) + "\n"


def render_html(payload: dict[str, Any]) -> str:
    s = payload["summary"]

    def bullet_list(items: list[str]) -> str:
        return "".join(f"<li>{escape(item)}</li>" for item in items)

    proof_html = "".join(
        f"<li><b>{escape(item['label'])}</b> — {escape(item['value'])} <span class='meta'>· {escape(item['note'])}</span></li>"
        for item in payload["proof_points"]
    )
    gap_html = "".join(
        f"<li><b>{escape(item['gap'])}</b> — {escape(item['impact'])} <span class='meta'>· {escape(item['source'])}</span></li>"
        for item in payload["narrative_gaps"]
    )
    inconsistency_html = "".join(
        f"<li><b>{escape(item['issue'])}</b> — {escape(item['detail'])} <span class='meta'>· {escape(item['action'])}</span></li>"
        for item in payload["inconsistencies"]
    )

    home_cards = "".join(
        f"<div class='mini'><h4>{escape(item['headline'])}</h4><p>{escape(item['subhead'])}</p><div class='meta'>{escape(item['cta_primary'])} · {escape(item['cta_secondary'])}</div></div>"
        for item in payload["copy_blocks"]["homepage_hero"]
    )
    b2b_cards = "".join(
        f"<div class='mini'><h4>{escape(item['headline'])}</h4><p>{escape(item['subhead'])}</p><div class='meta'>{escape(item['cta'])}</div></div>"
        for item in payload["copy_blocks"]["b2b_hero"]
    )

    return f"""<!doctype html>
<html lang=\"en\">
<head>
<meta charset=\"utf-8\" />
<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
<title>Brand Narrative Desk — {escape(payload['date'])}</title>
<style>
:root {{--bg:#0A1628;--surface:#111B2E;--surface2:#0F1A2C;--border:#1E293B;--text:#fff;--muted:#94A3B8;--accent:#3B82F6;--warn:#F59E0B;}}
*{{box-sizing:border-box}} body{{margin:0;padding:24px;background:var(--bg);color:var(--text);font-family:Inter,-apple-system,sans-serif}}
.wrap{{max-width:1200px;margin:0 auto}} .grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin:14px 0}}
.card,.panel,.mini{{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px}}
.k{{color:var(--muted);font-size:12px}} .v{{font-size:26px;font-weight:750;margin-top:4px}} .meta,.muted{{color:var(--muted)}}
.two{{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}} @media (max-width: 900px){{.two{{grid-template-columns:1fr}}}}
ul{{margin:8px 0 0 18px}} li{{margin:7px 0}} h4{{margin:0 0 8px}} .stack{{display:grid;gap:10px}} a{{color:#93C5FD}}
</style>
</head>
<body>
<div class=\"wrap\">
  <h1>Brand Narrative Desk</h1>
  <div class=\"muted\">{escape(payload['generated_at'])} · founder story, proof, and messaging gaps packaged for a morning copy pass</div>
  <p><a href=\"./morning-ops-hub-latest.html\">Open full ops hub</a> · <a href=\"../gluemasters-bizdev/strategy/site-audit.md\">Site audit</a> · <a href=\"../gluemasters-bizdev/b2b/strategy-review.md\">Strategy review</a></p>
  <div class=\"grid\">
    <div class=\"card\"><div class=\"k\">Reviews</div><div class=\"v\">{escape(_fmt_int(s['review_count']))}</div></div>
    <div class=\"card\"><div class=\"k\">Proof points</div><div class=\"v\">{s['proof_points']}</div></div>
    <div class=\"card\"><div class=\"k\">Narrative gaps</div><div class=\"v\">{s['gaps']}</div></div>
    <div class=\"card\"><div class=\"k\">Inconsistencies</div><div class=\"v\">{s['inconsistencies']}</div></div>
  </div>
  <div class=\"two\">
    <div class=\"panel\"><h3>Proof points ready</h3><ul>{proof_html}</ul></div>
    <div class=\"panel\"><h3>Biggest gaps</h3><ul>{gap_html}</ul></div>
  </div>
  <div class=\"two\">
    <div class=\"panel\"><h3>Homepage hero options</h3><div class=\"stack\">{home_cards}</div></div>
    <div class=\"panel\"><h3>B2B hero options</h3><div class=\"stack\">{b2b_cards}</div></div>
  </div>
  <div class=\"two\">
    <div class=\"panel\"><h3>Trust bar + About skeleton</h3><ul>{bullet_list(payload['copy_blocks']['trust_bar'] + payload['copy_blocks']['about_page_skeleton'])}</ul></div>
    <div class=\"panel\"><h3>Founder inputs still needed</h3><ul>{bullet_list(payload['founder_inputs_needed'])}</ul></div>
  </div>
  <div class=\"panel\"><h3>Resolve before publishing</h3><ul>{inconsistency_html}</ul></div>
  <div class=\"panel\"><h3>Fastest wins</h3><ul>{bullet_list(payload['quick_wins'])}</ul></div>
</div>
</body>
</html>
"""


def main() -> int:
    parser = argparse.ArgumentParser(description="Build brand narrative desk from Glue Masters strategy docs")
    parser.add_argument("--date", help="Output date YYYY-MM-DD")
    args = parser.parse_args()

    now = datetime.now().astimezone()
    date_str = args.date or now.strftime("%Y-%m-%d")
    generated_at = now.strftime("%Y-%m-%d %H:%M %Z")
    payload = build_payload(date_str, generated_at)

    REPORTS.mkdir(parents=True, exist_ok=True)
    md_path = REPORTS / f"brand-narrative-desk-{date_str}.md"
    html_path = REPORTS / f"brand-narrative-desk-{date_str}.html"
    json_path = REPORTS / f"brand-narrative-desk-{date_str}.json"

    md_path.write_text(render_markdown(payload), encoding="utf-8")
    html_path.write_text(render_html(payload), encoding="utf-8")
    json_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    _clone_latest(md_path, REPORTS / "brand-narrative-desk-latest.md")
    _clone_latest(html_path, REPORTS / "brand-narrative-desk-latest.html")
    _clone_latest(json_path, REPORTS / "brand-narrative-desk-latest.json")

    print(f"Built {md_path.relative_to(ROOT)}")
    print(f"Built {html_path.relative_to(ROOT)}")
    print(f"Built {json_path.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
