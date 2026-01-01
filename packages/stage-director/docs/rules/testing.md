<!-- このドキュメントは .github/prompts/doc-sync.prompt.md によって生成・更新されています -->

# テスト戦略

## テストの種類

- **単体テスト (Unit Tests)**: 個別の関数やクラス（`command_queue` 等）のロジックを検証。
- **統合テスト (Integration Tests)**: MCP サーバーと WebSocket ハンドラーの連携を検証。
- **モックテスト**: `vtube-stage` の挙動をモックし、通信フローを検証。

## 実行方法

```bash
# 全てのテストを実行
uv run pytest

# カバレッジを確認
uv run pytest --cov=src/stage_director
```

## 規約

- テストファイルは `tests/` ディレクトリに配置する。
- `pytest-asyncio` を使用して非同期関数のテストを行う。
- 重要なビジネスロジック（キューの順序、タイムアウト処理等）は重点的にテストする。
- テストコードも `black` および `mypy` のチェック対象とする。
