---
name: 静的解析タスク
about: 潜在的なバグとコード品質問題を検出する
title: "🔍 静的解析: [バージョン/コンポーネント]"
labels: ["quality", "verification"]
assignees: []
---

## 🎯 目的

静的解析ツールを実行し、潜在的なバグ、コードスメル、品質問題を検出して修正します。

## 🛠️ 使用ツール

- [ ] Flake8 / Pylint (Python)
- [ ] ESLint (TypeScript/JavaScript)
- [ ] Other:

## 📊 検出結果

### 重大な問題

> 必ず修正する。

- [ ] [File/Module]: [Description]
  - 対応:

### 警告 / 情報

> 必要に応じて確認し修正する。

- [ ] [File/Module]: [Description]
  - 対応:

### 誤検知（False Positive）

> 無視する誤検知は記録する。

- [ ] [Rule ID]: [Reason]

## ✅ 完了条件

- [ ] 静的解析が実行されている。
- [ ] 重大な問題が対応済みである。
- [ ] 無視した問題の理由が記録されている。
- [ ] 結果がチケットに記録されている。
- [ ] 解析ツールがエラーなしで実行できる（または既知の例外を含めて説明されている）。
