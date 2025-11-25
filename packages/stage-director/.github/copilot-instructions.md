**詳細ドキュメント**

詳細な設計・実装情報は `agents-docs/` 配下を参照してください:

- [architecture.md](../agents-docs/architecture.md) - システム概要、コンポーネント図、シーケンス図、設計判断
- [coding-conventions.md](../agents-docs/coding-conventions.md) - 設計原則、命名規則、コードスタイル、ログ規約
- [constraints-and-gotchas.md](../agents-docs/constraints-and-gotchas.md) - パフォーマンス要件、セキュリティ、技術的負債、よくあるトラブル
- [directory-structure.md](../agents-docs/directory-structure.md) - ディレクトリ構造、モジュール間の依存関係
- [key-flows.md](../agents-docs/key-flows.md) - 主要な機能フロー（speak, trigger_animation, display_markdown_text, WebSocket 接続管理）
- [tech-stack.md](../agents-docs/tech-stack.md) - 技術スタック、依存ライブラリ、外部サービス連携
- [testing.md](../agents-docs/testing.md) - テスト戦略、テスト実行方法、カバレッジ目標、ベストプラクティス

---

**プロジェクトマップ**

- `src/stage_director/main.py` は `dotenv` で `.env` を読み込み、FastAPI の WebSocket サーバーと MCP の SSE サーバーを `asyncio.gather` で同時起動します。両方とも常時稼働のバックグラウンドサービスとして扱います。
- `src/stage_director/stage_director_server.py` は FastAPI アプリを提供し `/ws` を登録します。`uvicorn.Config` を環境変数ベースのホスト／ポートで組み立て、`reload` は True 固定です。
- `src/stage_director/websocket_handler.py` はクライアントを受け付け、キューに積まれたコマンドを送信し、`speakEnd` の ACK を処理します。双方向通信を追加する際はこのフローを再利用します。
- `src/stage_director/command_queue.py` は共有の `asyncio.Queue` とコマンドごとの `asyncio.Event` を提供します。新しいキューを作らずここを拡張してください。

**コマンドモデル**

- コマンドスキーマは `src/stage_director/models.py` にまとまっています（Pydantic モデルと `StageCommand` の Union）。新しいコマンド型を出す前にこのファイルを拡張します。
- 送信時は `create_command_json` でシリアライズします。ペイロードのキーは `vtube-stage` との契約どおり camelCase を維持します。
- `speak` コマンドは `speakId` の相関が必須です。MCP ツール側で `wait_for_command` を待機し、WebSocket 側で `speakEnd` を受けたら `notify_command_done` を呼ぶパターンを他のブロッキング系コマンドでも踏襲します。
- 新しい MCP ツールは `src/stage_director/stage_director_mcp_server.py` に追加します。`StageCommand` をエンキューし、下流で ACK が返る場合のみ待機し、ロガーはモジュールロガーを使います。

**ランタイムと設定**

- ソケット設定は `.env` の `STAGE_DIRECTOR_HOST`, `STAGE_DIRECTOR_PORT`, `STAGE_DIRECTOR_MCP_HOST`, `STAGE_DIRECTOR_MCP_PORT` で行います。`reload` はコード側で True 固定です。
- `.env` を読むのは `main.py` だけなので、モジュールを直接実行する場合は先に `dotenv.load_dotenv()` を呼びます。
- Web クライアントは `/ws` に接続します。FastAPI で新しい WebSocket を作る場合は `app.add_api_websocket_route` と同じ登録方式に合わせます。
- MCP サーバーはサービス名 `"stage_director"` で `FastMCP.run_sse_async` を実行します。外部エージェントは HTTP ではなく MCP のホスト／ポート経由で見つけます。

**開発ワークフロー**

- 環境管理は `uv` を使用します: `uv venv`, `uv sync --extra dev`, `uv run python src/stage_director/main.py`。
- ツールを直接実行する前に `uv` の仮想環境を有効化します（`source .venv/bin/activate` または `.venv\\Scripts\\activate`）。アクティブ化しない場合は `uv run black .` など `uv run` を前置します。
- Lint／テストコマンドは `pyproject.toml` に合わせて、有効化後（または `uv run` 経由で）`black .`, `flake8`, `mypy .`, `pytest` を使います。
- テストは `tests/tests_stage_director` 配下です。`pytest.ini` が asyncio 用フィクスチャと詳細ログを有効化しているため、非同期テストは関数スコープのループに依存できます。
- ログは `main.py` の `logging.basicConfig(level=logging.INFO)` がデフォルトです。モジュールロガー（`logging.getLogger("stage-director.*")`）を統一的に使います。

**パターンと注意点**

- キュー操作は必ず `await` します。待機漏れがあると WebSocket 送信ループが詰まり、コマンドが滞留します。
- MCP ツールの戻り値は上位呼び出し元にそのまま表示されるため、ユーザーが読めるメッセージにし、失敗時は原因を含めます。
- WebSocket の JSON キーは大文字小文字を区別します（例: `"speakEnd"`）。パースや送信時は既存のケースに合わせます。
- WebSocket ハンドラ内でブロッキング処理を行わず、重い処理はバックグラウンドコルーチンやキューに委譲します。
