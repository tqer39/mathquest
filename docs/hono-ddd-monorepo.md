# Hono × DDD モノレポ構成（最小）

このドキュメントは、Hono を使って DDD（ドメイン駆動設計）のレイヤ分離を意識したモノレポ構成の最小実装について説明します。

## 構成

- `packages/domain`: ドメイン層
  - エンティティ、値オブジェクト、ドメインサービス（ここでは四則演算の問題生成/採点）
- `packages/app`: アプリケーション層
  - 用語: ユースケース/アプリケーションサービス（ここではクイズ進行の状態管理）
- `apps/api`: インターフェース層（Hono）
  - REST API（問題生成、採点）、CORS、簡易静的ページ
- `apps/web`: フロントエンド（Hono 静的配信）
  - API を呼び出す最小のUI（算数クイズ）

## 主要コマンド（ローカル/Bun）

- 事前準備（初回）: `just setup`
  - Homebrew 経由のツール導入 → mise によるツール（node/bun 等）導入 → pre-commit 設定
- 依存関係のインストール（ルート）: `bun install`
- ビルド: `bun run build`
- API 起動: `bun run dev:api` → <http://localhost:8787>
- Web 起動: `bun run dev:web` → <http://localhost:8788>
  - Web は API を `http://localhost:8787` に呼びます。両方起動してください。

## API 概要

- `POST /v1/questions/next`
  - 入力: `{ mode: 'add'|'sub'|'mul'|'mix', max: number }`
  - 出力: `{ question: { a, b, op, answer } }`（初期版では正解も返却）
- `POST /v1/answers/check`
  - 入力: `{ a, b, op, value }`
  - 出力: `{ ok: boolean, correctAnswer: number }`

将来的にはセッション/ID を導入して、問題配布と採点をセッション単位で管理し、正解は隠蔽する設計に発展できます。

## DDD の観点

- ドメイン（四則演算の規則/難易度調整/負数回避）は `packages/domain` に閉じ込めます。
- アプリケーション（何問中何問正解、次の問題生成などの進行管理）は `packages/app` に置きます。
- Web/API はドメインやアプリケーション層を呼び出す薄いアダプタに徹します。

## 既存のフロントエンドとの連携

`games/math-quiz/` はクライアントサイド完結の実装です。API を使う版に差し替える場合は、問題生成と採点の呼び出しを `/v1/...` に置き換えていけば移行できます。

## Bun が未インストールの場合

- mise 経由（推奨）
  - `.tool-versions` に `bun 1.1.8` を追加済みなので、`just setup` もしくは `just install` を実行すると bun が導入されます。
- Homebrew（macOS/Linux）
  - `brew install oven-sh/bun/bun`
- 公式スクリプト
  - `curl -fsSL https://bun.sh/install | bash`（必要に応じて PATH 設定）
