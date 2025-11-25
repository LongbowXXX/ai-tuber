# Copilot Instructions for vtube-stage

VRM アバターをリアルタイム制御するフロントエンドアプリケーション。`stage-director` バックエンドから WebSocket コマンドを受信し、表情・アニメーション・TTS を制御する。

## アーキテクチャ概要

```
stage-director (Backend) --WebSocket--> useWebSocket --> useStageCommandHandler --> StagePage --> VRMAvatar
                                                                                                     └── tts_service --> VOICEVOX API
```

- **エントリーポイント**: `src/App.tsx` → `useStageCommandHandler` で WebSocket 接続・コマンド処理
- **状態管理**: React Hooks (`useState`, `useCallback`) による状態管理、Redux 不使用
- **3D レンダリング**: React Three Fiber + `@pixiv/three-vrm` で VRM モデル表示

## 開発コマンド

```bash
npm run dev       # 開発サーバー起動 (Vite)
npm run build     # 本番ビルド
npm run lint      # ESLint 実行
npm run format    # Prettier 実行
```

## 環境変数 (`.env`)

```
VITE_STAGE_DIRECTER_ENDPOINT=ws://localhost:8080  # 必須: WebSocket エンドポイント
VITE_VOICEVOX_API_BASE=http://localhost:50021     # オプション: VOICEVOX API
VITE_TTS_ENABLED=true                              # オプション: TTS 有効/無効
```

## ファイル命名規則

| 種類                         | 規則                  | 例                             |
| ---------------------------- | --------------------- | ------------------------------ |
| React コンポーネント         | `PascalCase.tsx`      | `VRMAvatar.tsx`                |
| Hooks                        | `use*.ts` (camelCase) | `useWebSocket.ts`              |
| サービス・型・ユーティリティ | `snake_case.ts`       | `tts_service.ts`, `command.ts` |

## コード構造パターン

### Custom Hooks パターン

ロジックは必ず Hooks に分離。コンポーネントは描画に集中。

```typescript
// hooks/useVrmModel.ts - VRM ロードロジック
export function useVrmModel(vrmUrl: string, animationUrls: Record<string, string>) {
  const [isLoaded, setIsLoaded] = useState(false);
  // ...
  return { gltf, vrmRef, mixer, isLoaded };
}
```

### コマンドバリデーション

WebSocket 受信データは必ず `validateStageCommand()` でバリデーション（`class-validator` 使用）。

```typescript
// 正しい実装パターン
const validationResult = await validateStageCommand(data);
if (validationResult.errors.length === 0 && validationResult.command) {
  // コマンド処理
}
```

### コールバック Props 命名

- イベントハンドラ: `handle*` (例: `handleAvatarLoad`)
- コールバック Props: `on*` (例: `onTTSComplete`, `onAnimationEnd`)

## 重要なファイル

| ファイル                              | 責務                                                |
| ------------------------------------- | --------------------------------------------------- |
| `src/hooks/useStageCommandHandler.ts` | WebSocket コマンド処理の中心、アバター状態管理      |
| `src/components/VRMAvatar.tsx`        | VRM モデル制御、アニメーション、表情、TTS 再生      |
| `src/types/command.ts`                | コマンド型定義 (`class-validator` デコレータ付き)   |
| `public/avatars.json`                 | アバター初期設定 (ID, VRM パス, アニメーション定義) |

## パフォーマンス注意点

`useFrame` 内でのオブジェクト生成は避け、`useRef` で再利用:

```typescript
// ❌ Bad
useFrame(() => { const vec = new THREE.Vector3(); });

// ✅ Good
const tempVec = useRef(new THREE.Vector3());
useFrame(() => { tempVec.current.set(0, 0, 0); });
```

## 既知の技術的負債

1. **アニメーション 3 秒タイムアウト**: `VRMAvatar.tsx` で終了イベント未発火時の安全装置
2. **TTS 無効時 8 秒ダミー待機**: `tts_service.ts` でタイミング維持用
3. **avatars.json ハードコード**: 動的設定未対応

## 詳細ドキュメント

`agents-docs/` ディレクトリに詳細なドキュメントあり:

- `architecture.md` - システム構成図、コンポーネント階層
- `key-flows.md` - 発話・アニメーション処理フロー
- `coding-conventions.md` - 命名規則、設計パターン詳細
- `constraints-and-gotchas.md` - 技術的制約、既知の問題
