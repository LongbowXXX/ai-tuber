# AGENTS.md - VTuber Behavior Engine

> AI V-Tuber システムの対話生成と行動制御を担うマルチエージェント・コア。

このファイルは、このプロジェクトに従事する AI コーディングエージェントのためのコンテキストと指示を提供します。

## 1. エグゼクティブサマリー

**目的**: 複数の専門エージェントを協調させ、キャラクターの性格に基づいた対話、ニュース解説、プレゼンテーションを生成し、演出エンジンを制御すること。
**タイプ**: AI マルチエージェントシステム / MCP クライアント
**ステータス**: 開発中 (Alpha)

## 2. アーキテクチャ & 技術スタック

### コア技術

| カテゴリ       | テクノロジー          | バージョン | 用途                                   |
| :------------- | :-------------------- | :--------- | :------------------------------------- |
| 言語           | Python                | 3.11+      | メイン開発言語                         |
| フレームワーク | Google ADK            | 1.17.0+    | マルチエージェントフレームワーク       |
| AI モデル      | Gemini (Google GenAI) | 最新       | 対話生成、推論                         |
| プロトコル     | MCP                   | 1.19.0+    | 演出エンジン (Stage Director) との通信 |
| データベース   | ChromaDB              | 1.2.2+     | ベクトルデータベース（記憶管理）       |

### アーキテクチャパターン

- **マルチエージェントシステム (ADK)**: 役割の異なるエージェント（Character, News, Presentation 等）が協調して動作。
- **サービスレイヤー**: 外部 API（音声認識、MCP、DB）との通信を抽象化。
- **MCP クライアント/サーバー**: `stage-director` を MCP サーバーとして利用し、ツール経由で演出を実行。

## 3. ディレクトリ構造

```text
vtuber-behavior-engine/
├── docs/                 # プロジェクトドキュメント
├── knowledge/            # ガイドライン、テンプレート、ワークフロー
├── src/
│   └── vtuber_behavior_engine/
│       ├── agent_runner.py    # エージェント実行のメインエントリー
│       ├── main.py            # アプリケーション起動スクリプト
│       ├── news_agent/        # ニュース特化型エージェント
│       ├── presentation_agent/# プレゼン特化型エージェント
│       ├── services/          # 外部連携サービス（音声、MCP、DB等）
│       ├── stage_agents/      # エージェントの定義、プロンプト、設定
│       └── theater/           # シアター形式の制御モデル
└── tests/                # テストコード
```

### 主要なディレクトリ

| ディレクトリ           | 用途                   | 主要なファイル                                      |
| :--------------------- | :--------------------- | :-------------------------------------------------- |
| `src/.../services`     | 外部アダプター         | `speech_recognition.py`, `chroma_memory_service.py` |
| `src/.../stage_agents` | エージェントの振る舞い | `character_agent.py`, `agent_builder.py`            |
| `src/.../resources`    | プロンプトテンプレート | `character_prompt.md`, `initial_message.md`         |

## 4. 主要概念 (ユビキタス言語)

| 用語                | 定義                                                       | 例                         |
| :------------------ | :--------------------------------------------------------- | :------------------------- |
| **Character Agent** | キャラクターの性格（ペルソナ）を体現するエージェント。     | `character_agent.py`       |
| **Stage Director**  | キャラクターの動作（発話、アニメ）を制御する外部システム。 | MCP ツール `speak`         |
| **Memory**          | ChromaDB を使用した会話履歴や知識の保存・検索。            | `chroma_memory_service.py` |

## 5. エントリーポイント

| エントリーポイント | 場所                                         | 用途                             |
| :----------------- | :------------------------------------------- | :------------------------------- |
| メイン             | `src/vtuber_behavior_engine/main.py`         | アプリケーションの起動           |
| エージェント実行   | `src/vtuber_behavior_engine/agent_runner.py` | エージェントのライフサイクル管理 |

## 6. 開発ルール (憲法要約)

### 🔍 動的コンテキストプロトコル (調査フェーズ)

**すべてのエージェントに対する重要な指示:**
このファイル (`AGENTS.md`) に提供されているコンテキストは**要約インデックス**です。タスクに必要なすべての詳細は含まれていません。
**タスクを開始する前に、必ず以下の手順を踏まなければなりません:**

1.  **検索**: 利用可能なツールを使用して、ユーザーのリクエストに関連する `docs/` または `knowledge/` 内の特定のドキュメントを**キーワード/正規表現検索**または**セマンティック検索**で見つけてください。
    - _例_: ユーザーが「テスト」について尋ねた場合、テスト手順に関連するドキュメントを検索して読んでください。
    - _例_: ユーザーが「レビュー」を求めた場合、レビューガイドラインを検索して読んでください。
2.  **リンクを辿る**: `AGENTS.md` は要約インデックスとして機能し、重要なファイルやフォルダへのリンクを提供しているため、詳細情報を得るためにこれらのリンクを辿らなければなりません。
3.  **読み込む**: これらの詳細なドキュメントの内容をコンテキストに読み込んでください。
4.  **相互参照**: 推測に頼らないでください。常に見つかった公式ドキュメントと照らし合わせて確認してください。

### 必須事項

- すべてのエージェントは、情報を収集する際に [**Sequential Inquiry（逐次質問）**](./knowledge/guidelines/prompting/sequential-inquiry.md) プロトコルに従わなければなりません。質問は一括ではなく、1 つずつ行ってください。
- すべての外部サービスアクセスは `services/` レイヤーを介して行うこと。
- プロンプトは `resources/` 内の Markdown ファイルから読み込むこと。

### 禁止事項

- ビジネスロジック内でのプロンプトのハードコード。
- 非同期処理が必要な箇所での同期的な I/O 操作。

### 推奨パターン

- 複雑なエージェントの生成には Factory パターン（`agent_builder.py`）を使用すること。

## 7. クイックリファレンス

### 共通コマンド

```bash
# 開発環境の同期
uv sync

# アプリケーションの実行
uv run python src/vtuber_behavior_engine/main.py

# テストの実行
uv run pytest
```

### AI エージェント向けの重要ファイル

| 用途               | ファイル                           |
| :----------------- | :--------------------------------- |
| プロジェクトルール | `.github/copilot-instructions.md`  |
| アーキテクチャ詳細 | `docs/architecture/overview.md`    |
| コーディング規約   | `docs/rules/coding-conventions.md` |

## 8. ドキュメントインデックス

詳細については、以下のドキュメントを参照してください。

- [アーキテクチャ概要](docs/architecture/overview.md)
- [ディレクトリ構造](docs/architecture/directory-structure.md)
- [技術スタック](docs/architecture/tech-stack.md)
- [主要なフロー](docs/architecture/key-flows.md)
- [制約事項](docs/architecture/constraints.md)
- [コーディング規約](docs/rules/coding-conventions.md)
- [テスト](docs/rules/testing.md)
- [用語集](docs/glossary.md)

## 9. ナレッジベース

→ **詳細**: [knowledge/](./knowledge/)

| トピック           | リンク                                                                                                         |
| :----------------- | :------------------------------------------------------------------------------------------------------------- |
| ガイドライン       | [knowledge/guidelines/](./knowledge/guidelines/)                                                               |
| テンプレート       | [knowledge/templates/](./knowledge/templates/)                                                                 |
| ワークフロー       | [knowledge/workflows/](./knowledge/workflows/)                                                                 |
| 逐次質問プロトコル | [knowledge/guidelines/prompting/sequential-inquiry.md](./knowledge/guidelines/prompting/sequential-inquiry.md) |
