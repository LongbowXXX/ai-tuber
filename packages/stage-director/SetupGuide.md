# プロジェクト開発環境セットアップガイド (Node.js)

## 1. はじめに

### 目的

このドキュメントは、stage-director プロジェクトにおける標準的な Node.js (TypeScript) 開発環境を構築するための手順を説明します。
開発ツールとして `npm`, `eslint`, `prettier`, `vitest` を利用し、効率的で一貫性のある開発プロセスを目指します。

### 対象読者

本プロジェクトに参加するすべての開発メンバーを対象とします。

### 前提

- Node.js (v18以上推奨) がインストールされていること。
- VS Code がインストールされていること。

## 2. 開発ツールの概要

- **TypeScript:** 静的型付け言語。
- **ESLint:** リンター。コードの品質問題を検出します。
- **Prettier:** コードフォーマッター。
- **Vitest:** テストフレームワーク。
- **tsx:** TypeScript 実行ツール (開発用サーバー起動に使用)。

## 3. 環境構築手順

### 3.1. リポジトリのクローンと依存関係のインストール

1. リポジトリをクローンします。
2. ディレクトリに移動します。
3. 依存関係をインストールします。

```bash
npm install
```

### 3.2. VS Code 拡張機能のインストール

推奨拡張機能:

- **ESLint** (Microsoft)
- **Prettier - Code formatter** (Prettier)
- **Vitest** (Vitest) - オプション

## 4. 開発ワークフロー

### 4.1. サーバーの起動

開発モード（ホットリロード有効）でサーバーを起動します。

```bash
npm run dev
```

このコマンドは `tsx watch` を使用して `src/index.ts` を実行します。
WebSocket サーバー (ws://localhost:8000/ws) と MCP サーバー (http://localhost:8080) が起動します。

### 4.2. ビルド

プロダクション用のビルドを行います (`dist` ディレクトリに出力)。

```bash
npm run build
```

ビルド後の実行:

```bash
npm start
```

### 4.3. コード品質チェック

```bash
# フォーマット (Prettier)
npm run format

# リント (ESLint)
npm run lint
```

### 4.4. テストの実行

```bash
npm test
```

## 5. トラブルシューティング

- **Q: 依存関係のインストールに失敗する**
  - A: Node.js のバージョンを確認してください。`package-lock.json` を削除して `npm install` を再試行してください。

- **Q: ポートが競合する**
  - A: `.env` ファイルで `STAGE_DIRECTOR_PORT` や `STAGE_DIRECTOR_MCP_PORT` を変更してください。
