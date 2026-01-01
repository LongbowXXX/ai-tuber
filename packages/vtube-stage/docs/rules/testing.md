<!-- This document is generated and updated by .github/prompts/doc-sync.prompt.md -->

# テスト戦略

## テストの種類

現在、このプロジェクトでは以下のテスト方針を採用しています。

- **静的解析 (Linting)**: `eslint` を使用してコードの潜在的な問題を検出します。
- **型チェック**: `tsc` を使用して TypeScript の型整合性を検証します。
- **手動テスト**: 開発サーバーを起動し、`stage-director` からのテストコマンドを送信して動作を確認します。

## 今後の導入予定

- **コンポーネントテスト**: `Vitest` と `React Testing Library` を使用した UI コンポーネントのテスト。
- **3D ロジックテスト**: VRM の表情制御やアニメーション切り替えロジックの単体テスト。
- **E2E テスト**: `Playwright` を使用した、WebSocket 通信を含む一連のフローのテスト。

## テストの実行方法

```bash
# リンターの実行
npm run lint

# 型チェックの実行
npm run build (tsc が実行されます)
```
