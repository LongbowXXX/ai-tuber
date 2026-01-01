<!-- このドキュメントは .github/prompts/doc-sync.prompt.md によって生成・更新されています -->

# 制約事項と既知の課題

## 技術的制約

- **WebSocket 単一接続**: 現状、`vtube-stage` との接続は 1 つのみを想定しています。
- **TTS 同期**: `vtube-stage` 側からの `speakEnd` イベントに依存しているため、イベントが消失するとキューが停滞する可能性があります。
- **MCP SSE 方式**: 現在の MCP 実装は SSE (Server-Sent Events) を使用しており、双方向通信の制限がある場合があります。

## プラットフォーム制約

- **Windows 依存**: `vtube-stage` が Windows 上で動作することを前提としています。

## 今後の課題 (Technical Debt)

- **エラーハンドリングの強化**: WebSocket 切断時の再接続ロジックの堅牢化。
- **タイムアウト処理**: `speakEnd` が長時間返ってこない場合の強制スキップ機能。
- **ログ管理**: 構造化ログの導入によるデバッグ効率の向上。
- **認証**: MCP および WebSocket 接続への認証メカニズムの導入。
