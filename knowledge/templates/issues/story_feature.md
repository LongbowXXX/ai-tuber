# ストーリー: [Feature Name]

## 1. 概要

**目的**: [機能とその価値を簡潔に記述]
**オーナー**: @[Assignee]

## 2. 作業分解構造（WBS）

対応する子タスク Issue を作成したら、項目をチェックしてください。

### 1. 要件フェーズ

- [ ] 要件定義タスク（`task_requirement.md`）
  - **成果物**: `docs/specs/[FeatureName]/requirements.md`
  - **完了条件**: 要件がプロダクトオーナーに承認されている。
- [ ] 完了条件 定義タスク（`task_define_exit_criteria.md`）
  - **成果物**: 完了条件ドキュメント

### 2. 設計フェーズ

- [ ] 設計議論タスク（`task_design.md`）
  - **成果物**: `docs/specs/[FeatureName]/design.md`
  - **成果物**: `docs/specs/[FeatureName]/implementation_plan.md`
  - **チェック**: サニティチェックリスト更新（`task_update_sanity_checklist.md`）
  - **チェック**: テスト仕様作成（`task_create_test_spec.md`）
  - **完了条件**: 設計がアーキテクトに承認されている。

### 3. 実装フェーズ

- [ ] 実装タスク（`task_implementation.md`）
  - **成果物**: Pull Request（マージ済み）
  - **成果物**: `src/` と `tests/` が更新されている。

### 4. 検証フェーズ

- [ ] テストケース作成（設計/実装の一部）
  - **成果物**: `docs/specs/[FeatureName]/test-specs/`
- [ ] サニティテストタスク（`task_test_sanity.md`）
  - **成果物**: サニティチェック結果
- [ ] 機能テストタスク（`task_test_functional.md`）
  - **成果物**: テスト実行結果

### 5. 完了条件と完了

- [ ] 完了条件 確認タスク（`task_verify_exit_criteria.md`）
  - **チェック**: 重大なバグがすべて修正されている。
  - **チェック**: ドキュメントがすべて更新されている。
