# 主要なフロー

## 1. アプリケーション起動フロー

1. Electron main process (`electron/main.ts`) が起動し、内蔵 MCP サーバー (`electron/server/mcp-server.ts`) を開始する (既定: SSE、`--transport=stdio` も可)。
2. renderer 側で `main.tsx` がエントリーポイントとして実行される。
3. `App.tsx` が初期化され、IPC 接続 (`useStageConnection`) が開始される。
4. `VRMAvatar` コンポーネントがデフォルトの VRM モデルをロードする。
5. ロード完了後、`idle_pose.vrma` アニメーションが再生される。

## 2. コマンド受信フロー

1. AI (`vtuber-behavior-engine`) が内蔵 MCP サーバーのツール (`speak`, `trigger_animation`, `display_markdown_text`, `control_camera`) を呼び出す。
2. main process がツール呼び出しを StageCommand に変換し、コマンドキュー (`command-queue.ts`) 経由で IPC により renderer へ送信する。
3. `useStageConnection` がメッセージを受信し、`command_validator` (class-validator) で検証した上で `useStageCommandHandler` に渡す。
4. `useStageCommandHandler` がコマンドの種類を判別する。
   - **表情コマンド**: `useFacialExpression` を通じて VRM の BlendShape を更新。
   - **モーションコマンド**: 指定された `.vrma` ファイルをロードし、アニメーションを切り替える。
   - **発話コマンド**: `tts_service` を呼び出して音声を再生し、リップシンクを開始する。
5. 発話完了時、renderer は `speakEnd` を main process に返し、待機していた `speak` ツール呼び出しが完了する。

## 3. 発話とリップシンクのフロー

1. 発話テキストを受信。
2. `tts_service` が VOICEVOX 等の外部 API から音声データを取得。
3. ブラウザで音声を再生。
4. 音声の振幅や解析データに基づき、VRM モデルの `Aa`, `I`, `U`, `Ee`, `Oo` の BlendShape をリアルタイムで更新する。
