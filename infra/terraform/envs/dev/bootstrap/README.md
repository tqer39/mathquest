# dev/bootstrap: AWS S3 に tfstate を保管する初期化

このディレクトリは、Terraform の状態ファイル (`tfstate`) を保存するための **AWS S3 バケット** を Terraform 管理下に置くためのブートストラップです。

> ⚠️ 初回実行前に S3 バケットを手動で作成してください。
> Terraform の `backend "s3"` は `terraform init` 実行時にこのリソースが存在している必要があります。

## 前提条件

- AWS アカウント（適切な IAM 権限: S3 の読み書き）
- AWS CLI が認証済み
  - `AWS_PROFILE` で指定する、もしくは `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` を環境変数として設定
- Terraform 1.13.2 (`mise install terraform` などでインストール)
- Cloudflare API Token（D1/KV/Turnstile を作成できる権限）

## Cloudflare Workers リソースの初期化

`cf-app-resources` モジュールを通じて、開発環境向けの Cloudflare D1・Workers KV・Turnstile（任意）も同時にブートストラップします。

変数は `variables.tf` を参照してください。最低限、以下の項目を `terraform.tfvars` 等で指定します。

```hcl
cloudflare_api_token   = "cf-xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
cloudflare_account_id  = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
turnstile_allowed_domains = ["dev.mathquest.app"] # 開発環境で Turnstile を利用する場合
```

Turnstile の利用を見送る場合は `turnstile_allowed_domains = []` のままで構いません。

```sh
# S3 バケット作成（東京リージョン）
aws s3api create-bucket \
  --bucket mathquest-dev-tfstate \
  --region ap-northeast-1 \
  --create-bucket-configuration LocationConstraint=ap-northeast-1
```

バケット名やリージョンは `variables.tf` の既定値と揃えておくとスムーズです。

## 認証方法

認証は以下のいずれかで行ってください。

- `AWS_PROFILE=mathquest-dev` のようにプロファイルを切り替える
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_SESSION_TOKEN` を直接エクスポートする

## 実行手順

1. バックエンド設定を反映しつつ初期化

   ```sh
   just tf -- -chdir dev/bootstrap init -reconfigure
   ```

2. 手動で用意したリソースを Terraform に取り込み

   ```sh
   terraform -chdir=dev/bootstrap import \
     module.tfstate_backend.aws_s3_bucket.state mathquest-dev-tfstate
   ```

3. 設定反映

   ```sh
   just tf -- -chdir dev/bootstrap plan
   just tf -- -chdir dev/bootstrap apply
   ```

`plan` ではバケットのバージョニング有効化や暗号化設定など、モジュールのポリシーに沿った差分が表示されます。

## import.tf について

`import.tf` に import ブロックのテンプレートをコメントとして残しています。
一度リソースを取り込んだらコメントアウトのままで構いません。

## トラブルシューティング

- `NoSuchBucket` / `ResourceNotFoundException` が表示される
  - S3 バケットが正しいリージョンに作成済みか確認してください。
- `ExpiredToken` / 認証エラー
  - `AWS_PROFILE` もしくは認証情報の有効期限を再確認してください。MFA 併用時は `AWS_SESSION_TOKEN` も必要です。

## 次のステップ

`envs/dev` や `envs/prod` 側の Terraform でも、バックエンドを下記のように設定して S3 を利用してください。

```hcl
terraform {
  backend "s3" {
    bucket         = "mathquest-dev-tfstate"
    key            = "dev/bootstrap.tfstate"
    region         = "ap-northeast-1"
    encrypt        = true
  }
}
```

本ディレクトリを適用後は、`terraform state list` に `module.tfstate_backend.aws_s3_bucket.state` などが表示され、
以後 S3 バケットも IaC で管理できます。
