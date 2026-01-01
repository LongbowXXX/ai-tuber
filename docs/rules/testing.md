<!-- このドキュメントは .github/prompts/doc-sync.prompt.md によって生成および更新されています -->

# テスト方針（Testing）

## 目的

- コマンド契約（MCP/WS）の破壊的変更を防ぐ
- 非同期フロー（`speak` の待機/通知）を壊さない
- AI ロジックの変更が舞台制御へ与える影響を局所化する

## テスト種別

- **Python ユニット/結合**: `pytest`（stage-director / vtuber-behavior-engine）
- **フロント品質**: `eslint` / `prettier`（現状、専用テストランナー依存は `package.json` に含まれない）

## 実行コマンド

### stage-director

```bash
uv sync --extra dev
uv run pytest
uv run mypy .
uv run flake8
```

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
```

## 推奨テスト観点（追加時）

- `stage-director`: `speak` が `speakEnd` により解除されること（タイムアウト/例外パス含む）
- `vtube-stage`: 未知コマンド/不正 payload が確実に弾かれること（`validateStageCommand`）
- `vtuber-behavior-engine`: MCP 呼び出し失敗時のリトライ/フォールバック方針（現状はログ + 例外）
