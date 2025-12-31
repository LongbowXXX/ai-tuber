# 最新仕様のための Knowledge Retrieval（知識取得）

## 問題

Copilot の学習データにはカットオフがあるため、VS Code Copilot で利用可能な最新機能・ファイル構造・ツール（例: 新しいプロンプトファイル形式、新しいチャットツール）を知らない可能性があります。

## 解決策

生成タスクを行う前に、プロンプトの冒頭で公式 URL から最新ドキュメントを取得するよう Copilot に明示的に指示します。

## 実装手順

1.  **重要 URL を特定する**:
    プロンプトに関連する仕様（例: プロンプトファイル、カスタムエージェント、ツール）を含むドキュメントページを特定します。

2.  **前提セクションを追加する**:
    Copilot にこれらの URL を読ませるためのセクション（例:「PREREQUISITE: Knowledge Retrieval」）を追加します。

## テンプレ例

```markdown
## 🚨 PREREQUISITE: Knowledge Retrieval

**Before generating or updating, you MUST:**

1.  **Fetch Latest Docs**:
    - `https://code.visualstudio.com/docs/copilot/customization/prompt-files` (for prompt file structure).
    - `https://code.visualstudio.com/docs/copilot/reference/copilot-vscode-features#_chat-tools` (for available tools).
    - `https://code.visualstudio.com/docs/copilot/customization/custom-agents` (for custom agent structure).
```

## 利点

- **正確性（Accuracy）**: 生成ファイルが最新のスキーマ/標準に準拠することを保証します。
- **能力（Capability）**: モデルが本来知らない可能性のある最新ツール/機能を利用できるようにします。
