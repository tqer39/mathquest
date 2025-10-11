output "cloudflare_nameservers" {
  description = "Cloudflare から割り当てられた NS。レジストラ側に設定されます"
  value       = cloudflare_zone.root.name_servers
}

output "cloudflare_zone_id" {
  description = "作成した Cloudflare Zone ID"
  value       = cloudflare_zone.root.id
}

output "registration_state" {
  description = "ドメイン登録の状態"
  value       = try(google_clouddomains_registration.root[0].state, null)
}
