import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

const unusedVarOpts = {
  argsIgnorePattern: '^_',
  varsIgnorePattern: '^_',
  caughtErrorsIgnorePattern: '^_',
};

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      'framework/dist/**',
      'games/_template/**',
      'package-lock.json',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'no-undef': 'off',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-useless-escape': 'warn',
      'no-prototype-builtins': 'off',
      'no-inner-declarations': 'off',
      'no-constant-condition': ['error', { checkLoops: false }],
      'no-cond-assign': ['error', 'except-parens'],
      'no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }],
      '@typescript-eslint/no-unused-expressions': 'off',
      'no-useless-assignment': 'off',
      '@typescript-eslint/no-this-alias': 'off',
    },
  },
  {
    files: ['**/*.js'],
    rules: {
      'no-unused-vars': ['warn', unusedVarOpts],
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', unusedVarOpts],
      'no-unused-vars': 'off',
    },
  },
];
