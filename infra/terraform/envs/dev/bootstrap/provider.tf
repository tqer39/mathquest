provider "cloudflare" {
  # API トークンは環境変数 CLOUDFLARE_API_TOKEN を推奨
  # 任意で var.cloudflare_api_token を使う場合はコメントアウト解除
  # api_token = var.cloudflare_api_token

  account_id = var.account_id
}
