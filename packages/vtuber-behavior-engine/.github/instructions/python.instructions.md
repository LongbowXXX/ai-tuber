---
applyTo: "**/*.py"
---

# Python コーディング規約

このプロジェクトは Google ADK (Agent Development Kit) ベースの AI VTuber システムです。

## 基本規約

- **Python バージョン**: 3.11 以上
- **フォーマッター**: `black`（行長 120）
- **リンター**: `flake8`
- **型チェッカー**: `mypy --strict`

## 型ヒント

- すべての関数に型ヒントを付ける
- `Optional[T]` ではなく `T | None` を使用（Python 3.10+ 構文）
- 戻り値の型も必ず指定

```python
async def build_root_agent(
    initial_context_agent: BaseAgent,
    update_context_agent: BaseAgent,
    speech_tool: SpeechRecognitionTool | None = None,
) -> BaseAgent:
    ...
```

## 非同期プログラミング

- `async`/`await` を使用
- `AsyncExitStack` でリソース管理
- バックグラウンドタスクは `asyncio.create_task()`

## インポート順序

1. 標準ライブラリ
2. サードパーティライブラリ
3. プロジェクト内モジュール

```python
import logging
from typing import Optional

from google.adk.agents import LlmAgent, BaseAgent
from pydantic import BaseModel, Field

from vtuber_behavior_engine.services.stage_director_mcp_client import StageDirectorMCPClient
```

## Pydantic モデル

- 構造化出力は `pydantic.BaseModel` を継承
- `Field()` でバリデーションルールと説明を定義
- ADK の `output_schema` で検証

```python
class AgentSpeech(BaseModel):
    character_id: str = Field(..., description="キャラクターID")
    speeches: list[SpeechItem] = Field(..., description="発話リスト")
```

## ADK エージェント

- `disallow_transfer_to_self=True`, `disallow_transfer_to_agents=True` をデフォルトで維持
- 共有ステートキーは `stage_agents/agent_constants.py` で定義
- プロンプトは `stage_agents/resources/*.md` に配置

## ロギング

- `logging` モジュールを使用
- `logger = logging.getLogger(__name__)` で各モジュールのロガーを取得
- 設定は `utils/logger.py` の `setup_logger()` で一元管理

## 著作権表記

各ファイルの先頭に以下を記載：

```python
#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
```

## 詳細ドキュメント

- 設計パターン・命名規則: [agents-docs/coding-conventions.md](../../agents-docs/coding-conventions.md)
- ADK コンポーネント: [agents-docs/tech-stack.md](../../agents-docs/tech-stack.md)
