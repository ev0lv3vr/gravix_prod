#!/usr/bin/env python3
"""build_artifact_freshness_report.py

Generate a trust/freshness report for the morning ops artifact stack.

Outputs:
- reports/artifact-freshness-YYYY-MM-DD.md
- reports/artifact-freshness-YYYY-MM-DD.html
- reports/artifact-freshness-YYYY-MM-DD.json
- reports/artifact-freshness-latest.md
- reports/artifact-freshness-latest.html
- reports/artifact-freshness-latest.json
"""

from __future__ import annotations

import argparse
import json
import shutil
from dataclasses import asdict, dataclass
from datetime import datetime
from html import escape
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
REPORTS = ROOT / "reports"

EXPECTED = [
    ("Morning Ops Hub", "morning-ops-hub", ["html"]),
    ("Morning Priority Pack", "morning-priority-pack", ["md"]),
    ("Morning Execution Board", "morning-execution-board", ["html", "json"]),
    ("Morning Handoff", "morning-handoff", ["html", "json", "md"]),
    ("Morning Decision Desk", "morning-decision-desk", ["html", "json", "md"]),
    ("Morning Customer Desk", "morning-customer-desk", ["html", "json", "md"]),
    ("Morning Money Desk", "morning-money-desk", ["html", "json", "md"]),
    ("Supplier Ops Desk", "supplier-ops-desk", ["html", "json", "md"]),
    ("Morning Commerce Desk", "morning-commerce-desk", ["html", "json", "md"]),
    ("Brand Narrative Desk", "brand-narrative-desk", ["html", "json", "md"]),
    ("B2B Kit Dispatch Desk", "b2b-kit-dispatch-desk", ["html", "json", "md"]),
    ("B2B Kit Dispatch Labels", "b2b-kit-dispatch-labels", ["csv"]),
    ("Morning Unblock Desk", "morning-unblock-desk", ["html", "json", "md"]),
    ("Morning Delta Brief", "morning-delta-brief", ["html", "json", "md"]),
    ("Morning Exception Desk", "morning-exception-desk", ["html", "json", "md"]),
    ("Artifact Freshness", "artifact-freshness", ["html", "json", "md"]),
    ("Git Hygiene", "git-hygiene", ["html", "json", "md"]),
    ("Business State Audit", "state-audit", ["html", "json", "md"]),
    ("Ops Debt Dashboard", "ops-debt-dashboard", ["html", "json"]),
    ("Ads Pull Dashboard", "ads-pull-dashboard", ["html", "json"]),
    ("Ads Pull Incident", "ads-pull-incident", ["html", "json", "md"]),
    ("Ads Growth Readiness Desk", "ads-growth-readiness", ["html", "json", "md"]),
    ("Ops Build Brief", "ops-build-brief", ["txt"]),
]


@dataclass
class ArtifactStatus:
    label: str
    basename: str
    dated_path: str
    latest_path: str
    dated_exists: bool
    latest_exists: bool
    dated_mtime: str | None
    latest_mtime: str | None
    dated_age_minutes: int | None
    latest_age_minutes: int | None
    latest_matches_dated: bool | None
    latest_payload_date: str | None
    status: str
    note: str


@dataclass
class Summary:
    target_date: str
    generated_at: str
    total_artifacts: int
    ok: int
    stale: int
    missing: int
    mismatched: int
    newest_latest_mtime: str | None
    oldest_latest_mtime: str | None


def _clone_latest(versioned: Path, latest: Path) -> None:
    shutil.copyfile(versioned, latest)


def _mtime(path: Path, now: datetime) -> tuple[str, int]:
    dt = datetime.fromtimestamp(path.stat().st_mtime, tz=now.tzinfo)
    age = max(int((now - dt).total_seconds() // 60), 0)
    return dt.strftime("%Y-%m-%d %H:%M %Z"), age


def _load_payload_date(path: Path) -> str | None:
    if path.suffix != ".json" or not path.exists():
        return None
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return None
    if isinstance(payload, dict):
        value = payload.get("date") or payload.get("generated_for")
        if isinstance(value, str):
            return value
    return None


def inspect_artifact(now: datetime, date_str: str, label: str, basename: str, extensions: list[str]) -> ArtifactStatus:
    dated = REPORTS / f"{basename}-{date_str}.{extensions[0]}"
    latest = REPORTS / f"{basename}-latest.{extensions[0]}"
    for ext in extensions:
        candidate_dated = REPORTS / f"{basename}-{date_str}.{ext}"
        candidate_latest = REPORTS / f"{basename}-latest.{ext}"
        if candidate_dated.exists() or candidate_latest.exists():
            dated, latest = candidate_dated, candidate_latest
            break

    dated_exists = dated.exists()
    latest_exists = latest.exists()
    dated_mtime = dated_age = None
    latest_mtime = latest_age = None
    if dated_exists:
        dated_mtime, dated_age = _mtime(dated, now)
    if latest_exists:
        latest_mtime, latest_age = _mtime(latest, now)

    latest_matches_dated: bool | None = None
    if dated_exists and latest_exists:
        try:
            latest_matches_dated = dated.read_bytes() == latest.read_bytes()
        except Exception:
            latest_matches_dated = None

    latest_payload_date = _load_payload_date(latest)

    status = "ok"
    note = "Fresh and aligned"
    if not dated_exists or not latest_exists:
        status = "missing"
        missing_parts = []
        if not dated_exists:
            missing_parts.append("dated missing")
        if not latest_exists:
            missing_parts.append("latest missing")
        note = ", ".join(missing_parts)
    elif latest_matches_dated is False:
        status = "mismatched"
        note = "latest artifact differs from today's dated build"
    elif latest_payload_date and latest_payload_date != date_str:
        status = "stale"
        note = f"latest payload date is {latest_payload_date}"
    elif latest_age is not None and latest_age >= 240:
        status = "stale"
        note = f"latest file is {latest_age} min old"

    return ArtifactStatus(
        label=label,
        basename=basename,
        dated_path=str(dated.relative_to(ROOT)),
        latest_path=str(latest.relative_to(ROOT)),
        dated_exists=dated_exists,
        latest_exists=latest_exists,
        dated_mtime=dated_mtime,
        latest_mtime=latest_mtime,
        dated_age_minutes=dated_age,
        latest_age_minutes=latest_age,
        latest_matches_dated=latest_matches_dated,
        latest_payload_date=latest_payload_date,
        status=status,
        note=note,
    )


def build_payload(date_str: str, generated_at: str) -> dict[str, Any]:
    now = datetime.now().astimezone()
    artifacts = [inspect_artifact(now, date_str, label, basename, extensions) for label, basename, extensions in EXPECTED]
    latest_times = [a.latest_mtime for a in artifacts if a.latest_mtime]
    payload = {
        "summary": asdict(Summary(
            target_date=date_str,
            generated_at=generated_at,
            total_artifacts=len(artifacts),
            ok=sum(1 for a in artifacts if a.status == "ok"),
            stale=sum(1 for a in artifacts if a.status == "stale"),
            missing=sum(1 for a in artifacts if a.status == "missing"),
            mismatched=sum(1 for a in artifacts if a.status == "mismatched"),
            newest_latest_mtime=max(latest_times) if latest_times else None,
            oldest_latest_mtime=min(latest_times) if latest_times else None,
        )),
        "artifacts": [asdict(a) for a in artifacts],
    }
    return payload


def render_markdown(payload: dict[str, Any]) -> str:
    s = payload["summary"]
    lines = [
        f"# Artifact Freshness Report — {s['target_date']}",
        "",
        f"Generated: {s['generated_at']}",
        "",
        "## Snapshot",
        f"- OK: **{s['ok']}** / {s['total_artifacts']}",
        f"- Stale: **{s['stale']}**",
        f"- Missing: **{s['missing']}**",
        f"- Mismatched latest vs dated: **{s['mismatched']}**",
        f"- Newest latest artifact: **{s['newest_latest_mtime'] or '—'}**",
        f"- Oldest latest artifact: **{s['oldest_latest_mtime'] or '—'}**",
        "",
        "## Artifact details",
    ]
    for item in payload["artifacts"]:
        lines.append(
            f"- **{item['label']}** — {item['status'].upper()} · {item['note']} "
            f"(latest: {item['latest_path']} @ {item['latest_mtime'] or '—'}; dated: {item['dated_path']} @ {item['dated_mtime'] or '—'})"
        )
    lines.append("")
    return "\n".join(lines)


def render_html(payload: dict[str, Any]) -> str:
    s = payload["summary"]
    rows = []
    for item in payload["artifacts"]:
        badge = item["status"].upper()
        rows.append(
            "<tr>"
            f"<td>{escape(item['label'])}</td>"
            f"<td><span class='badge {escape(item['status'])}'>{badge}</span></td>"
            f"<td>{escape(item['note'])}</td>"
            f"<td>{escape(item['latest_path'])}</td>"
            f"<td>{escape(item['latest_mtime'] or '—')}</td>"
            f"<td>{escape(item['dated_path'])}</td>"
            f"<td>{escape(item['dated_mtime'] or '—')}</td>"
            "</tr>"
        )
    return f"""<!doctype html>
<html lang=\"en\">
<head>
<meta charset=\"utf-8\" />
<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
<title>Artifact Freshness Report — {escape(s['target_date'])}</title>
<style>
:root {{--bg:#0A1628;--surface:#111B2E;--border:#1E293B;--text:#fff;--muted:#94A3B8;--accent:#3B82F6;--good:#22c55e;--warn:#f59e0b;--bad:#ef4444;}}
*{{box-sizing:border-box}} body{{margin:0;padding:24px;background:var(--bg);color:var(--text);font-family:Inter,-apple-system,sans-serif}}
.wrap{{max-width:1280px;margin:0 auto}} .grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}}
.card,.panel{{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px}}
.k{{color:var(--muted);font-size:12px}} .v{{font-size:26px;font-weight:750;margin-top:4px}} .muted{{color:var(--muted)}}
table{{width:100%;border-collapse:collapse;font-size:13px}} th,td{{padding:8px;border-bottom:1px solid var(--border);text-align:left;vertical-align:top}} th{{color:var(--muted);font-size:11px;text-transform:uppercase}}
.badge{{display:inline-block;border-radius:999px;padding:3px 9px;font-size:12px;font-weight:700}} .badge.ok{{background:#123524;color:#86efac}} .badge.stale{{background:#3b2a10;color:#fcd34d}} .badge.missing,.badge.mismatched{{background:#3d1616;color:#fca5a5}}
a{{color:#93C5FD;text-decoration:none}}
</style>
</head>
<body>
<div class=\"wrap\">
  <h1>Artifact Freshness Report</h1>
  <div class=\"muted\">{escape(s['generated_at'])} · trust check for the morning ops stack</div>
  <p><a href=\"./morning-ops-hub-latest.html\">Open morning ops hub</a></p>
  <div class=\"grid\">
    <div class=\"card\"><div class=\"k\">OK</div><div class=\"v\">{s['ok']}</div></div>
    <div class=\"card\"><div class=\"k\">Stale</div><div class=\"v\">{s['stale']}</div></div>
    <div class=\"card\"><div class=\"k\">Missing</div><div class=\"v\">{s['missing']}</div></div>
    <div class=\"card\"><div class=\"k\">Mismatched</div><div class=\"v\">{s['mismatched']}</div></div>
  </div>
  <div class=\"panel\" style=\"margin-top:12px\">
    <table>
      <thead><tr><th>Artifact</th><th>Status</th><th>Note</th><th>Latest path</th><th>Latest mtime</th><th>Dated path</th><th>Dated mtime</th></tr></thead>
      <tbody>{''.join(rows)}</tbody>
    </table>
  </div>
</div>
</body>
</html>
"""


def main() -> int:
    parser = argparse.ArgumentParser(description="Build artifact freshness report")
    parser.add_argument("--date", help="Output date YYYY-MM-DD")
    args = parser.parse_args()

    now = datetime.now().astimezone()
    date_str = args.date or now.strftime("%Y-%m-%d")
    generated_at = now.strftime("%Y-%m-%d %H:%M %Z")
    payload = build_payload(date_str, generated_at)

    REPORTS.mkdir(parents=True, exist_ok=True)
    md_path = REPORTS / f"artifact-freshness-{date_str}.md"
    html_path = REPORTS / f"artifact-freshness-{date_str}.html"
    json_path = REPORTS / f"artifact-freshness-{date_str}.json"

    md_path.write_text(render_markdown(payload), encoding="utf-8")
    html_path.write_text(render_html(payload), encoding="utf-8")
    json_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    _clone_latest(md_path, REPORTS / "artifact-freshness-latest.md")
    _clone_latest(html_path, REPORTS / "artifact-freshness-latest.html")
    _clone_latest(json_path, REPORTS / "artifact-freshness-latest.json")

    # Rebuild once after writing so the freshness report can accurately inspect itself.
    payload = build_payload(date_str, generated_at)
    md_path.write_text(render_markdown(payload), encoding="utf-8")
    html_path.write_text(render_html(payload), encoding="utf-8")
    json_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    _clone_latest(md_path, REPORTS / "artifact-freshness-latest.md")
    _clone_latest(html_path, REPORTS / "artifact-freshness-latest.html")
    _clone_latest(json_path, REPORTS / "artifact-freshness-latest.json")

    print(f"Built {md_path.relative_to(ROOT)}")
    print(f"Built {html_path.relative_to(ROOT)}")
    print(f"Built {json_path.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
