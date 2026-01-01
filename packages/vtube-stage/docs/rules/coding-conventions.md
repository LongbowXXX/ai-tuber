<!-- This document is generated and updated by .github/prompts/doc-sync.prompt.md -->

# コーディング規約

## 基本原則

- **TypeScript の活用**: 可能な限り `any` を避け、厳密な型定義を行います。
- **関数型コンポーネント**: React コンポーネントはすべて関数型で記述し、Hooks を活用します。
- **ロジックの分離**: コンポーネントから複雑なロジックを切り出し、カスタムフック (`src/hooks`) に配置します。

## 命名規則

- **コンポーネント**: PascalCase (例: `VRMAvatar.tsx`)
- **フック**: `use` で始まる camelCase (例: `useVrmModel.ts`)
- **型・インターフェース**: PascalCase (例: `StageCommand`)
- **変数・関数**: camelCase (例: `handleCommand`)
- **定数**: UPPER_SNAKE_CASE (例: `DEFAULT_AVATAR_URL`)

## フォーマットとリンティング

- **Prettier**: コードの整形に使用します。
- **ESLint**: 静的解析に使用します。
- 保存時に自動整形される設定を推奨します。

## 3D 関連の作法

- **リソース管理**: VRM モデルやテクスチャのロードは `useVrmModel` などのフックを通じて行い、メモリリークを防ぐために適切に破棄します。
- **座標系**: Three.js の標準座標系 (右手系) に従います。
