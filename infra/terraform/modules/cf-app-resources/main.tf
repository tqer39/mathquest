locals {
  prefix = "${var.project_slug}-${var.environment}"
  d1_name = coalesce(
    var.d1_database_name,
    replace("${local.prefix}-db", "-", "_")
  )

  kv_namespaces = {
    free_trial = {
      suffix  = "free-trial"
      binding = "KV_FREE_TRIAL"
    }
    auth_session = {
      suffix  = "auth-session"
      binding = "KV_AUTH_SESSION"
    }
    rate_limit = {
      suffix  = "rate-limit"
      binding = "KV_RATE_LIMIT"
    }
    idempotency = {
      suffix  = "idempotency"
      binding = "KV_IDEMPOTENCY"
    }
  }
}

resource "cloudflare_d1_database" "app" {
  account_id = var.cloudflare_account_id
  name       = local.d1_name
}

resource "cloudflare_workers_kv_namespace" "kv" {
  for_each = local.kv_namespaces

  account_id = var.cloudflare_account_id
  title      = "${local.prefix}-${each.value.suffix}"
}

resource "cloudflare_turnstile_widget" "auth" {
  count = length(var.turnstile_allowed_domains) > 0 ? 1 : 0

  account_id = var.cloudflare_account_id
  name       = "${local.prefix}-auth"
  domains    = var.turnstile_allowed_domains
  mode       = var.turnstile_widget_mode

  bot_fight_mode = var.turnstile_bot_fight_mode
  region         = var.turnstile_region
}
