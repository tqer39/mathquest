terraform {
  required_version = "= 1.13.2"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = ">= 4.29.0"
    }
  }
}
