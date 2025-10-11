variable "root_domain" {
  description = "取得するルートドメイン (例: mathquest.app)"
  type        = string
  default     = "mathquest.app"
}

variable "cloudflare_api_token" {
  description = "Cloudflare API Token（Zone 作成権限が必要）"
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "Cloudflare Account ID（Zone 作成先アカウント）"
  type        = string
}
