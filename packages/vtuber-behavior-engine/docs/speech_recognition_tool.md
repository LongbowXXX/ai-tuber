# SpeechRecognitionTool 実装ドキュメント

## 概要

`SpeechRecognitionTool` は、Google ADK の `BaseTool` を継承したツールクラスで、LLM がツール呼び出しを通じてユーザーの音声発話をリアルタイムに取得できる機能を提供します。バックグラウンドスレッドで常時音声認識を実行し、確定した発話テキストをキューに蓄積します。

## アーキテクチャ

### コンポーネント構成

```
┌──────────────────────────────────────────┐
│         LLM Agent                        │
│  (google.adk.agents.LlmAgent)            │
└──────────────┬───────────────────────────┘
               │ ツール呼び出し
               │ get_user_speech()
               ▼
┌──────────────────────────────────────────┐
│   SpeechRecognitionTool                  │
│   - name: "get_user_speech"              │
│   - description: "ユーザー発話を取得"    │
│   - _manager: SpeechRecognitionManager   │
└──────────────┬───────────────────────────┘
               │ 管理
               ▼
┌──────────────────────────────────────────┐
│   SpeechRecognitionManager               │
│   - _transcript_queue: Queue[str]        │
│   - _stt_thread: Thread                  │
│   - _stop_event: Event                   │
└──────────────┬───────────────────────────┘
               │ バックグラウンドスレッド
               ▼
┌──────────────────────────────────────────┐
│   Google Cloud Speech-to-Text API        │
│   - ストリーミング音声認識               │
│   - リアルタイム文字起こし               │
└──────────────────────────────────────────┘
```

### クラス設計

#### SpeechRecognitionManager

既存の Context Manager パターンに加えて、明示的な `start()` / `stop()` メソッドを追加しました。

**新規追加メソッド:**

- `start()`: バックグラウンドスレッドを開始（デーモンスレッドとして実行）
- `stop()`: スレッドを停止し、リソースを解放
- `get_transcripts(timeout=0.1)`: キューから確定した発話を全て取得

**既存の Context Manager パターン:**

- `__enter__()`: スレッド開始とキュー返却
- `__exit__()`: スレッド停止とリソース解放

#### SpeechRecognitionTool

Google ADK の `BaseTool` を継承し、LLM から呼び出し可能なツールとして実装。

**プロパティ:**

- `name`: `"get_user_speech"`
- `description`: ツールの説明（LLM がツールの用途を理解するため）
- `_manager`: `SpeechRecognitionManager` のインスタンス

**メソッド:**

- `__call__()`: ツール呼び出し時に実行される非同期関数
  - 戻り値: `{"transcripts": ["発話1", "発話2", ...]}`
- `start_recognition()`: 音声認識を開始
- `stop_recognition()`: 音声認識を停止

## 使用方法

### 基本的な使い方

```python
from vtuber_behavior_engine.services import SpeechRecognitionTool
from google.adk.agents import LlmAgent

# 1. ツールを作成
speech_tool = SpeechRecognitionTool()

# 2. 音声認識を開始（バックグラウンドで実行）
speech_tool.start_recognition()

# 3. エージェントにツールを登録
agent = LlmAgent(
    model="gemini-2.0-flash-exp",
    system_instruction=(
        "あなたは音声認識アシスタントです。"
        "定期的に get_user_speech ツールでユーザー発話を確認してください。"
    ),
    tools=[speech_tool],
)

# 4. エージェント実行（LLMがツールを自動呼び出し）
response = await agent.run(user_message="発話をチェックしてください")

# 5. 終了時に停止
speech_tool.stop_recognition()
```

### システムインストラクション例

LLM に適切にツールを使わせるため、以下のようなインストラクションを推奨します:

```python
system_instruction = """
あなたは音声対話アシスタントです。

【ツール使用】
- 定期的に get_user_speech ツールを呼び出してユーザーの発話を確認してください
- 発話があった場合は、その内容に応答してください
- 発話がない場合は、「発話を待っています」と返してください

【応答ルール】
- ユーザーの発話内容を理解し、適切に応答する
- 複数の発話がある場合は、全てをまとめて処理する
- 不明な点があれば、確認の質問をする
"""
```

## 実装の詳細

### バックグラウンドスレッドの動作

1. **スレッド開始** (`start()` 呼び出し時)

   - デーモンスレッドとして `_stt_thread_func` を実行
   - PyAudio ストリームを開いてマイク入力を開始
   - Google Cloud Speech-to-Text API にストリーミング接続

2. **音声認識ループ**

   - マイクから音声チャンクを読み込み
   - STT API にリアルタイム送信
   - 確定した発話 (`is_final=True`) を `_transcript_queue` に追加

3. **スレッド停止** (`stop()` 呼び出し時)
   - `_stop_event` をセットしてループを停止
   - スレッドの終了を待機 (`join()`)
   - PyAudio リソースを解放

### ツール呼び出しの流れ

```
LLM Agent
    │
    │ (1) ツール呼び出し決定
    │     「get_user_speech を使って発話を確認しよう」
    │
    ▼
SpeechRecognitionTool.__call__()
    │
    │ (2) キューから発話を取得
    │     manager.get_transcripts()
    │
    ▼
SpeechRecognitionManager._transcript_queue
    │
    │ (3) キューに蓄積されたテキストを返却
    │     ["こんにちは", "今日はいい天気ですね"]
    │
    ▼
LLM Agent
    │
    │ (4) 発話内容を元に応答を生成
    │     「こんにちは!本当にいい天気ですね。」
    │
    ▼
ユーザーへの応答
```

## テスト

### ユニットテスト

`tests/tests_vtuber_behavior_engine/test_speech_recognition_tool.py` にテストが実装されています。

**テストケース:**

- `test_initialization`: ツールの初期化
- `test_call_without_manager`: マネージャー未初期化時の動作
- `test_start_and_stop_recognition`: 開始・停止の正常動作
- `test_call_with_transcripts`: 発話取得の動作
- `test_get_transcripts_empty`: 空のキュー処理
- `test_get_transcripts_with_data`: データありのキュー処理

### テスト実行

```bash
# 仮想環境をアクティブ化
.\.venv\Scripts\Activate.ps1  # Windows
source .venv/bin/activate      # Linux/macOS

# テスト実行
pytest tests/tests_vtuber_behavior_engine/test_speech_recognition_tool.py -v
```

### 統合テスト例

実際の音声入力を使ったテストは `examples/speech_recognition_tool_example.py` で確認できます。

```bash
uv run python examples/speech_recognition_tool_example.py
```

## 環境設定

### 必須の環境変数

```bash
# Google Cloud Speech-to-Text API の認証
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

### 必須の依存パッケージ

- `pyaudio`: マイク入力
- `google-cloud-speech`: Google STT API
- `google-adk`: エージェント開発キット

## トラブルシューティング

### 問題: "GOOGLE_APPLICATION_CREDENTIALS が設定されていません"

**解決策:**

```bash
# サービスアカウントキーを作成し、パスを設定
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"  # Linux/macOS
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\key.json"  # PowerShell
```

### 問題: "PyAudio の初期化に失敗しました"

**解決策 (Windows):**

```bash
pip install pipwin
pipwin install pyaudio
```

**解決策 (Linux):**

```bash
sudo apt-get install portaudio19-dev python3-pyaudio
pip install pyaudio
```

### 問題: "マイクが検出されません"

**確認ポイント:**

- OS のマイク設定でアプリケーションにマイクアクセス権限が付与されているか
- デフォルトのマイクデバイスが正しく設定されているか
- 他のアプリケーションがマイクを占有していないか

## 今後の拡張案

### 1. 言語設定のカスタマイズ

現在は日本語 (`ja-JP`) 固定ですが、複数言語対応を追加:

```python
speech_tool = SpeechRecognitionTool(language_code="en-US")
```

### 2. 音声認識の精度調整

- 音声認識モデルの選択
- ノイズキャンセリング設定
- 文脈ヒントの追加

### 3. 話者分離

複数話者の音声を個別に認識し、話者を識別:

```python
{"transcripts": [
    {"speaker": "speaker1", "text": "こんにちは"},
    {"speaker": "speaker2", "text": "こんにちは"}
]}
```

### 4. 感情・トーン分析

音声の感情やトーンを分析して付加情報を提供:

```python
{"transcripts": [
    {"text": "嬉しい!", "emotion": "joy", "confidence": 0.95}
]}
```

## ライセンス

MIT License - 詳細は `LICENSE` ファイルを参照してください。
