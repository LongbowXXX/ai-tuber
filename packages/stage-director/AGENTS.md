# AGENTS.md - Stage Director

> AI V-Tuber システムの舞台監督。MCP サーバーとして AI の指示をレンダリングエンジンへのコマンドに変換します。

このファイルは、このプロジェクトで作業する AI コーディングエージェントのためのコンテキストと指示を提供します。

## 1. エグゼクティブサマリー

**目的**: AI エージェント（Behavior Engine）とレンダリングエンジン（vtube-stage）の仲介を行い、キャラクターの操作を抽象化・制御すること。
**タイプ**: MCP サーバー / WebSocket サーバー
**ステータス**: 開発中 (Alpha)

## 2. アーキテクチャ & 技術スタック

### 主要技術

| カテゴリ       | テクノロジー  | バージョン | 用途                    |
| :------------- | :------------ | :--------- | :---------------------- |
| 言語           | Python        | 3.11+      | メイン開発言語          |
| フレームワーク | FastAPI       | 0.120.0    | WebSocket サーバー      |
| プロトコル     | MCP (FastMCP) | 1.19.0+    | AI エージェントとの通信 |
| バリデーション | Pydantic      | 2.12.3+    | データモデル            |

### アーキテクチャパターン

- **MCP (Model Context Protocol)**: AI エージェントに対して標準化されたインターフェース（ツール）を提供。
- **コマンドキューパターン**: 非同期に発生する AI からの指示をキューイングし、レンダリングエンジンの状態に合わせて順次実行。
- **イベント駆動**: `vtube-stage` からの `speakEnd` イベントをトリガーに次の処理へ移行。

## 3. ディレクトリ構造

```
[Project Root]/
├── docs/               # アーキテクチャ、ルール、フロー等の詳細ドキュメント
├── knowledge/          # 開発ガイドラインやテンプレート
├── src/
│   └── stage_director/ # ソースコード
│       ├── main.py                     # エントリーポイント
│       ├── stage_director_mcp_server.py # MCP サーバー実装
│       ├── stage_director_server.py    # WebSocket サーバー実装
│       ├── websocket_handler.py        # WebSocket 通信
│       ├── command_queue.py            # コマンドキュー管理
│       └── models.py                   # データモデル
└── tests/              # テストコード
```

### 主要ディレクトリ

| ディレクトリ         | 目的                 | 主要ファイル                  |
| :------------------- | :------------------- | :---------------------------- |
| `src/stage_director` | コアビジネスロジック | `main.py`, `command_queue.py` |
| `docs/`              | 詳細ドキュメント     | `architecture/overview.md`    |
| `knowledge/`         | ナレッジベース       | `guidelines/`                 |

## 4. 主要概念 (ユビキタス言語)

| 用語                  | 定義                               | 例                                                                                             |
| :-------------------- | :--------------------------------- | :--------------------------------------------------------------------------------------------- |
| **Stage Director**    | 本システム。AI と舞台の橋渡し役。  | -                                                                                              |
| **vtube-stage**       | リアルタイムレンダリングエンジン。 | -                                                                                              |
| **Speak**             | 発話と口パクを伴うアクション。     | `speak(character_id="default", message="こんにちは", caption="こんにちは", emotion="neutral")` |
| **Trigger Animation** | 特定のアニメーション再生。         | `trigger_animation(character_id="default", animation_name="wave")`                             |

## 5. エントリーポイント

| エントリーポイント | 場所                         | 目的                                      |
| :----------------- | :--------------------------- | :---------------------------------------- |
| メインサーバー     | `src/stage_director/main.py` | アプリケーションの起動（MCP & WebSocket） |

## 6. 開発ルール (憲法要約)

### 🔍 動的コンテキストプロトコル (調査フェーズ)

**全エージェントへの重要指示:**
このファイル (`AGENTS.md`) に提供されているコンテキストは**要約インデックス**です。タスクに必要なすべての詳細は含まれていません。
**タスクを開始する前に、必ず以下の手順を踏んでください:**

1.  **検索**: 利用可能なツールを使用して、ユーザーのリクエストに関連する `docs/` または `knowledge/` 内の特定のドキュメントを**キーワード/正規表現検索**または**セマンティック検索**で探してください。
    - _例_: ユーザーが「テスト」について尋ねた場合、テスト手順に関連するドキュメントを検索して読んでください。
    - _例_: ユーザーが「レビュー」を求めた場合、レビューガイドラインを検索して読んでください。
2.  **リンクをたどる**: `AGENTS.md` は要約インデックスとして機能し、重要なファイルやフォルダへのリンクを提供しているため、詳細情報を得るためにこれらのリンクをたどらなければなりません。
3.  **読み込む**: これらの詳細ドキュメントの内容をコンテキストに読み込んでください。
4.  **相互参照**: 推測に頼らないでください。常に見つかった公式ドキュメントと照らし合わせて確認してください。

### 遵守事項

- 全てのエージェントは情報を収集する際、[**逐次問い合わせ (Sequential Inquiry)**](./knowledge/guidelines/prompting/sequential-inquiry.md) プロトコルに従わなければなりません：質問は一度にまとめてではなく、一つずつ行ってください。
- 非同期処理には `async/await` を使用し、ブロッキング I/O を避けること。
- 全ての公開 API/ツールには型ヒントを付与すること。

### 禁止事項

- `vtube-stage` との通信に WebSocket 以外のプロトコルを直接使用すること。
- `src/stage_director` 以外にビジネスロジックを記述すること。

### 推奨パターン

- 複雑なコマンド生成には Factory パターンを検討すること。
- 状態管理には `command_queue.py` の仕組みを利用すること。

## 7. クイックリファレンス

### 共通コマンド

```bash
# 開発サーバー起動
uv run python src/stage_director/main.py

# テスト実行
uv run pytest

# 型チェック
uv run mypy .
```

### AI エージェント用重要ファイル

| 目的               | ファイル                           |
| :----------------- | :--------------------------------- |
| プロジェクトルール | `.github/copilot-instructions.md`  |
| アーキテクチャ詳細 | `docs/architecture/overview.md`    |
| コーディング規約   | `docs/rules/coding-conventions.md` |

## 8. ドキュメントインデックス

詳細は以下のドキュメントを参照してください：

- [アーキテクチャ概要](docs/architecture/overview.md)
- [ディレクトリ構造](docs/architecture/directory-structure.md)
- [主要フロー](docs/architecture/key-flows.md)
- [技術スタック](docs/architecture/tech-stack.md)
- [制約事項](docs/architecture/constraints.md)
- [コーディング規約](docs/rules/coding-conventions.md)
- [テスト戦略](docs/rules/testing.md)
- [用語集](docs/glossary.md)

## 9. ナレッジベース

→ **詳細**: [knowledge/](./knowledge/)

- [導入ガイド](./knowledge/guidelines/adoption-guide.md)
- [デバッグガイド](./knowledge/guidelines/debugging.md)
- [PR 作成ガイドライン](./knowledge/guidelines/pr-creation-guidelines.md)
- [プロンプトエンジニアリング](./knowledge/guidelines/prompting/)
- [ソフトウェアレビュー](./knowledge/guidelines/software-review.md)
- [仕様策定ガイドライン](./knowledge/guidelines/specification-guidelines.md)
