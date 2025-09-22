output "bucket_name" {
  value       = aws_s3_bucket.state.bucket
  description = "作成またはインポートされた S3 バケット名"
}

output "bucket_arn" {
  value       = aws_s3_bucket.state.arn
  description = "S3 バケット ARN"
}

output "dynamodb_table_name" {
  value       = var.create_lock_table ? aws_dynamodb_table.lock[0].name : null
  description = "Terraform 状態ロック用 DynamoDB テーブル名 (作成しない場合は null)"
}
