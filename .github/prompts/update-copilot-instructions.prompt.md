# GitHub Copilot カスタム命令の作成・更新

あなたは GitHub Copilot のカスタム命令ファイルを作成・更新する専門家です。
プロジェクトの `agents-docs/*` ドキュメントと既存のファイルを分析し、最適なカスタム命令を生成します。

## ステップ 1: 公式ドキュメントの取得（必須）

**最初に必ず以下のアクションを実行してください:**

1. `fetch` ツールを使用して以下の URL からカスタム命令の公式ドキュメントを取得:
   - URL: `https://code.visualstudio.com/docs/copilot/customization/custom-instructions`

このドキュメントには、カスタム命令ファイルの形式、ベストプラクティスが記載されています。

## ステップ 2: プロジェクト情報の収集

以下のファイルを読み込んでプロジェクトの全体像を把握してください：

1. **アーキテクチャ**: `agents-docs/architecture.md`
2. **ディレクトリ構造**: `agents-docs/directory-structure.md`
3. **コーディング規約**: `agents-docs/coding-conventions.md`
4. **技術スタック**: `agents-docs/tech-stack.md`
5. **テスト戦略**: `agents-docs/testing.md`
6. **主要フロー**: `agents-docs/key-flows.md`
7. **制約と注意事項**: `agents-docs/constraints-and-gotchas.md`
8. **既存のカスタム命令**: `.github/copilot-instructions.md`
9. **既存の言語別命令**: `.github/instructions/*.instructions.md`（存在する場合）

## ステップ 3: カスタム命令ファイルの作成・更新

### 3.1 `.github/copilot-instructions.md` の作成・更新

**目的**: プロジェクト全体に適用される基本的なガイドライン

**必須セクション**:

1. **プロジェクト概要**: 何をするプロジェクトか簡潔に説明
2. **技術スタック**: 主要な言語・フレームワーク・ライブラリ
3. **アーキテクチャ概要**: システム構成の要点
4. **開発ワークフロー**: 環境構築・実行・テストの基本コマンド
5. **コーディング規約**: 命名規則・スタイルの重要ポイント
6. **品質管理**: フォーマッター・リンター・型チェッカー
7. **詳細ドキュメントへのリンク**: `agents-docs/*` への参照

**重要な原則**:

- **重要情報は必ず記載**: Copilot がリンク先を読む保証がないため、重要情報は `copilot-instructions.md` に直接記載する（重複を許容）
- **簡潔に保つ**: 各セクションは短く、自己完結的に
- **Markdown リンク**: 詳細は `agents-docs/*` へのリンクで参照

### 3.2 `.github/instructions/*.instructions.md` の作成

**目的**: 特定のファイルタイプや言語に適用される詳細ガイドライン

**ファイル構成**:

```markdown
---
applyTo: "**/*.py" # 適用対象のグロブパターン
---

# Python コーディング規約

（本文）
```

**作成すべきファイル（このプロジェクトの場合）**:

1. **python.instructions.md**: Python コードの規約

   - `applyTo: "**/*.py"`
   - 型ヒント、非同期プログラミング、Pydantic モデル、ADK エージェント

2. **prompt.instructions.md**: プロンプトテンプレートの規約

   - `applyTo: "**/resources/**/*.md"`
   - プレースホルダー形式、構造化の方針

3. **test.instructions.md**: テストコードの規約
   - `applyTo: "**/tests/**/*.py"`
   - pytest の使い方、モック、非同期テスト

**重要な原則**:

- **基本情報は記載**: 重要な規約は `.instructions.md` にも記載する
- **詳細はリンク**: 詳細な説明は `agents-docs/*` へのリンクで参照
- **applyTo を適切に設定**: グロブパターンでファイルを絞り込む

## ステップ 4: 出力形式

### 作成・更新するファイル一覧を提示

変更前に以下を確認してください：

1. 作成・更新するファイルのリスト
2. 各ファイルの目的と適用範囲
3. 主な変更内容の要約

### ファイルの作成・更新

ユーザーの承認を得たら、ファイルを作成・更新してください。

## 公式ドキュメントのベストプラクティス

- **短く自己完結的に**: 各命令は単一の明確なステートメント
- **タスク・言語別に分割**: 複数の `.instructions.md` で管理
- **プロジェクト固有の命令はワークスペースに保存**: チーム共有とバージョン管理
- **再利用と参照**: プロンプトファイルやカスタムエージェントで命令ファイルを参照

---

**入力変数**:

- `${input:updateScope:更新範囲（all/copilot-instructions/instructions）}` - 更新するファイルの範囲

**実行方法**:

チャットで `/update-copilot-instructions` と入力し、プロンプトに従ってください。
