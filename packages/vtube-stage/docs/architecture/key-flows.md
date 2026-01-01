<!-- This document is generated and updated by .github/prompts/doc-sync.prompt.md -->

# 主要なフロー

## 1. アプリケーション起動フロー

1. `main.tsx` がエントリーポイントとして実行される。
2. `App.tsx` が初期化され、WebSocket 接続 (`useWebSocket`) が開始される。
3. `VRMAvatar` コンポーネントがデフォルトの VRM モデルをロードする。
4. ロード完了後、`idle_pose.vrma` アニメーションが再生される。

## 2. コマンド受信フロー

1. `stage-director` から WebSocket 経由で JSON コマンドが送信される。
2. `useWebSocket` がメッセージを受信し、`useStageCommandHandler` に渡す。
3. `useStageCommandHandler` がコマンドの種類を判別する。
   - **表情コマンド**: `useFacialExpression` を通じて VRM の BlendShape を更新。
   - **モーションコマンド**: 指定された `.vrma` ファイルをロードし、アニメーションを切り替える。
   - **発話コマンド**: `tts_service` を呼び出して音声を再生し、リップシンクを開始する。

## 3. 発話とリップシンクのフロー

1. 発話テキストを受信。
2. `tts_service` が VOICEVOX 等の外部 API から音声データを取得。
3. ブラウザで音声を再生。
4. 音声の振幅や解析データに基づき、VRM モデルの `Aa`, `I`, `U`, `Ee`, `Oo` の BlendShape をリアルタイムで更新する。
