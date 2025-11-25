---
applyTo: "**/resources/**/*.md"
---

# プロンプトテンプレート規約

## ファイル配置

- プロンプトは `stage_agents/resources/` に配置
- カテゴリごとにサブディレクトリを使用
  - `resources/characters/`: キャラクター定義
  - `resources/news/`: ニュース用プロンプト
  - `resources/presentation/`: プレゼンテーション用プロンプト
  - `resources/theater/`: 劇場用プロンプト

## プレースホルダー

- 波括弧で囲む: `{character_id}`, `{topic}`, `{current_time}`
- 差し替えは `str.format()` で実行

```markdown
## 役割

あなたは{character_id}です。

## コンテキスト

現在時刻: {current_time}
話題: {topic}
```

## プロンプト構造

Markdown 形式で見出しを使って構造化：

```markdown
## 役割

（キャラクターや目的の説明）

## 制約

- 制約 1
- 制約 2

## コンテキスト

{context}

## 出力形式

（期待する出力の形式）
```

## 構造化出力

JSON 形式の出力を期待する場合：

```markdown
## 出力形式

以下の JSON 形式で出力してください：

{
"character_id": "キャラクター ID",
"speeches": [
{
"tts_text": "音声合成用テキスト",
"emotion": "neutral | happy | sad | angry | excited"
}
]
}
```

## 注意事項

- プレースホルダーは残したまま差し替え箇所を説明する
- 長すぎるプロンプトは LLM の応答時間に影響する
- バージョン管理のため、大きな変更は履歴を残す

## 詳細ドキュメント

- プロンプトエンジニアリング規約: [agents-docs/coding-conventions.md](../../agents-docs/coding-conventions.md)
