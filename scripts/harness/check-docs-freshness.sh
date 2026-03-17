#!/usr/bin/env bash
set -euo pipefail

# check-docs-freshness.sh — Verify documentation index coverage
# Checks that docs/_index.md exists and every .md in docs/ (except _templates/)
# is referenced in _index.md.
# Usage: make -f Makefile.control docs-check

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DOCS_DIR="$REPO_ROOT/docs"
INDEX_FILE="$DOCS_DIR/_index.md"

echo "=== Docs Freshness Check ==="

# Check that docs/ directory exists
if [ ! -d "$DOCS_DIR" ]; then
  echo "  WARN: docs/ directory does not exist yet. Skipping."
  exit 0
fi

# Check that _index.md exists
if [ ! -f "$INDEX_FILE" ]; then
  echo "  WARN: docs/_index.md does not exist yet. Skipping."
  exit 0
fi

MISSING=()

# Find all .md files in docs/ except _templates/ and _index.md itself
while IFS= read -r -d '' doc; do
  # Get the relative path from docs/
  rel_path="${doc#"$DOCS_DIR"/}"

  # Skip _templates/ directory
  if [[ "$rel_path" == _templates/* ]]; then
    continue
  fi

  # Skip _index.md itself
  if [[ "$rel_path" == "_index.md" ]]; then
    continue
  fi

  # Check if this file is referenced in _index.md (by filename without extension or full relative path)
  basename_no_ext="${rel_path%.md}"
  if ! grep -q "$basename_no_ext" "$INDEX_FILE" && ! grep -q "$rel_path" "$INDEX_FILE"; then
    MISSING+=("$rel_path")
  fi
done < <(find "$DOCS_DIR" -name '*.md' -print0 | sort -z)

if [ ${#MISSING[@]} -gt 0 ]; then
  echo "  ERROR: The following docs are NOT referenced in docs/_index.md:"
  for m in "${MISSING[@]}"; do
    echo "    - $m"
  done
  echo ""
  echo "  Add references to these files in docs/_index.md."
  exit 1
fi

echo "  All docs are referenced in _index.md."
echo "=== Docs freshness check passed ==="
