# Plan Agent 作成プロンプトの作成

**日時:** 2025 年 11 月 27 日  
**目的:** プロジェクト特化の Plan Agent を作成するためのカスタムプロンプト（`.prompt.md`）を作成する

---

## 概要

VS Code 標準の Plan Agent をベースに、このプロジェクト（AI V-Tuber System）に特化した実装計画エージェントを作成するためのプロンプトファイルを作成した。計画のファイル化を必須とし、チームでのレビュー・共有を容易にする設計とした。

---

## 対話の流れ

### 1. 最初の依頼

ユーザーの依頼内容:

- 実装計画を作成するためのカスタムエージェントを作成するための**プロンプト**を作成
- VS Code 公式ドキュメントを fetch して最新情報を確認
- VS Code 標準の Plan Agent（`Plan.agent.md`）を参照（ユーザー指定）
- 標準 Plan Agent をベースにプロジェクト独自情報を追加
- 計画のファイル化を必須（チームレビューのため）
- `docs/workflow/*` を確認して Plan に必要な要素を洗い出す

**Copilot の応答:**

- VS Code 公式ドキュメント（custom-agents, prompt-files）を fetch
- `docs/workflow/` 配下のファイルを読み込み（workflow.md, deliverables.md, feature_task_details.md, glossary.md, ticket_templates/）
- VS Code 標準の Plan.agent.md ファイルの提供を依頼

### 2. VS Code 標準 Plan Agent の提供

ユーザーが `~/.vscode/extensions/github.copilot-chat-*/assets/agents/Plan.agent.md` を添付。

**Copilot の応答（誤り）:**

- 直接 `.github/agents/Plan.agent.md` を作成してしまった
- 本来は「プロンプトファイル（`.prompt.md`）」を作成すべきだった

### 3. 指摘と修正

ユーザーからの指摘:

> 「実装計画を作成するためのカスタムエージェントを作成するためのプロンプトを作成してください」があなたへの命令です。

**Copilot の応答:**

- 誤って作成した `Plan.agent.md` を削除
- 正しく `.github/prompts/create-plan-agent.prompt.md` を作成

---

## 重要なポイント

- **コンテキストの与え方:** `create-custom-prompt.prompt.md` をプロンプトインストラクションとして添付し、作成ガイドラインを提供
- **効果的だった指示:**
  - 公式ドキュメントの fetch を必須とする指示
  - 標準 Plan Agent の参照を明示
  - 計画ファイル化の理由（チームレビュー）を明記
- **改善点:**
  - 「プロンプトを作成」vs「エージェントを作成」の違いを最初から明確に理解すべきだった
  - メタ的な依頼（「〜を作成するためのプロンプトを作成」）は注意深く読む必要がある

---

## 成果物

### 作成されたファイル

`.github/prompts/create-plan-agent.prompt.md`

### プロンプトの主な機能

| ステップ | 内容                                             |
| -------- | ------------------------------------------------ |
| 1        | VS Code 公式ドキュメントを fetch                 |
| 2        | VS Code 標準の Plan.agent.md を参照              |
| 3        | docs/workflow/\* から Plan 要素を洗い出し        |
| 4        | プロジェクト固有情報を追加した Plan Agent を作成 |
| 5        | `.github/agents/Plan.agent.md` に出力            |

### プロンプト設定

```yaml
agent: agent # ファイル作成が必要なため
tools: ["search", "fetch", "createFile"]
```

---

## 学んだこと・Tips

- **メタレベルの依頼に注意**: 「X を作成するための Y を作成」という依頼では、最終成果物が Y であることを見落としやすい
- **VS Code カスタムエージェントの構造**:
  - `.agent.md`: カスタムエージェント定義
  - `.prompt.md`: 再利用可能なプロンプト定義
  - エージェントは tools と handoffs を持ち、特定の役割に特化
- **Plan Agent のベストプラクティス**:
  - 読み取り専用ツールのみ使用（実装を防ぐ）
  - handoffs で次のアクションへスムーズに移行
  - 計画はファイル化してチームでレビュー可能に

---

## タグ

`#VSCode` `#CustomAgent` `#Prompt` `#PlanAgent` `#AI-Tuber-System` `#Workflow`
