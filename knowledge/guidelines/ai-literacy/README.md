# AI リテラシー: 人間の AI-Ready 度

## 🛑 なぜ重要か？

> **「コードベースが 'AI-Ready' である度合いは、そこで働く人間の 'AI-Ready' 度を超えられない」**

Terraformer プロジェクトは、レガシーコードベースを **AI-Ready** な環境へ変換します。しかし、AI に完璧なコンテキスト（`AGENTS.md`）とツールを提供することは戦いの半分に過ぎません。AI と協働する人間が、AI と効果的にやり取りする方法を知らなければ、潜在能力は失われます。

このドキュメントは **人間のスキルをアップグレード** するためのものです。目的は、**あなた** を「AI-Ready」にし、新しい AI エージェントを効率的にリード/指揮/協働できるようにすることです。

---

## 🧠 レベル 0: マインドセット（継続的進化）

> **「Cook ではなく Chef になれ」**

AI の時代、「コーディング」（構文を書くこと）は玉ねぎを刻むのと同じようにコモディティ化しています。プロのエンジニアとして生き残るには、レシピをなぞる「Cook」から、メニューを設計して価値を生み出す「Chef」へ進化しなければなりません。

- **Cook**: 指示に従い、指定どおりにコードを書く。**AI に置き換え可能**。
- **Chef**: 意図を設計し、AI をオーケストレーションし、品質を検証する。**置き換え困難**。

### The Survival Strategy

技術スキルの半減期は **2.5 年未満** です。業務時間（performance time）の学習だけでは陳腐化します。市場価値を維持するために、業務外の「練習時間」（自己学習）へ投資しなければなりません。

👉 **必読**: [生存戦略: Chef vs Cook](./self-study.md)

---

## 🎯 レベル 1: パラダイムシフト（初心者）

AI を「検索エンジン」や「チャットボット」として扱うのをやめてください。AI は、コードを隅々まで読んでいるが「常識」や「ビジネスコンテキスト」を欠く **ジュニア同僚** として扱います。

### 推奨アクション

1.  **検索するな、聞け**: 特定構文をググる代わりに、あなたの具体的コンテキストに合わせて AI に書かせる。
2.  **委任ロジック**: 「コードを書く」から「コードをレビューする」へシフトする。

- _旧来_: ボイラープレートを書き、ロジックを埋める。
- _新来_: "Generate the boilerplate for a user service in clean architecture," と指示し、その後ロジックを洗練する。

3.  **Why（意図）を説明する**: 要件収集で How だけでなく Why と What を明確化するのと同様に、この文脈を実装者である AI に提供しなければなりません。AI がゴールを理解しなければ、最適な実装を選べません。_(AI にとっての「無能なクライアント」になるな！ 😜)_

---

## 🚀 レベル 2: 指揮の習熟（中級）

慣れてきたら、AI を精密に **指揮** することを学ぶ必要があります。ここで「プロンプトエンジニアリング」（種族間コミュニケーション）が重要になります。

> **💡 Pro Tip**: **SSG フレームワーク（Situation, Source, Goal）** を含む高度なプロンプティング戦略は、[Advanced Strategies](./advanced-strategies.md) を参照してください。

### 1. 指揮の技法（Prompting）

成果は、指示の明確さに比例します。

- **具体化する**: "Make it fast" -> "Optimize for O(n) complexity."
- **ペルソナを与える**: "Act as a Software Architect" と "Act as a Developer" では結果が大きく異なります。（前者は設計パターンやトレードオフ、後者は実装詳細に寄る。）
- **Chain of Thought**: 複雑タスクの誤りを減らすため、AI に "think step-by-step" させる。

👉 **Deep Dive**: 高度な戦略は [Prompting Techniques](../prompting/README.md) を参照。

### 2. コンテキストエンジニアリング（AI に「地図」を渡す）

AI は、チームに **今日** 入った超優秀な新人のようなものです。完璧にコードは書けますが、このプロジェクトについては **何も** 知りません。

- **重要性**: コンテキストがなければ AI は推測します。未採用ライブラリの提案、アーキテクチャ違反、車輪の再発明が起き得ます。
- **Context is King**: 出力品質は、あなたが提供するコンテキストの品質に 100% 依存します。
- **コンテキスト提供方法**:
  - **参照ファイル**: "fix this" だけで頼まない。関連ファイルを開いて AI に「見せる」（または `#Main.ts` のようにタグ付け）
  - **背景情報**: なぜこの作業をしているのか（why）を説明する。"To improve performance" と "To fix a crash" ではコードが変わります。
  - **プロジェクト知識**: このプロジェクトでは `AGENTS.md` と `docs/` で一部コンテキストを自動化しますが、タスク固有の文脈は **あなた** から来る必要があります。
  - **仕組み**: AI が何を見るかを制御するために、[Neighboring Tabs & @workspace vs #file](./context-management.md) の使い方を学ぶ。

### 3. 同僚を理解する（LLM の特性）

効果的にリードするには、チームの強みと弱みを知る必要があります。

- **コンテキストウィンドウ**: 永遠に _すべて_ を覚えているわけではありません。会話が長くなったら重要ルールをリマインドしてください。
- **ハルシネーション**: データベースではなく創造エンジンです。もっともらしいライブラリを捏造することがあります。**必ず検証する。**
- **バイアス**: 学習したパターンを模倣します。あなたが汚いコードを書けば、汚いコードを提案します。

---

## 🛡️ レベル 3: 防御的 AI プログラミング（セキュリティと安全）

AI への信頼が高まるほど、リスクも増します。AI が生成したコードを、どこかのフォーラムで拾ったコードと同程度に疑って扱う必要があります。

> **🛡️ Full Protocol**: 詳細なセキュリティチェックリスト、"Vibe Coding" 防止、slopsquatting 対策ルールは、[Advanced Strategies & Security Protocols](./advanced-strategies.md) を読んでください。

### コア原則: ゼロトラスト

AI の出力はすべて **「信頼できない外部入力（Untrusted External Input）」** として扱います。

- AI が生成したコードはデフォルトで安全ではありません。
- 脆弱性、バグ、微妙な論理エラーが含まれ得ます。
- **ルール**: 読んで理解し、検証していないコードは絶対にコミットしない。

---

## 🛠 プロジェクト推奨ツール

AI-Ready 環境で効果的に作業するため、次を推奨します:

- **GitHub Copilot**: ペアプログラマ。

### 学習リソース（レベルアップ）

- [Microsoft Learn: Copilot Training](https://learn.microsoft.com/en-us/training/browse/?products=ms-copilot)
  - Microsoft Copilot 製品向けの公式トレーニングモジュール。
- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
  - 機能、ガイド、ベストプラクティスを含む公式ドキュメント。
- [VS Code Copilot Overview](https://code.visualstudio.com/docs/copilot/overview)
  - VS Code 内で Copilot を使うための包括的ガイド。
- [Awesome Copilot](https://github.com/github/awesome-copilot)
  - GitHub Copilot の有用リソース/デモ/ツールのキュレーションリスト。
- [AGENTS.md Specification](https://github.com/openai/agents.md)
  - このプロジェクトで使う AI エージェントコンテキスト定義のオープン標準フォーマット。
- [VS Code Repository](https://github.com/microsoft/vscode)
  - VS Code 自体が VS Code と Copilot で開発されています。設定や Copilot プロンプトの良い参考になります。
- [VS Code GitHub Copilot Extension](https://github.com/microsoft/vscode-copilot-chat)
  - VS Code 向け公式 GitHub Copilot Chat 拡張。ソースコードと実装詳細。
