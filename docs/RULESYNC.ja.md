# rulesync 導入ガイド

このリポジトリに rulesync を導入するための最小ガイドです。rulesync は、複数プロジェクトに共通のルール・設定ファイルを安全に同期するための CLI ツールです。

## 目的

- `.editorconfig` や `.prettierrc`、`cspell.json`、`.markdownlint.json` 等の共通設定を外部の「ルールリポジトリ」から取得・同期する
- 差分の検出（ドリフト検知）と自動適用を行う

## インストール

環境や配布方法により複数の導入パスが想定されます。ご利用の環境に合わせていずれかを選択してください。

- Homebrew（推奨・利用可能な場合）
  - 例: `brew install rulesync` または `brew install <tap>/rulesync`
- Rust/Cargo（Rust 環境がある場合）
  - 例: `cargo install rulesync`
- バイナリ配布（GitHub Releases からダウンロードできる場合）
  - `rulesync` 実行ファイルを `PATH` の通る場所へ配置

注: 実際の配布方法・インストール手順は rulesync の README/ドキュメントに従ってください。

## 設定ファイル

ルートに `.rulesync.yaml`（または `.rulesync.yml`）を配置します。本リポジトリには雛形（コメントのみ）を同梱しています。ご利用のルールリポジトリに合わせて有効化してください。

```yaml
# .rulesync.yaml（例）
#
# version: 1
# sources:
#   - name: org-rules
#     # ルールを配布しているリポジトリを指定（ブランチ/タグは適宜固定）
#     repo: github:your-org/your-rules-repo
#     ref: main
#     files:
#       - source: templates/.editorconfig
#         target: .editorconfig
#         mode: copy   # copy/merge/template 等、ツール仕様に従う
#       - source: templates/.prettierrc
#         target: .prettierrc
#         mode: copy
```

スキーマ・オプション名は rulesync の正式ドキュメントを参照してください。上記は記法イメージのため、まずはコメント解除前に仕様を確認してください。

## 使い方

- ドライラン/差分確認（例）
  - `rulesync --check` や `rulesync diff` など、ツールが提供するチェックコマンド
- 適用（例）
  - `rulesync apply`

本リポジトリの `just` には汎用の `rulesync` タスクを追加しています（引数はそのまま渡せます）。

```bash
# ヘルプ表示
just rulesync -- --help

# 差分確認（例）
just rulesync -- --check

# ルール適用（例）
just rulesync -- apply
```

## pre-commit への統合（任意）

ドリフト検知を CI/ローカルで自動チェックしたい場合、pre-commit のローカルフックとして rulesync を実行できます。

`.pre-commit-config.yaml` の末尾などに「コメントアウトのテンプレ」を残しています。実際のコマンドライン（`--check` など）はルールに合わせて調整し、コメント解除してください。

## 運用ガイド

- ルール更新時のフロー
  - ルールリポジトリで更新 → 本リポジトリ側で `just rulesync -- apply` を実行 → 差分をコミット
- バージョン固定
  - `.rulesync.yaml` 側で `ref` をタグ/コミット SHA に固定し、再現性を確保
- 衝突/上書き方針
  - `mode` や ignore パターン等、rulesync 側の機能で安全に制御

## トラブルシューティング

- `rulesync` が見つからない
  - PATH を確認、インストール手順を再実行
- 差分が常に出る
  - `.rulesync.yaml` の対象/除外パターンや `mode` の見直し
  - 現地ファイル側の自動整形（prettier/markdownlint/cspell など）との整合性を確認
