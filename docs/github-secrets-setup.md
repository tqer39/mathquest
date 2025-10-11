# GitHub Secrets セットアップガイド

## 概要

prod 環境の Terraform デプロイで使用する GitHub Secrets の設定方法を説明します。

## 必要な Secrets 一覧

以下の Secrets を GitHub リポジトリに設定してください。

### GCP 関連

| Secret 名                        | 説明                                                   | 例                                                                                  |
| -------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `GCP_PROJECT_ID`                 | GCP プロジェクト ID                                    | `portfolio`                                                                         |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | GCP Workload Identity Provider (GitHub Actions OIDC用) | `projects/123456789/locations/global/workloadIdentityPools/github/providers/github` |
| `GCP_SERVICE_ACCOUNT`            | GCP Service Account (terraform実行用)                  | `terraform@your-project.iam.gserviceaccount.com`                                    |

### Cloudflare 関連

| Secret 名               | 説明                                      | 例                |
| ----------------------- | ----------------------------------------- | ----------------- |
| `CLOUDFLARE_API_TOKEN`  | Cloudflare API Token（Zone 作成権限必要） | `your-api-token`  |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Account ID                     | `your-account-id` |

### ドメイン登録連絡先情報

| Secret 名                     | 説明                           | 例                                   |
| ----------------------------- | ------------------------------ | ------------------------------------ |
| `CONTACT_COUNTRY_CODE`        | 国コード（ISO 3166-1 alpha-2） | `JP`                                 |
| `CONTACT_POSTAL_CODE`         | 郵便番号                       | `1234567`                            |
| `CONTACT_ADMINISTRATIVE_AREA` | 都道府県                       | `Tokyo`                              |
| `CONTACT_LOCALITY`            | 市区町村                       | `Shibuya`                            |
| `CONTACT_ADDRESS_LINES`       | 住所（カンマ区切り）           | `1-2-3 Example Street,Building Name` |
| `CONTACT_RECIPIENT`           | 受信者名                       | `Your Name`                          |
| `CONTACT_EMAIL`               | メールアドレス                 | `your-email@example.com`             |
| `CONTACT_PHONE`               | 電話番号（E.164 形式）         | `+81.312345678`                      |

### ドメイン価格情報

| Secret 名               | 説明                 | 例    |
| ----------------------- | -------------------- | ----- |
| `YEARLY_PRICE_CURRENCY` | 年間価格の通貨コード | `USD` |
| `YEARLY_PRICE_UNITS`    | 年間価格（整数）     | `12`  |

**重要**: `yearly_price` は GCP Cloud Domains でドメイン登録する際に**必須**です。価格は以下の方法で事前に確認してください：

1. **GCP Console で確認**:

   ```bash
   gcloud domains registrations search-domains mathquest.app
   ```

2. **Cloud Domains Pricing ページ**:
   - [https://cloud.google.com/domains/pricing](https://cloud.google.com/domains/pricing)

実際の価格と一致しない場合、Terraform apply 時にエラーが発生します。

## Secrets の設定方法

### 1. GitHub リポジトリの Settings に移動

リポジトリページの **Settings** タブをクリックします。

### 2. Secrets and variables > Actions に移動

左サイドバーから **Secrets and variables** > **Actions** を選択します。

### 3. Repository secrets を追加

**New repository secret** ボタンをクリックし、上記の表に従って各 Secret を追加します。

## 注意事項

### 電話番号の形式

電話番号は E.164 形式で入力してください：

- 日本の場合: `+81.` で始まり、市外局番の先頭の 0 を除く
- 例: `03-1234-5678` → `+81.312345678`

### 住所の入力

`CONTACT_ADDRESS_LINES` は複数行の住所をカンマ区切りで指定します：

- 例: `1-2-3 Example Street,Building Name`

### 価格情報の確認

ドメイン登録の価格は GCP Cloud Domains のドキュメントで確認できます：

- [Cloud Domains Pricing](https://cloud.google.com/domains/pricing)

### GCP Workload Identity の設定方法

`GCP_WORKLOAD_IDENTITY_PROVIDER` と `GCP_SERVICE_ACCOUNT` を取得するには、以下の手順で設定します。

#### 1. サービスアカウントの作成

```bash
# プロジェクトIDを設定
export GCP_PROJECT_ID="your-project-id"

# サービスアカウントを作成
gcloud iam service-accounts create github-actions-terraform \
  --project="${GCP_PROJECT_ID}" \
  --display-name="GitHub Actions Terraform"

# サービスアカウントのメールアドレスを確認（これが GCP_SERVICE_ACCOUNT）
export SERVICE_ACCOUNT="github-actions-terraform@${GCP_PROJECT_ID}.iam.gserviceaccount.com"
echo "GCP_SERVICE_ACCOUNT: ${SERVICE_ACCOUNT}"
```

#### 2. サービスアカウントに権限を付与

```bash
# Cloud Domains 管理者権限
gcloud projects add-iam-policy-binding "${GCP_PROJECT_ID}" \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/domains.admin"

# Service Usage Consumer 権限（API 有効化のため）
gcloud projects add-iam-policy-binding "${GCP_PROJECT_ID}" \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/serviceusage.serviceUsageConsumer"
```

#### 3. Workload Identity Pool の作成

```bash
# Workload Identity Pool を作成
gcloud iam workload-identity-pools create "github" \
  --project="${GCP_PROJECT_ID}" \
  --location="global" \
  --display-name="GitHub Actions"

# プロジェクト番号を取得
export PROJECT_NUMBER=$(gcloud projects describe "${GCP_PROJECT_ID}" --format="value(projectNumber)")
```

#### 4. Workload Identity Provider の作成

```bash
# GitHub 用の Provider を作成
gcloud iam workload-identity-pools providers create-oidc "github" \
  --project="${GCP_PROJECT_ID}" \
  --location="global" \
  --workload-identity-pool="github" \
  --display-name="GitHub Actions Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
  --attribute-condition="assertion.repository_owner == 'YOUR_GITHUB_USERNAME'" \
  --issuer-uri="https://token.actions.githubusercontent.com"

# Provider の完全な ID を取得（これが GCP_WORKLOAD_IDENTITY_PROVIDER）
export WORKLOAD_IDENTITY_PROVIDER="projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github/providers/github"
echo "GCP_WORKLOAD_IDENTITY_PROVIDER: ${WORKLOAD_IDENTITY_PROVIDER}"
```

**重要**: `YOUR_GITHUB_USERNAME` を実際の GitHub ユーザー名またはオーガニゼーション名に置き換えてください。

#### 5. サービスアカウントに Workload Identity User 権限を付与

```bash
# GitHub Actions からサービスアカウントを使用できるようにする
gcloud iam service-accounts add-iam-policy-binding "${SERVICE_ACCOUNT}" \
  --project="${GCP_PROJECT_ID}" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/github/attribute.repository/YOUR_GITHUB_USERNAME/mathquest"
```

**重要**: `YOUR_GITHUB_USERNAME/mathquest` を実際のリポジトリパスに置き換えてください。

#### 6. GitHub Secrets に登録

以下の値を GitHub リポジトリの Secrets に登録します：

```bash
# これらの値をコピーして GitHub Secrets に設定
echo "GCP_WORKLOAD_IDENTITY_PROVIDER: ${WORKLOAD_IDENTITY_PROVIDER}"
echo "GCP_SERVICE_ACCOUNT: ${SERVICE_ACCOUNT}"
```

## ローカルでの Terraform 実行

### prod/domain で terraform plan を実行する場合

ローカル環境で `infra/terraform/envs/prod/domain` の terraform plan を実行する際は、事前に GCP 認証が必要です：

```bash
# GCP プロジェクトを設定
gcloud config set project ${GCP_PROJECT_ID}

# Application Default Credentials で認証
gcloud auth application-default login
```

その後、terraform コマンドを実行できます：

```bash
cd infra/terraform/envs/prod/domain
terraform init
terraform plan
```

**注意**: GitHub Actions では OIDC 認証を使用するため、この手順は不要です。

## 動作確認

Secrets を設定後、以下の手順で動作確認できます：

1. `main` ブランチに PR を作成
2. GitHub Actions で `Terraform - prod` ワークフローが実行される
3. `terraform plan` の結果がコメントされる
4. PR をマージすると `terraform apply` が実行される

## トラブルシューティング

### tfvars 生成エラー

GitHub Actions のログで `terraform.auto.tfvars` の生成に失敗する場合：

- 各 Secret が正しく設定されているか確認
- Secret 名のスペルミスがないか確認

### Terraform Plan エラー

`terraform plan` が失敗する場合：

- GCP プロジェクトが存在するか確認
- Cloudflare API Token に適切な権限があるか確認
- 連絡先情報の形式が正しいか確認

## 参考資料

- [GitHub Secrets のドキュメント](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [GCP Cloud Domains](https://cloud.google.com/domains/docs)
- [Cloudflare API Tokens](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)
