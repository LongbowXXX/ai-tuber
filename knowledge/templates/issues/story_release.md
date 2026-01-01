# ストーリー: リリース v[Version]

## 1. 概要

**目的**: バージョン [Version] を本番へリリースする。
**オーナー**: @[ReliabilityEngineer]

## 2. リリース WBS

### 1. 新バージョンの合意

- [ ] バージョン番号の決定（`task_version_agreement.md`）
- [ ] 予定変更点で `CHANGELOG.md` を更新する。

### 2. プレリリースチェック

- [ ] **マージ確認**: 関連修正の確認（`task_verify_related_fixes.md`）。
- [ ] **サニティ確認**: サニティテスト実施（`task_test_sanity.md`）。
- [ ] **脆弱性確認**: セキュリティ監査実施（`task_vulnerability_check.md`）。
- [ ] **静的解析**: 静的解析の実行（`task_static_analysis.md`）。
- [ ] **ライセンス確認**: ライセンスチェック実施（`task_license_check.md`）。
- [ ] **リリースチェックリスト**: チェックリスト作成（`task_release_checklist.md`）。
- [ ] **完了条件の定義**: 基準の定義（`task_define_exit_criteria.md`）。

### 3. リリース実行

- [ ] リリース実行（`task_release_execution.md`）。
- [ ] GitHub Release を作成する。
- [ ] ドキュメント更新（`task_docs_update.md`）。

### 4. リリース後

- [ ] デプロイを確認する。
- [ ] 完了条件の検証（`task_verify_exit_criteria.md`）。
- [ ] このストーリーをクローズする。
