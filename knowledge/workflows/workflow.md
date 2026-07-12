# ワークフロー（AI 協働モデル）

これは、AI と人間エンジニアが協働するための新しいワークフローです。
各フェーズにおいて、AI は「提案」「ドラフト作成」「実装」「検証」などの作業を担い、人間は「意思決定」「レビュー」「最終承認」に集中します。

## 概要

### 概念

- **Issue 上のプロセス**: 議論の記録、意思決定プロセス、検討事項は GitHub Issues に残します。
- **Git 上の成果物**: 仕様、設計、コード、テスト結果などの最終成果物は Git リポジトリで管理します。
- **Spec Kit による仕様管理**: 仕様・実装計画・タスク分解は Spec Kit（`/speckit-specify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`）で `specs/[NNN-feature]/` 配下に作成します（`spec.md`, `plan.md`, `tasks.md`）。
- **パートナーとしての AI**: AI は単なるツールではなく、ペアプログラミングの相棒として振る舞います。

## フェーズ定義

```mermaid
graph TD
  Start([開始]) --> Req
  Req["1. 要件フェーズ"] --> Design
  Design["2. 設計フェーズ"] --> Impl
  Impl["3. 実装フェーズ"] --> Verify
  Verify["4. 検証フェーズ"] --> Release
  Release["5. リリースフェーズ"] --> End

  Verify -.->|バグ修正| Impl
  Impl -.->|仕様変更| Design
  End([終了])
```

### 0. Issue 報告

**目的**: 問題の報告、機能要望、質問の起票によってワークフローを開始します。

- **主要成果物**:
  - [バグ報告](../templates/issues/report_bug.md) -> **バグ修正ストーリー**を開始
  - [機能要望](../templates/issues/report_feature.md) -> **機能ストーリー**を開始
  - [質問](../templates/issues/report_question.md) -> **タスク**（例: ドキュメント更新）を開始する場合があります

### 1. 要件フェーズ

**目的**: なぜこれを行うのか（WHY）と、どの問題を解決するのか（WHAT）を明確にします。

- **AI の役割**: **@BusinessAnalyst**（スキル: `/requirements`）
  - 要件整理、不明点の抽出、類似機能の調査、ユーザーストーリーのドラフト作成。
- **人間の役割**: 要件提示、スコープ定義、ビジネス価値の判断。
- **主要成果物**:
  - [要件定義タスク](../templates/issues/task_requirement.md)（目的、コンテキスト、スコープ、完了条件）
  - **成果物**: `specs/[NNN-feature]/spec.md`（Spec Kit の feature spec。`/speckit-specify` で作成）

### 2. 設計フェーズ

**目的**: どう実現するか（HOW）を具体化し、手戻りを防ぎます。

- **AI の役割**: **@Architect**（スキル: `/design`）
  - 仕様のドラフト作成、アーキテクチャ提案、インターフェース定義。
- **人間の役割**: 設計判断、セキュリティリスク評価、仕様承認。
- **主要成果物**:
  - [設計議論タスク](../templates/issues/task_design.md)
  - **成果物**: `specs/[NNN-feature]/plan.md`（実装計画。`/speckit-plan` で作成）
  - **成果物**: `specs/[NNN-feature]/tasks.md`（タスク分解。`/speckit-tasks` で作成）

### 3. 実装フェーズ

**目的**: 設計どおりに動作するコードを作成します。

- **AI の役割**:
  - **@Developer**（スキル: `/implement`）
    - 実装、ユニットテスト作成、ドキュメント更新、コミットメッセージのドラフト。
  - **@Gardener**（スキル: `/refactor`）
    - 挙動を変えずに構造を改善する、安全なリファクタリング。
- **人間の役割**: コードレビュー、複雑ロジックの補助、AI の指揮。
- **主要成果物**:
  - ソースコード、テストコード（Git）
  - Pull Request（Git）
  - [実装タスク](../templates/issues/task_implementation.md)

### 4. 検証フェーズ（QA）

**目的**: 品質を担保し、リリース可否を判断します。

- **AI の役割**:
  - **@QualityGuard**（スキル: `/test-spec`、`/audit`、`/sanity-test`）
    - テスト仕様の作成。
  - **@Debugger**（スキル: `/debug`）
    - 検証中に見つかったバグの分析と修正提案。
    - **参照**: [デバッグガイドライン](../guidelines/debugging.md)
  - テストケース実行の補助、バグの特定、修正提案。
- **人間の役割**: 探索的テスト、ユーザビリティ確認、リリース判断。
- **主要成果物**:
  - **成果物**: `specs/[NNN-feature]/checklists/*.md`（検証チェックリスト。`/speckit-checklist` で作成）
  - **成果物**: バグ修正計画（Issue コメント。[bug_fix_plan.template.md](../templates/agents/bug_fix_plan.template.md) を使用）
  - [サニティテスト結果](../templates/issues/task_test_sanity.md)
  - [機能テスト結果](../templates/issues/task_test_functional.md)
  - [完了条件チェックタスク](../templates/issues/task_verify_exit_criteria.md)

### 5. リリースフェーズ

**目的**: ユーザーに価値を届けます。

- **AI の役割**: **@Librarian**（スキル: `/release-new-version`）
  - CHANGELOG 生成、リリースノート作成、タグ付けの自動化。
- **人間の役割**: 最終承認、リリース実行（または承認）。
- **主要成果物**:
  - リリースノート（GitHub Releases）
  - タグ（Git）

## 作業分解構造（WBS）

高品質を担保するため、実行は具体的な「ストーリー」構造に従います。

### 機能ストーリー

独立した機能ごとに 1 ストーリーとします。依存がある場合は、ストーリー境界の再検討を行ってください。

```mermaid
graph TD
  Start([開始]) --> T0
  T0["1. 要件定義<br/>📄 Issue（要件）"] --> T1
  T1["2. 仕様作成と合意<br/>📄 Git（仕様）"] --> T2
    T1 --> T3
  T2["3. 完了条件の定義<br/>📋 Issue（完了条件）"] --> T10
  T3["4. 設計<br/>📐 Git（ドキュメント）"] --> T4
    T3 --> T5
    T5 --> T6
  T4["5. サニティチェックリスト更新<br/>📋 Git（サニティ）"] --> T7
  T5["6. テスト仕様の作成<br/>✓ Git（テスト仕様）"] --> T8
  T6["7. 実装とテスト<br/>💻 Git（コード）"] --> T7
    T6 --> T8
  T7["8. サニティテスト実施<br/>📊 Issue（結果）"] --> T10
  T8["9. 機能確認の実施<br/>📊 Issue（結果）"] --> T10
  T10["10. 完了条件の検証<br/>✅ Issue（記録）"] --> End
  End([完了])

    classDef startEnd fill:#e1f5e1,stroke:#4caf50,stroke-width:2px,color:#000
    classDef task fill:#e3f2fd,stroke:#2196f3,stroke-width:2px,color:#000
    classDef check fill:#fff3e0,stroke:#ff9800,stroke-width:2px,color:#000

    class Start,End startEnd
    class T0,T1,T2,T3,T4,T5,T6 task
    class T7,T8,T10 check
```

**凡例**:

- 🟢 緑: 開始/終了
- 🔵 青: タスク（成果物の作成）
- 🟠 オレンジ: 検証/チェックタスク

**詳細手順**: [機能タスク詳細](./feature_task_details.md) を参照してください。

### バグ修正ストーリー

バグ修正では「再現」と「再発防止」を重視します。

```mermaid
graph TD
  Start([開始]) --> T1
  T1["1. 分析と計画<br/>📄 Issue（コメント）"] --> T2
  T2["2. 再現テストの作成<br/>💻 Git（テスト）"] --> T3
  T3["3. 修正の実装<br/>💻 Git（コード）"] --> T4
  T4["4. 修正確認（テスト）<br/>📊 Issue（結果）"] --> T5
    T4 --> T6
  T5["5. 副作用確認<br/>👀 Issue（結果）"] --> T7
  T6["6. ドキュメント更新<br/>📚 Git（ドキュメント）"] --> T7
  T7["7. 完了条件の検証<br/>✅ Issue（記録）"] --> End
  End([解決])

    classDef startEnd fill:#e1f5e1,stroke:#4caf50,stroke-width:2px,color:#000
    classDef task fill:#e3f2fd,stroke:#2196f3,stroke-width:2px,color:#000
    classDef check fill:#fff3e0,stroke:#ff9800,stroke-width:2px,color:#000

    class Start,End startEnd
    class T1,T2,T3,T6 task
    class T4,T5,T7 check
```

**凡例**:

- 🟢 緑: 開始/終了
- 🔵 青: タスク
- 🟠 オレンジ: 検証

**詳細手順**: [バグ修正タスク詳細](./bug_fix_task_details.md) を参照してください。

### リリースストーリー

アプリケーションをリリースするための専用ストーリーを作成します。

```mermaid
graph TD
  Start([開始]) --> T1
  Features[機能ストーリー完了] --> T2

  T1["1. バージョンとタグ名の合意<br/>📄 Issue（仕様）"] --> T6
    T1 --> T7
  T2["2. 関連修正の確認<br/>📋 Issue（記録）"] --> T3
  T3["3. サニティテスト実施<br/>🧪 Issue（結果）"] --> T4
    T3 --> T5
  T4["4. 脆弱性チェック<br/>🔒 Issue（結果）"] --> T9
  T5["5. 静的解析<br/>🔍 Issue（結果）"] --> T9
  T6["6. ドキュメント更新<br/>📚 Git（ドキュメント）"] --> T9
  T7["7. ライセンスチェック<br/>⚖️ Issue/Git（記録）"] --> T9
  T8["8. リリースチェックリスト作成<br/>✓ Issue（チェックリスト）"] --> T9
    Features --> T8
    T8 --> T10
  T9["9. プレリリースチェック実行<br/>📊 Issue（結果）"] --> T11
  T10["10. 完了条件の定義<br/>📋 Issue（完了条件）"] --> T12
  T11["11. リリース実行<br/>🚀 Git（タグ／成果物）"] --> T12
  T12["12. 完了条件の検証<br/>✅ Issue（記録）"] --> End
  End([リリース完了])

    classDef startEnd fill:#e1f5e1,stroke:#4caf50,stroke-width:2px,color:#000
    classDef prereq fill:#f3e5f5,stroke:#9c27b0,stroke-width:2px,color:#000
    classDef task fill:#e3f2fd,stroke:#2196f3,stroke-width:2px,color:#000
    classDef check fill:#fff3e0,stroke:#ff9800,stroke-width:2px,color:#000
    classDef release fill:#ffebee,stroke:#f44336,stroke-width:2px,color:#000

    class Start,End startEnd
    class Features prereq
    class T1,T6,T8,T10 task
    class T2,T3,T4,T5,T7,T9,T12 check
    class T11 release
```

**凡例**:

- 🟢 緑: 開始/終了
- 🟣 紫: 前提条件
- 🔵 青: タスク
- 🟠 オレンジ: 検証
- 🔴 赤: リリース条件

**詳細手順**: [リリースタスク詳細](./release_task_details.md) を参照してください。

## 関連ドキュメント

- [成果物一覧](./deliverables.md)
- [テンプレート一覧](../templates/)
