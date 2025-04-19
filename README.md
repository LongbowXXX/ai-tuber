# AI V-Tuber System

## 概要 (Overview)

このプロジェクトは、AI（大規模言語モデル）によって制御される複数の V-Tuber キャラクターが対話し、YouTube
などのプラットフォームで配信を行うシステムを構築することを目的としています。話題に応じて画像や Web ページを動的に表示し、OBS
Studio と連携して配信を行います。

### コアコンポーネント:

- `vtuber-behavior-engine`: AI エージェントがキャラクターの対話、感情、行動を生成するバックエンドシステム。
- `stage-director`: `vtuber-behavior-engine` からの指示を解釈し、`vtube-stage` を制御するコマンドに変換・送信する中間サーバー（MCP
  を活用）。
- `vtube-stage`: VRM モデルの描画、アニメーション、表情制御、コンテンツ表示を行うフロントエンド Web アプリケーション。
- OBS Studio 連携: `obs-websocket` を介して配信ソフトウェアを制御。

### AI 駆動開発アプローチ:

このプロジェクトは、AI を開発プロセス全体で最大限に活用することを特徴としています。現在の対話のように、AI
アシスタント（あなたのような存在）を積極的に利用し、以下のような領域で協働します。

- リサーチと計画: 技術調査、フレームワーク比較、ドキュメント構成案の作成、反復計画の策定支援。
- 設計とアーキテクチャ: コンポーネント設計、API 定義、データフローに関する議論と提案。
- コード生成支援: ボイラープレートコードの提案、特定機能の実装パターンの検討、技術的概念の説明。
- ドキュメント作成: README、技術仕様書、用語集などの初期ドラフト生成と構成案作成。
- ブレインストーミングと問題解決: アイデアの壁打ち、技術的課題に対する解決策の探求。
- レビューと改善: 計画書、ドキュメント、設計案に対するフィードバックと改善提案。

AI は開発チームを強化するための強力なツールであり、最終的な意思決定と実装は開発チームが行いますが、プロセス全体を通じて AI
との対話と協力を重視します。

## 主な機能 (Key Features - Planned)

- AI による自然なマルチキャラクター対話生成
- 対話内容に応じた感情表現（VRM BlendShape 制御）
- 話題に関連する画像や Web ページの動的表示
- VRM モデルのアニメーション制御
- OBS Studio との連携によるシーン切り替え、ソース表示/非表示の自動化
- マルチエージェントシステムによる協調動作（舞台制御、キャラクター制御）

## 技術スタック (Tech Stack)

- AI Behavior Engine (`vtuber-behavior-engine`): Python, Google ADK
- Stage Director (`stage-director`): Python, FastAPI
- VTuber Stage (`vtube-stage`): TypeScript, React, Vite, Three.js, @pixiv/three-vrm
- Communication: WebSockets
- Streaming Software: OBS Studio
- OBS Control: obs-websocket

## はじめに (Getting Started)

このプロジェクトはモノレポ構成を採用しており、`packages/` ディレクトリ以下に各コンポーネントが含まれています。

1. リポジトリのクローン:
   ```bash
   git clone https://github.com/LongbowXXX/ai-tuber.git
   cd ai-tuber
   ```
2. 依存関係のインストール:
   各パッケージ (`vtuber-behavior-engine`, `stage-director`, `vtube-stage`) のディレクトリに移動し、それぞれの
   `README.md` またはセットアップ手順に従って依存関係をインストールしてください。
3. 実行:[architecture.md](docs/architecture.md)
   各コンポーネントの実行方法については、それぞれの `README.md` を参照してください。

### 開発プロセス:

このプロジェクトは反復型開発アプローチを採用しています。詳細な開発計画と各イテレーションの目標については、「AI V-Tuber
システム：技術設計と開発に関する調査報告書 (改訂版 v2)」および「反復型開発計画書」を参照してください。

## プロジェクト構成 (Project Structure)

```
/ai-vtuber-system/
├──.github/             # GitHub Actions ワークフロー
├── packages/            # 各コンポーネントのソースコード
│   ├── vtuber-behavior-engine/ # AI制御システム (Python, ADK)
│   ├── stage-director/      # 中間サーバー (Python, FastAPI)
│   └── vtube-stage/         # フロントエンド (TypeScript, React)
├── docs/                # ドキュメント (アーキテクチャ、API仕様など)
├── scripts/             # 補助スクリプト
├──.gitignore
├── README.md            # このファイル
└── LICENSE              # ライセンス情報
```

詳細なアーキテクチャについては `docs/architecture.md` を参照してください。

## ライセンス (License)

このプロジェクトは(MIT LICENSE) の下で公開されています。
