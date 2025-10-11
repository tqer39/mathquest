output "cloudflare_zone_id" {
  value       = module.cf_subdomain_zone.zone_id
  description = "Cloudflare Zone ID（dev サブドメイン）"
}

output "d1_database" {
  value       = module.cf_app_resources.d1_database
  description = "Cloudflare D1 データベース情報"
}

output "kv_namespaces" {
  value       = module.cf_app_resources.kv_namespaces
  description = "Workers KV のバインディング別メタデータ"
}

output "turnstile_widget" {
  value       = module.cf_app_resources.turnstile_widget
  description = "Turnstile ウィジェットの情報"
}

output "turnstile_widget_secret" {
  value       = module.cf_app_resources.turnstile_widget_secret
  description = "Turnstile ウィジェットのシークレット"
  sensitive   = true
}
