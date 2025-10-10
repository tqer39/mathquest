# GitHub Secrets セットアップガイド

## 概要

prod 環境の Terraform デプロイで使用する GitHub Secrets の設定方法を説明します。

## 必要な Secrets 一覧

以下の Secrets を GitHub リポジトリに設定してください。

### GCP 関連

| Secret 名        | 説明                | 例          |
| ---------------- | ------------------- | ----------- |
| `GCP_PROJECT_ID` | GCP プロジェクト ID | `portfolio` |

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
