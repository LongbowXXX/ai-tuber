<!-- このドキュメントは .github/prompts/doc-sync.prompt.md によって生成および更新されています -->

# 技術スタック (Tech Stack)

## 1. 言語とランタイム

| カテゴリ       | 技術       | バージョン | 用途                          |
| :------------- | :--------- | :--------- | :---------------------------- |
| **言語**       | Python     | >= 3.11    | AI バックエンド               |
| **言語**       | TypeScript | ~5.7       | Electron アプリ (Stage)       |
| **ランタイム** | Node.js    | >= 20.x    | Electron ビルド・実行         |

## 2. 主要フレームワークとライブラリ

### 2.1. AI Backend (`vtuber-behavior-engine`)

| ライブラリ              | バージョン | 用途                                     |
| :---------------------- | :--------- | :--------------------------------------- |
| **Google ADK**          | >= 1.17.0  | マルチエージェントオーケストレーション   |
| **google-genai**        | -          | Gemini API クライアント                  |
| **mcp**                 | -          | MCP Client (Stage Director との通信)     |
| **chromadb**            | -          | ベクトルデータベース (長期記憶/知識検索) |
| **google-cloud-speech** | -          | 音声認識 (STT)                           |

### 2.2. VTube Stage (`vtube-stage`)

| ライブラリ           | バージョン | 用途                           |
| :------------------- | :--------- | :----------------------------- |
| **Electron**         | -          | デスクトップアプリフレームワーク |
| **React**            | 19.x       | UI フレームワーク              |
| **Vite**             | 6.x        | ビルドツール / 開発サーバー    |
| **Three.js**         | ^0.175     | 3D レンダリングエンジン        |
| **@pixiv/three-vrm** | ^3.4       | VRM モデル制御                 |
| **react-markdown**   | -          | Markdown テキスト表示          |
| **@modelcontextprotocol/sdk** | -  | MCP サーバー実装 (HTTP/SSE)    |

## 3. 通信プロトコル

- **MCP (Model Context Protocol)**: AI (`vtuber-behavior-engine`) から配信ステージ (`vtube-stage`) へのツール呼び出しに使用。HTTP/SSE (Server-Sent Events) 経由で `http://localhost:8080/sse` に接続。
- **HTTP/JSON**: TTS (VoiceVox) 連携や、一部のメタデータ取得に使用。

## 4. 外部サービス・ツール

- **VoiceVox**: 音声合成 (TTS) エンジン。HTTP API 経由で利用。
- **OBS Studio**: 配信ソフトウェア。`vtube-stage` の Electron ウィンドウをキャプチャして配信。
- **Gemini API**: LLM (Large Language Model) エンジン。

## 5. 開発・ビルドツール

- **uv**: Python のパッケージ管理・実行ツール。
- **npm**: Node.js のパッケージ管理ツール。
- **ESLint / Prettier**: コード品質管理とフォーマット。
