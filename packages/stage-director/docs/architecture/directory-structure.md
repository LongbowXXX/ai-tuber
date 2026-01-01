# ディレクトリ構造

```
[Project Root]/
├── .github/            # GitHub 設定 (ワークフロー、プロンプト等)
├── docs/               # アーキテクチャ、ルール、フロー等の詳細ドキュメント
│   ├── architecture/   # システム設計、技術スタック、ディレクトリ構造
│   └── rules/          # コーディング規約、テスト戦略
├── knowledge/          # 開発ガイドライン、テンプレート、ナレッジベース
│   ├── guidelines/     # 各種ガイドライン (PR, デバッグ, プロンプト等)
│   └── templates/      # ドキュメントやコードのテンプレート
├── src/
│   └── stage_director/ # ソースコード
│       ├── __init__.py
│       ├── command_queue.py            # コマンドのキューイングと同期制御
│       ├── main.py                     # エントリーポイント (全サーバー起動)
│       ├── models.py                   # Pydantic データモデル
│       ├── stage_director_mcp_server.py # MCP サーバー実装
│       ├── stage_director_server.py    # FastAPI/WebSocket サーバー実装
│       └── websocket_handler.py        # WebSocket 通信ハンドラ
├── tests/              # テストコード
│   └── tests_stage_director/
└── pyproject.toml      # プロジェクト設定と依存関係
```

## 主要ディレクトリの役割

| ディレクトリ | 役割 |
| :--- | :--- |
| `src/stage_director` | Stage Director のコアロジック。MCP と WebSocket の両方を管理。 |
| `docs/` | プロジェクトの永続的なドキュメント。アーキテクチャやルールを定義。 |
| `knowledge/` | 開発プロセスを円滑にするためのナレッジ。ガイドラインやベストプラクティス。 |
| `tests/` | 単体テストおよび統合テスト。 |
