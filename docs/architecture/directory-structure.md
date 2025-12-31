<!-- This document is generated and updated by .github/prompts/doc-sync.prompt.md -->

# ディレクトリ構成

## ルート構成（概要）

このリポジトリはモノレポ構成で、主要パッケージは `packages/` 配下に配置されています。

```text
ai-tuber-system/
├── packages/
│   ├── stage-director/            # MCP Server + WebSocket Server（舞台監督）
│   │   ├── src/stage_director/    # FastAPI, MCP(FastMCP), コマンドキュー
│   │   └── tests/                 # pytest
│   ├── vtuber-behavior-engine/    # ADK ベースの AI コア（MCP Client）
│   │   ├── src/vtuber_behavior_engine/
│   │   └── tests/
│   └── vtube-stage/               # React + Three.js（VRM レンダラ）
│       ├── src/                   # hooks/components/services/types
│       └── public/                # VRM/VRMA/設定 JSON（例: avatars.json）
├── docs/                          # プロジェクトドキュメント
│   ├── architecture.md            # 既存: 全体アーキテクチャ説明
│   ├── mcp_adk_explanation.md     # 既存: MCP/ADK 解説
│   ├── architecture/              # 生成: アーキテクチャ分割ドキュメント
│   └── rules/                     # 生成: ルール/規約
├── knowledge/                     # ワークフロー/テンプレ/ガイドライン（横断知識）
└── .github/                       # Copilot/プロンプト/テンプレ
```

## 主要ディレクトリ

| ディレクトリ                      | 目的                                 | 代表ファイル                                                                         |
| --------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------ |
| `packages/stage-director`         | MCP ツール提供 + WebSocket 配信      | `src/stage_director/main.py`, `stage_director_mcp_server.py`, `websocket_handler.py` |
| `packages/vtuber-behavior-engine` | ADK エージェント実行、ツール呼び出し | `src/vtuber_behavior_engine/main.py`, `agent_runner.py`                              |
| `packages/vtube-stage`            | VRM 描画、コマンド受信、TTS          | `src/main.tsx`, `src/hooks/useWebSocket.ts`, `src/hooks/useStageCommandHandler.ts`   |
| `docs`                            | プロジェクト説明                     | `architecture.md`, `mcp_adk_explanation.md`                                          |
| `knowledge`                       | 標準ワークフロー/テンプレ            | `knowledge/workflows/workflow.md`                                                    |

## 依存関係の方向（高レベル）

- `vtuber-behavior-engine` →（MCP）→ `stage-director` →（WebSocket）→ `vtube-stage`
- `vtube-stage` →（HTTP）→ VoiceVox
- OBS は `vtube-stage` ウィンドウをキャプチャ（現状 obs-websocket 制御は未実装）
