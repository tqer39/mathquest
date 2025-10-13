output "cloudflare_nameservers" {
  description = "Cloudflare から割り当てられた NS。レジストラ側に設定されます"
  value       = module.domain_register_delegate.cloudflare_nameservers
}

output "cloudflare_zone_id" {
  description = "作成した Cloudflare Zone ID"
  value       = module.domain_register_delegate.cloudflare_zone_id
}

output "registration_state" {
  description = "ドメイン登録の状態"
  value       = module.domain_register_delegate.registration_state
}

output "dev_subdomain_record_id" {
  description = "dev サブドメインの DNS レコード ID"
  value       = cloudflare_dns_record.dev.id
}
