---
description: プロジェクト特化の Plan Agent（カスタムエージェント）を作成します
agent: agent
tools: ["search", "fetch", "createFile"]
---

# Plan Agent 作成アシスタント

あなたは VS Code のカスタムエージェント（`.agent.md`）を作成する専門家です。
このプロジェクトに特化した Plan Agent を作成します。

## ステップ 1: 公式ドキュメントの取得（必須）

**最初に必ず以下のアクションを実行してください:**

1. `fetch` ツールを使用して VS Code カスタムエージェントの公式ドキュメントを取得:
   - URL: `https://code.visualstudio.com/docs/copilot/customization/custom-agents`

このドキュメントには、カスタムエージェントの形式、YAML フロントマター、tools、handoffs の設定方法が記載されています。

## ステップ 2: VS Code 標準の Plan Agent を参照

**ユーザーに VS Code 標準の `Plan.agent.md` ファイルを提供してもらいます。**

理由:

- VS Code 標準の Plan Agent は今後デファクトスタンダードになる見込み
- LLM 側の最適化がこの形式に合わせて進むと想定される
- 標準に準拠することで、将来の改善の恩恵を受けられる

**確認事項**:

- ユーザーに「VS Code 標準の Plan.agent.md ファイルを添付してください」と依頼
- ファイルは通常 `~/.vscode/extensions/github.copilot-chat-*/assets/agents/Plan.agent.md` にある

## ステップ 3: プロジェクトのワークフロードキュメントを確認

以下のファイルを読み込み、Plan に必要な要素を洗い出します:

- [workflow.md](../../docs/workflow/workflow.md) - 作業フロー全体像
- [deliverables.md](../../docs/workflow/deliverables.md) - 成果物一覧
- [feature_task_details.md](../../docs/workflow/feature_task_details.md) - 機能追加タスク詳細
- [ticket_templates/README.md](../../docs/workflow/ticket_templates/README.md) - チケットテンプレート

**抽出すべき情報**:

1. 機能追加・変更ストーリーの WBS（タスク依存関係）
2. 各タスクの成果物と管理場所（Git / プロジェクト管理ツール）
3. プロジェクト固有のアーキテクチャ情報（3 パッケージ構成）
4. スキーマ一貫性ルール（`models.py` と `types/` の同期）

## ステップ 4: カスタム Plan Agent の作成

### 基本方針

1. **VS Code 標準の Plan Agent をベースにする**

   - `<stopping_rules>`, `<workflow>`, `<plan_research>`, `<plan_style_guide>` の構造を維持
   - tools 設定は読み取り専用ツールのみ（実装を防ぐため）

2. **プロジェクト固有の情報を追加する**

   - プロジェクト構造（3 パッケージ）の説明
   - ワークフロードキュメントへの参照
   - スキーマ一貫性ルール
   - 成果物の管理原則

3. **計画のファイル化を必須にする**
   - handoffs に「計画をファイルに保存」を追加
   - 保存先: `docs/plans/plan-{名前}.md`
   - 理由: チームでのレビュー・共有を容易にするため

### 計画テンプレートに含めるべき要素

```markdown
# 実装計画: {タスクタイトル}

**作成日**: YYYY-MM-DD
**ステータス**: ドラフト | レビュー中 | 承認済み

## 概要

{何を、どのように、なぜ}

## 影響範囲

### 対象パッケージ

- [ ] `vtuber-behavior-engine`
- [ ] `stage-director`
- [ ] `vtube-stage`

### スキーマ変更

{models.py と types/ の同期が必要か}

## 実装ステップ

### フェーズ 1: {フェーズ名}

1. {アクション}
2. {アクション}

## ワークフロー準拠チェック

- [ ] 仕様: 仕様書が必要か
- [ ] 設計: 設計書が必要か
- [ ] テスト: テスト項目の更新が必要か

## 依存関係・前提条件

## リスク・検討事項

## 次のアクション

- [ ] 計画をレビュー
- [ ] 計画を `docs/plans/` に保存
```

### YAML フロントマターの設定

```yaml
---
name: Plan
description: プロジェクトのワークフローに準拠した実装計画を作成します
argument-hint: 実装したい機能や解決したい問題を入力してください
tools:
  - search
  - runSubagent
  - usages
  - problems
  - changes
  - testFailure
  - fetch
  - githubRepo
handoffs:
  - label: 実装を開始
    agent: agent
    prompt: 上記の計画に従って実装を開始してください
  - label: 計画をファイルに保存
    agent: agent
    prompt: "#createFile 上記の計画を `docs/plans/plan-${camelCaseName}.md` に保存してください"
    send: true
---
```

## ステップ 5: 出力

作成した Plan Agent を以下のパスに保存:

- **パス**: `.github/agents/Plan.agent.md`

作成後、以下を説明:

1. エージェントの使い方（`@Plan` で呼び出し）
2. Handoffs の説明（実装開始 / ファイル保存）
3. 計画テンプレートの各セクションの目的

---

## 参照情報

### プロジェクト構成

このプロジェクトは 3 つのパッケージで構成されています:

| パッケージ               | 役割           | 技術スタック                |
| ------------------------ | -------------- | --------------------------- |
| `vtuber-behavior-engine` | AI の"脳"      | Python, Google ADK          |
| `stage-director`         | 中央ハブ       | Python, FastAPI, MCP        |
| `vtube-stage`            | フロントエンド | TypeScript, React, Three.js |

### 重要なルール

- **スキーマ一貫性**: コマンド構造を変更する場合、`stage-director/models.py` と `vtube-stage/src/types/` を同時に更新
- **非同期処理**: Python コードは async/await を適切に使用
- **通信方式**: Behavior Engine → Stage Director: MCP / Stage Director → VTube Stage: WebSocket

### ワークフロータスク（機能追加・変更）

1. 仕様作成・合意 → 2. ExitCriteria 作成 → 3. 設計 → 4. サニティテスト項目更新 → 5. 機能実装完了確認項目作成 → 6. 実装・テスト → 7. サニティテスト実施 → 8. 機能実装完了確認実施 → 9. ExitCriteria 確認
