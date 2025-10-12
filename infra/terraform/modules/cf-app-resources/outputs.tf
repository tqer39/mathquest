output "d1_database" {
  description = "Primary D1 database information"
  value = {
    id   = cloudflare_d1_database.app.id
    name = cloudflare_d1_database.app.name
  }
}

output "turnstile_widget" {
  description = "Turnstile widget details (null when disabled)"
  value = try({
    id       = cloudflare_turnstile_widget.auth[0].id
    name     = cloudflare_turnstile_widget.auth[0].name
    site_key = cloudflare_turnstile_widget.auth[0].id
  }, null)
}

output "turnstile_widget_secret" {
  description = "Turnstile secret API key"
  value       = try(cloudflare_turnstile_widget.auth[0].secret, null)
  sensitive   = true
}
