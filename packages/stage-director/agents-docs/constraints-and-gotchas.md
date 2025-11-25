<!-- このドキュメントは .github/prompts/document-project.prompt.md によって生成・更新されています -->

# 技術的制約と注意事項

## パフォーマンス要件

### レスポンスタイム

| 操作                             | 目標     | 備考                                         |
| -------------------------------- | -------- | -------------------------------------------- |
| MCP ツール応答（非ブロッキング） | < 100ms  | `trigger_animation`, `display_markdown_text` |
| MCP ツール応答（ブロッキング）   | TTS 依存 | `speak` は TTS 完了まで待機                  |
| WebSocket メッセージ送信         | < 50ms   | キューからの取り出し → 送信                  |

### スループット

- 同時接続 WebSocket クライアント: 想定 1 (vtube-stage)
- コマンドキュー容量: 制限なし（`asyncio.Queue` デフォルト）

### 注意点

- `speak` コマンドは TTS 完了まで MCP ツールがブロックするため、連続発話には時間がかかる
- コマンドキューは FIFO のため、大量のコマンドが滞留すると遅延が発生

## セキュリティ考慮事項

### 現状

- **認証・認可**: なし（ローカル開発環境向け）
- **暗号化**: なし（WebSocket は `ws://`、HTTP は `http://`）

### 将来の検討事項

- **本番環境では TLS を有効化** (`wss://`, `https://`)
- **MCP サーバーへのアクセス制御** が必要な場合は認証を追加
- **入力バリデーション**: Pydantic でスキーマ検証済み

### ネットワーク設定

| 設定                      | デフォルト  | 本番推奨                   |
| ------------------------- | ----------- | -------------------------- |
| `STAGE_DIRECTOR_HOST`     | `127.0.0.1` | `127.0.0.1` (ローカルのみ) |
| `STAGE_DIRECTOR_MCP_HOST` | `0.0.0.0`   | ファイアウォールで制限     |

## 既知の技術的負債

### 1. テストカバレッジ不足

- **現状**: ダミーテストのみ
- **影響**: リファクタリング時のデグレリスク
- **対策**: ユニットテストの追加

### 2. エラーハンドリングの不統一

- **現状**: MCP ツールで例外をキャッチして文字列返却
- **影響**: エラー型の情報が失われる
- **対策**: 構造化されたエラーレスポンスの導入

### 3. ホットリロード固定

- **現状**: `reload=True` がハードコード
- **影響**: 本番環境での不要なリロード
- **対策**: 環境変数で切り替え可能にする

```python
# 現在
config = Config(..., reload=True)

# 改善案
config = Config(..., reload=os.getenv("STAGE_DIRECTOR_RELOAD", "false").lower() == "true")
```

### 4. 単一クライアント想定

- **現状**: WebSocket 接続は 1 クライアントのみ想定
- **影響**: 複数接続時の動作が未定義
- **対策**: 接続管理の明示的な実装（必要に応じて）

## よくあるトラブルと対処法

### 問題 1: MCP ツールがタイムアウトする

**症状**: `speak` 呼び出しが返ってこない

**原因**:

- `vtube-stage` が接続していない
- `speakEnd` が送信されていない

**対処法**:

1. WebSocket 接続が確立されているか確認
2. `vtube-stage` のログで `speakEnd` 送信を確認
3. タイムアウト付き待機の導入を検討

### 問題 2: WebSocket 接続が切断される

**症状**: `WebSocketDisconnect` が頻発

**原因**:

- クライアント側のネットワーク問題
- サーバー側のエラー

**対処法**:

1. ログで切断理由を確認
2. クライアント側の再接続ロジックを確認
3. サーバー側のエラーログ (`exc_info=True`) を確認

### 問題 3: コマンドがキューに滞留

**症状**: コマンドが `vtube-stage` に届かない

**原因**:

- WebSocket クライアント未接続
- `dequeue_command` の await 漏れ

**対処法**:

1. WebSocket 接続状態をログで確認
2. `websocket_handler.py` のタスクが起動しているか確認

### 問題 4: JSON パースエラー

**症状**: `Failed to decode JSON message` ログ

**原因**:

- クライアントが不正な JSON を送信
- エンコーディング問題

**対処法**:

1. 送信側のメッセージ形式を確認
2. JSON キーの大文字小文字を確認 (`speakEnd` vs `speakend`)

### 問題 5: 環境変数が読み込まれない

**症状**: デフォルトのホスト・ポートで起動

**原因**:

- `.env` ファイルが存在しない
- `load_dotenv()` が呼ばれていない

**対処法**:

1. `.env` ファイルがプロジェクトルートにあるか確認
2. `main.py` から起動しているか確認（直接モジュール実行時は手動で `load_dotenv()` が必要）

## 制約事項

### Python バージョン

- **最小バージョン**: Python 3.11
- **理由**: `asyncio.TaskGroup` やその他の機能への対応

### 依存ライブラリのバージョン固定

- `fastapi==0.120.0` は固定（互換性確保のため）
- その他は最小バージョン指定

### JSON キーの命名規則

- **WebSocket メッセージ**: camelCase 必須
- **理由**: `vtube-stage` (TypeScript) との API 契約

### 非同期パターン

- すべての I/O は `async/await` 必須
- `asyncio.Queue` への操作は必ず `await`

### ログ設定

- ルートロガー設定は `main.py` でのみ実行
- モジュールは `logging.getLogger("stage-director.<name>")` を使用

## 互換性に関する注意

### vtube-stage との互換性

| コマンド           | ペイロードキー                                            | 必須       |
| ------------------ | --------------------------------------------------------- | ---------- |
| `speak`            | `characterId`, `message`, `caption`, `emotion`, `speakId` | すべて必須 |
| `triggerAnimation` | `characterId`, `animationName`                            | すべて必須 |
| `displayMarkdown`  | `text`                                                    | 必須       |
| `speakEnd`         | `speakId`                                                 | 必須       |

### MCP クライアントとの互換性

- MCP プロトコル: SSE (Server-Sent Events)
- ツール名は snake_case (`speak`, `trigger_animation`, `display_markdown_text`)
