# mathquest: アーキテクチャ設計とプロジェクト構造

## 1. はじめに

本ドキュメントは、算数ゲームアプリ「mathquest」のアーキテクチャ設計とプロジェクト構造を定義するものです。ドメイン駆動設計（DDD）の原則に基づき、保守性、拡張性、および開発効率の高いシステムを目指します。

## 2. アーキテクチャ概要

mathquestは、クリーンアーキテクチャをベースとしたDDDを採用します。関心事の分離を徹底し、ビジネスロジック（ドメイン）をアプリケーションの中心に据えることで、技術的な詳細からの独立性を確保します。

### レイヤー構造

- **ドメイン層 (Domain Layer):** アプリケーションの心臓部であり、ビジネスルールとロジックをカプセル化します。エンティティ、値オブジェクト、集約、ドメインサービスなどが含まれます。
- **アプリケーション層 (Application Layer):** ドメイン層のオブジェクトを操作し、ユースケースを実現します。アプリケーションサービスやDTO（Data Transfer Object）が含まれます。
- **インフラストラクチャ層 (Infrastructure Layer):** データベース、外部API、フレームワークなど、技術的な詳細を実装します。ドメイン層やアプリケーション層で定義されたインターフェースを実装します。
- **プレゼンテーション層 (Presentation Layer):** ユーザーインターフェース（UI）とユーザーインタラクションを担当します。Hono SSRとReactコンポーネントで構成されます。

## 3. プロジェクト構造

以下のディレクトリ構造を提案します。

```txt
mathquest/
├── .github/              # GitHub ActionsなどのCI/CD設定
├── docs/                 # プロジェクトドキュメント
├── packages/
│   ├── app/              # Honoアプリケーション本体
│   │   ├── src/
│   │   │   ├── domain/         # ドメイン層
│   │   │   │   ├── entities/     # エンティティ (例: Player, Problem)
│   │   │   │   ├── valueObjects/ # 値オブジェクト (例: Score, Grade)
│   │   │   │   ├── services/     # ドメインサービス
│   │   │   │   └── repositories/ # リポジトリインターフェース
│   │   │   ├── application/    # アプリケーション層
│   │   │   │   ├── useCases/     # ユースケース (例: StartGame, AnswerProblem)
│   │   │   │   └── dto/          # データ転送オブジェクト
│   │   │   ├── infrastructure/ # インフラストラクチャ層
│   │   │   │   ├── persistence/  # 永続化（D1など）
│   │   │   │   ├── web/          # Honoルーター、ミドルウェア
│   │   │   │   └── services/     # 外部サービス連携
│   │   │   └── presentation/   # プレゼンテーション層
│   │   │       ├── components/   # Reactコンポーネント
│   │   │       ├── routes/       # ページコンポーネント
│   │   │       └── assets/       # 画像、CSSなど
│   │   └── package.json
│   └── landing/          # ランディングページ (静的サイト)
├── terraform/            # Terraformによるインフラ構成管理
│   ├── modules/            # 再利用可能なTerraformモジュール
│   └── environments/
│       ├── staging/        # ステージング環境
│       └── production/     # 本番環境
└── package.json          # pnpm workspace設定
```

### 各ディレクトリの説明

| ディレクトリ         | 説明                                                               |
| -------------------- | ------------------------------------------------------------------ |
| `packages/app`       | メインのWebアプリケーション。HonoとReactで構成される。             |
| `packages/landing`   | プロモーション用の静的ランディングページ。                         |
| `src/domain`         | アプリケーションの核となるビジネスロジックを配置。                 |
| `src/application`    | ユースケースを実装し、ドメイン層とインフラストラクチャ層を調整。   |
| `src/infrastructure` | データベース、外部API、Webフレームワークなど、技術的な実装を担当。 |
| `src/presentation`   | ユーザーに表示されるUIコンポーネントとページを配置。               |
| `terraform`          | Cloudflare、GCPなどのインフラをコードで管理。                      |

## 4. 使用技術スタック

- **フロントエンド:** TypeScript, React (Hono JSX)
- **バックエンド:** Hono (on Cloudflare Workers)
- **データベース:** Cloudflare D1
- **インフラ:** Terraform, Cloudflare Pages, GCP Cloud Domains
- **パッケージ管理:** pnpm

この設計により、各レイヤーが独立して開発・テスト可能となり、将来的な機能追加や技術変更にも柔軟に対応できるシステムを目指します。
