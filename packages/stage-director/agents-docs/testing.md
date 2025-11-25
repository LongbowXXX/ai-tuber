<!-- このドキュメントは .github/prompts/document-project.prompt.md によって生成・更新されています -->

# テスト戦略とガイド

## テスト構成

### ディレクトリ構造

```
tests/
└── tests_stage_director/
    ├── __init__.py
    └── test_dummy.py          # CI 動作確認用ダミーテスト
```

### テストフレームワーク

- **pytest**: メインテストランナー
- **pytest-asyncio**: 非同期テストサポート
- **pytest-cov**: カバレッジ計測
- **pytest-html**: HTML レポート生成
- **respx**: HTTP モック（将来の統合テスト用）

## テストの種類

### ユニットテスト

#### 現状

- `test_dummy.py`: GitHub Actions 動作確認用のダミーテスト

#### 推奨テスト対象

| モジュール                     | テスト内容                                            |
| ------------------------------ | ----------------------------------------------------- |
| `models.py`                    | Pydantic モデルのバリデーション、シリアライゼーション |
| `command_queue.py`             | `enqueue_command`, `dequeue_command`, イベント通知    |
| `stage_director_mcp_server.py` | MCP ツールの入出力                                    |

#### モック/スタブの使い方

```python
import pytest
from unittest.mock import AsyncMock, patch

@pytest.mark.asyncio
async def test_speak_enqueues_command():
    with patch("stage_director.command_queue.enqueue_command", new_callable=AsyncMock) as mock_enqueue:
        with patch("stage_director.command_queue.wait_for_command", new_callable=AsyncMock):
            from stage_director.stage_director_mcp_server import speak
            result = await speak("char1", "Hello", "こんにちは", "happy")
            mock_enqueue.assert_called_once()
            assert result == "Success"
```

### 統合テスト

#### 推奨テスト対象

- WebSocket 接続確立・切断
- コマンドキューの Producer-Consumer フロー
- `speakEnd` ACK による同期制御

#### 実装例

```python
import pytest
from fastapi.testclient import TestClient
from stage_director.stage_director_server import app

@pytest.mark.asyncio
async def test_websocket_connection():
    with TestClient(app) as client:
        with client.websocket_connect("/ws") as websocket:
            # 接続確認
            assert websocket is not None
```

### E2E テスト

#### 現状

- E2E テストは未実装
- `vtube-stage` との実際の接続テストは手動で実施

#### 将来の計画

- Docker Compose による統合環境でのテスト
- CI での自動 E2E テスト

## テスト実行方法

### 基本コマンド

```bash
# 仮想環境有効化後
pytest

# または uv 経由
uv run pytest
```

### オプション

```bash
# 詳細出力
uv run pytest -v

# 特定のテスト
uv run pytest tests/tests_stage_director/test_dummy.py

# カバレッジ付き
uv run pytest --cov=src/stage_director

# HTML レポート生成
uv run pytest --html=report.html
```

### 環境設定

`pyproject.toml` で設定済み:

```toml
[tool.pytest.ini_options]
pythonpath = ["."]
log_cli = true
log_cli_level = "INFO"
asyncio_default_fixture_loop_scope = "function"
```

## カバレッジ目標

### 現状

- 実質的なテストカバレッジ: **0%** (ダミーテストのみ)

### 目標

| 段階 | カバレッジ目標 |
| ---- | -------------- |
| 初期 | 50%            |
| 中期 | 70%            |
| 長期 | 80%+           |

### カバレッジ設定

```toml
[tool.coverage.run]
branch = true
omit = ["tests/*"]
```

## テストデータの管理

### フィクスチャ

```python
import pytest
from stage_director.models import SpeakPayload, SpeakCommand

@pytest.fixture
def speak_payload():
    return SpeakPayload(
        characterId="char1",
        message="Hello",
        caption="こんにちは",
        emotion="happy",
        speakId="test-uuid-1234"
    )

@pytest.fixture
def speak_command(speak_payload):
    return SpeakCommand(payload=speak_payload)
```

### テストデータ作成ガイドライン

- UUID は固定値 (`"test-uuid-xxxx"`) を使用
- キャラクター ID は `"char1"`, `"char2"` 等の簡潔な値
- 日本語テキストを含むテストケースを用意

## テストのベストプラクティス

### 命名規則

```python
# ファイル名: test_<module_name>.py
# 関数名: test_<機能>_<条件>_<期待結果>

def test_speak_with_valid_input_returns_success():
    ...

def test_enqueue_command_adds_to_queue():
    ...
```

### 非同期テスト

```python
import pytest

@pytest.mark.asyncio
async def test_async_function():
    result = await some_async_function()
    assert result == expected
```

### テストケースの書き方

1. **Arrange**: テストデータとモックをセットアップ
2. **Act**: テスト対象の関数を実行
3. **Assert**: 結果を検証

```python
@pytest.mark.asyncio
async def test_example():
    # Arrange
    payload = SpeakPayload(...)
    command = SpeakCommand(payload=payload)

    # Act
    result = await enqueue_command(command)

    # Assert
    assert command_queue.qsize() == 1
```

## よくあるテスト問題と解決策

### 問題 1: 非同期テストがハングする

**原因**: `asyncio.Event.wait()` がタイムアウトしない

**解決策**: タイムアウト付きで待機する

```python
import asyncio

async def test_with_timeout():
    try:
        await asyncio.wait_for(some_async_op(), timeout=5.0)
    except asyncio.TimeoutError:
        pytest.fail("Operation timed out")
```

### 問題 2: イベントループの競合

**原因**: テスト間でイベントループが共有される

**解決策**: `asyncio_default_fixture_loop_scope = "function"` 設定で関数スコープのループを使用

### 問題 3: モックが効かない

**原因**: インポートパスの不一致

**解決策**: パッチ対象は**使用される場所**のパスを指定

```python
# NG: 定義元をパッチ
@patch("stage_director.command_queue.enqueue_command")

# OK: 使用される場所をパッチ
@patch("stage_director.stage_director_mcp_server.enqueue_command")
```

### 問題 4: WebSocket テストのセットアップ

**解決策**: `TestClient` を使用

```python
from fastapi.testclient import TestClient
from stage_director.stage_director_server import app

def test_websocket():
    client = TestClient(app)
    with client.websocket_connect("/ws") as ws:
        # テスト実行
        pass
```

## CI での実行

### GitHub Actions

```yaml
- name: Run tests
  run: uv run pytest --cov=src/stage_director --cov-report=xml

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

### ローカル CI 相当

```bash
# 品質チェック一式
uv run black --check .
uv run flake8
uv run mypy .
uv run pytest --cov=src/stage_director
```
