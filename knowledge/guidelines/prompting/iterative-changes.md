# 影響度の高い設定の反復的変更

## 問題

設定ファイル（例: `.vscode/tasks.json` や `settings.json`）を生成する場合や、拡張機能などのリストを管理する場合に、ファイル全体を一度に生成すると、ユーザーは大きな変更ブロックをレビューする必要があります。これは「情報過多」を招きやすく、ユーザーが提案を部分的に採用したり、正しさを検証したりすることが難しくなります。

## 解決策

**反復的提案ループ（Iterative Proposal Loop）** を採用します。最終ファイルをすぐに生成するのではなく、変更を **1 つずつ**（または小さな論理グループ単位で）提案し、根拠を説明し、次の項目へ進む前にユーザーの確認を求めるようにエージェントへ指示します。

## 実装手順

1.  **ループを定義する**:
    エージェントに、項目を順に処理し、確認のために「STOP」するよう明示的に指示します。

2.  **実行ではなく提案をする**:
    「X を追加しました」ではなく「X を追加することを推奨します。よいですか？」という対話として進めます。

3.  **最終出力はまとめて行う**:
    ユーザーが項目リストを確認した _後_ にのみ、最終ファイル内容を生成します。

## テンプレ例

```markdown
## 2. Iterative Configuration (Loop)

**DO NOT** generate the full file immediately. You must propose items **one at a time** to avoid overwhelming the user.

1.  **Pick an Item**: Select one setting or task to propose.
2.  **Propose**: Ask the user: "I recommend adding [Setting X] because [Reason]. Do you agree?"
3.  **Wait**: Wait for user confirmation.
4.  **Repeat**: Continue to the next item.
```

## 利点

- **認知負荷（Cognitive Load）**: 変更レビューに必要な労力を減らします。
- **選択的採用（Selective Adoption）**: 「これは OK / これは NG」をユーザーが簡単に判断できます。
- **安全性（Safety）**: 「それなり」の AI 生成で複雑な設定を誤って上書きすることを防ぎます。
