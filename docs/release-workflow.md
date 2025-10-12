# リリースワークフロー

このドキュメントでは、MathQuest プロジェクトのリリースワークフローについて説明します。

## 概要

MathQuest では、以下の 2 つのワークフローを使用してリリースを管理しています：

1. **Create Release** (`.github/workflows/create-release.yml`): GitHub Release を作成する
2. **Terraform - prod** (`.github/workflows/terraform-prod.yml`): GitHub Release をトリガーに本番環境へデプロイする

## リリースの作成手順

### 1. Create Release ワークフローを実行

GitHub Actions の UI から手動で実行します：

1. GitHub リポジトリの **Actions** タブを開く
2. 左側のワークフロー一覧から **Create Release** を選択
3. **Run workflow** ボタンをクリック
4. バージョンアップの種類を選択:
   - **major**: メジャーバージョンアップ（例: v1.0.0 → v2.0.0）
   - **minor**: マイナーバージョンアップ（例: v1.0.0 → v1.1.0）
   - **patch**: パッチバージョンアップ（例: v1.0.0 → v1.0.1）
5. **Run workflow** ボタンをクリックして実行

### 2. ワークフローの動作

Create Release ワークフローは以下の処理を自動的に実行します：

1. **最新タグの取得**: 既存の SemVer 形式のタグ（`v*.*.*`）から最新バージョンを取得
   - タグが存在しない場合は `v0.0.0` を初期値として使用
2. **次バージョンの計算**: 選択したバージョンアップの種類に基づいて新しいバージョンを計算
3. **リリースノートの生成**:
   - 初回リリース: 全コミット履歴を含める
   - 2 回目以降: 前回のタグからの差分のみ含める
4. **GitHub Release の作成**: 計算されたバージョンとリリースノートで GitHub Release を作成

### 3. 本番環境へのデプロイ

GitHub Release が作成されると、**Terraform - prod** ワークフローが自動的にトリガーされます：

1. SemVer 形式のバリデーション
2. Terraform の差分確認（plan）
3. 差分がある場合、本番環境へ自動デプロイ（apply）

## バージョニング規則

このプロジェクトでは [Semantic Versioning 2.0.0](https://semver.org/) に従います：

- **MAJOR**: 互換性のない API の変更
- **MINOR**: 後方互換性のある機能の追加
- **PATCH**: 後方互換性のあるバグ修正

### バージョン形式

- 形式: `vMAJOR.MINOR.PATCH`
- 例: `v1.2.3`
- プレリリース版: `v1.2.3-alpha.1`（現在は未サポート）

## トラブルシューティング

### タグが正しく作成されない

- ワークフローログを確認して、エラーメッセージを確認してください
- GitHub の権限設定で `contents: write` が許可されていることを確認してください

### リリースノートが空

- 前回のリリースから変更がない場合、"No changes since last release" と表示されます
- 新しいコミットを追加してから再度ワークフローを実行してください

### Terraform デプロイが失敗する

- **Terraform - prod** ワークフローのログを確認してください
- インフラストラクチャの設定や、必要な Secrets が正しく設定されているか確認してください
- 詳細は `docs/github-secrets-setup.md` を参照してください

## 関連ドキュメント

- [GitHub Secrets セットアップ](./github-secrets-setup.md)
- [ローカル開発環境](./local-dev.md)
