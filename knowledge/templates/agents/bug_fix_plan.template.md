# バグ修正計画: [Issue Title]

<!-- この文書は @Debugger により生成されました -->
<!-- See: knowledge/guidelines/debugging.md -->

> **Status**: Draft | Approved | Implemented
> **Author**: @Debugger
> **Date**: {{DATE}}

## 1. 問題の説明

### 症状

- [ユーザーが見える/体験する内容を記述]
- [エラーメッセージやログ断片を含める]

### 影響

- [Low/Medium/High/Critical]
- [ビジネス/技術的影響を記述]

## 2. 手法（科学的方法）

### 観察

- [Fact 1]
- [Fact 2]

### 仮説

- "Because [Constraint X], [Process Y] fails with [Error Z]."

### Experiment (Reproduction)

- **目的**: 「推測」なしで仮説を検証する。
- **方法**: [例: ログ挿入、Sleep の利用、テストケース作成]
- **スクリプト**:

```{{LANGUAGE}}
// Code to reproduce the issue
```

## 3. 根本原因分析

### 診断

- **ファイル**: `[path/to/file]`
- **行**: [Line numbers]
- **ロジック不備**: [なぜコードが失敗しているか（WHY）を説明]

### 影響分析（Do No Harm）

- **依存**: [壊れているコードを呼び出している関数一覧]
- **副作用**: [既存機能を壊すリスク]

## 4. 提案する解決策

### 修正の説明

[問題を修正するアプローチを説明]

### コード変更

```diff
// Show the intended changes
- original_code
+ fixed_code
```

### Horizontal Expansion (Yokoten)

- **パターン**: [悪いコードパターンを記述]
- **検索範囲**: [例: "すべての Controller ファイル"]
- **結果**:
  - [ ] `file_b.ts` に類似バグを発見 -> ここで修正する / Issue #XXX を作成した
  - [ ] 他の該当箇所は見つからなかった。

## 5. 検証計画

### Automated Tests

- [ ] バグをカバーする新規テストケース
- [ ] 回帰テスト（既存スイート）

### Manual Verification

- [ ] [Manual step 1]
- [ ] [Manual step 2]
