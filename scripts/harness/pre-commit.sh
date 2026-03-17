#!/usr/bin/env bash
set -euo pipefail

# pre-commit.sh — Fast pre-commit hook (<10s)
# Lints staged .ts/.tsx files with biome, then checks docs freshness.
# Usage: Installed as .git/hooks/pre-commit via install-hooks.sh

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

echo "=== Pre-commit Hook ==="

# Get staged .ts and .tsx files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx)$' || true)

if [ -n "$STAGED_FILES" ]; then
  echo "[1/2] Linting staged TypeScript files..."
  # Run biome check on staged files only
  echo "$STAGED_FILES" | xargs bunx biome check --no-errors-on-unmatched
else
  echo "[1/2] No staged TypeScript files to lint."
fi

echo "[2/2] Checking docs freshness..."
if [ -f "$REPO_ROOT/scripts/harness/check-docs-freshness.sh" ]; then
  bash "$REPO_ROOT/scripts/harness/check-docs-freshness.sh"
else
  echo "  Skipping: check-docs-freshness.sh not found."
fi

echo "=== Pre-commit passed ==="
