<!-- このドキュメントは .github/prompts/document-project.prompt.md によって生成・更新されています -->

# テスト戦略とガイド

## テスト構成

### ディレクトリ構造

```
tests/
└── tests_vtuber_behavior_engine/
    ├── __init__.py
    ├── test_dummy.py                          # ダミーテスト
    ├── test_speech_recognition_tool.py        # 音声認識ツールの単体テスト
    └── test_speech_recognition_integration.py # 音声認識の統合テスト
```

### テストファイルの配置

- テストファイルは `tests/tests_vtuber_behavior_engine/` ディレクトリに配置
- テストファイル名は `test_` で始める
- ソースコードの構造に対応させる（例: `services/speech_recognition.py` → `test_speech_recognition_tool.py`）

## テストの種類

### ユニットテスト

**目的**: 個別の関数・クラスの動作を検証

**方針**:

- 外部依存をモック化
- 高速に実行可能
- 一つの機能に焦点を当てる

**例**: `test_speech_recognition_tool.py`

```python
import pytest
from unittest.mock import Mock, patch
from vtuber_behavior_engine.services.speech_recognition import SpeechRecognitionTool

def test_speech_recognition_tool_initialization():
    """音声認識ツールの初期化をテスト"""
    tool = SpeechRecognitionTool()
    assert tool.name == "get_user_speech"
    assert tool.description is not None

@patch('vtuber_behavior_engine.services.speech_recognition.SpeechRecognitionManager')
def test_get_transcripts(mock_manager):
    """get_transcripts メソッドのテスト"""
    mock_manager_instance = Mock()
    mock_manager_instance.get_transcripts.return_value = ["テスト発話"]

    tool = SpeechRecognitionTool()
    tool._manager = mock_manager_instance

    transcripts = tool._manager.get_transcripts()
    assert transcripts == ["テスト発話"]
```

### 統合テスト

**目的**: 複数のコンポーネント間の連携を検証

**方針**:

- 実際の外部サービスを使用（または専用のテスト環境）
- モックは最小限に
- エンドツーエンドの動作を確認

**マーカー**: `@pytest.mark.integration`

**例**: `test_speech_recognition_integration.py`

```python
import pytest
from vtuber_behavior_engine.services.speech_recognition import SpeechRecognitionManager

@pytest.mark.integration
def test_speech_recognition_manager_lifecycle():
    """音声認識マネージャーのライフサイクルをテスト"""
    manager = SpeechRecognitionManager()

    # 開始
    manager.start()
    assert manager._stt_thread is not None
    assert manager._stt_thread.is_alive()

    # 停止
    manager.stop()
    assert manager._stop_event.is_set()
```

### E2E テスト

**目的**: システム全体の動作を検証

**現状**: 未実装（今後の課題）

**想定範囲**:

- メイン関数の実行
- エージェントの起動からセッション終了まで
- Stage Director との連携

## テスト実行方法

### 基本実行

```powershell
# 仮想環境をアクティブ化
.\.venv\Scripts\Activate.ps1

# 全テストを実行
pytest

# 詳細な出力
pytest -v

# 失敗したテストで停止
pytest -x

# 特定のファイルのみ実行
pytest tests/tests_vtuber_behavior_engine/test_speech_recognition_tool.py

# 特定のテスト関数のみ実行
pytest tests/tests_vtuber_behavior_engine/test_speech_recognition_tool.py::test_speech_recognition_tool_initialization
```

### マーカーによる絞り込み

```powershell
# 統合テストを除外
pytest -m "not integration"

# 統合テストのみ実行
pytest -m integration
```

### カバレッジ測定

```powershell
# カバレッジ測定付きで実行
pytest --cov=vtuber_behavior_engine --cov-report=html

# カバレッジレポートを開く
start htmlcov/index.html
```

### 非同期テストの実行

pytest-asyncio が自動的に非同期テストを処理します。

```python
@pytest.mark.asyncio
async def test_async_function():
    result = await some_async_function()
    assert result is not None
```

## カバレッジ目標

- **全体**: 80% 以上
- **コアロジック** (agent_builder, character_agent など): 90% 以上
- **ユーティリティ** (logger, path など): 70% 以上
- **テストコード**: カバレッジ計測から除外

**設定** (`pyproject.toml`):

```toml
[tool.coverage.run]
branch = true
omit = ["tests/*"]
```

## テストデータの管理

### フィクスチャ

pytest の fixture を使用してテストデータを管理。

**例**:

```python
import pytest

@pytest.fixture
def sample_agent_config():
    """テスト用のエージェント設定"""
    from vtuber_behavior_engine.stage_agents.agents_config import AgentsConfig
    return AgentsConfig(max_iterations=3)

@pytest.fixture
def mock_stage_director_client():
    """テスト用の Stage Director クライアント"""
    from unittest.mock import AsyncMock
    client = AsyncMock()
    client.speak = AsyncMock()
    client.display_markdown_text = AsyncMock()
    return client

def test_with_fixtures(sample_agent_config, mock_stage_director_client):
    assert sample_agent_config.max_iterations == 3
    assert mock_stage_director_client.speak is not None
```

### テストプロンプト

プロンプトテンプレートのテストには、専用のテストデータを用意。

**場所**: `tests/resources/` (今後作成予定)

### モックデータ

外部 API のレスポンスはモックデータとして定義。

**例**:

```python
MOCK_NEWS_RSS = """
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <item>
      <title>テストニュース</title>
      <description>これはテストです。</description>
    </item>
  </channel>
</rss>
"""
```

## テストのベストプラクティス

### 命名規則

- **テストファイル**: `test_<module_name>.py`
- **テスト関数**: `test_<function_name>` または `test_<feature>`
- **フィクスチャ**: `<noun>_<type>` (例: `sample_agent_config`, `mock_mcp_client`)

### テストケースの構造 (AAA パターン)

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

### 非同期テストの注意点

- `@pytest.mark.asyncio` デコレータを必ず付ける
- `await` を忘れないようにする
- 非同期フィクスチャは `@pytest.fixture(scope="function")` を推奨

```python
@pytest.fixture
async def async_fixture():
    # Setup
    resource = await create_resource()
    yield resource
    # Teardown
    await resource.close()

@pytest.mark.asyncio
async def test_async_function(async_fixture):
    result = await async_function(async_fixture)
    assert result is not None
```

### モックの使い方

**unittest.mock を使用**:

```python
from unittest.mock import Mock, AsyncMock, patch

# 同期関数のモック
mock_func = Mock(return_value="result")

# 非同期関数のモック
mock_async_func = AsyncMock(return_value="result")

# パッチ
@patch('vtuber_behavior_engine.services.news_provider.fetch_rss')
def test_with_patch(mock_fetch):
    mock_fetch.return_value = MOCK_NEWS_RSS
    # テストコード
```

### エラーケースのテスト

```python
def test_error_handling():
    with pytest.raises(ValueError) as exc_info:
        invalid_function()

    assert "expected error message" in str(exc_info.value)
```

### テストの独立性

- 各テストは他のテストに依存しない
- グローバル状態を変更しない
- フィクスチャで必要なリソースを準備

### テストのスキップ

```python
@pytest.mark.skip(reason="未実装")
def test_future_feature():
    pass

@pytest.mark.skipif(sys.platform == "win32", reason="Windows では実行不可")
def test_unix_only():
    pass
```

## よくあるテスト問題と解決策

### 問題 1: 非同期テストが `RuntimeError: Event loop is closed` で失敗

**原因**: イベントループが適切に管理されていない

**解決策**:

```toml
# pyproject.toml に追加
[tool.pytest.ini_options]
asyncio_default_fixture_loop_scope = "function"
```

### 問題 2: Google Cloud API の認証エラー

**原因**: `GOOGLE_APPLICATION_CREDENTIALS` が設定されていない

**解決策**:

```python
@pytest.fixture
def mock_google_credentials(monkeypatch):
    """Google Cloud 認証をモック化"""
    monkeypatch.setenv("GOOGLE_APPLICATION_CREDENTIALS", "dummy.json")
    with patch('google.cloud.speech.SpeechClient'):
        yield
```

### 問題 3: MCP クライアントのテストでタイムアウト

**原因**: 実際の MCP Server に接続しようとしている

**解決策**:

```python
@pytest.fixture
def mock_mcp_session():
    """MCP セッションをモック化"""
    mock_session = AsyncMock()
    mock_session.call_tool = AsyncMock(return_value={"status": "ok"})
    return mock_session
```

### 問題 4: Chroma DB のロックエラー

**原因**: 複数のテストが同時に DB にアクセス

**解決策**:

```python
@pytest.fixture
def temp_chroma_db(tmp_path):
    """テスト用の一時 Chroma DB"""
    db_path = tmp_path / "chroma"
    db_path.mkdir()
    return str(db_path)
```

### 問題 5: ログ出力が多すぎる

**解決策**:

```toml
# pyproject.toml
[tool.pytest.ini_options]
log_cli = true
log_cli_level = "WARNING"  # INFO から WARNING に変更
```

## CI/CD での実行

### GitHub Actions (例)

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: astral-sh/setup-uv@v1
      - name: Install dependencies
        run: uv sync --extra dev
      - name: Run tests
        run: uv run pytest --cov --cov-report=xml
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## テスト追加のガイドライン

### 新機能を追加する場合

1. 機能実装前にテストケースを書く（TDD 推奨）
2. ユニットテストと統合テストの両方を追加
3. エッジケースとエラーケースをカバー
4. カバレッジ 80% 以上を維持

### 既存機能を変更する場合

1. 既存のテストが通ることを確認
2. 変更に応じてテストを更新
3. 新しいケースを追加
4. リグレッションテストを実施

### バグ修正の場合

1. バグを再現するテストケースを作成
2. テストが失敗することを確認
3. バグを修正
4. テストが通ることを確認

## テストの実行頻度

- **ローカル開発**: コミット前に必ず実行
- **Pull Request**: 全テスト + カバレッジチェック
- **マージ前**: 統合テストを含む全テスト
- **リリース前**: E2E テストを含む全テスト

## 今後の課題

- [ ] E2E テストの実装
- [ ] CI/CD パイプラインの構築
- [ ] カバレッジ 80% 達成
- [ ] パフォーマンステストの追加
- [ ] テストデータの充実化
- [ ] テストドキュメントの自動生成
