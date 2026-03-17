#!/usr/bin/env bash
set -euo pipefail

# smoke.sh — Quick validation: install, check, build the main app
# Usage: make -f Makefile.control smoke
# Timeout: ~120s

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

echo "=== Smoke Test ==="
echo ""

echo "[1/3] Installing dependencies (frozen lockfile)..."
bun install --frozen-lockfile
echo ""

echo "[2/3] Running checks (lint + typecheck)..."
bun run check
echo ""

echo "[3/3] Building main app..."
bun run build --filter app
echo ""

echo "=== Smoke test passed ==="
