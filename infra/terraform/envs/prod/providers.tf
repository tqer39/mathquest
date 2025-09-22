provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# Cloud Domains API を有効化（環境側で一度だけ）
resource "google_project_service" "domains" {
  project = var.gcp_project_id
  service = "domains.googleapis.com"
}
