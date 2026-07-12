# AGENTS.md - VTuber Stage

> AI V-Tuber システムのフロントエンドであり、VRM モデルの描画、アニメーション、表情制御を担当します。

このファイルは、このプロジェクトで作業する AI コーディングエージェントのためのコンテキストと指示を提供します。

## 1. エグゼクティブサマリー

**目的**: リアルタイムで V-Tuber キャラクターを描画し、バックエンドからのコマンドに基づいて表情や動作を制御する。
**タイプ**: Web アプリケーション (フロントエンド)
**ステータス**: 開発中 (Experimental)

## 2. アーキテクチャと技術スタック

### 主要技術

| カテゴリ        | テクノロジー     | バージョン | 用途               |
| :-------------- | :--------------- | :--------- | :----------------- |
| 言語            | TypeScript       | 5.7        | 主要言語           |
| フレームワーク  | React            | 19.0       | Web フレームワーク |
| 3D レンダリング | Three.js         | 0.175      | 3D グラフィックス  |
| VRM 制御        | @pixiv/three-vrm | 3.4        | VRM モデル操作     |

### アーキテクチャパターン

- **コンポーネントベース**: React を使用した UI と 3D シーンの構築。
- **カスタムフック**: 3D モデルのロード、WebSocket 通信、コマンド処理などのロジックを分離。
- **サービスレイヤー**: TTS (音声合成) などの外部 API 連携をカプセル化。

## 3. ディレクトリ構造

```
vtube-stage/
├── public/              # 静的アセット (VRM, VRMA)
├── src/                 # ソースコード
│   ├── components/      # React コンポーネント
│   ├── hooks/           # カスタムフック
│   ├── services/        # 外部サービス連携
│   ├── types/           # 型定義
│   └── utils/           # ユーティリティ
└── docs/                # プロジェクトドキュメント
```

### 主要ディレクトリ

| ディレクトリ     | 用途                      | 主要ファイル                                                     |
| :--------------- | :------------------------ | :--------------------------------------------------------------- |
| `src/components` | UI および 3D オブジェクト | `VRMAvatar.tsx`, `SceneContent.tsx`                              |
| `src/hooks`      | ビジネスロジック          | `useStageCommandHandler.ts`, `useVrmModel.ts`, `useWebSocket.ts` |

## 4. 主要概念 (ユビキタス言語)

| 用語               | 定義                           | 例                   |
| :----------------- | :----------------------------- | :------------------- |
| **VRM**            | 3D アバターの標準フォーマット  | `avatar.vrm`         |
| **BlendShape**     | 表情を制御するパラメータ       | `Joy`, `Angry`, `Aa` |
| **Stage Director** | コマンドを送信するバックエンド | WebSocket 経由の指示 |

## 5. エントリーポイント

| エントリーポイント | 場所                      | 用途                               |
| :----------------- | :------------------------ | :--------------------------------- |
| メイン             | `src/main.tsx`            | アプリケーションのブートストラップ |
| ページ             | `src/pages/StagePage.tsx` | メインの配信画面                   |

## 6. 開発ルール (憲法要約)

### 遵守事項

- 複雑なロジックは必ずカスタムフックに抽出すること。
- VRM モデルの操作は `@pixiv/three-vrm` の API を通じて行うこと。

### 禁止事項

- React コンポーネント外での直接的な DOM 操作。
- 型定義なしでの `any` の多用。

### 使用すべきパターン

- 外部 API 連携のための Service パターン。
- 状態管理のための React Context パターン。

## 7. クイックリファレンス

### 共通コマンド

```bash
# 開発サーバーの起動
npm run dev

# リンターの実行
npm run lint

# コードの整形
npm run format

# ビルド
npm run build
```

### AI エージェントのための重要ファイル

| 用途               | ファイル                          |
| :----------------- | :-------------------------------- |
| プロジェクトルール | `.github/copilot-instructions.md` |
| アーキテクチャ概要 | `docs/architecture/overview.md`   |
| API 型定義         | `src/types/command.ts`            |

## 8. ドキュメントインデックス

詳細については、以下のドキュメントを参照してください：

- [アーキテクチャ概要](docs/architecture/overview.md)
- [ディレクトリ構造](docs/architecture/directory-structure.md)
- [コーディング規約](docs/rules/coding-conventions.md)
- [主要なフロー](docs/architecture/key-flows.md)
- [技術スタック](docs/architecture/tech-stack.md)
- [テスト戦略](docs/rules/testing.md)
- [制約事項と既知の課題](docs/architecture/constraints.md)
- [用語集](docs/glossary.md)

## 9. ナレッジベース

→ **詳細**: [knowledge/](./knowledge/)
