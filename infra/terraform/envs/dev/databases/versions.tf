terraform {
  required_version = "1.13.3"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "4.52.5"
    }
  }

  backend "s3" {
    bucket  = "terraform-tfstate-tqer39-072693953877-ap-northeast-1"
    key     = "mathquest/infra/terraform/envs/dev/dev-databases.tfstate"
    encrypt = true
    region  = "ap-northeast-1"
  }
}
