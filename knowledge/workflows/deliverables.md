# 成果物一覧

[← ワークフローへ戻る](./workflow.md)

このプロジェクトでは、成果物の性質に応じて「GitHub Issues（プロセス／ログ）」と「Git リポジトリ（プロダクト資産）」を厳密に分離します。

## 管理原則

- **Issue**: 「なぜ起きたか」の履歴、議論、暫定チェック結果、作業ログ。（Flow）
- **Git**: 「それが何であるか」の定義、仕様、設計、コード、永続ドキュメント。（Stock）

## 成果物マトリクス

| フェーズ    | 成果物名                 | 場所      | テンプレート                             | 成果物パス（Git）                       | 説明                                                                                |
| :---------- | :----------------------- | :-------- | :--------------------------------------- | :-------------------------------------- | :---------------------------------------------------------------------------------- |
| 1. 要件     | 要件定義                 | Issue     | `issues/task_requirement.md`             | `docs/specs/[Feature]/requirements.md`  | 目的、背景、スコープ、および受け入れ基準の議論／合意。                              |
| 2. 設計     | 設計ディスカッション記録 | Issue     | `issues/task_design.md`                  | -                                       | アーキテクチャ選定、トレードオフ検討、設計レビュー履歴。                            |
|             | 機能仕様                 | Git       | `artifacts/specification.template.md`    | `docs/specs/[Feature]/specification.md` | 合意済みの機能仕様。Issue の議論を反映し、常に最新に保たなければならない。          |
|             | 技術設計                 | Git       | `artifacts/design.template.md`           | `docs/specs/[Feature]/design.md`        | 合意済みのシステム設計、API 定義、DB スキーマ等。                                   |
|             | 機能テスト仕様           | Git       | `artifacts/test_spec.template.md`        | `docs/specs/[Feature]/test-specs/`      | 機能テストケース（手順／期待結果）。`docs/specs/[Feature]/test-specs/` に保存する。 |
| 3. 実装     | ソースコード             | Git       | N/A                                      | `src/`                                  | `src/` 配下のプロダクトコード。                                                     |
|             | テストコード             | Git       | N/A                                      | `tests/`                                | `tests/` 配下の自動テストコード。                                                   |
|             | プルリクエスト           | Git (PR)  | `issues/pull_request.md`                 | -                                       | コード変更提案、レビュー、CI 結果。                                                 |
|             | サニティチェックリスト   | Git       | `artifacts/sanity_checklist.template.md` | `docs/tests/sanity.md`                  | プロジェクト全体のサニティテスト項目マスター一覧。                                  |
| 4. 検証     | サニティテスト結果       | Issue     | `issues/task_test_sanity.md`             | -                                       | Git の一覧に基づき実行した結果。                                                    |
|             | 機能テスト結果           | Issue     | `issues/task_test_functional.md`         | -                                       | Git のテストケースに基づき実行した結果。                                            |
|             | 完了条件チェック         | Issue     | `issues/task_verify_exit_criteria.md`    | -                                       | リリース基準が満たされているかの最終チェック。                                      |
| 5. リリース | リリース合意             | Issue     | `issues/task_version_agreement.md`       | -                                       | バージョン番号とタグ名の合意。                                                      |
|             | 関連修正の確認           | Issue     | `issues/task_verify_related_fixes.md`    | -                                       | 関連修正がすべて含まれていることの確認。                                            |
|             | 脆弱性チェック           | Issue     | `issues/task_vulnerability_check.md`     | -                                       | セキュリティ監査結果。                                                              |
|             | 静的解析結果             | Issue     | `issues/task_static_analysis.md`         | -                                       | 静的解析レポート。                                                                  |
|             | ライセンスチェック結果   | Issue/Git | `issues/task_license_check.md`           | `docs/licenses.md`                      | ライセンス検証レポート。                                                            |
|             | リリースチェックリスト   | Issue     | `issues/task_release_checklist.md`       | -                                       | リリース前の最終チェックリスト実行記録。                                            |
|             | リリースノート           | Git (Rel) | N/A                                      | GitHub Releases                         | バージョンごとの変更サマリー。                                                      |
|             | CHANGELOG.md             | Git       | N/A                                      | `CHANGELOG.md`                          | 履歴ファイル。                                                                      |

## 成果物の永続性

Issue はクローズ後も検索できますが、プロジェクトの「信頼できる唯一の情報源」は常に Git に反映されていなければなりません。
例えば Issue で「仕様変更」が議論された場合、議論は Issue に残りますが、**決定事項は Git 上の仕様（`docs/specs/`）へマージしなければなりません**。
AI はこの「Issue から Git への情報の蒸留」を支援します。
