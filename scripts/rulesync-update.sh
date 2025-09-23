#!/usr/bin/env bash
set -euo pipefail

# Guard: rulesync 未インストールならスキップ
if ! command -v rulesync >/dev/null 2>&1; then
  echo "rulesync not installed; skipping update (install to enable)."
  exit 0
fi

# Guard: 設定ファイルが無ければスキップ
CONFIG=".rulesync.yaml"
if [ ! -f "$CONFIG" ]; then
  CONFIG=".rulesync.yml"
fi
if [ ! -f "$CONFIG" ]; then
  echo "No .rulesync.yaml found; skipping update."
  exit 0
fi

# Guard: 雛形のままならスキップ（例の文字列に依存）
if grep -q "your-org/your-rules-repo" "$CONFIG"; then
  echo "rulesync config looks like a placeholder; skipping update."
  exit 0
fi

# Apply 実行
exec rulesync apply
