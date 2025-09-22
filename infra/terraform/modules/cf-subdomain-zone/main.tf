resource "cloudflare_zone" "subzone" {
  account_id = var.cloudflare_account_id
  zone       = var.zone_domain
}
