<!-- このドキュメントは .github/prompts/doc-sync.prompt.md によって生成および更新されています -->

# コーディング規約（Coding Conventions）

## 共通

- **境界を守る**: AI（Behavior Engine）から「表現系（Stage/Director）」へは MCP ツール/コマンド経由で制御し、直接依存を増やさない。
- **型/スキーマを中心に設計**: stage-director は `pydantic`、vtube-stage は `class-validator` を基準に、コマンドの契約を崩さない。

## Python（stage-director / vtuber-behavior-engine）

- 実行: `uv run python ...`
- フォーマット: `black`（`line-length = 120`）
- 静的解析: `mypy`（`strict = true` が基本）
- Lint: `flake8`
- テスト: `pytest`

推奨:

- 非同期処理は `asyncio` を基本とし、I/O 境界（WebSocket/MCP/HTTP）で `await` を徹底する
- 例外時はログに `exc_info=True` を付け、原因追跡可能にする（`stage_director_mcp_server.py` のパターンを踏襲）

## TypeScript（vtube-stage）

- ビルド: `tsc -b && vite build`
- Lint: `eslint .`
- フォーマット: `prettier --write ...`

推奨:

- WebSocket 受信データは必ず `validateStageCommand` を通し、未知のコマンドをそのまま処理しない
- `command` 値に応じた分岐（`switch`）は必ず default ケースで警告ログを出す

## コマンド契約（Director ↔ Stage）

- `stage-director` が送る JSON は `StageCommand`（pydantic Union）から生成されます。
- `vtube-stage` が受け取る `StageCommand` は `class-transformer`/`class-validator` で検証します。

新しいコマンドを追加する場合（最小要件）:

1. `stage-director`: `models.py` に pydantic コマンド/ペイロードを追加
2. `vtube-stage`: `types/command.ts` と `utils/command_validator.ts` に型と registry を追加
3. `vtube-stage`: `useStageCommandHandler.ts` に処理分岐を追加
