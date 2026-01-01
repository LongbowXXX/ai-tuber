<!-- This document is generated and updated by .github/prompts/doc-sync.prompt.md -->

# 技術スタック

## コア技術

| カテゴリ       | テクノロジー          | バージョン | 用途                             |
| :------------- | :-------------------- | :--------- | :------------------------------- |
| 言語           | Python                | 3.11+      | メイン開発言語                   |
| フレームワーク | Google ADK            | 1.17.0+    | マルチエージェントフレームワーク |
| AI モデル      | Gemini (Google GenAI) | 最新       | 対話生成、推論                   |
| プロトコル     | MCP                   | 1.19.0+    | 演出エンジンとの通信             |
| データベース   | ChromaDB              | 1.2.2+     | ベクトルデータベース（記憶管理） |

## 外部サービス・API

- **Google Cloud Speech API**: リアルタイム音声認識。
- **Gemini API**: LLM によるコンテンツ生成。

## 開発・ビルドツール

- **uv**: パッケージマネージャーおよび仮想環境管理。
- **setuptools / wheel**: ビルドシステム。
- **dotenv**: 環境変数管理。

## テスト・品質管理

- **pytest**: テストフレームワーク。
- **pytest-asyncio**: 非同期テストのサポート。
- **black**: コードフォーマッター。
- **flake8**: リンター。
- **mypy**: 静的型チェック。
