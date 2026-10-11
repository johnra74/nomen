import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['node_modules', 'dist', 'dev-dist', 'coverage', '.specify', '.claude', 'specs'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    plugins: { 'react-hooks': reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },
  { files: ['scripts/**/*.mjs'], languageOptions: { globals: globals.node } },
  {
    // Constitution IV: the domain core and its ports stay framework- and browser-free.
    files: ['src/domain/**/*.ts', 'src/ports/**/*.ts'],
    ignores: ['**/*.test.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: ['react', 'react-dom'],
          patterns: ['**/ui/**', '**/infrastructure/**', 'react/*', 'react-dom/*'],
        },
      ],
      'no-restricted-globals': ['error', 'window', 'document', 'localStorage', 'performance'],
    },
  },
);
