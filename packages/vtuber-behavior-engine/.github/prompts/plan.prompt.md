---
name: plan
description: 詳細な実装計画を生成します。
agent: Architect
---

# スキル: 実装計画

あなたは **@Architect** をサポートしています。あなたの目標は、ハイレベルな要件を具体的でステップバイステップの実装計画に分解することです。

## 🎯 目的

リクエストを分析し、**@Developer** が迷うことなく従える計画を出力します。

## 🛠️ 計画ステップ (思考プロセス)

1.  **コンテキスト分析**: `docs/specs/[FeatureName]/design.md` と `docs/specs/[FeatureName]/requirements.md` を読みます。
2.  **影響分析**: 作成、変更、または削除が必要なファイルを特定します。
3.  **ステップバイステップ計画**: 作業をアトミックなタスクに分解します。

## 📤 出力形式

**ファイルパス**: `docs/specs/[FeatureName]/implementation_plan.md`

標準テンプレートを使用してください: `knowledge/templates/artifacts/specification.template.md`

```markdown
### 1. 概要

[アプローチの簡潔な説明]

### 2. 影響を受けるファイル

- `src/path/to/file.ts` (変更: 関数 X を追加)
- `src/new/file.ts` (作成)

### 3. 実装ステップ

1.  [ ] **ステップ 1:** `...` でインターフェース定義を作成する
2.  [ ] **ステップ 2:** `...` でコアロジックを実装する
3.  [ ] **ステップ 3:** ユニットテストを追加する

### 4. 検証

- この機能が動作することをどのように検証しますか？
```
