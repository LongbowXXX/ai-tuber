<!-- このドキュメントは .github/prompts/doc-sync.prompt.md によって生成および更新されています -->

# 用語集（Glossary）

| 用語                         | 定義                                                                         | 例/補足                                          |
| ---------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------ |
| VTuber Behavior Engine       | AI コア。ADK で会話・行動を生成し、MCP クライアントとして舞台制御を呼び出す  | `packages/vtuber-behavior-engine`                |
| VTube Stage                  | Electron MCP サーバー + レンダラ。VRM 描画・表情・TTS・Markdown 表示          | `packages/vtube-stage`                           |
| MCP (Model Context Protocol) | LLM アプリが外部ツール/コンテキストと対話するためのプロトコル                | 本プロジェクトでは `vtube-stage` がツール提供    |
| ADK (Agent Development Kit)  | Google のマルチエージェントフレームワーク                                    | `google-adk`                                     |
| @modelcontextprotocol/sdk    | MCP TypeScript SDK (SSE, Streamable HTTP)                                     | `@modelcontextprotocol/sdk`                      |
| StageCommand                 | MCP ツールからレンダラへ送る JSON 命令                                        | `speak` / `triggerAnimation` / `displayMarkdown` |
| `speakId`                    | 発話を一意に識別する ID。完了同期に利用                                      | MCP サーバー (vtube-stage) が UUID を生成        |
| `speakEnd`                   | レンダラ → MCP サーバーの完了通知コマンド                                    | `payload.speakId` を含む                         |
| VRM                          | 3D アバターモデル形式                                                        | `@pixiv/three-vrm`                               |
| VRMA                         | VRM 用アニメーション形式（モーション）                                       | 将来/サンプルで利用                              |
| BlendShape                   | VRM の表情制御（口/目/感情）                                                 | emotion → BlendShape へマッピング                |
| VoiceVox                     | 日本語向けの TTS サービス                                                    | デフォルト `localhost:50021`                     |
| OBS Studio                   | 配信ソフト。vtube-stage のウィンドウをキャプチャ                             | obs-websocket 制御は未実装                       |
