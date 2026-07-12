# アーキテクチャ概要

## システム概要

`vtube-stage` は、AI V-Tuber システムのフロントエンドとなる Electron アプリケーションです。VRM モデルのレンダリング、アニメーション制御、表情の更新、および配信画面に必要な情報の表示を担当します。

主な目的は、内蔵 MCP サーバーが受け取った AI (`vtuber-behavior-engine`) からのツール呼び出しを視覚的なアクションに変換し、OBS Studio などの配信ソフトウェアでキャプチャ可能な高品質な映像を提供することです。

## 主要コンポーネント

- **内蔵 MCP サーバー (`electron/server/mcp-server.ts`)**: Electron main process 内で動作し、AI からのツール呼び出し (`speak`, `trigger_animation`, `display_markdown_text`, `control_camera`) を受理します。コマンドキュー (`command-queue.ts`) で順序と完了 (`speakEnd`) を同期し、IPC 経由で renderer にコマンドを送信します。
- **VRM レンダラー (`VRMAvatar`)**: Three.js と `@pixiv/three-vrm` を使用して VRM モデルを 3D 空間に描画します。
- **コマンドハンドラー (`useStageCommandHandler`)**: IPC 経由で受信したコマンドを解析し、適切なアクション（表情変更、ポーズ変更、発話など）を実行します。
- **アニメーションシステム**: VRM アニメーション (`.vrma`) を使用して、待機ポーズや特定のアクションを実行します。
- **TTS 連携 (`tts_service`)**: 音声合成エンジンと連携し、キャラクターの発話とリップシンクを実現します。
- **UI オーバーレイ**: 字幕、吹き出し (`SpeechBubble`)、ステータス情報などを 3D シーンの上に重ねて表示します。
- **カメラ制御 (`AnimatedCamera`)**: コマンドに基づいてカメラの視点やズームを動的に制御します。

## 設計方針

- **リアルタイム性**: Electron IPC を使用した低遅延なコマンド処理。
- **拡張性**: 新しい表情やアニメーションを簡単に追加できる構造。
- **配信最適化**: OBS でのクロマキー合成や透過キャプチャを考慮した画面設計。
