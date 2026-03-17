#!/usr/bin/env bash
set -euo pipefail

# audit.sh — Entropy audit for Symphony Cloud
# Checks: topology coverage, stale docs (>90 days), broken wikilinks.
# Usage: make -f Makefile.control audit

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

echo "=== Entropy Audit ==="
echo ""
ISSUES=0

# --- 1. Topology Coverage ---
echo "[1/3] Checking topology coverage..."

TOPOLOGY_FILE="$REPO_ROOT/.control/topology.yaml"
if [ ! -f "$TOPOLOGY_FILE" ]; then
  echo "  ERROR: .control/topology.yaml not found!"
  ISSUES=$((ISSUES + 1))
else
  # Check all apps/ directories are in topology
  for app_dir in "$REPO_ROOT"/apps/*/; do
    app_name=$(basename "$app_dir")
    if ! grep -q "^  ${app_name}:" "$TOPOLOGY_FILE" 2>/dev/null; then
      echo "  WARN: apps/$app_name is not listed in .control/topology.yaml"
      ISSUES=$((ISSUES + 1))
    fi
  done

  # Check all packages/ directories are in topology
  for pkg_dir in "$REPO_ROOT"/packages/*/; do
    pkg_name=$(basename "$pkg_dir")
    if ! grep -q "^  ${pkg_name}:" "$TOPOLOGY_FILE" 2>/dev/null; then
      echo "  WARN: packages/$pkg_name is not listed in .control/topology.yaml"
      ISSUES=$((ISSUES + 1))
    fi
  done

  echo "  Topology coverage check complete."
fi
echo ""

# --- 2. Stale Docs ---
echo "[2/3] Checking for stale documentation (>90 days)..."

DOCS_DIR="$REPO_ROOT/docs"
if [ ! -d "$DOCS_DIR" ]; then
  echo "  WARN: docs/ directory does not exist yet. Skipping stale docs check."
else
  STALE_THRESHOLD=$((90 * 24 * 60 * 60))  # 90 days in seconds
  NOW=$(date +%s)
  STALE_COUNT=0

  while IFS= read -r -d '' doc; do
    # Get last modification time
    if [[ "$OSTYPE" == "darwin"* ]]; then
      MOD_TIME=$(stat -f %m "$doc")
    else
      MOD_TIME=$(stat -c %Y "$doc")
    fi
    AGE=$((NOW - MOD_TIME))

    if [ "$AGE" -gt "$STALE_THRESHOLD" ]; then
      rel_path="${doc#"$REPO_ROOT"/}"
      DAYS_OLD=$((AGE / 86400))
      echo "  STALE: $rel_path (${DAYS_OLD} days old)"
      STALE_COUNT=$((STALE_COUNT + 1))
    fi
  done < <(find "$DOCS_DIR" -name '*.md' -print0 2>/dev/null)

  if [ "$STALE_COUNT" -eq 0 ]; then
    echo "  No stale docs found."
  else
    echo "  Found $STALE_COUNT stale doc(s)."
    ISSUES=$((ISSUES + STALE_COUNT))
  fi
fi
echo ""

# --- 3. Broken Wikilinks ---
echo "[3/3] Checking for broken wikilinks..."
if [ -f "$REPO_ROOT/scripts/harness/check-wikilinks.sh" ]; then
  if ! bash "$REPO_ROOT/scripts/harness/check-wikilinks.sh"; then
    ISSUES=$((ISSUES + 1))
  fi
else
  echo "  WARN: check-wikilinks.sh not found. Skipping."
fi

echo ""
echo "=== Audit Summary ==="
if [ "$ISSUES" -gt 0 ]; then
  echo "  Found $ISSUES issue(s). Review and address above warnings."
  exit 1
else
  echo "  No issues found. Repository is in good shape."
  exit 0
fi
