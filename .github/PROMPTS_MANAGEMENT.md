# GitHub Copilot Prompts 管理ガイド

このプロジェクトでは、モノリポジトリ環境での GitHub Copilot プロンプト管理にジャンクション（ディレクトリリンク）を使用しています。

## 構造

```
ai-tuber-system/
├── .github/
│   └── prompts/                          # マスター（実体）
│       ├── check-doc-consistency.prompt.md
│       ├── create-custom-prompt.prompt.md
│       ├── implement-todo.prompt.md
│       ├── save-copilot-session.prompt.md
│       ├── py-adk-document-project.prompt.md    # Python/ADK固有
│       └── py-adk-review-prompt.prompt.md       # Python/ADK固有
├── packages/
│   ├── vtuber-behavior-engine/
│   │   └── .github/
│   │       └── prompts/ → (ジャンクション)
│   ├── stage-director/
│   │   └── .github/
│   │       └── prompts/ → (ジャンクション)
│   └── vtube-stage/
│       └── .github/
│           └── prompts/ → (ジャンクション)
└── setup-prompts-junctions.ps1          # セットアップスクリプト
```

## 特徴

- **単一管理**: プロンプトの実体は `.github/prompts/` にのみ存在
- **全体共有**: 各パッケージのプロンプトディレクトリはジャンクション（ディレクトリリンク）
- **権限不要**: ジャンクションは管理者権限なしで作成可能
- **修正同期**: どのパッケージからでも編集すると全体に自動反映

## プロンプトの追加・編集

### 汎用プロンプトの場合

ルートの `.github/prompts/` で直接編集してください。

```powershell
# 例: 新しい汎用プロンプトを追加
New-Item -ItemType File -Path ".github\prompts\my-new-prompt.prompt.md"
```

### パッケージ固有プロンプトの場合

ファイル名に接頭辞を付けて識別しやすくしてください。

**接頭辞の例:**

- `py-adk-*`: Python + Google ADK 関連
- `fastapi-*`: FastAPI 関連
- `ts-react-*`: TypeScript + React 関連
- `threejs-*`: Three.js 関連

```powershell
# 例: FastAPI固有のプロンプトを追加
New-Item -ItemType File -Path ".github\prompts\fastapi-api-design.prompt.md"
```

## セットアップ

新しいパッケージを追加した場合や、ジャンクションが壊れた場合は以下を実行：

```powershell
.\setup-prompts-junctions.ps1
```

このスクリプトは：

1. 各パッケージの `.github/` ディレクトリを確認/作成
2. 既存のジャンクションを削除（通常のディレクトリは警告のみ）
3. ルートの `.github/prompts/` へのジャンクションを作成

## トラブルシューティング

### パッケージでプロンプトが見えない

```powershell
# ジャンクションの状態を確認
Get-Item "packages\<package-name>\.github\prompts" | Select-Object FullName, LinkType, Target

# 再セットアップ
.\setup-prompts-junctions.ps1
```

### ジャンクション作成エラー

既存の `prompts` ディレクトリが通常のディレクトリの場合、手動でバックアップ後に削除：

```powershell
# バックアップ
Move-Item "packages\<package>\.github\prompts" "packages\<package>\.github\prompts.bak"

# 再セットアップ
.\setup-prompts-junctions.ps1
```

## Git での扱い

- **ルートのみ管理**: `.github/prompts/` の実体のみが Git 管理下
- **ジャンクションは無視**: `packages/*/.github/prompts/` は `.gitignore` で除外
- **Clone 後の手順**: 他の開発者はリポジトリ clone 後に以下を実行

```powershell
# リポジトリをクローンした後
git clone https://github.com/LongbowXXX/ai-tuber.git
cd ai-tuber

# ジャンクションをセットアップ
.\setup-prompts-junctions.ps1
```

### 初回セットアップ手順（新規メンバー向け）

1. リポジトリをクローン
2. `setup-prompts-junctions.ps1` を実行
3. 各パッケージで `.github/prompts/` が利用可能になる

## 注意事項

- ジャンクションは Windows 限定の機能です
- macOS/Linux では別の方法（シンボリックリンクなど）が必要です
- プロンプトを削除する場合はルートの `.github/prompts/` で行ってください
