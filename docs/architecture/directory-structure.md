<!-- このドキュメントは .github/prompts/doc-sync.prompt.md によって生成および更新されています -->

# ディレクトリ構成

## ルート構成（概要）

このリポジトリはモノレポ構成で、主要パッケージは `packages/` 配下に配置されています。

```text
ai-tuber-system/
├── packages/
│   ├── vtuber-behavior-engine/    # ADK ベースの AI コア（MCP Client）
│   │   ├── src/vtuber_behavior_engine/
│   │   └── tests/
│   └── vtube-stage/               # Electron デスクトップアプリ
│       ├── electron/              # Main プロセス + MCP Server
│       │   ├── main.ts            # Electron メインプロセスエントリポイント
│       │   └── mcp-server.ts      # MCP Server (stdio) 実装
│       ├── src/                   # Renderer プロセス（React + Three.js）
│       │   ├── hooks/             # React hooks（IPC 通信、コマンドハンドラ等）
│       │   ├── components/        # React コンポーネント
│       │   ├── services/          # TTS、VRM 制御等のサービス
│       │   └── types/             # TypeScript 型定義
│       └── public/                # VRM/VRMA/設定 JSON（例: avatars.json）
├── docs/                          # プロジェクトドキュメント
│   ├── mcp_adk_explanation.md     # MCP/ADK 解説
│   ├── architecture/              # アーキテクチャドキュメント
│   └── rules/                     # ルール/規約
├── knowledge/                     # ワークフロー/テンプレ/ガイドライン（横断知識）
└── .github/                       # Copilot/プロンプト/テンプレ
```

## 主要ディレクトリ

| ディレクトリ                      | 目的                                 | 代表ファイル                                                                                 |
| --------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------- |
| `packages/vtuber-behavior-engine` | ADK エージェント実行、ツール呼び出し | `src/vtuber_behavior_engine/main.py`, `agent_runner.py`                                      |
| `packages/vtube-stage/electron`   | MCP Server + Electron Main           | `electron/main.ts`, `electron/mcp-server.ts`                                                 |
| `packages/vtube-stage/src`        | Renderer (VRM 描画、TTS、UI)         | `src/main.tsx`, `src/hooks/useStageCommandHandler.ts`                                        |
| `docs`                            | プロジェクト説明                     | `architecture/overview.md`, `mcp_adk_explanation.md`                                         |
| `knowledge`                       | 標準ワークフロー/テンプレ            | `knowledge/workflows/workflow.md`                                                            |

## 依存関係の方向（高レベル）

- `vtuber-behavior-engine` →（MCP stdio）→ `vtube-stage` (Main Process) →（Electron IPC）→ `vtube-stage` (Renderer)
- `vtube-stage` (Renderer) →（HTTP）→ VoiceVox
- OBS は `vtube-stage` ウィンドウをキャプチャ（現状 obs-websocket 制御は未実装）
