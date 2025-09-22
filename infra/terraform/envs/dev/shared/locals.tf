locals {
  aws_env = "dev"
  app_env = "dev"
  prefix  = "mathquest"
  region = {
    apne1 = "ap-northeast-1"
  }
}

locals {
  common_tags = {
    "envs"       = local.app_env
    "IaC"        = "Terraform"
    "product"    = "mathquest"
    "repository" = "tqer39/mathquest"
  }
}
