# 制約・落とし穴・非機能要件

## 1. 非機能要件と考慮事項

- **リアルタイム性**: MCP サーバー（Electron main プロセス）から renderer へのコマンド送信、および renderer での VRM モデル更新は、スムーズなアニメーションを実現するために低遅延である必要があります。同一プロセス間の Electron IPC はこの要件に適しています。AI の応答生成 (`vtuber-behavior-engine`) は最も遅延が大きいボトルネックとなる可能性があり、最適化が必要です。
- **パフォーマンス**: `vtube-stage` での Three.js レンダリングは、特に複雑なモデルやエフェクトを使用する場合、効率的である必要があります。GPU アクセラレーションを活用し、不要な再レンダリングを避けることが重要です。
- **拡張性**:
  - AI 能力: ADK/MCP の採用により、新しいツールやエージェントを `vtuber-behavior-engine` に追加して機能を拡張することが容易になります。
  - キャラクター: 新しい VRM モデルを追加し、関連する設定（`vtube-stage` renderer での emotion → BlendShape マッピングなど）を行うことで、複数のキャラクターをサポートできます。
- **保守性**: コンポーネント間の明確な分離と、ADK による構造化された AI ロジックの実装は、システムの保守性を向上させます。各コンポーネントは独立してテストおよびデプロイできます。
- **エラーハンドリング**: 各コンポーネントは、通信エラー（MCP/SSE 接続断、VoiceVox 接続失敗）や内部エラー（AI モデルエラー、レンダリングエラー）を適切に処理し、可能な限り回復するか、明確なエラーログを出力する必要があります。

## 2. デプロイメントアーキテクチャ (概要)

- **AI Backend**: `vtuber-behavior-engine` は Python アプリケーションであり、`vtube-stage` と同じマシンまたは別のマシンで実行できます。
- **Frontend**: `vtube-stage` は Electron アプリケーション（TypeScript）であり、ローカルマシン上で実行されます。MCP サーバーを main プロセスに内蔵します。
- **通信**:
  - `vtuber-behavior-engine` と `vtube-stage` は MCP（既定は SSE、`http://127.0.0.1:8080`）で通信します。
  - `vtube-stage` の Electron main と renderer は IPC で通信します（StageCommand / speakEnd）。
  - `vtube-stage` と OBS Studio はローカルネットワーク経由で `obs-websocket` で通信します（将来対応）。

## 3. 既知の制約と落とし穴

- **認証/認可がない**: `vtube-stage` 内蔵 MCP サーバーの SSE エンドポイント（`GET /sse` + `POST /messages`）は、現状ローカル用途を想定したシンプル構成で、アクセス制御がありません。
- **単一接続前提の挙動**: コマンドキューはプロセス全体で共有され、接続クライアントが複数ある場合の配信ポリシーが明示されていません。
- **同期/順序の制約**: `speak` ツールは `speakEnd` を受けるまで待機します（`command-queue.ts`、30 秒タイムアウト）。renderer 側で `speakEnd` を送らない／落ちると、タイムアウトまで AI 側がブロックする可能性があります。
- **OBS 連携**: obs-websocket による OBS 制御は現状未実装です（ウィンドウキャプチャ前提）。
- **データ検証**: 片側でコマンド型を拡張した場合、もう片側の型/バリデータも更新が必要です（MCP サーバー側: `zod`、renderer 側: `class-validator`）。
