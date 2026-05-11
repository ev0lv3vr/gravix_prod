#!/usr/bin/env python3
"""build_git_hygiene_report.py

Build a morning git hygiene report for local repos in the workspace.

Outputs:
- reports/git-hygiene-YYYY-MM-DD.md
- reports/git-hygiene-YYYY-MM-DD.html
- reports/git-hygiene-YYYY-MM-DD.json
- reports/git-hygiene-latest.md
- reports/git-hygiene-latest.html
- reports/git-hygiene-latest.json
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
from dataclasses import asdict, dataclass
from datetime import datetime
from html import escape
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
REPORTS = ROOT / "reports"

NOISE_PREFIXES = (
    "reports/",
    "memory/",
)
NOISE_EXACT = {
    "BUSINESS_STATE.md",
    "MEMORY.md",
    "KANBAN.md",
}


@dataclass
class RepoStatus:
    name: str
    path: str
    branch: str | None
    upstream: str | None
    ahead: int
    behind: int
    dirty_count: int
    untracked_count: int
    changed_files: list[dict[str, str]]
    state_only_changes: bool
    risk: str
    summary: str


def _clone_latest(versioned: Path, latest: Path) -> None:
    shutil.copyfile(versioned, latest)


def _git(repo: Path, *args: str) -> str:
    result = subprocess.run(
        ["git", "-C", str(repo), *args],
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        return ""
    return result.stdout.rstrip("\n")


def _repo_name(repo: Path) -> str:
    return repo.name if repo != ROOT else "workspace"


def _repo_paths() -> list[Path]:
    repos = [ROOT]
    for child in sorted(ROOT.iterdir()):
        if not child.is_dir() or child.name.startswith("."):
            continue
        if (child / ".git").exists():
            repos.append(child)
    return repos


def _parse_porcelain(repo: Path) -> list[dict[str, str]]:
    lines = _git(repo, "status", "--short").splitlines()
    out: list[dict[str, str]] = []
    for raw in lines:
        if not raw.strip():
            continue
        status = raw[:2]
        path = raw[3:].strip()
        out.append({"status": status, "path": path})
    return out


def _is_noise_path(path: str) -> bool:
    if path in NOISE_EXACT:
        return True
    return any(path.startswith(prefix) for prefix in NOISE_PREFIXES)


def _upstream(repo: Path) -> str | None:
    value = _git(repo, "rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{upstream}")
    return value or None


def _ahead_behind(repo: Path) -> tuple[int, int]:
    upstream = _upstream(repo)
    if not upstream:
        return 0, 0
    raw = _git(repo, "rev-list", "--left-right", "--count", f"{upstream}...HEAD")
    if not raw:
        return 0, 0
    parts = raw.split()
    if len(parts) != 2:
        return 0, 0
    behind, ahead = (int(parts[0]), int(parts[1]))
    return ahead, behind


def _classify(changed: list[dict[str, str]], ahead: int, behind: int) -> tuple[str, bool, str]:
    state_only = bool(changed) and all(_is_noise_path(item["path"]) for item in changed)
    if not changed and ahead == 0 and behind == 0:
        return "clean", False, "Clean and aligned with upstream."
    if state_only and behind == 0:
        if ahead > 0:
            return "low", True, f"Only state/report churn locally; branch is ahead by {ahead}."
        return "low", True, "Only state/report churn locally."

    code_paths = [item["path"] for item in changed if not _is_noise_path(item["path"])]
    if code_paths and (ahead >= 10 or len(code_paths) >= 2):
        return "high", False, f"Code changes present ({', '.join(code_paths[:3])}); review before deploy/push."
    if code_paths or ahead > 0 or behind > 0:
        parts = []
        if code_paths:
            parts.append(f"local code changes in {', '.join(code_paths[:3])}")
        if ahead:
            parts.append(f"ahead {ahead}")
        if behind:
            parts.append(f"behind {behind}")
        return "medium", False, "; ".join(parts).capitalize() + "."
    return "low", state_only, "Minor local changes only."


def inspect_repo(repo: Path) -> RepoStatus:
    changed = _parse_porcelain(repo)
    branch = _git(repo, "rev-parse", "--abbrev-ref", "HEAD") or None
    upstream = _upstream(repo)
    ahead, behind = _ahead_behind(repo)
    risk, state_only, summary = _classify(changed, ahead, behind)
    return RepoStatus(
        name=_repo_name(repo),
        path=str(repo.relative_to(ROOT)) if repo != ROOT else ".",
        branch=branch,
        upstream=upstream,
        ahead=ahead,
        behind=behind,
        dirty_count=len(changed),
        untracked_count=sum(1 for item in changed if item["status"] == "??"),
        changed_files=changed[:12],
        state_only_changes=state_only,
        risk=risk,
        summary=summary,
    )


def build_payload(date_str: str, generated_at: str) -> dict[str, Any]:
    repos = [inspect_repo(repo) for repo in _repo_paths()]
    risk_order = {"high": 0, "medium": 1, "low": 2, "clean": 3}
    repos.sort(key=lambda repo: (risk_order.get(repo.risk, 9), repo.name.lower()))
    return {
        "date": date_str,
        "generated_at": generated_at,
        "summary": {
            "repos_scanned": len(repos),
            "clean": sum(1 for repo in repos if repo.risk == "clean"),
            "low": sum(1 for repo in repos if repo.risk == "low"),
            "medium": sum(1 for repo in repos if repo.risk == "medium"),
            "high": sum(1 for repo in repos if repo.risk == "high"),
            "repos_with_changes": sum(1 for repo in repos if repo.dirty_count > 0),
            "total_changed_files": sum(repo.dirty_count for repo in repos),
        },
        "repos": [asdict(repo) for repo in repos],
    }


def render_markdown(payload: dict[str, Any]) -> str:
    s = payload["summary"]
    lines = [
        f"# Git Hygiene Report — {payload['date']}",
        "",
        f"Generated: {payload['generated_at']}",
        "",
        "## Snapshot",
        f"- Repos scanned: **{s['repos_scanned']}**",
        f"- High risk: **{s['high']}**",
        f"- Medium risk: **{s['medium']}**",
        f"- Low/noise only: **{s['low']}**",
        f"- Clean: **{s['clean']}**",
        f"- Repos with changes: **{s['repos_with_changes']}**",
        f"- Total changed files: **{s['total_changed_files']}**",
        "",
        "## Repo details",
    ]
    for repo in payload["repos"]:
        header = f"- **{repo['name']}** — {repo['risk'].upper()} · {repo['summary']}"
        meta = [f"path `{repo['path']}`", f"branch `{repo['branch'] or '—'}`"]
        if repo.get("upstream"):
            meta.append(f"upstream `{repo['upstream']}`")
        if repo.get("ahead"):
            meta.append(f"ahead {repo['ahead']}")
        if repo.get("behind"):
            meta.append(f"behind {repo['behind']}")
        lines.append(header + f" ({'; '.join(meta)})")
        for item in repo.get("changed_files", [])[:8]:
            lines.append(f"  - `{item['status']}` {item['path']}")
    lines.append("")
    return "\n".join(lines)


def render_html(payload: dict[str, Any]) -> str:
    s = payload["summary"]
    cards = [
        ("Repos", s["repos_scanned"]),
        ("High risk", s["high"]),
        ("Medium risk", s["medium"]),
        ("Low/noise", s["low"]),
        ("Clean", s["clean"]),
        ("Changed files", s["total_changed_files"]),
    ]
    cards_html = "".join(f"<div class='card'><div class='k'>{escape(str(k))}</div><div class='v'>{escape(str(v))}</div></div>" for k, v in cards)

    rows = []
    for repo in payload["repos"]:
        changed = "<br>".join(escape(f"{item['status']} {item['path']}") for item in repo.get("changed_files", [])[:8]) or "—"
        rows.append(
            "<tr>"
            f"<td><b>{escape(repo['name'])}</b><div class='muted'>{escape(repo['path'])}</div></td>"
            f"<td><span class='badge {escape(repo['risk'])}'>{escape(repo['risk'].upper())}</span></td>"
            f"<td>{escape(repo.get('branch') or '—')}</td>"
            f"<td>{escape(repo.get('upstream') or '—')}</td>"
            f"<td>{repo.get('ahead', 0)}</td>"
            f"<td>{repo.get('behind', 0)}</td>"
            f"<td>{repo.get('dirty_count', 0)}</td>"
            f"<td>{changed}</td>"
            f"<td>{escape(repo['summary'])}</td>"
            "</tr>"
        )

    return f"""<!doctype html>
<html lang=\"en\">
<head>
<meta charset=\"utf-8\" />
<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
<title>Git Hygiene Report — {escape(payload['date'])}</title>
<style>
:root {{--bg:#0A1628;--surface:#111B2E;--border:#1E293B;--text:#fff;--muted:#94A3B8;--good:#22c55e;--warn:#f59e0b;--bad:#ef4444;}}
*{{box-sizing:border-box}} body{{margin:0;padding:24px;background:var(--bg);color:var(--text);font-family:Inter,-apple-system,sans-serif}}
.wrap{{max-width:1280px;margin:0 auto}} .grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px}}
.card,.panel{{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px}}
.k{{color:var(--muted);font-size:12px}} .v{{font-size:26px;font-weight:750;margin-top:4px}} .muted{{color:var(--muted)}}
table{{width:100%;border-collapse:collapse;font-size:13px}} th,td{{padding:8px;border-bottom:1px solid var(--border);text-align:left;vertical-align:top}} th{{color:var(--muted);font-size:11px;text-transform:uppercase}}
.badge{{display:inline-block;border-radius:999px;padding:3px 9px;font-size:12px;font-weight:700}}
.badge.clean{{background:#12253a;color:#bfdbfe}} .badge.low{{background:#1f2937;color:#cbd5e1}} .badge.medium{{background:#3b2a10;color:#fcd34d}} .badge.high{{background:#3d1616;color:#fca5a5}}
a{{color:#93C5FD;text-decoration:none}}
</style>
</head>
<body>
<div class=\"wrap\">
  <h1>Git Hygiene Report</h1>
  <div class=\"muted\">{escape(payload['generated_at'])} · branch drift and surprise local changes across workspace repos</div>
  <p><a href=\"./morning-ops-hub-latest.html\">Open morning ops hub</a></p>
  <div class=\"grid\">{cards_html}</div>
  <div class=\"panel\" style=\"margin-top:12px\">
    <table>
      <thead><tr><th>Repo</th><th>Risk</th><th>Branch</th><th>Upstream</th><th>Ahead</th><th>Behind</th><th>Dirty</th><th>Changed files</th><th>Summary</th></tr></thead>
      <tbody>{''.join(rows)}</tbody>
    </table>
  </div>
</div>
</body>
</html>
"""


def main() -> int:
    parser = argparse.ArgumentParser(description="Build git hygiene report")
    parser.add_argument("--date", help="Output date YYYY-MM-DD")
    args = parser.parse_args()

    now = datetime.now().astimezone()
    date_str = args.date or now.strftime("%Y-%m-%d")
    generated_at = now.strftime("%Y-%m-%d %H:%M %Z")
    payload = build_payload(date_str, generated_at)

    REPORTS.mkdir(parents=True, exist_ok=True)
    md_path = REPORTS / f"git-hygiene-{date_str}.md"
    html_path = REPORTS / f"git-hygiene-{date_str}.html"
    json_path = REPORTS / f"git-hygiene-{date_str}.json"

    md_path.write_text(render_markdown(payload), encoding="utf-8")
    html_path.write_text(render_html(payload), encoding="utf-8")
    json_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    _clone_latest(md_path, REPORTS / "git-hygiene-latest.md")
    _clone_latest(html_path, REPORTS / "git-hygiene-latest.html")
    _clone_latest(json_path, REPORTS / "git-hygiene-latest.json")

    print(f"Built {md_path.relative_to(ROOT)}")
    print(f"Built {html_path.relative_to(ROOT)}")
    print(f"Built {json_path.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
