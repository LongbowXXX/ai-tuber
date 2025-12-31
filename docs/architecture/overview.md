<!-- This document is generated and updated by .github/prompts/doc-sync.prompt.md -->

# アーキテクチャ概要

## システム概要

このリポジトリは **AI（LLM）で制御される V-Tuber 配信システム**のモノレポです。
3 つの主要コンポーネントが協調して、LLM の出力（発話・演出）をリアルタイムに VRM キャラクターへ反映します。

- `vtuber-behavior-engine`（AI コア）: Google ADK（Agent Development Kit）上のマルチエージェントで会話・行動を生成し、MCP クライアントとして舞台制御ツールを呼び出します。
- `stage-director`（オーケストレーション）: MCP サーバーとして舞台制御ツール（`speak`/`trigger_animation`/`display_markdown_text`）を公開し、WebSocket でフロントへコマンド送信します。
- `vtube-stage`（フロント/レンダラ）: React + Three.js + `@pixiv/three-vrm` で VRM を描画し、WebSocket コマンドに従って表情/モーション/表示/TTS を実行します。

## メインコンポーネント

### vtuber-behavior-engine

- 実装: Python 3.11+
- 主な依存: `google-adk`, `google-genai`, `mcp`, `chromadb`
- 入口: `packages/vtuber-behavior-engine/src/vtuber_behavior_engine/main.py`
- 役割:
  - ADK の Runner でエージェントを実行（`vtuber_behavior_engine/agent_runner.py`）
  - MCP クライアント経由で `stage-director` ツールを呼び出し、舞台制御を行う

### stage-director

- 実装: Python 3.11+
- 主な依存: `fastapi`, `uvicorn`, `mcp`（FastMCP）, `pydantic`
- 入口: `packages/stage-director/src/stage_director/main.py`
- 役割:
  - WebSocket サーバー（`/ws`）で `vtube-stage` を接続受付
  - MCP SSE サーバーでツール提供（`stage_director_mcp_server.py`）
  - コマンドキュー（`command_queue.py`）で順序制御、`speakEnd` で完了同期

### vtube-stage

- 実装: TypeScript + React 19 + Vite 6
- 主な依存: `three` (0.175), `@pixiv/three-vrm` (3.4), `react-markdown`, `class-validator`
- 入口: `packages/vtube-stage/src/main.tsx`
- 役割:
  - `VITE_STAGE_DIRECTER_ENDPOINT` の WebSocket に接続（`useWebSocket.ts`）
  - 受信コマンドを `class-validator` で検証し、状態を更新（`useStageCommandHandler.ts`）
  - VoiceVox へ HTTP リクエストして音声合成し、完了後 `speakEnd` を送信

## アーキテクチャ図

```mermaid
graph LR
  subgraph AI_Backend[AI Backend]
    VBE[vtuber-behavior-engine\n(ADK Agents)]
    SD[stage-director\n(MCP Server + WebSocket)]
  end

  subgraph Frontend[Frontend & Services]
    VS[vtube-stage\n(React + Three.js)]
    VV[VoiceVox\n(TTS Service)]
    OBS[OBS Studio\n(Capture)]
  end

  VBE -- MCP (SSE) --> SD
  SD -- WebSocket --> VS
  VS -- HTTP --> VV
  VS -- Window Capture --> OBS
```

## 設計の狙い（Design Rationale）

- **関心の分離**: 「思考（AI/会話生成）」と「表現（描画/TTS/演出）」を分離し、境界をツール呼び出し（MCP）とコマンド（WebSocket）で統一します。
- **同期制御**: `speak` は `speakEnd` を受けるまで待機し、発話の順序とペースを維持します。
- **拡張性**: `stage-director` のツールを追加することで、AI 側は同じインターフェースで新しい舞台機能を利用できます。
