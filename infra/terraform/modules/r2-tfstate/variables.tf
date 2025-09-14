variable "cloudflare_account_id" {
  description = "Cloudflare Account ID"
  type        = string
}

variable "r2_bucket_name" {
  description = "tfstate を保存する R2 バケット名"
  type        = string
}
