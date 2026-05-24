#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');
const distDir = resolve(rootDir, 'dist');
const mcpOutDir = resolve(distDir, 'mcp');
const sourcePath = resolve(rootDir, 'src');

const pkg = JSON.parse(readFileSync(resolve(rootDir, 'package.json'), 'utf-8'));

const collectPropsJson = (dir) => {
    const map = {};
    if (!existsSync(dir)) return map;
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
            Object.assign(map, collectPropsJson(full));
        } else if (entry.endsWith('.props.json')) {
            try {
                const data = JSON.parse(readFileSync(full, 'utf-8'));
                const compName = entry.replace('.props.json', '');
                map[compName] = data;
            } catch {}
        }
    }
    return map;
};

const parseNamedExports = () => {
    const indexPath = resolve(sourcePath, 'components/index.ts');
    if (!existsSync(indexPath)) return new Set();
    const src = readFileSync(indexPath, 'utf-8');
    const names = new Set();
    const namedRe = /export\s*(?:type\s*)?\{\s*([^}]+)\}\s*from/g;
    let m;
    while ((m = namedRe.exec(src))) {
        for (const raw of m[1].split(',')) {
            const clean = raw.trim().replace(/^type\s+/, '').replace(/^default\s+as\s+/, '').split(/\s+as\s+/).pop();
            if (clean && /^[A-Z]/.test(clean)) names.add(clean);
        }
    }
    return names;
};

const parseThemeTokens = () => {
    const scssPath = resolve(sourcePath, 'components/_eui-vars.scss');
    if (!existsSync(scssPath)) return { tokens: [], breakpoints: [] };
    const src = readFileSync(scssPath, 'utf-8');
    const tokens = new Set();
    const tokenRe = /(--eui-[a-z0-9-]+)\s*:/g;
    let m;
    while ((m = tokenRe.exec(src))) tokens.add(m[1]);
    const breakpoints = [];
    const bpRe = /\$(bp-[a-z0-9]+)\s*:\s*([^;]+);/g;
    while ((m = bpRe.exec(src))) breakpoints.push({ name: m[1], value: m[2].trim() });
    return { tokens: Array.from(tokens).sort(), breakpoints };
};

const collectExamples = () => {
    const pagesDir = resolve(sourcePath, 'story/pages');
    if (!existsSync(pagesDir)) return {};
    const examples = {};
    for (const entry of readdirSync(pagesDir)) {
        const fullPath = join(pagesDir, entry);
        if (!statSync(fullPath).isDirectory()) continue;
        const files = readdirSync(fullPath).filter((f) => f.endsWith('.tsx') && !f.endsWith('Page.tsx') && !f.endsWith('-story-data.ts'));
        if (files.length === 0) continue;
        const list = [];
        for (const f of files) {
            const code = readFileSync(join(fullPath, f), 'utf-8');
            if (code.length > 8000) continue;
            list.push({ title: f.replace(/\.tsx$/, ''), code });
        }
        if (list.length > 0) examples[entry] = list;
    }
    return examples;
};

const slugToTitle = (slug) =>
    slug.split('-').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('');

const main = () => {
    console.log('[build-mcp-index] extracting library metadata...');

    const componentsPropsMap = collectPropsJson(resolve(sourcePath, 'components'));
    const storePropsMap = collectPropsJson(resolve(sourcePath, 'store'));
    const namedExports = parseNamedExports();
    const { tokens, breakpoints } = parseThemeTokens();
    const examples = collectExamples();

    const components = {};
    const componentNames = new Set([...Object.keys(componentsPropsMap), ...namedExports]);
    for (const name of componentNames) {
        components[name] = {
            name,
            importFrom: 'fluxo-ui',
            examples: [],
            props: componentsPropsMap[name] || {},
        };
    }

    for (const [slug, demos] of Object.entries(examples)) {
        if (slug.startsWith('store-') || slug === 'hooks-utils' || slug === 'services' || slug === 'demo-showcase') continue;
        const candidates = [slugToTitle(slug), slugToTitle(slug).replace(/s$/, '')];
        let matched = candidates.find((c) => components[c]) || [...componentNames].find((n) => n.toLowerCase() === slug.replace(/-/g, '').toLowerCase()) || null;
        if (matched) {
            components[matched].storyDir = slug;
            components[matched].examples = demos;
        }
    }

    const storeApi = { groups: {}, examples: {} };
    if (storePropsMap['store']) {
        for (const [groupKey, groupValue] of Object.entries(storePropsMap['store'])) {
            storeApi.groups[groupKey] = groupValue;
        }
    }
    if (storePropsMap['store-model']) {
        storeApi.groups.modelApiProps = storePropsMap['store-model'];
    }
    for (const [slug, demos] of Object.entries(examples)) {
        if (slug.startsWith('store-')) {
            const topic = slug.replace(/^store-/, '');
            storeApi.examples[topic] = demos.map((d) => ({ title: d.title, code: d.code }));
        }
    }

    const entryPoints = Object.entries(pkg.exports || {})
        .filter(([, value]) => value && typeof value === 'object' && (value.import || value.types))
        .map(([key]) => key);

    const index = {
        generatedAt: new Date().toISOString(),
        library: { name: pkg.name, version: pkg.version, description: pkg.description, homepage: pkg.homepage },
        entryPoints,
        components,
        storeApi,
        themes: {
            available: ['theme-blue', 'theme-green', 'theme-orange', 'theme-purple', 'theme-lara', 'theme-indigo', 'theme-rose', 'theme-amber', 'theme-teal', 'theme-emerald', 'theme-fuchsia', 'theme-slate'],
            darkModeClass: 'mode-dark',
            howToApply: `Apply a theme and dark mode by adding the class names to the <body> element. Both are optional — without them components render in the default blue/light palette.\n\ndocument.body.classList.add('theme-purple', 'mode-dark');`,
            howToImport: `Each theme ships as its own CSS subpath so only the theme you use is bundled. Import it once at your app entry:\n\nimport '${pkg.name}/themes/purple';\n\nAvailable: ${pkg.name}/themes/blue · green · orange · purple · lara · indigo · rose · amber · teal · emerald · fuchsia · slate. The default blue palette is already included with the components — only import a theme subpath if you switch to a non-blue theme.`,
            tokens,
            breakpoints,
        },
        quickStart: {
            install: `npm install ${pkg.name}`,
            stylesAreAutomatic: `You do NOT need to import a global stylesheet. Importing any component automatically applies that component's CSS plus the base design tokens and dark-mode support. Just import and use:\n\nimport { Button, TextInput } from '${pkg.name}';\n\nexport default function App() {\n  return (\n    <>\n      <TextInput placeholder="Your name" />\n      <Button label="Submit" />\n    </>\n  );\n}`,
            optionalTheme: `To use a brand theme other than the default blue, import its theme CSS once and add the class to <body>:\n\nimport '${pkg.name}/themes/purple';\ndocument.body.classList.add('theme-purple');`,
        },
        managers: [
            { name: 'SnackbarManager', purpose: 'Global toast notifications', api: ['showSnackbar', 'hideSnackbar'], mountOnce: true },
            { name: 'TooltipManager', purpose: 'Global tooltips', api: ['showTooltip', 'hideTooltip'], mountOnce: true },
            { name: 'ContextMenuManager', purpose: 'Global right-click menus', api: ['showContextMenu'], mountOnce: true },
        ],
    };

    if (!existsSync(distDir)) mkdirSync(distDir, { recursive: true });
    if (!existsSync(mcpOutDir)) mkdirSync(mcpOutDir, { recursive: true });

    const indexPath = resolve(mcpOutDir, 'mcp-index.json');
    writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf-8');
    console.log(`[build-mcp-index] wrote ${indexPath}`);
    console.log(`[build-mcp-index]   components: ${Object.keys(components).length}`);
    console.log(`[build-mcp-index]   props-covered: ${Object.values(components).filter((c) => Object.keys(c.props || {}).length > 0).length}`);
    console.log(`[build-mcp-index]   tokens: ${tokens.length}`);
    console.log(`[build-mcp-index]   examples: ${Object.values(components).reduce((n, c) => n + (c.examples?.length || 0), 0)}`);
    console.log(`[build-mcp-index]   store API groups: ${Object.keys(storeApi.groups).length}`);
    console.log(`[build-mcp-index]   store examples: ${Object.values(storeApi.examples).reduce((n, list) => n + list.length, 0)}`);

    const serverSrc = resolve(__dirname, 'mcp-server.mjs');
    const serverDest = resolve(mcpOutDir, 'server.mjs');
    copyFileSync(serverSrc, serverDest);
    console.log(`[build-mcp-index] copied server to ${serverDest}`);
};

main();
