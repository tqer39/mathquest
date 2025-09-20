terraform {
  required_version = "= 1.13.2"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = ">= 4.28.0"
    }
  }

  backend "local" {
    # dev ルートに state を保存
    path = "../terraform/dev-bootstrap.tfstate"
  }
}
