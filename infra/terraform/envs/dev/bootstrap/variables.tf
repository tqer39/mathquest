variable "bucket_name" {
  type        = string
  description = "tfstate を保存する S3 バケット名"
  default     = "mathquest-dev-tfstate"
}

variable "dynamodb_table_name" {
  type        = string
  description = "Terraform の状態ロックに使用する DynamoDB テーブル名"
  default     = "mathquest-dev-terraform-lock"
}

variable "aws_region" {
  type        = string
  description = "AWS リージョン"
  default     = "ap-northeast-1"
}

variable "aws_profile" {
  type        = string
  description = "利用する AWS プロファイル名。環境変数認証を使う場合は null のままでOK"
  default     = null
}

variable "tags" {
  type        = map(string)
  description = "S3 バケット / DynamoDB に付与する共通タグ"
  default     = {}
}
