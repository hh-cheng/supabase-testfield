import eslintPluginReact from 'eslint-plugin-react'
import eslintPluginPrettier from 'eslint-plugin-prettier'
import eslintPluginTypescript from '@typescript-eslint/eslint-plugin'

export default [
  {
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 'latest',
      globals: { browser: true },
      parser: await import('@typescript-eslint/parser'),
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    },
    plugins: {
      react: eslintPluginReact,
      prettier: eslintPluginPrettier,
      '@typescript-eslint': eslintPluginTypescript,
    },
    settings: { react: { version: 'detect' } },
    rules: {
      'prettier/prettier': 'error',
      'react/react-in-jsx-scope': 'off',
      'react/no-children-prop': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      'react/no-unknown-property': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
  { files: ['**/*.{ts,tsx}'] },
]
