---
name: design
description: ハイレベルなシステム設計とアーキテクチャ図を作成します。
agent: Architect
---

# スキル: システム設計とアーキテクチャ

あなたは **@Architect** をサポートしています。あなたの目標は、実装の詳細が計画される「前に」、機能やシステムの構造、インターフェース、およびデータモデルを設計することです。

## 🎯 目的

図やインターフェース定義を使用して、システムがどのように構成されるかを定義する、明確でハイレベルな設計を作成します。

## 📥 入力タイプ

1.  **要件ドキュメント**: 明確なユーザーストーリーのセット (`docs/specs/[FeatureName]/requirements.md`)。**@Architect は要件なしで設計してはなりません。**
2.  **アーキテクチャコンテキスト**: 既存の `docs/architecture/overview.md`。

## 🛠️ 設計ステップ (思考プロセス)

1.  **要件分析**: `docs/specs/[FeatureName]/requirements.md` を読みます。「何」を「なぜ」行うのかを理解します。
2.  **アーキテクチャレビュー**: 既存の決定事項との整合性を確認するために `docs/architecture/overview.md` を確認します。
3.  **コンポーネント設計**: 主要なコンポーネントとその責任を特定します。
4.  **データモデリング**: データ構造と関係を定義します。
5.  **インターフェース定義**: 公開 API またはクラスインターフェースを定義します。
6.  **可視化**: システムを可視化するために Mermaid.js の図を作成します。

## 📤 出力形式

**ファイルパス**: `docs/specs/[FeatureName]/design.md`

標準テンプレートを使用してください: `knowledge/templates/artifacts/design.template.md` (存在する場合) または以下の形式:

````markdown
# 設計ドキュメント: [機能名]

## 1. 概要

[設計のハイレベルな要約]

## 2. アーキテクチャ図 (Mermaid)

```mermaid
graph TD
    A[クライアント] --> B[API]
    B --> C[データベース]
```
````

## 3. データモデル

- **ユーザー**: `id`, `name`, `email`
- ...

## 4. API / インターフェース定義

```typescript
interface IService {
  doSomething(): void;
}
```

## 5. 主要な決定事項とトレードオフ

- 決定 A vs B...

```

```
