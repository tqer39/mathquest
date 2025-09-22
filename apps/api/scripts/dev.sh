#!/usr/bin/env bash
set -euo pipefail

# 初回ビルド（型エラーがあればここで停止）
tsc -b tsconfig.json

# tsc watch をバックグラウンドで起動
tsc -b -w tsconfig.json &
TSC_WATCH_PID=$!

cleanup() {
  kill ${TSC_WATCH_PID} >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

# Node を --watch で起動（dist の変更で自動再起動）
PORT=${PORT:-8787}
echo "[api] watching... http://localhost:${PORT}"
node --enable-source-maps --watch dist/index.js
