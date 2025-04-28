# Stage Director

AI V-Tuber システムの中央オーケストレーションハブ。

## 概要

`stage-director` は、AI コア (`vtuber-behavior-engine`) とリアルタイムレンダリングエンジン (`vtube-stage`) の間の橋渡し役として機能します。インタラクションの全体的なフローを管理し、AI が生成した応答を V-Tuber アバターへの実行可能なコマンドに変換し、セッション状態を維持します。

## アーキテクチャにおける役割

メインの [アーキテクチャドキュメント](../../docs/architecture.md) で説明されているように、`stage-director` は以下の役割を担います:

1.  入力トリガー (例: ユーザーメッセージ、システムイベント) を受信します。
2.  `vtuber-behavior-engine` と連携し (ADK の原則を使用)、対話と感情的な応答を生成します。
3.  セッション状態とコンテキストを管理します。
4.  AI の出力 (テキスト、感情ラベル) を `vtube-stage` 用の特定のコマンド (例: 対話テキスト、表情ブレンドシェイプ、ポーズデータ、視線ターゲット、潜在的な OBS コマンド) に変換します。
5.  WebSocket を介して `vtube-stage` とリアルタイムで通信します。

## 機能

- **オーケストレーション:** インタラクションのエンドツーエンドフローを管理します。
- **状態管理:** セッションコンテキストとキャラクターの状態を維持します。
- **コマンド変換:** AI の出力 (感情、対話) を VRM コマンドにマッピングします。
- **WebSocket 通信:** `vtube-stage` へのリアルタイムコマンドストリームを提供します。
- **ADK 統合:** Agent Development Kit を活用してビヘイビアエンジンと対話します。

## 技術スタック

- Python 3.11+
- FastAPI (WebSocket 通信および潜在的な API 用)
- WebSockets (`websockets` ライブラリ)
- Google Agent Development Kit (ADK) - _アーキテクチャに基づき暗黙的に使用_

## 前提条件

- Python >= 3.11
- `uv`

## インストール

1.  **`uv` を使用して仮想環境を作成します:**

    ```bash
    uv venv
    source .venv/bin/activate # Linux/macOS
    # または
    .venv\\Scripts\\activate # Windows
    ```

2.  **`uv` を使用して依存関係をインストールします:**
    ```bash
    uv sync
    uv sync --extra dev
    ```

## サービスの実行

サービスは通常、Uvicorn のような ASGI サーバーを使用して実行されます。メインアプリケーションインスタンスが `src/stage_director/main.py` にあると仮定します (このファイルと FastAPI アプリをその中に作成する必要があるかもしれません):

```bash
uvicorn stage_director.main:app --reload --host 0.0.0.0 --port 8000
```

_(注意: FastAPI アプリケーションと WebSocket エンドポイントのロジックを `src/stage_director/` に実装する必要があります)_

## 設定

設定 (例: WebSocket ポート、`vtuber-behavior-engine` への接続詳細、感情と表情のマッピング) は、以下を通じて管理されます:

- 設定ファイル (例: `.env`)

_(詳細は未定)_

## 開発

このプロジェクトでは、コードの品質を確保するためにいくつかのツールを使用しています:

- **フォーマット:** `black`
- **リンティング:** `flake8`
- **型チェック:** `mypy`
- **テスト:** `pytest`

これらのツールは、次のようなコマンドで実行できます:

```bash
black .
flake8
mypy .
pytest
```

具体的な設定については `pyproject.toml` を参照してください。

## ライセンス

このプロジェクトは MIT ライセンスの下でライセンスされています - 詳細はメインの [LICENSE](../../LICENSE) ファイルを参照してください。
