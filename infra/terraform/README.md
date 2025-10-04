# Terraform 構成: envs/{dev,prod} と modules

DDD の考え方で「ユースケース単位のモジュール」を `modules/` に置き、`envs/{dev,prod}` から呼び出す構成に分割しました。

構成

- `modules/domain-register-delegate`: Google Cloud Domains でドメインを新規登録し、DNS を Cloudflare へ委任（Zone 作成含む）
- `modules/cf-app-resources`: Cloudflare Workers アプリ向けの D1 / KV / Turnstile をまとめて作成
- `envs/prod`: 本番用。`mathquest.app` を登録・委任するエントリポイント
- `envs/dev`: モジュール利用例（通常は apply しない）

前提

- GCP プロジェクトが存在し、課金が有効
- Cloud Domains API を有効化可能（prod/dev で `google_project_service` を有効化）
- Cloudflare の API Token（Zone 作成権限）と Account ID が入手済み

使い方（prod の例）

1. 認証
   - Google: `gcloud auth application-default login`
   - Cloudflare: `cloudflare_api_token` を用意
2. `infra/terraform/envs/prod/` へ移動し、`terraform.tfvars` を作成
3. 実行

   ```sh
   terraform init
   terraform plan -var-file=terraform.tfvars
   terraform apply -var-file=terraform.tfvars
   ```

注意事項

- 実際の登録には料金が発生します。`plan` で内容・価格を確認のうえ `apply` してください。
- 連絡先情報はダミー例です。必ず実情報に置き換えてください。
- `.dev` の価格は変動します。`yearly_price_*` を実価格に合わせないと `apply` が失敗します。
