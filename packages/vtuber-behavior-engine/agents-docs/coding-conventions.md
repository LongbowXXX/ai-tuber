<!-- このドキュメントは .github/prompts/document-project.prompt.md によって生成・更新されています -->

# 設計原則とコーディング規約

## 設計原則

### 1. 関心の分離 (Separation of Concerns)

- **エージェント層**: 対話生成とコンテキスト管理
- **サービス層**: 外部 API との連携
- **モデル層**: データ構造とバリデーション
- **リソース層**: プロンプトテンプレート

### 2. 依存性逆転の原則 (Dependency Inversion)

- 高レベルモジュール（エージェント）は低レベルモジュール（サービス）の抽象に依存
- ADK の `BaseTool` を継承してツールを実装し、LLM から呼び出し可能にする

### 3. DRY (Don't Repeat Yourself)

- 共通のステートキーは `stage_agents/agent_constants.py` で定義
- プロンプトは `stage_agents/resources/` に配置し、再利用
- エージェント構築ロジックは `agent_builder.py` に集約

### 4. 構成可能性 (Composability)

- `SequentialAgent` と `LoopAgent` でエージェントを宣言的に構成
- ステージごとに Initial/Update Context Agent を差し替えるだけで動作変更

### 5. 単一責任の原則 (Single Responsibility)

- **Thought Agent**: キャラクターの思考内容のみを生成
- **Output Agent**: Stage Director への出力のみを担当
- **Context Agent**: コンテキストの初期化と更新のみを担当

## 採用している設計パターン

### 1. Factory Pattern

**使用箇所**: `stage_agents/news/news_root_agent_builder.py`, `presentation_root_agent_builder.py`

```python
async def build_root_news_agent(agent_config: AgentsConfig) -> tuple[BaseAgent, AsyncExitStack] | None:
    # Root Agent を構築して返す
    initial_context_agent = create_initial_news_context_agent()
    update_context_agent = create_update_news_context_agent(speech_tool)
    character_agent = await build_root_agent(...)
    return character_agent, exit_stack
```

### 2. Builder Pattern

**使用箇所**: `stage_agents/agent_builder.py`

```python
async def build_root_agent(
    initial_context_agent: BaseAgent,
    update_context_agent: BaseAgent,
    stage_director_client: StageDirectorMCPClient,
    agent_config: AgentsConfig,
    speech_tool: Optional[SpeechRecognitionTool] = None,
) -> BaseAgent:
    # エージェントを段階的に構築
    agent1_thought = create_character_agent(...)
    agent1_output = await create_character_output_agent(...)
    # ...
    return root_agent
```

### 3. Strategy Pattern

**使用箇所**: ステージごとに Context Agent を差し替え

- News: `news_context_agent.py`
- Presentation: `presentation_context_agent.py`
- Theater: `theater_context_agent.py` (今後)

### 4. Template Method Pattern

**使用箇所**: `agent_builder.build_root_agent()` が共通フローを定義し、各ステージは Initial/Update Context Agent を提供

### 5. Adapter Pattern

**使用箇所**: `agent_runner.py` が ADK `Runner` をラップし、簡易インターフェースを提供

```python
async def run_agent_standalone(agent: BaseAgent, initial_message: str) -> str:
    # ADK Runner の複雑な設定を隠蔽
    runner = Runner(...)
    async for event in runner.run_async(...):
        # ...
```

### 6. Observer Pattern (コールバック)

**使用箇所**: ADK の `before_model_callback`, `after_model_callback`

```python
agent = LlmAgent(
    before_model_callback=get_user_speech,  # モデル呼び出し前にユーザー発話を取得
    after_model_callback=clear_display_text,  # モデル呼び出し後に表示テキストをクリア
)
```

## 命名規則

### ファイル名

- **スネークケース**: `agent_builder.py`, `news_context_agent.py`
- **サフィックス**:
  - `_agent.py`: エージェント実装
  - `_builder.py`: ビルダー
  - `_constants.py`: 定数定義
  - `_models.py`: Pydantic モデル
  - `_provider.py`: データプロバイダー
  - `_client.py`: クライアント

### クラス名

- **パスカルケース**: `StageDirectorMCPClient`, `ChromaMemoryService`, `AgentSpeech`
- **サフィックス**:
  - `Agent`: ADK エージェント（厳密には `BaseAgent` を返す関数を指す）
  - `Service`: サービスクラス
  - `Client`: クライアントクラス
  - `Tool`: ADK ツール（`BaseTool` 継承）
  - `Manager`: 管理クラス

### 関数名

- **スネークケース**: `build_root_agent()`, `create_character_agent()`, `run_agent_standalone()`
- **動詞で始める**: `create_`, `build_`, `load_`, `get_`, `set_`
- **非同期関数**: 特別な接頭辞なし（Python の慣習に従い、`async def` で定義）

### 変数名

- **スネークケース**: `agent_config`, `stage_director_client`, `initial_message`
- **定数**: `UPPER_SNAKE_CASE`（`agent_constants.py` など）
  - `STATE_CONVERSATION_CONTEXT`, `AGENT_LLM_MODEL`

### ステートキー

- **プレフィックス**: `STATE_` で始まる
- **スネークケース**: `STATE_AGENT_SPEECH_BASE`, `STATE_CONVERSATION_RECALL`
- **定義場所**: `stage_agents/agent_constants.py`

### プロンプトファイル名

- **スネークケース**: `character_prompt.md`, `initial_context.md`
- **ディレクトリ**: `stage_agents/resources/<category>/`

## コードスタイル

### フォーマッター: Black

**設定** (`pyproject.toml`):

```toml
[tool.black]
target-version = ["py310"]
line-length = 120
```

**実行**:

```powershell
black .
```

### リンター: flake8

**設定** (`pyproject.toml` または `.flake8`):

```ini
[flake8]
max-line-length = 120
extend-ignore = E203, W503
```

**実行**:

```powershell
flake8 .
```

### 型チェッカー: mypy

**設定** (`pyproject.toml`):

```toml
[tool.mypy]
plugins = []
ignore_missing_imports = true
strict = true
follow_imports = "normal"
strict_optional = true
disallow_untyped_defs = true
disallow_any_unimported = false
no_implicit_optional = true
check_untyped_defs = true
warn_return_any = true
show_error_codes = true
warn_unused_ignores = true
show_error_context = true
show_column_numbers = true
```

**実行**:

```powershell
mypy .
```

### インポート順序

1. 標準ライブラリ
2. サードパーティライブラリ
3. プロジェクト内モジュール

**例**:

```python
import logging
from typing import Optional

from google.adk.agents import LlmAgent, BaseAgent
from google.genai import types

from vtuber_behavior_engine.services.stage_director_mcp_client import StageDirectorMCPClient
from vtuber_behavior_engine.stage_agents.models import AgentSpeech
```

### 型ヒント

- すべての関数に型ヒントを付ける
- `Optional[T]` ではなく `T | None` を推奨（Python 3.10+）

**例**:

```python
async def build_root_agent(
    initial_context_agent: BaseAgent,
    update_context_agent: BaseAgent,
    stage_director_client: StageDirectorMCPClient,
    agent_config: AgentsConfig,
    speech_tool: SpeechRecognitionTool | None = None,
) -> BaseAgent:
    ...
```

### ロギング

- `logging` モジュールを使用
- `logger = logging.getLogger(__name__)` で各モジュールのロガーを取得
- ログレベル: `DEBUG`, `INFO`, `WARNING`, `ERROR`, `CRITICAL`
- 設定は `utils/logger.py` の `setup_logger()` で一元管理

**例**:

```python
import logging

logger = logging.getLogger(__name__)

logger.info(f"Running agent with initial_message: '{initial_message}'")
logger.error(f"Error building root agent: {e}", exc_info=e)
```

### 非同期プログラミング

- `async`/`await` を使用
- `asyncio.create_task()` でバックグラウンドタスク作成
- `AsyncExitStack` でリソース管理

**例**:

```python
async def build_root_news_agent(agent_config: AgentsConfig) -> tuple[BaseAgent, AsyncExitStack] | None:
    exit_stack = AsyncExitStack()
    stage_director_client = await StageDirectorMCPClient.create_async(exit_stack)
    # ...
    return character_agent, exit_stack
```

## プロンプトエンジニアリング規約

### プレースホルダー

- 波括弧で囲む: `{character_id}`, `{topic}`, `{current_time}`
- 差し替えは `str.format()` で実行

**例**:

```python
prompt = character_prompt().format(
    character_id=character_id,
    character_detail=character_detail,
    conversation_context=conversation_context,
)
```

### プロンプトファイルの構造

- Markdown 形式
- 見出しで構造化（`## 役割`, `## 制約`, `## 出力形式` など）

**例** (`character_prompt.md`):

```markdown
## 役割

あなたは{character_id}です。

## 制約

- キャラクター設定に従って発話すること
- 会話の文脈を考慮すること

## 出力形式

JSON 形式で出力してください。
```

## 構造化出力規約

### Pydantic モデル

- `pydantic.BaseModel` を継承
- `Field()` でバリデーションルールを定義

**例** (`models.py`):

```python
from pydantic import BaseModel, Field

class AgentSpeech(BaseModel):
    character_id: str = Field(..., description="キャラクターID")
    speeches: list[SpeechItem] = Field(..., description="発話リスト")

class SpeechItem(BaseModel):
    tts_text: str = Field(..., description="音声合成用テキスト")
    caption: str | None = Field(None, description="字幕用テキスト")
    emotion: str = Field("neutral", description="感情表現")
```

### ADK `output_schema`

- LLM の出力を Pydantic モデルで検証
- `output_schema=AgentSpeech` として指定

**例**:

```python
agent = LlmAgent(
    name=f"{character_id}_output",
    model=OUTPUT_LLM_MODEL,
    system_instruction=prompt,
    output_schema=AgentSpeech,
)
```

## 画面表示用オーバーレイ規約

- **設定場所**: エージェントの `after_model_callback` で `STATE_DISPLAY_MARKDOWN_TEXT` に設定
- **表示タイミング**: `StageDirectorMCPClient.speak()` の前
- **クリア**: `after_model_callback` で適切にクリア

**例**:

```python
def after_output_callback(callback_context: CallbackContext) -> Optional[types.Content]:
    # 画面表示用テキストを取得してクリア
    markdown_text = callback_context.state.get(STATE_DISPLAY_MARKDOWN_TEXT)
    if markdown_text:
        del callback_context.state[STATE_DISPLAY_MARKDOWN_TEXT]
    # ...
```

## ADK エージェント設定規約

### `disallow_transfer_*` 設定

- **デフォルト**: `True` に保つ（意図しないエージェント間の制御移譲を防ぐ）
- **意図的に許可する場合のみ**: `False` に変更

**例**:

```python
agent = LlmAgent(
    name="character_thought",
    model=AGENT_LLM_MODEL,
    disallow_transfer_to_self=True,  # 自分自身への制御移譲を禁止
    disallow_transfer_to_agents=True,  # 他エージェントへの制御移譲を禁止
)
```

## ステート管理規約

### 共有ステートキー

- `stage_agents/agent_constants.py` で定義
- エージェント間で共有される状態は必ずここで定義

**定義済みキー**:

```python
STATE_CONVERSATION_CONTEXT = "conversation_context"
STATE_CONVERSATION_RECALL = "conversation_recall"
STATE_AGENT_SPEECH_BASE = "agent_speech_"
STATE_CURRENT_TIME = "current_time"
STATE_DISPLAY_MARKDOWN_TEXT = "display_markdown_text"
STATE_USER_SPEECH = "user_speech"  # news_agent_constants.py
```

### ステートアクセス

- `callback_context.state` でアクセス
- 存在しないキーは `get()` でデフォルト値を指定

**例**:

```python
conversation_context = callback_context.state.get(STATE_CONVERSATION_CONTEXT, "")
callback_context.state[STATE_CONVERSATION_RECALL] = recall_text
```

## テストの方針

- **フレームワーク**: pytest
- **非同期テスト**: `pytest-asyncio`
- **カバレッジ**: `pytest-cov`（目標: 80%以上）
- **命名**: `test_<function_name>` または `test_<feature>`

**例**:

```python
import pytest

@pytest.mark.asyncio
async def test_build_root_agent():
    agent = await build_root_agent(...)
    assert agent is not None
```

## 環境変数規約

- `.env` ファイルで管理（`.env_sample` をコピー）
- `python-dotenv` で読み込み（`main.py` で `load_dotenv()`）
- 必須変数:
  - `GOOGLE_API_KEY`: Gemini API キー
  - `GOOGLE_APPLICATION_CREDENTIALS`: Google Cloud 認証情報
  - `STAGE_DIRECTOR_MCP_SERVER_URL`: Stage Director の MCP URL

## コード品質チェックリスト

- [ ] 型ヒントを付けたか
- [ ] docstring を書いたか（複雑な関数のみ）
- [ ] ロギングを適切に追加したか
- [ ] 例外処理を適切に行ったか
- [ ] `black`, `flake8`, `mypy` をパスしたか
- [ ] テストを追加したか（新機能の場合）
- [ ] 共有ステートキーは `agent_constants.py` で定義したか
- [ ] プロンプトは `resources/` に配置したか
