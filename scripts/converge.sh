#!/usr/bin/env bash
# converge.sh — Local Gravix convergence runner
#
# Starts digital twins, runs holdout scenarios against the local API,
# prints a results table, writes reports/latest.json, then tears down.
#
# Usage:
#   ./scripts/converge.sh              # Full run (twins up → scenarios → twins down)
#   ./scripts/converge.sh --no-twins   # Skip twin lifecycle (assumes already running)
#   ./scripts/converge.sh --keep       # Don't tear down twins after run
#
# Exit codes:
#   0 — All critical scenarios passed
#   1 — One or more critical scenarios failed
#   2 — Infrastructure error (Docker not available, health checks failed, etc.)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
HOLDOUTS_DIR="${REPO_ROOT}/.holdouts"
REPORTS_DIR="${REPO_ROOT}/reports"
COMPOSE_FILE="${REPO_ROOT}/docker-compose.twins.yml"

API_URL="${API_URL:-http://localhost:8000}"
HOLDOUTS_REPO="git@github.com:ev0lv3vr/gravix-holdouts.git"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
DIM='\033[2m'
BOLD='\033[1m'
NC='\033[0m'

# Flags
SKIP_TWINS=false
KEEP_TWINS=false

for arg in "$@"; do
  case "$arg" in
    --no-twins) SKIP_TWINS=true ;;
    --keep)     KEEP_TWINS=true ;;
    --help|-h)
      echo "Usage: $0 [--no-twins] [--keep]"
      echo "  --no-twins  Skip starting/stopping twins (assumes already running)"
      echo "  --keep      Don't tear down twins after the run"
      exit 0
      ;;
  esac
done

# ── Helpers ────────────────────────────────────────────────

log()  { echo -e "${BLUE}▸${NC} $*"; }
ok()   { echo -e "${GREEN}✅${NC} $*"; }
warn() { echo -e "${YELLOW}⚠️${NC}  $*"; }
fail() { echo -e "${RED}❌${NC} $*"; }
die()  { fail "$*"; exit 2; }

wait_for_health() {
  local name="$1" url="$2" retries="${3:-30}" interval="${4:-2}"
  local attempt=0
  while [ $attempt -lt $retries ]; do
    if curl -sf "$url" > /dev/null 2>&1; then
      ok "$name is healthy"
      return 0
    fi
    attempt=$((attempt + 1))
    sleep "$interval"
  done
  fail "$name failed health check after $((retries * interval))s"
  return 1
}

cleanup() {
  if [ "$SKIP_TWINS" = false ] && [ "$KEEP_TWINS" = false ]; then
    log "Tearing down twins..."
    docker compose -f "$COMPOSE_FILE" down --remove-orphans 2>/dev/null || true
  fi
}

# ── Banner ─────────────────────────────────────────────────

echo ""
echo -e "${BOLD}═══════════════════════════════════════════${NC}"
echo -e "${BOLD}  🔬 GRAVIX CONVERGENCE RUNNER${NC}"
echo -e "${BOLD}═══════════════════════════════════════════${NC}"
echo ""

# ── Step 1: Check prerequisites ───────────────────────────

if [ "$SKIP_TWINS" = false ]; then
  log "Checking Docker..."
  command -v docker >/dev/null 2>&1 || die "Docker is not installed or not in PATH"
  docker info >/dev/null 2>&1 || die "Docker daemon is not running"
  ok "Docker is available"
fi

log "Checking Node.js..."
command -v node >/dev/null 2>&1 || die "Node.js is not installed"
NODE_VERSION=$(node --version | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  die "Node.js 18+ required (found v${NODE_VERSION})"
fi
ok "Node.js $(node --version)"

# ── Step 2: Start twins ───────────────────────────────────

if [ "$SKIP_TWINS" = false ]; then
  trap cleanup EXIT
  log "Starting digital twins..."
  docker compose -f "$COMPOSE_FILE" up --build -d 2>&1 | tail -5

  echo ""
  log "Waiting for services to become healthy..."
  wait_for_health "Mock Anthropic (3100)"  "http://localhost:3100/health" || die "Mock Anthropic didn't start"
  wait_for_health "Mock Supabase (3200)"   "http://localhost:3200/health" || die "Mock Supabase didn't start"
  wait_for_health "Mock Stripe (3300)"     "http://localhost:3300/health" || die "Mock Stripe didn't start"
  wait_for_health "Gravix API (8000)"      "http://localhost:8000/health" 40 3 || die "Gravix API didn't start"
  echo ""
else
  log "Skipping twin lifecycle (--no-twins)"
  # Still verify API is reachable
  log "Checking API at ${API_URL}..."
  curl -sf "${API_URL}/health" > /dev/null 2>&1 || die "API not reachable at ${API_URL}/health"
  ok "API is reachable"
  echo ""
fi

# ── Step 3: Clone/pull holdout scenarios ───────────────────

log "Syncing holdout scenarios..."
if [ -d "$HOLDOUTS_DIR/.git" ]; then
  (cd "$HOLDOUTS_DIR" && git pull --ff-only 2>&1 | tail -1)
  ok "Updated existing holdouts"
else
  if git clone "$HOLDOUTS_REPO" "$HOLDOUTS_DIR" 2>/dev/null; then
    ok "Cloned holdout scenarios"
  else
    # If clone fails (no access, etc.), check for local scenarios
    if [ -d "$HOLDOUTS_DIR" ] && find "$HOLDOUTS_DIR" -name "*.yaml" -o -name "*.yml" | head -1 | grep -q .; then
      warn "Git clone failed but local scenarios exist — using those"
    else
      warn "Could not clone holdout repo and no local scenarios found"
      warn "Create ${HOLDOUTS_DIR}/ with YAML scenario files, or check SSH key"
      echo ""
      echo -e "${DIM}Expected directory structure:${NC}"
      echo -e "${DIM}  .holdouts/critical/*.yaml${NC}"
      echo -e "${DIM}  .holdouts/important/*.yaml${NC}"
      echo -e "${DIM}  .holdouts/nice-to-have/*.yaml${NC}"
      echo ""
      die "No holdout scenarios available"
    fi
  fi
fi
echo ""

# ── Step 4: Install scenario runner deps ──────────────────

log "Installing scenario runner dependencies..."
if [ -f "${SCRIPT_DIR}/package.json" ]; then
  (cd "$SCRIPT_DIR" && npm install --silent 2>&1 | tail -2)
  ok "Dependencies installed"
else
  warn "No scripts/package.json found — scenario runner may fail"
fi
echo ""

# ── Step 5: Run scenarios ─────────────────────────────────

log "Running holdout scenarios against ${API_URL}..."
echo ""

mkdir -p "$REPORTS_DIR"

# Run the Node.js scenario runner
RESULT=$(node "${SCRIPT_DIR}/run-scenarios.js" \
  --scenarios-dir "$HOLDOUTS_DIR" \
  --api-url "$API_URL" \
  --report-file "${REPORTS_DIR}/latest.json" \
  2>&1) || true

echo "$RESULT"
echo ""

# ── Step 6: Parse exit status ─────────────────────────────

if [ -f "${REPORTS_DIR}/latest.json" ]; then
  # Extract critical failure count from the report
  CRITICAL_FAILURES=$(node -e "
    const r = require('${REPORTS_DIR}/latest.json');
    const fails = (r.scenarios || []).filter(s => s.priority === 'critical' && !s.passed);
    console.log(fails.length);
  " 2>/dev/null || echo "?")

  TOTAL=$(node -e "
    const r = require('${REPORTS_DIR}/latest.json');
    console.log((r.scenarios || []).length);
  " 2>/dev/null || echo "?")

  PASSED=$(node -e "
    const r = require('${REPORTS_DIR}/latest.json');
    console.log((r.scenarios || []).filter(s => s.passed).length);
  " 2>/dev/null || echo "?")

  echo -e "${BOLD}═══════════════════════════════════════════${NC}"
  echo -e "${BOLD}  📊 CONVERGENCE SUMMARY${NC}"
  echo -e "${BOLD}═══════════════════════════════════════════${NC}"
  echo ""
  echo -e "  Scenarios: ${PASSED}/${TOTAL} passed"
  echo -e "  Report:    ${REPORTS_DIR}/latest.json"
  echo ""

  if [ "$CRITICAL_FAILURES" = "0" ]; then
    echo -e "  ${GREEN}${BOLD}✅ ALL CRITICAL SCENARIOS PASSED${NC}"
    echo ""
    exit 0
  else
    echo -e "  ${RED}${BOLD}❌ ${CRITICAL_FAILURES} CRITICAL SCENARIO(S) FAILED${NC}"
    echo ""
    exit 1
  fi
else
  warn "No report file generated"
  echo ""
  exit 1
fi
