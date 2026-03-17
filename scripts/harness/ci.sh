#!/usr/bin/env bash
set -euo pipefail

# ci.sh — Full CI pipeline: check + test + build
# Usage: make -f Makefile.control ci
# Timeout: ~600s

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

echo "=== CI Pipeline ==="
echo ""

echo "[1/3] Running checks (lint + typecheck)..."
bash scripts/harness/check.sh
echo ""

echo "[2/3] Running tests (vitest)..."
bun run test
echo ""

echo "[3/3] Running full build..."
bun run build
echo ""

echo "=== CI pipeline passed ==="
