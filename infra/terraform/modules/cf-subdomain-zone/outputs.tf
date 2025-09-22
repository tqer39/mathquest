output "zone_id" {
  value       = cloudflare_zone.subzone.id
  description = "作成した Cloudflare Subdomain Zone ID"
}

output "name_servers" {
  value       = cloudflare_zone.subzone.name_servers
  description = "このサブゾーンに割り当てられた NS（親ゾーンから委任が必要）"
}

output "zone_domain" {
  value       = var.zone_domain
  description = "対象のサブドメイン"
}
