terraform {
  required_version = "1.13.3"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "4.52.5"
    }
  }

  backend "s3" {
    bucket         = "mathquest-terraform-state-portfolio-dev"
    region         = "ap-northeast-1"
    key            = "databases/terraform.tfstate"
    dynamodb_table = "mathquest-terraform-state-lock-portfolio-dev"
    encrypt        = true
  }
}
