terraform {
  required_version = "= 1.13.2"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "= 5.30.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "4.52.5"
    }
  }
}
