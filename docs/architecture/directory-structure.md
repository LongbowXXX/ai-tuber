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
│   └── vtube-stage/               # Electron App（MCP Server + React + Three.js）
│       ├── src/
│       │   ├── electron/          # Electron メインプロセス
│       │   ├── mcp/               # MCP サーバー実装
│       │   ├── hooks/             # React カスタムフック
│       │   ├── components/        # React コンポーネント
│       │   ├── services/          # TTS サービス等
│       │   └── types/             # TypeScript 型定義
│       └── public/                # VRM/VRMA/設定 JSON（例: avatars.json）
├── docs/                          # プロジェクトドキュメント
│   ├── mcp_adk_explanation.md     # 既存: MCP/ADK 解説
│   ├── architecture/              # 生成: アーキテクチャ分割ドキュメント
│   └── rules/                     # 生成: ルール/規約
├── knowledge/                     # ワークフロー/テンプレ/ガイドライン（横断知識）
└── .github/                       # Copilot/プロンプト/テンプレ
```

## 主要ディレクトリ

| ディレクトリ                      | 目的                                       | 代表ファイル                                                   |
| --------------------------------- | ------------------------------------------ | -------------------------------------------------------------- |
| `packages/vtuber-behavior-engine` | ADK エージェント実行、ツール呼び出し       | `src/vtuber_behavior_engine/main.py`, `agent_runner.py`       |
| `packages/vtube-stage`            | Electron App、MCP サーバー、VRM 描画、TTS  | `src/electron/main.ts`, `src/mcp/server.ts`, `src/main.tsx`   |
| `docs`                            | プロジェクト説明                           | `architecture/overview.md`, `mcp_adk_explanation.md`           |
| `knowledge`                       | 標準ワークフロー/テンプレ                  | `knowledge/workflows/workflow.md`                              |

## 依存関係の方向（高レベル）

- `vtuber-behavior-engine` →（MCP: HTTP/SSE）→ `vtube-stage`
- `vtube-stage` →（HTTP）→ VoiceVox
- OBS は `vtube-stage` の Electron ウィンドウをキャプチャ（現状 obs-websocket 制御は未実装）
