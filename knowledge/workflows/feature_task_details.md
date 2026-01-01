[← ワークフローへ戻る](./workflow.md)

# 機能タスク詳細

## タスクリスト

1. [要件定義](#1-requirement-definition)
2. [仕様作成と合意](#2-spec-creation--agreement)
3. [完了条件の定義](#3-define-exit-criteria)
4. [設計](#4-design)
5. [サニティチェックリスト更新](#5-update-sanity-checklist)
6. [テスト仕様の作成](#6-create-test-spec)
7. [実装とテスト](#7-implementation--tests)
8. [サニティテスト実施](#8-run-sanity-tests)
9. [機能確認の実施](#9-run-feature-check)
10. [完了条件の検証](#10-verify-exit-criteria)

---

<a id="1-requirement-definition"></a>

### 1. 要件定義

**成果物**: 要件定義（Issue）、要件ドキュメント（Git）

**目的**: なぜ行うのか（WHY）と、どの問題を解決するのか（WHAT）を明確にします。

**作業内容**:

- 背景と目的を定義する。
- ユーザーストーリーを特定する。
- 受け入れ基準を定義する。
- **テンプレート**: [要件定義タスク](../templates/issues/task_requirement.md)

**チェックポイント**:

- [ ] [要件定義タスク](../templates/issues/task_requirement.md) を使って検証する。

---

<a id="2-spec-creation--agreement"></a>

### 2. 仕様作成と合意

**成果物**: 更新済み仕様（Git）

**目的**: 機能の要件を明確化し、チーム内の共通理解を形成します。

**作業内容**:

- 機能の目的と背景を明確化する。
- ユーザーストーリーと要件を特定する。
- 仕様を作成/更新する。
  - **テンプレート**: [仕様テンプレート](../templates/artifacts/specification.template.md)
- プロダクトオーナーと合意する。
- 仕様を Git で管理する。

**チェックポイント**:

- [ ] [仕様テンプレート](../templates/artifacts/specification.template.md) を使って検証する。
- [ ] 署名（Sign-off）基準は Issue テンプレートを参照する。

---

<a id="3-define-exit-criteria"></a>

### 3. 完了条件の定義

**成果物**: 完了条件ドキュメント（Issue/プロジェクト管理ツール）

- **テンプレート**: [完了条件の定義](../templates/issues/task_define_exit_criteria.md)

**目的**: ストーリー完了の基準を明確化し、品質を担保します。

**作業内容**:

- 仕様に基づいて完了基準を定義する。
- 検証項目を列挙する。
- 完了条件ドキュメントを作成する。

**チェックポイント**:

- [ ] [完了条件の定義](../templates/issues/task_define_exit_criteria.md) を使って検証する。

<a id="4-design"></a>

### 4. 設計

**成果物**: 更新済み設計ドキュメント（Git）

**目的**: 実装方針を明確化し、品質と保守性を担保します。

**作業内容**:

- 仕様に基づく技術設計。
- アーキテクチャ設計。
- インターフェース設計。
- データモデル設計。
- 設計レビュー。
- チーム合意。
- **テンプレート**: [設計テンプレート](../templates/artifacts/design.template.md)

**重要事項**:

- 仕様に曖昧さや欠陥がある場合、**推測せず必ず確認**する。
- 仕様改訂やドキュメント改善が必要なら、**チケットを作成**する。

**チェックポイント**:

- [ ] [設計テンプレート](../templates/artifacts/design.template.md) を使って検証する。
- [ ] レビュー基準は Issue テンプレートを参照する。

---

<a id="5-update-sanity-checklist"></a>

### 5. サニティチェックリスト更新

**成果物**: 更新済みサニティテスト項目

**目的**: リリース前にシステム全体の確認を簡単に行えるよう、チェックリストを最新に保ちます。

**作業内容**:

- 仕様/設計に基づき、チェック項目を追加/更新する。
- 既存項目を見直す（不要項目の削除、内容修正）。
- チェックリストファイルを更新する。
  - **ファイル**: `docs/tests/sanity.md`
  - **Issue テンプレート**: [サニティチェックリスト更新](../templates/issues/task_update_sanity_checklist.md)
- Git にコミットする。

**チェックポイント**:

- [ ] [サニティチェックリスト更新](../templates/issues/task_update_sanity_checklist.md) を使って検証する。

---

<a id="6-create-test-spec"></a>

### 6. テスト仕様の作成

**成果物**: 機能実装の検証項目（Issue）

**目的**: 機能実装の完了を判断する基準を明確化します。

**作業内容**:

- 仕様/設計に基づいてチェック項目を作る。
  - **テンプレート**: [テスト仕様](../templates/artifacts/test_spec.template.md)
  - **Issue テンプレート**: [テスト仕様作成](../templates/issues/task_create_test_spec.md)
- 正常/異常系のテストケースを定義する。
- 境界値テストを定義する。

**チェックポイント**:

- [ ] [テスト仕様作成](../templates/issues/task_create_test_spec.md) を使って検証する。

---

<a id="7-implementation--tests"></a>

### 7. 実装とテスト

**成果物**: ソースコード、テストコード（Git）

**目的**: 設計に基づいて機能を実装し、品質を担保します。

**作業内容**:

- 設計に基づいた実装。
- ユニットテストの作成。
  - **テンプレート**: [実装タスク](../templates/issues/task_implementation.md)
- コードレビュー。
- 継続的インテグレーション。

**実装の原則**:

- **分量が大きい場合**: 適切にチケットを分割する。
- **チケット分割**: まず骨組み（スケルトン）クラスの導入を検討する。
- **破壊的変更**: フィーチャーブランチを作る（main ブランチを壊れた状態で放置しない）。

**チェックポイント**:

- [ ] [実装タスク](../templates/issues/task_implementation.md) を使って検証する。

---

<a id="8-run-sanity-tests"></a>

### 8. サニティテスト実施

**成果物**: サニティテスト結果（Issue）

**目的**: 回帰がないことを確認するため、システム全体の簡易チェックを行います。

**作業内容**:

- 更新済みサニティチェックリストに基づく動作確認。
  - **チェックリスト**: `docs/tests/sanity.md`
- 結果を記録する（チケットコメント）。
  - **テンプレート**: [サニティテストタスク](../templates/issues/task_test_sanity.md)

**チェックポイント**:

- [ ] [サニティテストタスク](../templates/issues/task_test_sanity.md) を使って検証する。

---

<a id="9-run-feature-check"></a>

### 9. 機能確認の実施

**成果物**: 機能実装の検証結果（Issue）

**目的**: 機能実装の完了を確認します。

**作業内容**:

- 作成したチェック項目に基づく動作確認。
- 結果を記録する（チケットコメント）。
  - **テンプレート**: [機能テストタスク](../templates/issues/task_test_functional.md)

**チェックポイント**:

- [ ] [機能テストタスク](../templates/issues/task_test_functional.md) を使って検証する。

---

<a id="10-verify-exit-criteria"></a>

### 10. 完了条件の検証

**成果物**: プロジェクト管理ツール上の検証記録

**目的**: ストーリーが完了基準を満たしていることを確認します。

**作業内容**:

- 完了条件ドキュメントに基づく最終確認。
  - **テンプレート**: [完了条件の検証](../templates/issues/task_verify_exit_criteria.md)
- すべての成果物の検証。
- 確認結果をチケットのコメントとして記録する。

**チェックポイント**:

- [ ] [完了条件の検証](../templates/issues/task_verify_exit_criteria.md) を使って検証する。
