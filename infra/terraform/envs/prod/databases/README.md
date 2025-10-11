# prod 環境: データベースリソース (D1, KV, Turnstile)

この環境では、Cloudflare のデータベースおよび認証関連リソースを管理します。

## 作成されるリソース

- **D1 データベース**: `mathquest-prod-db` (デフォルト)
- **Workers KV Namespaces**:
  - `KV_FREE_TRIAL`: 無料トライアル管理
  - `KV_AUTH_SESSION`: 認証セッション管理
  - `KV_RATE_LIMIT`: レート制限
  - `KV_IDEMPOTENCY`: べき等性保証
- **Turnstile ウィジェット**: Bot 対策用の認証ウィジェット

## 変数例 (`terraform.tfvars`)

```hcl
cloudflare_account_id        = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
project_slug                 = "mathquest"
d1_database_name             = null  # null の場合、mathquest-prod-db が自動生成
turnstile_allowed_domains    = [
  "mathquest.app",
  "www.mathquest.app",
]
turnstile_widget_mode        = "managed"
turnstile_bot_fight_mode     = false
turnstile_region             = "world"
```

## 実行

```sh
terraform init
terraform plan -var-file=terraform.tfvars
terraform apply -var-file=terraform.tfvars
```

## 出力

- `d1_database`: D1 データベースの ID と名称
- `kv_namespaces`: KV Namespace のバインディング情報
- `turnstile_widget`: Turnstile サイトキー
- `turnstile_widget_secret`: Turnstile シークレット（センシティブ）

## 次の作業

`terraform apply` 後、出力された ID を `wrangler.toml` に反映してください:

```toml
[[d1_databases]]
binding = "DB"
database_name = "mathquest-prod-db"
database_id = "<terraform output から取得>"

[[kv_namespaces]]
binding = "KV_FREE_TRIAL"
id = "<terraform output から取得>"
# ... 他の KV も同様
```

Turnstile のシークレットは `wrangler secret put` で設定してください:

```sh
wrangler secret put TURNSTILE_SECRET_KEY
```
