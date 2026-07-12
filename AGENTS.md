# AGENTS.md - AI V-Tuber System

> Google ADK（マルチエージェント）と MCP（ツール統合）で、発話・演出をリアルタイムに VRM キャラクターへ反映する V-Tuber 配信システム。

このファイルは、このプロジェクトで作業する AI コーディングエージェント向けのコンテキストと指示を提供します。

## 1. エグゼクティブサマリー

**目的**: LLM による対話/行動生成を、舞台制御（発話・表情・アニメーション・Markdown 表示・カメラ）へ変換し、配信可能な V-Tuber 表現として実行する。
**種別**: モノレポ（Python バックエンド + TypeScript/Electron フロントエンド）
**状態**: 開発中（ローカル起動前提、obs-websocket 制御は未実装）

## 2. アーキテクチャ & 技術スタック

### Core Technologies

| Category  | Technology                  | Version/Range | Purpose                                          |
| --------- | --------------------------- | ------------- | ------------------------------------------------ |
| Language  | Python                      | >= 3.11       | vtuber-behavior-engine                           |
| Language  | TypeScript                  | ~5.7          | vtube-stage                                      |
| Runtime   | Electron                    | -             | vtube-stage（main プロセスに MCP サーバー内蔵）  |
| Protocol  | MCP (@modelcontextprotocol/sdk) + Express | -   | AI→Stage のツール呼び出し（SSE 既定 / stdio 可） |
| Agent FW  | Google ADK                  | >= 1.17.0     | vtuber-behavior-engine（マルチエージェント）     |
| Frontend  | React                       | 19.x          | vtube-stage UI                                   |
| Build     | Vite                        | 6.x           | vtube-stage dev/build                            |
| 3D        | Three.js / @pixiv/three-vrm | ^0.175 / ^3.4 | VRM 描画/制御                                    |
| TTS       | VoiceVox                    | -             | 音声合成（HTTP API）                             |

### アーキテクチャパターン

- **モジュラーモノレポ**: 2 パッケージ（AI/Stage）を `packages/` で分離。
- **ツール境界（MCP）**: AI の「意図」をツール呼び出しに正規化し、表現層へ安全に渡す。vtube-stage の Electron main プロセスが MCP サーバーを内蔵する。
- **IPC ブリッジ**: Electron main から renderer へ StageCommand を IPC で送る（preload が `window.electron.socket` を公開、受信フックは `src/hooks/useStageConnection.ts`）。
- **キュー + 完了同期**: `speak` は `speakEnd` を待って順序とペースを保証（`electron/server/command-queue.ts`、30 秒タイムアウト）。

## 3. ディレクトリ構成

```
ai-tuber-system/
├── packages/
│   ├── vtuber-behavior-engine/ # ADK Agents + MCP Client
│   └── vtube-stage/            # Electron + 内蔵 MCP Server + React/Three.js VRM Renderer
├── specs/                      # Spec Kit の機能仕様（feature spec）
├── .specify/                   # Spec Kit 設定・プロジェクト憲章
├── docs/                       # プロジェクトドキュメント
├── knowledge/                  # ワークフロー/テンプレ/ガイドライン
└── .github/                    # Copilot 指示 / CI ワークフロー
```

### 主要ディレクトリ

| Directory                         | Purpose               | Key Files                                                                          |
| --------------------------------- | --------------------- | ---------------------------------------------------------------------------------- |
| `packages/vtuber-behavior-engine` | AI コア（ADK）        | `src/vtuber_behavior_engine/main.py`, `services/stage_director_mcp_client.py`      |
| `packages/vtube-stage`            | 描画・TTS・MCP        | `electron/main.ts`, `electron/server/mcp-server.ts`, `electron/server/command-queue.ts`, `src/hooks/useStageCommandHandler.ts` |
| `specs`                           | 機能仕様（Spec Kit）  | `001-ai-vtuber-system/spec.md`（ベースライン仕様）                                  |
| `.specify`                        | Spec Kit 基盤         | `memory/constitution.md`（プロジェクト憲章）                                        |
| `docs`                            | 設計/運用ドキュメント | `mcp_adk_explanation.md`, `architecture/*`, `rules/*`                              |
| `knowledge`                       | 開発プロセスの標準    | `workflows/workflow.md`, `templates/*`, `guidelines/*`                             |

## 4. 主要概念（ユビキタス言語）

| Term                   | Definition                                                                       | Example                                                                  |
| ---------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **Behavior Engine**    | ADK 上のエージェントが対話/行動を生成する AI コア                                | `packages/vtuber-behavior-engine`                                        |
| **VTube Stage**        | 内蔵 MCP サーバーで受けたコマンドに従い VRM/TTS/表示を実行する Electron アプリ   | `packages/vtube-stage`                                                   |
| **Stage Director**     | vtube-stage 内蔵 MCP サーバーの歴史的名称（コード識別子に残る）                  | サーバー名 `stage-director`、環境変数 `STAGE_DIRECTOR_MCP_*`             |
| **MCP Tool**           | AI から舞台を操作する関数インターフェース（4 種）                                | `speak`, `trigger_animation`, `display_markdown_text`, `control_camera`  |
| **StageCommand**       | Electron main → renderer の JSON コマンド契約                                    | `speak`, `triggerAnimation`, `controlCamera`, `displayMarkdown`          |
| **speakId / speakEnd** | 発話の完了同期に使う識別子とイベント                                             | `speakId` をキーに待機/通知                                              |

## 5. エントリポイント

| Entry Point          | Location                                                             | Purpose                                        |
| -------------------- | -------------------------------------------------------------------- | ---------------------------------------------- |
| Electron Main        | `packages/vtube-stage/electron/main.ts`                              | ウィンドウ生成と MCP サーバー起動              |
| MCP Server           | `packages/vtube-stage/electron/server/mcp-server.ts`                 | SSE 既定（`GET /sse` + `POST /messages`、既定 127.0.0.1:8080）。`--transport=stdio` で stdio も可 |
| Behavior Engine Main | `packages/vtuber-behavior-engine/src/vtuber_behavior_engine/main.py` | 既定で News Agent を起動                       |
| Frontend Main        | `packages/vtube-stage/src/main.tsx`                                  | React のルートをマウント                       |

## 6. 開発ルール（憲章サマリー）

開発ルールの正（Single Source of Truth）は **プロジェクト憲章 [`.specify/memory/constitution.md`](./.specify/memory/constitution.md)** です。変更時は必ず憲章を参照してください。以下は要点の抜粋です。

### Must Follow

- 受信した Stage コマンドは必ず検証すること（renderer: `class-validator`、MCP サーバー: `zod`）。

### Must Avoid

- コマンド契約（`command`/`payload` 形状）を片側だけ変更すること。
- `speakEnd` を送らないまま `speak` 同期を前提とした機能を実装すること。

### Patterns to Use

- MCP ツール追加は「`mcp-server.ts` の zod スキーマ定義 → キュー投入 → IPC 送信」という既存パターンに合わせる。
- `vtube-stage` renderer のコマンド追加は「型定義 → validator registry → handler switch」という既存パターンに合わせる。

## 7. クイックリファレンス

### よく使うコマンド

```bash
# Root（概要）
# VoiceVox を起動（別途）

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
| Project Constitution    | `.specify/memory/constitution.md` |
| Baseline Spec           | `specs/001-ai-vtuber-system/spec.md` |
| Project Rules           | `.github/copilot-instructions.md` |
| High-level Architecture | `docs/architecture/overview.md`   |
| MCP/ADK Explanation     | `docs/mcp_adk_explanation.md`     |

## 8. ドキュメントインデックス

仕様管理は Spec Kit（GitHub spec-kit）を採用しています。

- [`.specify/memory/constitution.md`](./.specify/memory/constitution.md) — プロジェクト憲章（開発ルールの正）
- [`specs/001-ai-vtuber-system/spec.md`](./specs/001-ai-vtuber-system/spec.md) — ベースライン仕様
- 新機能の仕様は `/speckit-specify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement` のフローで `specs/` 配下に feature spec（`specs/NNN-feature/spec.md`, `plan.md`, `tasks.md`）として作成する。

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
