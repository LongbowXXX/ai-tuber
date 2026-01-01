---
type: test_specification
status: draft
---

<!-- この文書は @QualityGuard により生成されました -->

# テスト仕様: 音声認識の切り替えオプション (SpeechRecognitionToggle)

<metadata>
**ケースIDプレフィックス:** SRT
**対象仕様:** [specification.md](docs/specs/SpeechRecognitionToggle/specification.md)
</metadata>

<test_scenarios>

## 1. ハッピーパスシナリオ

_成功する操作の標準的な検証。_

- [ ] **Case ID:** SRT-001

  - **シナリオ:** デフォルト設定での起動（音声認識有効）
  - **入力:** `AgentsConfig()` (デフォルト)
  - **期待結果:** `SpeechRecognitionTool` がインスタンス化され、`start_recognition` が呼ばれ、マイクが初期化されること。

- [ ] **Case ID:** SRT-002

  - **シナリオ:** 音声認識を明示的に無効化して起動
  - **入力:** `AgentsConfig(use_speech_recognition=False)`
  - **期待結果:** `DummySpeechRecognitionTool` がインスタンス化され、実デバイス（マイク）へのアクセスが発生せず、システムが正常に起動すること。

- [ ] **Case ID:** SRT-003
  - **シナリオ:** ダミーツールからの発話取得
  - **入力:** `DummySpeechRecognitionTool()` の呼び出し
  - **期待結果:** `{"transcripts": []}` が返され、例外が発生しないこと。

## 2. エッジケースシナリオ

_境界値、空入力、特殊文字、大きなペイロード。_

- [ ] **Case ID:** SRT-E01

  - **シナリオ:** 音声認識無効時に `stop_recognition` を呼び出す
  - **入力:** `DummySpeechRecognitionTool.stop_recognition()`
  - **期待結果:** 何もせず正常終了すること（二重停止や未初期化エラーが発生しないこと）。

- [ ] **Case ID:** SRT-E02
  - **シナリオ:** 非常に短い間隔での `start`/`stop` 繰り返し
  - **入力:** `DummySpeechRecognitionTool` に対して高速に `start` と `stop` を交互に呼び出す
  - **期待結果:** 状態の不整合やリソースリークが発生しないこと。

## 3. エラーハンドリングシナリオ

_ネットワーク障害、権限エラー、タイムアウトのシミュレーション。_

- [ ] **Case ID:** SRT-X01

  - **シナリオ:** マイク権限がない環境での無効化起動
  - **入力:** マイク権限なし環境 + `AgentsConfig(use_speech_recognition=False)`
  - **期待結果:** `SpeechRecognitionManager` が作成されないため、権限エラーが発生せずに起動すること。

- [ ] **Case ID:** SRT-X02
  - **シナリオ:** Google Cloud 認証情報がない環境での無効化起動
  - **入力:** `GOOGLE_APPLICATION_CREDENTIALS` 未設定 + `AgentsConfig(use_speech_recognition=False)`
  - **期待結果:** `SpeechRecognitionManager` が作成されないため、認証エラーが発生せずに起動すること。

## 4. セキュリティシナリオ

_インジェクション、認可、データ漏洩。_

- [ ] **Case ID:** SRT-S01

  - **シナリオ:** 設定値の型安全性
  - **入力:** `AgentsConfig(use_speech_recognition="invalid_type")`
  - **期待結果:** Pydantic によるバリデーションエラーが発生し、不正な型での動作を防止すること。

- [ ] **Case ID:** SRT-S02
  - **シナリオ:** ダミーツールによる情報漏洩の防止
  - **入力:** `DummySpeechRecognitionTool` の動作中
  - **期待結果:** 内部的にマイクをオープンしたり、音声をバッファリングしたりしていないことをコードレビューで確認する。

</test_scenarios>
