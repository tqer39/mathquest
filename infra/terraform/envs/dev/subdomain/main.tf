module "cf_subdomain_zone" {
  source = "../../../modules/cf-subdomain-zone"

  cloudflare_account_id = var.cloudflare_account_id
  zone_domain           = var.dev_zone_domain
}
