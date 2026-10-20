import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { importX } from 'eslint-plugin-import-x';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

const root = fileURLToPath(new URL('.', import.meta.url));
const featureNames = readdirSync(new URL('./src/features', import.meta.url), {
  withFileTypes: true,
})
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

export default defineConfig([
  globalIgnores(['dist', 'node_modules', '.npm-cache']),
  {
    files: ['**/*.{js,mjs}'],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: root },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],
    },
  },
  {
    files: ['*.config.ts'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    extends: [reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
    plugins: { 'import-x': importX },
    settings: {
      'import-x/resolver-next': [
        createTypeScriptImportResolver({ project: './tsconfig.app.json' }),
      ],
    },
    rules: {
      'import-x/no-restricted-paths': [
        'error',
        {
          basePath: root,
          zones: [
            { target: './src/features', from: './src/app' },
            {
              target: [
                './src/components',
                './src/hooks',
                './src/assets',
                './src/lib',
                './src/utils',
              ],
              from: ['./src/app', './src/features'],
            },
            ...featureNames.map((name) => ({
              target: `./src/features/${name}`,
              from: './src/features',
              except: [`./${name}`],
            })),
          ],
        },
      ],
    },
  },
  prettier,
]);
