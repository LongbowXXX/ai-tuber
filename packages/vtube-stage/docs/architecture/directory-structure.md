<!-- This document is generated and updated by .github/prompts/doc-sync.prompt.md -->

# ディレクトリ構造

## フォルダ構成

```
vtube-stage/
├── public/              # 静的アセット
│   ├── avatar/          # VRM モデルファイル
│   ├── vrma/            # VRM アニメーションファイル
│   └── avatars.json     # アバター一覧定義
├── src/                 # ソースコード
│   ├── assets/          # 画像、フォントなどのアセット
│   ├── components/      # React コンポーネント
│   ├── contexts/        # React Context (状態管理 - 現在はプレースホルダ)
│   ├── hooks/           # カスタムフック (ロジックの分離)
│   ├── pages/           # ページコンポーネント
│   ├── services/        # 外部サービスとの連携 (TTS等)
│   ├── types/           # TypeScript 型定義
│   ├── utils/           # ユーティリティ関数
│   ├── App.tsx          # メインコンポーネント
│   └── main.tsx         # エントリーポイント
└── docs/                # プロジェクトドキュメント
```

## 各ディレクトリの役割

| ディレクトリ     | 役割                                       | 主要なファイル                                                                             |
| :--------------- | :----------------------------------------- | :----------------------------------------------------------------------------------------- |
| `src/components` | UI 部品および 3D オブジェクトの定義        | `VRMAvatar.tsx`, `SceneContent.tsx`, `SpeechBubble.tsx`, `VRMController.tsx`               |
| `src/hooks`      | ビジネスロジック、WebSocket 通信、VRM 制御 | `useStageCommandHandler.ts`, `useVrmModel.ts`, `useFacialExpression.ts`, `useWebSocket.ts` |
| `src/services`   | 外部 API (VOICEVOX 等) との通信            | `tts_service.ts`                                                                           |
| `src/types`      | コマンドやモデルの型定義                   | `command.ts`, `avatar_types.ts`, `scene_types.ts`                                          |
| `src/utils`      | 共通ユーティリティ                         | `command_validator.ts`                                                                     |
| `public/vrma`    | キャラクターの動作定義                     | `idle_pose.vrma`, `wave_pose.vrma`                                                         |

## 依存関係

- **Three.js 関連**: `three`, `@react-three/fiber`, `@pixiv/three-vrm` がコアの描画を担います。
- **UI 関連**: `MUI (Material UI)` と `styled-components` を使用して UI を構築しています。
- **通信**: 標準の `WebSocket` API を使用して `stage-director` と通信します。
