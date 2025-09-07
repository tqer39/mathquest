# Gemini Code Assist 用メモ

現時点でリポジトリ内の標準ファイルを自動で取り込む公式仕様は確認できていません。必要に応じて以下の共通ルール（`docs/AI_RULES.ja.md`）をワークスペースのカスタム指示へ貼り付けてください。

- 日本語で回答
- 最小差分・既存スタイル順守
- `just lint` 準拠
- 主要コマンド: `brew bundle install` → `just setup` / `just lint` / `just fix`
- ルール同期（任意）: `just rulesync -- --check` / `just rulesync -- apply`

詳細: `docs/AI_RULES.ja.md` / `AGENTS.md`
