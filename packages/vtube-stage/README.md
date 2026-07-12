# VTuber Stage

AI V-Tuber システムのフロントエンドであり、VRM モデルの描画、アニメーション、表情制御、コンテンツ表示を担当します。

## 概要

`vtube-stage` は、リアルタイムで V-Tuber キャラクターを描画する Electron アプリケーションです。内蔵の MCP (Model Context Protocol) サーバーが AI (`vtuber-behavior-engine`) からのツール呼び出しを受け取り、IPC 経由で renderer プロセスに StageCommand を送信してキャラクターの表情や動作を制御します。Three.js と `@pixiv/three-vrm` を使用して VRM モデルをレンダリングし、OBS Studio を介して配信可能な映像を生成します。

## アーキテクチャにおける役割

`vtube-stage` は以下の役割を担います:

1.  VRM モデルの読み込みとレンダリング。
2.  内蔵 MCP サーバー (`electron/server/mcp-server.ts`) で AI からのツール呼び出し (`speak`, `trigger_animation`, `display_markdown_text`, `control_camera`) を受理し、IPC 経由で renderer にコマンドを送信して、キャラクターの表情、ポーズ、視線をリアルタイムで更新。
3.  (オプション) TTS (Text-to-Speech) を使用した音声合成とリップシンク。

## 機能

- **VRM モデルのレンダリング:** Three.js と `@pixiv/three-vrm` を使用。
- **リアルタイム更新:** MCP ツール呼び出しに基づく表情やポーズの更新。
- **TTS/リップシンク:** (オプション) VOICEVOX を使用した音声合成とリップシンクのサポート。
- **Markdown オーバーレイ:** 画面上への Markdown テキスト表示。

## 技術スタック

- TypeScript
- React
- Vite
- Three.js
- `@pixiv/three-vrm`
- Electron (内蔵 MCP サーバー: `@modelcontextprotocol/sdk` + Express)
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

   ```env
   # MCP Server Configuration (SSE)
   STAGE_DIRECTOR_MCP_HOST=localhost
   STAGE_DIRECTOR_MCP_PORT=8080
   ```

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

## 公開 (Publish)

GitHub Packages に公開するには、以下の手順を実行します。

1.  **認証設定**:
    `~/.npmrc` (ユーザーホームディレクトリ) に以下を設定します（トークンは `write:packages` 権限が必要）。

    ```ini
    @longbowxxx:registry=https://npm.pkg.github.com
    //npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
    ```

2.  **公開コマンド**:
    ```bash
    npm publish
    ```

## 他の PC での利用

公開されたパッケージを他の PC で実行するには、以下の手順を行います。

1.  **認証設定**:
    実行する PC の `~/.npmrc` に以下を設定します（トークンは `read:packages` 権限が必要）。

    ```ini
    @longbowxxx:registry=https://npm.pkg.github.com
    //npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
    ```

2.  **インストール**:
    パッケージをグローバルインストールします。

    ```bash
    npm install -g @longbowxxx/vtube-stage
    ```

3.  **実行**:
    インストール後、以下のコマンドで実行します。

    **注意**: このパッケージは Electron を依存関係に含んでいるため、インストールには 100MB 以上のダウンロードが必要です。

    ```bash
    # Stdio モードで実行 (推奨)
    vtube-stage --transport=stdio

    # デフォルトモード (SSE)
    vtube-stage
    ```

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
