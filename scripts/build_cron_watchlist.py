#!/usr/bin/env python3
"""Build a timeout headroom watchlist from an OpenClaw cron list snapshot.

Usage:
  python3 scripts/build_cron_watchlist.py input.json output_prefix

Writes:
  <output_prefix>.json
  <output_prefix>.md
  <output_prefix>.html
"""

from __future__ import annotations

import html
import json
import math
import sys
from datetime import datetime
from pathlib import Path
from typing import Any


def iso_to_local(ms: int | None) -> str | None:
    if not ms:
        return None
    return datetime.fromtimestamp(ms / 1000).astimezone().strftime("%Y-%m-%d %H:%M:%S %Z")


def proposed_timeout(timeout_s: int | None, last_duration_ms: int | None, status: str | None, error: str | None) -> int | None:
    if timeout_s is None:
        return None
    baseline = timeout_s
    if last_duration_ms:
        needed = math.ceil((last_duration_ms / 1000) * 1.75)
        baseline = max(baseline, needed)
    if error and "timed out" in error.lower():
        baseline = max(baseline, timeout_s * 2)
    if status == "error":
        baseline = max(baseline, timeout_s + 30)
    return int(math.ceil(baseline / 30) * 30)


def classify(job: dict[str, Any]) -> dict[str, Any]:
    payload = job.get("payload", {})
    state = job.get("state", {})
    timeout_s = payload.get("timeoutSeconds")
    last_duration_ms = state.get("lastDurationMs")
    last_status = state.get("lastStatus") or state.get("lastRunStatus")
    last_error = state.get("lastError") or state.get("lastErrorReason")

    ratio = None
    if timeout_s and last_duration_ms is not None:
        ratio = last_duration_ms / (timeout_s * 1000)

    risk = "ok"
    reasons: list[str] = []
    if timeout_s is None:
        risk = "unknown"
        reasons.append("No explicit timeoutSeconds set.")
    else:
        if last_error and "timed out" in str(last_error).lower():
            risk = "critical"
            reasons.append("Latest run failed due to timeout.")
        elif ratio is not None and ratio >= 0.85:
            risk = "high"
            reasons.append(f"Latest run used {ratio:.0%} of the timeout budget.")
        elif ratio is not None and ratio >= 0.65:
            risk = "medium"
            reasons.append(f"Latest run used {ratio:.0%} of the timeout budget.")
        else:
            reasons.append("Latest run has comfortable timeout headroom.")

    proposed = proposed_timeout(timeout_s, last_duration_ms, last_status, str(last_error) if last_error else None)

    job_type = payload.get("kind", "unknown")
    return {
        "id": job.get("id"),
        "name": job.get("name"),
        "enabled": job.get("enabled"),
        "job_type": job_type,
        "schedule": job.get("schedule"),
        "model": payload.get("model"),
        "timeout_seconds": timeout_s,
        "last_status": last_status,
        "last_duration_ms": last_duration_ms,
        "last_error": last_error,
        "consecutive_errors": state.get("consecutiveErrors", 0),
        "last_run_at": iso_to_local(state.get("lastRunAtMs")),
        "next_run_at": iso_to_local(state.get("nextRunAtMs")),
        "timeout_ratio": None if ratio is None else round(ratio, 3),
        "risk": risk,
        "reasons": reasons,
        "proposed_timeout_seconds": proposed,
        "recommended_patch": None if proposed is None or timeout_s is None or proposed <= timeout_s else {
            "jobId": job.get("id"),
            "patch": {"payload": {"timeoutSeconds": proposed}}
        },
    }


def risk_sort_key(item: dict[str, Any]) -> tuple[int, float]:
    order = {"critical": 0, "high": 1, "medium": 2, "ok": 3, "unknown": 4}
    ratio = item.get("timeout_ratio")
    return (order.get(item.get("risk"), 99), -(ratio or 0.0))


def render_markdown(report: dict[str, Any]) -> str:
    lines = [
        f"# {report['title']}",
        "",
        f"Generated: {report['generated_at']}",
        "",
        "## Summary",
        "",
    ]
    for key, value in report["summary"].items():
        lines.append(f"- **{key.replace('_', ' ')}:** {value}")
    lines.extend(["", "## Jobs", ""])
    for job in report["jobs"]:
        ratio = "n/a" if job["timeout_ratio"] is None else f"{job['timeout_ratio']*100:.0f}%"
        lines.extend([
            f"### {job['name']}",
            f"- job id: `{job['id']}`",
            f"- risk: **{job['risk']}**",
            f"- last status: `{job['last_status']}`",
            f"- last duration: `{job['last_duration_ms']}` ms",
            f"- timeout: `{job['timeout_seconds']}` s",
            f"- budget used: `{ratio}`",
            f"- proposed timeout: `{job['proposed_timeout_seconds']}` s",
        ])
        if job.get("last_error"):
            lines.append(f"- last error: `{job['last_error']}`")
        for reason in job["reasons"]:
            lines.append(f"- note: {reason}")
        if job.get("recommended_patch"):
            lines.append("- patch:")
            lines.append("```json")
            lines.append(json.dumps(job["recommended_patch"], indent=2))
            lines.append("```")
        lines.append("")
    return "\n".join(lines)


def render_html(report: dict[str, Any]) -> str:
    def esc(x: Any) -> str:
        return html.escape("" if x is None else str(x))

    colors = {
        "critical": "#dc2626",
        "high": "#d97706",
        "medium": "#ca8a04",
        "ok": "#16a34a",
        "unknown": "#64748b",
    }
    cards = []
    for job in report["jobs"]:
        ratio = "n/a" if job["timeout_ratio"] is None else f"{job['timeout_ratio']*100:.0f}%"
        patch = ""
        if job.get("recommended_patch"):
            patch = f"<pre>{esc(json.dumps(job['recommended_patch'], indent=2))}</pre>"
        reasons = "".join(f"<li>{esc(reason)}</li>" for reason in job["reasons"])
        cards.append(f"""
        <section class='card'>
          <div class='top'>
            <div>
              <h2>{esc(job['name'])}</h2>
              <div class='muted mono'>{esc(job['id'])}</div>
            </div>
            <span class='badge' style='background:{colors[job['risk']]}'>{esc(job['risk'].upper())}</span>
          </div>
          <div class='stats'>
            <div><span>last status</span><strong>{esc(job['last_status'])}</strong></div>
            <div><span>last duration</span><strong>{esc(job['last_duration_ms'])} ms</strong></div>
            <div><span>timeout</span><strong>{esc(job['timeout_seconds'])} s</strong></div>
            <div><span>budget used</span><strong>{esc(ratio)}</strong></div>
            <div><span>proposed timeout</span><strong>{esc(job['proposed_timeout_seconds'])} s</strong></div>
          </div>
          <ul>{reasons}</ul>
          {patch}
        </section>
        """)
    summary_html = "".join(
        f"<div><span>{esc(key.replace('_', ' '))}</span><strong>{esc(value)}</strong></div>"
        for key, value in report["summary"].items()
    )
    return f"""<!doctype html>
<html>
<head>
<meta charset='utf-8'>
<title>{esc(report['title'])}</title>
<style>
body {{ font-family: Inter, -apple-system, sans-serif; background:#0f172a; color:#e2e8f0; margin:0; padding:32px; }}
.wrap {{ max-width:1200px; margin:0 auto; }}
.summary, .stats {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:12px; }}
.summary div, .stats div {{ background:#0b1220; border:1px solid #1e293b; border-radius:12px; padding:14px; }}
.card {{ background:#111827; border:1px solid #1f2937; border-radius:16px; padding:20px; margin-top:18px; }}
.top {{ display:flex; justify-content:space-between; gap:16px; align-items:flex-start; }}
.badge {{ color:#fff; padding:6px 10px; border-radius:999px; font-weight:700; font-size:12px; }}
span {{ display:block; color:#94a3b8; font-size:12px; text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px; }}
strong {{ font-size:18px; }}
.muted {{ color:#94a3b8; }}
.mono {{ font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size:13px; }}
pre {{ white-space:pre-wrap; background:#020617; border:1px solid #1e293b; border-radius:12px; padding:12px; overflow:auto; }}
ul {{ margin:10px 0 0 20px; }}
h1,h2 {{ margin:0; }}
</style>
</head>
<body><div class='wrap'>
<h1>{esc(report['title'])}</h1>
<p class='muted'>Generated at {esc(report['generated_at'])}</p>
<div class='summary'>{summary_html}</div>
{''.join(cards)}
</div></body>
</html>"""


def main() -> int:
    if len(sys.argv) != 3:
        print("Usage: build_cron_watchlist.py input.json output_prefix", file=sys.stderr)
        return 2

    input_path = Path(sys.argv[1])
    output_prefix = Path(sys.argv[2])
    raw = json.loads(input_path.read_text())
    rows = [classify(job) for job in raw.get("jobs", []) if job.get("payload", {}).get("kind") == "agentTurn" and job.get("enabled")]
    rows.sort(key=risk_sort_key)
    summary = {
        "jobs_scanned": len(rows),
        "critical": sum(1 for row in rows if row["risk"] == "critical"),
        "high": sum(1 for row in rows if row["risk"] == "high"),
        "medium": sum(1 for row in rows if row["risk"] == "medium"),
        "patches_ready": sum(1 for row in rows if row.get("recommended_patch")),
    }
    report = {
        "generated_at": datetime.now().astimezone().strftime("%Y-%m-%d %H:%M:%S %Z"),
        "title": "Cron timeout headroom watchlist",
        "summary": summary,
        "jobs": rows,
    }
    output_prefix.parent.mkdir(parents=True, exist_ok=True)
    output_prefix.with_suffix(".json").write_text(json.dumps(report, indent=2))
    output_prefix.with_suffix(".md").write_text(render_markdown(report))
    output_prefix.with_suffix(".html").write_text(render_html(report))
    print(str(output_prefix))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
