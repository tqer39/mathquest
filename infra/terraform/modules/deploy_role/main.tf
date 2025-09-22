data "aws_iam_policy_document" "assume_role" {
  statement {
    actions = [
      "sts:AssumeRoleWithWebIdentity"
    ]
    principals {
      type = "Federated"
      identifiers = [
        "arn:aws:iam::${var.aws_account_id}:oidc-provider/token.actions.githubusercontent.com",
      ]
    }
    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values = [
        "repo:${var.organization}/${var.repository}:*",
      ]
    }
  }
}

data "aws_iam_policy_document" "deploy_allow_specifics" {
  statement {
    sid = "AllowSpecifics"
    actions = [
      "lambda:*",
      "apigateway:*",
      "ec2:*",
      "rds:*",
      "s3:*",
      "sns:*",
      "states:*",
      "ssm:*",
      "sqs:*",
      "iam:*",
      "elasticloadbalancing:*",
      "autoscaling:*",
      "cloudwatch:*",
      "cloudfront:*",
      "route53:*",
      "ecr:*",
      "logs:*",
      "ecs:*",
      "application-autoscaling:*",
      "events:*",
      "elasticache:*",
      "es:*",
      "kms:*",
      "dynamodb:*",
      "kinesis:*",
      "firehose:*",
      "elasticbeanstalk:*",
      "cloudformation:*",
      "acm:*",
      "organizations:*",
      "sso:*",
      "identitystore:*",
    ]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "deploy_allow_specifics" {
  name   = "deploy-allow-specifics"
  policy = data.aws_iam_policy_document.deploy_allow_specifics.json
}

data "aws_iam_policy_document" "deploy_deny_specifics" {
  statement {
    actions = [
      "iam:*Login*",
      "iam:*Group*",
      "aws-portal:*",
      "budgets:*",
      "config:*",
      "directconnect:*",
      "aws-marketplace:*",
      "aws-marketplace-management:*",
      "ec2:*ReservedInstances*"
    ]
    effect    = "Deny"
    resources = ["*"]
    sid       = "DenySpecifics"
  }
}

resource "aws_iam_policy" "deploy_deny_specifics" {
  name   = "deploy-deny-specifics"
  policy = data.aws_iam_policy_document.deploy_deny_specifics.json
}

resource "aws_iam_role" "this" {
  name               = "${var.aws_env_name}-${var.repository}-deploy-${var.app_env_name}"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

resource "aws_iam_role_policy_attachments_exclusive" "this" {
  role_name = aws_iam_role.this.name
  policy_arns = [
    aws_iam_policy.deploy_allow_specifics.arn,
    aws_iam_policy.deploy_deny_specifics.arn,
  ]
}
