# VTuber Behavior Engine - GitHub Copilot カスタム命令

## プロジェクト概要

`vtuber-behavior-engine` は、Google ADK (Agent Development Kit) ベースの AI VTuber の頭脳システムです。複数の AI エージェントが協調して動作し、キャラクターの対話生成、感情分析、コンテキスト管理を行います。

**主な機能**:

- マルチエージェント協調（ニュース解説、プレゼンテーションなど）
- MCP クライアント統合（Stage Director との連携）
- リアルタイム音声認識（Google Cloud Speech API）
- 会話履歴の永続化と検索（Chroma ベクトル DB）
- 構造化出力（Pydantic モデル）

## 技術スタック

| カテゴリ       | 技術                                          |
| -------------- | --------------------------------------------- |
| 言語           | Python 3.11+                                  |
| フレームワーク | Google ADK v1.17.0+, Pydantic v2.x            |
| LLM            | Gemini API (`gemini-2.5-flash`)               |
| データベース   | Chroma（ベクトル DB）                         |
| 外部連携       | MCP (Stage Director), Google Cloud Speech API |
| パッケージ管理 | uv                                            |
| 品質管理       | black, flake8, mypy, pytest                   |

## アーキテクチャ概要

```
main.py → agent_runner.py → Root Agent (SequentialAgent)
                                ├── Initial Context Agent
                                └── Conversation Loop (LoopAgent)
                                    ├── Recall Agent
                                    ├── Character1 Thought → Output
                                    ├── Character2 Thought → Output
                                    └── Update Context Agent
```

**主要コンポーネント**:

- `agent_runner.py`: ADK Runner のラッパー（InMemorySession + ChromaMemoryService）
- `stage_agents/agent_builder.py`: Root Agent のビルダー（SequentialAgent を構築）
- `stage_agents/character_agent.py`: キャラクター思考・出力（AgentSpeech で構造化）
- `services/stage_director_mcp_client.py`: Stage Director との MCP 連携
- `services/memory/chroma_memory_service.py`: 会話履歴の永続化（Gemini 埋め込み）

**エージェント構成**:

- ループ順序は「リコール → avatar1 思考 → 出力 → avatar2 思考 → 出力 → コンテキスト更新」で固定
- 共有ステートキーは `stage_agents/agent_constants.py` で定義
- 出力系エージェントは `StageDirectorMCPClient.speak` を呼び出し

## 開発ワークフロー

### 環境構築

```powershell
uv venv
.\.venv\Scripts\Activate.ps1
uv sync --extra dev
cp .env_sample .env  # API キーを設定
```

### 実行

```powershell
# スタンドアロン実行（Stage Director が起動済みであること）
uv run python src/vtuber_behavior_engine/main.py

# ADK Web UI
adk web --port=8090 src/vtuber_behavior_engine
```

### テスト・品質チェック

```powershell
pytest                     # テスト実行
black .                    # フォーマット
flake8 .                   # リント
mypy .                     # 型チェック
```

**重要**: 仮想環境を有効化した状態でコマンドを実行してください。

## コーディング規約（重要）

### 型ヒント

- すべての関数に型ヒントを付ける
- `T | None` を使用（`Optional[T]` ではなく）

### ADK エージェント

- `disallow_transfer_to_self=True`, `disallow_transfer_to_agents=True` を維持
- 共有ステートキーは `stage_agents/agent_constants.py` で定義
- プロンプトは `stage_agents/resources/*.md` に配置
- プレースホルダーは `{character_id}`, `{topic}` などの形式

### 構造化出力

- `AgentSpeech`, `PresentationContext` などの Pydantic モデルを使用
- `output_schema` で検証

### ロギング

- `logging.getLogger(__name__)` を使用
- 設定は `utils/logger.py` の `setup_logger()` で一元管理

### 著作権表記

各ファイルの先頭に以下を記載：

```python
#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
```

## 環境変数（必須）

| 変数名                           | 用途                          |
| -------------------------------- | ----------------------------- |
| `GOOGLE_API_KEY`                 | Gemini API キー               |
| `GOOGLE_APPLICATION_CREDENTIALS` | Google Cloud 認証情報パス     |
| `STAGE_DIRECTOR_MCP_SERVER_URL`  | Stage Director の MCP URL     |
| `NEWS_BASE_URL`                  | ニュース RSS テンプレート URL |

## 詳細ドキュメント

詳細な情報は `agents-docs/` ディレクトリを参照してください：

- [architecture.md](../agents-docs/architecture.md) - システム構成と設計思想、データフロー図
- [directory-structure.md](../agents-docs/directory-structure.md) - ディレクトリ構造と各モジュールの責務
- [coding-conventions.md](../agents-docs/coding-conventions.md) - 設計パターン、命名規則、コードスタイル
- [key-flows.md](../agents-docs/key-flows.md) - 主要な機能フローのシーケンス図
- [tech-stack.md](../agents-docs/tech-stack.md) - 技術スタック、依存ライブラリ、外部サービス
- [testing.md](../agents-docs/testing.md) - テスト戦略、実行方法、ベストプラクティス
- [constraints-and-gotchas.md](../agents-docs/constraints-and-gotchas.md) - 技術的制約、既知の問題

## 言語別・ファイル別の詳細規約

特定のファイルタイプには追加の命令が適用されます：

- `.github/instructions/python.instructions.md` - Python コードの詳細規約
- `.github/instructions/test.instructions.md` - テストコードの規約
- `.github/instructions/prompt.instructions.md` - プロンプトテンプレートの規約

## よくあるトラブル

| 症状                        | 原因                     | 対処法                                  |
| --------------------------- | ------------------------ | --------------------------------------- |
| `GOOGLE_API_KEY is not set` | 環境変数未設定           | `.env` に API キーを設定                |
| MCP 接続エラー              | Stage Director 未起動    | Stage Director を起動                   |
| `flake8` が見つからない     | 仮想環境未アクティブ     | `.\.venv\Scripts\Activate.ps1` を実行   |
| Chroma DB ロックエラー      | 複数プロセスからアクセス | 既存プロセスを終了、DB を削除して再作成 |

詳細は [constraints-and-gotchas.md](../agents-docs/constraints-and-gotchas.md) を参照してください。
