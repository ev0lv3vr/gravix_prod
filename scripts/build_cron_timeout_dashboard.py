#!/usr/bin/env python3
"""Build a lightweight HTML dashboard for cron timeout triage.

Input: JSON file with structure:
{
  "generated_at": "...",
  "title": "...",
  "summary": {...},
  "jobs": [
    {
      "name": "...",
      "job_id": "...",
      "status": "degraded",
      "schedule": "...",
      "last_ok_duration_ms": 12345,
      "latest_timeout_at": "...",
      "timeouts": 3,
      "last_runs": [
        {"at": "...", "status": "ok|error", "duration_ms": 123, "note": "..."}
      ],
      "findings": ["..."],
      "next_actions": ["..."]
    }
  ]
}

Usage:
  python3 scripts/build_cron_timeout_dashboard.py input.json output.html
"""

from __future__ import annotations

import html
import json
import sys
from pathlib import Path


def badge(status: str) -> str:
    colors = {
        "healthy": "#16a34a",
        "degraded": "#d97706",
        "failing": "#dc2626",
        "unknown": "#64748b",
    }
    color = colors.get(status, colors["unknown"])
    label = html.escape(status.upper())
    return f'<span class="badge" style="background:{color}">{label}</span>'


def esc(value) -> str:
    return html.escape("" if value is None else str(value))


def render(data: dict) -> str:
    jobs_html = []
    for job in data.get("jobs", []):
        runs = "".join(
            f"<tr><td>{esc(run.get('at'))}</td><td>{esc(run.get('status'))}</td><td>{esc(run.get('duration_ms'))}</td><td>{esc(run.get('note'))}</td></tr>"
            for run in job.get("last_runs", [])
        ) or '<tr><td colspan="4">No run data</td></tr>'
        findings = "".join(f"<li>{esc(x)}</li>" for x in job.get("findings", []))
        actions = "".join(f"<li>{esc(x)}</li>" for x in job.get("next_actions", []))
        jobs_html.append(
            f"""
            <section class="card">
              <div class="row between start">
                <div>
                  <h2>{esc(job.get('name'))}</h2>
                  <div class="muted mono">job_id: {esc(job.get('job_id'))}</div>
                  <div class="muted">schedule: {esc(job.get('schedule'))}</div>
                </div>
                <div>{badge(job.get('status', 'unknown'))}</div>
              </div>
              <div class="stats">
                <div><span>timeouts</span><strong>{esc(job.get('timeouts'))}</strong></div>
                <div><span>latest timeout</span><strong>{esc(job.get('latest_timeout_at'))}</strong></div>
                <div><span>last known ok</span><strong>{esc(job.get('last_ok_duration_ms'))} ms</strong></div>
              </div>
              <div class="grid">
                <div>
                  <h3>Findings</h3>
                  <ul>{findings}</ul>
                </div>
                <div>
                  <h3>Next actions</h3>
                  <ul>{actions}</ul>
                </div>
              </div>
              <h3>Recent runs</h3>
              <table>
                <thead><tr><th>At</th><th>Status</th><th>Duration ms</th><th>Note</th></tr></thead>
                <tbody>{runs}</tbody>
              </table>
            </section>
            """
        )

    summary = data.get("summary", {})
    summary_html = "".join(
        f"<div><span>{esc(k.replace('_', ' '))}</span><strong>{esc(v)}</strong></div>"
        for k, v in summary.items()
    )

    return f"""<!doctype html>
<html>
<head>
  <meta charset=\"utf-8\" />
  <title>{esc(data.get('title', 'Cron Timeout Dashboard'))}</title>
  <style>
    body {{ font-family: Inter, -apple-system, sans-serif; background:#0f172a; color:#e2e8f0; margin:0; padding:32px; }}
    .wrap {{ max-width: 1200px; margin: 0 auto; }}
    .card {{ background:#111827; border:1px solid #1f2937; border-radius:16px; padding:20px; margin:18px 0; }}
    .row {{ display:flex; gap:16px; }}
    .between {{ justify-content:space-between; }}
    .start {{ align-items:flex-start; }}
    .muted {{ color:#94a3b8; margin-top:4px; }}
    .mono {{ font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size:13px; }}
    .badge {{ display:inline-block; color:white; padding:6px 10px; border-radius:999px; font-size:12px; font-weight:700; letter-spacing:.04em; }}
    .stats {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:12px; margin:18px 0; }}
    .stats div, .summary div {{ background:#0b1220; border:1px solid #1e293b; border-radius:12px; padding:14px; }}
    .stats span, .summary span {{ display:block; color:#94a3b8; font-size:12px; text-transform:uppercase; letter-spacing:.05em; margin-bottom:6px; }}
    .stats strong, .summary strong {{ font-size:18px; }}
    .summary {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:12px; margin:18px 0 24px; }}
    .grid {{ display:grid; grid-template-columns:1fr 1fr; gap:18px; }}
    ul {{ margin:8px 0 0 18px; }}
    li {{ margin:6px 0; }}
    table {{ width:100%; border-collapse:collapse; margin-top:10px; font-size:14px; }}
    th, td {{ border-top:1px solid #1f2937; padding:10px 8px; text-align:left; vertical-align:top; }}
    h1,h2,h3 {{ margin:0; }}
    h1 {{ font-size:32px; }}
    h2 {{ font-size:22px; margin-bottom:2px; }}
    h3 {{ font-size:16px; margin-top:8px; margin-bottom:8px; }}
    @media (max-width: 900px) {{ .grid {{ grid-template-columns:1fr; }} body {{ padding:16px; }} }}
  </style>
</head>
<body>
  <div class="wrap">
    <h1>{esc(data.get('title', 'Cron Timeout Dashboard'))}</h1>
    <p class="muted">Generated at {esc(data.get('generated_at'))}</p>
    <div class="summary">{summary_html}</div>
    {''.join(jobs_html)}
  </div>
</body>
</html>
"""


def main() -> int:
    if len(sys.argv) != 3:
        print("Usage: build_cron_timeout_dashboard.py input.json output.html", file=sys.stderr)
        return 2
    input_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])
    data = json.loads(input_path.read_text())
    output_path.write_text(render(data))
    print(output_path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
