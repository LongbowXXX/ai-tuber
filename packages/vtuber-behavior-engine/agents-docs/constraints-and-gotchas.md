<!-- このドキュメントは .github/prompts/document-project.prompt.md によって生成・更新されています -->

# 技術的制約と注意事項

## パフォーマンス要件

### レスポンスタイム

- **LLM 応答**: Gemini `gemini-2.5-flash` で 1-3 秒
  - 初回呼び出しはキャッシュウォームアップで遅延あり
  - プロンプトが長いと応答時間が増加
- **音声認識**: リアルタイム（遅延 < 500ms）
  - Google Cloud Speech API のストリーミング認識を使用
- **MCP 通信**: 100-500ms
  - Stage Director との SSE 接続
- **ベクトル検索**: < 1 秒
  - Chroma DB のローカル検索

### スループット

- **会話ループ反復**: 5-10 秒/反復
  - 2 キャラクター × (思考 + 出力) + コンテキスト更新
- **最大反復回数**: デフォルト 10 回
  - `AgentsConfig.max_iterations` で変更可能

### メモリ使用量

- **Chroma DB**: 数 MB〜数 GB（会話履歴による）
- **ADK セッション**: 数 MB（インメモリ）
- **LLM コンテキスト**: トークン数に依存（最大 1M トークン）

### 最適化のヒント

- **プロンプト長**: 短く保つ（トークン数を削減）
- **会話履歴**: 適切にトリミング（古い履歴を削除）
- **ベクトル検索**: `n_results` を調整（デフォルト 10）
- **並列処理**: 複数のエージェントを並列実行しない（ADK の制約）

## セキュリティ考慮事項

### API キーの管理

- **環境変数**: `.env` ファイルで管理（`.gitignore` に追加済み）
- **Google Cloud 認証**: サービスアカウントキーを使用
  - キーファイルは絶対にリポジトリにコミットしない
  - `GOOGLE_APPLICATION_CREDENTIALS` で指定

### 入力検証

- **ユーザー発話**: 音声認識の結果をそのまま LLM に渡す
  - 現状はサニタイズなし（LLM 側でフィルタリング）
- **構造化出力**: Pydantic モデルでバリデーション
  - 不正な JSON は ADK が自動的にリトライ

### 外部通信

- **MCP Server**: HTTPS 推奨（現状は HTTP も許可）
- **Google API**: HTTPS で暗号化済み

### データプライバシー

- **会話履歴**: ローカル（`%APPDATA%/vtuber-behavior-engine/db`）に保存
- **Google Cloud**: 音声データと LLM プロンプトは Google に送信
  - Google のプライバシーポリシーに従う
- **ログファイル**: 機密情報を含む可能性（`logs/` ディレクトリ）
  - 本番環境では適切にアクセス制御

## 既知の技術的負債

### 1. テストカバレッジの不足

**現状**: 最小限のテストのみ実装

**影響**: リグレッションのリスク

**対応策**:

- ユニットテストと統合テストを追加
- カバレッジ 80% 以上を目標

### 2. エラーハンドリングの不統一

**現状**: 一部のエラーをキャッチしていない

**影響**: 予期しないクラッシュの可能性

**対応策**:

- 全ての外部 API 呼び出しに try-except を追加
- エラーログを充実させる

### 3. 型ヒントの不完全性

**現状**: 一部の関数で型ヒントが欠落

**影響**: mypy エラー、補完の効きにくさ

**対応策**:

- `mypy --strict` を通すようにする
- 段階的に型ヒントを追加

### 4. プロンプトのバージョン管理

**現状**: プロンプトファイルを直接編集

**影響**: プロンプトの変更履歴が追いにくい

**対応策**:

- プロンプトにバージョン番号を付ける
- A/B テストの仕組みを導入

### 5. ハードコードされた設定

**現状**: `agent_constants.py` にハードコードされた設定が多い

**影響**: 柔軟性の欠如

**対応策**:

- 設定ファイル（`config.yaml` など）に移行
- 環境変数で上書き可能にする

### 6. 音声認識のバックグラウンドスレッド管理

**現状**: `SpeechRecognitionManager` がデーモンスレッドを使用

**影響**: 終了時の不安定性

**対応策**:

- `asyncio` ベースの実装に移行
- より安全なシャットダウン処理

### 7. Chroma DB のエラーハンドリング

**現状**: DB エラーをキャッチしていない

**影響**: 保存失敗時にクラッシュ

**対応策**:

- try-except でエラーをキャッチ
- フォールバック処理を追加

## よくあるトラブルと対処法

### 問題 1: `GOOGLE_API_KEY` が設定されていない

**症状**: `ValueError: GOOGLE_API_KEY is not set`

**原因**: 環境変数が未設定

**対処法**:

```powershell
# .env ファイルに追加
GOOGLE_API_KEY=your_api_key

# または環境変数として直接設定
$env:GOOGLE_API_KEY = "your_api_key"
```

### 問題 2: Stage Director に接続できない

**症状**: `ValueError: STAGE_DIRECTOR_MCP_SERVER_URL is not set` または接続タイムアウト

**原因**: Stage Director が起動していない、または URL が間違っている

**対処法**:

```powershell
# Stage Director を起動
cd path/to/stage-director
npm run start

# URL を確認
curl http://localhost:3000/sse
```

### 問題 3: 音声認識が動作しない

**症状**: `ModuleNotFoundError: No module named 'pyaudio'` または認識結果が空

**原因**: PyAudio がインストールされていない、またはマイクが無効

**対処法**:

```powershell
# PyAudio をインストール（Windows）
pip install https://download.lfd.uci.edu/pythonlibs/archived/PyAudio-0.2.11-cp311-cp311-win_amd64.whl

# マイクのアクセス許可を確認
# Windowsの設定 > プライバシー > マイク
```

### 問題 4: Chroma DB がロックされる

**症状**: `sqlite3.OperationalError: database is locked`

**原因**: 複数のプロセスが同時に DB にアクセス

**対処法**:

```powershell
# 既存のプロセスを終了
Get-Process python | Stop-Process

# DB を削除して再作成
Remove-Item -Recurse -Force "$env:APPDATA\vtuber-behavior-engine\db"
```

### 問題 5: LLM の応答が遅い

**症状**: 各反復に 10 秒以上かかる

**原因**: プロンプトが長すぎる、またはネットワークが遅い

**対処法**:

- プロンプトを短縮する
- `max_iterations` を減らす
- より高速なモデル（`gemini-2.5-flash`）を使用

### 問題 6: メモリ不足エラー

**症状**: `MemoryError` または Python プロセスがクラッシュ

**原因**: 会話履歴が大きすぎる

**対処法**:

```powershell
# Chroma DB をクリア
Remove-Item -Recurse -Force "$env:APPDATA\vtuber-behavior-engine\db"

# ログファイルを削除
Remove-Item logs/*.log
```

### 問題 7: 型チェックエラー

**症状**: `mypy` で多数のエラー

**原因**: Google ライブラリのスタブが不足

**対処法**:

```toml
# pyproject.toml に追加
[[tool.mypy.overrides]]
module = "google.*"
ignore_missing_imports = true
```

## 制約事項

### 1. LLM の制約

- **トークン数制限**: Gemini は最大 1M トークン（入力 + 出力）
- **レート制限**: API の無料枠では 1 分あたり 60 リクエスト
- **出力形式**: JSON モードでも 100% 正確な JSON を保証しない
  - ADK が自動的にリトライ（最大 3 回）

### 2. 音声認識の制約

- **言語**: 現在は日本語のみ対応（`ja-JP`）
- **環境音**: ノイズが多いと認識精度が低下
- **リアルタイム性**: ネットワーク遅延の影響を受ける

### 3. MCP プロトコルの制約

- **同期実行**: 複数の `speak` を並列実行不可（順次実行）
- **エラーハンドリング**: MCP Server のエラーは上流に伝播
- **接続管理**: 長時間接続すると切断される可能性

### 4. ADK の制約

- **エージェント間通信**: `disallow_transfer_*` で制御
  - デフォルトでは他エージェントへの制御移譲を禁止
- **セッション永続化**: `InMemorySessionService` はメモリ内のみ
  - プロセス終了で消失
- **ツール呼び出し**: LLM が適切にツールを呼び出すとは限らない

### 5. Chroma DB の制約

- **ローカルのみ**: リモート DB は未対応
- **同時アクセス**: 複数プロセスからのアクセスは非推奨
- **スケーラビリティ**: 大規模データには向かない（数万件まで）

### 6. Python バージョン

- **最小**: Python 3.11
- **`|` 型結合演算子**: Python 3.10+ で動作
- **非推奨**: Python 3.9 以下は未サポート

## プラットフォーム固有の注意事項

### Windows

- **PyAudio**: 事前ビルド済み wheel が必要
- **パス**: `%APPDATA%` を使用（`os.getenv('APPDATA')`）
- **PowerShell**: コマンド実行は PowerShell を推奨

### Linux/macOS

- **PyAudio**: `portaudio` ライブラリが必要

```bash
# Ubuntu/Debian
sudo apt-get install portaudio19-dev

# macOS
brew install portaudio
```

- **パス**: `$HOME/.local/share/vtuber-behavior-engine/db`
- **シェル**: bash/zsh を使用

## デバッグのヒント

### ログレベルの変更

```python
# utils/logger.py を編集
logging.basicConfig(level=logging.DEBUG)  # INFO から DEBUG に変更
```

### ADK のデバッグモード

```python
# 環境変数で有効化
import os
os.environ['ADK_DEBUG'] = 'true'
```

### MCP 通信のログ

```python
# stage_director_mcp_client.py でログを追加
logger.debug(f"MCP request: {tool_name}, {arguments}")
logger.debug(f"MCP response: {response}")
```

### プロンプトのデバッグ

```python
# character_agent.py でプロンプトを出力
logger.info(f"Prompt: {prompt}")
```

## パフォーマンス測定

### 処理時間の測定

```python
import time

start = time.time()
result = await some_function()
elapsed = time.time() - start
logger.info(f"Elapsed: {elapsed:.2f}s")
```

### メモリ使用量の測定

```python
import tracemalloc

tracemalloc.start()
# コード実行
current, peak = tracemalloc.get_traced_memory()
logger.info(f"Current memory: {current / 1024 / 1024:.2f} MB")
logger.info(f"Peak memory: {peak / 1024 / 1024:.2f} MB")
tracemalloc.stop()
```

## ライセンス制約

### MIT ライセンス

- 本プロジェクトは MIT ライセンス
- 商用利用可能
- 再配布時はライセンス表記が必要

### 依存ライブラリのライセンス

- **Google ADK**: Apache 2.0
- **Gemini API**: Google の利用規約に従う
- **Chroma**: Apache 2.0
- **PyAudio**: MIT

### 著作権表記

各ソースファイルの先頭に以下を記載：

```python
#  Copyright (c) 2025 LongbowXXX
#
#  This software is released under the MIT License.
#  http://opensource.org/licenses/mit-license.php
```

## 今後の改善計画

### 短期（1-3 ヶ月）

- [ ] テストカバレッジ 80% 達成
- [ ] エラーハンドリングの統一
- [ ] 型ヒントの完全化
- [ ] ドキュメントの充実

### 中期（3-6 ヶ月）

- [ ] 設定ファイルの導入
- [ ] CI/CD パイプラインの構築
- [ ] パフォーマンス最適化
- [ ] E2E テストの実装

### 長期（6 ヶ月以降）

- [ ] 音声認識の asyncio 化
- [ ] Chroma DB の代替検討（Pinecone, Weaviate など）
- [ ] マルチモーダル対応（画像、動画）
- [ ] 分散エージェント対応
