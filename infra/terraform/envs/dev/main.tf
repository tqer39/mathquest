locals {
  turnstile_domains = distinct(compact(concat(
    [var.dev_zone_domain],
    var.turnstile_additional_domains
  )))
}

module "cf_subdomain_zone" {
  source = "../../modules/cf-subdomain-zone"

  cloudflare_account_id = var.cloudflare_account_id
  zone_domain           = var.dev_zone_domain
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
