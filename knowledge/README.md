# ナレッジテンプレート

このディレクトリは、[標準ワークフロー](./workflows/workflow.md) における利用方法に基づいてテンプレートを分類します。

## ディレクトリ構成

### 1. [Issue テンプレート](./templates/issues/)

**プロセス管理**（GitHub Issues）のためのテンプレートです。
本プロジェクトでは **Story（親）** - **Task（子）** の階層を使用します。

#### Story テンプレート（親）

- `story_feature.md`: 機能追加/変更。
- `story_release.md`: リリースプロセス。
- `story_bug_fix.md`: バグ修正。

#### Task テンプレート（子）

- `task_requirement.md`: 要件定義。
- `task_design.md`: 設計ディスカッション。
- `task_implementation.md`: 実装 & PR。
- `task_test_sanity.md`: サニティテスト報告。
- `task_test_functional.md`: 機能テスト報告。
- `task_verify_exit_criteria.md`: 最終完了条件チェック。

### 2. プロダクトテンプレート

永続的な成果物とエージェント出力のためのテンプレートです。

#### [Artifacts](./templates/artifacts/)

リポジトリ内の永続ファイル（`docs/`）です。

- **場所**: `knowledge/templates/artifacts/`
- **例**:
  - `specification.template.md`
  - `design.template.md`

#### [Agents](./templates/agents/)

エージェントによって生成される一時的なレポートや計画です。

- **場所**: `knowledge/templates/agents/`
- **例**:
  - `bug_fix_plan.template.md`: @Debugger によって生成。
  - `review_report.template.md`: @QualityGuard によって生成。

### 3. [ガイドライン](./guidelines/)

本プロジェクトにおける **「どのように作業するか」** を定義するガイドとルールです。
品質、レビュー、AI 協働の標準については、これらのドキュメントを参照してください。

- **場所**: `knowledge/guidelines/`
- **主要ドキュメント**:
  - `adoption-guide.md`: Terraformer をプロジェクトに導入する方法。
  - `debugging.md`: デバッグのための科学的方法。
  - `pr-creation-guidelines.md`: Pull Request 提出の標準。
  - `software-review.md`: コードレビューのチェック観点。
  - `specification-guidelines.md`: 曖昧さのない仕様の書き方。
