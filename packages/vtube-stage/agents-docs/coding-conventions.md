<!-- このドキュメントは .github/prompts/document-project.prompt.md によって生成・更新されています -->

# 設計原則とコーディング規約

## 設計原則

### 単一責任の原則 (SRP)

- 各コンポーネント・Hook は単一の責務を持つ
- 例: `useWebSocket` は WebSocket 接続のみ、`useVrmModel` は VRM ロードのみ

### 関心の分離

- **UI ロジック**: `components/` にカプセル化
- **ビジネスロジック**: `hooks/` で状態管理と処理
- **外部連携**: `services/` で API 呼び出し
- **型定義**: `types/` で型安全性を確保

### コンポーネント分割

- プレゼンテーションとコンテナの分離を意識
- 状態を持つロジックは Hooks に切り出し
- 再利用可能な UI は `components/` に配置

## 採用している設計パターン

### Custom Hooks パターン

状態管理とロジックを Hooks としてカプセル化。

```typescript
// ✅ Good: ロジックを Hook に切り出し
function useVrmModel(vrmUrl: string, ...) {
  const [isLoaded, setIsLoaded] = useState(false);
  // ... ロード処理
  return { gltf, vrmRef, mixer, isLoaded, ... };
}

// 使用側
const { gltf, isLoaded } = useVrmModel(vrmUrl, animationUrls);
```

### Callback パターン

コンポーネント間の通信を Props 経由のコールバックで実現。

```typescript
interface VRMAvatarProps {
  onTTSComplete?: (speakId: string) => void;
  onAnimationEnd?: (animationName: string) => void;
}
```

### Class-based Command パターン

コマンドを `class-validator` デコレータ付きクラスで定義し、型安全なバリデーション。

```typescript
export class SpeakCommand extends BaseCommand<'speak', SpeakPayload> {
  @ValidateNested()
  @Type(() => SpeakPayload)
  declare payload: SpeakPayload;
}
```

## 命名規則

### ファイル名

| 種類                 | 規則                   | 例                                  |
| -------------------- | ---------------------- | ----------------------------------- |
| React コンポーネント | PascalCase.tsx         | `VRMAvatar.tsx`, `StagePage.tsx`    |
| Hooks                | camelCase (use 接頭辞) | `useWebSocket.ts`, `useVrmModel.ts` |
| サービス             | snake_case             | `tts_service.ts`                    |
| 型定義               | snake_case             | `avatar_types.ts`, `command.ts`     |
| ユーティリティ       | snake_case             | `command_validator.ts`              |
| CSS                  | コンポーネント名.css   | `SpeechBubble.css`                  |

### 変数・関数名

| 種類                 | 規則                    | 例                                        |
| -------------------- | ----------------------- | ----------------------------------------- |
| 変数                 | camelCase               | `isConnected`, `loadedAnimationNames`     |
| 関数                 | camelCase               | `handleWebSocketMessage`, `playVoice`     |
| 定数                 | UPPER_SNAKE_CASE        | `ANIMATION_FADE_DURATION`, `WS_URL`       |
| React コンポーネント | PascalCase              | `VRMAvatar`, `SpeechBubble`               |
| Hooks                | use 接頭辞 + PascalCase | `useWebSocket`, `useFacialExpression`     |
| イベントハンドラ     | handle 接頭辞           | `handleAvatarLoad`, `handleEmotionChange` |
| コールバック Props   | on 接頭辞               | `onLoad`, `onTTSComplete`                 |

### 型・インターフェース名

| 種類             | 規則                     | 例                                    |
| ---------------- | ------------------------ | ------------------------------------- |
| インターフェース | PascalCase               | `AvatarState`, `StageState`           |
| 型エイリアス     | PascalCase               | `StageCommand`                        |
| Props 型         | コンポーネント名 + Props | `VRMAvatarProps`, `SceneContentProps` |
| クラス           | PascalCase               | `SpeakCommand`, `LogMessagePayload`   |

## コードスタイル

### フォーマッター

- **Prettier** を使用
- 設定は `.prettierrc` または `package.json` の `prettier` キーで定義

```bash
# フォーマット実行
npm run format

# フォーマットチェック
npm run format:check
```

### リンター

- **ESLint** を使用
- TypeScript, React Hooks, React Refresh プラグインを統合
- Prettier との競合を避けるため `eslint-config-prettier` を使用

```bash
# リント実行
npm run lint
```

### ESLint 設定のポイント

```javascript
// eslint.config.js
{
  extends: [js.configs.recommended, ...tseslint.configs.recommended, prettierConfig],
  rules: {
    ...reactHooks.configs.recommended.rules,
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
  },
}
```

## React Three Fiber 固有の規約

### useFrame での処理

毎フレーム実行される処理は `useFrame` 内に記述。

```typescript
useFrame((_state, delta) => {
  const vrm = vrmRef.current;
  if (vrm) {
    updateExpressions();
    mixer.current?.update(delta);
    vrm.update(delta);
  }
});
```

### Ref の使用

Three.js オブジェクトは `useRef` で保持。

```typescript
const vrmRef = useRef<VRM | null>(null);
const mixer = useRef<THREE.AnimationMixer | null>(null);
```

### クリーンアップ

`useEffect` のクリーンアップで Three.js リソースを解放。

```typescript
useEffect(() => {
  // setup
  return () => {
    VRMUtils.deepDispose(vrmRef.current.scene);
    mixer.current?.stopAllAction();
  };
}, []);
```

## WebSocket 通信の規約

### メッセージ形式

```typescript
// 受信コマンド
{
  command: "speak" | "triggerAnimation" | "displayMarkdown" | ...,
  payload: { ... }
}

// 送信メッセージ
{
  command: "speakEnd",
  payload: { speakId: "..." }
}
```

### バリデーション

すべての受信コマンドは `validateStageCommand` でバリデーション。

```typescript
const validationResult = await validateStageCommand(data);
if (validationResult.errors.length === 0) {
  // 処理
}
```

## インポート順序

```typescript
// 1. 外部ライブラリ
import React from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 2. 内部コンポーネント
import { SpeechBubble } from './SpeechBubble';

// 3. サービス・ユーティリティ
import { playVoice } from '../services/tts_service';

// 4. Hooks
import { useVrmModel } from '../hooks/useVrmModel';

// 5. 型定義
import { SpeakMessage } from '../types/avatar_types';
```

## コメント規約

### JSDoc コメント

公開関数・Hook には JSDoc コメントを付与。

```typescript
/**
 * VOICEVOX WebAPI を使ってテキストを音声合成し、再生する関数
 * @param text 合成するテキスト
 * @param speakerId VOICEVOXの話者ID
 * @param onPlay 音声再生直前に呼ばれるコールバック
 */
export async function playVoiceVoxTTS(text: string, speakerId: number, onPlay?: () => void): Promise<void>
```

### インラインコメント

複雑なロジックや意図が不明確な箇所にコメント。

```typescript
// 3秒後にidleへ強制遷移
animationTimeoutRef.current = setTimeout(() => {
  // ...
}, 3000);
```
