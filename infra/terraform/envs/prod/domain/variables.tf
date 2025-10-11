variable "root_domain" {
  description = "取得するルートドメイン (例: mathquest.app)"
  type        = string
  default     = "mathquest.app"
}

variable "gcp_project_id" {
  description = "Google Cloud のプロジェクトID"
  type        = string
}

variable "gcp_region" {
  description = "GCP リージョン（未使用でも provider 要件のため設定）"
  type        = string
  default     = "us-central1"
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

# Contact
variable "contact_country_code" { type = string }
variable "contact_postal_code" { type = string }
variable "contact_administrative_area" { type = string }
variable "contact_locality" { type = string }
variable "contact_address_lines" { type = list(string) }
variable "contact_recipient" { type = string }
variable "contact_email" { type = string }
variable "contact_phone" { type = string }

# Pricing
variable "yearly_price_currency" { type = string }
variable "yearly_price_units" { type = number }
