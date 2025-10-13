# MathQuest ドキュメント概要

MathQuest は小学生向けの算数練習プラットフォームです。Cloudflare Workers 上で動作する Hono ベースの SSR アプリと、共有ドメインロジックを pnpm ワークスペースで管理するモノレポ構成になっています。

スタート画面では学年・計算分野・テーマプリセット（例: 「たし算 20 まで」や「ひき算 50 まで」）を選択し、問題数や効果音・途中式の表示を切り替えられます。プレイ画面はテンキー付き UI とカウントダウン演出、ストリーク表示、ローカルストレージによる進捗保存を備えています。問題生成と採点は `@mathquest/domain` が担当し、API 層（`/apis/quiz`）からも再利用されます。

## クイックスタート

### 前提条件

リポジトリでは以下のツールを利用します。

- **Homebrew**: macOS/Linux 向けのシステムレベル開発ツール管理
- **mise**: Node.js・pnpm・Wrangler など実行環境のバージョン管理
- **just**: セットアップや lint をまとめたタスクランナー
- **pnpm**: JavaScript/TypeScript ワークスペース管理

### セットアップ

```bash
# 1. Homebrew の導入（macOS/Linux）
make bootstrap

# 2. 依存ツールと npm パッケージをまとめてセットアップ
just setup
```

Homebrew が既に入っている場合は `brew bundle install` を挟んでから `just setup` を実行します。

### よく使うコマンド

```bash
# 利用可能な just タスクを一覧表示
just help

# コード品質チェック（biome, cspell, vitest 等）
just lint

# 自動整形を適用
just fix

# pre-commit キャッシュを削除
just clean

# ランタイム・CLI のアップデート
just update-brew
just update
just update-hooks

# mise の状態確認
just status
```

## リポジトリ構成

- `apps/edge`: Cloudflare Workers で動作する Hono SSR アプリ。`routes/pages` にスタート・プレイ画面、`routes/apis/quiz.ts` に問題生成・採点 API を持ちます。
- `apps/api` / `apps/web`: ローカル開発向けの Node サーバーと Web フロント。Workers を使わない検証で利用します。
- `packages/domain`: 問題生成・採点ロジック。学年別の複合ステップ問題（たし算→ひき算など）もここで定義します。
- `packages/app`: ドメインロジックを利用したクイズ進行管理（出題順・正解数カウントなど）。
- `docs/`: 設計・運用ドキュメント。
- `infra/`: Terraform と D1 マイグレーション。
- `games/math-quiz`: 旧ブラウザ版ゲーム（静的 HTML/JS）。

## 関連ドキュメント

- `AGENTS.md`: 全体設計とモジュール依存関係
- `docs/local-dev.md`: ローカル検証環境の構築手順
- `docs/mathquest アーキテクチャ設計とプロジェクト構造.md`: 詳細なアーキテクチャ設計
- `docs/math-quiz.md`: 旧スタンドアロン版ミニゲームの仕様
