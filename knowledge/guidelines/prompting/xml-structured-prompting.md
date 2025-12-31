# XML + Markdown 構造化プロンプト ガイド

このガイドは、**XML タグ** と **Markdown** を組み合わせて、機械可読（machine-parseable）かつ人間可読（human-readable）なプロンプトを作る方法を説明します。

## 1. XML + Markdown の力

XML は LLM が得意とする厳格な構造境界を提供し、Markdown は意味（セマンティクス）と可読性を提供します。両者を組み合わせることで、双方の長所を得られます。

### なぜこの組み合わせが機能するのか

1.  **XML が「コンテナ」を定義する**: 情報が _どこに_ あり、_何であるか_ をモデルへ伝えます（例: `<instruction>`, `<context>`）。これにより、コンテキストの混線（context bleeding）を防ぎます。
2.  **Markdown が「内容」を定義する**: 内部のテキストを _どう解釈するか_ をモデルへ伝えます（例: 強調の **太字**、リストの `-`、階層の `###`）。

> **概念**: XML を **封筒（envelope）**、Markdown をその中の **整形済みの手紙（formatted letter）** として捉えてください。

## 2. 利点

- **明確な境界（XML）**: 指示とデータが混同されません。
- **豊かな意味（Markdown）**: 箇条書き、見出し、コードブロックにより、巨大なプレーンテキストの塊にせず複雑な指示を表現できます。
- **二重の可読性**:
  - **AI 向け**: まず XML 構造を解析し、その後に Markdown の意味を処理します。
  - **人間向け**: プロンプトが視覚的に整理され、編集しやすいままです。

## 3. よく使う XML タグ チートシート

| カテゴリ         | タグ                 | 目的                                                       |
| :--------------- | :------------------- | :--------------------------------------------------------- |
| **メタ**         | `<system>`           | システムの絶対ルールと振る舞いを定義する。                 |
|                  | `<role>`             | ペルソナを設定する（例: "Expert Python Dev"）。            |
| **データ**       | `<context>`          | タスクに必要な背景情報。                                   |
|                  | `<documents>`        | 参考資料または検索結果。                                   |
|                  | `<example>`          | モデルを導くための few-shot 例。                           |
| **制御**         | `<instruction>`      | コアとなるタスク命令。                                     |
|                  | `<constraints>`      | 禁止事項（何を _しない_ か）。                             |
| **思考**         | `<thinking>`         | 回答前に「推論」するための領域（Chain of Thought）。       |
| **エージェント** | `<workflow>`         | エージェントが従うべきループや手順を定義する。             |
|                  | `<stopping_rules>`   | 絶対的な安全境界（例: "STOP if you start implementing"）。 |
|                  | `<plan_research>`    | コンテキスト収集/調査フェーズに焦点を当てた指示。          |
|                  | `<plan_style_guide>` | 出力フォーマット（例: plan）の具体的ルール。               |
| **出力**         | `<output>`           | 最終回答のコンテナ。                                       |
| **安全**         | `<uncertainty>`      | ユーザー要求の曖昧さ/不確実さを強調する。                  |
|                  | `<self_check>`       | 高リスク操作向けの強制内省ステップ。                       |

## 4. 実用例: XML + Markdown

Markdown が XML タグ _の内側_ でどのように内容を整理するかを示す標準テンプレートです。

```xml
<system>
    あなたは技術文書の要約を専門とする有能なアシスタントです。
</system>

<context>
    <documents>
        <document index="1">
            ### Spec v1.0
            (Content of the first document...)
        </document>
    </documents>
</context>

<instruction>
    ### タスク
    提供された文書を **3 つの箇条書き** で要約してください。

    ### 手順
    1.  **分析**: `<thinking>` ブロックで主要テーマを探す。
    2.  **下書き**: `<output>` ブロックに要約を書く。
</instruction>

<constraints>
    - **専門用語なし**: 平易な言葉を使う。
    - **長さ**: 各ポイントは 20 語以内にする。
</constraints>
```

**期待される出力:**

```xml
<thinking>
    文書は X、Y、Z について述べている。要点は次のとおり...
</thinking>

<output>
    - ポイント1の要約。
    - ポイント2の要約。
    - ポイント3の要約。
</output>
```

## 5. 現実世界の参照例

本番環境でこれらのタグ（特に agentic タグ）が使われている生きた例として、**VS Code Copilot Plan Agent** を参照してください。

- [Plan.agent.md](https://github.com/microsoft/vscode-copilot-chat/blob/main/assets/agents/Plan.agent.md)

## 6. ハルシネーション防止タグ（GPT-5.2 Techniques）

簡易モデルや複雑コンテキストを用いる高リスクタスクで、ハルシネーションを最小化し信頼性を高めるために、**明示的な不確実性タグ** を使います。

### `<uncertainty_and_ambiguity>`

**目的**: 問題解決を試みる前に、モデルへ「何が分からないか」またはユーザー要求のどこが曖昧かを明示的に列挙させます。

**Usage**:

```xml
<uncertainty_and_ambiguity>
1. ユーザーが X と Y のどちらを望んでいるか不明である。
2. 依存関係のバージョンが指定されていない。
</uncertainty_and_ambiguity>
```

### `<high_risk_self_check>`

**目的**: モデルが自分の直前の出力を攻撃し、欠陥、セキュリティ脆弱性、ロジックエラーを見つけるための専用「Critic」モード。

**Usage**:

```xml
<high_risk_self_check>
1. 直前に生成したコードは SQL インジェクションを導入していないか？ -> CHECK: パラメータ化クエリを使用している。
2. 「フォーマット禁止」ルールに従ったか？ -> FAIL: 太字を追加してしまった。修正する...
</high_risk_self_check>
```
