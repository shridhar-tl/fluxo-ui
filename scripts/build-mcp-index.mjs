#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, existsSync, copyFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');
const distDir = resolve(rootDir, 'dist');
const mcpOutDir = resolve(distDir, 'mcp');

const pkg = JSON.parse(readFileSync(resolve(rootDir, 'package.json'), 'utf-8'));

const parseComponentExports = () => {
    const indexPath = resolve(rootDir, 'src/components/index.ts');
    const src = readFileSync(indexPath, 'utf-8');
    const names = new Set();
    const namedRe = /export\s*(?:type\s*)?\{\s*([^}]+)\}\s*from/g;
    const defaultRe = /export\s*\{\s*default\s+as\s+(\w+)\s*\}/g;
    let m;
    while ((m = namedRe.exec(src))) {
        for (const raw of m[1].split(',')) {
            const clean = raw.trim().replace(/^type\s+/, '').replace(/^default\s+as\s+/, '').split(/\s+as\s+/).pop();
            if (clean && /^[A-Z]/.test(clean)) names.add(clean);
        }
    }
    while ((m = defaultRe.exec(src))) names.add(m[1]);
    return Array.from(names).sort();
};

const parseThemeTokens = () => {
    const scssPath = resolve(rootDir, 'src/components/_eui-vars.scss');
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
    const pagesDir = resolve(rootDir, 'src/story/pages');
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
    slug
        .split('-')
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join('');

const buildComponentEntries = (exportedNames, examples) => {
    const byKey = {};
    for (const name of exportedNames) {
        byKey[name] = {
            name,
            importFrom: 'fluxo-ui',
            importStatement: `import { ${name} } from 'fluxo-ui';`,
            examples: [],
        };
    }
    for (const [slug, demos] of Object.entries(examples)) {
        const candidates = [slugToTitle(slug), slugToTitle(slug).replace(/s$/, '')];
        let matched = null;
        for (const c of candidates) {
            if (byKey[c]) {
                matched = c;
                break;
            }
        }
        if (!matched) {
            for (const name of exportedNames) {
                if (name.toLowerCase() === slug.replace(/-/g, '').toLowerCase()) {
                    matched = name;
                    break;
                }
            }
        }
        if (matched) {
            byKey[matched].storyDir = slug;
            byKey[matched].examples = demos;
        } else {
            byKey[`__story_${slug}`] = {
                name: slugToTitle(slug),
                storyDir: slug,
                importFrom: 'fluxo-ui',
                examples: demos,
            };
        }
    }
    return byKey;
};

const main = () => {
    console.log('[build-mcp-index] extracting library metadata...');
    const exportedNames = parseComponentExports();
    const { tokens, breakpoints } = parseThemeTokens();
    const examples = collectExamples();
    const components = buildComponentEntries(exportedNames, examples);

    const entryPoints = Object.keys(pkg.exports || {}).filter((k) => !k.endsWith('.css') && k !== './styles');

    const index = {
        generatedAt: new Date().toISOString(),
        library: {
            name: pkg.name,
            version: pkg.version,
            description: pkg.description,
            homepage: pkg.homepage,
        },
        entryPoints,
        components,
        themes: {
            available: ['theme-blue', 'theme-green', 'theme-orange', 'theme-purple', 'theme-lara', 'theme-indigo', 'theme-rose', 'theme-amber', 'theme-teal', 'theme-emerald', 'theme-fuchsia', 'theme-slate'],
            darkModeClass: 'mode-dark',
            tokens,
            breakpoints,
        },
        quickStart: {
            install: `npm install ${pkg.name}`,
            setup: `import { ThemeProvider } from '${pkg.name}';\nimport '${pkg.name}/styles';\n\nexport default function App() {\n  return (\n    <ThemeProvider>\n      <YourApp />\n    </ThemeProvider>\n  );\n}`,
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
    console.log(`[build-mcp-index]   tokens: ${tokens.length}`);
    console.log(`[build-mcp-index]   examples: ${Object.values(components).reduce((n, c) => n + (c.examples?.length || 0), 0)}`);

    const serverSrc = resolve(__dirname, 'mcp-server.mjs');
    const serverDest = resolve(mcpOutDir, 'server.mjs');
    copyFileSync(serverSrc, serverDest);
    console.log(`[build-mcp-index] copied server to ${serverDest}`);
};

main();
