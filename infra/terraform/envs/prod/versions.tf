terraform {
  required_version = "1.13.3"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "7.5.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "5.11.0"
    }
  }
}
