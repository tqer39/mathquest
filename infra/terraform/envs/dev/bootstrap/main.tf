module "tfstate_backend" {
  source = "../../../modules/aws-tfstate"

  bucket_name         = var.bucket_name
  dynamodb_table_name = var.dynamodb_table_name
  tags                = var.tags
}
