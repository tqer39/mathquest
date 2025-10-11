module "deploy_role" {
  source = "../../../modules/deploy-role"

  aws_account_id = local.aws_account_id
  aws_env_name   = local.aws_env_name
  app_env_name   = local.app_env_name
  organization   = local.organization
  repository     = local.repository_name
}
