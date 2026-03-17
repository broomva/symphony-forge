#!/usr/bin/env bash
set -euo pipefail

# install-hooks.sh — Install git hooks for Symphony Cloud
# Copies pre-commit.sh to .git/hooks/pre-commit
# Usage: make -f Makefile.control hooks-install (or runs via "prepare" script)

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

HOOKS_DIR="$REPO_ROOT/.git/hooks"

# Only install if .git directory exists (skip in CI or fresh clones before git init)
if [ ! -d "$REPO_ROOT/.git" ]; then
  echo "No .git directory found. Skipping hook installation."
  exit 0
fi

mkdir -p "$HOOKS_DIR"

# Install pre-commit hook
cp "$REPO_ROOT/scripts/harness/pre-commit.sh" "$HOOKS_DIR/pre-commit"
chmod +x "$HOOKS_DIR/pre-commit"

echo "Git hooks installed:"
echo "  - pre-commit -> scripts/harness/pre-commit.sh"
