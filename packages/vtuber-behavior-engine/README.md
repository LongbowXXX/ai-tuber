# VTuber Behavior Engine

AI V-Tuber システムのコアとなる AI 頭脳。対話生成、感情分析、コンテキスト管理を担当します。

## 概要

`vtuber-behavior-engine` は、AI V-Tuber システムのインテリジェンスを担当するコンポーネントです。大規模言語モデル (LLM) と Google Agent Development Kit (ADK) を活用し、`stage-director` からの要求に応じて、対話の生成、感情の分析、およびコンテキストの維持を行います。

## アーキテクチャにおける役割

メインの [アーキテクチャドキュメント](../../docs/architecture.md) で説明されているように、`vtuber-behavior-engine` は以下の役割を担います:

1.  LLM と ADK を活用して、文脈に沿った対話を生成します。ADK の機能により、複数のエージェントやツールを連携させる可能性があります。
2.  生成された対話や入力に基づいて感情を分析し、感情ラベル (例: `happy`, `sad`) とその強度を付与します。専用の ADK エージェント/ツールを使用する可能性があります。
3.  対話履歴やキャラクターの状態などのコンテキストを管理し、一貫性を保ちます。ADK がセッション管理メカニズムを提供する可能性があります。
4.  (潜在的) ADK/MCP を介して外部ツール (例: Web 検索、カスタム Python 関数) を利用し、より高度な応答やアクションを生成します。
5.  生成された応答 (対話テキスト、感情ラベル) を MCP を介して `stage-director` に返します。

## 機能

- **対話生成:** LLM を利用した自然で文脈に沿った会話。
- **感情分析:** テキストから感情を推定しラベリング。
- **コンテキスト管理:** 対話履歴とキャラクター状態の維持。
- **ADK 統合:** Google ADK を活用したエージェント、ツール、オーケストレーション機能。
- **音声認識ツール:** LLM がツール呼び出しでユーザー発話を取得できる機能。
- **(潜在的) ツール利用:** 外部 API やカスタムツールとの連携。

## 技術スタック

- Python 3.11+
- Google Agent Development Kit (ADK)
- 大規模言語モデル (LLM) クライアント (例: `google-generativeai`)
- (オプション) 感情分析ライブラリ (例: `transformers`)

## 前提条件

- Python >= 3.11
- `uv`

## インストール

1.  **`uv` を使用して仮想環境を作成します:**

    ```bash
    uv venv
    source .venv/bin/activate # Linux/macOS
    # または
    .venv/Scripts/activate # Windows
    ```

2.  **`uv` を使用して依存関係をインストールします:**
    ```bash
    uv sync --extra dev
    ```

## 環境変数の設定

`.env_sample` を `.env` にコピーし、必要な環境変数を設定します。

## サービスの実行

```bash
uv run python src/vtuber_behavior_engine/main.py
```

### ADK Web を使った実行

adk web を使用して、Web UI からエージェントを操作することもできます。

```bash
adk web --port=8090 src/vtuber_behavior_engine
```

1. http://localhost:8090/ にアクセスして、ADK Web UI を開きます。
2. 左上で利用する Agent を選択

- `news_agent` を選択。
  - 最初の発話として`[AIタレントへの指示] まずは挨拶から始めて、"会話のコンテキスト"に自然に話の流れを変えてください。`を入力
- `presentation_agent` を選択。
  - 最初の発話として`Start`を入力

## Presentation について

- `resources/presentation/slides` に AI に与えるための作成済みのプレゼン資料(JSON)があります。
- 現状では、読み込むプレゼンは`resources.py`や`presentation_context_agent.py`でハードコードされています。
- `resources/presentation/create_presentation_slides_json_template.md` のプロンプト使うことで
  LLM を使って自分の好きなプレゼン資料を作成できます。
- Gemini 2.5 Pro のような頭のよい reasoning 対応のモデルでプレゼン資料を作ることをお勧めします。

## 音声認識ツール (SpeechRecognitionTool)

`SpeechRecognitionTool` は、LLM がツール呼び出しでユーザーの音声発話をリアルタイムに取得できる機能を提供します。

### 使い方

```python
from vtuber_behavior_engine.services import SpeechRecognitionTool
from google.adk.agents import LlmAgent

# ツールを作成
speech_tool = SpeechRecognitionTool()

# 音声認識を開始（バックグラウンドで実行）
speech_tool.start_recognition()

# エージェントにツールを登録
agent = LlmAgent(
    model="gemini-2.0-flash-exp",
    system_instruction="定期的に get_user_speech ツールでユーザー発話を確認してください。",
    tools=[speech_tool],
)

# エージェント実行
response = await agent.run(user_message="発話をチェックしてください")

# 終了時に停止
speech_tool.stop_recognition()
```

### 前提条件

- Google Cloud Speech-to-Text API の認証情報が必要です
- 環境変数 `GOOGLE_APPLICATION_CREDENTIALS` にサービスアカウントキーのパスを設定してください
- マイク入力が利用可能である必要があります

### サンプルコード

詳細な使用例は `examples/speech_recognition_tool_example.py` を参照してください。

```bash
uv run python examples/speech_recognition_tool_example.py
```

## 開発

このプロジェクトでは、コードの品質を確保するためにいくつかのツールを使用しています:

- **フォーマット:** `black`
- **リンティング:** `flake8`
- **型チェック:** `mypy`
- **テスト:** `pytest`

これらのツールは、次のようなコマンドで実行できます:

```bash
black .
flake8 .
mypy .
pytest
```

具体的な設定については `pyproject.toml` を参照してください。

## ライセンス

このプロジェクトは MIT ライセンスの下でライセンスされています - 詳細はメインの [LICENSE](../../LICENSE) ファイルを参照してください。
