terraform {
  required_version = "1.13.3"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "5.45.2"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "4.52.5"
    }
  }
}
