<!-- このドキュメントは .github/prompts/document-project.prompt.md によって生成・更新されています -->

# テスト戦略とガイド

## テスト構成

### 現状

⚠️ **現在、このプロジェクトにはテストフレームワークが設定されていません。**

`package.json` にはテスト関連のスクリプトや依存関係が定義されていないため、テストを追加する場合は以下の設定が必要です。

### 推奨テストフレームワーク

Vite + React + TypeScript プロジェクトに適したテストスタックを以下に提案します。

| 用途                 | 推奨ツール                |
| -------------------- | ------------------------- |
| ユニットテスト       | Vitest                    |
| コンポーネントテスト | React Testing Library     |
| E2E テスト           | Playwright または Cypress |
| カバレッジ           | Vitest built-in coverage  |

## テストフレームワーク導入手順

### 1. Vitest + React Testing Library のインストール

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

### 2. Vite 設定の更新 (`vite.config.ts`)

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
```

### 3. セットアップファイルの作成 (`src/test/setup.ts`)

```typescript
import '@testing-library/jest-dom';
```

### 4. package.json にスクリプト追加

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

## テストの種類

### ユニットテスト

純粋な関数やユーティリティのテスト。

**対象ファイル例**:

- `src/utils/command_validator.ts`
- `src/services/tts_service.ts` の `splitAndMergeSentences`

```typescript
// src/services/tts_service.test.ts
import { describe, it, expect } from 'vitest';
import { splitAndMergeSentences } from './tts_service';

describe('splitAndMergeSentences', () => {
  it('should split by sentence-ending punctuation', () => {
    const result = splitAndMergeSentences('こんにちは。お元気ですか？');
    expect(result).toEqual(['こんにちは。', 'お元気ですか？']);
  });

  it('should merge short sentences', () => {
    const result = splitAndMergeSentences('はい。いいえ。そうです。');
    expect(result).toHaveLength(2); // 短い文は結合される
  });
});
```

### コンポーネントテスト

React コンポーネントのレンダリングとインタラクションのテスト。

**注意**: 3D コンポーネント（Three.js / React Three Fiber）のテストは複雑なため、ユニットテストで分離できるロジックを優先。

```typescript
// src/components/SpeechBubble.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SpeechBubble } from './SpeechBubble';

describe('SpeechBubble', () => {
  it('should not render when message is null', () => {
    const { container } = render(<SpeechBubble message={null} />);
    expect(container.firstChild).toBeNull();
  });

  // 注: Html コンポーネント（@react-three/drei）のテストは
  // Canvas コンテキストが必要なため、別途モックが必要
});
```

### 統合テスト

**対象**: コマンドバリデーション、状態管理フロー

```typescript
// src/utils/command_validator.test.ts
import { describe, it, expect } from 'vitest';
import { validateStageCommand } from './command_validator';

describe('validateStageCommand', () => {
  it('should validate a valid speak command', async () => {
    const command = {
      command: 'speak',
      payload: {
        characterId: 'avatar1',
        message: 'Hello',
        caption: 'Hello',
        emotion: 'happy',
        speakId: 'test-id',
      },
    };
    const result = await validateStageCommand(command);
    expect(result.errors).toHaveLength(0);
    expect(result.command).toBeDefined();
  });

  it('should return errors for invalid command', async () => {
    const result = await validateStageCommand({ invalid: 'data' });
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.command).toBeNull();
  });
});
```

### E2E テスト

Playwright を使用したエンドツーエンドテスト。

```bash
npm install -D @playwright/test
npx playwright install
```

```typescript
// e2e/stage.spec.ts
import { test, expect } from '@playwright/test';

test('should display loading overlay initially', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page.getByText('Loading...')).toBeVisible();
});

test('should show Start button after avatars load', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await expect(page.getByRole('button', { name: 'Start' })).toBeVisible({ timeout: 30000 });
});
```

## テスト実行方法

### 導入後のコマンド

```bash
# ユニット/統合テスト実行
npm test

# ウォッチモード
npm test -- --watch

# カバレッジ付き実行
npm run test:coverage

# UI モード
npm run test:ui
```

## カバレッジ目標

| カテゴリ             | 目標                              |
| -------------------- | --------------------------------- |
| ユーティリティ関数   | 80% 以上                          |
| バリデーション       | 90% 以上                          |
| カスタム Hooks       | 70% 以上                          |
| React コンポーネント | 50% 以上（3D コンポーネント除く） |

## テストデータの管理

### フィクスチャ

テストデータは `src/test/fixtures/` ディレクトリに配置。

```typescript
// src/test/fixtures/commands.ts
export const validSpeakCommand = {
  command: 'speak',
  payload: {
    characterId: 'avatar1',
    message: 'テストメッセージ',
    caption: 'テストメッセージ',
    emotion: 'happy',
    speakId: 'test-speak-id',
  },
};

export const invalidCommand = {
  command: 'unknown',
  payload: {},
};
```

### モック

外部サービス（VOICEVOX、WebSocket）はモック化。

```typescript
// src/test/mocks/tts_service.mock.ts
import { vi } from 'vitest';

export const mockPlayVoice = vi.fn().mockResolvedValue(undefined);

vi.mock('../services/tts_service', () => ({
  playVoice: mockPlayVoice,
}));
```

## テストのベストプラクティス

### 命名規則

```typescript
describe('対象のモジュール/関数', () => {
  it('should 期待する動作 when 条件', () => {
    // ...
  });
});
```

### AAA パターン

```typescript
it('should return merged sentences', () => {
  // Arrange
  const input = 'はい。いいえ。';

  // Act
  const result = splitAndMergeSentences(input);

  // Assert
  expect(result).toHaveLength(1);
});
```

### 注意事項

1. **3D コンポーネントのテスト**: Three.js / React Three Fiber コンポーネントはブラウザ環境依存が強いため、ロジックを Hook に分離してテスト
2. **WebSocket のテスト**: モックサーバーまたは `vi.mock` でモック化
3. **非同期処理**: `async/await` と適切なタイムアウト設定を使用

## よくあるテスト問題と解決策

### Canvas のモック

```typescript
// src/test/setup.ts
HTMLCanvasElement.prototype.getContext = vi.fn();
```

### WebGL のモック

```typescript
// src/test/mocks/webgl.ts
class WebGLRenderingContext {}
global.WebGLRenderingContext = WebGLRenderingContext as never;
```

### Audio のモック

```typescript
// src/test/mocks/audio.ts
global.Audio = vi.fn().mockImplementation(() => ({
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
}));
```
