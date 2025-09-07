# CLAUDE.md

このファイルは、このリポジトリでコードを扱う際にClaude Code (claude.ai/code) にガイダンスを提供します。

## リポジトリ概要

これは、基盤となるプロジェクト構造と設定ファイルを提供することを目的とした、ベースボイラープレートテンプレートリポジトリです。このリポジトリは、事前設定された開発ツールとワークフローを備えた新しいプロジェクトの出発点として機能します。

## セットアップと開発環境

### 初期セットアップ

このリポジトリでは、パッケージ管理にHomebrew、ツールバージョン管理にmise、タスク自動化にjustを使用します：

```bash
# ステップ1: Homebrew をインストール（まだインストールされていない場合）
make bootstrap

# ステップ2: すべての開発ツールをインストール
brew bundle install

# ステップ3: 開発環境をセットアップ
just setup
```

**代替ワンコマンドセットアップ**（Homebrewが既にインストールされている場合）:

```bash
just setup
```

### mise によるツール管理

```bash
# .tool-versionsで定義されたすべてのツールをインストール
mise install

# インストールされたバージョンを確認
mise list

# ツールを最新バージョンに更新
mise upgrade
```

### just によるタスク管理

```bash
# すべての利用可能なタスクを表示
just help

# 開発環境をセットアップ（brew bundle + mise install + Claude/Gemini CLI + pre-commit install）
just setup

# すべてのリンティングチェックを実行
just lint

# 特定のpre-commitフックを実行
just lint-hook <hook-name>

# よくあるフォーマット問題を修正
just fix

# pre-commitキャッシュをクリア（強制クリーンアップ）
just clean

# pre-commitフックを更新
just update-hooks

# Homebrewパッケージを更新
just update-brew

# mise管理のツールを更新
just update

# miseの状態を表示
just status
```

## コード品質とリンティング

このリポジトリでは、コード品質の強制にpre-commitフックを使用しています。直接実行するかjustコマンドを使用できます：

```bash
# justを使用（推奨）
just lint

# または直接pre-commitを実行
pre-commit run --all-files
```

### 利用可能なpre-commitフック

- **ファイル検証**: check-json、check-yaml、check-added-large-files
- **セキュリティ**: detect-aws-credentials、detect-private-key
- **フォーマット**: end-of-file-fixer、trailing-whitespace、mixed-line-ending
- **YAMLリンティング**: yamllint
- **スペルチェック**: cspell（cspell.json設定を使用）
- **Markdownリンティング**: markdownlint-cli2（自動修正付き）
- **日本語テキストリンティング**: 日本語固有のルールを持つtextlint
- **シェルスクリプトリンティング**: shellcheck
- **GitHub Actions**: actionlint、ワークフローファイル用prettier
- **Terraform**: terraform_fmt
- **Renovate**: renovate-config-validator

## スペルチェック

リポジトリでは、`cspell.json`にカスタム辞書を持つcspellをスペルチェックに使用しています。辞書には、プロジェクト固有の用語、ツール、開発で一般的に使用される固有名詞が含まれています。

## ツールアーキテクチャと依存関係

### ツールの責任範囲

このセットアップでは責任範囲を明確に分離しています：

- **brew**: システムレベルの開発ツール（git、pre-commit、mise、just、uv）
- **mise**: Node.jsのバージョン管理のみ
- **uv**: Pythonパッケージ・プロジェクト管理
- **pre-commit**: すべてのリンティングツールを自動処理（個別インストール不要）

### 自動CLIツールインストール

`just setup`の実行時に、AI CLIツールが自動的にインストールされます：

- **Claude Code CLI**: `@anthropic-ai/claude-code` - AI支援開発用
- **Gemini CLI**: `@google/gemini-cli` - 代替AIアシスタント

### 依存関係管理

- **Renovate**: 依存関係の自動更新は`renovate.json5`を通じて設定され、`github>tqer39/renovate-config`から拡張されています

## GitHub ワークフローと自動化

リポジトリには以下のGitHub Actionsワークフローが含まれています：

- **Pre-commit**: mainブランチへのプッシュとプルリクエストで実行
- **Auto-assign**: kentaro-m/auto-assign-actionを使用してPR作成者を自動割り当て
- **Labeler**: ファイルパターンに基づいてPRを自動ラベル付け（editorconfig、document、terraform、textlint、yamllint、markdownlint、asdf、actionlint、CODEOWNERSをサポート）
- **ライセンス年更新**: 自動化されたライセンス年のメンテナンス

## プロジェクト構造

- `.github/`: GitHub固有の設定（ワークフロー、CODEOWNERS、テンプレート）
- `.editorconfig`: 一貫したコードフォーマットのためのエディタ設定
- `.pre-commit-config.yaml`: pre-commitフック設定
- `.tool-versions`: mise用のツールバージョン定義
- `Brewfile`: brew bundle用のHomebrewパッケージ定義
- `cspell.json`: スペルチェッカー設定とカスタム辞書
- `docs/`: ドキュメントファイル
- `justfile`: タスク自動化定義
- `Makefile`: Homebrewブートストラップセットアップ
- `renovate.json5`: 依存関係更新自動化設定

## コード所有権

- グローバルコードオーナー: @tqer39（CODEOWNERSで定義）

## 開発ワークフロー

1. pre-commitフックはコミット時に自動実行されます
2. プルリクエストは作成者に自動割り当てされます
3. PRは変更されたファイルに基づいて自動ラベル付けされます
4. マージ前にすべてのpre-commitチェックが通過する必要があります
5. Renovateが依存関係更新のPRを自動作成します
