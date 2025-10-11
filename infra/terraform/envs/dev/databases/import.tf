locals {
  d1_import_map = var.existing_d1_database_id == null ? {} : { existing = var.existing_d1_database_id }
  # existing_kv_namespace_ids のキーは modules/cf-app-resources 内の local.kv_namespaces のキー（free_trial など）と一致させる
  turnstile_import_map = (
    var.existing_turnstile_widget_id != null && length(var.turnstile_allowed_domains) > 0
  ) ? { existing = var.existing_turnstile_widget_id } : {}
}

import {
  for_each = local.d1_import_map
  to       = module.cf_app_resources.cloudflare_d1_database.app
  id       = each.value
}

import {
  for_each = var.existing_kv_namespace_ids
  to       = module.cf_app_resources.cloudflare_workers_kv_namespace.kv[each.key]
  id       = each.value
}

import {
  for_each = local.turnstile_import_map
  to       = module.cf_app_resources.cloudflare_turnstile_widget.auth[0]
  id       = each.value
}
