variable "cloudflare_account_id" {
  description = "Cloudflare account ID"
  type        = string
}

variable "project_slug" {
  description = "Slug for resource naming (kebab-case recommended)"
  type        = string
}

variable "environment" {
  description = "Environment name (e.g. prod, dev)"
  type        = string
}

variable "d1_database_name" {
  description = "Optional D1 database name. Derived from slug + environment when null"
  type        = string
  default     = null
}

variable "turnstile_allowed_domains" {
  description = "List of domains allowed to use the Turnstile widget"
  type        = list(string)
}

variable "turnstile_widget_mode" {
  description = "Turnstile mode (managed / invisible / non-interactive)"
  type        = string
  default     = "managed"
}

variable "turnstile_bot_fight_mode" {
  description = "Enable Turnstile Bot Fight Mode"
  type        = bool
  default     = false
}

variable "turnstile_region" {
  description = "Turnstile region (world / eu)"
  type        = string
  default     = "world"
}
