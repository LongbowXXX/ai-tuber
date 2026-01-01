# ストーリー: [バグ名] の修正

## 1. 問題

**説明**: [バグの簡潔な説明]
**Issue ID**: #[IssueNumber]

## 2. バグ修正 WBS

### 1. 分析と再現

- [ ] バグ修正計画の作成（`knowledge/templates/agents/bug_fix_plan.template.md`）
  - **成果物**: `docs/specs/fixes/[IssueID]/fix-plan.md`

### 2. 実装

- [ ] 実装タスク（`task_implementation.md`）
  - **成果物**: 修正 + 回帰テストを含む PR。
- [ ] 横展開（Yokoten）
  - **確認**: コードベース内で類似バグを検索する。

### 3. 検証

- [ ] 検証タスク（`task_test_functional.md`）
  - **確認**: バグ再現（fail） -> 修正適用 -> バグ解消（pass）。
  - **確認**: 副作用がない。

### 4. 完了

- [ ] 修正をマージする。
- [ ] このストーリーをクローズする。
