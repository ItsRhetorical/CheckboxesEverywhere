import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        sourceType: 'module',
      },
      globals: {
        // Browser globals
        document: 'readonly',
        console: 'readonly',
        NodeFilter: 'readonly',
        HTMLElement: 'readonly',
        HTMLInputElement: 'readonly',
        Event: 'readonly',
        setTimeout: 'readonly',
        // Node globals
        require: 'readonly',
        exports: 'readonly',
        module: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { args: 'none' }],
      '@typescript-eslint/ban-ts-comment': 'off',
      'no-prototype-builtins': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off', // Common in Obsidian plugins due to API types
      '@typescript-eslint/no-require-imports': 'off', // Obsidian uses require for CodeMirror
      'no-cond-assign': 'off', // Common pattern in tree walkers
      '@typescript-eslint/no-this-alias': 'off', // Sometimes needed for closures
    },
    ignores: ['dist/**', 'node_modules/**'],
  }
);
