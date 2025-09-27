variable "cloudflare_api_token" {
  description = "Cloudflare API Token（R2 バケット作成権限が必要）"
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "Cloudflare Account ID（対象アカウント）"
  type        = string
}

variable "r2_bucket_name" {
  description = "tfstate を保存する R2 バケット名（例: mathquest-tfstate）"
  type        = string
}
