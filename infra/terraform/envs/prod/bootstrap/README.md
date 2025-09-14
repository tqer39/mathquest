# prod/bootstrap: R2 に tfstate を保管するための初期化

目的

- まず手動で R2 バケットを作成し（または wrangler で作成）、Terraform の `import` ブロックで取り込んで管理下に置きます。
- その後、`envs/prod` など本体側のバックエンドを R2(S3 互換) に切り替えます。

手順

1. R2 バケットを手動作成（どちらか）

- Cloudflare ダッシュボード → R2 → Create bucket（例: `ed-games-tfstate`）
- もしくは wrangler

  ```sh
  wrangler r2 bucket create ed-games-tfstate
  ```

1. `terraform.tfvars` を用意

```hcl
cloudflare_api_token  = "cf-xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
cloudflare_account_id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
r2_bucket_name        = "ed-games-tfstate"
```

1. 取り込み実行（import ブロックを使用）

```sh
terraform init
terraform plan   # import 予定が表示される
terraform apply  # state に取り込み
```

1. 本体側の backend を R2(S3) に設定

`envs/prod` 側に `backend.tf` を作成し、以下のように設定します（例）。

```hcl
terraform {
  backend "s3" {
    bucket                      = "ed-games-tfstate"
    key                         = "prod/terraform.tfstate"
    endpoint                    = "https://${var.cloudflare_account_id}.r2.cloudflarestorage.com"
    region                      = "auto"
    skip_credentials_validation = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
    force_path_style            = true
  }
}
```

認証は環境変数で渡します（CI でも同様）。

```sh
export AWS_ACCESS_KEY_ID=<R2のAccess Key>
export AWS_SECRET_ACCESS_KEY=<R2のSecret Key>
```

補足

- R2 の S3 Access Key/Secret は Cloudflare ダッシュボードで発行してください（Terraform からの発行は対象外）。
- 先に state バケットを import しておくことで、以降の IaC から R2 を backend として安全に利用できます。
