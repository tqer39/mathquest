locals {
  aws_account_id   = "072693953877"
  aws_env_name     = "dev"
  app_env_name     = "dev"
  organization     = "tqer39"
  prefix           = "mathquest"
  repository_owner = "tqer39"
  repository_name  = "mathquest"
  region = {
    apne1 = "ap-northeast-1"
  }
}

locals {
  base_tags = {
    "env"        = local.app_env_name
    "IaC"        = "Terraform"
    "product"    = "mathquest"
    "repository" = "${local.repository_owner}/${local.repository_name}"
  }

  common_tags = local.base_tags
}
