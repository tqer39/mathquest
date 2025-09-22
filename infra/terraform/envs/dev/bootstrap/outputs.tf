output "cf_d1_database" {
  value       = module.cf_app_resources.d1_database
  description = "Cloudflare D1 データベース情報"
}

output "cf_kv_namespaces" {
  value       = module.cf_app_resources.kv_namespaces
  description = "Workers KV Namespace 情報（バインディング単位）"
}

output "cf_turnstile_widget" {
  value       = module.cf_app_resources.turnstile_widget
  description = "Turnstile ウィジェット情報"
}

output "cf_turnstile_widget_secret" {
  value       = module.cf_app_resources.turnstile_widget_secret
  description = "Turnstile ウィジェットのシークレット"
  sensitive   = true
}
