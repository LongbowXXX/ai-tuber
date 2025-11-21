<!-- このドキュメントは .github/prompts/document-project.prompt.md によって生成・更新されています -->

# 技術スタックと依存関係

## 主要な技術スタック

### 言語

- **Python**: 3.11 以上
  - 型ヒント: `|` 型結合演算子（Python 3.10+）
  - `asyncio`: 非同期プログラミング

### フレームワーク

- **Google ADK (Agent Development Kit)**: v1.17.0+
  - マルチエージェントフレームワーク
  - セッション管理、メモリサービス、ツール統合
- **Pydantic**: v2.x
  - データバリデーション、構造化出力

### データベース

- **Chroma**: v1.2.2+
  - ベクトルデータベース
  - ローカル永続化（`%APPDATA%/vtuber-behavior-engine/db`）

### API・クライアント

- **Google Cloud Speech API**: v2.34.0+
  - リアルタイム音声認識
- **Gemini API**: v1.46.0+ (`google-genai`)
  - LLM（`gemini-2.5-flash`）
  - 埋め込み生成（`GoogleGenerativeAiEmbeddingFunction`）
- **MCP (Model Context Protocol)**: v1.19.0+
  - Stage Director との通信

## 主要な依存ライブラリ

### コア依存

| ライブラリ                 | バージョン | 用途                                 |
| -------------------------- | ---------- | ------------------------------------ |
| `google-adk`               | >=1.17.0   | マルチエージェントフレームワーク     |
| `google-genai`             | >=1.46.0   | Gemini API クライアント              |
| `google-cloud-speech`      | >=2.34.0   | Google Cloud Speech API クライアント |
| `mcp[cli]`                 | >=1.19.0   | Model Context Protocol クライアント  |
| `chromadb`                 | >=1.2.2    | ベクトルデータベース                 |
| `google-generativeai`      | >=0.8.5    | Gemini 埋め込み関数                  |
| `python-dotenv`            | >=1.2.1    | 環境変数管理                         |
| `pyaudio`                  | >=0.2.14   | 音声入力（音声認識用）               |
| `litellm`                  | >=1.79.0   | LLM プロキシ                         |
| `google-api-python-client` | >=2.185.0  | Google API クライアント              |
| `google-auth-oauthlib`     | >=1.2.2    | OAuth 認証                           |
| `google-auth-httplib2`     | >=0.2.0    | HTTP 認証                            |
| `wheel`                    | >=0.45.1   | パッケージビルド                     |
| `setuptools`               | >=80.9.0   | パッケージビルド                     |

### 開発依存（`[dev]`）

| ライブラリ              | バージョン | 用途                 |
| ----------------------- | ---------- | -------------------- |
| `black`                 | >=24.10.0  | コードフォーマッター |
| `flake8`                | >=7.1.1    | リンター             |
| `flake8-copyright`      | >=0.2.4    | 著作権表記チェック   |
| `mypy`                  | >=1.11.2   | 静的型チェッカー     |
| `pytest`                | >=8.3.3    | テストフレームワーク |
| `pytest-asyncio`        | >=0.24.0   | 非同期テスト         |
| `pytest-cov`            | >=5.0.0    | カバレッジ測定       |
| `pytest-html`           | >=4.1.1    | HTML テストレポート  |
| `respx`                 | >=0.21.1   | HTTP モック          |
| `sphinx`                | ==8.1.3    | ドキュメント生成     |
| `sphinx-rtd-theme`      | ==3.0.1    | Sphinx テーマ        |
| `myst-parser`           | ==4.0.0    | Markdown パーサー    |
| `sphinxcontrib-mermaid` | ==1.0.0    | Mermaid 図のサポート |
| `types-requests`        | >=2.28.0   | requests 型ヒント    |

## 外部サービスとの連携

### 1. Stage Director (MCP Server)

- **プロトコル**: Model Context Protocol (SSE)
- **接続先**: `STAGE_DIRECTOR_MCP_SERVER_URL` 環境変数で指定
- **提供ツール**:
  - `speak`: キャラクターの発話（音声合成、字幕表示、感情表現）
  - `display_markdown_text`: 画面へのオーバーレイ表示
  - `trigger_animation`: キャラクターのポーズ変更

**設定例**:

```env
STAGE_DIRECTOR_MCP_SERVER_URL=http://localhost:3000/sse
```

### 2. Google Cloud Speech API

- **認証**: `GOOGLE_APPLICATION_CREDENTIALS` 環境変数でサービスアカウントキーを指定
- **機能**: ストリーミング音声認識（リアルタイム文字起こし）
- **言語**: 日本語 (`ja-JP`)

**設定例**:

```env
GOOGLE_APPLICATION_CREDENTIALS=path/to/service_account.json
```

### 3. Gemini API

- **認証**: `GOOGLE_API_KEY` 環境変数で API キーを指定
- **モデル**:
  - `gemini-2.5-flash`: エージェント思考用（高速）
  - `gemini-2.0-flash-exp`: 出力用（現在はコメントアウト）
- **埋め込み**: `GoogleGenerativeAiEmbeddingFunction` でベクトル生成

**設定例**:

```env
GOOGLE_API_KEY=your_gemini_api_key
```

### 4. ニュースソース (RSS)

- **プロバイダー**: Google News RSS
- **テンプレート**: `NEWS_BASE_URL` 環境変数で指定
- **例**: `https://news.google.com/rss/search?q={topic}&hl=ja&gl=JP&ceid=JP:ja`

**設定例**:

```env
NEWS_BASE_URL=https://news.google.com/rss/search?q={topic}&hl=ja&gl=JP&ceid=JP:ja
```

## 開発ツール

### パッケージマネージャー

- **uv**: 高速 Python パッケージマネージャー
  - `uv venv`: 仮想環境作成
  - `uv sync --extra dev`: 依存関係インストール

### ビルドツール

- **setuptools**: パッケージビルド
- **wheel**: パッケージ配布形式

### テストフレームワーク

- **pytest**: ユニットテスト、統合テスト
- **pytest-asyncio**: 非同期テスト
- **pytest-cov**: カバレッジ測定（目標: 80%以上）

### CI/CD

- 現状は未設定（今後 GitHub Actions を検討）

### IDE・エディタ

- **VS Code**: 推奨エディタ
  - GitHub Copilot 統合
  - `.github/copilot-instructions.md` でプロジェクト固有のガイドを提供

## ADK の主要コンポーネント

### 1. Agent Types

- **LlmAgent**: LLM をベースにしたエージェント
- **SequentialAgent**: サブエージェントを順次実行
- **LoopAgent**: サブエージェントを反復実行

### 2. Callback Hooks

- **before_model_callback**: LLM 呼び出し前に実行
  - 例: ユーザー発話を取得（`get_user_speech`）
- **after_model_callback**: LLM 呼び出し後に実行
  - 例: 画面表示テキストをクリア
- **after_agent_callback**: エージェント終了後に実行
  - 例: Stage Director の発話完了を待機

### 3. State Management

- **CallbackContext.state**: 共有ステート辞書
  - `STATE_CONVERSATION_CONTEXT`: 現在の話題
  - `STATE_CONVERSATION_RECALL`: 想起した過去の会話
  - `STATE_AGENT_SPEECH_character1`: キャラクター 1 の発話データ
  - `STATE_DISPLAY_MARKDOWN_TEXT`: 画面表示テキスト

### 4. Tools

- **BaseTool**: カスタムツールの基底クラス
  - 例: `SpeechRecognitionTool`
- **McpToolset**: MCP プロトコルのツールセット
  - Stage Director のツールを LLM から呼び出し可能にする

### 5. Memory Service

- **BaseMemoryService**: メモリサービスの基底クラス
  - `add_session_to_memory()`: セッションを保存
  - `search_memory()`: ベクトル検索
- カスタム実装: `ChromaMemoryService`

### 6. Session Service

- **InMemorySessionService**: インメモリセッション管理
  - `create_session()`: 新規セッション作成
  - `get_session()`: セッション取得
  - `update_session()`: セッション更新

### 7. Artifact Service

- **InMemoryArtifactService**: インメモリアーティファクト管理
  - 現状はほぼ未使用

## 環境変数一覧

| 変数名                           | 必須 | 説明                          | 例                                             |
| -------------------------------- | ---- | ----------------------------- | ---------------------------------------------- |
| `GOOGLE_API_KEY`                 | ✅   | Gemini API キー               | `AIzaSy...`                                    |
| `GOOGLE_APPLICATION_CREDENTIALS` | ✅   | Google Cloud 認証情報パス     | `path/to/service_account.json`                 |
| `STAGE_DIRECTOR_MCP_SERVER_URL`  | ✅   | Stage Director の MCP URL     | `http://localhost:3000/sse`                    |
| `NEWS_BASE_URL`                  | ⚠️   | ニュース RSS テンプレート URL | `https://news.google.com/rss/search?q={topic}` |

⚠️ = ニュースステージ使用時のみ必須

## ファイルパス・データ保存先

| パス                                          | 説明                         |
| --------------------------------------------- | ---------------------------- |
| `%APPDATA%/vtuber-behavior-engine/db/`        | Chroma DB 永続化ディレクトリ |
| `logs/app_<date>.log`                         | アプリケーションログ         |
| `.env`                                        | 環境変数設定ファイル         |
| `stage_agents/resources/`                     | プロンプトテンプレート       |
| `stage_agents/resources/presentation/slides/` | プレゼンテーションスライド   |

## バージョン互換性

### Python バージョン

- **最小**: 3.11
- **推奨**: 3.11 または 3.12
- **非対応**: 3.10 以下（`|` 型結合演算子を使用）

### Google ADK バージョン

- **最小**: 1.17.0
- **推奨**: 最新版（破壊的変更に注意）

### Gemini モデル

- **現在使用**: `gemini-2.5-flash`
- **代替**: `gemini-2.0-flash-exp`, `gemini-2.5-flash-preview-04-17`
- 設定: `stage_agents/agent_constants.py` の `AGENT_LLM_MODEL`, `OUTPUT_LLM_MODEL`

## インストール手順

### 1. Python 環境

```powershell
# Python 3.11+ がインストールされていることを確認
python --version
```

### 2. uv のインストール

```powershell
# uv をインストール（公式サイトから）
# https://github.com/astral-sh/uv
```

### 3. 仮想環境の作成

```powershell
cd vtuber-behavior-engine
uv venv
.\.venv\Scripts\Activate.ps1  # Windows PowerShell
```

### 4. 依存関係のインストール

```powershell
uv sync --extra dev
```

### 5. 環境変数の設定

```powershell
cp .env_sample .env
# .env を編集して必要な API キーを設定
```

### 6. Google Cloud 認証

```powershell
# サービスアカウントキーをダウンロードし、パスを環境変数に設定
$env:GOOGLE_APPLICATION_CREDENTIALS = "path\to\service_account.json"
```

### 7. Stage Director の起動

別のターミナルで Stage Director サーバーを起動しておく必要があります。

### 8. 実行

```powershell
uv run python src/vtuber_behavior_engine/main.py
```

## トラブルシューティング

### 依存関係エラー

```powershell
# キャッシュをクリアして再インストール
uv cache clean
uv sync --extra dev --reinstall
```

### pyaudio インストールエラー（Windows）

PyAudio のインストールに失敗する場合は、事前ビルド済みの wheel をインストール：

```powershell
# Python 3.11 の場合
pip install https://download.lfd.uci.edu/pythonlibs/archived/PyAudio-0.2.11-cp311-cp311-win_amd64.whl
```

### Chroma DB エラー

データベースが壊れた場合は削除して再作成：

```powershell
Remove-Item -Recurse -Force "$env:APPDATA\vtuber-behavior-engine\db"
```

### MCP 接続エラー

Stage Director が起動しているか確認：

```powershell
curl http://localhost:3000/sse
```
