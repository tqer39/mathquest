output "zone_id" {
  value       = module.cf_subdomain_zone.zone_id
  description = "Cloudflare Zone ID（dev サブドメイン）"
}

output "name_servers" {
  value       = module.cf_subdomain_zone.name_servers
  description = "dev.mathquest.app のネームサーバー（親ゾーンに NS レコード追加）"
}
