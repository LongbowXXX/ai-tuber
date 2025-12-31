<!-- This document is generated and updated by .github/prompts/doc-sync.prompt.md -->

# 制約・落とし穴（Constraints）

## プロダクション前提の制約

- **認証/認可がない**: `stage-director` の WebSocket (`/ws`) と MCP(SSE) は、現状ローカル用途を想定したシンプル構成で、アクセス制御がありません。
- **単一接続前提の挙動**: コマンドキューはプロセス全体で共有され、接続クライアントが複数ある場合の配信ポリシー（ブロードキャスト/専有など）が明示されていません。

## 同期/順序の制約

- `speak` ツールは `speakEnd` を受けるまで `wait_for_command(speak_id)` で待機します。
  - `vtube-stage` 側で `speakEnd` を送らない／落ちると、AI 側がブロックする可能性があります。
- `command_events` は `speakId` をキーに Event を保持します。異常系で `notify_command_done` が呼ばれないと、イベントが残り続ける可能性があります。

## フロントエンド環境変数

- `vtube-stage` は起動時に `VITE_STAGE_DIRECTER_ENDPOINT` が未設定だと例外を投げます。
  - 変数名は `DIRECTOR` ではなく **`DIRECTER`** になっている点に注意してください。

## OBS 連携

- `docs/architecture.md` に記載のとおり、**obs-websocket による OBS 制御は現状未実装**です（ウィンドウキャプチャ前提）。

## 開発サーバーの設定

- `stage-director` は `uvicorn` を `reload=True` で起動します（開発向け）。
  - 本番運用時は `reload=False`・ログ/プロセス管理（systemd/Docker など）を検討してください。

## データ検証

- `stage-director` は送信 JSON を `pydantic` で生成します。
- `vtube-stage` は受信 JSON を `class-validator` で検証します。
  - 片側でコマンド型を拡張した場合、もう片側の型/バリデータも更新が必要です。
