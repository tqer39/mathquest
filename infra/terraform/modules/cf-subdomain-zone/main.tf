resource "cloudflare_zone" "subzone" {
  account = var.cloudflare_account_id
  name    = var.zone_domain
}
