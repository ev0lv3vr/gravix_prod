# AGENTS.md

## Project Context
This is Gravix.com — an industrial adhesive specification platform.
Tech stack: Next.js 14 (App Router) + FastAPI + Supabase + Tailwind.

## Specs Location
All specs are in specs/. Always read specs/L0-index.md first to find relevant feature specs.
For any feature work, load the L1 summary, then L2 full detail.

## Development Rules
1. Never modify files in specs/ — they are read-only.
2. After writing code, always run: npm test && npm run lint && npm run type-check
3. If tests fail, fix the code and run again (up to 3 attempts).
4. Commit with conventional commit messages (feat:, fix:, refactor:).
5. After pushing, wait for CI + holdout results before considering task done.

## Testing Against Digital Twins
When running locally, use these environment overrides:
ANTHROPIC_API_URL=http://localhost:3100
NEXT_PUBLIC_SUPABASE_URL=http://localhost:3200
STRIPE_API_URL=http://localhost:3300

## Design System Quick Reference
- Background: #0A1628
- Surface: #111B2E
- Accent: #3B82F6 (blue-500)
- Text primary: #FFFFFF
- Text secondary: #94A3B8
- Font: Inter (body), JetBrains Mono (code/data)
- Dark mode only

## Dark Factory Operations

### Convergence Pipeline
- PR push → converge.yml → Vercel preview deploy → dispatch to gravix-holdouts → holdout-check.yml runs Playwright + Haiku scoring → results posted as PR comment
- Vercel Authentication is DISABLED for preview deployments (required for Playwright access)
- Preview URL is fetched from GitHub Deployments API (not constructed from branch name)
- Holdout dispatch uses repository_dispatch with event type run-scenarios
- Dispatch payload must include: preview_url, sha, callback_repo, pr_number
- Results are posted back as a PR comment (not a check run — check runs require a GitHub App)

### Timeouts
- holdout-check.yml job: 20 minutes
- converge.yml wait step: 25 minutes
- converge.yml wait step uses fail-on-no-checks: false

### Required Secrets
- Main repo: HOLDOUT_PAT (classic PAT with repo scope — dispatches to private holdouts repo)
- gravix-holdouts: ANTHROPIC_API_KEY (for Haiku scoring), CALLBACK_PAT (same PAT — posts PR comments back)

### Holdout Scoring
- 8 critical scenarios, scored 0-100 by Haiku
- Passing threshold: >= 85 per scenario
- Baseline scores will be low on preview deployments without real Supabase auth — this is expected
- The factory validates by relative scoring: broken code scores significantly lower than correct code
