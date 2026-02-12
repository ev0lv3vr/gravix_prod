#!/bin/bash
# Gravix Automated Gate Script
# Run from: gravix-v2/frontend/
# All checks must pass before merge.

set -e

FRONTEND_DIR="$(cd "$(dirname "$0")/../frontend" && pwd)"
cd "$FRONTEND_DIR"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

FAILED=0
WARNINGS=0

echo "========================================="
echo "  GRAVIX GATE CHECK"
echo "========================================="
echo ""

# --- Gate 1: TypeScript type checking ---
# Avoid stale Next build artifacts affecting tsc (e.g., .next/types/*)
rm -rf .next >/dev/null 2>&1 || true

echo -n "⏳ [1/5] Type checking (tsc --noEmit)... "
if npx tsc --noEmit 2>/dev/null; then
  echo -e "${GREEN}✅ PASS${NC}"
else
  echo -e "${RED}❌ FAIL${NC}"
  FAILED=$((FAILED + 1))
fi

# --- Gate 2: Linting ---
echo -n "⏳ [2/5] Linting (next lint)... "
if npx next lint --quiet 2>/dev/null; then
  echo -e "${GREEN}✅ PASS${NC}"
else
  echo -e "${YELLOW}⚠️  WARNINGS${NC}"
  WARNINGS=$((WARNINGS + 1))
fi

# --- Gate 3: Build ---
echo -n "⏳ [3/5] Build (next build)... "
if npx next build 2>/dev/null 1>/dev/null; then
  echo -e "${GREEN}✅ PASS${NC}"
else
  echo -e "${RED}❌ FAIL${NC}"
  FAILED=$((FAILED + 1))
fi

# --- Gate 4: Bad patterns ---
echo -n "⏳ [4/5] Pattern checks... "
PATTERN_ISSUES=""

# Check for wrong email domains
BAD_EMAILS=$(grep -r "gravix\.ai" src/ --include="*.tsx" --include="*.ts" -l 2>/dev/null || true)
if [ -n "$BAD_EMAILS" ]; then
  PATTERN_ISSUES="${PATTERN_ISSUES}\n  - gravix.ai emails found in: $BAD_EMAILS"
fi

# Check for console.log (excluding config files)
CONSOLE_LOGS=$(grep -r "console\.log" src/ --include="*.tsx" --include="*.ts" -l 2>/dev/null | grep -v "config\|\.d\.ts" || true)
if [ -n "$CONSOLE_LOGS" ]; then
  PATTERN_ISSUES="${PATTERN_ISSUES}\n  - console.log found in: $CONSOLE_LOGS"
fi

# Check for TODO/FIXME/HACK
TODOS=$(grep -rn "TODO\|FIXME\|HACK\|XXX" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
if [ "$TODOS" -gt 0 ]; then
  PATTERN_ISSUES="${PATTERN_ISSUES}\n  - $TODOS TODO/FIXME/HACK comments found"
fi

if [ -z "$PATTERN_ISSUES" ]; then
  echo -e "${GREEN}✅ PASS${NC}"
else
  echo -e "${YELLOW}⚠️  ISSUES${NC}"
  echo -e "$PATTERN_ISSUES"
  WARNINGS=$((WARNINGS + 1))
fi

# --- Gate 5: No hardcoded secrets ---
echo -n "⏳ [5/5] Secret scan... "
SECRETS=$(grep -rn "sk-\|sk_live\|sk_test\|password\s*=\s*[\"']" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | grep -v "type\|interface\|\.d\.ts" || true)
if [ -z "$SECRETS" ]; then
  echo -e "${GREEN}✅ PASS${NC}"
else
  echo -e "${RED}❌ FAIL — possible secrets in code${NC}"
  echo "$SECRETS"
  FAILED=$((FAILED + 1))
fi

echo ""
echo "========================================="
if [ $FAILED -gt 0 ]; then
  echo -e "${RED}  ❌ BLOCKED — $FAILED check(s) failed${NC}"
  echo "========================================="
  exit 1
elif [ $WARNINGS -gt 0 ]; then
  echo -e "${YELLOW}  ⚠️  PASSED with $WARNINGS warning(s)${NC}"
  echo "========================================="
  exit 0
else
  echo -e "${GREEN}  ✅ ALL GATES PASSED${NC}"
  echo "========================================="
  exit 0
fi
