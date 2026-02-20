# Convergence Pipeline

The Gravix convergence system validates code changes against **holdout scenarios** — real-world usage patterns that the codebase must satisfy before merging.

## Architecture

```
Feature Branch Push
       │
       ▼
  ┌─────────┐     ┌──────────────────┐
  │  Gates   │────▶│    Converge       │
  │ lint,    │     │ preview URL →     │
  │ types,   │     │ holdout dispatch  │
  │ tests    │     └────────┬─────────┘
  └─────────┘              │
                           ▼
                    ┌──────────────┐
                    │   Report     │
                    │ PR comment   │
                    │ with scores  │
                    └──────────────┘
```

## Running Locally

### Prerequisites
- Docker (for digital twins)
- Node.js 18+ (for scenario runner)
- SSH access to `ev0lv3vr/gravix-holdouts` repo

### Full convergence run

```bash
./scripts/converge.sh
```

This will:
1. Start all digital twins (mock-anthropic, mock-supabase, mock-stripe, gravix-api)
2. Clone/pull holdout scenarios from `gravix-holdouts` repo
3. Run every scenario against the local API
4. Print a results table and write `reports/latest.json`
5. Tear down twins

### Options

```bash
# Skip twin lifecycle (if already running via twins-up.sh)
./scripts/converge.sh --no-twins

# Keep twins running after the run
./scripts/converge.sh --keep

# Override API URL
API_URL=https://preview.gravix.com ./scripts/converge.sh --no-twins
```

### Running the scenario runner directly

```bash
cd scripts && npm install
node run-scenarios.js \
  --scenarios-dir ../.holdouts \
  --api-url http://localhost:8000 \
  --report-file ../reports/latest.json \
  --verbose
```

## CI Workflow

The convergence pipeline runs automatically on feature branch pushes:

**File:** `.github/workflows/converge.yml`

### Jobs

| Job | Description | Status |
|-----|-------------|--------|
| `gates-frontend` | lint + typecheck + build | ✅ Active |
| `gates-backend` | pytest suite | ✅ Active |
| `converge` | Trigger holdout scenarios | ⏳ Phase 2 |
| `report` | PR comment with scores | ⏳ Phase 2 |

### Required Secrets

| Secret | Description | Scope |
|--------|-------------|-------|
| `HOLDOUT_PAT` | GitHub PAT with `repo` scope for cross-repo dispatch | Phase 2 |

The Vercel integration handles preview deployments automatically — no additional secrets needed.

## Scenario Format

Holdout scenarios are YAML files organized by priority:

```
gravix-holdouts/
├── critical/         # Must pass for merge
│   ├── free-tier-analysis.yaml
│   └── auth-gating.yaml
├── important/        # Should pass, may warn
│   └── feedback-loop.yaml
└── nice-to-have/     # Informational
    └── product-matching.yaml
```

### YAML Schema

```yaml
name: "Human-readable scenario name"
priority: critical | important | nice-to-have
steps:
  - name: "Step description"
    method: POST                    # HTTP method
    path: /v1/endpoint              # API path (appended to base URL)
    headers:                        # Optional headers
      Authorization: "Bearer {{free_user_token}}"
    body:                           # Optional JSON body
      key: value
    expect:
      status: 200                   # Expected HTTP status
      body_contains:                # Response body must include these strings
        - "field_name"
      body_matches:                 # Regex matching on response fields
        field: "pattern"
      body_equals:                  # Exact field value matching
        field: "expected_value"
    capture:                        # Capture response values for later steps
      variable_name: "response.field.path"
```

### Built-in Variables

The scenario runner provides these template variables:

| Variable | Value |
|----------|-------|
| `{{free_user_token}}` | Mock free-tier JWT |
| `{{pro_user_token}}` | Mock pro-tier JWT |
| `{{quality_user_token}}` | Mock quality-tier JWT |
| `{{enterprise_user_token}}` | Mock enterprise-tier JWT |
| `{{admin_token}}` | Mock admin JWT |
| `{{api_url}}` | Target API URL |

## Convergence Criteria

From `AGENTS.md`:

> A task is DONE when:
> - All in-repo tests pass
> - Lint and typecheck pass
> - **All critical holdout scenarios score >= 85% satisfaction**
> - The spec reviewer agent confirms spec compliance

The convergence runner exits with:
- **Code 0** — All critical scenarios passed
- **Code 1** — One or more critical scenarios failed
- **Code 2** — Infrastructure error (Docker, network, etc.)

## Phase 2 TODOs

- [ ] Build scenario runner workflow in `gravix-holdouts` repo
- [ ] Wire `repository_dispatch` trigger in converge.yml
- [ ] Add `lewagon/wait-on-check-action` for holdout result polling
- [ ] Parse holdout artifact in report job for PR comment scores
- [ ] Add `HOLDOUT_PAT` secret to repo settings
