# prod 環境: ドメイン登録 + Cloudflare 委任

この環境は `sansu.dev` を Google Cloud Domains で新規登録し、DNS を Cloudflare に委任します。

注意: 実行には料金が発生します。`plan` で内容・価格を確認し、連絡先情報は必ず実情報に置換してください。

## 変数例 (`terraform.tfvars`)

```hcl
root_domain            = "sansu.dev"
gcp_project_id         = "your-gcp-project-id"
cloudflare_account_id  = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
cloudflare_api_token   = "cf-xxxxxxxxxxxxxxxxxxxxxxxxxxxx"

contact_country_code        = "JP"
contact_postal_code         = "100-0001"
contact_administrative_area = "Tokyo"
contact_locality            = "Chiyoda"
contact_address_lines       = ["1-2-3"]
contact_recipient           = "Taro Yamada"
contact_email               = "taro@example.com"
contact_phone               = "+819012345678"

yearly_price_currency = "USD"
yearly_price_units    = 12
```

プロジェクト名や Turnstile の設定を変更したい場合は、必要に応じて以下を追加で上書きしてください。

```hcl
project_slug                 = "mathquest"
environment_name             = "prod"
d1_database_name             = "mathquest"
turnstile_additional_domains = ["app.sansu.dev"]
turnstile_widget_mode        = "managed"
turnstile_region             = "world"
```

## 実行

```sh
terraform init
terraform plan -var-file=terraform.tfvars
terraform apply -var-file=terraform.tfvars
```

## 出力

- `cloudflare_nameservers` — Cloudflare の NS（レジストラに設定されます）
- `cloudflare_zone_id` — 作成された Zone ID
- `registration_state` — 登録状態
- `d1_database` — Workers からバインドする D1 の ID / 名称
- `kv_namespaces` — 各バインディング（`KV_FREE_TRIAL` など）の Namespace 情報
- `turnstile_widget` — Turnstile ウィジェットの site key（秘密鍵は `turnstile_widget_secret`）

## 作成される Cloudflare リソース

- D1 データベース: 既定値は `mathquest`
- Workers KV: `KV_FREE_TRIAL`, `KV_AUTH_SESSION`, `KV_RATE_LIMIT`, `KV_IDEMPOTENCY`
- Turnstile ウィジェット: `project_slug-environment_name-auth` の命名で作成

`terraform apply` 後に出力される ID を `apps/edge/wrangler.toml` の `kv_namespaces` や `d1_databases` に反映し、Turnstile の `site_key` / `secret` は `wrangler secret put` で投入してください。
