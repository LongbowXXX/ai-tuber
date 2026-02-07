<!-- このドキュメントは .github/prompts/doc-sync.prompt.md によって生成および更新されています -->

# コーディング規約（Coding Conventions）

## 共通

- **境界を守る**: AI（Behavior Engine）から「表現系（Stage）」へは MCP ツール経由で制御し、直接依存を増やさない。
- **型/スキーマを中心に設計**: vtube-stage は MCP SDK と TypeScript の型システムを基準に、ツールの契約を崩さない。

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

- ビルド: `npm run build` (Web版) / `npm run build:win` (Electron版)
- Lint: `eslint .`
- フォーマット: `prettier --write ...`

推奨:

- MCP ツール呼び出しのレスポンスは、処理完了後に確実に返す
- 新しい MCP ツールを追加する場合は、`src/mcp/server.ts` でツール定義とハンドラーを実装

## MCP ツール契約（AI ↔ Stage）

- `vtuber-behavior-engine` は MCP Client として `vtube-stage` の MCP Server に接続します。
- `vtube-stage` は MCP SDK を使用してツールを提供します。

新しい MCP ツールを追加する場合（最小要件）:

1. `vtube-stage`: `src/mcp/server.ts` にツール定義（name, description, parameters）を追加
2. `vtube-stage`: ツールハンドラーを実装し、処理完了後にレスポンスを返す
3. `vtuber-behavior-engine`: ADK の `MCPToolset` が自動的に新しいツールを認識して利用可能にします
