<!-- This document is generated and updated by .github/prompts/doc-sync.prompt.md -->

# 技術スタック

## 全体

| カテゴリ       | 技術                                      | 用途                                                            |
| -------------- | ----------------------------------------- | --------------------------------------------------------------- |
| 言語           | Python 3.11+                              | AI バックエンド（Behavior Engine / Stage Director）             |
| 言語           | TypeScript (TS 5.7)                       | フロントエンド（vtube-stage）                                   |
| フレームワーク | FastAPI (0.120.0)                         | stage-director の WebSocket/HTTP サーバー                       |
| プロトコル     | WebSocket                                 | stage-director ↔ vtube-stage のリアルタイム制御                 |
| プロトコル     | MCP (Model Context Protocol)              | vtuber-behavior-engine → stage-director のツール呼び出し（SSE） |
| フレームワーク | Google ADK (>= 1.17.0)                    | vtuber-behavior-engine のマルチエージェント実行                 |
| フロント       | React 19 / Vite 6                         | vtube-stage UI/ビルド                                           |
| 3D             | Three.js (0.175) / @pixiv/three-vrm (3.4) | VRM モデル描画/制御                                             |
| TTS            | VoiceVox                                  | 音声合成（HTTP API）                                            |
| 配信           | OBS Studio                                | ウィンドウキャプチャ（現状 obs-websocket 制御は未実装）         |

## stage-director（Python）

- サーバ: `uvicorn[standard]`, `fastapi`
- MCP: `mcp`（FastMCP, SSE）
- モデル: `pydantic`
- 補助: `python-dotenv`, `websockets`

## vtuber-behavior-engine（Python）

- エージェント: `google-adk`
- LLM クライアント: `google-genai`（Gemini）
- 音声認識: `google-cloud-speech`, `pyaudio`
- MCP Client: `mcp`
- メモリ/検索: `chromadb`

## vtube-stage（TypeScript）

- UI: `react`, `react-dom`
- 3D: `three`, `@react-three/fiber`, `@react-three/drei`, `@pixiv/three-vrm`
- Markdown: `react-markdown`, `remark-gfm`
- HTTP: `axios`
- 検証: `class-validator`, `class-transformer`, `reflect-metadata`
- 品質: `eslint`, `prettier`, `typescript-eslint`

## ビルド/実行ツール

- Python: `uv`（README で `uv sync`, `uv run` を使用）
- Node: `npm`（`npm install`, `npm run dev/build/lint/format`）

## テスト

- Python: `pytest`, `pytest-asyncio`, `pytest-cov`
- TypeScript:（現状テストフレームワークは依存に含まれていない。品質は eslint/prettier 中心）
