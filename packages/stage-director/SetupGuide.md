# プロジェクト開発環境セットアップガイド (VS Code + uv)

## 1. はじめに

### 目的

このドキュメントは、stage-director プロジェクトにおける標準的な Python 開発環境を Visual Studio Code (VS Code) 上に構築するための手順を説明します。開発ツールとして `uv`, `mypy`, `flake8`, `black`, `pytest` を利用し、効率的で一貫性のある開発プロセスを目指します。

### 対象読者

本プロジェクトに参加するすべての開発メンバーを対象とします。

### 前提

- VS Code がインストールされていること。
- Git がインストールされており、基本的な操作に慣れていること。
- ターミナル (コマンドプロンプト、PowerShell, bash など) の基本的な操作に慣れていること。

## 2. 開発ツールの概要

本プロジェクトでは以下のツールを使用します。

- **Visual Studio Code (VS Code):** 高機能なコードエディタ。拡張機能により Python 開発を強力にサポートします。
- **uv:** Rust 製の高速な Python パッケージ管理・仮想環境構築ツール。`pip`, `venv`, `pip-tools` などの機能を統合的に提供します。
- **mypy:** 静的型チェッカー。コード実行前に型に関するエラーを発見します。
- **flake8:** リンター。コードスタイル (PEP 8) のチェックや潜在的なバグを検出します。
- **black:** コードフォーマッター。「妥協しない」スタイルでコードを自動整形し、一貫性を保ちます。
- **pytest:** テストフレームワーク。効率的なテストの記述と実行をサポートします。

## 3. 環境構築手順

### 3.1. uv のインストール

`uv` はプロジェクトのパッケージ管理と仮想環境構築に使用します。以下のコマンドをターミナルで実行してインストールしてください。

- **macOS / Linux (bash):**

  ```bash
  curl -LsSf [https://astral.sh/uv/install.sh](https://astral.sh/uv/install.sh) | sh
  ```

- **Windows (PowerShell):**
  ```powershell
  powershell -ExecutionPolicy ByPass -c "irm [https://astral.sh/uv/install.ps1](https://astral.sh/uv/install.ps1) | iex"
  ```

インストール後、ターミナルを再起動するか、新しいターミナルを開いて以下のコマンドでバージョンが表示されることを確認してください。

```bash
uv --version
```

もし `uv` コマンドが見つからない場合は、インストール時に表示された指示に従って PATH 環境変数を設定するか、PC を再起動してみてください。

`uv` 自体を最新版にアップデートする場合は以下のコマンドを実行します。

```bash
uv self update
```

### 3.2. VS Code 拡張機能のインストール

VS Code を開き、以下の拡張機能をインストールしてください。拡張機能ビュー (`Ctrl+Shift+X`) で名前を検索してインストールできます。

- **必須:**
  - **Python** (発行元: Microsoft): Python 言語サポートの基本。Pylance も通常同時にインストールされます。
  - **Black Formatter** (発行元: Microsoft): `black` によるコードフォーマット連携。
  - **Flake8** (発行元: Microsoft): `flake8` によるリンティング連携。
  - **Mypy Type Checker** (発行元: Microsoft): `mypy` による型チェック連携。

- **推奨 (任意):**
  - **GitHub Copilot** (発行元: GitHub): AI コーディング支援。
  - **autoDocstring - Python Docstring Generator** (発行元: Nils Werner): Docstring の自動生成補助。
  - **GitLens — Git supercharged** (発行元: GitKraken): 高度な Git 連携機能。
  - **Indent-Rainbow** (発行元: oderwat): インデントの視覚的補助。
  - **Better Comments** (発行元: Aaron Bond): コメントのハイライト改善。

### 3.3. プロジェクトのセットアップ

1.  **仮想環境の作成:**
    stage-director プロジェクトルートで以下のコマンドを実行し、仮想環境 (`.venv`) を作成します。

    ```bash
    uv venv
    ```

    特定の Python バージョンを指定したい場合は `--python` オプションを使います (例: `uv venv --python 3.11`)。`uv` は必要に応じて Python をダウンロード・インストールすることもできます。

2.  **VS Code でプロジェクトを開く:**
    VS Code でクローンしたプロジェクトフォルダを開きます。

    ```bash
    code.
    ```

3.  **Python インタープリタの選択:**
    VS Code が自動的に `.venv` 内の Python インタープリタを検出することが多いですが、念のため確認・選択します。
    - コマンドパレット (`Ctrl+Shift+P`) を開きます。
    - `Python: Select Interpreter` と入力し、実行します。
    - リストから `./.venv/bin/python` (Linux/macOS) または `.\.venv\Scripts\python.exe` (Windows) のようなパスを持つインタープリタを選択します。推奨 (Recommended) や `uv` によって作成された旨が表示されているはずです。
    - 選択したインタープリタが VS Code ウィンドウ下部のステータスバーに表示されます。

4.  **依存関係のインストール:**
    本プロジェクトでは `pyproject.toml` で依存関係を定義し、`uv.lock` でバージョンを固定します。以下のコマンドで依存関係を仮想環境にインストール（同期）します。

    ```bash
    uv sync
    ```

## 4. 開発ワークフロー

### 4.1. コーディング

- **自動フォーマット:** Python ファイル (`.py`) を保存 (`Ctrl+S`) すると、`black` が自動的にコードをフォーマットします。
- **リアルタイムチェック:** コード編集中に `flake8` (リンティング) と `mypy` (型チェック) が問題を検出し、エディタ上に波線を表示したり、「問題 (Problems)」パネル (`Ctrl+Shift+M`) に一覧表示したりします。**`mypy` については、まず厳格なルール (`strict=true`) でチェックされます。** 型エラーが検出された場合、まずは型ヒントを追加・修正して対応してください。意図的にルールを緩和する必要がある場合は、`pyproject.toml` の `[tool.mypy]` セクションで設定を調整します。
- **コード補完など:** `Pylance` が強力なコード補完、型情報表示、定義へのジャンプなどを提供します。

### 4.2. パッケージ管理 (`uv`)

本プロジェクトでは `pyproject.toml` で依存関係を管理します。パッケージの追加・削除・更新は `uv` コマンドで行います。

**よく使う `uv` コマンド:**

- **仮想環境の作成:**
  ```bash
  uv venv [--python <version>] #.venv を作成
  ```
- **仮想環境のアクティベート:** (通常 `uv run` を使えば不要なことが多い)
  ```bash
  # Linux/macOS
  source.venv/bin/activate
  # Windows (PowerShell)
  ```

.venv\\Scripts\\Activate.ps1
\# Windows (Command Prompt)
.venv\\Scripts\\activate.bat
\`\`\`

- **依存関係の追加:** (`pyproject.toml` と `uv.lock` を更新し、環境にインストール)
  ```bash
  uv add <package_name> [<package_name2>...] # 例: uv add requests flask
  uv add --dev <package_name> # 開発用依存関係として追加
  ```
- **依存関係の削除:** (`pyproject.toml` と `uv.lock` を更新し、環境から削除)
  ```bash
  uv remove <package_name> [<package_name2>...]
  uv remove --dev <package_name> # 開発用依存関係から削除
  ```
- **環境の同期:** (`pyproject.toml` と `uv.lock` に基づいて環境を最新状態にする)
  ```bash
  uv sync
  uv sync --dev # 開発用依存関係も含めて同期
  ```
- **ロックファイルの更新:** (`pyproject.toml` の依存関係に基づいて `uv.lock` を更新)
  ```bash
  uv lock
  uv lock --upgrade # 全てのパッケージを可能な限り最新版に更新
  uv lock --upgrade-package <package_name> # 特定のパッケージを最新版に更新
  ```
- **環境内でのコマンド実行:** (仮想環境をアクティベートせずに実行)
  ```bash
  uv run <command> [<args>...] # 例: uv run python manage.py runserver
  ```
- **インストール済みパッケージ一覧:**
  ```bash
  uv pip list
  uv pip freeze # requirements.txt 形式で表示
  uv tree # 依存関係ツリー表示
  ```
- **ロックファイルのエクスポート:** (`uv.lock` の内容を `requirements.txt` 形式で出力)
  ```bash
  uv export --output-file requirements.txt
  uv export --dev --output-file requirements-dev.txt # 開発用依存関係も含める
  ```
- **ツールの実行/インストール:**
  ```bash
  uv tool run <tool_name> [<args>...] # (uvx と同等) ツールを一時的に実行
  uv tool install <package_name> # ツールを永続的にインストール
  uv tool list # インストール済みツール一覧
  uv tool uninstall <package_name> # ツールをアンインストール
  ```
- **uv 自体のアップデート:**
  ```bash
  uv self update
  ```

**`uv add` vs `uv pip install`:**

- `uv add`: **プロジェクト管理コマンド**。`pyproject.toml` と `uv.lock` を更新し、環境にパッケージを追加します。クロスプラットフォーム互換性を考慮した依存関係解決を行います。**本プロジェクトでは基本的にこちらを使用します。**
- `uv pip install`: **pip 互換コマンド**。現在アクティブな環境に直接パッケージをインストールします。`pyproject.toml` や `uv.lock` は更新しません。既存の `pip` ワークフローを置き換える場合や、一時的なインストールに使います。

**`uv pip freeze` vs `uv export`:**

- `uv pip freeze`: 現在の仮想環境に**実際にインストールされている**パッケージとそのバージョンを `requirements.txt` 形式で表示します。環境の状態を確認するのに使います。
- `uv export`: プロジェクトの**ロックファイル (`uv.lock`) に基づいて**、固定された依存関係を `requirements.txt` 形式で出力します。CI/CD などでロックファイルから環境を再現する場合に使用します。**本プロジェクトで `requirements.txt` が必要な場合はこちらを使用します。**

### 4.3. テストの実行

- **VS Code テストエクスプローラー:**
  - アクティビティバーのビーカーアイコン () をクリックしてテストエクスプローラーを開きます。
  - VS Code が自動的に `pytest` のテストを検出します。検出されない場合は、テストエクスプローラー上部の更新ボタンを押します。
  - テストエクスプローラーから、全テスト、ファイル単位、個別のテストなどを実行 () またはデバッグ () できます。
  - テスト結果はエクスプローラー内に表示され、失敗したテストの詳細を確認したり、コードにジャンプしたりできます。
- **コマンドライン:**
  仮想環境内で `pytest` を実行します。`uv run` を使うと便利です。
  ```bash
  uv run pytest [<options>] # 例: uv run pytest tests/
  ```

## 5. トラブルシューティング / FAQ

- **Q: `black`, `flake8`, `mypy` が VS Code で動作しない。**
  - **A1:** 正しい Python インタープリタ (`.venv` 内のもの) が選択されているか確認してください (手順 3.3.4)。
  - **A2:** `.vscode/settings.json` の `importStrategy` が `"fromEnvironment"` になっているか確認してください (手順 3.4)。
  - **A3:** 各ツール (`black`, `flake8`, `mypy`) が `uv sync` によって仮想環境に正しくインストールされているか確認してください (`uv pip list` で確認できます)。インストールされていない場合は `pyproject.toml` の依存関係を確認し、`uv sync` を再実行してください。
  - **A4:** VS Code を再起動してみてください。

- **Q: 保存時に自動フォーマットされない。**
  - **A1:** `.vscode/settings.json` で `"[python]": {"editor.formatOnSave": true}` が設定されているか確認してください (手順 3.4)。
  - **A2:** 同じく `"[python]": {"editor.defaultFormatter": "ms-python.black-formatter"}` が設定されているか確認してください (手順 3.4)。
  - **A3:** `Black Formatter` 拡張機能が有効になっているか確認してください。

- **Q: `pyproject.toml` で設定したルールが VS Code 上で反映されない。**
  - **A1:** `.vscode/settings.json` の `args` で古い設定ファイル (`.flake8`, `mypy.ini` など) を指定していないか確認してください。`pyproject.toml` を使う場合、通常 `args` は空または最小限にします (手順 3.4)。
  - **A2:** `pyproject.toml` の構文 (`[tool.black]`, `[tool.flake8]`, `[tool.mypy]`) が正しいか確認してください。
  - **A3:** VS Code を再起動してみてください。

- **Q: `uv` コマンドが見つからない。**
  - **A1:** `uv` が正しくインストールされているか確認してください (手順 3.1)。
  - **A2:** ターミナルを再起動するか、新しいターミナルを開いてみてください。PATH 環境変数が反映されていない可能性があります。

## 6\. 参考資料

- **uv Documentation:** [https://docs.astral.sh/uv/](https://docs.astral.sh/uv/)
- **VS Code Python Documentation:** [https://www.google.com/search?q=https://code.visualstudio.com/docs/python/overview](https://www.google.com/search?q=https://code.visualstudio.com/docs/python/overview)
- **Black Documentation:** [https://black.readthedocs.io/](https://black.readthedocs.io/)
- **Flake8 Documentation:** [https://flake8.pycqa.org/](https://flake8.pycqa.org/)
- **Mypy Documentation:** [https://mypy.readthedocs.io/](https://mypy.readthedocs.io/)
- **pytest Documentation:** [https://docs.pytest.org/](https://docs.pytest.org/)
