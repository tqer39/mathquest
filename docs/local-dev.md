# ローカル検証環境の作り方

本リポジトリは 2 つのローカル開発モードを用意しています。

- Node ローカル（簡易）: `apps/api` + `apps/web` をローカルで起動
- Edge-SSR（Cloudflare Workers エミュレーション）: `apps/edge` を Wrangler で起動

前提

- Bun がインストール済み（`bun --version`）
- 初回は依存導入: ルートで `bun install`

## 1) Node ローカルモード（最短）

- 一括起動（Just 推奨）
  - `just dev-node`
  - API: <http://localhost:8787> / Web: <http://localhost:8788>
- 個別起動（手動）
  - 別ターミナル1: `bun run dev:api`
  - 別ターミナル2: `bun run dev:web`
- 動作確認
  - ヘルスチェック: `curl http://localhost:8787/healthz`
  - ブラウザで Web を開く: <http://localhost:8788>

## 2) Edge-SSR（Workers）モード

Wrangler を使って Cloudflare Workers をローカル実行します。KV/D1 もローカルでエミュレート可能です。

- 起動
  - `bun run dev:edge`
  - または `just dev-edge`
  - Wrangler が表示するローカル URL にアクセス
- KV のローカル準備（任意）
  - `wrangler kv namespace create KV_FREE_TRIAL`
  - `wrangler kv namespace create KV_AUTH_SESSION`
  - `wrangler kv namespace create KV_RATE_LIMIT`
  - `wrangler kv namespace create KV_IDEMPOTENCY`
  - `wrangler dev` 実行時はプレビュー用 namespace が自動で割り当てられますが、明示的に作成して `wrangler.toml` の `kv_namespaces` に id を設定することも可能です。
- D1 のローカル準備（任意）
  - DB 作成: `wrangler d1 create ed_games`
  - 生成された `database_id` を `apps/edge/wrangler.toml` の `d1_databases` に反映
  - マイグレーションがある場合: `wrangler d1 migrations apply ed_games`
- データ永続化（開発用）
  - `wrangler dev --persist` を使うと KV/D1 のローカルデータを `.wrangler` ディレクトリに保持できます。

## よくある質問（FAQ）

- ポートを変えたい
  - API: `PORT=8080 bun run dev:api`
  - Web 側の API 呼び先は `apps/web/public/main.js` の `http://localhost:8787` を合わせてください。
- CORS でエラーになる
  - API 側（`apps/api`）は CORS を許可済みですが、URL を確認してください。
- pre-commit が失敗する
  - `just lint` で詳細を確認。ファイル整形や辞書（`cspell.json`）の単語追加を行ってください。

## コード整形（Prettier）

- すべての対象ファイルを整形
  - `just format`
  - または `bun run format`
- ステージ済みのみ整形（コミット前など）
  - `just format-staged`
  - または `bun run format:staged`

pre-commit の Prettier フックを拡張しており、`js/ts/tsx/json/css/html/md/yaml` が対象です。
