**プロジェクトドキュメント**

- このプロジェクトには `agents-docs/` ディレクトリに包括的なドキュメントが用意されています。詳細な情報が必要な場合は以下を参照してください：
  - `agents-docs/architecture.md` - システム全体の構成と設計思想、データフロー図
  - `agents-docs/directory-structure.md` - ディレクトリ構造と各モジュールの責務、依存関係
  - `agents-docs/coding-conventions.md` - 設計原則、設計パターン、命名規則、コードスタイル
  - `agents-docs/key-flows.md` - 主要な機能フローのシーケンス図と処理詳細
  - `agents-docs/tech-stack.md` - 技術スタック、依存ライブラリ、外部サービス連携
  - `agents-docs/testing.md` - テスト戦略、実行方法、ベストプラクティス
  - `agents-docs/constraints-and-gotchas.md` - 技術的制約、既知の問題、トラブルシューティング

**プロジェクト範囲**

- `vtuber_behavior_engine` は `stage-director` によって呼び出される ADK 製の頭脳であり、`main.py` では `news_agent.root_agent` を起動してニュース用のパイプラインを立ち上げます。
- `agent_runner.run_agent_standalone` は `google.adk.Runner` をラップし、インメモリのセッション／アーティファクトと `ChromaMemoryService` による永続化をまとめて面倒見ます。
- 他のステージ（presentation／theater）に切り替える場合は、`src/vtuber_behavior_engine/main.py` でインポートしているルートビルダーを差し替えます。
- ログは `utils/logger.setup_logger` 経由でコンソールと `logs/app_<date>.log` に出力されるため、新しいエントリポイントを追加する際もこの仕組みを活かしてください。
- 詳細なアーキテクチャは `agents-docs/architecture.md` と `agents-docs/directory-structure.md` を参照してください。

**エージェント構成**

- `stage_agents/agent_builder.build_root_agent` は `SequentialAgent` を組み立て、初期コンテキスト → 会話ループの順で実行します。
- ループ順序は「リコール → avatar1 思考 → 出力 → avatar2 思考 → 出力 → コンテキスト更新」で固定されているので、サブエージェントを追加する際は状態キーを崩さないようにします。
- キャラクターの思考は `stage_agents/character_agent.create_character_agent` で生成し、出力は Stage Director に渡す前に `AgentSpeech` でバリデーションされます。
- 出力系エージェントは `StageDirectorMCPClient.speak` を呼ぶ前提で動作し、画面表示用テキストは `STATE_DISPLAY_MARKDOWN_TEXT` に入っているものを利用した後クリアします。
- エージェントの詳細な処理フローは `agents-docs/key-flows.md` のシーケンス図を参照してください。

**状態とメモリ**

- 共有ステートキーは `stage_agents/agent_constants.py` にまとまっているので、`STATE_AGENT_SPEECH_BASE` や `STATE_CONVERSATION_CONTEXT` など既存のキーを再利用してください。
- `ConversationRecall` エージェントは履歴を `STATE_CONVERSATION_RECALL` に保存し、必要であれば ADK のメモリツール経由で追加のコンテキストを読み込みます。
- `ChromaMemoryService` は `%APPDATA%/vtuber-behavior-engine/db` 以下にイベントを保存し、埋め込み生成には `GOOGLE_API_KEY` が必要です。
- 新しいメモリを投入する際は既存と同じように `event_filter=lambda event.author in [avatar1, avatar2]` で話者を絞り込みます。

**外部サービス**

- Stage Director への MCP 接続先は `STAGE_DIRECTOR_MCP_SERVER_URL` に設定されるので、起動失敗時は `.env` の値欠如を疑ってください。
- Stage Director は `display_markdown_text`・`speak`・`trigger_animation` を提供します。`StageDirectorMCPClient.load_tools` で一度ツール一覧を取得してから利用します。
- ニュース用コンテキストは `NEWS_BASE_URL` のテンプレート URL から RSS を取得する設計です。例: `https://news.google.com/.../{topic}`。
- プレゼンテーションフローは `stage_agents/resources/presentation/slides` にある JSON を読み込みます。スキーマを変える場合は `presentation_context_agent` も更新してください。
- 外部サービスの詳細は `agents-docs/tech-stack.md` の「外部サービスとの連携」セクションを参照してください。

**開発ワークフロー**

- 依存関係は `uv venv` → `uv sync --extra dev` でセットアップします。必要なシークレットは `.env_sample` を参照してください。
- スタンドアロンのニュースエージェントは `uv run python src/vtuber_behavior_engine/main.py` で実行します。Stage Director サーバーが起動済みであることを確認します。
- 対話的に試す場合は `adk web --port=8090 src/vtuber_behavior_engine` を実行し、UI から `news_agent` や `presentation_agent` を選択します。
- テストは `pytest` で実行します。詳細は `agents-docs/testing.md` を参照してください。
- テストフレームワークは `pytest` を使ってください。
- `uv` で生成した仮想環境を有効化した状態（`.\.venv\Scripts\Activate.ps1` 等）でコマンドを走らせる前提です。未アクティブだと `flake8` などが解決できません。
- トラブルシューティングは `agents-docs/constraints-and-gotchas.md` の「よくあるトラブルと対処法」を参照してください。

**コーディング規約**

- LLM 用プロンプトは `stage_agents/resources/*.md` に配置されています。`{character_id}` などのプレースホルダーは残したまま差し替え箇所を説明します。
- 構造化出力は `AgentSpeech` や `PresentationContext` といった pydantic モデルを使い、`output_schema` で検証を通す方針です。
- 画面表示用オーバーレイは `StageDirectorMCPClient.speak` の前に `STATE_DISPLAY_MARKDOWN_TEXT` に設定し、`after_model_callback` 内で適切にクリアします。
- 新規 ADK エージェントでは `disallow_transfer_*` をデフォルトのまま `True` に保ち、意図的にクロスエージェントの制御移譲を許す場合のみ変更します。
- 詳細な命名規則、設計パターン、コードスタイルは `agents-docs/coding-conventions.md` を参照してください。

**品質管理ツール**

- フォーマッタは `black .`、リンタは `flake8 .`、型チェックは `mypy .` を利用します。各ツールの設定は `pyproject.toml` にまとまっています。
- これらのコマンドも仮想環境をアクティブにした PowerShell などから実行してください。未アクティブの場合は依存パッケージが見つからないエラーになります。
