# Gravix Development Pipeline

## Overview
Simulated agent swarm using OpenClaw sessions_spawn. Main session acts as team lead (architect + orchestrator). Sub-agents handle implementation and review. Automated gates catch bugs before deploy.

## Roles

| Role | Who | Model | Job |
|------|-----|-------|-----|
| **Lead** | Main session | Opus 4.6 | Plan, spec tasks, orchestrate, deploy |
| **Coder** | Sub-agent | Opus 4.6 | Implement from spec on feature branch |
| **Reviewer** | Sub-agent | Opus 4.6 | Review diff, find bugs, verify spec compliance |
| **Gates** | Shell script | N/A ($0) | Build, lint, types, custom checks |

## Pipeline Stages

### 1. PLAN (Lead)
- Define what needs to change
- Write task spec to `/tmp/gravix-task-<id>.md`
- Include: acceptance criteria, files to touch, things to avoid

### 2. CODE (Sub-agent)
- Spawn coder with task spec
- Works on feature branch: `feat/<task-name>`
- Uses git worktree for isolation
- Must run gate script before declaring done

### 3. GATE (Automated)
Script: `gravix-v2/scripts/check.sh`
- `tsc --noEmit` — type checking
- `next lint` — linting
- `next build` — full build verification
- Custom pattern checks (bad domains, console.logs, etc.)
- **All must pass. Zero exceptions.**

### 4. REVIEW (Sub-agent)
- Spawn reviewer with the diff
- Checks against original spec
- Produces structured findings: CRITICAL / MAJOR / MINOR
- CRITICAL = back to coder, MAJOR = judgment call, MINOR = ship it

### 5. FIX (Loop)
- If reviewer finds criticals → coder fixes on same branch
- Re-run gates
- Re-review if needed (max 2 loops)

### 6. DEPLOY (Lead)
- Merge feature branch → main
- Push → Vercel auto-deploys
- Monitor deploy status via API
- Smoke test key URLs

## Branch Strategy
```
main (production - auto-deploys to Vercel)
├── feat/<task-name>  (feature work, via git worktree)
```

## File Locations
- Gate script: `gravix-v2/scripts/check.sh`
- Task specs: `/tmp/gravix-task-*.md` (ephemeral)
- Pipeline doc: `gravix-v2/PIPELINE.md` (this file)
