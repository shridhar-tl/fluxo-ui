import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { defineConfig, type Plugin } from 'vite';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
import svgr from 'vite-plugin-svgr';

const stripDistPrefix = (value: string): string => {
    if (typeof value !== 'string') return value;
    return value.replace(/^\.\/dist\//, './').replace(/^dist\//, './');
};

const nonComponentSegments = new Set(['index']);

const libEntries: Record<string, string> = {
    index: resolve(__dirname, 'src/components/index.ts'),
    'report-builder': resolve(__dirname, 'src/components/report-builder/index.ts'),
    'report-viewer': resolve(__dirname, 'src/components/report-builder/report-viewer-index.ts'),
    chat: resolve(__dirname, 'src/components/chat/index.ts'),
    draw: resolve(__dirname, 'src/components/canvas-draw/index.ts'),
    utils: resolve(__dirname, 'src/utils/lib.ts'),
    hooks: resolve(__dirname, 'src/hooks/index.ts'),
    icons: resolve(__dirname, 'src/assets/icons.ts'),
    store: resolve(__dirname, 'src/store/index.ts'),
    'store-middlewares': resolve(__dirname, 'src/store/middlewares/index.ts'),
    services: resolve(__dirname, 'src/services/index.ts'),
    'vite-plugin': resolve(__dirname, 'src/plugins/vite/index.ts'),
};

const entryFeatureDirs = new Set(
    Object.values(libEntries)
        .map((entryPath) => entryPath.replace(/\\/g, '/').match(/\/src\/components\/([^/]+)\//))
        .filter((match): match is RegExpMatchArray => match !== null)
        .map((match) => match[1])
);

const pureLogicModuleCache = new Map<string, boolean>();
const computeIsPureLogic = (filePath: string): boolean => {
    try {
        const src = readFileSync(filePath, 'utf-8');
        const importsCss = /import\s+['"][^'"]+\.(scss|sass|css)['"]/.test(src);
        const rendersEui = /eui-[a-z]/.test(src);
        return !importsCss && !rendersEui;
    } catch {
        return false;
    }
};
const isPureLogicModule = (filePath: string): boolean => {
    const cached = pureLogicModuleCache.get(filePath);
    if (cached !== undefined) return cached;
    const pure = computeIsPureLogic(filePath);
    pureLogicModuleCache.set(filePath, pure);
    return pure;
};

const perComponentChunkName = (id: string): string | null => {
    const normalized = id.replace(/\\/g, '/');
    const match = normalized.match(/\/src\/components\/([^/]+)/);
    if (!match) return null;
    const segment = match[1];
    if (segment === 'report-builder') return null;
    const name = segment.replace(/\.(tsx|ts|jsx|js)$/, '');
    if (nonComponentSegments.has(name)) return null;
    const fileMatch = normalized.match(/\/src\/components\/([^/]+)\/([^/]+)\.(tsx|ts|jsx|js)$/);
    if (fileMatch && entryFeatureDirs.has(fileMatch[1]) && fileMatch[2] !== 'index') {
        return `components/${fileMatch[1]}/${fileMatch[2]}`;
    }
    return `components/${name}`;
};

const pureLogicFeatureLeafName = (id: string): string | null => {
    const normalized = id.replace(/\\/g, '/');
    const match = normalized.match(/\/src\/components\/([^/]+)\/(.+)\.(tsx|ts|jsx|js)$/);
    if (!match) return null;
    const feature = match[1];
    if (feature === 'report-builder') return null;
    if (nonComponentSegments.has(feature)) return null;
    const leaf = match[2];
    const isFeatureBarrel = leaf === 'index' || leaf.endsWith('/index');
    if (isFeatureBarrel && !entryFeatureDirs.has(feature)) return null;
    const filePath = normalized.replace(/\?.*$/, '');
    if (!isPureLogicModule(filePath)) return null;
    const rel = leaf.replace(/\/index$/, '').replace(/\//g, '__');
    return `components/${feature}/${rel}`;
};

const perIconChunkName = (id: string): string | null => {
    const normalized = id.replace(/\\/g, '/');
    const match = normalized.match(/\/src\/assets\/icons\/([^/?]+)\.svg/);
    if (!match) return null;
    return `icons/${match[1]}`;
};

const sharedModuleDirs = ['utils', 'hooks', 'services', 'types'];

const perSharedModuleName = (id: string): string | null => {
    const normalized = id.replace(/\\/g, '/');
    const match = normalized.match(/\/src\/(utils|hooks|services|types)\/(.+)\.(tsx|ts|jsx|js)$/);
    if (!match) return null;
    const dir = match[1];
    if (!sharedModuleDirs.includes(dir)) return null;
    const rel = match[2].replace(/\/index$/, '');
    return `shared/${dir}/${rel}`;
};

const sharedVendors = ['date-fns'];

const perVendorChunkName = (id: string): string | null => {
    const normalized = id.replace(/\\/g, '/');
    for (const vendor of sharedVendors) {
        if (normalized.includes(`/node_modules/${vendor}/`)) return `shared/vendor/${vendor}`;
    }
    return null;
};

const componentChunkGroups = [
    { name: perIconChunkName, priority: 40 },
    { name: pureLogicFeatureLeafName, priority: 35 },
    { name: perComponentChunkName, priority: 30 },
    { name: perVendorChunkName, priority: 25 },
    { name: perSharedModuleName, priority: 20 },
];

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

        const stylesSrcDir = resolve(__dirname, 'src/styles');
        const stylesDistDir = resolve(__dirname, 'dist/styles');
        mkdirSync(stylesDistDir, { recursive: true });
        const themeFiles = readdirSync(stylesSrcDir).filter(
            (file) => file === 'base-theme.css' || /^theme-[a-z]+\.css$/.test(file)
        );
        for (const file of themeFiles) {
            copyFileSync(resolve(stylesSrcDir, file), resolve(stylesDistDir, file));
        }
    },
});

export default defineConfig({
    publicDir: false,
    build: {
        emptyOutDir: true,
        lib: {
            entry: libEntries,
            name: 'FluxoUI',
            formats: ['es', 'cjs'],
            fileName: (format, entryName) => {
                const extension = format === 'cjs' ? 'cjs' : 'js';
                return `${entryName}.${extension}`;
            },
        },
        rollupOptions: {
            preserveEntrySignatures: 'allow-extension',
            external: [
                'react',
                'react-dom',
                'react/jsx-runtime',
                'html2canvas',
                'chart.js',
                'chart.js/auto',
                'react-chartjs-2',
                // The following externals are required as vite plugin is exported
                'vite',
                'fs',
                'path',
            ],
            output: {
                strictExecutionOrder: false,
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    'react/jsx-runtime': 'jsxRuntime',
                    html2canvas: 'html2canvas',
                    'chart.js': 'ChartJS',
                    'chart.js/auto': 'ChartJSAuto',
                    'react-chartjs-2': 'reactChartjs2',
                },
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name && assetInfo.name.endsWith('.css')) {
                        if (assetInfo.name === 'index.css' || assetInfo.name === 'components.css') {
                            return 'styles/components.css';
                        }
                        return 'styles/[name][extname]';
                    }
                    return 'assets/[name][extname]';
                },
                codeSplitting: {
                    includeDependenciesRecursively: false,
                    groups: componentChunkGroups,
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
            exclude: ['src/App.tsx', 'src/main.tsx', 'src/IconShowcase.tsx', 'src/cli/**'],
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
