provider "aws" {
  region = local.region.apne1
  default_tags {
    tags = merge(local.common_tags, {
      "${local.prefix}:source_path" = "./infra/terraform/envs/${local.app_env_name}/bootstrap"
    })
  }
}

provider "cloudflare" {}
