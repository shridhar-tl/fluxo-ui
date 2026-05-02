import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { defineConfig, type Plugin } from 'vite';

const CLI_PACKAGE_NAME = 'fluxo-cli';
const CLI_BIN_NAME = 'fluxo-cli';
const CLI_RUNTIME_DEPS = ['chalk', 'prompts', 'sass'];

const writeCliPackageJson = (): Plugin => ({
    name: 'write-cli-package-json',
    apply: 'build',
    closeBundle() {
        const rootPkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'));
        const rootDeps = (rootPkg.dependencies ?? {}) as Record<string, string>;
        const deps: Record<string, string> = {};
        for (const dep of CLI_RUNTIME_DEPS) {
            if (rootDeps[dep]) deps[dep] = rootDeps[dep];
        }

        const cliPkg = {
            name: CLI_PACKAGE_NAME,
            version: rootPkg.version,
            description: 'Cherry-pick FluxoUI components into your project as plain source files.',
            keywords: [
                'fluxo-ui',
                'cli',
                'component-vendoring',
                'shadcn-style',
                'react',
            ],
            author: rootPkg.author,
            license: rootPkg.license,
            homepage: rootPkg.homepage,
            repository: rootPkg.repository,
            bugs: rootPkg.bugs,
            type: 'module',
            bin: {
                [CLI_BIN_NAME]: './entry.js',
            },
            dependencies: deps,
        };

        writeFileSync(
            resolve(__dirname, 'cli/package.json'),
            JSON.stringify(cliPkg, null, 2) + '\n',
            'utf-8',
        );

        const manifestSource = resolve(__dirname, 'src', 'cli', 'manifest-data.json');
        if (existsSync(manifestSource)) {
            copyFileSync(manifestSource, resolve(__dirname, 'cli', 'manifest-data.json'));
        }

        const filesToCopy: Array<{ src: string; dest: string }> = [
            { src: 'CLI_README.md', dest: 'README.md' },
            { src: 'LICENSE', dest: 'LICENSE' },
        ];
        for (const { src, dest } of filesToCopy) {
            const fromPath = resolve(__dirname, src);
            if (existsSync(fromPath)) {
                copyFileSync(fromPath, resolve(__dirname, 'cli', dest));
            }
        }
    },
});

export default defineConfig({
    publicDir: false,
    build: {
        outDir: 'cli',
        emptyOutDir: true,
        lib: {
            entry: {
                entry: resolve(__dirname, 'src/cli/entry.ts'),
                internals: resolve(__dirname, 'src/cli/internals.ts'),
            },
            formats: ['es'],
            fileName: (_format, entryName) => `${entryName}.js`,
        },
        rollupOptions: {
            external: [
                'fs',
                'path',
                'crypto',
                'url',
                'https',
                'http',
                'readline',
                'tty',
                'process',
                'os',
                'stream',
                'util',
                'events',
                'child_process',
                'node:fs',
                'node:path',
                'node:crypto',
                'node:url',
                'node:https',
                'node:http',
                'node:readline',
                'node:tty',
                'node:process',
                'node:os',
                'node:stream',
                'node:util',
                'node:events',
                'node:child_process',
                ...CLI_RUNTIME_DEPS,
            ],
        },
        sourcemap: false,
        cssCodeSplit: false,
        target: 'node18',
        minify: false,
        ssr: true,
    },
    plugins: [
        writeCliPackageJson(),
    ],
});
