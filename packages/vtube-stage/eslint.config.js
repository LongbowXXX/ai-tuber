import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist', 'dist-electron'] },
  {
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      prettierConfig,
    ],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-refresh': reactRefresh,
    },
    rules: {
      // react-hooks v7 の React Compiler 系新ルールを無効化(従来の
      // rules-of-hooks / exhaustive-deps は有効のまま)。refs/immutability は
      // three.js/R3F のシーングラフ直接変異イディオムと、purity はパーティクル
      // 生成等でのレンダー中 Math.random() と、set-state-in-effect は既存の
      // effect 内同期 setState パターンと衝突する。個別の指摘内容は
      // 後続課題として PR に記録済み。
      'react-hooks/refs': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  }
);
