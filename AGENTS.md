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
| Language  | Python                      | >= 3.11       | vtuber-behavior-engine                       |
| Language  | TypeScript                  | ~5.7          | vtube-stage (Electron + Renderer)            |
| Framework | Electron                    | Latest        | vtube-stage desktop application              |
| Protocol  | MCP (@modelcontextprotocol) | >= 1.0.0      | AI→vtube-stage ツール呼び出し（stdio）       |
| Protocol  | Electron IPC                | -             | Main↔Renderer プロセス間通信                 |
| Agent FW  | Google ADK                  | >= 1.17.0     | vtuber-behavior-engine（マルチエージェント） |
| Frontend  | React                       | 19.x          | vtube-stage renderer UI                      |
| Build     | Vite                        | 6.x           | vtube-stage dev/build                        |
| 3D        | Three.js / @pixiv/three-vrm | ^0.175 / ^3.4 | VRM 描画/制御                                |
| TTS       | VoiceVox                    | -             | 音声合成（HTTP API）                         |

### アーキテクチャパターン

- **モジュラーモノレポ**: 2 パッケージ（AI/Stage）を `packages/` で分離。
- **ツール境界（MCP）**: AI の「意図」をツール呼び出しに正規化し、表現層へ安全に渡す。
- **Electron アーキテクチャ**: vtube-stage は Electron デスクトップアプリケーション（Main + Renderer プロセス）。
- **プロセス間通信（IPC）**: Main プロセスと Renderer プロセス間で Electron IPC を使用。
- **キュー + 完了同期**: `speak` は `speakEnd` を待って順序とペースを保証。

## 3. ディレクトリ構成

```
ai-tuber-system/
├── packages/
│   ├── vtuber-behavior-engine/ # ADK Agents + MCP Client
│   └── vtube-stage/            # Electron App (MCP Server + React Renderer)
├── docs/                       # プロジェクトドキュメント
├── knowledge/                  # ワークフロー/テンプレ/ガイドライン
└── .github/                    # Copilot/プロンプト/テンプレ
```

### 主要ディレクトリ

| Directory                         | Purpose                   | Key Files                                                                                   |
| --------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------- |
| `packages/vtuber-behavior-engine` | AI コア（ADK）            | `src/vtuber_behavior_engine/main.py`, `agent_runner.py`                                     |
| `packages/vtube-stage`            | Electron App + 描画・TTS  | `electron/main.ts`, `electron/mcp-server.ts`, `src/main.tsx`, `src/hooks/useStageCommandHandler.ts` |
| `docs`                            | 設計/運用ドキュメント     | `mcp_adk_explanation.md`, `architecture/*`, `rules/*`                                       |
| `knowledge`                       | 開発プロセスの標準        | `workflows/workflow.md`, `templates/*`, `guidelines/*`                                      |

## 4. 主要概念（ユビキタス言語）

| Term                   | Definition                                        | Example                                               |
| ---------------------- | ------------------------------------------------- | ----------------------------------------------------- |
| **Behavior Engine**    | ADK 上のエージェントが対話/行動を生成する AI コア | `packages/vtuber-behavior-engine`                     |
| **VTube Stage**        | Electron デスクトップアプリ（MCP Server + Renderer） | `packages/vtube-stage`                                |
| **MCP Tool**           | AI から舞台を操作する関数インターフェース         | `speak`, `trigger_animation`, `display_markdown_text` |
| **StageCommand**       | Main→Renderer の IPC メッセージ                  | `speak`, `triggerAnimation`, `displayMarkdown`        |
| **speakId / speakEnd** | 発話の完了同期に使う識別子とイベント              | `speakId` をキーに待機/通知                           |

## 5. エントリポイント

| Entry Point          | Location                                                             | Purpose                                      |
| -------------------- | -------------------------------------------------------------------- | -------------------------------------------- |
| VTube Stage Main     | `packages/vtube-stage/electron/main.ts`                              | Electron メインプロセス + MCP Server 起動    |
| MCP Server           | `packages/vtube-stage/electron/mcp-server.ts`                        | stdio MCP Server（@modelcontextprotocol/sdk） |
| Renderer Main        | `packages/vtube-stage/src/main.tsx`                                  | React のルートをマウント                     |
| Behavior Engine Main | `packages/vtuber-behavior-engine/src/vtuber_behavior_engine/main.py` | 既定で News Agent を起動、stdio で MCP 接続  |

## 6. 開発ルール（憲章サマリー）

### 🔍 Dynamic Context Protocol（調査フェーズ）

**全エージェントへの CRITICAL INSTRUCTION:**
このファイル（`AGENTS.md`）で提供されるコンテキストは **要約インデックス** です。タスクに必要な詳細のすべてを含みません。
**いかなるタスクを開始する前にも、あなたは MUST:**

1.  **Search**: 利用可能なツールを使って **キーワード/正規表現検索** または **セマンティック検索** を実行し、ユーザー要求に関連する `docs/` または `knowledge/` 内の特定ドキュメントを見つける。
    - _Example_: ユーザーが「Testing」について尋ねた場合、テスト手順に関連するドキュメントを検索して読む。
    - _Example_: ユーザーが「Review」を求めた場合、レビューガイドラインを検索して読む。
2.  **Follow Links**: `AGENTS.md` は要約インデックスであり重要ファイル/フォルダへのリンクを提供するため、あなたは詳細情報を得るためにこれらのリンクを MUST 追跡する。
3.  **Read**: これらの詳細ドキュメントの内容をコンテキストにロードする。
4.  **Cross-Reference**: 仮定に頼ってはならない。必ず見つけた公式ドキュメントに照らして検証する。

### Must Follow

- 全エージェントは情報収集時に [Sequential Inquiry](./knowledge/guidelines/prompting/sequential-inquiry.md) プロトコルに従うこと：質問はまとめてではなく、1 つずつ行う。
- 受信した Stage コマンドは必ず検証すること（Stage: `class-validator`、Director: `pydantic`）。

### Must Avoid

- IPC メッセージ契約（`command`/`payload` 形状）を片側だけ変更すること。
- `speakEnd` を送らないまま `speak` 同期を前提とした機能を実装すること。

### Patterns to Use

- `vtube-stage` の MCP ツール追加は「MCP ツール定義 → Main プロセスハンドラ → IPC 送信」という既存パターンに合わせる。
- Renderer のコマンド追加は「型定義 → IPC ハンドラ → 実行処理」という既存パターンに合わせる。

## 7. クイックリファレンス

### よく使うコマンド

```bash
# Root（概要）
# VoiceVox を起動（別途）

# vtube-stage (Electron app)
npm install
npm run dev

# vtuber-behavior-engine (stdio MCP で vtube-stage に接続)
uv sync --extra dev
uv run python src/vtuber_behavior_engine/main.py
```

### AI エージェント向け重要ファイル

| Purpose                 | File                              |
| ----------------------- | --------------------------------- |
| Project Rules           | `.github/copilot-instructions.md` |
| High-level Architecture | `docs/architecture/overview.md`   |
| MCP/ADK Explanation     | `docs/mcp_adk_explanation.md`     |
| Generated Docs Index    | `docs/architecture/overview.md`   |

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

→ **Details**: [knowledge/](./knowledge/)

`knowledge/` 配下のファイル一覧:

| Topic                                  | Link                                                         |
| -------------------------------------- | ------------------------------------------------------------ |
| Knowledge Index                        | `knowledge/README.md`                                        |
| Workflow                               | `knowledge/workflows/workflow.md`                            |
| Workflow: Deliverables                 | `knowledge/workflows/deliverables.md`                        |
| Workflow: Bug Fix                      | `knowledge/workflows/bug_fix_task_details.md`                |
| Workflow: Feature                      | `knowledge/workflows/feature_task_details.md`                |
| Workflow: Release                      | `knowledge/workflows/release_task_details.md`                |
| Guideline: Adoption                    | `knowledge/guidelines/adoption-guide.md`                     |
| Guideline: Debugging                   | `knowledge/guidelines/debugging.md`                          |
| Guideline: PR Creation                 | `knowledge/guidelines/pr-creation-guidelines.md`             |
| Guideline: Software Review             | `knowledge/guidelines/software-review.md`                    |
| Guideline: Specification               | `knowledge/guidelines/specification-guidelines.md`           |
| Guideline: AI Literacy                 | `knowledge/guidelines/ai-literacy/README.md`                 |
| Guideline: AI Literacy - Context       | `knowledge/guidelines/ai-literacy/context-management.md`     |
| Guideline: AI Literacy - Advanced      | `knowledge/guidelines/ai-literacy/advanced-strategies.md`    |
| Guideline: AI Literacy - Self Study    | `knowledge/guidelines/ai-literacy/self-study.md`             |
| Guideline: Prompting                   | `knowledge/guidelines/prompting/README.md`                   |
| Prompting: Circuit Breaker             | `knowledge/guidelines/prompting/circuit-breaker.md`          |
| Prompting: Dynamic Context             | `knowledge/guidelines/prompting/dynamic-context.md`          |
| Prompting: Environment Agnostic        | `knowledge/guidelines/prompting/environment-agnostic.md`     |
| Prompting: Explicit Parallelism        | `knowledge/guidelines/prompting/explicit-parallelism.md`     |
| Prompting: Few-shot CoT                | `knowledge/guidelines/prompting/few-shot-cot.md`             |
| Prompting: Iterative Changes           | `knowledge/guidelines/prompting/iterative-changes.md`        |
| Prompting: Knowledge Retrieval         | `knowledge/guidelines/prompting/knowledge-retrieval.md`      |
| Prompting: Multilingual Guardrails     | `knowledge/guidelines/prompting/multilingual-guardrails.md`  |
| Prompting: Sequential Inquiry          | `knowledge/guidelines/prompting/sequential-inquiry.md`       |
| Prompting: Simulation Verification     | `knowledge/guidelines/prompting/simulation-verification.md`  |
| Prompting: Task Management             | `knowledge/guidelines/prompting/task-management.md`          |
| Prompting: Transparency                | `knowledge/guidelines/prompting/transparency.md`             |
| Prompting: XML Structured Prompting    | `knowledge/guidelines/prompting/xml-structured-prompting.md` |
| Template: Pull Request                 | `knowledge/templates/issues/pull_request.md`                 |
| Template: Report Bug                   | `knowledge/templates/issues/report_bug.md`                   |
| Template: Report Feature               | `knowledge/templates/issues/report_feature.md`               |
| Template: Report Question              | `knowledge/templates/issues/report_question.md`              |
| Template: Story Bug Fix                | `knowledge/templates/issues/story_bug_fix.md`                |
| Template: Story Feature                | `knowledge/templates/issues/story_feature.md`                |
| Template: Story Release                | `knowledge/templates/issues/story_release.md`                |
| Template: Task Requirement             | `knowledge/templates/issues/task_requirement.md`             |
| Template: Task Design                  | `knowledge/templates/issues/task_design.md`                  |
| Template: Task Implementation          | `knowledge/templates/issues/task_implementation.md`          |
| Template: Task Docs Update             | `knowledge/templates/issues/task_docs_update.md`             |
| Template: Task Create Test Spec        | `knowledge/templates/issues/task_create_test_spec.md`        |
| Template: Task Define Exit Criteria    | `knowledge/templates/issues/task_define_exit_criteria.md`    |
| Template: Task Static Analysis         | `knowledge/templates/issues/task_static_analysis.md`         |
| Template: Task Test Functional         | `knowledge/templates/issues/task_test_functional.md`         |
| Template: Task Test Sanity             | `knowledge/templates/issues/task_test_sanity.md`             |
| Template: Task Update Sanity Checklist | `knowledge/templates/issues/task_update_sanity_checklist.md` |
| Template: Task Verify Exit Criteria    | `knowledge/templates/issues/task_verify_exit_criteria.md`    |
| Template: Task Verify Related Fixes    | `knowledge/templates/issues/task_verify_related_fixes.md`    |
| Template: Task Vulnerability Check     | `knowledge/templates/issues/task_vulnerability_check.md`     |
| Template: Task Version Agreement       | `knowledge/templates/issues/task_version_agreement.md`       |
| Template: Task Release Checklist       | `knowledge/templates/issues/task_release_checklist.md`       |
| Template: Task Release Execution       | `knowledge/templates/issues/task_release_execution.md`       |
| Template: Task License Check           | `knowledge/templates/issues/task_license_check.md`           |
| Template: Agent Bug Fix Plan           | `knowledge/templates/agents/bug_fix_plan.template.md`        |
| Template: Agent Review Report          | `knowledge/templates/agents/review_report.template.md`       |
| Artifact Template: Requirements        | `knowledge/templates/artifacts/requirements.template.md`     |
| Artifact Template: Specification       | `knowledge/templates/artifacts/specification.template.md`    |
| Artifact Template: Design              | `knowledge/templates/artifacts/design.template.md`           |
| Artifact Template: Test Spec           | `knowledge/templates/artifacts/test_spec.template.md`        |
| Artifact Template: Sanity Checklist    | `knowledge/templates/artifacts/sanity_checklist.template.md` |
