<!-- このドキュメントは .github/prompts/document-project.prompt.md によって生成・更新されています -->

# 技術的制約と注意事項

## パフォーマンス要件

### 3D レンダリング

| 要件               | 目標値 | 備考                      |
| ------------------ | ------ | ------------------------- |
| フレームレート     | 60fps  | VRM モデル 2 体同時表示時 |
| VRM ロード時間     | < 5 秒 | ネットワーク速度依存      |
| アニメーション遷移 | 0.3 秒 | フェード時間              |

### 最適化ポイント

1. **VRM モデルのサイズ**: 大きすぎるモデルはロード時間とメモリ使用量に影響
2. **テクスチャ解像度**: 高解像度テクスチャは GPU メモリを圧迫
3. **useFrame 内の処理**: 毎フレーム実行されるため、重い処理は避ける

```typescript
// ❌ Bad: useFrame 内でオブジェクト生成
useFrame(() => {
  const newVector = new THREE.Vector3(); // 毎フレーム生成
});

// ✅ Good: ref で再利用
const tempVector = useRef(new THREE.Vector3());
useFrame(() => {
  tempVector.current.set(0, 0, 0);
});
```

## セキュリティ考慮事項

### 入力バリデーション

- WebSocket 受信データは必ず `validateStageCommand` でバリデーション
- `class-validator` を使用した型安全なバリデーション

### 外部 API 接続

- VOICEVOX API は CORS 設定に依存
- 本番環境では適切なオリジン制限を設定

### 環境変数

- `VITE_*` 環境変数はクライアントサイドに露出する
- 機密情報（API キー等）は含めない

## 既知の技術的負債

### 1. 型定義の不完全さ

**場所**: `src/types/command.ts`

```typescript
// TODO: ペイロードの Type デコレータが Object になっている
@Type(() => Object)
payload!: P;
```

**影響**: ネストされたオブジェクトのバリデーションが不完全な可能性

### 2. アニメーション強制終了タイマー

**場所**: `src/components/VRMAvatar.tsx`

```typescript
// 3秒後にidleへ強制遷移
animationTimeoutRef.current = setTimeout(() => {
  // ...
}, 3000);
```

**理由**: アニメーション終了イベントが発火しないケースへの安全装置
**検討**: アニメーションの長さに応じた動的なタイムアウト設定

### 3. TTS 無効時のダミー待機

**場所**: `src/services/tts_service.ts`

```typescript
if (!TTS_ENABLED || !VOICEVOX_API_BASE) {
  await new Promise(resolve => setTimeout(resolve, 8000));
  return;
}
```

**理由**: TTS 無効時もタイミングを保つためのダミー処理
**検討**: 発話テキスト長に応じた待機時間の調整

### 4. avatars.json のハードコード

**場所**: `src/hooks/useStageCommandHandler.ts`

```typescript
fetch('/avatars.json')
```

**影響**: アバター設定が静的ファイルに依存
**検討**: 動的なアバター追加・削除への対応

## よくあるトラブルと対処法

### 1. WebSocket 接続エラー

**症状**: コンソールに `WebSocket connection failed` エラー

**原因**:

- `stage-director` が起動していない
- `VITE_STAGE_DIRECTER_ENDPOINT` が未設定または誤り

**対処**:

1. `stage-director` の起動確認
2. `.env` ファイルの設定確認
3. CORS 設定の確認

### 2. VRM モデルがロードされない

**症状**: `Loading...` 表示のまま

**原因**:

- VRM ファイルパスの誤り
- VRM ファイル形式の非対応
- `avatars.json` の設定ミス

**対処**:

1. `public/avatar/` にファイルが存在するか確認
2. ブラウザの Network タブで 404 エラーを確認
3. `avatars.json` の `vrmUrl` パスを確認

### 3. TTS が再生されない

**症状**: 発話コマンドを受信しても音声が出ない

**原因**:

- VOICEVOX が起動していない
- `VITE_VOICEVOX_API_BASE` が未設定
- CORS エラー

**対処**:

1. VOICEVOX エンジンの起動確認（デフォルト: `http://localhost:50021`）
2. `.env` の設定確認
3. ブラウザコンソールでエラー確認

### 4. アニメーションが再生されない

**症状**: `triggerAnimation` コマンドを受信してもアニメーションが変わらない

**原因**:

- VRMA ファイルのパス誤り
- アニメーション名が `avatars.json` の `animationUrls` にない
- VRMA ファイル形式の非対応

**対処**:

1. `public/vrma/` にファイルが存在するか確認
2. `avatars.json` の `animationUrls` 設定を確認
3. コンソールでアニメーションロードエラーを確認

### 5. カメラ位置がおかしい

**症状**: アバターが見切れる、カメラ位置が変

**原因**:

- カメラ初期化のタイミング問題
- OrbitControls との競合

**対処**:

- `CameraInit` コンポーネントがカメラ位置を数フレームにわたって設定し直す仕組みあり
- アニメーション完了後に OrbitControls が有効化される

## 制約事項

### ブラウザ制限

- **WebGL 2.0**: Three.js レンダリングに必須
- **WebSocket**: リアルタイム通信に必須
- **Web Audio API**: TTS 再生に必須

### VRM 制限

- **VRM 1.0 / 0.x**: `@pixiv/three-vrm` でサポートされるバージョン
- **表情パラメータ**: モデルに定義された表情のみ使用可能

### VOICEVOX 制限

- **ローカル実行**: デフォルトで `localhost:50021` で動作
- **話者 ID**: モデルに対応した話者 ID が必要

### パフォーマンス制限

- **同時アバター数**: 現在 2 体で設計（増やす場合はパフォーマンス検証が必要）
- **テクスチャサイズ**: GPU メモリに依存

## 開発時の注意事項

### 環境変数の設定

開発時は `.env` ファイルを作成:

```bash
VITE_STAGE_DIRECTER_ENDPOINT=ws://localhost:8080/stage-websocket
VITE_VOICEVOX_API_BASE=http://localhost:50021
VITE_TTS_ENABLED=true
VITE_DEBUG_SIDEBAR=true
```

### ホットリロード

- Vite のホットリロードは React コンポーネントに対応
- Three.js のシーン変更は一部再読み込みが必要な場合あり

### デバッグモード

`VITE_DEBUG_SIDEBAR=true` でサイドバーに以下が表示:

- WebSocket 接続状態
- 最後に受信したメッセージ
- 手動コントロール UI（表情・アニメーション）
