# VTuber Stage

AI V-Tuber システムのフロントエンドであり、VRM モデルの描画、アニメーション、表情制御、コンテンツ表示を担当します。

## 概要

`vtube-stage` は、Electron デスクトップアプリケーション（1920x1080）として動作し、リアルタイムで V-Tuber キャラクターを描画します。MCP (Model Context Protocol) Server を内蔵し、AI からのツール呼び出しを受け付けます。Three.js と `@pixiv/three-vrm` を使用して VRM モデルをレンダリングし、OBS Studio を介して配信可能な映像を生成します。

## アーキテクチャにおける役割

`vtube-stage` は以下の役割を担います:

1.  **MCP Server**: HTTP/SSE エンドポイント (`http://localhost:8080/sse`) を提供し、AI からのツール呼び出しを受け付けます。
2.  **VRM レンダリング**: VRM モデルの読み込みとリアルタイム描画。
3.  **TTS/リップシンク**: VoiceVox を使用した音声合成とリップシンク。
4.  **キャラクター制御**: MCP コマンドに基づく表情、ポーズ、視線のリアルタイム更新。
5.  **Electron GUI**: 1920x1080 のデスクトップウィンドウを提供。

## 機能

- **MCP Server**: HTTP/SSE による MCP サーバー機能。
- **Electron デスクトップアプリ**: 1920x1080 の GUI ウィンドウ。
- **VRM モデルのレンダリング**: Three.js と `@pixiv/three-vrm` を使用。
- **リアルタイム更新**: MCP ツール呼び出しに基づく表情やポーズの更新。
- **TTS/リップシンク**: VoiceVox を使用した音声合成とリップシンクのサポート。
- **Markdown オーバーレイ**: 画面上への Markdown テキスト表示。

## 技術スタック

- **Electron**: デスクトップアプリケーションフレームワーク
- **TypeScript**: プログラミング言語
- **React**: UI フレームワーク
- **Vite**: ビルドツール
- **Three.js**: 3D レンダリングエンジン
- **@pixiv/three-vrm**: VRM モデル制御
- **@modelcontextprotocol/sdk**: MCP Server 実装
- **VoiceVox**: TTS サービス

## 前提条件

- Node.js >= 16
- npm

## インストール

1. **依存関係のインストール:**

   ```bash
   npm install
   ```

2. **環境変数の設定:**

   必要に応じて `.env` ファイルを作成し、設定をカスタマイズできます。

   ```env
   # MCP Server ポート (デフォルト: 8080)
   MCP_SERVER_PORT=8080

   # VoiceVox TTS エンドポイント (デフォルト: http://localhost:50021)
   VITE_VOICEVOX_ENDPOINT=http://localhost:50021
   ```

## サービスの実行

### Electron アプリとして実行（推奨）

Electron デスクトップアプリとして起動します。MCP サーバーは自動的に起動します。

```bash
npm run dev:electron
```

### Web ブラウザでの開発

開発サーバーをブラウザで起動するには、以下のコマンドを実行します:

```bash
npm run dev
```

サーバ起動時に表示されるアドレスに、ブラウザでアクセスしてアプリケーションを確認できます。

## ビルド

### Electron アプリのビルド

Windows 向けの Electron アプリをビルドするには:

```bash
npm run build:win
```

### Web 版のビルド

Web ブラウザ用にビルドするには:

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

## ドキュメント

プロジェクトの詳細な仕様や設計については、以下のドキュメントを参照してください：

- [AGENTS.md](AGENTS.md) - AI エージェント向けプロジェクトマップ
- [アーキテクチャ概要](docs/architecture/overview.md)
- [ディレクトリ構造](docs/architecture/directory-structure.md)
- [技術スタック](docs/architecture/tech-stack.md)
- [用語集](docs/glossary.md)

## ライセンス

このプロジェクトは MIT ライセンスの下でライセンスされています。
