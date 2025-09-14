output "bucket_name" {
  value       = cloudflare_r2_bucket.state.name
  description = "作成またはインポートされた R2 バケット名"
}

output "bucket_id" {
  value       = cloudflare_r2_bucket.state.id
  description = "R2 バケットのリソース ID"
}

output "s3_endpoint" {
  value       = "https://${var.cloudflare_account_id}.r2.cloudflarestorage.com"
  description = "S3 互換エンドポイント（backend 設定に使用）"
}
