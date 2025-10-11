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

variable "project_slug" {
  description = "リソース命名に利用するスラッグ"
  type        = string
  default     = "mathquest"
}

variable "environment_name" {
  description = "環境名（例: prod）"
  type        = string
  default     = "prod"
}

variable "d1_database_name" {
  description = "D1 データベース名"
  type        = string
  default     = "mathquest"
}

variable "turnstile_additional_domains" {
  description = "Turnstile で許可する追加ドメイン"
  type        = list(string)
  default     = []
}

variable "turnstile_widget_mode" {
  description = "Turnstile の表示モード"
  type        = string
  default     = "managed"
}

variable "turnstile_bot_fight_mode" {
  description = "Turnstile Bot Fight Mode を有効化するか"
  type        = bool
  default     = false
}

variable "turnstile_region" {
  description = "Turnstile リージョン"
  type        = string
  default     = "world"
}
