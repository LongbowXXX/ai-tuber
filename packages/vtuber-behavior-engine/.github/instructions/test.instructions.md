---
applyTo: "**/tests/**/*.py"
---

# テストコーディング規約

## テストフレームワーク

- **pytest** を使用
- **pytest-asyncio** で非同期テスト
- **pytest-cov** でカバレッジ測定

## ファイル配置

- テストファイルは `tests/tests_vtuber_behavior_engine/` に配置
- ファイル名は `test_<module_name>.py`
- ソースコードの構造に対応させる

## 命名規則

- **テスト関数**: `test_<function_name>` または `test_<feature>`
- **フィクスチャ**: `<noun>_<type>` (例: `sample_agent_config`, `mock_mcp_client`)

## テスト構造 (AAA パターン)

```python
def test_example():
    # Arrange: テストの準備
    input_data = "test"
    expected_output = "TEST"

    # Act: テスト対象を実行
    actual_output = process(input_data)

    # Assert: 結果を検証
    assert actual_output == expected_output
```

## 非同期テスト

```python
import pytest

@pytest.mark.asyncio
async def test_async_function():
    result = await some_async_function()
    assert result is not None
```

## モック

```python
from unittest.mock import Mock, AsyncMock, patch

# 非同期関数のモック
mock_async_func = AsyncMock(return_value="result")

# パッチ
@patch('vtuber_behavior_engine.services.news_provider.fetch_rss')
def test_with_patch(mock_fetch):
    mock_fetch.return_value = MOCK_NEWS_RSS
    # テストコード
```

## フィクスチャ

```python
@pytest.fixture
def sample_agent_config():
    from vtuber_behavior_engine.stage_agents.agents_config import AgentsConfig
    return AgentsConfig(max_iterations=3)

@pytest.fixture
def mock_stage_director_client():
    client = AsyncMock()
    client.speak = AsyncMock()
    return client
```

## マーカー

- `@pytest.mark.integration`: 統合テスト（外部サービス使用）
- `@pytest.mark.asyncio`: 非同期テスト

## 実行方法

```powershell
# 全テスト
pytest

# 統合テストを除外
pytest -m "not integration"

# カバレッジ付き
pytest --cov=vtuber_behavior_engine --cov-report=html
```

## カバレッジ目標

- 全体: 80% 以上
- コアロジック: 90% 以上

## 詳細ドキュメント

- テスト戦略: [agents-docs/testing.md](../../agents-docs/testing.md)
