variable "account_id" {
  type        = string
  description = "Cloudflare Account ID"
}

variable "bucket_name" {
  type        = string
  description = "R2 バケット名 (dev)"
  default     = "mathquest-dev"
}

variable "cloudflare_api_token" {
  type        = string
  description = "Cloudflare API Token (未設定時は環境変数を使用)"
  default     = ""
}
