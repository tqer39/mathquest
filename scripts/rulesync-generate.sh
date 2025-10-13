#!/usr/bin/env bash
set -euo pipefail

# Generate AI assistant config files from a single source of truth.
# Source: AGENTS.md

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SRC_FILE="$ROOT_DIR/AGENTS.md"

if [ ! -f "$SRC_FILE" ]; then
  echo "Source file not found: $SRC_FILE" >&2
  exit 1
fi

mkdir -p "$ROOT_DIR/.github"

# Cursor
{
  echo "# Cursor Rules"
  echo
  tail -n +2 "$SRC_FILE"
} > "$ROOT_DIR/.cursorrules"

# GitHub Copilot
{
  echo "# Copilot Workspace / Chat Instructions"
  echo
  tail -n +2 "$SRC_FILE"
} > "$ROOT_DIR/.github/copilot-instructions.md"

# Claude Code / Dev
{
  echo "# Claude Project Instructions"
  echo
  tail -n +2 "$SRC_FILE"
} > "$ROOT_DIR/CLAUDE.md"

echo "Generated:"
echo " - .cursorrules"
echo " - .github/copilot-instructions.md"
echo " - CLAUDE.md"
