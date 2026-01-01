# VTuber Behavior Engine

AI V-Tuber システムの頭脳となる AI コア。Google ADK (Agent Development Kit) をベースにしたマルチエージェントシステムで、対話生成、感情分析、コンテキスト管理を行います。

## 概要

`vtuber-behavior-engine` は、複数の専門エージェントが協調して動作する AI システムです。
MCP (Model Context Protocol) Client として `stage-director` に接続し、生成した対話やアクションを実際のキャラクター動作（発話、アニメーション、表示）として実行します。

## アーキテクチャにおける役割

メインの [アーキテクチャ概要](../../docs/architecture/overview.md) で説明されているように、`vtuber-behavior-engine` は以下の役割を担います:

1. **マルチエージェントシステム**: 役割の異なる複数のエージェント（キャラクター、ニュース、プレゼンテーションなど）を協調動作させます。
2. **MCP Client**: `stage-director` の MCP Server に接続し、以下のツールを使用してキャラクターを制御します。
   - `speak`: 発話と感情表現
   - `trigger_animation`: ポーズ変更
   - `display_markdown_text`: 情報表示
3. **音声認識統合**: Google Cloud Speech API を使用してユーザーの発話を取得し、対話に反映させます。
4. **コンテキスト管理**: 会話の流れやキャラクターの状態を維持します。

## エージェント構成

- **Character Agent**: キャラクターの性格（ペルソナ）に基づいた対話を生成します。
- **News Agent**: ニュース記事に基づいた解説や議論を行います。
- **Presentation Agent**: スライド資料に基づいたプレゼンテーションを行います。
- **Conversation Context Agent**: 会話の文脈を管理し、適切なトピックを提供します。

## 技術スタック

- Python 3.11+
- **Google ADK**: マルチエージェントフレームワーク
- **google-genai**: Gemini API クライアント
- **google-cloud-speech**: 音声認識
- **mcp**: Model Context Protocol クライアント
- **chromadb**: ベクトルデータベース（コンテキスト検索用）

## 前提条件

- Python >= 3.11
- `uv` (パッケージマネージャー)
- Google Cloud Project (Gemini API, Cloud Speech API)

## インストール

1. **`uv` を使用して仮想環境を作成します:**

   ```bash
   uv venv
   # Windows
   .venv\Scripts\activate
   # Linux/macOS
   source .venv/bin/activate
   ```

2. **依存関係をインストールします:**

   ```bash
   uv sync --extra dev
   ```

## 環境変数の設定

`.env_sample` を `.env` にコピーし、必要な環境変数を設定します。

```env
GOOGLE_API_KEY=your_gemini_api_key
GOOGLE_APPLICATION_CREDENTIALS=path/to/service_account.json
STAGE_DIRECTOR_MCP_HOST=localhost
STAGE_DIRECTOR_MCP_PORT=8080
```

## サービスの実行

### スタンドアロン実行

メインスクリプトを実行すると、設定されたエージェント（デフォルトは News Agent）が起動します。

```bash
uv run python src/vtuber_behavior_engine/main.py
```

### ADK Web UI での実行

ADK Web UI を使用して、ブラウザからエージェントをデバッグ・操作できます。

```bash
adk web --port=8090 src/vtuber_behavior_engine
```

1. `http://localhost:8090/` にアクセス
2. 左上のメニューからエージェントを選択（例: `news_agent`, `presentation_agent`）
3. チャット欄に開始トリガーを入力
   - **News Agent**: `[AIタレントへの指示] まずは挨拶から始めて...`
   - **Presentation Agent**: `Start`

## プレゼンテーション機能

- `resources/presentation/slides` にある JSON ファイルをスライドとして読み込みます。
- `resources/presentation/create_presentation_slides_json_template.md` のプロンプトを使用して、LLM で新しいスライド JSON を生成できます。

## 開発

コード品質ツール:

```bash
# フォーマット
uv run black .

# リンティング
uv run flake8

# 型チェック
uv run mypy .

# テスト
uv run pytest
```

## ライセンス

MIT License - [LICENSE](../../LICENSE)
