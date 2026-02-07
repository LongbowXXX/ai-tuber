<!-- このドキュメントは .github/prompts/doc-sync.prompt.md によって生成および更新されています -->

# 用語集（Glossary）

| 用語                         | 定義                                                                                | 例/補足                                               |
| ---------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------- |
| VTuber Behavior Engine       | AI コア。ADK で会話・行動を生成し、MCP クライアントとして舞台制御を呼び出す         | `packages/vtuber-behavior-engine`                     |
| VTube Stage                  | Electron App。MCP サーバー + VRM 描画・表情・TTS・Markdown 表示を統合              | `packages/vtube-stage`                                |
| MCP (Model Context Protocol) | LLM アプリが外部ツール/コンテキストと対話するためのプロトコル                       | 本プロジェクトでは `vtube-stage` がツール提供         |
| ADK (Agent Development Kit)  | Google のマルチエージェントフレームワーク                                           | `google-adk`                                          |
| MCP Server                   | HTTP/SSE でツール呼び出しを受け付けるサーバー                                       | `vtube-stage` 内蔵、`http://localhost:8080/sse`      |
| MCP Client                   | MCP サーバーに接続し、ツールを呼び出すクライアント                                  | `vtuber-behavior-engine` (ADK + MCPToolset)           |
| MCP Tool                     | AI から舞台を操作する関数インターフェース                                           | `speak` / `trigger_animation` / `display_markdown_text` |
| `speakId`                    | 発話を一意に識別する ID。完了同期に利用                                             | `vtube-stage` が生成                                  |
| VRM                          | 3D アバターモデル形式                                                               | `@pixiv/three-vrm`                                    |
| VRMA                         | VRM 用アニメーション形式（モーション）                                              | 将来/サンプルで利用                                   |
| BlendShape                   | VRM の表情制御（口/目/感情）                                                        | emotion → BlendShape へマッピング                     |
| VoiceVox                     | 日本語向けの TTS サービス                                                           | デフォルト `localhost:50021`                          |
| OBS Studio                   | 配信ソフト。vtube-stage の Electron ウィンドウをキャプチャ                          | obs-websocket 制御は未実装                            |
| Electron                     | クロスプラットフォームデスクトップアプリケーションフレームワーク                    | `vtube-stage` のベース技術                            |
