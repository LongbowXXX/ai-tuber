# Simulation-Based Verification（視点取得とエビデンス）

## 問題

AI に単に「整合性をチェックして」「ドキュメントをレビューして」と頼むだけでは、表面的なパターンマッチに終わりがちです。深い論理的な欠落を見逃す可能性があります。さらに、明示的なエビデンスログがなければ、ユーザーは AI が実際に _何_ を確認したのかを簡単に検証できず、要約を盲信するか冗長な内部思考ログを読むしかなくなります。

## 解決策

特定の **視点（Perspective）**（例:「新しく参加した開発者」）から、特定のシナリオを **シミュレーション（Simulate）** し、各チェックについて **エビデンス（Record Evidence）** を記録するよう AI に指示します。「メンタル・ウォークスルー（Mental Walkthrough）」をステップバイステップで実行させます。各ステップで、**入力（Input）**（見つけたもの）、**判定（Verdict）**（Pass/Fail）、**根拠（Evidence）**（具体的なファイル/行、またはロジック）を最終出力に明示的に記録させます。

## 実装手順

1.  **視点を定義する**: AI が誰をシミュレーションするのかを明示します（例:「あなたはチームに参加した新しい開発者である」）。
2.  **シナリオを定義する**: シミュレーションする論理フローを定義します（例:「新機能を追加する」）。
3.  **エビデンス記録を義務化する**: 「Checked: OK」ではなく、最終レポートに _何_ をチェックしたか（例:「ファイル X を確認し、Y を発見した」）を書き出すよう明示的に指示します。
4.  **段階的検証**: 手順を列挙させ、各手順で Input / Process / Output を確認させます。

## テンプレ例

```markdown
## Simulation: New Feature Implementation

**新しい開発者（New Developer）** として「メンタル・ウォークスルー（Mental Walkthrough）」を実行します。
各ステップについて、レポートに **エビデンス（Evidence）** として発見事項を MUST で記録してください:

1.  **Requirement Definition**

    - **Simulation**: I am looking for the requirement template.
    - **Check**: Is the output template and save path defined?
    - **Evidence**:
      - Found template in `requirements.prompt.md` at line 15. (✅ PASS)
      - Save path is defined as `docs/specs/`. (✅ PASS)

2.  **Architectural Design**
    - **Simulation**: I am trying to run the design skill using the requirement doc.
    - **Check**: Does the skill explicitly reference the Requirement Document as input?
    - **Evidence**:
      - `design.prompt.md` references `{{requirements_files}}` variable. Linkage is valid. (✅ PASS)

**Report**: 各出力テンプレートとディレクトリが定義されていることを確認してください。すべてのチェックについて具体的なエビデンスを記録してください。
```

## 利点

- **高再現率（High Recall）**: 静的分析が見逃すロジックの穴を見つけます。
- **ユーザー共感（User Empathy）**: プロセス上の「摩擦」やフラストレーションポイントを特定します。
- **監査可能性（Auditability）**: ユーザーはエビデンスログを読むことで AI の作業を検証でき、高い認知負荷なしに信頼を構築できます。
