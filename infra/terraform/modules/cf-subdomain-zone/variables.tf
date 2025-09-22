variable "cloudflare_account_id" {
  description = "Cloudflare Account ID"
  type        = string
}

variable "zone_domain" {
  description = "作成するサブドメインの Zone 名（例: dev.mathquest.app）"
  type        = string
}
