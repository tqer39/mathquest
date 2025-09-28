module "domain_register_delegate" {
  source = "../../modules/domain-register-delegate"

  root_domain           = var.root_domain
  cloudflare_account_id = var.cloudflare_account_id

  contact_country_code        = var.contact_country_code
  contact_postal_code         = var.contact_postal_code
  contact_administrative_area = var.contact_administrative_area
  contact_locality            = var.contact_locality
  contact_address_lines       = var.contact_address_lines
  contact_recipient           = var.contact_recipient
  contact_email               = var.contact_email
  contact_phone               = var.contact_phone

  yearly_price_currency = var.yearly_price_currency
  yearly_price_units    = var.yearly_price_units
}

locals {
  turnstile_domains = distinct(compact(concat(
    [var.root_domain, "www.${var.root_domain}"],
    var.turnstile_additional_domains
  )))
}

module "cf_app_resources" {
  source = "../../modules/cf-app-resources"

  cloudflare_account_id = var.cloudflare_account_id
  project_slug          = var.project_slug
  environment           = var.environment_name

  d1_database_name = var.d1_database_name

  turnstile_allowed_domains = local.turnstile_domains
  turnstile_widget_mode     = var.turnstile_widget_mode
  turnstile_bot_fight_mode  = var.turnstile_bot_fight_mode
  turnstile_region          = var.turnstile_region
}

# 有効化順の依存（保守的に明示）
resource "null_resource" "wait_service_enable" {
  depends_on = [google_project_service.domains]
}
