module "r2_state" {
  source = "../../../modules/r2-tfstate"

  cloudflare_account_id = var.cloudflare_account_id
  r2_bucket_name        = var.r2_bucket_name
}
