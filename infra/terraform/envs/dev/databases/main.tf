module "cf_app_resources" {
  source = "../../../modules/cf-app-resources"

  cloudflare_account_id = var.cloudflare_account_id
  project_slug          = var.project_slug
  environment           = local.app_env_name

  d1_database_name          = var.d1_database_name
  turnstile_allowed_domains = var.turnstile_allowed_domains
  turnstile_widget_mode     = var.turnstile_widget_mode
  turnstile_bot_fight_mode  = var.turnstile_bot_fight_mode
  turnstile_region          = var.turnstile_region
}
