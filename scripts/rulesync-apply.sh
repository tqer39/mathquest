#!/usr/bin/env bash
set -euo pipefail

# Guard: rulesync 未インストールなら停止（適用は明示的に依存）
if ! command -v rulesync >/dev/null 2>&1; then
  echo "rulesync not installed. Please install it first."
  exit 1
fi

# Guard: 設定ファイルが無ければ停止
CONFIG=".rulesync.yaml"
if [ ! -f "$CONFIG" ]; then
  CONFIG=".rulesync.yml"
fi
if [ ! -f "$CONFIG" ]; then
  echo "No .rulesync.yaml found."
  exit 1
fi

# Guard: 雛形のままなら停止（誤適用防止）
if grep -q "your-org/your-rules-repo" "$CONFIG"; then
  echo "rulesync config looks like a placeholder. Please configure it."
  exit 1
fi

# Apply 実行
exec rulesync apply
