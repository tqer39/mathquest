terraform {
  required_providers {
    # Terraform が誤って hashicorp/cloudflare を参照しなくなるようにするため、source を明示的に指定
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "5.11.0"
    }
  }
}
