import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import-x';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    { ignores: ['dist', '**/*.d.ts'] },
    {
        extends: [js.configs.recommended, ...tseslint.configs.recommended, react.configs.flat.recommended],
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
        plugins: {
            import: importPlugin,
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        settings: {
            react: {
                version: '19.0',
            },
        },
        rules: {
            'import/order': [
                'error',
                {
                    groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
                    pathGroups: [
                        { pattern: 'react', group: 'external', position: 'before' },
                        { pattern: 'react-dom', group: 'external', position: 'before' },
                        {
                            pattern: 'react-router**',
                            group: 'external',
                            position: 'before',
                        },
                        { pattern: '**/*.css', group: 'internal', position: 'after' },
                    ],
                    pathGroupsExcludedImportTypes: ['react', 'react-dom', 'react-router**'],
                    alphabetize: { order: 'asc', caseInsensitive: true },
                    'newlines-between': 'always',
                },
            ],
            ...reactHooks.configs.recommended.rules,
            'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
            quotes: ['error', 'single'],
            'react/jsx-key': 'error',
        },
    }
);
