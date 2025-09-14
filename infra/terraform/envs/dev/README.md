# dev 環境: dev.mathquest.app のサブドメイン Zone 作成

この環境では、Cloudflare 上に `dev.mathquest.app` のサブドメイン Zone を作成します。
本番の `mathquest.app` ができたら、親ゾーン側に NS レコードを追加してサブゾーンを委任してください。

## 変数例 (`terraform.tfvars`)

```hcl
cloudflare_account_id  = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
cloudflare_api_token   = "cf-xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
dev_zone_domain        = "dev.mathquest.app"
```

## 実行

```sh
terraform init
terraform plan -var-file=terraform.tfvars
terraform apply -var-file=terraform.tfvars
```

## 次の作業（重要）

`terraform apply` 後に出力される `name_servers` の 4 レコードを、親の `mathquest.app` ゾーン側に NS レコードとして追加し、
サブゾーン `dev` の委任を行ってください（プロバイダは Cloudflare を想定）。

本番の `mathquest.app` を Cloud Domains + Cloudflare ゾーンで管理し始めたら、以下のような NS を `dev.mathquest.app` に設定します。

例:

| Name | Type | Value |
| dev | NS | ns1.cloudflare.com. |
| dev | NS | ns2.cloudflare.com. |
| ... | ... | ... |
