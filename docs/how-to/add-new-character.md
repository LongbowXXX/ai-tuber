# 新しいキャラクターを追加する方法

このガイドでは、AI-Tuber システムに新しいキャラクターを追加する手順を説明します。
キャラクターを追加するには、フロントエンド（表示用）とバックエンド（対話・行動用）の両方で設定が必要です。

## 概要

1.  **フロントエンド (`vtube-stage`)**: VRM モデルの配置と定義ファイルの更新。
2.  **バックエンド (`vtuber-behavior-engine`)**: プロンプトファイルの作成と設定ファイルの更新。

---

## 1. フロントエンド (`vtube-stage`) の設定

### 1-1. VRM ファイルの配置

新しいキャラクターの VRM モデルファイル (`.vrm`) を以下のディレクトリに配置してください。

`packages/vtube-stage/public/avatars/`

例: `packages/vtube-stage/public/avatars/avatar3.vrm`

### 1-2. アバター定義の更新

`packages/vtube-stage/public/avatars.json` を編集し、新しいキャラクターのエントリを追加します。

```json
[
  // ... 既存のキャラクター ...
  {
    "id": "avatar3", // 一意のID (バックエンドの設定と一致させる必要があります)
    "name": "新しいキャラクター名",
    "file": "avatars/avatar3.vrm", // 配置したVRMファイルのパス
    "format": "vrm",
    "scale": 1.0,
    "position": { "x": 1.5, "y": 0, "z": 0 }, // 立ち位置
    "rotation": { "x": 0, "y": -0.5, "z": 0 } // 向き
  }
]
```

---

## 2. バックエンド (`vtuber-behavior-engine`) の設定

### 2-1. キャラクタープロンプトの作成

以下のディレクトリに、キャラクターの性格や振る舞いを定義する XML ファイルを作成します。

`packages/vtuber-behavior-engine/src/vtuber_behavior_engine/stage_agents/resources/characters/`

既存の `character1.xml` などを参考に、新しいファイル（例: `character3.xml`）を作成してください。

```xml
<character id="avatar3"> <!-- フロントエンドのIDと一致させる -->
    <name>新しいキャラクター名</name>
    <core_identity>
        <!-- 性格やバックグラウンドを記述 -->
    </core_identity>
    <!-- ... その他の設定 ... -->
</character>
```

### 2-2. 設定ファイルの更新

以下の設定ファイルに新しいキャラクターを追加します。
用途に応じて `NewsAgent` 用と `PresentationAgent` 用のどちらか、または両方を更新してください。

- **News Config**: `packages/vtuber-behavior-engine/src/vtuber_behavior_engine/stage_agents/resources/news_config.yaml`
- **Presentation Config**: `packages/vtuber-behavior-engine/src/vtuber_behavior_engine/stage_agents/resources/presentation_config.yaml`

```yaml
# ... 既存の設定 ...
characters:
  # ... 既存のキャラクター ...
  - id: "avatar3" # フロントエンドのIDと一致させる
    name: "新しいキャラクター名"
    prompt_file: "characters/character3.xml" # 作成したプロンプトファイルのパス
```

---

## 3. 確認と実行

1.  **システム全体の再起動**: 設定を反映させるため、フロントエンドとバックエンドの両方を再起動してください。
2.  **動作確認**:
    - フロントエンドにキャラクターが表示されるか。
    - エージェントが新しいキャラクターとして認識され、対話に参加するか。

## トラブルシューティング

- **キャラクターが表示されない**:
  - `avatars.json` のパスが正しいか確認してください。
  - ブラウザのコンソールにエラーが出ていないか確認してください。
- **エージェントが応答しない / エラーになる**:
  - `news_config.yaml` / `presentation_config.yaml` の記述（インデントなど）が正しいか確認してください。
  - `prompt_file` のパスが正しいか確認してください。
  - バックエンドのログ (`uv run python ...` の出力) を確認してください。
