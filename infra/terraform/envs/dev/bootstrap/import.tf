import {
  to = cloudflare_r2_bucket.this
  # Cloudflare R2 バケットの import ID 形式: "<account_id>/<bucket_name>"
  id = "${var.account_id}/${var.bucket_name}"
}
