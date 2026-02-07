# VTuber Stage

AI V-Tuber システムのフロントエンドであり、VRM モデルの描画、アニメーション、表情制御、コンテンツ表示を担当します。

## 概要

`vtube-stage` は、Electron 上で動作する MCP サーバー兼フロントエンドです。`vtuber-behavior-engine` からのツール呼び出しを受け取り、Three.js と `@pixiv/three-vrm` を使用して VRM モデルをレンダリングし、OBS Studio を介して配信可能な映像を生成します。デフォルトのウィンドウ解像度は **1920 x 1080** です。

## アーキテクチャにおける役割

`vtube-stage` は以下の役割を担います:

1.  VRM モデルの読み込みとレンダリング。
2.  MCP ツール呼び出しを受け取り、Electron IPC 経由で StageCommand をレンダラに反映。
3.  TTS (Text-to-Speech) を使用した音声合成とリップシンク。

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

   `.env` ファイルを作成し、以下の設定を追加します。

   `.env` で VoiceVox などの設定を行う場合は以下を設定してください。

   ```env
   VITE_VOICEVOX_API_BASE=http://localhost:50021
   VITE_TTS_ENABLED=true
   ```

## サービスの実行

開発サーバーを起動するには、以下のコマンドを実行します:

```bash
npm run dev
npm run dev:electron # 別ターミナルで Electron を起動
```

サーバ起動時に表示されるアドレスに、ブラウザでアクセスしてアプリケーションを確認できます。

## ビルド

本番環境用にビルドするには、以下のコマンドを実行します:

```bash
npm run build
npm run build:electron-main
npm run build:win # Windows アプリを electron-builder で生成
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

## ドキュメント

プロジェクトの詳細な仕様や設計については、以下のドキュメントを参照してください：

- [AGENTS.md](AGENTS.md) - AI エージェント向けプロジェクトマップ
- [アーキテクチャ概要](docs/architecture/overview.md)
- [ディレクトリ構造](docs/architecture/directory-structure.md)
- [技術スタック](docs/architecture/tech-stack.md)
- [用語集](docs/glossary.md)

## ライセンス

このプロジェクトは MIT ライセンスの下でライセンスされています。
