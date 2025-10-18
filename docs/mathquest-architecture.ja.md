# mathquest: アーキテクチャ設計とプロジェクト構造

## 1. 目的

MathQuest は小学生向けの算数練習体験を提供する学習サービスです。Cloudflare Workers 上で Hono を用いて SSR を行い、学年別プリセットやテーマ練習（「たし算 20 まで」「たし算・ひき算ミックス」など）を提供します。問題生成と採点は共有ドメインロジックに集約し、UI から API まで一貫した仕様で再利用できるように構成されています。

## 2. アーキテクチャ概要

### 実行環境

- **Edge Runtime:** Cloudflare Workers（Wrangler 開発モード／本番環境）
- **フレームワーク:** Hono + JSX（SSR + Islands）
- **データストア:** Cloudflare D1（想定）、KV（セッション・レート制限・フリートライアル）
- **ビルド:** pnpm ワークスペース + Vite/Vitest（アプリケーション）

### レイヤー構造

- **ドメイン層 (`packages/domain`)**
  - 出題アルゴリズム、複数ステップ計算（たし算→ひき算など）、逆算問題（`? + 5 = 10`）、回答チェック、表示フォーマット。
- **アプリケーション層 (`packages/app`, `apps/edge/src/application`)**
  - クイズの進行状態（問題数・正解数）管理、ユースケース (`generateQuizQuestion`, `verifyAnswer`) やセッションハンドリング。
- **インフラストラクチャ層 (`apps/edge/src/infrastructure`)**
  - Drizzle ORM による D1 接続、KV バインディング、環境変数管理。
- **インターフェース層 (`apps/edge/src/routes`)**
  - ページ（スタート・プレイ・ホーム）、BFF API (`/apis/quiz/generate`, `/apis/quiz/verify`)、クライアントサイドのインタラクションロジック。

レイヤー間の依存はドメイン層を中心とした内向き矢印となるよう整理しており、UI 改修や新しいデリバリーチャネル追加（例: API 専用の UI）でもドメインロジックをそのまま流用できます。

## 3. モジュール構成

```mermaid
graph LR
    subgraph "Apps"
        Edge[@mathquest/edge]
        API[@mathquest/api]
        Web[@mathquest/web]
    end

    subgraph "Packages"
        Domain[@mathquest/domain]
        App[@mathquest/app]
    end

    Edge --> App
    Edge --> Domain
    API --> App
    API --> Domain
    App --> Domain
```

- `@mathquest/edge`: 本番用 Cloudflare Workers アプリ。スタート画面でプリセットを JSON 埋め込みし、クライアントスクリプトが動的 UI（テーマ選択、進捗保存、効果音/途中式トグル）を構成します。
- `@mathquest/api` / `@mathquest/web`: Workers を利用しないローカル検証用の Node + Hono サーバー。ドメイン/API ロジックの動作確認や Storybook 的な用途に活用できます。
- `@mathquest/app`: クイズ進行オブジェクト（現在の問題番号、正解数など）の計算を担い、UI 側は副作用レスに状態遷移を扱えます。
- `@mathquest/domain`: 計算問題の生成規則。学年別テーマ指定時は `generateGradeOneQuestion` などの複合ロジックを呼び出し、逆算問題の場合は `generateInverseQuestion` を使用します。

## 4. ディレクトリ構造

実際のリポジトリ構成は以下の通りです。

```txt
mathquest/
├── apps/
│   ├── edge/                    # Cloudflare Workers SSR アプリ
│   │   ├── src/
│   │   │   ├── application/     # ユースケース・セッション管理
│   │   │   ├── infrastructure/  # Drizzle, 環境変数
│   │   │   ├── middlewares/     # i18n 等
│   │   │   └── routes/
│   │   │       ├── pages/       # home/start/play, クライアントスクリプト
│   │   │       └── apis/        # /apis/quiz
│   │   └── wrangler.toml        # Workers 設定
│   ├── api/                     # ローカル開発用 API サーバー
│   └── web/                     # ローカル開発用 Web サーバー
├── packages/
│   ├── app/                     # クイズ進行ユースケース
│   └── domain/                  # 問題生成・採点ロジック
├── infra/
│   ├── terraform/               # Terraform 構成
│   └── migrations/              # D1 スキーマ
├── docs/                        # ドキュメント群
└── games/math-quiz/             # 旧スタンドアロン版ゲーム
```

## 5. ユースケースとデータフロー

### スタート画面

1. `/start` を SSR でレンダリング。サーバー側で学年一覧・計算種別・テーマプリセットを JSON として `<script type="application/json">` へ埋め込み。
2. クライアントスクリプト (`start.client.ts`) が初期化し、ローカルストレージから以下の状態を復元：
   - `mathquest:progress:v1`: 総解答数・正解数・最後に選択した学年/テーマ。
   - `mathquest:sound-enabled` / `mathquest:show-working`: UI トグル。
   - `mathquest:question-count-default`: 初期問題数。
3. 学年選択に応じて `gradeCalculationTypes` から計算種別をフィルタリングし、テーマボタンも最小対象学年で絞り込み。
4. 「れんしゅうをはじめる」を押すと選択内容をセッションストレージへ保存し、`/play` に遷移。

### プレイ画面

1. 画面読み込み時に `mathquest:pending-session` から設定を復元し、表示ラベルを更新。
2. `countdown-overlay` で 3 秒カウントダウン後、`/apis/quiz/generate` に POST して問題を取得。
3. ユーザー回答を `/apis/quiz/verify` に送信し、正誤と正しい答えを表示。正解時はストリークを加算し、ローカルストレージの進捗を更新。
4. 残り問題数が 0 になると結果カードを表示し、スタート画面への導線を提示。

### API レイヤー

- `POST /apis/quiz/generate`
  - 入力: `mode`, `max`, `gradeId`, `themeId` など（スタート画面の選択内容）
  - 出力: 問題データ（数式・途中式 `extras` を含む）
- `POST /apis/quiz/verify`
  - 入力: 問題オブジェクト + 解答値
  - 出力: 正誤判定と正解値

API は `apps/edge/src/application/usecases/quiz.ts` を経由し、`@mathquest/domain` のロジックを利用します。これにより UI 側と API 側で同一仕様の問題が生成され、テストもユースケース単位で記述できます。

### 逆算問題（ぎゃくさん）

逆算問題は、一方のオペランドが未知数となる問題形式です（例: `? + 5 = 10` または `3 + ? = 9`）。

**実装の特徴:**

- **問題生成**: `generateInverseQuestion` 関数が `isInverse: true` と `inverseSide: 'left' | 'right'` を持つ問題を生成します。
- **表示形式**: `formatQuestion` 関数が `?` 記号と結果（`= 10`）を含む形式で問題を表示します。
- **回答検証**: `verifyAnswer` 関数が逆算問題の場合、問題オブジェクトの `answer` フィールド（未知数の値）を使用して正誤判定を行います。通常の算数問題とは異なり、計算結果ではなく未知数の値が正解となります。

**データ構造:**

```typescript
type Question = {
  a: number;
  b: number;
  op: '+' | '-' | '×';
  answer: number; // 逆算問題では未知数の値
  isInverse?: boolean; // 逆算問題フラグ
  inverseSide?: 'left' | 'right'; // 未知数の位置
};
```

## 6. 技術スタック

- **UI:** Hono JSX, Tailwind 風ユーティリティクラス（カスタム CSS 変数）
- **クライアントサイド:** TypeScript, Islands 方式のスクリプト埋め込み
- **ロジック:** Vitest によるユースケーステスト、ドメインロジックの純関数化
- **インフラ:** Cloudflare Workers, KV, D1, Terraform
- **ツール:** pnpm, mise, just, biome, cspell

## 7. 設計上の考慮点

- **再利用性:** ドメインロジックとユースケースは Node でも Workers でも動作する純 TypeScript。API と SSR の双方で共有。
- **アクセシビリティ:** テンキーはキーボード操作にも対応し、ARIA 属性で状態を伝達。テーマ選択は `aria-pressed` を利用。
- **ローカルストレージ戦略:** 進捗・設定を保存し、次回訪問時の UX を向上。バージョンキーを付けて将来のマイグレーションに備えています。
- **今後の拡張:** Better Auth 連携によるユーザー管理、D1 への本格的な学習履歴永続化、AI コーチング機能などを想定しています。
