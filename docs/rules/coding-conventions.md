# コーディング規約（Coding Conventions）

## 共通

- **境界を守る**: AI（Behavior Engine）から表現系（VTube Stage）へは MCP ツール/コマンド経由で制御し、直接依存を増やさない。
- **型/スキーマを中心に設計**: MCP サーバー（Electron main）は `zod`、renderer は `class-validator` を基準に、コマンドの契約を崩さない。

## Python（vtuber-behavior-engine）

- 実行: `uv run python ...`
- フォーマット: `black`（`line-length = 120`）
- 静的解析: `mypy`（`strict = true` が基本）
- Lint: `flake8`
- テスト: `pytest`

推奨:

- 非同期処理は `asyncio` を基本とし、I/O 境界（MCP/HTTP）で `await` を徹底する
- 例外時はログに `exc_info=True` を付け、原因追跡可能にする

## TypeScript（vtube-stage）

- ビルド: `tsc -b && vite build`
- Lint: `eslint .`
- フォーマット: `prettier --write ...`

推奨:

- IPC で受信した StageCommand は必ず `validateStageCommand` を通し、未知のコマンドをそのまま処理しない
- `command` 値に応じた分岐（`switch`）は必ず default ケースで警告ログを出す

## コマンド契約（Electron main ↔ renderer）

- MCP サーバー（`electron/server/mcp-server.ts`）はツール入力を `zod` スキーマで検証し、`StageCommand`（JSON）を生成して IPC で renderer に送ります。
- renderer が受け取る `StageCommand` は `class-transformer`/`class-validator` で検証します。

新しいコマンドを追加する場合（最小要件）:

1. `electron/server/mcp-server.ts`: zod スキーマ（ツール入力）とコマンド生成を追加
2. `src/types/command.ts` と `src/utils/command_validator.ts`: 型と registry を追加
3. `src/hooks/useStageCommandHandler.ts`: 処理分岐（switch）を追加
