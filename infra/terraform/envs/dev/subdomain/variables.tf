variable "cloudflare_api_token" {
  description = "Cloudflare API Token（Zone 作成権限が必要）"
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "Cloudflare Account ID（Zone 作成先アカウント）"
  type        = string
}

variable "dev_zone_domain" {
  description = "dev 用サブドメイン Zone（例: dev.mathquest.app）"
  type        = string
  default     = "dev.mathquest.app"
}
