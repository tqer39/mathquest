terraform {
  required_version = "1.13.3"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "6.15.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "5.11.0"
    }
  }
  backend "s3" {
    bucket  = "terraform-tfstate-tqer39-072693953877-ap-northeast-1"
    key     = "mathquest/infra/terraform/envs/dev/dev-bootstrap.tfstate"
    encrypt = true
    region  = "ap-northeast-1"
  }
}
