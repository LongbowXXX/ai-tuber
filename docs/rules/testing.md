<!-- このドキュメントは .github/prompts/doc-sync.prompt.md によって生成および更新されています -->

# テスト方針（Testing）

## 目的

- MCP ツール契約の破壊的変更を防ぐ
- 非同期フロー（`speak` の待機/通知）を壊さない
- AI ロジックの変更が舞台制御へ与える影響を局所化する

## テスト種別

- **Python ユニット/結合**: `pytest`（vtuber-behavior-engine）
- **フロント品質**: `eslint` / `prettier` / ビルド検証（vtube-stage）

## 実行コマンド

### vtuber-behavior-engine

```bash
uv sync --extra dev
uv run pytest
uv run mypy .
uv run flake8
```

`pytest` マーカー:

- `integration`: 結合テスト（`-m "not integration"` で除外可能）

### vtube-stage

```bash
npm install
npm run lint
npm run format:check
npm run build
npm run build:win  # Electron アプリのビルド確認
```

## 推奨テスト観点（追加時）

- `vtube-stage`: MCP ツール呼び出しに対して、処理完了後に適切なレスポンスが返ること
- `vtube-stage`: `speak` ツールが音声再生完了まで待機し、完了後にレスポンスを返すこと
- `vtuber-behavior-engine`: MCP 呼び出し失敗時のリトライ/フォールバック方針（現状はログ + 例外）
