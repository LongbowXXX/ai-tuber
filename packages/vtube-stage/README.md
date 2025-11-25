# VTuber Stage

AI V-Tuber システムのフロントエンドであり、VRM モデルの描画、アニメーション、表情制御、コンテンツ表示を担当します。

## 概要

`vtube-stage` は、リアルタイムで V-Tuber キャラクターを描画し、`stage-director` からのコマンドに基づいてキャラクターの表情や動作を制御するフロントエンド Web アプリケーションです。Three.js と `@pixiv/three-vrm` を使用して VRM モデルをレンダリングし、OBS Studio を介して配信可能な映像を生成します。

## アーキテクチャにおける役割

[アーキテクチャドキュメント](./agents-docs/architecture.md) で説明されているように、`vtube-stage` は以下の役割を担います:

1.  VRM モデルの読み込みとレンダリング。
2.  `stage-director` からの WebSocket コマンドを受信し、キャラクターの表情、ポーズ、視線をリアルタイムで更新。
3.  (オプション) TTS (Text-to-Speech) を使用した音声合成とリップシンク。

## 機能

- **VRM モデルのレンダリング:** Three.js と `@pixiv/three-vrm` を使用。
- **リアルタイム更新:** WebSocket を介して受信したコマンドに基づく表情やポーズの更新。
- **TTS/リップシンク:** (オプション) VOICEVOX を使用した音声合成とリップシンクのサポート。
- **Markdown オーバーレイ:** 画面上への Markdown テキスト表示。

## 技術スタック

- TypeScript
- React
- Vite
- Three.js
- `@pixiv/three-vrm`
- WebSocket クライアント
- VOICEVOX TTS

## 前提条件

- Node.js >= 16
- npm

## インストール

1. **依存関係のインストール:**

   ```bash
   npm install
   ```

2. **環境変数の設定:**

   必要に応じて `.env` ファイルを作成し、設定を追加します。

## サービスの実行

開発サーバーを起動するには、以下のコマンドを実行します:

```bash
npm run dev
```

サーバ起動時に表示されるアドレスに、ブラウザでアクセスしてアプリケーションを確認できます。

## ビルド

本番環境用にビルドするには、以下のコマンドを実行します:

```bash
npm run build
```

生成されたファイルは `dist/` ディレクトリに出力されます。

## 開発

このプロジェクトでは、コードの品質を確保するためにいくつかのツールを使用しています:

- **フォーマット:** `prettier`
- **リンティング:** `eslint`

これらのツールは、次のようなコマンドで実行できます:

```bash
npm run lint
npm run format
```

## 詳細ドキュメント

開発者向けの詳細なドキュメントは `agents-docs/` ディレクトリを参照してください:

- [アーキテクチャ](./agents-docs/architecture.md) - システム構成とコンポーネント設計
- [ディレクトリ構造](./agents-docs/directory-structure.md) - ファイル配置ガイド
- [技術スタック](./agents-docs/tech-stack.md) - 使用ライブラリと環境変数
- [コーディング規約](./agents-docs/coding-conventions.md) - 命名規則とスタイルガイド
- [主要フロー](./agents-docs/key-flows.md) - 処理フローの詳細
- [制約と注意事項](./agents-docs/constraints-and-gotchas.md) - 既知の問題とトラブルシューティング
- [テスト戦略](./agents-docs/testing.md) - テスト導入ガイド

## ライセンス

このプロジェクトは MIT ライセンスの下でライセンスされています。
