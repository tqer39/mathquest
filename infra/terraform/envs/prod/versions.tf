terraform {
  required_version = "= 1.13.2"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "5.45.2"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "= 4.29.0"
    }
  }
}
