# 円形タイムトラッキングアプリ

1日の活動を時計のような円形フォーマットで可視化するアプリケーションです。ユーザーは時間帯ごとに活動を追加し、カテゴリ別に管理できます。

## 機能

- ニックネームベースのユーザー認証
- 時間ごとのアクティビティ追跡
- カテゴリによる活動の分類と色分け
- 円形時計インターフェイスでの時間の可視化
- カテゴリの作成、編集、削除
- ダークモード対応

## 技術スタック

- **フロントエンド**: React, TypeScript, TailwindCSS, shadcn/ui
- **バックエンド**: Express, Node.js
- **データベース**: PostgreSQL (NeonDB)
- **状態管理**: TanStack Query (React Query)
- **認証**: カスタム実装

## デプロイ方法

### 前提条件

- Node.js 18以上
- PostgreSQLデータベース

### 環境変数の設定

以下の環境変数を設定してください:

```
DATABASE_URL=postgresql://username:password@hostname:port/database
SESSION_SECRET=your_strong_secret_here
NODE_ENV=production
```

### インストールと実行

```bash
# 依存関係のインストール
npm install

# データベースのセットアップ
npm run db:push

# ビルド
npm run build

# 起動
npm start
```

## Renderへのデプロイ

1. GitHubリポジトリを作成し、コードをプッシュします
2. Renderアカウントで新しいWeb Serviceを作成
3. GitHubリポジトリと連携
4. ビルドコマンドに `npm install && npm run build` を設定
5. 開始コマンドに `npm start` を設定
6. 環境変数に `DATABASE_URL` と `SESSION_SECRET` を追加
7. デプロイを開始

## 開発方法

```bash
# 開発サーバー起動
npm run dev
```

## データベースマイグレーション

```bash
# スキーマの変更をデータベースに適用
npm run db:push
```

## 注意点

- `.env` ファイルは `.gitignore` に追加し、公開リポジトリには含めないでください
- 本番環境では必ず強力なセッションシークレットを使用してください