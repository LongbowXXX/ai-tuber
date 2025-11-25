<!-- このドキュメントは .github/prompts/document-project.prompt.md によって生成・更新されています -->

# 設計原則とコーディング規約

## 設計原則

### 非同期ファースト

- すべての I/O 操作は `async/await` を使用
- キュー操作は必ず `await` する（待機漏れによるデッドロック防止）
- ブロッキング処理は WebSocket ハンドラ内で行わず、バックグラウンドコルーチンに委譲

### 単一責任の原則 (SRP)

- 各モジュールは明確な責務を持つ
  - `models.py`: データスキーマのみ
  - `command_queue.py`: キュー管理のみ
  - `websocket_handler.py`: WebSocket 通信のみ

### 拡張性の確保

- 新しいコマンド型は `models.py` の `StageCommand` Union を拡張
- 新しい MCP ツールは `stage_director_mcp_server.py` に追加
- 共有キューは `command_queue.py` を拡張（新しいキューを作らない）

## 採用している設計パターン

### Producer-Consumer パターン

- **Producer**: MCP ツール (`enqueue_command`)
- **Consumer**: WebSocket ハンドラ (`dequeue_command`)
- **Queue**: `asyncio.Queue`

### Event-Driven パターン

- `speakEnd` ACK による完了通知
- `asyncio.Event` を使用した非同期待機

### Command パターン

- コマンドオブジェクト: Pydantic モデル (`SpeakCommand`, `TriggerAnimationCommand` など)
- シリアライゼーション: `create_command_json`

## 命名規則

### ファイル名

- Python モジュール: `snake_case.py`
- テストファイル: `test_<module_name>.py`

### クラス名

- Pydantic モデル: `PascalCase` (例: `SpeakPayload`, `TriggerAnimationCommand`)
- Union 型: `PascalCase` (例: `StageCommand`)

### 関数名

- 関数・メソッド: `snake_case` (例: `enqueue_command`, `wait_for_command`)
- 非同期関数: `async def` で定義、名前は同じく `snake_case`

### 変数名

- ローカル変数: `snake_case`
- 定数: `SCREAMING_SNAKE_CASE` (必要に応じて)
- Pydantic フィールド（JSON キー）: `camelCase` (`vtube-stage` との契約)

### ロガー名

- モジュールロガー: `logging.getLogger("stage-director.<module>")` 形式
  - 例: `stage-director.mcp`, `stage-director.websocket`

## コードスタイル

### フォーマッター

- **Black**: `line-length = 120`, `target-version = ["py310"]`
- 実行: `uv run black .`

### リンター

- **Flake8**: 基本的なスタイルチェック
- **flake8-copyright**: 著作権ヘッダーチェック
- 実行: `uv run flake8`

### 型チェック

- **mypy**: `strict = true`
- すべての関数に型ヒント必須 (`disallow_untyped_defs = true`)
- 実行: `uv run mypy .`

### 著作権ヘッダー

すべての Python ファイルの先頭に以下を追加:

```python
#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
```

## JSON シリアライゼーション規約

### キー命名

- WebSocket JSON キーは **camelCase** を維持
- Pydantic モデルのフィールド名で定義

```python
class SpeakPayload(BaseModel):
    characterId: str   # camelCase
    message: str
    speakId: str
```

### 大文字小文字の厳密性

- JSON キーは **大文字小文字を区別** (例: `"speakEnd"` ≠ `"speakend"`)
- パース・送信時は既存のケースに合わせる

## エラーハンドリング

### MCP ツール

- 成功時: `"Success"` を返す
- 失敗時: 原因を含むメッセージを返す (例: `f"Failed to speak: {e}"`)
- 例外をログに記録 (`logger.error(..., exc_info=True)`)

### WebSocket ハンドラ

- 接続切断は `WebSocketDisconnect` でキャッチ
- 予期しないエラーは `code=1011` でクローズ
- バックグラウンドタスクは `finally` でキャンセル

## ログ規約

### ログレベル

- `INFO`: 正常な操作（接続、コマンド送信など）
- `ERROR`: 例外・エラー（`exc_info=True` でスタックトレース）
- `DEBUG`: 詳細なデバッグ情報（必要時）

### ログフォーマット

`pyproject.toml` で定義:

```
%(asctime)s [%(levelname)8s] [%(thread)d] %(message)s (%(filename)s:%(lineno)s)
```

## テストの方針

### テストフレームワーク

- **pytest**: メインテストランナー
- **pytest-asyncio**: 非同期テストサポート
- **pytest-cov**: カバレッジ計測

### テストファイル配置

- `tests/tests_stage_director/` 配下
- `test_` プレフィックスで命名

### 非同期テスト

- `asyncio_default_fixture_loop_scope = "function"` 設定済み
- 各テストは独立したイベントループで実行

### 現状

- ダミーテストのみ存在 (`test_dummy.py`)
- 実質的なテストは今後追加予定
