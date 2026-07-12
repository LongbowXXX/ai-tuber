# AI V-Tuber System Constitution

本憲章は、AI V-Tuber System（`vtube-stage` + `vtuber-behavior-engine` モノレポ）における開発の基本原則を定める。
仕様・計画・実装のすべてのフェーズはこの憲章に適合しなければならない。

## Core Principles

### I. ツール境界（MCP Boundary）

AI（Behavior Engine）から表現層（VTube Stage）への制御は、必ず MCP ツール呼び出し
（`speak` / `trigger_animation` / `display_markdown_text` / `control_camera`）を経由する。
AI 側から表現層の内部実装（Electron IPC・renderer・VRM 制御）へ直接依存してはならない。
新しい舞台演出を追加する場合は、まず MCP ツールとしてインターフェースを定義する。

### II. コマンド契約の両側同期（Contract Integrity）

Stage コマンド契約（`command`/`payload` の形状）は、送信側と受信側を必ず同時に変更する。

- 送信側: `vtube-stage/electron/server/mcp-server.ts`（zod によるツール入力スキーマ）とコマンド生成
- 受信側: `vtube-stage/src/types/command.ts` + `src/utils/command_validator.ts`（class-validator）+ `src/hooks/useStageCommandHandler.ts`

受信した Stage コマンドは必ず `validateStageCommand` で検証し、未知のコマンド・不正な payload を
表示層のロジックに到達させない。`switch` 分岐には必ず default ケースで警告ログを出す。

### III. 発話の完了同期（Speak Synchronization）

`speak` は `speakId` を採番し、renderer からの `speakEnd` 通知（`command-queue.ts` の完了同期）を
待ってから次の発話へ進む。この順序保証・ペース制御を壊す変更をしてはならない。
`speakEnd` を送らないまま `speak` の同期を前提とした機能を実装してはならない。

### IV. 型・スキーマ中心の設計（Schema-First）

境界を越えるデータはすべてスキーマで定義・検証する。

- Python（vtuber-behavior-engine）: `pydantic` / ADK の `output_schema`
- MCP サーバー（vtube-stage/electron）: `zod`
- Renderer（vtube-stage/src）: `class-transformer` + `class-validator`

### V. 品質ゲート（Quality Gates, NON-NEGOTIABLE）

コード変更の完了時は、必ず Format / Lint / Test を実行し PASS を確認する。

- Python: `uv run pytest` / `uv run mypy .`（strict）/ `uv run flake8` / `black`（line-length 120）
- TypeScript: `npm run lint` / `npm run format:check` / `npm run build`（`tsc -b && vite build`）

既存テストが失敗した場合、テストコードを安易に修正せず、まず実装のバグを疑う。
テスト修正が「意図した仕様変更」である場合は、その旨を明示して合意を得る。

### VI. 仕様とドキュメントの同期（Spec-Driven）

機能仕様は Spec Kit（`specs/` + `.specify/`）で管理する。機能の追加・変更は
`/speckit-specify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement` のフローに従い、
仕様（`specs/NNN-<feature>/spec.md`）を起点とする。実装が仕様や既存ドキュメント
（README・AGENTS.md・`docs/`）と乖離する変更を行った場合は、同一の作業内で必ず同期させる。

## 追加制約（Technology & Security）

- 言語/ランタイム: Python >= 3.11（uv 管理）、TypeScript ~5.7（Node.js + Electron）
- ユーザー向け成果物（仕様書・計画・タスク・コミットメッセージ・コード内コメント）は日本語で記述する
- 機密情報（API キー・トークン等）をコード・ログ・ドキュメント・リポジトリに含めない。
  `.env` は必ず gitignore し、共有はサンプル（`.env_sample`）のみとする
- ローカル起動前提（VoiceVox・OBS は外部プロセス）。obs-websocket 制御は未実装

## 開発ワークフロー

- Story（親）- Task（子）の Issue 階層と PR 運用は `knowledge/` の標準ワークフローに従う
- レビュー観点・PR 作成規約・デバッグ手順は `knowledge/guidelines/` を参照する
- 機能仕様の成果物は Spec Kit の `specs/` 配下を正とする（旧 `docs/specs/` 形式は廃止）

## Governance

- 本憲章はその他のプラクティス文書（`docs/rules/`、`knowledge/`）に優先する
- 憲章の改定は、変更内容・理由を PR で明示し、バージョンを更新して行う
- すべての PR / レビューは本憲章への適合を確認する。原則からの逸脱には正当な理由の明記が必要

**Version**: 1.0.0 | **Ratified**: 2026-07-12 | **Last Amended**: 2026-07-12
