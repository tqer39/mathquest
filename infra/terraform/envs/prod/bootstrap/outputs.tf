output "r2_bucket_name" {
  value       = module.r2_state.bucket_name
  description = "tfstate 用 R2 バケット名"
}

output "r2_s3_endpoint" {
  value       = module.r2_state.s3_endpoint
  description = "S3 互換エンドポイント（backend 設定に使用）"
}
