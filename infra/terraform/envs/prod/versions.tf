terraform {
  required_version = ">= 1.6.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 5.30.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = ">= 4.29.0"
    }
  }
}
