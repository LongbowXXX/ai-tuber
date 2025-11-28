# GitHub Copilot を活用した開発ガイド

このドキュメントでは、`vtuber-behavior-engine` プロジェクトで GitHub Copilot を最大限に活用するための設定と使い方を解説します。

## 目次

1. [はじめに](#はじめに)
2. [推奨環境のセットアップ](#推奨環境のセットアップ)
3. [プロジェクト固有の Copilot 設定](#プロジェクト固有の-copilot-設定)
4. [カスタム Agent の使い方](#カスタム-agent-の使い方)
5. [カスタムプロンプトの使い方](#カスタムプロンプトの使い方)
6. [効果的な Copilot の活用方法](#効果的な-copilot-の活用方法)
7. [プロジェクトドキュメントの活用](#プロジェクトドキュメントの活用)
8. [トラブルシューティング](#トラブルシューティング)

---

## はじめに

このプロジェクトは、Copilot がプロジェクト固有のコンテキストを理解し、適切なコード生成やアドバイスを行えるように最適化されています。

**主な最適化ポイント:**

- **カスタム命令 (`.github/copilot-instructions.md`)**: プロジェクト概要、コーディング規約を Copilot に伝える
- **ファイル別命令 (`.github/instructions/`)**: Python、テスト、プロンプトテンプレート用の個別規約
- **カスタムプロンプト (`.github/prompts/`)**: よく使う作業を効率化するプロンプトテンプレート
- **LLM 向けドキュメント (`agents-docs/`)**: Copilot がプロジェクトを深く理解するための詳細ドキュメント

---

## 推奨環境のセットアップ

### 1. 推奨拡張機能のインストール

VS Code でプロジェクトを開くと、推奨拡張機能のインストールを促されます。以下の拡張機能がインストールされていることを確認してください:

**Python 開発用:**

- `ms-python.python` - Python 言語サポート
- `ms-python.debugpy` - デバッガー
- `ms-python.black-formatter` - Black フォーマッター
- `ms-python.flake8` - Flake8 リンター
- `ms-python.mypy-type-checker` - Mypy 型チェッカー

**GitHub 連携:**

- `github.vscode-pull-request-github` - Pull Request 管理
- `github.vscode-github-actions` - GitHub Actions

> 💡 **Tip**: 推奨拡張機能は `.vscode/extensions.json` で定義されています。

### 2. Python 環境の準備

```powershell
# 仮想環境の作成と有効化
uv venv
.\.venv\Scripts\Activate.ps1

# 依存関係のインストール（開発用）
uv sync --extra dev

# 環境変数の設定
cp .env_sample .env
# .env を編集して API キーを設定
```

### 3. VS Code 設定の確認

プロジェクトの `.vscode/settings.json` により、以下が自動的に設定されます:

- **保存時の自動フォーマット** (`black`)
- **リンター・型チェッカーの有効化** (仮想環境から読み込み)
- **pytest の有効化**
- **Copilot のロケール設定** (日本語)

---

## プロジェクト固有の Copilot 設定

### カスタム命令の仕組み

Copilot Chat を使用すると、`.github/copilot-instructions.md` の内容が自動的に参照されます。この命令には以下が含まれています:

| セクション       | 内容                                  |
| ---------------- | ------------------------------------- |
| プロジェクト概要 | ADK ベースの AI VTuber システムの説明 |
| 技術スタック     | Python、ADK、Gemini API など          |
| アーキテクチャ   | エージェント構成とデータフロー        |
| コーディング規約 | 型ヒント、命名規則、ロギング          |
| 環境変数         | 必須の設定値                          |
| よくあるトラブル | 問題と対処法                          |

### ファイル別の追加命令

特定のファイルを編集する際、追加の命令が自動的に適用されます:

| パターン               | 命令ファイル             | 内容                         |
| ---------------------- | ------------------------ | ---------------------------- |
| `**/*.py`              | `python.instructions.md` | Python コーディング規約      |
| `**/tests/**/*.py`     | `test.instructions.md`   | テストの書き方               |
| `**/resources/**/*.md` | `prompt.instructions.md` | プロンプトテンプレートの規約 |

> 💡 これにより、Copilot は自動的にプロジェクトの規約に従ったコードを生成します。

---

## カスタム Agent の使い方

`.github/agents/` ディレクトリには、プロジェクト専用のカスタム Agent が定義されています。

### VTuberPlan Agent

**ファイル:** `.github/agents/vtuber-plan.agent.md`

このプロジェクト専用の**計画作成エージェント**です。新機能の追加や既存機能の改善を行う前に、このエージェントを使って計画を立てることで、プロジェクトの設計・規約に沿った実装ができます。

#### 呼び出し方

Copilot Chat を開き、チャット入力欄の**右下にあるエージェントのドロップダウン**から `VTuberPlan` を選択します。

選択後、通常通りチャットに質問を入力すると、VTuberPlan Agent が応答します:

```
新しいステージ「クイズステージ」を追加したい
```

#### 特徴

- **プロジェクト知識の組み込み**: アーキテクチャ、ディレクトリ構造、コーディング規約を理解
- **調査と計画の自動化**: 関連ファイルを調査し、影響範囲を特定
- **コーディング規約チェック**: 型ヒント、著作権表記、テストなどの確認項目を含む計画を作成
- **実装への引き継ぎ**: 計画完了後、「実装を開始」で通常の Agent に引き継ぎ可能

#### 使用例

```
@VTuberPlan ニュースエージェントに YouTube コメント取得機能を追加したい
```

出力例:

```markdown
## 計画：YouTube コメント取得機能の追加

YouTube コメントをリアルタイムで取得し、ニュース解説に
視聴者の反応を反映させる機能を追加します。

### 影響範囲

- **新規ファイル**: services/youtube_comment_provider.py
- **変更ファイル**: stage_agents/news/news_context_agent.py
- **依存コンポーネント**: news_agent_constants.py

### ステップ

1. `youtube_comment_provider.py` で YouTube API クライアントを実装
2. `news_agent_constants.py` に STATE_YOUTUBE_COMMENTS を追加
3. ...

### コーディング規約チェック

- [ ] 型ヒント完備
- [ ] 著作権表記
- [ ] ステートキー定義
- [ ] テスト追加
```

#### 計画から実装へ

計画に納得したら、Chat 下部に表示される「**実装を開始**」ボタンをクリックすると、通常の Agent が計画に基づいて実装を開始します。

---

## カスタムプロンプトの使い方

`.github/prompts/` ディレクトリには、よく使う作業を効率化するプロンプトテンプレートが用意されています。

### プロンプトの呼び出し方

1. **Copilot Chat を開く** (`Ctrl+Shift+I` または `Ctrl+Alt+I`)
2. **`/` を入力** してプロンプトを選択

または、コマンドパレット (`Ctrl+Shift+P`) から:

```
Copilot: Run Chat Prompt from File
```

### 利用可能なプロンプト

#### 1. TODO/FIXME 実装 (`implement-todo.prompt.md`)

コード内の TODO や FIXME コメントを自動実装します。

**使い方:**

1. TODO コメントを含むコードを選択
2. Copilot Chat で `/implement-todo` を選択
3. Copilot が TODO の内容を理解し、実装を提案

```python
# 例: 選択するコード
def process_data(data):
    # TODO: 入力検証を追加
    # TODO: エラーハンドリングを実装
    return data
```

#### 2. プロジェクトドキュメント整備 (`py-adk-document-project.prompt.md`)

`agents-docs/` のドキュメントを自動更新します。

**使い方:**

1. Copilot Chat で `/py-adk-document-project` を選択
2. オプションで特定モジュールを指定

```
# 全体更新
/py-adk-document-project

# 特定モジュールにフォーカス
/py-adk-document-project src/services モジュールについて詳しく
```

#### 3. セッション保存 (`save-copilot-session.prompt.md`)

Copilot との有益なやり取りを記録して、ナレッジとして共有します。

**使い方:**

1. 有益な会話が終わったら `/save-copilot-session` を実行
2. `copilot_log/` に Markdown ファイルが生成される

**出力例:**

```
copilot_log/20251128_エージェント実装相談.md
```

#### 4. その他のプロンプト

| プロンプト                              | 用途                               |
| --------------------------------------- | ---------------------------------- |
| `check-doc-consistency.prompt.md`       | ドキュメントと実装の整合性チェック |
| `create-custom-prompt.prompt.md`        | 新しいカスタムプロンプトの作成     |
| `update-copilot-instructions.prompt.md` | カスタム命令の更新                 |
| `py-adk-review-prompt.prompt.md`        | ADK プロンプトのレビュー           |
| `create-plan-agent.prompt.md`           | 計画エージェントの作成             |

---

## 効果的な Copilot の活用方法

### 1. コード生成（Copilot Chat）

```
@workspace 新しい MCP ツールを作成してください。
キャラクターのポーズを変更する trigger_animation ツールです。
```

Copilot は以下を自動的に考慮します:

- 既存の MCP クライアント実装 (`stage_director_mcp_client.py`)
- Pydantic モデルの使用
- 著作権表記とコーディング規約

### 2. コードレビュー・改善

```
@workspace このコードをレビューしてください:
- プロジェクトの規約に従っているか
- エラーハンドリングは適切か
- 型ヒントは正しいか
```

### 3. テストの生成

```
@workspace stage_director_mcp_client.py のユニットテストを作成してください。
```

Copilot は `test.instructions.md` の規約に従って:

- `tests/tests_vtuber_behavior_engine/` に配置
- pytest + pytest-asyncio を使用
- AAA パターンで構造化
- 適切なモックを使用

### 4. ドキュメント参照

プロジェクトの設計について質問できます:

```
@workspace このプロジェクトのエージェント構成を教えてください。
```

Copilot は `agents-docs/` のドキュメントを参照して回答します。

### 5. トラブルシューティング

```
@workspace "GOOGLE_API_KEY is not set" エラーが出ています。どうすればいいですか？
```

Copilot は `copilot-instructions.md` の「よくあるトラブル」セクションを参照します。

---

## プロジェクトドキュメントの活用

### agents-docs/ の構成

`agents-docs/` ディレクトリには、Copilot がプロジェクトを深く理解するための詳細ドキュメントがあります:

| ファイル                     | 内容                                         |
| ---------------------------- | -------------------------------------------- |
| `architecture.md`            | システム構成、コンポーネント図、データフロー |
| `directory-structure.md`     | ディレクトリ構造と各モジュールの責務         |
| `coding-conventions.md`      | 設計パターン、命名規則、コードスタイル       |
| `key-flows.md`               | 主要な機能フローのシーケンス図               |
| `tech-stack.md`              | 技術スタック、依存ライブラリ、外部サービス   |
| `testing.md`                 | テスト戦略、実行方法、ベストプラクティス     |
| `constraints-and-gotchas.md` | 技術的制約、既知の問題、対処法               |

### ドキュメントの参照方法

Copilot Chat で特定のドキュメントを参照させることができます:

```
@workspace agents-docs/architecture.md を参照して、
エージェント間のデータの流れを説明してください。
```

### ドキュメントの更新

コードを大きく変更した後は、ドキュメントの更新を検討してください:

```
/py-adk-document-project
stage_agents/ モジュールの変更を agents-docs/ に反映してください。
```

---

## トラブルシューティング

### Copilot がプロジェクト規約を無視する

**原因**: Copilot のコンテキストに命令が含まれていない可能性

**対処法**:

1. Copilot Chat で `@workspace` を使用していることを確認
2. `.github/copilot-instructions.md` が正しい場所にあるか確認
3. VS Code を再起動

### コード補完が遅い・精度が低い

**対処法**:

1. 仮想環境が有効化されているか確認 (`.\.venv\Scripts\Activate.ps1`)
2. Python 拡張機能がインデックスを完了しているか確認
3. ファイルサイズが大きすぎないか確認

### カスタムプロンプトが表示されない

**対処法**:

1. `.github/prompts/` ディレクトリが存在するか確認
2. プロンプトファイルのフロントマター (`---`) が正しいか確認
3. VS Code を再起動

### Copilot の応答が日本語でない

このプロジェクトでは日本語が設定されています:

```json
// .vscode/settings.json
"github.copilot.chat.localeOverride": "ja"
```

設定が反映されていない場合は VS Code を再起動してください。

---

## ベストプラクティス

### 1. 具体的な指示を与える

❌ 悪い例:

```
新しい機能を作って
```

✅ 良い例:

```
@workspace ニュースエージェント用の新しいコンテキストエージェントを作成してください。
- news_context_agent.py を参考にしてください
- 現在時刻とユーザー発話を STATE に設定する機能が必要です
```

### 2. コンテキストを明示的に指定

```
@workspace #file:agent_builder.py #file:character_agent.py を参考に、
新しいキャラクターエージェントを追加してください。
```

### 3. 反復的に改善する

最初の結果が完璧でなくても、フィードバックを与えて改善できます:

```
@workspace 先ほどのコードに以下の修正を加えてください:
- エラーハンドリングを追加
- ログ出力を詳細に
- 型ヒントを修正
```

### 4. セッションを記録する

有益なやり取りは `/save-copilot-session` で記録し、チームで共有しましょう。

---

## 参考リンク

- [GitHub Copilot ドキュメント](https://docs.github.com/en/copilot)
- [VS Code Copilot 拡張機能](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot)
- [Copilot Chat の使い方](https://docs.github.com/en/copilot/github-copilot-chat)

---

## 関連ドキュメント

- [プロジェクト README](../README.md)
- [カスタム命令](.github/copilot-instructions.md)
- [アーキテクチャ概要](../agents-docs/architecture.md)
- [コーディング規約](../agents-docs/coding-conventions.md)
