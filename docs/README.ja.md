# boilerplate-base

事前設定された開発ツールとワークフローを備えたプロジェクト用のベースボイラープレートテンプレートです。

## クイックスタート

### 前提条件

このプロジェクトでは、異なる目的に対して異なるツールを使用します：

- **Homebrew**: システムレベルの開発ツール
- **mise**: プログラミング言語のバージョン管理
- **just**: タスク自動化とコマンドランナー

### セットアップ

```bash
# 1. Homebrew をインストール（まだインストールされていない場合）
make bootstrap

# 2. すべての開発ツールをインストール
brew bundle install

# 3. 開発環境をセットアップ
just setup
```

**ワンコマンドセットアップ**（Homebrewが既にインストールされている場合）:

```bash
just setup
```

### 利用可能なコマンド

```bash
# すべての利用可能なタスクを表示
just help

# コード品質チェックを実行
just lint

# よくあるフォーマット問題を修正
just fix

# pre-commitキャッシュをクリア
just clean

# 開発ツールを更新
just update-brew  # Homebrewパッケージを更新
just update       # mise管理のツールを更新
just update-hooks # pre-commitフックを更新

# miseの状態を表示
just status
```

## ツールの責任範囲

このセットアップでは、ツールの責任範囲を明確に分離しています：

- **brew**: システムレベルの開発ツール（git、pre-commit、mise、just、uv）
- **mise**: Node.jsのバージョン管理のみ
- **uv**: Pythonパッケージ・プロジェクト管理
- **pre-commit**: すべてのリンティングツールを自動処理（個別インストール不要）

### 自動AI CLIツール

`just setup` の実行時に AI 開発ツールが自動的にインストールされます（個別に入れたい場合は `just ai-install`）：

- **Claude Code CLI**: `@anthropic-ai/claude-code` - AI 支援開発用
- **Gemini CLI**: `@google/gemini-cli` - 代替 AI アシスタント
- **OpenAI Codex CLI**: `@openai/codex` - OpenAI 製のコード向け CLI

このアプローチにより、関心事の明確な分離が保証され、システムツールと言語固有のバージョンとの間の競合が回避されます。

## 追加ツール: rulesync（任意導入）

- 共通設定ファイルを外部リポジトリから同期するための CLI。
- 導入と使い方は `docs/RULESYNC.ja.md` を参照。
