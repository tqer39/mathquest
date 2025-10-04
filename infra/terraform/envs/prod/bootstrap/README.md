# prod/bootstrap: 本番環境向け Cloudflare / IAM 初期化

このディレクトリは、本番環境 (`prod`) で利用する Cloudflare リソース（D1 / Workers KV / Turnstile など）と GitHub Actions からのデプロイ用 IAM ロールを Terraform でセットアップするためのブートストラップです。

開発環境 (`dev/bootstrap`) と同じ構成をベースにしており、以下を行います。

- GitHub Actions から Assume する IAM ロールの作成
- Cloudflare アカウント内に D1・Workers KV・Turnstile を環境名付きで作成

状態ファイルは AWS S3 バケットに保存します。初回実行前に `terraform { backend "s3" { ... } }` で指定しているバケットが存在している必要があります。（`dev/bootstrap` と同じバケットを共有し、`key` だけ環境毎に分けています。）

## 前提条件

- AWS アカウント（`ap-northeast-1` リージョンで IAM 操作が可能な権限）
- AWS CLI が認証済み (`AWS_PROFILE` もしくは `AWS_ACCESS_KEY_ID` などを設定)
- Cloudflare アカウント（D1 / Workers KV / Turnstile を作成できる API Token）
- Terraform 1.13.3

## 変数の設定

最低限、以下の変数を `terraform.tfvars` などで指定してください。

```hcl
cloudflare_account_id   = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
turnstile_allowed_domains = [
  "mathquest.app",
  "www.mathquest.app",
]
```

Turnstile を利用しない場合は `turnstile_allowed_domains = []` のまま適用できます。`d1_database_name` を指定しない場合は `${project_slug}-${app_env_name}` 形式で自動生成されます。

## 実行手順

1. バックエンド設定を反映しつつ初期化

   ```sh
   just tf -- -chdir=prod/bootstrap init -reconfigure
   ```

2. 変数を指定して計画確認

   ```sh
   just tf -- -chdir=prod/bootstrap plan
   ```

3. 適用

   ```sh
   just tf -- -chdir=prod/bootstrap apply
   ```

実行後、`terraform output` で D1 / KV / Turnstile の識別子やシークレットを確認できます。Turnstile シークレットは `sensitive = true` のため、`terraform output cf_turnstile_widget_secret` を明示的に実行してください。

## 補足

- IAM ポリシー `deploy-allow-specifics` / `deploy-deny-specifics` は既存の AWS アカウントに事前定義されている前提です。
- Cloudflare API Token は環境変数 `CLOUDFLARE_API_TOKEN` などで provider に渡してください。
- `dev/bootstrap` と同様に、タグや命名は `shared-locals.tf` の値を修正することで調整できます。

このブートストラップを適用した後は、`envs/prod` 配下のメイン Terraform から作成したリソースを参照することで、本番環境の IaC 管理を進められます。
