# VTuber Stage

AI V-Tuber システムの Electron デスクトップアプリケーション。VRM モデルの描画、アニメーション、表情制御、コンテンツ表示を担当し、MCP Server として AI からのツール呼び出しを処理します。

## 概要

`vtube-stage` は、リアルタイムで V-Tuber キャラクターを描画する Electron デスクトップアプリケーション（1920x1080 解像度）です。

- **Main Process**: MCP Server (stdio) として `vtuber-behavior-engine` からのツール呼び出しを受信し、Electron IPC 経由で Renderer Process にコマンドを送信
- **Renderer Process**: Three.js と `@pixiv/three-vrm` を使用して VRM モデルをレンダリングし、OBS Studio を介して配信可能な映像を生成

## アーキテクチャにおける役割

`vtube-stage` は以下の役割を担います:

1.  **MCP Server**: stdio トランスポートで `vtuber-behavior-engine` からツール呼び出し (`speak`, `trigger_animation`, `display_markdown_text`) を受信
2.  **Main Process**: コマンドのキューイング、完了同期、Electron IPC 経由での Renderer への命令送信
3.  **Renderer Process**: VRM モデルの読み込みとレンダリング、キャラクターの表情・ポーズ・視線のリアルタイム更新、TTS (Text-to-Speech) を使用した音声合成とリップシンク

## 機能

- **Electron Desktop App:** 1920x1080 解像度のデスクトップアプリケーション
- **MCP Server:** stdio トランスポートで AI からのツール呼び出しを受信
- **VRM モデルのレンダリング:** Three.js と `@pixiv/three-vrm` を使用
- **リアルタイム更新:** Electron IPC を介して受信したコマンドに基づく表情やポーズの更新
- **TTS/リップシンク:** VOICEVOX を使用した音声合成とリップシンクのサポート
- **Markdown オーバーレイ:** 画面上への Markdown テキスト表示

## 技術スタック

- TypeScript
- Electron
- React
- Vite
- Three.js
- `@pixiv/three-vrm`
- `@modelcontextprotocol/sdk` (MCP Server)
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
   # VoiceVox TTS サービスのエンドポイント
   VITE_VOICEVOX_ENDPOINT=http://localhost:50021
   ```

## サービスの実行

開発モードで Electron アプリを起動するには、以下のコマンドを実行します:

```bash
npm run dev
```

Electron デスクトップアプリが起動し、VRM キャラクターが表示されます。

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

## ドキュメント

プロジェクトの詳細な仕様や設計については、以下のドキュメントを参照してください：

- [AGENTS.md](AGENTS.md) - AI エージェント向けプロジェクトマップ
- [アーキテクチャ概要](docs/architecture/overview.md)
- [ディレクトリ構造](docs/architecture/directory-structure.md)
- [技術スタック](docs/architecture/tech-stack.md)
- [用語集](docs/glossary.md)

## ライセンス

このプロジェクトは MIT ライセンスの下でライセンスされています。
