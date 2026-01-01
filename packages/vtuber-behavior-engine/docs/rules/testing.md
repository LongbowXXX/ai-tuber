<!-- このドキュメントは .github/prompts/doc-sync.prompt.md によって生成および更新されています -->

# テスト

## テスト戦略

- **ユニットテスト**: 個別のサービスやユーティリティ関数の動作を検証。
- **統合テスト**: 複数のエージェントやサービスが連携して動作することを検証（外部 API はモック化を推奨）。
- **カバレッジ**: 重要なビジネスロジックについては高いテストカバレッジを維持する。

## テストの実行

`pytest` を使用してテストを実行します。

```bash
# 全てのテストを実行
uv run pytest

# 特定のファイルをテスト
uv run pytest tests/tests_vtuber_behavior_engine/test_speech_recognition_tool.py

# カバレッジレポートの生成
uv run pytest --cov=src
```

## 修正後の検証

コードの修正を行った際は、テストだけでなく静的解析も含めた全体チェックを行ってください。

```bash
# フォーマット (black)
uv run black .

# リント (flake8)
uv run flake8

# 型チェック (mypy)
uv run mypy .

# テスト (pytest)
uv run pytest
```

## テスト作成のガイドライン

- **非同期テスト**: `pytest-asyncio` を使用し、`@pytest.mark.asyncio` デコレータを付与する。
- **モック**: 外部サービス（Gemini API, Google Cloud API）への依存がある場合は `unittest.mock` や `respx` を使用してモック化する。
- **配置**: テストファイルは `tests/` ディレクトリ内に配置し、`test_*.py` という命名規則に従う。
