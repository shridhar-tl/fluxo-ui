import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { defineConfig, type Plugin } from 'vite';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
import svgr from 'vite-plugin-svgr';

const stripDistPrefix = (value: string): string => {
    if (typeof value !== 'string') return value;
    return value.replace(/^\.\/dist\//, './').replace(/^dist\//, './');
};

const rewriteExports = (exportsObj: Record<string, unknown>): Record<string, unknown> => {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(exportsObj)) {
        if (typeof value === 'string') {
            result[key] = stripDistPrefix(value);
        } else if (value && typeof value === 'object') {
            const entry: Record<string, string> = {};
            for (const [condition, path] of Object.entries(value as Record<string, string>)) {
                entry[condition] = stripDistPrefix(path);
            }
            result[key] = entry;
        } else {
            result[key] = value;
        }
    }
    return result;
};

const writeDistPackageJson = (): Plugin => ({
    name: 'write-dist-package-json',
    apply: 'build',
    closeBundle() {
        const rootPkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'));
        const keepKeys = [
            'name',
            'version',
            'description',
            'keywords',
            'author',
            'license',
            'homepage',
            'repository',
            'bugs',
            'type',
            'sideEffects',
            'peerDependencies',
            'peerDependenciesMeta',
            'bin',
        ];
        const distPkg: Record<string, unknown> = {};
        for (const key of keepKeys) {
            if (rootPkg[key] !== undefined) distPkg[key] = rootPkg[key];
        }
        distPkg.main = stripDistPrefix(rootPkg.main);
        distPkg.module = stripDistPrefix(rootPkg.module);
        distPkg.types = stripDistPrefix(rootPkg.types);
        if (rootPkg.exports) {
            distPkg.exports = rewriteExports(rootPkg.exports as Record<string, unknown>);
        }
        if (rootPkg.bin && typeof rootPkg.bin === 'object') {
            const binOut: Record<string, string> = {};
            for (const [k, v] of Object.entries(rootPkg.bin as Record<string, string>)) {
                binOut[k] = stripDistPrefix(v);
            }
            distPkg.bin = binOut;
        }
        writeFileSync(resolve(__dirname, 'dist/package.json'), JSON.stringify(distPkg, null, 2) + '\n', 'utf-8');

        const filesToCopy = ['README.md', 'LICENSE'];
        for (const file of filesToCopy) {
            const src = resolve(__dirname, file);
            if (existsSync(src)) {
                copyFileSync(src, resolve(__dirname, 'dist', file));
            }
        }
    },
});

export default defineConfig({
    build: {
        lib: {
            entry: {
                index: resolve(__dirname, 'src/components/index.ts'),
                dnd: resolve(__dirname, 'src/components/drag-drop/index.tsx'),
                draw: resolve(__dirname, 'src/components/canvas-draw/index.ts'),
                kanban: resolve(__dirname, 'src/components/kanban-board/index.ts'),
                utils: resolve(__dirname, 'src/utils/lib.ts'),
                hooks: resolve(__dirname, 'src/hooks/index.ts'),
                icons: resolve(__dirname, 'src/assets/icons.ts'),
                store: resolve(__dirname, 'src/store/index.ts'),
                'store-middlewares': resolve(__dirname, 'src/store/middlewares/index.ts'),
                services: resolve(__dirname, 'src/services/index.ts'),
                'vite-plugin': resolve(__dirname, 'src/plugins/vite/index.ts'),
            },
            name: 'EtherUI',
            formats: ['es', 'cjs'],
            fileName: (format, entryName) => {
                const extension = format === 'cjs' ? 'cjs' : 'js';
                return `${entryName}.${extension}`;
            },
        },
        rollupOptions: {
            external: [
                'react',
                'react-dom',
                'react/jsx-runtime',
                'react-dnd',
                'react-dnd-html5-backend',
                'html2canvas',
                // The following externals are required as vite plugin is exported
                'vite',
                'fs',
                'path',
            ],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    'react/jsx-runtime': 'jsxRuntime',
                    html2canvas: 'html2canvas',
                },
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name && assetInfo.name.endsWith('.css')) {
                        return 'styles/[name][extname]';
                    }
                    return 'assets/[name][extname]';
                },
            },
        },
        sourcemap: false,
        cssCodeSplit: false,
        target: 'esnext',
        minify: false,
    },
    plugins: [
        react(),
        tailwindcss(),
        svgr({
            svgrOptions: {
                //typescript: true,
            },
            include: '**/*.svg?react',
        }),
        libInjectCss(),
        writeDistPackageJson(),
        dts({
            insertTypesEntry: true,
            tsconfigPath: './tsconfig.app.json',
            copyDtsFiles: false,
            include: ['src/**/*'],
            exclude: ['src/App.tsx', 'src/main.tsx', 'src/IconShowcase.tsx'],
            rollupTypes: false,
            outDir: 'dist',
            entryRoot: 'src',
            staticImport: true,
            compilerOptions: {
                noEmit: false,
            },
        }),
    ],
});
