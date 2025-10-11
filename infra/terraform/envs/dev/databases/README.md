# dev 環境: データベースリソース (D1, KV, Turnstile)

この環境では、Cloudflare のデータベースおよび認証関連リソースを管理します。

## 作成されるリソース

- **D1 データベース**: `mathquest-dev-db` (デフォルト)
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
d1_database_name             = null  # null の場合、mathquest-dev-db が自動生成
turnstile_allowed_domains    = []    # 必要に応じてドメインを追加
turnstile_widget_mode        = "managed"
turnstile_bot_fight_mode     = false
turnstile_region             = "world"
existing_d1_database_id      = null  # 既存リソースを取り込む場合は ID を設定
existing_kv_namespace_ids    = {}    # { free_trial = "<namespace_id>" など }
existing_turnstile_widget_id = null  # 既存 Turnstile を取り込む場合に設定
```

## 既存リソースの取り込み

Cloudflare 上に同名のリソースが既に存在する場合は、上記の `existing_*` 変数に ID を設定すると、`terraform apply` 実行時に import ブロックを通じて自動的に状態へ取り込まれます。

- D1 データベース: `existing_d1_database_id = "<account_id>/<database_id>"`
- Workers KV: `existing_kv_namespace_ids = { free_trial = "<account_id>/<namespace_id>", ... }`
- Turnstile: `existing_turnstile_widget_id = "<account_id>/<widget_id>"`

ID は `terraform state` や Cloudflare ダッシュボード／API から確認してください。値を設定しない場合は通常通り新規作成されます。

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
database_name = "mathquest-dev-db"
database_id = "<terraform output から取得>"

[[kv_namespaces]]
binding = "KV_FREE_TRIAL"
id = "<terraform output から取得>"
# ... 他の KV も同様
```
