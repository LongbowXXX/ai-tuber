# AGENTS.md - AI V-Tuber System

> Google ADK（マルチエージェント）と MCP（ツール統合）で、発話・演出をリアルタイムに VRM キャラクターへ反映する V-Tuber 配信システム。

このファイルは、このプロジェクトで作業する AI コーディングエージェント向けのコンテキストと指示を提供します。

## 1. エグゼクティブサマリー

**目的**: LLM による対話/行動生成を、舞台制御（発話・表情・アニメーション・Markdown 表示）へ変換し、配信可能な V-Tuber 表現として実行する。
**種別**: モノレポ（Python バックエンド + TypeScript フロントエンド）
**状態**: 開発中（ローカル起動前提、obs-websocket 制御は未実装）

## 2. アーキテクチャ & 技術スタック

### Core Technologies

| Category  | Technology                  | Version/Range | Purpose                                      |
| --------- | --------------------------- | ------------- | -------------------------------------------- |
| Language  | Python                      | >= 3.11       | stage-director / vtuber-behavior-engine      |
| Language  | TypeScript                  | ~5.7          | vtube-stage                                  |
| Framework | FastAPI                     | 0.120.0       | stage-director WebSocket/HTTP                |
| Protocol  | MCP (mcp / FastMCP)         | >= 1.19.0     | AI→Director のツール呼び出し（SSE）          |
| Protocol  | WebSocket                   | -             | Director↔Stage のリアルタイムコマンド        |
| Agent FW  | Google ADK                  | >= 1.17.0     | vtuber-behavior-engine（マルチエージェント） |
| Frontend  | React                       | 19.x          | vtube-stage UI                               |
| Build     | Vite                        | 6.x           | vtube-stage dev/build                        |
| 3D        | Three.js / @pixiv/three-vrm | ^0.175 / ^3.4 | VRM 描画/制御                                |
| TTS       | VoiceVox                    | -             | 音声合成（HTTP API）                         |

### アーキテクチャパターン

- **モジュラーモノレポ**: 3 パッケージ（AI/Director/Stage）を `packages/` で分離。
- **ツール境界（MCP）**: AI の「意図」をツール呼び出しに正規化し、表現層へ安全に渡す。
- **コマンドバス（WebSocket）**: Director から Stage へ JSON コマンドを送る。
- **キュー + 完了同期**: `speak` は `speakEnd` を待って順序とペースを保証（`command_queue.py` + `command_events`）。

## 3. ディレクトリ構成

```
ai-tuber-system/
├── packages/
│   ├── stage-director/         # MCP Server + WebSocket Server
│   ├── vtuber-behavior-engine/ # ADK Agents + MCP Client
│   └── vtube-stage/            # React + Three.js + VRM Renderer
├── docs/                       # プロジェクトドキュメント
├── knowledge/                  # ワークフロー/テンプレ/ガイドライン
└── .github/                    # Copilot 指示 / CI ワークフロー
```

### 主要ディレクトリ

| Directory                         | Purpose               | Key Files                                                                            |
| --------------------------------- | --------------------- | ------------------------------------------------------------------------------------ |
| `packages/stage-director`         | 舞台監督（MCP/WS）    | `src/stage_director/main.py`, `stage_director_mcp_server.py`, `websocket_handler.py` |
| `packages/vtuber-behavior-engine` | AI コア（ADK）        | `src/vtuber_behavior_engine/main.py`, `agent_runner.py`                              |
| `packages/vtube-stage`            | 描画・TTS・表示       | `src/main.tsx`, `src/hooks/useWebSocket.ts`, `src/hooks/useStageCommandHandler.ts`   |
| `docs`                            | 設計/運用ドキュメント | `mcp_adk_explanation.md`, `architecture/*`, `rules/*`                                |
| `knowledge`                       | 開発プロセスの標準    | `workflows/workflow.md`, `templates/*`, `guidelines/*`                               |

## 4. 主要概念（ユビキタス言語）

| Term                   | Definition                                        | Example                                               |
| ---------------------- | ------------------------------------------------- | ----------------------------------------------------- |
| **Behavior Engine**    | ADK 上のエージェントが対話/行動を生成する AI コア | `packages/vtuber-behavior-engine`                     |
| **Stage Director**     | MCP ツールを公開し、WS コマンドへ変換するハブ     | `packages/stage-director`                             |
| **VTube Stage**        | WS コマンドに従い VRM/TTS/表示を実行するフロント  | `packages/vtube-stage`                                |
| **MCP Tool**           | AI から舞台を操作する関数インターフェース         | `speak`, `trigger_animation`, `display_markdown_text` |
| **StageCommand**       | Director→Stage の JSON コマンド契約               | `speak`, `triggerAnimation`, `displayMarkdown`        |
| **speakId / speakEnd** | 発話の完了同期に使う識別子とイベント              | `speakId` をキーに待機/通知                           |

## 5. エントリポイント

| Entry Point          | Location                                                                  | Purpose                                |
| -------------------- | ------------------------------------------------------------------------- | -------------------------------------- |
| Stage Director Main  | `packages/stage-director/src/stage_director/main.py`                      | WebSocket サーバと MCP(SSE) を同時起動 |
| Stage WebSocket      | `packages/stage-director/src/stage_director/stage_director_server.py`     | `/ws` を提供（FastAPI）                |
| MCP Server           | `packages/stage-director/src/stage_director/stage_director_mcp_server.py` | `FastMCP.run_sse_async()`              |
| Behavior Engine Main | `packages/vtuber-behavior-engine/src/vtuber_behavior_engine/main.py`      | 既定で News Agent を起動               |
| Frontend Main        | `packages/vtube-stage/src/main.tsx`                                       | React のルートをマウント               |

## 6. 開発ルール（憲章サマリー）

### Must Follow

- 受信した Stage コマンドは必ず検証すること（Stage: `class-validator`、Director: `pydantic`）。

### Must Avoid

- コマンド契約（`command`/`payload` 形状）を片側だけ変更すること。
- `speakEnd` を送らないまま `speak` 同期を前提とした機能を実装すること。

### Patterns to Use

- `stage-director` のツール追加は「MCP ツール → キュー投入 → WS 送信」という既存パターンに合わせる。
- `vtube-stage` のコマンド追加は「型定義 → validator registry → handler switch」という既存パターンに合わせる。

## 7. クイックリファレンス

### よく使うコマンド

```bash
# Root（概要）
# VoiceVox を起動（別途）

# stage-director
uv sync --extra dev
uv run python src/stage_director/main.py

# vtube-stage
npm install
npm run dev

# vtuber-behavior-engine
uv sync --extra dev
uv run python src/vtuber_behavior_engine/main.py
```

### AI エージェント向け重要ファイル

| Purpose                 | File                              |
| ----------------------- | --------------------------------- |
| Project Rules           | `.github/copilot-instructions.md` |
| High-level Architecture | `docs/architecture/overview.md`   |
| MCP/ADK Explanation     | `docs/mcp_adk_explanation.md`     |

## 8. ドキュメントインデックス

詳細は以下を参照してください。

- `docs/mcp_adk_explanation.md`
- `docs/architecture/overview.md`
- `docs/architecture/directory-structure.md`
- `docs/architecture/key-flows.md`
- `docs/architecture/tech-stack.md`
- `docs/architecture/constraints.md`
- `docs/rules/coding-conventions.md`
- `docs/rules/testing.md`
- `docs/glossary.md`

補足（パッケージ内ドキュメント）:

- `packages/vtuber-behavior-engine/docs/speech_recognition_tool.md`

## 9. ナレッジベース

開発プロセスの標準（ワークフロー・ガイドライン・テンプレート）は [knowledge/](./knowledge/) を参照。索引は `knowledge/README.md`。

- `knowledge/workflows/` — Story/Task の開発プロセス定義と成果物マトリクス
- `knowledge/guidelines/` — デバッグ・PR 作成・ソフトウェアレビューの規約
- `knowledge/templates/` — Issue/PR・成果物のテンプレート
