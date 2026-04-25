#!/usr/bin/env python3
"""Build a local Amazon Ads pull incident report from the latest pull log + snapshot.

Outputs:
- reports/ads-pull-incident-YYYY-MM-DD.json (+ latest)
- reports/ads-pull-incident-YYYY-MM-DD.md (+ latest)
- reports/ads-pull-incident-YYYY-MM-DD.html (+ latest)

Purpose:
- Turn the raw ads-daily log into a morning-ready diagnosis.
- Show which report types are stuck, for how long, and what fallback path was attempted.
- Give Ev concrete next commands instead of making him read a 1,000-line log.
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
from collections import Counter
from datetime import datetime
from html import escape
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
REPORTS_DIR = ROOT / "reports"
ADS_LOG_DIR = ROOT / "logs" / "ads-daily"
ADS_DAILY_DIR = ROOT / "moneysamurai" / "data" / "ads" / "daily"

REQUEST_RE = re.compile(r"📊 Requesting report: (?P<name>.+)")
REPORT_ID_RE = re.compile(r"Report ID:\s*(?P<id>[0-9a-fA-F-]{36})(?P<duplicate>.*reused duplicate.*)?")
POLL_RE = re.compile(r"⏳ Polling (?P<label>.+?) \(timeout (?P<timeout>\d+)s\)")
STATUS_RE = re.compile(r"\[(?P<elapsed>\d+)s\] Status: (?P<status>[A-Z_]+)")
TIMEOUT_RE = re.compile(r"❌ (?P<report>[a-z\-terms\[\]0-9]+(?:\[[^\]]+\])?) timed out after (?P<timeout>\d+)s")
FAILED_ATTEMPT_RE = re.compile(r"❌ (?P<report>[a-z\-]+) failed \(attempt (?P<attempt>\d+)\)")
FAILED_FINAL_RE = re.compile(r"🚨 (?P<report>[a-z\-]+) FAILED after (?P<attempts>\d+) attempts")
DUPLICATE_PENDING_RE = re.compile(r"Duplicate is still (?P<status>[A-Z_]+) — requesting a fresh report as: (?P<name>.+)")
DUPLICATE_STUCK_RE = re.compile(r"Duplicate still (?P<status>[A-Z_]+) after re-request attempts")
SHIFTED_RANGE_RE = re.compile(r"Shifted start date to (?P<date>\d{4}-\d{2}-\d{2})")
SNAPSHOT_RE = re.compile(r"📂 Snapshot key: (?P<date>\d{4}-\d{2}-\d{2})")
DATE_RANGE_RE = re.compile(r"📅 Date range: (?P<start>\d{4}-\d{2}-\d{2}) → (?P<end>\d{4}-\d{2}-\d{2})")
SAVED_ROWS_RE = re.compile(r"💾 Saved (?P<name>[a-z\-]+)\.json \((?P<rows>\d+) rows\)")
DETAILS_RE = re.compile(r"· Details: (?P<json>\{.+\})")


def _clone_latest(versioned: Path, latest: Path) -> None:
    latest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(versioned, latest)


def _find_latest_pull_log() -> Path | None:
    if not ADS_LOG_DIR.exists():
        return None
    candidates = sorted(ADS_LOG_DIR.rglob("*.log"), key=lambda p: p.stat().st_mtime, reverse=True)
    return candidates[0] if candidates else None


def _read_json(path: Path) -> dict[str, Any] | None:
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def _rel(path: Path | None) -> str | None:
    if not path:
        return None
    try:
        return str(path.relative_to(ROOT))
    except Exception:
        return str(path)


def _report_key(report_name: str) -> str:
    if report_name.startswith("search-terms"):
        return "search-terms"
    if report_name.startswith("campaigns"):
        return "campaigns"
    if report_name.startswith("keywords"):
        return "keywords"
    if report_name.startswith("search"):
        return "search-terms"
    return report_name.split("-", 1)[0]


def parse_log(log_path: Path) -> dict[str, Any]:
    lines = log_path.read_text(encoding="utf-8", errors="replace").splitlines()
    incidents: dict[str, dict[str, Any]] = {}
    snapshot_date = None
    date_range: dict[str, str] = {}
    saved_rows: dict[str, int] = {}
    current: dict[str, Any] | None = None

    def ensure_incident(name: str) -> dict[str, Any]:
        key = _report_key(name)
        item = incidents.setdefault(
            key,
            {
                "report": key,
                "attempts": [],
                "timeouts": 0,
                "duplicate_pending_retries": 0,
                "duplicate_ids": [],
                "status_counts": {},
                "final_status": "unknown",
                "shifted_start_dates": [],
                "saved_rows": None,
                "max_poll_elapsed": 0,
                "details": [],
            },
        )
        return item

    for raw in lines:
        line = raw.strip("\n")

        if m := SNAPSHOT_RE.search(line):
            snapshot_date = m.group("date")
        if m := DATE_RANGE_RE.search(line):
            date_range = {"start": m.group("start"), "end": m.group("end")}
        if m := SHIFTED_RANGE_RE.search(line):
            if current:
                incident = ensure_incident(current["report_name"])
                incident["shifted_start_dates"].append(m.group("date"))
                current.setdefault("shifted_start_dates", []).append(m.group("date"))

        if m := REQUEST_RE.search(line):
            report_name = m.group("name")
            incident = ensure_incident(report_name)
            current = {
                "report_name": report_name,
                "label": report_name,
                "report_id": None,
                "duplicate": False,
                "timeout_seconds": None,
                "statuses": [],
                "duplicate_pending_retries": 0,
                "duplicate_stuck": False,
                "shifted_start_dates": [],
                "created_details": [],
                "timed_out": False,
                "completed": False,
                "failed_attempt": None,
            }
            incident["attempts"].append(current)
            continue

        if current is None:
            if m := SAVED_ROWS_RE.search(line):
                saved_rows[m.group("name")] = int(m.group("rows"))
            continue

        if m := REPORT_ID_RE.search(line):
            current["report_id"] = m.group("id").lower()
            current["duplicate"] = bool(m.group("duplicate"))
            incident = ensure_incident(current["report_name"])
            if current["duplicate"] and current["report_id"] not in incident["duplicate_ids"]:
                incident["duplicate_ids"].append(current["report_id"])
            continue

        if m := DUPLICATE_PENDING_RE.search(line):
            current["duplicate_pending_retries"] += 1
            incident = ensure_incident(current["report_name"])
            incident["duplicate_pending_retries"] += 1
            continue

        if DUPLICATE_STUCK_RE.search(line):
            current["duplicate_stuck"] = True
            continue

        if m := POLL_RE.search(line):
            current["label"] = m.group("label")
            current["timeout_seconds"] = int(m.group("timeout"))
            continue

        if m := STATUS_RE.search(line):
            elapsed = int(m.group("elapsed"))
            status = m.group("status")
            current["statuses"].append({"elapsed": elapsed, "status": status})
            incident = ensure_incident(current["report_name"])
            incident["max_poll_elapsed"] = max(incident["max_poll_elapsed"], elapsed)
            counts = Counter(incident["status_counts"])
            counts[status] += 1
            incident["status_counts"] = dict(counts)
            continue

        if m := DETAILS_RE.search(line):
            try:
                payload = json.loads(m.group("json"))
            except Exception:
                payload = {"raw": m.group("json")}
            current["created_details"].append(payload)
            incident = ensure_incident(current["report_name"])
            if len(incident["details"]) < 6:
                incident["details"].append(payload)
            continue

        if TIMEOUT_RE.search(line):
            current["timed_out"] = True
            incident = ensure_incident(current["report_name"])
            incident["timeouts"] += 1
            continue

        if FAILED_ATTEMPT_RE.search(line):
            current["failed_attempt"] = True
            continue

        if FAILED_FINAL_RE.search(line):
            incident = ensure_incident(current["report_name"])
            incident["final_status"] = "failed"
            current = None
            continue

        if "completed!" in line:
            current["completed"] = True
            incident = ensure_incident(current["report_name"])
            incident["final_status"] = "completed"
            continue

        if m := SAVED_ROWS_RE.search(line):
            saved_rows[m.group("name")] = int(m.group("rows"))

    for key, incident in incidents.items():
        incident["saved_rows"] = saved_rows.get(key)
        attempts = incident["attempts"]
        if incident["final_status"] == "unknown":
            if any(a.get("completed") for a in attempts):
                incident["final_status"] = "completed"
            elif any(a.get("timed_out") for a in attempts):
                incident["final_status"] = "timed_out"
        incident["attempt_count"] = len(attempts)
        incident["stuck_duplicate"] = any(a.get("duplicate_stuck") for a in attempts)
        incident["longest_timeout_seconds"] = max((a.get("timeout_seconds") or 0) for a in attempts)
        incident["last_report_id"] = next((a.get("report_id") for a in reversed(attempts) if a.get("report_id")), None)

    return {
        "snapshot_date": snapshot_date,
        "date_range": date_range,
        "incidents": list(incidents.values()),
        "saved_rows": saved_rows,
        "line_count": len(lines),
    }


def build_payload(date_str: str, log_path: Path) -> dict[str, Any]:
    parsed = parse_log(log_path)
    snapshot_date = parsed.get("snapshot_date")
    status_path = ADS_DAILY_DIR / snapshot_date / "pull-status.json" if snapshot_date else None
    pull_status = _read_json(status_path) if status_path else None

    incidents = parsed["incidents"]
    incident_map = {i["report"]: i for i in incidents}
    failed = list((pull_status or {}).get("failedReports") or [])
    report_bytes = (pull_status or {}).get("reportBytes") or {}
    row_counts = (pull_status or {}).get("rowCounts") or {}
    detail_map = (pull_status or {}).get("failedReportDetails") or {}

    next_steps = []
    if snapshot_date:
        next_steps.extend(
            [
                f"python3 moneysamurai/tools/ads-report-inspect.py --from-log {_rel(log_path)} --watch --interval 30 --timeout 1200",
                f"python3 moneysamurai/scripts/ads-daily-pull.py {parsed.get('date_range', {}).get('start', snapshot_date)} {parsed.get('date_range', {}).get('end', snapshot_date)}",
            ]
        )
    next_steps.append("python3 scripts/ads_pull_incident_report.py")

    findings = []
    suspected_cause = []

    core_failed = [r for r in failed if r in {"campaigns", "keywords"}]
    if core_failed:
        findings.append(f"Core datasets failed: {', '.join(core_failed)}. Search terms still landed, so the outage is partial rather than a total auth failure.")
    if incident_map.get("campaigns", {}).get("stuck_duplicate") or incident_map.get("keywords", {}).get("stuck_duplicate"):
        suspected_cause.append("Amazon returned duplicate report IDs that remained PENDING even after fresh-name retries.")
    long_pending = [
        f"{item['report']} ({item['max_poll_elapsed']}s max observed)"
        for item in incidents
        if item.get("max_poll_elapsed", 0) >= 900 and item["report"] in {"campaigns", "keywords"}
    ]
    if long_pending:
        suspected_cause.append("Campaign and keyword reports appear stuck in Amazon's reporting queue, not locally failing fast.")
        findings.append("Long pending windows observed: " + ", ".join(long_pending) + ".")
    if incident_map.get("search-terms", {}).get("final_status") == "completed":
        st_rows = row_counts.get("search-terms")
        findings.append(f"Chunked search-term fallback succeeded and preserved {st_rows} rows, so search-term diagnostics are still usable.")
    if report_bytes.get("campaigns") == 2 and report_bytes.get("keywords") == 2:
        findings.append("campaigns.json and keywords.json were saved as literal empty arrays (`[]`), which matches the silent-failure pattern rather than a real zero-spend day.")
    if not suspected_cause:
        suspected_cause.append("No single cause proved from local logs alone; inspect live report IDs if this reproduces.")

    severity = "ok"
    if core_failed:
        severity = "critical"
    elif failed:
        severity = "warning"

    core_incidents = [i for i in incidents if i.get("report") in {"campaigns", "keywords"}]

    return {
        "date": date_str,
        "generated_at": datetime.now().astimezone().strftime("%Y-%m-%d %H:%M %Z"),
        "severity": severity,
        "latest_pull_log": _rel(log_path),
        "snapshot_date": snapshot_date,
        "date_range": parsed.get("date_range") or {},
        "pull_status": pull_status,
        "incidents": incidents,
        "summary": {
            "failed_reports": failed,
            "core_reports_failed": core_failed,
            "search_terms_rows": row_counts.get("search-terms"),
            "campaigns_rows": row_counts.get("campaigns"),
            "keywords_rows": row_counts.get("keywords"),
            "duplicate_pending_retries": sum(int(i.get("duplicate_pending_retries") or 0) for i in incidents),
            "timeouts": sum(int(i.get("timeouts") or 0) for i in incidents),
            "core_duplicate_pending_retries": sum(int(i.get("duplicate_pending_retries") or 0) for i in core_incidents),
            "core_timeouts": sum(int(i.get("timeouts") or 0) for i in core_incidents),
            "stuck_duplicate_reports": [i["report"] for i in incidents if i.get("stuck_duplicate")],
        },
        "suspected_cause": suspected_cause,
        "findings": findings,
        "next_steps": next_steps,
        "failed_report_details": detail_map,
    }


def render_markdown(payload: dict[str, Any]) -> str:
    summary = payload["summary"]
    incidents = payload["incidents"]
    out = []
    out.append(f"# Ads Pull Incident Report — {payload['date']}")
    out.append("")
    out.append(f"Generated: {payload['generated_at']}")
    out.append(f"Log: `{payload.get('latest_pull_log') or '—'}`")
    out.append(f"Snapshot: `{payload.get('snapshot_date') or '—'}`")
    out.append("")
    out.append("## Executive summary")
    out.append(f"- Severity: **{payload['severity'].upper()}**")
    out.append(f"- Failed reports: **{', '.join(summary.get('failed_reports') or ['none'])}**")
    out.append(f"- Core duplicate pending retries: **{summary.get('core_duplicate_pending_retries', 0)}**")
    out.append(f"- Core report timeouts: **{summary.get('core_timeouts', 0)}**")
    out.append("")
    out.append("## Likely cause")
    for item in payload.get("suspected_cause") or []:
        out.append(f"- {item}")
    out.append("")
    out.append("## Findings")
    for item in payload.get("findings") or []:
        out.append(f"- {item}")
    out.append("")
    out.append("## Report breakdown")
    out.append("| report | final | attempts | timeouts | dup pending retries | max poll | rows saved | last report id |")
    out.append("|---|---|---:|---:|---:|---:|---:|---|")
    for incident in incidents:
        out.append(
            f"| {incident['report']} | {incident.get('final_status','—')} | {incident.get('attempt_count',0)} | {incident.get('timeouts',0)} | {incident.get('duplicate_pending_retries',0)} | {incident.get('max_poll_elapsed',0)}s | {incident.get('saved_rows','—')} | {incident.get('last_report_id') or '—'} |"
        )
    out.append("")
    out.append("## Next commands")
    for cmd in payload.get("next_steps") or []:
        out.append(f"```bash\n{cmd}\n```")
    out.append("")
    return "\n".join(out) + "\n"


def render_html(payload: dict[str, Any]) -> str:
    summary = payload["summary"]
    incidents = payload["incidents"]
    status_badge = {
        "critical": "<span class='pill bad'>CRITICAL</span>",
        "warning": "<span class='pill warn'>WARNING</span>",
        "ok": "<span class='pill ok'>OK</span>",
    }.get(payload["severity"], "<span class='pill'>UNKNOWN</span>")

    cards = [
        ("Snapshot", payload.get("snapshot_date") or "—"),
        ("Failed reports", ", ".join(summary.get("failed_reports") or []) or "none"),
        ("Core dup retries", str(summary.get("core_duplicate_pending_retries", 0))),
        ("Core timeouts", str(summary.get("core_timeouts", 0))),
    ]
    cards_html = "".join(
        f"<div class='card'><div class='k'>{escape(k)}</div><div class='v'>{escape(v)}</div></div>" for k, v in cards
    )
    findings_html = "".join(f"<li>{escape(item)}</li>" for item in payload.get("findings") or []) or "<li class='muted'>No findings.</li>"
    cause_html = "".join(f"<li>{escape(item)}</li>" for item in payload.get("suspected_cause") or []) or "<li class='muted'>No cause identified.</li>"
    next_html = "".join(f"<div class='cmd'>{escape(cmd)}</div>" for cmd in payload.get("next_steps") or [])
    rows_html = "".join(
        "<tr>"
        f"<td class='mono'>{escape(incident['report'])}</td>"
        f"<td>{escape(str(incident.get('final_status','—')))}</td>"
        f"<td class='mono'>{incident.get('attempt_count', 0)}</td>"
        f"<td class='mono'>{incident.get('timeouts', 0)}</td>"
        f"<td class='mono'>{incident.get('duplicate_pending_retries', 0)}</td>"
        f"<td class='mono'>{incident.get('max_poll_elapsed', 0)}s</td>"
        f"<td class='mono'>{escape(str(incident.get('saved_rows', '—')))}</td>"
        f"<td class='mono'>{escape(str(incident.get('last_report_id') or '—'))}</td>"
        "</tr>"
        for incident in incidents
    )

    return f"""<!doctype html>
<html>
<head>
  <meta charset='utf-8' />
  <meta name='viewport' content='width=device-width, initial-scale=1' />
  <title>Ads Pull Incident Report — {escape(payload['date'])}</title>
  <style>
    :root {{ --bg:#0A1628; --surface:#111B2E; --border:rgba(148,163,184,0.18); --text:#fff; --muted:#94A3B8; --blue:#3B82F6; --green:#22C55E; --yellow:#F59E0B; --red:#EF4444; --mono:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace; }}
    *{{box-sizing:border-box}} body{{margin:0;background:var(--bg);color:var(--text);font-family:Inter,-apple-system,sans-serif}}
    .wrap{{max-width:1180px;margin:0 auto;padding:24px}} .sub{{color:var(--muted);margin-top:6px}} .grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin:16px 0}}
    .card,.panel{{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px}} .k{{color:var(--muted);font-size:12px}} .v{{margin-top:8px;font-size:20px;font-weight:750}}
    .pill{{display:inline-block;padding:4px 9px;border-radius:999px;font-size:12px;border:1px solid var(--border)}} .pill.ok{{color:#BBF7D0;background:rgba(34,197,94,.14)}} .pill.warn{{color:#FDE68A;background:rgba(245,158,11,.14)}} .pill.bad{{color:#FECACA;background:rgba(239,68,68,.16)}}
    table{{width:100%;border-collapse:collapse}} th,td{{padding:9px 8px;border-bottom:1px solid var(--border);text-align:left;vertical-align:top}} th{{color:var(--muted);font-size:12px}} .mono{{font-family:var(--mono)}}
    ul{{margin:8px 0 0 18px}} li{{margin:6px 0}} .cmd{{font-family:var(--mono);font-size:12px;background:rgba(148,163,184,.08);border:1px solid var(--border);padding:10px;border-radius:10px;margin-top:10px;white-space:pre-wrap}}
    .two{{display:grid;grid-template-columns:1fr 1fr;gap:12px}} @media (max-width:900px){{.two{{grid-template-columns:1fr}}}}
    a{{color:#93C5FD}}
  </style>
</head>
<body>
<div class='wrap'>
  <h1>Amazon Ads Pull Incident Report</h1>
  <div class='sub'>{escape(payload['generated_at'])} · {status_badge} · log <span class='mono'>{escape(payload.get('latest_pull_log') or '—')}</span></div>

  <div class='grid'>{cards_html}</div>

  <div class='two'>
    <div class='panel'><h3 style='margin:0'>Likely cause</h3><ul>{cause_html}</ul></div>
    <div class='panel'><h3 style='margin:0'>What matters</h3><ul>{findings_html}</ul></div>
  </div>

  <div class='panel' style='margin-top:12px'>
    <h3 style='margin:0 0 8px'>Report breakdown</h3>
    <table>
      <thead><tr><th>Report</th><th>Final</th><th>Attempts</th><th>Timeouts</th><th>Dup retries</th><th>Max poll</th><th>Rows</th><th>Last report ID</th></tr></thead>
      <tbody>{rows_html}</tbody>
    </table>
  </div>

  <div class='panel' style='margin-top:12px'>
    <h3 style='margin:0 0 8px'>Next commands</h3>
    {next_html}
  </div>
</div>
</body>
</html>
"""


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Build Amazon Ads pull incident report")
    parser.add_argument("--date", help="Output label date (YYYY-MM-DD). Defaults to local today.")
    parser.add_argument("--log", help="Optional specific ads-daily log path to parse.")
    args = parser.parse_args(argv)

    now = datetime.now().astimezone()
    date_str = args.date or now.strftime("%Y-%m-%d")
    log_path = Path(args.log) if args.log else _find_latest_pull_log()
    if not log_path or not log_path.exists():
        raise SystemExit("No ads-daily log found to build incident report")
    if not log_path.is_absolute():
        log_path = (ROOT / log_path).resolve()

    payload = build_payload(date_str, log_path)

    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    json_path = REPORTS_DIR / f"ads-pull-incident-{date_str}.json"
    md_path = REPORTS_DIR / f"ads-pull-incident-{date_str}.md"
    html_path = REPORTS_DIR / f"ads-pull-incident-{date_str}.html"

    json_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    md_path.write_text(render_markdown(payload), encoding="utf-8")
    html_path.write_text(render_html(payload), encoding="utf-8")

    _clone_latest(json_path, REPORTS_DIR / "ads-pull-incident-latest.json")
    _clone_latest(md_path, REPORTS_DIR / "ads-pull-incident-latest.md")
    _clone_latest(html_path, REPORTS_DIR / "ads-pull-incident-latest.html")

    print(f"Built {json_path.relative_to(ROOT)}")
    print(f"Built {md_path.relative_to(ROOT)}")
    print(f"Built {html_path.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
