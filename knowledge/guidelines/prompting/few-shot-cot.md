# Few-Shot Chain of Thought（推論）

## 問題

標準的な「Chain of Thought（CoT）」指示（例:「ステップバイステップで考えて」）は抽象的すぎることが多く、モデルが構造なく冗長に語ったり、重要な推論ステップを飛ばしたりする原因になります。

## 解決策

プロンプト内に、期待する推論プロセスの具体的な _例_ を提示します。この「Few-Shot」アプローチは、モデルの内部の思考を望ましい深さと構造に揃えます。

## 実装手順

1.  **構造を定義する**: `<thinking>` ブロックの例を作ります。
2.  **「良い」パターンを示す**: エラーの発見や選択肢の比較をどう行うかをデモします。

## テンプレ例

```xml
<example_thinking>
User asked: "Refactor the login function."

1.  **Analyze**: I see the `login` function in `auth.ts`. It uses a callback pattern.
2.  **Critique**: Callbacks are outdated. I should use async/await.
3.  **Safety Check**: Are there any existing tests? Yes, `auth.test.ts`. I must ensure they pass.
4.  **Plan**:
    - Update signature to return Promise.
    - Wrap legacy code.
    - Update tests.
</example_thinking>
```

## 利点

- **アラインメント（Alignment）**: モデルが例の _ロジック構造_ を模倣します。
- **一貫性（Consistency）**: より予測可能で高品質な推論アウトプットが得られます。
