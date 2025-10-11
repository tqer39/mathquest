locals {
  # tflint-ignore: terraform_unused_declarations
  aws_account_id = "072693953877"
  # tflint-ignore: terraform_unused_declarations
  aws_env_name = "portfolio"
  # tflint-ignore: terraform_unused_declarations
  app_env_name = "dev"
  # tflint-ignore: terraform_unused_declarations
  organization = "tqer39"
  # tflint-ignore: terraform_unused_declarations
  prefix = "mathquest"
  # tflint-ignore: terraform_unused_declarations
  repository_owner = "tqer39"
  # tflint-ignore: terraform_unused_declarations
  repository_name = "mathquest"
  # tflint-ignore: terraform_unused_declarations
  region = {
    apne1 = "ap-northeast-1"
  }
}

locals {
  # tflint-ignore: terraform_unused_declarations
  base_tags = {
    "env"        = local.app_env_name
    "IaC"        = "Terraform"
    "product"    = "mathquest"
    "repository" = "${local.repository_owner}/${local.repository_name}"
  }

  # tflint-ignore: terraform_unused_declarations
  common_tags = local.base_tags
}
