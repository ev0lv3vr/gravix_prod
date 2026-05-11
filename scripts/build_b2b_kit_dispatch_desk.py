#!/usr/bin/env python3
"""build_b2b_kit_dispatch_desk.py

Build a morning-ready B2B sample-kit dispatch desk from the hydrated recipient list.

Outputs:
- reports/b2b-kit-dispatch-desk-YYYY-MM-DD.md
- reports/b2b-kit-dispatch-desk-YYYY-MM-DD.html
- reports/b2b-kit-dispatch-desk-YYYY-MM-DD.json
- reports/b2b-kit-dispatch-labels-YYYY-MM-DD.csv
- reports/b2b-kit-dispatch-desk-latest.md
- reports/b2b-kit-dispatch-desk-latest.html
- reports/b2b-kit-dispatch-desk-latest.json
- reports/b2b-kit-dispatch-labels-latest.csv
"""

from __future__ import annotations

import argparse
import csv
import json
import shutil
from dataclasses import asdict, dataclass
from datetime import date, datetime, timedelta
from html import escape
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
REPORTS = ROOT / "reports"
SOURCE_JSON = ROOT / "gluemasters-bizdev" / "b2b" / "b2b-kit-recipients-2026-05-05.json"


@dataclass
class Prospect:
    bucket: str
    priority: str
    company: str
    contact: str
    attention: str | None
    ship_to: str | None
    email: str | None
    phone: str | None
    status: str
    reason: str
    angle: str | None = None
    kit_mix: list[str] | None = None
    subject: str | None = None
    motion: str | None = None
    category: str | None = None


@dataclass
class FollowUp:
    label: str
    offset_days: int
    due_date: str
    action: str


CATEGORY_LABELS = {
    "ready_now": "Ready now",
    "verify_then_ship": "Verify then ship",
    "needs_info": "Needs info first",
    "next_wave": "Next wave",
    "do_not_ship": "Do not ship cold",
}


def _clone_latest(versioned: Path, latest: Path) -> None:
    shutil.copyfile(versioned, latest)


def _load() -> dict[str, Any]:
    return json.loads(SOURCE_JSON.read_text(encoding="utf-8"))


def _status_category(bucket: str, status: str) -> str:
    if bucket == "do_not_ship":
        return "do_not_ship"
    if status == "ready_to_ship":
        return "ready_now"
    if status in {"verify_email_then_ship", "verify_email_before_ship", "verify_production_facility", "identify_contact", "verify_contact"}:
        return "verify_then_ship"
    if status in {"address_needed", "needs_enrichment_refresh"}:
        return "needs_info"
    if bucket == "batch2":
        return "next_wave"
    return "needs_info"


def _prospects(payload: dict[str, Any]) -> list[Prospect]:
    out: list[Prospect] = []
    for item in payload.get("batch0Warm", []):
        out.append(
            Prospect(
                bucket="batch0",
                priority=str(item.get("priority", "—")),
                company=item["company"],
                contact=item.get("contact") or "—",
                attention=item.get("contact"),
                ship_to=item.get("shipTo"),
                email=item.get("email"),
                phone=item.get("phone"),
                status=item.get("status", "unknown"),
                reason=item.get("reason", ""),
                motion="Warm / existing",
            )
        )
    for item in payload.get("batch1ColdWhales", []):
        emails = ", ".join(item.get("emailCandidates") or []) or None
        out.append(
            Prospect(
                bucket="batch1",
                priority=str(item.get("priority", "—")),
                company=item["company"],
                contact=item.get("attention") or item.get("secondaryContact") or "—",
                attention=item.get("attention"),
                ship_to=item.get("shipTo"),
                email=emails,
                phone=item.get("phone"),
                status=item.get("status", "unknown"),
                reason=item.get("angle", ""),
                angle=item.get("angle"),
                kit_mix=item.get("kitMix") or [],
                subject=item.get("sameDayEmailSubject"),
                motion="Cold whale Play B",
            )
        )
    for item in payload.get("batch2Next", []):
        out.append(
            Prospect(
                bucket="batch2",
                priority=str(item.get("priority", "—")),
                company=item["company"],
                contact=item.get("attention") or "—",
                attention=item.get("attention"),
                ship_to=item.get("shipTo"),
                email=item.get("email"),
                phone=item.get("phone"),
                status=item.get("status", "unknown"),
                reason=item.get("reason", item.get("status", "")),
                motion="Batch 2",
            )
        )
    for item in payload.get("doNotShipCold", []):
        out.append(
            Prospect(
                bucket="do_not_ship",
                priority="—",
                company=item["company"],
                contact="—",
                attention=None,
                ship_to=None,
                email=None,
                phone=None,
                status="do_not_ship",
                reason=item.get("reason", ""),
                motion="Hold",
            )
        )
    for prospect in out:
        prospect.category = _status_category(prospect.bucket, prospect.status)
    return out


def _followups(ship_date: date) -> list[FollowUp]:
    return [
        FollowUp("Day 0", 0, ship_date.isoformat(), "Ship kit + same-day email"),
        FollowUp("Day 4", 4, (ship_date + timedelta(days=4)).isoformat(), "Check that the kit landed"),
        FollowUp("Day 7", 7, (ship_date + timedelta(days=7)).isoformat(), "LinkedIn touch where contact exists"),
        FollowUp("Day 10", 10, (ship_date + timedelta(days=10)).isoformat(), "Cost-per-bond / volume math email"),
        FollowUp("Day 14", 14, (ship_date + timedelta(days=14)).isoformat(), "Phone follow-up to facility"),
        FollowUp("Day 21", 21, (ship_date + timedelta(days=21)).isoformat(), "Case-study / social proof follow-up"),
        FollowUp("Day 30", 30, (ship_date + timedelta(days=30)).isoformat(), "Close-loop / park for nurture"),
    ]


def build_payload(date_str: str, generated_at: str, ship_date: date) -> dict[str, Any]:
    raw = _load()
    prospects = _prospects(raw)
    summary = {
        "total_prospects": len(prospects),
        "ready_now": sum(1 for p in prospects if p.category == "ready_now"),
        "verify_then_ship": sum(1 for p in prospects if p.category == "verify_then_ship"),
        "needs_info": sum(1 for p in prospects if p.category == "needs_info"),
        "next_wave": sum(1 for p in prospects if p.category == "next_wave"),
        "do_not_ship": sum(1 for p in prospects if p.category == "do_not_ship"),
    }
    ready_batch = [p for p in prospects if p.category in {"ready_now", "verify_then_ship"} and p.bucket in {"batch0", "batch1"}]
    label_rows = [
        {
            "priority": p.priority,
            "company": p.company,
            "attention": p.attention or p.contact,
            "ship_to": p.ship_to or "",
            "motion": p.motion or "",
            "category": CATEGORY_LABELS[p.category],
            "subject": p.subject or "",
        }
        for p in ready_batch
        if p.ship_to
    ]
    return {
        "date": date_str,
        "generated_at": generated_at,
        "ship_date": ship_date.isoformat(),
        "source": str(SOURCE_JSON.relative_to(ROOT)),
        "status": _load().get("status"),
        "strategy_notes": raw.get("strategyNotes") or [],
        "summary": summary,
        "ready_batch": [asdict(p) for p in ready_batch],
        "needs_info": [asdict(p) for p in prospects if p.category == "needs_info"],
        "next_wave": [asdict(p) for p in prospects if p.category == "next_wave"],
        "do_not_ship": [asdict(p) for p in prospects if p.category == "do_not_ship"],
        "follow_up_cadence": [asdict(f) for f in _followups(ship_date)],
        "labels": label_rows,
    }


def render_markdown(payload: dict[str, Any]) -> str:
    s = payload["summary"]
    out = [
        f"# B2B Kit Dispatch Desk — {payload['date']}",
        "",
        f"Generated: {payload['generated_at']}",
        f"Planned ship date: {payload['ship_date']}",
        f"Source: `{payload['source']}`",
        "",
        "## Snapshot",
        f"- Ready now: **{s['ready_now']}**",
        f"- Verify then ship: **{s['verify_then_ship']}**",
        f"- Needs info first: **{s['needs_info']}**",
        f"- Next wave: **{s['next_wave']}**",
        f"- Hold / do not ship cold: **{s['do_not_ship']}**",
        "",
        "## Strategy guardrails",
    ]
    for note in payload["strategy_notes"]:
        out.append(f"- {note}")
    out.append("")

    out.append("## Ready batch")
    for item in payload["ready_batch"]:
        line = f"- **{item['priority']} · {item['company']}** — {item['motion']} · {CATEGORY_LABELS[item['category']]}"
        if item.get("ship_to"):
            line += f" · ship to: {item['ship_to']}"
        if item.get("attention"):
            line += f" · attention: {item['attention']}"
        if item.get("subject"):
            line += f" · email subject: `{item['subject']}`"
        out.append(line)
        if item.get("reason"):
            out.append(f"  - Why: {item['reason']}")
        if item.get("kit_mix"):
            out.append(f"  - Kit mix: {', '.join(item['kit_mix'])}")
    out.append("")

    for title, key in [("Needs info first", "needs_info"), ("Next wave", "next_wave"), ("Do not ship cold", "do_not_ship")]:
        out.append(f"## {title}")
        items = payload[key]
        if not items:
            out.append("- None")
        else:
            for item in items:
                line = f"- **{item['company']}** — {item['reason']}"
                if item.get("status"):
                    line += f" ({item['status']})"
                out.append(line)
        out.append("")

    out.append("## Follow-up cadence")
    for item in payload["follow_up_cadence"]:
        out.append(f"- **{item['label']} — {item['due_date']}**: {item['action']}")
    out.append("")
    return "\n".join(out) + "\n"


def render_html(payload: dict[str, Any]) -> str:
    s = payload["summary"]
    cards = [
        ("Ready now", s["ready_now"]),
        ("Verify then ship", s["verify_then_ship"]),
        ("Needs info", s["needs_info"]),
        ("Next wave", s["next_wave"]),
        ("Hold", s["do_not_ship"]),
    ]
    cards_html = "".join(f"<div class='card'><div class='k'>{escape(str(k))}</div><div class='v'>{escape(str(v))}</div></div>" for k, v in cards)

    def render_table(items: list[dict[str, Any]], include_subject: bool = False) -> str:
        if not items:
            return "<tr><td colspan='6' class='muted'>Nothing here.</td></tr>"
        rows = []
        for item in items:
            subject = f"<div class='meta'>Subject: {escape(item['subject'])}</div>" if include_subject and item.get("subject") else ""
            kit = f"<div class='meta'>Kit: {escape(', '.join(item.get('kit_mix') or []))}</div>" if item.get("kit_mix") else ""
            rows.append(
                "<tr>"
                f"<td>{escape(item['priority'])}</td>"
                f"<td><b>{escape(item['company'])}</b><div class='meta'>{escape(item.get('motion') or '')}</div></td>"
                f"<td>{escape(item.get('attention') or item.get('contact') or '—')}</td>"
                f"<td>{escape(item.get('ship_to') or '—')}</td>"
                f"<td>{escape(CATEGORY_LABELS.get(item['category'], item['category']))}</td>"
                f"<td>{escape(item.get('reason') or '')}{subject}{kit}</td>"
                "</tr>"
            )
        return "".join(rows)

    notes_html = "".join(f"<li>{escape(note)}</li>" for note in payload["strategy_notes"])
    cadence_html = "".join(
        f"<li><b>{escape(item['label'])}</b> · {escape(item['due_date'])} — {escape(item['action'])}</li>"
        for item in payload["follow_up_cadence"]
    )
    label_text = "\n".join(
        f"- {row['priority']} · {row['company']} — {row['attention']} — {row['ship_to']}"
        for row in payload["labels"]
    )
    return f"""<!doctype html>
<html lang=\"en\">
<head>
<meta charset=\"utf-8\" />
<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
<title>B2B Kit Dispatch Desk — {escape(payload['date'])}</title>
<style>
:root {{--bg:#0A1628;--surface:#111B2E;--surface2:#0F1A2C;--border:#1E293B;--text:#fff;--muted:#94A3B8;--accent:#3B82F6;}}
*{{box-sizing:border-box}} body{{margin:0;padding:24px;background:var(--bg);color:var(--text);font-family:Inter,-apple-system,sans-serif}}
.wrap{{max-width:1240px;margin:0 auto}} .grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}}
.card,.panel{{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px}} .card .k{{color:var(--muted);font-size:12px}} .card .v{{font-size:28px;font-weight:760;margin-top:4px}}
.panel{{margin-top:12px}} .two{{display:grid;grid-template-columns:1.2fr .8fr;gap:12px;margin-top:12px}} @media (max-width: 980px){{.two{{grid-template-columns:1fr}}}}
.muted,.meta{{color:var(--muted)}} .links{{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0 18px}} a.link{{color:#93C5FD;text-decoration:none;background:#102446;border:1px solid var(--border);padding:6px 10px;border-radius:10px;font-size:13px}}
button{{background:var(--accent);border:none;color:#fff;border-radius:10px;padding:8px 10px;font-weight:650;cursor:pointer}} table{{width:100%;border-collapse:collapse}} th,td{{padding:9px;border-bottom:1px solid var(--border);text-align:left;vertical-align:top}} th{{color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.06em}}
ul{{margin:8px 0 0 18px}} li{{margin:6px 0}}
</style>
</head>
<body>
<div class=\"wrap\">
  <h1>B2B Kit Dispatch Desk</h1>
  <div class=\"muted\">{escape(payload['generated_at'])} · planned ship date {escape(payload['ship_date'])} · source {escape(payload['source'])}</div>
  <div class=\"links\"><a class=\"link\" href=\"../gluemasters-bizdev/b2b/b2b-kit-recipient-list-2026-05-05.md\">Recipient notes</a><a class=\"link\" href=\"../gluemasters-bizdev/b2b/outreach-log.md\">Outreach log</a><a class=\"link\" href=\"./b2b-kit-dispatch-labels-latest.csv\">Label CSV</a><a class=\"link\" href=\"./morning-ops-hub-latest.html\">Morning ops hub</a></div>
  <p><button id=\"copyReady\">Copy ready batch</button></p>
  <div class=\"grid\">{cards_html}</div>
  <div class=\"two\">
    <div class=\"panel\">
      <h3>Ready batch</h3>
      <table>
        <thead><tr><th>Priority</th><th>Company</th><th>Attention</th><th>Ship-to</th><th>Status</th><th>Why / subject</th></tr></thead>
        <tbody>{render_table(payload['ready_batch'], include_subject=True)}</tbody>
      </table>
    </div>
    <div>
      <div class=\"panel\"><h3>Strategy guardrails</h3><ul>{notes_html}</ul></div>
      <div class=\"panel\"><h3>Follow-up cadence</h3><ul>{cadence_html}</ul></div>
    </div>
  </div>
  <div class=\"two\">
    <div class=\"panel\"><h3>Needs info first</h3><table><thead><tr><th>Company</th><th>What’s missing</th></tr></thead><tbody>{''.join(f"<tr><td><b>{escape(i['company'])}</b></td><td>{escape(i['reason'])} <span class='meta'>({escape(i['status'])})</span></td></tr>" for i in payload['needs_info']) or "<tr><td colspan='2' class='muted'>Nothing here.</td></tr>"}</tbody></table></div>
    <div class=\"panel\"><h3>Next wave / hold</h3><table><thead><tr><th>Company</th><th>Note</th></tr></thead><tbody>{''.join(f"<tr><td><b>{escape(i['company'])}</b></td><td>{escape(i['reason'])}</td></tr>" for i in (payload['next_wave'] + payload['do_not_ship'])) or "<tr><td colspan='2' class='muted'>Nothing here.</td></tr>"}</tbody></table></div>
  </div>
</div>
<script>
const copyText = {json.dumps(label_text)};
document.getElementById('copyReady').addEventListener('click', () => navigator.clipboard.writeText(copyText).catch(() => window.prompt('Copy this text:', copyText)));
</script>
</body>
</html>
"""


def write_csv(rows: list[dict[str, Any]], path: Path) -> None:
    with path.open("w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=["priority", "company", "attention", "ship_to", "motion", "category", "subject"])
        writer.writeheader()
        writer.writerows(rows)


def main() -> int:
    parser = argparse.ArgumentParser(description="Build B2B kit dispatch desk")
    parser.add_argument("--date", help="Output date YYYY-MM-DD")
    parser.add_argument("--ship-date", help="Planned ship date YYYY-MM-DD (defaults to output date)")
    args = parser.parse_args()

    now = datetime.now().astimezone()
    date_str = args.date or now.strftime("%Y-%m-%d")
    ship_date = date.fromisoformat(args.ship_date or date_str)
    generated_at = now.strftime("%Y-%m-%d %H:%M %Z")
    payload = build_payload(date_str, generated_at, ship_date)

    REPORTS.mkdir(parents=True, exist_ok=True)
    md_path = REPORTS / f"b2b-kit-dispatch-desk-{date_str}.md"
    html_path = REPORTS / f"b2b-kit-dispatch-desk-{date_str}.html"
    json_path = REPORTS / f"b2b-kit-dispatch-desk-{date_str}.json"
    csv_path = REPORTS / f"b2b-kit-dispatch-labels-{date_str}.csv"

    md_path.write_text(render_markdown(payload), encoding="utf-8")
    html_path.write_text(render_html(payload), encoding="utf-8")
    json_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    write_csv(payload["labels"], csv_path)

    _clone_latest(md_path, REPORTS / "b2b-kit-dispatch-desk-latest.md")
    _clone_latest(html_path, REPORTS / "b2b-kit-dispatch-desk-latest.html")
    _clone_latest(json_path, REPORTS / "b2b-kit-dispatch-desk-latest.json")
    _clone_latest(csv_path, REPORTS / "b2b-kit-dispatch-labels-latest.csv")

    print(f"Built {md_path.relative_to(ROOT)}")
    print(f"Built {html_path.relative_to(ROOT)}")
    print(f"Built {json_path.relative_to(ROOT)}")
    print(f"Built {csv_path.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
