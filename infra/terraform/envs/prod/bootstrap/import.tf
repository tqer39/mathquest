terraform {
  # Terraform v1.5+ の import ブロック。手動作成した R2 バケットを取り込みます。
  # 事前に Cloudflare ダッシュボード or wrangler でバケットを作成しておいてください。
}

import {
  to = module.r2_state.cloudflare_r2_bucket.state
  # 形式は `<account_id>/<bucket_name>` を想定
  id = "${var.cloudflare_account_id}/${var.r2_bucket_name}"
}
