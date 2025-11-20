# Stage Director

AI V-Tuber システムの舞台監督（Stage Director）。MCP (Model Context Protocol) サーバーとして機能し、AI エージェントからの指示を `vtube-stage` へのコマンドに変換します。

## 概要

`stage-director` は、AI コア (`vtuber-behavior-engine`) とリアルタイムレンダリングエンジン (`vtube-stage`) の間の仲介役です。
MCP Server としてツールを提供し、AI エージェントがキャラクターの操作（発話、アニメーション、表示）を行えるようにします。また、WebSocket サーバーとして `vtube-stage` と接続し、リアルタイムなコマンド送信と同期制御を行います。

## アーキテクチャにおける役割

メインの [アーキテクチャドキュメント](../../docs/architecture.md) で説明されているように、`stage-director` は以下の役割を担います:

1. **MCP Server**: `vtuber-behavior-engine` に対して、以下のツールを提供します。
   - `speak`: キャラクターの発話と感情表現
   - `trigger_animation`: アニメーション（ポーズ）の再生
   - `display_markdown_text`: Markdown テキストの表示
2. **WebSocket Server**: `vtube-stage` からの接続を受け入れ、コマンドを送信します。
3. **コマンドキューイング**: AI からのツール呼び出しをキューに入れ、順次処理します。
4. **同期制御**: TTS（音声合成）の完了を待機し、AI の発話ペースを制御します。

## 機能

- **MCP ツール提供**: `speak`, `trigger_animation`, `display_markdown_text`
- **WebSocket 通信**: `vtube-stage` への JSON コマンド送信
- **同期制御**: `speakEnd` イベントによる発話完了待機
- **UUID 管理**: 各発話コマンドに一意な ID を付与し、追跡可能にする

## 技術スタック

- Python 3.11+
- **FastAPI**: WebSocket サーバー
- **mcp (FastMCP)**: Model Context Protocol サーバー
- **uvicorn**: ASGI サーバー
- **pydantic**: データバリデーション

## 前提条件

- Python >= 3.11
- `uv` (パッケージマネージャー)

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

## サービスの実行

`stage-director` は、MCP サーバーと WebSocket サーバーの両方を起動します。

```bash
uv run python src/stage_director/main.py
```

- **WebSocket Server**: `ws://127.0.0.1:8000/ws`
- **MCP Server**: `0.0.0.0:8080` (SSE)

## 環境変数

`.env` ファイルで以下の設定が可能です。

```env
STAGE_DIRECTOR_HOST=127.0.0.1
STAGE_DIRECTOR_PORT=8000
STAGE_DIRECTOR_MCP_HOST=0.0.0.0
STAGE_DIRECTOR_MCP_PORT=8080
```

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
