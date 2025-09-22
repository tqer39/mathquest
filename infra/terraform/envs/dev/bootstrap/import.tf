# 既存のリソースを取り込む場合は以下の import ブロックを参考にしてください。
#
# import {
#   to = module.tfstate_backend.aws_s3_bucket.state
#   id = var.bucket_name
# }
#
# import {
#   to = module.tfstate_backend.aws_dynamodb_table.lock
#   id = var.dynamodb_table_name
# }
