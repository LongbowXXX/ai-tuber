# 技術スタック

## コア技術

| カテゴリ        | 技術                       | バージョン | 用途                   |
| :-------------- | :------------------------- | :--------- | :--------------------- |
| 言語            | TypeScript                 | 5.7        | プログラミング言語     |
| フレームワーク  | React                      | 19.0       | UI ライブラリ          |
| ビルドツール    | Vite                       | 6.3        | 開発サーバー・ビルド   |
| 3D レンダリング | Three.js                   | 0.175      | 3D グラフィックス      |
| VRM 制御        | @pixiv/three-vrm           | 3.4        | VRM モデルの操作       |
| アニメーション  | @pixiv/three-vrm-animation | 3.4        | VRM アニメーション再生 |
| デスクトップ    | Electron                   | 40         | アプリランタイム       |
| プロトコル      | @modelcontextprotocol/sdk  | 1.26       | 内蔵 MCP サーバー      |

## ライブラリ・ツール

- **React Three Fiber / Drei**: Three.js を React で宣言的に扱うためのラッパー。
- **Material UI (MUI)**: 管理画面やオーバーレイ UI のコンポーネント。
- **Emotion / Styled Components**: CSS-in-JS スタイリング。
- **Axios**: TTS サービス等との HTTP 通信。
- **class-validator / class-transformer**: 受信コマンドのバリデーションとクラス変換。
- **React Markdown / Remark GFM**: 吹き出し内などのテキストレンダリング。

## 外部サービス・連携

- **MCP (SSE / stdio)**: `vtuber-behavior-engine` からのツール呼び出しを内蔵 MCP サーバーで受理 (Express ベース、既定 127.0.0.1:8080)。
- **Electron IPC**: main process から renderer へのコマンド伝達 (preload の `window.electron.socket`)。
- **VOICEVOX**: 音声合成 (TTS) エンジン (外部実行が必要)。
