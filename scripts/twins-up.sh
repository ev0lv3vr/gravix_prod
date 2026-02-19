#!/usr/bin/env bash
# twins-up.sh — Start the Gravix digital twins environment
# All 3 mock services + Gravix API pointed at them.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$REPO_ROOT"

echo "🔧 Building and starting Gravix twins environment..."
echo "   Mock Anthropic  → http://localhost:3100"
echo "   Mock Supabase   → http://localhost:3200 (REST) / :3201 (Auth)"
echo "   Mock Stripe     → http://localhost:3300"
echo "   Gravix API      → http://localhost:8000"
echo ""

docker compose -f docker-compose.twins.yml up --build "$@"
