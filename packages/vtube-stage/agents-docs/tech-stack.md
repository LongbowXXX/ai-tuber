<!-- このドキュメントは .github/prompts/document-project.prompt.md によって生成・更新されています -->

# 技術スタックと依存関係

## 主要な技術スタック

| カテゴリ              | 技術              | バージョン |
| --------------------- | ----------------- | ---------- |
| **言語**              | TypeScript        | ~5.7.2     |
| **フレームワーク**    | React             | ^19.0.0    |
| **ビルドツール**      | Vite              | ^6.3.1     |
| **3D レンダリング**   | Three.js          | ^0.175.0   |
| **VRM**               | @pixiv/three-vrm  | ^3.4.0     |
| **UI フレームワーク** | Material UI (MUI) | ^7.0.2     |
| **スタイリング**      | styled-components | ^6.1.18    |

## 主要な依存ライブラリ

### 3D グラフィックス

| ライブラリ                   | バージョン | 用途                                                                |
| ---------------------------- | ---------- | ------------------------------------------------------------------- |
| `three`                      | ^0.175.0   | 3D レンダリングエンジン                                             |
| `@react-three/fiber`         | ^9.1.2     | React 用 Three.js レンダラー                                        |
| `@react-three/drei`          | ^10.0.6    | R3F 用ヘルパーコンポーネント（OrbitControls, Environment, Html 等） |
| `@pixiv/three-vrm`           | ^3.4.0     | VRM モデルのロードとレンダリング                                    |
| `@pixiv/three-vrm-animation` | ^3.4.0     | VRMA アニメーションのサポート                                       |

### UI / スタイリング

| ライブラリ            | バージョン | 用途                              |
| --------------------- | ---------- | --------------------------------- |
| `@mui/material`       | ^7.0.2     | Material Design UI コンポーネント |
| `@mui/icons-material` | ^7.0.2     | MUI アイコン                      |
| `@emotion/react`      | ^11.14.0   | MUI 用 CSS-in-JS                  |
| `@emotion/styled`     | ^11.14.0   | MUI 用スタイリング                |
| `styled-components`   | ^6.1.18    | CSS-in-JS スタイリング            |

### Markdown レンダリング

| ライブラリ       | バージョン | 用途                                       |
| ---------------- | ---------- | ------------------------------------------ |
| `react-markdown` | ^10.1.0    | Markdown を React コンポーネントとして表示 |
| `remark-gfm`     | ^4.0.1     | GitHub Flavored Markdown サポート          |

### HTTP / 通信

| ライブラリ             | バージョン | 用途                                 |
| ---------------------- | ---------- | ------------------------------------ |
| `axios`                | ^1.9.0     | HTTP クライアント（VOICEVOX API 用） |
| WebSocket (ネイティブ) | -          | サーバーとのリアルタイム通信         |

### バリデーション / 変換

| ライブラリ          | バージョン | 用途                                          |
| ------------------- | ---------- | --------------------------------------------- |
| `class-validator`   | ^0.14.2    | クラスベースのバリデーション                  |
| `class-transformer` | ^0.5.1     | プレーンオブジェクト ⇔ クラスインスタンス変換 |
| `reflect-metadata`  | ^0.2.2     | デコレータメタデータ（class-transformer 用）  |

## 開発用依存ライブラリ

### ビルド / コンパイル

| ライブラリ             | バージョン | 用途                       |
| ---------------------- | ---------- | -------------------------- |
| `vite`                 | ^6.3.1     | 開発サーバー、ビルドツール |
| `@vitejs/plugin-react` | ^4.3.4     | Vite React プラグイン      |
| `typescript`           | ~5.7.2     | TypeScript コンパイラ      |

### リント / フォーマット

| ライブラリ                    | バージョン | 用途                           |
| ----------------------------- | ---------- | ------------------------------ |
| `eslint`                      | ^9.22.0    | JavaScript/TypeScript リンター |
| `typescript-eslint`           | ^8.26.1    | ESLint TypeScript サポート     |
| `eslint-plugin-react-hooks`   | ^5.2.0     | React Hooks ルール             |
| `eslint-plugin-react-refresh` | ^0.4.19    | React Refresh ルール           |
| `eslint-config-prettier`      | ^10.1.2    | Prettier との競合回避          |
| `prettier`                    | ^3.5.3     | コードフォーマッター           |

### 型定義

| ライブラリ         | バージョン | 用途            |
| ------------------ | ---------- | --------------- |
| `@types/react`     | ^19.0.10   | React 型定義    |
| `@types/react-dom` | ^19.0.4    | ReactDOM 型定義 |
| `@types/three`     | ^0.175.0   | Three.js 型定義 |

## 外部サービスとの連携

### stage-director (バックエンド)

- **用途**: コマンド送受信、アプリケーション制御
- **プロトコル**: WebSocket
- **エンドポイント設定**: `VITE_STAGE_DIRECTER_ENDPOINT` 環境変数
- **メッセージ形式**: JSON

```typescript
// 受信コマンド例
{
  "command": "speak",
  "payload": {
    "characterId": "avatar1",
    "message": "こんにちは",
    "caption": "こんにちは",
    "emotion": "happy",
    "speakId": "uuid-xxx"
  }
}

// 送信メッセージ例
{
  "command": "speakEnd",
  "payload": { "speakId": "uuid-xxx" }
}
```

### VOICEVOX (TTS エンジン)

- **用途**: テキスト音声合成
- **プロトコル**: HTTP REST API
- **エンドポイント設定**: `VITE_VOICEVOX_API_BASE` 環境変数
- **有効/無効**: `VITE_TTS_ENABLED` 環境変数 (`'false'` で無効)

```bash
# 使用エンドポイント
POST /audio_query?text={text}&speaker={speakerId}
POST /synthesis?speaker={speakerId}
```

## 開発ツール

### ビルドツール

- **Vite**: 高速な開発サーバーと最適化されたビルド
- **TypeScript**: 型安全な開発

### テストフレームワーク

- 現在、テストフレームワークは未設定

### CI/CD

- 現在、CI/CD は未設定

## 環境変数

| 変数名                         | 必須 | 説明                                     |
| ------------------------------ | ---- | ---------------------------------------- |
| `VITE_STAGE_DIRECTER_ENDPOINT` | ✅   | WebSocket サーバー URL                   |
| `VITE_VOICEVOX_API_BASE`       | ❌   | VOICEVOX API ベース URL                  |
| `VITE_TTS_ENABLED`             | ❌   | TTS 有効/無効 (`'false'` で無効)         |
| `VITE_DEBUG_SIDEBAR`           | ❌   | デバッグサイドバー表示 (`'true'` で表示) |

## npm スクリプト

| コマンド               | 説明                                              |
| ---------------------- | ------------------------------------------------- |
| `npm run dev`          | 開発サーバー起動                                  |
| `npm run build`        | 本番ビルド（TypeScript コンパイル + Vite ビルド） |
| `npm run preview`      | ビルド結果のプレビュー                            |
| `npm run lint`         | ESLint 実行                                       |
| `npm run format`       | Prettier でフォーマット                           |
| `npm run format:check` | Prettier フォーマットチェック                     |

## ブラウザサポート

- モダンブラウザ（Chrome, Firefox, Edge, Safari）
- WebGL 2.0 サポートが必要
- WebSocket サポートが必要
