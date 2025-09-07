#!/usr/bin/env bash
set -euo pipefail

# Generate AI assistant config files from a single source of truth.
# Source: docs/AI_RULES.ja.md

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SRC_FILE="$ROOT_DIR/docs/AI_RULES.ja.md"

if [ ! -f "$SRC_FILE" ]; then
  echo "Source file not found: $SRC_FILE" >&2
  exit 1
fi

mkdir -p "$ROOT_DIR/.github"

# Cursor
{
  echo "# Cursor Rules"
  echo
  cat "$SRC_FILE"
} > "$ROOT_DIR/.cursorrules"

# GitHub Copilot
{
  echo "# Copilot Workspace / Chat Instructions"
  echo
  cat "$SRC_FILE"
} > "$ROOT_DIR/.github/copilot-instructions.md"

# Claude Code / Dev
{
  echo "# Claude Project Instructions"
  echo
  cat "$SRC_FILE"
} > "$ROOT_DIR/CLAUDE.md"

echo "Generated:"
echo " - .cursorrules"
echo " - .github/copilot-instructions.md"
echo " - CLAUDE.md"
