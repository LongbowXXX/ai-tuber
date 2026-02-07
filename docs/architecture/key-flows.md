<!-- このドキュメントは .github/prompts/doc-sync.prompt.md によって生成および更新されています -->

# 主要フロー（Key Flows）

## 1. 起動フロー（ローカル開発）

README の推奨順序:

1. VoiceVox（デフォルト `localhost:50021`）を起動
2. `vtube-stage` (Electron) を起動: `npm run dev` + `npm run dev:electron` もしくは `npm run start:electron`
3. `vtuber-behavior-engine` を起動: `uv run python src/vtuber_behavior_engine/main.py`

## 2. エンドツーエンドのワークフロー

典型的なインタラクションのシーケンスは、外部からの入力（例：ユーザーメッセージ）または内部トリガー（例：タイマーイベント）から始まり、OBS Studio での最終的な視覚的出力に至るまで、以下のステップで進行します。

1. **AI エージェント起動**: `vtuber-behavior-engine` が ADK のマルチエージェントシステムを起動し、初期メッセージで対話を開始します。
2. **音声認識（オプション）**: 音声認識ツールがユーザーの発話を検出した場合、その内容がエージェントに渡されます。
3. **AI 処理とツール呼び出し**: ADK エージェントが対話を生成する際、MCP Client として `vtube-stage` の MCP Server に接続し、以下のツールを呼び出します：
   - `speak`: キャラクターの発話、感情、キャプションを指定
   - `trigger_animation`: アニメーション（ポーズ）をトリガー
   - `display_markdown_text`: Markdown テキストを表示
4. **コマンドディスパッチ**: MCP サーバーは受信したツール呼び出しを StageCommand に変換し、Electron IPC でレンダラへ送信します。
5. **コマンド受信と検証**: レンダラは `class-validator` でコマンドを検証します。
6. **VRM モデル更新**: `@pixiv/three-vrm` を使用して、感情に基づく表情（BlendShape）を VRM モデルに適用します。
7. **TTS とリップシンク**: VoiceVox API を呼び出して音声を生成し、音声に同期してリップシンク（口パク）を実行します。
8. **Markdown 表示**: 必要に応じて、画面に Markdown テキスト（資料、グラウンディング情報など）を表示します。
9. **完了通知**: TTS 再生完了後、`vtube-stage` レンダラは `speakEnd` を MCP サーバーへ返し、AI が次のアクションへ進めるようにします。
10. **OBS キャプチャ**: OBS Studio は `vtube-stage` のウィンドウをキャプチャし、配信映像として出力します。

## 3. シーケンス図

### フロー 1: 発話（speak）

AI が生成したセリフを、画面表示 + TTS + 感情表現として再生し、完了を AI 側へ同期します。

```mermaid
sequenceDiagram
    participant VBE as vtuber-behavior-engine<br/>(ADK Agents)
    participant VS as vtube-stage<br/>(Electron + React + Three.js)
    participant VV as VoiceVox
    participant OBS as OBS Studio

    VBE ->> VBE: エージェント起動<br/>(初期メッセージ)
    VBE ->>+ VS: MCP Tool Call: speak<br/>(characterId, message, caption, emotion, speakId)
    VS ->> VS: StageCommand 生成 & IPC 送信
    VS ->> VS: コマンド検証<br/>(class-validator)
    VS ->> VS: VRM 表情更新<br/>(emotion -> BlendShape)
    VS ->>+ VV: HTTP: 音声合成リクエスト<br/>(text, speakerId)
    VV -->>- VS: 音声データ (WAV)
    VS ->> VS: 音声再生 & リップシンク
    VS -->>- VBE: MCP Tool Response: Success<br/>(after speakEnd)
    VS -->> OBS: レンダリング結果<br/>(Window Capture)
```

### フロー 2: アニメーション（trigger_animation）

```mermaid
sequenceDiagram
    participant VBE as vtuber-behavior-engine
    participant VS as vtube-stage

    VBE ->>+ VS: MCP Tool Call: trigger_animation<br/>(characterId, animationName)
    VS ->> VS: VRMA アニメーション適用
    VS -->>- VBE: MCP Tool Response: Success
```

### フロー 3: Markdown 表示（display_markdown_text）

```mermaid
sequenceDiagram
    participant VBE as vtuber-behavior-engine
    participant VS as vtube-stage

    VBE ->>+ VS: MCP Tool Call: display_markdown_text<br/>(text)
    VS ->> VS: Markdown レンダリング<br/>(react-markdown)
    VS -->>- VBE: MCP Tool Response: Success
```

## 4. 実装ポイント

- **同期制御**: `vtube-stage` (MCP) は `speak` を発行した後、`speakEnd` を受け取るまで **完了待機**します。
- **完了通知**: `vtube-stage` は TTS 完了後 `speakEnd` を送信し、次のコマンド実行を解放します。
- **コマンド検証**: `vtube-stage` は受信した JSON を `class-validator` で検証します（`packages/vtube-stage/src/utils/command_validator.ts`）。

## 5. エントリポイント一覧

| 種別                     | 場所                                                                 | 説明                                                 |
| ------------------------ | -------------------------------------------------------------------- | ---------------------------------------------------- |
| Stage App (Electron)     | `packages/vtube-stage/electron/main.ts`                              | MCP(SSE) と Electron レンダラを起動                  |
| Behavior Engine 起動     | `packages/vtuber-behavior-engine/src/vtuber_behavior_engine/main.py` | 既定で News Agent を起動し初期メッセージを投入       |
| Renderer 起動            | `packages/vtube-stage/src/main.tsx`                                  | React のルートをマウント                             |
