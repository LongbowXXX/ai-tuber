<!-- このドキュメントは .github/prompts/doc-sync.prompt.md によって生成および更新されています -->

# 主要なフロー

## 1. 対話生成フロー

ユーザーの音声入力からキャラクターの反応が生成されるまでの流れです。

1. **音声入力**: `SpeechRecognitionService` がユーザーの音声をテキスト化。
2. **コンテキスト取得**: `ChromaMemoryService` が過去の会話から関連情報を検索。
3. **エージェント推論**: `AgentRunner` が適切なエージェント（Character, News 等）を選択し、Gemini API を呼び出し。
4. **アクション生成**: LLM がテキスト応答と演出指示（感情、アニメーション）を生成。
5. **演出実行**: `StageDirectorMCPClient` が `stage-director` に `speak` や `trigger_animation` ツールを介して指示を送信。

## 2. ニュース解説フロー

1. **ニュース取得**: `NewsProvider` が最新ニュースを取得。
2. **コンテキスト更新**: `NewsContextAgent` がニュース内容を現在の会話文脈に統合。
3. **議論/解説**: `NewsAgent` がキャラクターの性格に基づいた見解を生成。

## 3. プレゼンテーションフロー

1. **スライド読み込み**: `PresentationAgent` が JSON 形式のスライド資料をロード。
2. **進行制御**: スライドの進行に合わせて、解説テキストと演出を順次生成。
3. **インタラクション**: 視聴者からのコメント（YouTube 等）を拾いつつプレゼンを継続。

## 4. AI ネイティブ開発フロー

`.github/agents` および `.github/prompts` を活用した開発サイクルです。

1. **要件定義**: `@BusinessAnalyst` がユーザーの要望を `requirements.md` にまとめる。
2. **設計**: `@Architect` が要件に基づき `specification.md` を作成。
3. **テスト計画**: `@QualityGuard` が設計に基づき `test-spec.md` を作成。
4. **実装**: `@Developer` が仕様とテスト計画に基づきコードを実装。
5. **レビュー**: `@QualityGuard` が実装をレビューし、承認後に `@Librarian` がドキュメントを同期。
