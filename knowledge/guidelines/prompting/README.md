# Copilot カスタムプロンプト作成テクニック

このディレクトリには、VS Code の GitHub Copilot 向けにカスタムプロンプトを作成するための有効なテクニックが含まれています。

## 信頼性・実行

- [構造より入力（3S + S.S.G.）](../ai-literacy/advanced-strategies.md): ハルシネーションを避けるため、要約された説明より生のコンテキストを優先する。
- [#todo によるタスク管理](task-management.md): 構造化された実行を強制し、手順漏れを防ぐ。
- [Stop and Ask（Circuit Breaker）](circuit-breaker.md): 無限ループや悪い仮定チェーンを防ぐ。
- [Sequential Inquiry（逐次問い）](sequential-inquiry.md): 質問を 1 つずつ行うことで認知負荷を下げる。

## コンテキスト・環境

- [Knowledge Retrieval（知識取得）](knowledge-retrieval.md): 学習データのカットオフ制約を避けるため、最新仕様を取得する。
- [Dynamic Context Protocol（動的コンテキスト）](dynamic-context.md): 深いコンテキストを集めるための「調査優先」アプローチ。
- [Environment-Agnostic Tools（環境非依存ツール）](environment-agnostic.md): ツールをハードコードせず、ユーザー定義ツールをサポートする。

## 品質・安全

- [透明性とハルシネーション](transparency.md): AI 生成コンテンツにタグを付け、期待値をコントロールする。
- [多言語ガードレール](multilingual-guardrails.md): 翻訳が重要な指示を改変することを防ぐ。
- [シミュレーションによる検証](simulation-verification.md): 視点の切り替えを強制し、ロジックの抜けを見つける。

## 効率・推論

- [Few-Shot Chain of Thought](few-shot-cot.md): 具体的な思考例で推論品質を上げる。
- [明示的パラレリズム](explicit-parallelism.md): 独立したツール呼び出しを並列実行して高速化する。
- [反復的な変更提案](iterative-changes.md): 圧倒しないように設定変更を 1 つずつ提案する。

## 構造・構文

- [XML + Markdown による構造化プロンプト](xml-structured-prompting.md): XML タグと Markdown を組み合わせ、機械可読かつ人間可読なプロンプトにする。
