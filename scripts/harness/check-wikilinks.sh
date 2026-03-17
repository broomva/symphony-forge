#!/usr/bin/env bash
set -euo pipefail

# check-wikilinks.sh — Validate [[wikilinks]] in docs/*.md files
# Parses all [[target]] links and verifies that target.md exists in docs/.
# Returns non-zero on broken links.
# Usage: make -f Makefile.control wikilinks-check

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DOCS_DIR="$REPO_ROOT/docs"

echo "=== Wikilink Validation ==="

# Check that docs/ directory exists
if [ ! -d "$DOCS_DIR" ]; then
  echo "  WARN: docs/ directory does not exist yet. Skipping."
  exit 0
fi

BROKEN=()
CHECKED=0

# Find all .md files in docs/
while IFS= read -r -d '' doc; do
  # Extract all [[wikilinks]] from the file
  # Matches [[some/path]] or [[some/path|display text]]
  while IFS= read -r link; do
    # Remove display text after pipe: [[path|text]] -> path
    target="${link%%|*}"

    # Skip empty
    if [ -z "$target" ]; then
      continue
    fi

    CHECKED=$((CHECKED + 1))

    # Resolve target: check if docs/<target>.md exists
    target_file="$DOCS_DIR/${target}.md"

    if [ ! -f "$target_file" ]; then
      rel_doc="${doc#"$REPO_ROOT"/}"
      BROKEN+=("$rel_doc -> [[${target}]] (expected: docs/${target}.md)")
    fi
  done < <(grep -oP '\[\[\K[^\]]+' "$doc" 2>/dev/null || true)
done < <(find "$DOCS_DIR" -name '*.md' -print0 | sort -z)

echo "  Checked $CHECKED wikilinks."

if [ ${#BROKEN[@]} -gt 0 ]; then
  echo ""
  echo "  ERROR: Found ${#BROKEN[@]} broken wikilink(s):"
  for b in "${BROKEN[@]}"; do
    echo "    - $b"
  done
  echo ""
  echo "  Create the missing target files or fix the wikilink paths."
  exit 1
fi

echo "  No broken wikilinks found."
echo "=== Wikilink validation passed ==="
