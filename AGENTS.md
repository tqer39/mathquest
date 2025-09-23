# Repository Guidelines

## Project Structure & Module Organization

- Root: development tooling and docs; no app runtime yet.
- `.github/`: workflows, `CODEOWNERS`, labels, PR template.
- `docs/`: Japanese docs for setup and usage.
- `Makefile`, `justfile`, `Brewfile`: environment bootstrap and tasks.
- Config: `.editorconfig`, `.pre-commit-config.yaml`, `.prettierrc`, `.tool-versions`.

## Build, Test, and Development Commands

- `make bootstrap`: install Homebrew (macOS/Linux) only.
- `brew bundle install`: install dev tools from `Brewfile`.
- `just setup`: provision tools via mise, install AI CLIs, install pre-commit.
- `just lint`: run all pre-commit checks on all files.
- `just fix`: apply common auto-fixes (EOF, whitespace, markdown).
- `just update-brew | just update | just update-hooks`: update packages, tools, hooks.

## Coding Style & Naming Conventions

- Indentation via `.editorconfig`: 2 spaces default; Python 4; `Makefile` tabs; LF EOL; final newline.
- Formatting: Prettier (config in `.prettierrc`), markdownlint, yamllint.
- Text quality: cspell, textlint for Markdown; keep filenames lowercase with hyphens where practical.
- Shell: shellcheck-compliant; YAML/JSON must be valid and lintable.

## Testing Guidelines

- This boilerplate centers on linting; no unit test framework is preset.
- If adding code, place tests under `tests/` and follow ecosystem norms:
  - JavaScript: `__tests__/` or `*.test.ts`.
  - Python: `tests/test_*.py` with pytest.
- Ensure `just lint` passes before opening a PR; add CI for new languages as needed.

## Commit & Pull Request Guidelines

- Commits: short, imperative mood; optional emoji is fine (see `git log`).
- Reference issues with `#123` when applicable.
- PRs: use the template; keep descriptions concise; include rationale and screenshots/output for visible changes.
- CI: pre-commit runs in GitHub Actions; `CODEOWNERS` auto-requests reviews.

## Security & Configuration Tips

- Do not commit secrets; hooks detect AWS creds and private keys.
- Secretlint runs via pre-commit to detect hard-coded credentials (recommend preset).
- GitHub Actions require `OPENAI_API_KEY` for PR description generation.
- Tool versions are managed by mise (`.tool-versions`, Node.js pinned).

## Agent-Specific Instructions

- Follow these guidelines, keep diffs minimal, and update docs when changing tooling.
- Run `just lint` locally and ensure workflows remain green.

## 🎯 プロジェクト概要

- 小学生向け算数アプリ（Hono-SSR + Cloudflare Workers で SSR）
- **3回無料トライアル → 以降は会員登録必須**
- **認証**：Better Auth（メールマジックリンク、Google、2FAオプション/TOTP）
- **学年別対応**：小学1〜6年（初期単元プリセット済み）
- **UI言語**：ユーザーエージェント / `Accept-Language` で `ja` / `en` を自動選択（Cookie/クエリで上書き可）
- **インフラ**：Cloudflare（Workers, KV, D1, Pages, Turnstile, R2）、Terraform管理、CI/CDはGitHub Actions
- **メール送信**：Mailgun（`mail.<domain>` サブドメイン）

---

## 🧱 推奨アーキテクチャパターン

### 1) Edge-SSR BFF（モジュラーモノリス）

- **目的**：最小構成でエッジの低レイテンシを最大化。
- **構成**：1つの Workers（Hono）に SSR（`routes/pages/*`）と BFF API（`routes/apis/*`）を同居。
- **非機能**：コールドスタート極小、ルーティング/ミドルウェアで共通関心事を集約。

### 2) DDD + ポート/アダプタ（Hexagonal）

- **層**：`domain/*`（純TS） ←→ `application/usecases/*` ←→ `infrastructure/*`（D1/KV/Mailgun/OAuth のアダプタ）。
- **テスト**：ドメインはI/Oレスで高速UT、アダプタは契約テスト。

### 3) CQRS-lite & Read-through Cache

- **Write**：D1 を単一の**真実の源泉**。
- **Read**：頻出読み取りは KV に短TTLで read-through。miss時は D1 → KV 格納。
- **整合性**：更新時に該当キーを削除/更新（まずは削除運用）。

### 4) エッジ・ミドルウェア（無料3回/i18n/守り）

- **無料3回**：匿名ID（Cookie）＋ KV の原子的インクリメント。閾値超でログイン導線へ。
- **i18n**：`Accept-Language` → Cookie上書き。
- **防御**：Turnstile 検証、KV で簡易レート制限（固定窓 or トークンバケット）。

### 5) 外部連携の堅牢化（Idempotency + Circuit Breaker）

- **Idempotency-Key**（ヘッダ）を KV に短期保持して重複処理防止。
- **簡易 Circuit Breaker**：連続失敗で一定時間フォールバック（例：メール再送案内UI）。

### 6) 認証（Better Auth アダプタ）

- **手段**：メールマジックリンク（Mailgun）、Google OAuth、任意TOTP。
- **保管**：シークレットは Wrangler Secrets に投入（Terraformでは管理しない）。

### 7) 配信分離：Pages（静的） × Workers（SSR/API）

- **Pages**：画像・効果音・固定JS。
- **Workers**：SSR と API のみ（アセットは manifest 参照）。

### 8) マイグレーション戦略（D1）

- **IaC**：D1 インスタンスは Terraform。
- **スキーマ**：`wrangler d1 migrations apply` を CI で実行。ロールバックは逆マイグレーション。

### 9) 観測性ミニマム

- ルート単位の成功率/中央値・p95、重要イベントは D1 の監査テーブル（append-only）。
- エラーは一意IDでユーザ提示し相互参照。

---

## 🗂️ フォルダ構成（DDD 準拠）

```txt
math-app/
apps/
web/ # プレゼンテーション層（SSR / Hono）
src/
server/
main.ts # エントリ（SSR + ルーティング）
routes/ # ルーティング（薄い）
pages/ # SSR ページ（Controller相当）
apis/ # APIエンドポイント
middleware/ # セッション/i18n/Turnstile/RateLimit/Idempotency
views/ # SSR共通レイアウト/パーシャル
application/ # アプリケーション層
usecases/ # 無料回数判定/プロフィール更新/学年進行
domain/ # ドメイン層（純粋TS）
entities/ # User/Profile/Progress
services/ # ProblemGenerator（学年別初期単元）
repositories/ # ポート定義
infrastructure/ # インフラ層
repositories/ # D1/KV 実装
auth/ # Better Auth 設定
mail/ # Mailgun 実装
i18n/ # 多言語辞書/検出
interface/ # Controllerアダプタ
http/ # PlayController/AuthController
packages/
ui/ # SSR対応UI（hono/jsx + Tailwind）
core/ # 算数問題生成/採点ロジック
config/ # tsconfig/eslint/tailwind preset
infra/
terraform/ # Terraform管理
migrations/ # D1マイグレーション（SQL）
wrangler.toml # Wrangler 設定
```

## 📚 学年ごとの初期単元

- 小1：10までのたしざん
- 小2：100までのひきざん
- 小3：かけ算（九九）
- 小4：割り算（あまりあり）
- 小5：小数のたしひき
- 小6：分数のたしひき（通分あり）

## 🌐 インフラ構成

- **Workers (Hono-SSR)**：アプリ本体
- **KV**：匿名回数カウンタ（3回無料判定）、レート制限、Idempotencyキー
- **D1**：会員・進捗・2FA・監査ログ
- **Pages**：静的資産（画像/効果音/固定JS）
- **Turnstile**：登録/ログインフォーム保護
- **R2**：効果音/画像、Terraform state保管

## ⚙️ Terraform 管理可/不可リソース（精度版）

### ✅ 管理できる

- Cloudflare **Zone / DNS（全レコード）**
- Cloudflare **Workers / KV / D1 / R2**
- Cloudflare **Pages プロジェクト**（※後述のとおり**ビルド/配信物のアップロードはCI**）
- Cloudflare **Turnstile ウィジェット**
- **Google Cloud Domains 登録**（`google_clouddomains_registration`）
- **Mailgun用 DNS**（SPF/DKIM/MX/CNAME を Cloudflare DNS として IaC）

### ⚠️ 管理できない/部分的

- **Pages のデプロイ実体**：Terraform不可、CIで `wrangler pages deploy`
- **D1 マイグレーション適用**：Terraform不可、CIで `wrangler d1 migrations apply`
- **Google OAuth クライアント登録**：手動（GCP Console）、発行値は Secrets で注入
- **Mailgun ドメイン登録/検証**：手動（DNSはTerraformで用意）、APIキーも Secrets で注入

---

## 🧩 手動/CI が必要なポイントと順序

### 0. 初回のみ（必要なら）R2 バケットを先行作成

- 目的：Terraform の remote state を R2 で運用する場合、初回はバケットが必要。
- 方法：一時的にローカル state で R2 バケットを Terraform 作成 → backend を R2 に切替。

### 1. `terraform apply`（インフラ一式作成）

- 作成対象：Zone/DNS、Workers/KV/D1/R2、Pagesプロジェクト、Turnstileウィジェット、Mailgun用DNS、GCD登録。
- 出力：KV/D1識別子、Pagesプロジェクト名、Turnstileサイトキー 等。

### 2. Google OAuth クライアント（**手動**）

- OAuth同意画面 → WebアプリのクライアントID/Secret 発行。
- **Redirect URI**：`https://<domain>/auth/callback` などを登録。

### 3. Mailgun ドメイン登録・検証（**手動**）

- Mailgun に `mail.<domain>` を追加 → 表示された **SPF/TXT, DKIM/TXT, MX(2件), CNAME(任意)** を **Cloudflare DNS（Terraform）** に反映。
- 検証完了後、**Private API Key** を取得。

### 4. Secrets 注入（**CI から Wrangler**）

- `wrangler secret put` で以下を投入：
  - `MAILGUN_API_KEY`
  - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
  - `TURNSTILE_SECRET_KEY`
  - そのほか Better Auth 設定に必要な値
- **Wrangler.toml** の Bindings もこの段階で確定。

### 5. データベース準備（**CI**）

- `wrangler d1 migrations apply`（未適用SQLを順次適用）。
- 監査テーブル/ユーザ/進捗などの初期スキーマが作成されることを確認。

### 6. アプリのデプロイ（**CI**）

- Workers（SSR/BFF）：`wrangler deploy`
- Pages（静的資産）：`wrangler pages deploy --project-name <name> ./public`
- 初回は HTTPS 証明書の発行を数分待つ可能性あり。

### 7. スモーク/E2E

- 匿名→3回→登録→学年出題の一連が通ることを確認。

## 🛠️ CI/CD（ジョブ分割の推奨）

- **infra.yml**：Terraform のみ（インフラ変更時に実行）
- **deploy.yml**：ビルド→Secrets注入→D1マイグレーション→Workers デプロイ→Pages デプロイ→スモーク
- 依存関係：`deploy.yml` は `infra.yml` 成功後（もしくは最新 state 参照後）に実行。

## 🔐 認証フロー（Better Auth）

- **メールマジックリンク**（Mailgun経由送信）
- **Google アカウントログイン**（GCP Console でクライアント発行）
- **2FA（TOTP）** 任意設定（D1 にシード保存、レート制限/ロックアウトあり）

## 🧭 i18n

- 自動判定：`Accept-Language` / UA
- 手動上書き：Cookie / クエリ
- 辞書：`infrastructure/i18n/messages/{ja,en}.ts`

## 📬 メール（Mailgun）

- サブドメイン：`mail.<domain>`
- 必須レコード例：
  - MX: `mxa.mailgun.org` / `mxb.mailgun.org`
  - SPF (TXT): `v=spf1 include:mailgun.org ~all`
  - DKIM (TXT): Mailgun発行値（公開鍵）
  - CNAME（任意）: トラッキング用

## 🌏 ドメイン

- **登録**：Google Cloud Domains（Terraform管理。登録と同時に NS を Cloudflare に）
- **DNS**：Cloudflare Provider で IaC 化

### 環境別ドメイン方針

- 本番（prod）：`mathquest.app`
- 開発（dev）：`dev.mathquest.app`（親 `mathquest.app` から NS 委任してサブゾーン運用）

## ✅ 要件と前提・制約（サマリ）

| 要件/パターン               | 充足 | 前提・制約                                                      |
| --------------------------- | ---- | --------------------------------------------------------------- |
| Edge-SSR BFF（モノリス）    | 可能 | Hono on WorkersでSSR+BFF同居。ルーティング/ミドルウェアで整理。 |
| Hexagonal（DDD）            | 可能 | `domain` 純TS、外部I/Oはアダプタ層に隔離。                      |
| CQRS-lite + KVキャッシュ    | 可能 | KVは最終的整合。強整合が必要な箇所はD1直読みに絞る。            |
| 無料3回（KV原子）           | 可能 | KV の原子的カウンタを使用。匿名IDは Cookie で管理。             |
| Turnstile/Rate-limit        | 可能 | ミドルウェアで検証・制限。過剰制限は UX に注意。                |
| Idempotency/Circuit Breaker | 可能 | KV に短命キー。CB は簡易実装（将来 Queues 導入余地）。          |
| 認証（Better Auth）         | 可能 | Google OAuth クライアントは手動作成→Secrets 注入。              |
| D1 マイグレーション         | 可能 | Terraform 外。CI で Wrangler 適用が前提。                       |
| Pages/Workers 分離          | 可能 | Pages ビルド/デプロイは CI。Terraform はプロジェクト作成まで。  |

## 🧪 テスト戦略

- **単体**：ドメイン層は完全純TSで高速UT（I/O不要）。
- **契約**：ポート/アダプタの契約テスト（リポジトリ・メール送信）。
- **E2E**：匿名→3回→登録→学年出題が 1 本のシナリオで通ること。

## 🧭 次の作業ステップ（更新版）

1. **Terraform 適用** → Zone/DNS/KV/D1/Pages/Turnstile/R2 作成
2. **Mailgun** に `mail.<domain>` 追加 → DNS 検証完了（TXT/MX/CNAME 反映）
3. **Google OAuth** クライアント発行 → Redirect URI 設定
4. **Wrangler Secrets** に Mailgun/API/OAuth/Turnstile を投入
5. **D1 マイグレーション** を適用（`wrangler d1 migrations apply`）
6. **Workers/Pages** をデプロイ（`wrangler deploy`, `wrangler pages deploy`）
7. **E2E** で「3回無料 → ログイン導線」確認
