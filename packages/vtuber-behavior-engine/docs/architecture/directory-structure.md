<!-- このドキュメントは .github/prompts/doc-sync.prompt.md によって生成および更新されています -->

# ディレクトリ構造

## フォルダ構成

```text
vtuber-behavior-engine/
├── .github/
│   ├── agents/           # AI エージェントのロール定義 (Agent Mode 用)
│   └── prompts/          # AI エージェントのスキル定義 (Skill 用)
├── docs/                 # プロジェクトドキュメント
├── knowledge/            # ガイドライン、テンプレート、ワークフロー
├── src/
│   └── vtuber_behavior_engine/
│       ├── agent_runner.py    # エージェント実行のメインエントリー
│       ├── main.py            # アプリケーション起動スクリプト
│       ├── news_agent/        # ニュース特化型エージェント
│       ├── presentation_agent/# プレゼン特化型エージェント
│       ├── services/          # 外部連携サービス（音声、MCP、DB等）
│       │   └── memory/        # 記憶管理（ChromaDB）
│       ├── stage_agents/      # エージェントの定義、プロンプト、設定
│       │   ├── news/          # ニュースエージェントのロジック
│       │   ├── presentation/  # プレゼンエージェントのロジック
│       │   └── resources/     # プロンプトテンプレート（Markdown）
│       ├── theater/           # シアター（劇）形式の制御モデル
│       └── utils/             # 共通ユーティリティ（ロガー等）
├── tests/                # テストコード
├── pyproject.toml        # プロジェクト設定と依存関係
└── README.md             # プロジェクト概要
```

## 主要なディレクトリの役割

| ディレクトリ           | 役割                                        | 主要なファイル                                      |
| :--------------------- | :------------------------------------------ | :-------------------------------------------------- |
| `.github/agents`       | AI エージェントのペルソナと権限の定義       | `architect.agent.md`, `developer.agent.md`          |
| `.github/prompts`      | AI エージェントが実行可能なスキルの定義     | `plan.prompt.md`, `implement.prompt.md`             |
| `src/.../services`     | 外部 API やデータベースとのインターフェース | `speech_recognition.py`, `chroma_memory_service.py` |
| `src/.../stage_agents` | エージェントの振る舞いとプロンプトの定義    | `character_agent.py`, `agent_builder.py`            |
| `src/.../resources`    | LLM に与えるプロンプトテンプレート          | `character_prompt.md`, `initial_message.md`         |
| `knowledge`            | 開発プロセスや AI エージェント向けの指示書  | `guidelines/`, `workflows/`                         |
