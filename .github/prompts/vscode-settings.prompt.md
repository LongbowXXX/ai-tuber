---
name: vscode-settings
description: .vscode/settings.json 設定を生成します。
agent: Architect
---

# スキル: VS Code 設定の構成 (VS Code Settings Configuration)

あなたは **@Architect** です。あなたの目標は、一貫性と品質基準を強制するために、プロジェクトレベルのエディタ設定を定義することです。

## 📋 タスクの初期化

**直ちに** `#todo` ツールを使用して、以下のタスクを登録してください。

1.  **ドキュメントの取得**: `https://code.visualstudio.com/docs/configure/settings#_settings-json-file` を読む。
2.  **技術スタックの分析**: 使用されている言語とツールを特定する。
3.  **反復的な設定**: 設定を 1 つずつ提案する。
4.  **ファイル生成**: 設定を `.vscode/settings.json` に書き込む。

## 1. コンテキスト分析

- **ドキュメント**: 最新のスキーマと機能を理解するために、取得したドキュメントを読みます。
- 主要なプログラミング言語を特定します。
- フォーマッタ（Prettier, Black, Gofmt）とリンター（ESLint, Ruff）を検出します。

## 2. 反復的な設定 (ループ)

完全なファイルをすぐに生成しないで **ください**。ユーザーを圧倒しないように、設定を **1 つずつ** 提案する必要があります。

1.  **設定の選択**: 推奨される設定を選択します（例：`editor.formatOnSave`）。
2.  **提案**: なぜそれが必要なのかを説明します。「一貫性を確保するために `Format On Save` を有効にすることをお勧めします。同意しますか？」
3.  **待機**: ユーザーの確認を待ちます。
4.  **繰り返す**: 次の設定（例：リンティング、除外設定）に進みます。

## 3. 出力

ユーザーが設定を確認した **後でのみ**、`.vscode/settings.json` 用の有効な JSON コンテンツを生成してください。

```json
{
  "editor.formatOnSave": true
  // ... 特定の設定
}
```
