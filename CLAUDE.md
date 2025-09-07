# Claude Project Instructions

以下のプロジェクト規約に従い、すべて日本語で回答してください。詳細は `docs/AI_RULES.ja.md` と `AGENTS.md` を参照。

## 基本方針

- 日本語での応答を徹底する。
- 変更は最小限・フォーカスで、無関係な修正は避ける。
- 既存設定（`.editorconfig`、`.prettierrc`、`.pre-commit-config.yaml`）に準拠する。
- `just lint` が通る提案のみ行う。
- セキュリティ情報を含めない。

## 実行・検証

- セットアップ: `brew bundle install` → `just setup`
- Lint: `just lint` / 自動修正: `just fix`
- ルール同期（任意）: `just rulesync -- --check` / `just rulesync -- apply`

## 追加ノート

- ファイル参照は `path/to/file:line` の形式で短く明示する。
- 大きな変更は動機と範囲を先に提示する。
