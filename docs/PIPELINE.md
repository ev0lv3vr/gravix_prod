# Gravix Development Pipeline

## Overview
Simulated agent swarm using OpenClaw sessions_spawn. Main session acts as team lead (architect + orchestrator). Sub-agents handle implementation and review. Automated gates catch bugs before deploy.

## Roles

| Role | Who | Model | Job |
|------|-----|-------|-----|
| **Lead** | Main session | Opus 4.6 | Plan, spec tasks, orchestrate, merge, deploy |
| **Coder** | Sub-agent | Sonnet | Implement from spec on feature branch |
| **Reviewer** | Sub-agent | Sonnet | Review diff, find bugs, verify spec compliance |
| **Gates** | Shell script | N/A ($0) | Build, lint, types, custom checks |

## Pipeline Stages

### 1. PLAN (Lead)
- Define what needs to change
- Write task spec to `/tmp/gravix-task-<id>.md`
- Include: acceptance criteria, files to touch, things to avoid

### 2. CODE (Sub-agent)
- Spawn coder with task spec
- Works on feature branch: `feat/<task-name>`
- Uses a **git worktree** for isolation
- Must run gate script before declaring done

### 3. GATE (Automated)
Script: `gravix-v2/scripts/check.sh`
- `tsc --noEmit` — type checking
- `next lint` — linting
- `next build` — full build verification
- Custom pattern checks (bad domains, console.logs, etc.)

**Pass criteria**
- ✅ PASS is required for typecheck/lint/build/secret scan.
- ⚠️ Pattern warnings are allowed **only if explicitly acknowledged** (we should ideally fix them, but some TODOs may be acceptable). If warnings exist, they must be listed in the task log / PR description.

### 4. PUSH BRANCH (Lead)
**Critical step to avoid review failures.**
- Push the feature branch to remote **before** review:
  - `git push -u origin feat/<task-name>`
- This guarantees the reviewer can diff against `origin/main` even if the local worktree is removed.

### 5. REVIEW (Sub-agent)
- Reviewer diffs **remote refs**: `origin/main...origin/feat/<task-name>`
- Checks against original spec + runtime hazards (auth, env vars, SSR issues)
- Produces structured findings: CRITICAL / MAJOR / MINOR
  - CRITICAL = back to coder
  - MAJOR = judgment call
  - MINOR = ship it

*(Optional but preferred)*: open a PR and review the PR diff for a permanent audit trail.

### 6. FIX (Loop)
- If reviewer finds CRITICAL → coder fixes on same branch
- Re-run gates
- Re-push branch
- Re-review if needed (max 2 loops)

### 7. MERGE + DEPLOY (Lead)
- Merge feature branch → main
- Push main → Vercel auto-deploys
- Smoke test key URLs

### 8. CLEANUP (Lead)
- Only after merge + smoke test:
  - Remove worktree
  - Delete local feature branch
  - (Optional) delete remote feature branch

## Branch Strategy
```
main (production - auto-deploys to Vercel)
├── feat/<task-name>  (feature work, via git worktree)
```

## File Locations
- Gate script: `gravix-v2/scripts/check.sh`
- Task specs: `/tmp/gravix-task-*.md` (ephemeral)
- Pipeline doc: `gravix-v2/PIPELINE.md` (this file)
