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
  # Extract all [[wikilinks]] from the file, ignoring code blocks and inline code
  # 1. Strip fenced code blocks (```...```)
  # 2. Strip inline code (`...`)
  # 3. Extract wikilink targets using POSIX-compatible grep + sed
  while IFS= read -r link; do
    # Remove display text after pipe: [[path|text]] -> path
    target="${link%%|*}"

    # Remove anchor: [[path#section]] -> path
    target="${target%%#*}"

    # Skip empty
    if [ -z "$target" ]; then
      continue
    fi

    # Skip Next.js catch-all route syntax [[...param]]
    if [[ "$target" == ...* ]]; then
      continue
    fi

    # Skip template placeholders (e.g., decisions/adr-NNN)
    if [[ "$target" == *NNN* ]] || [[ "$target" == *XXX* ]]; then
      continue
    fi

    # Skip inline code examples (generic references, not real links)
    if [[ "$target" == "wikilinks" ]] || [[ "$target" == "internal-link" ]]; then
      continue
    fi

    # Strip fragment anchors: path#heading -> path
    target="${target%%#*}"

    # Strip trailing slashes
    target="${target%/}"

    # Skip if empty after stripping
    if [ -z "$target" ]; then
      continue
    fi

    CHECKED=$((CHECKED + 1))

    # Resolve target: check if docs/<target>.md or docs/<target>/ directory exists
    target_file="$DOCS_DIR/${target}.md"
    target_dir="$DOCS_DIR/${target}"

    if [ ! -f "$target_file" ] && [ ! -d "$target_dir" ]; then
      rel_doc="${doc#"$REPO_ROOT"/}"
      BROKEN+=("$rel_doc -> [[${target}]] (expected: docs/${target}.md)")
    fi
  done < <(
    # Remove fenced code blocks, then inline code, then extract wikilink targets
    # Uses POSIX grep -oE (works on both macOS and Linux)
    sed '/^```/,/^```/d' "$doc" \
      | sed 's/`[^`]*`//g' \
      | grep -oE '\[\[[^]]+\]\]' 2>/dev/null \
      | sed 's/^\[\[//; s/\]\]$//' \
      || true
  )
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
