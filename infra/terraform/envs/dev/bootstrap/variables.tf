variable "cloudflare_api_token" {
  description = "Cloudflare API Token（Workers/KV の管理権限が必要）"
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "Cloudflare Account ID（リソース作成先）"
  type        = string
}

variable "project_slug" {
  description = "リソース命名の基点となるスラッグ"
  type        = string
  default     = "mathquest"
}

variable "d1_database_name" {
  description = "D1 データベース名（未指定時はスラッグと環境から生成）"
  type        = string
  default     = null
}

variable "turnstile_allowed_domains" {
  description = "Turnstile を許可するドメイン一覧"
  type        = list(string)
  default     = []
}

variable "turnstile_widget_mode" {
  description = "Turnstile 表示モード"
  type        = string
  default     = "managed"
}

variable "turnstile_bot_fight_mode" {
  description = "Turnstile Bot Fight Mode を有効化するか"
  type        = bool
  default     = false
}

variable "turnstile_region" {
  description = "Turnstile リージョン (world / eu)"
  type        = string
  default     = "world"
}
