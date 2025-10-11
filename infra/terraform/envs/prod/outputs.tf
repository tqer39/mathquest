output "cloudflare_nameservers" {
  value       = module.domain_register_delegate.cloudflare_nameservers
  description = "Cloudflare NS (レジストラ側に設定)"
}

output "cloudflare_zone_id" {
  value       = module.domain_register_delegate.cloudflare_zone_id
  description = "Cloudflare Zone ID"
}

output "registration_state" {
  value       = module.domain_register_delegate.registration_state
  description = "ドメイン登録状態"
}

# Database outputs moved to envs/prod/databases/
