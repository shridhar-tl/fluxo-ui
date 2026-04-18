#!/usr/bin/env node
import { readFileSync, existsSync, readdirSync, statSync, watch } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const buildIndexFromSource = (sourcePath) => {
    const rootDir = resolve(sourcePath, '..');
    const pkg = existsSync(resolve(rootDir, 'package.json'))
        ? JSON.parse(readFileSync(resolve(rootDir, 'package.json'), 'utf-8'))
        : {};

    const parseComponentExports = () => {
        const indexPath = resolve(sourcePath, 'components/index.ts');
        if (!existsSync(indexPath)) return [];
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
        return Array.from(names).sort();
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

    // Recursively collect all *.props.json files under componentsDir
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

    const slugToTitle = (slug) =>
        slug.split('-').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('');

    const exportedNames = parseComponentExports();
    const { tokens, breakpoints } = parseThemeTokens();
    const examples = collectExamples();
    const propsJsonMap = {
        ...collectPropsJson(resolve(sourcePath, 'components')),
        ...collectPropsJson(resolve(sourcePath, 'store')),
    };

    const components = {};
    for (const name of exportedNames) {
        components[name] = {
            name,
            importFrom: 'fluxo-ui',
            importStatement: `import { ${name} } from 'fluxo-ui';`,
            examples: [],
            props: propsJsonMap[name] || {},
        };
    }
    for (const [slug, demos] of Object.entries(examples)) {
        const candidates = [slugToTitle(slug), slugToTitle(slug).replace(/s$/, '')];
        let matched = candidates.find((c) => components[c]) || exportedNames.find((n) => n.toLowerCase() === slug.replace(/-/g, '').toLowerCase()) || null;
        if (matched) {
            components[matched].storyDir = slug;
            components[matched].examples = demos;
        } else {
            components[`__story_${slug}`] = { name: slugToTitle(slug), storyDir: slug, importFrom: 'fluxo-ui', examples: demos, props: {} };
        }
    }

    const entryPoints = Object.keys(pkg.exports || {}).filter((k) => !k.endsWith('.css') && k !== './styles');

    return {
        generatedAt: new Date().toISOString(),
        library: { name: pkg.name, version: pkg.version, description: pkg.description, homepage: pkg.homepage },
        entryPoints,
        components,
        themes: {
            available: ['theme-blue', 'theme-green', 'theme-orange', 'theme-purple', 'theme-lara', 'theme-indigo', 'theme-rose', 'theme-amber', 'theme-teal', 'theme-emerald', 'theme-fuchsia', 'theme-slate'],
            darkModeClass: 'mode-dark',
            tokens,
            breakpoints,
        },
        quickStart: {
            install: `npm install ${pkg.name || 'fluxo-ui'}`,
            setup: `import { ThemeProvider } from '${pkg.name || 'fluxo-ui'}';\nimport '${pkg.name || 'fluxo-ui'}/styles';\n\nexport default function App() {\n  return (\n    <ThemeProvider>\n      <YourApp />\n    </ThemeProvider>\n  );\n}`,
        },
        managers: [
            { name: 'SnackbarManager', purpose: 'Global toast notifications', api: ['showSnackbar', 'hideSnackbar'], mountOnce: true },
            { name: 'TooltipManager', purpose: 'Global tooltips', api: ['showTooltip', 'hideTooltip'], mountOnce: true },
            { name: 'ContextMenuManager', purpose: 'Global right-click menus', api: ['showContextMenu'], mountOnce: true },
        ],
    };
};

const locateIndex = () => {
    const candidates = [
        resolve(__dirname, 'mcp-index.json'),
        resolve(__dirname, '../mcp/mcp-index.json'),
        resolve(__dirname, '../dist/mcp/mcp-index.json'),
    ];
    for (const c of candidates) if (existsSync(c)) return c;
    return null;
};

const euiSourcePath = process.env['EUI_SOURCE_PATH'];
const euiUseSource = process.env['EUI_USE_SOURCE'];
const useSource = euiSourcePath || (euiUseSource && euiUseSource !== 'false');

let index;
let staticIndexPath = null;
let dirty = false;

if (useSource) {
    const sourcePath = resolve(euiSourcePath || '../fluxo-ui/src');
    if (!existsSync(sourcePath)) {
        process.stderr.write(`[fluxo-ui-mcp] EUI_SOURCE_PATH not found: ${sourcePath}\n`);
        process.exit(1);
    }
    process.stderr.write(`[fluxo-ui-mcp] live-source mode: ${sourcePath}\n`);
    index = buildIndexFromSource(sourcePath);

    const watchTargets = [
        resolve(sourcePath, 'components/index.ts'),
        resolve(sourcePath, 'components/_eui-vars.scss'),
        resolve(sourcePath, 'story/pages'),
        resolve(sourcePath, 'components'),
        resolve(sourcePath, 'store'),
    ];
    for (const target of watchTargets) {
        if (existsSync(target)) {
            watch(target, { recursive: true }, () => { dirty = true; });
        }
    }
    process.stderr.write(`[fluxo-ui-mcp] watching source for changes\n`);
} else {
    staticIndexPath = locateIndex();
    if (!staticIndexPath) {
        process.stderr.write('[fluxo-ui-mcp] mcp-index.json not found. Reinstall fluxo-ui.\n');
        process.exit(1);
    }
    index = JSON.parse(readFileSync(staticIndexPath, 'utf-8'));
}

const getIndex = () => {
    if (useSource && dirty) {
        index = buildIndexFromSource(resolve(euiSourcePath || '../fluxo-ui/src'));
        dirty = false;
    }
    return index;
};

const PROTOCOL_VERSION = '2024-11-05';
const SERVER_INFO = { name: 'fluxo-ui-mcp', version: index.library?.version || '0.0.0' };

const getServerInfo = () => ({ name: 'fluxo-ui-mcp', version: getIndex().library?.version || '0.0.0' });

const componentList = (idx) =>
    Object.values(idx.components).map((c) => ({
        name: c.name,
        importFrom: c.importFrom,
        hasExamples: (c.examples?.length || 0) > 0,
    }));

const findComponent = (idx, name) => {
    const lower = name.toLowerCase();
    for (const c of Object.values(idx.components)) {
        if (c.name.toLowerCase() === lower) return c;
    }
    for (const c of Object.values(idx.components)) {
        if (c.name.toLowerCase().includes(lower)) return c;
    }
    return null;
};

const searchComponents = (idx, query) => {
    const q = query.toLowerCase();
    const hits = [];
    for (const c of Object.values(idx.components)) {
        let score = 0;
        if (c.name.toLowerCase().includes(q)) score += 10;
        for (const ex of c.examples || []) {
            if (ex.title.toLowerCase().includes(q)) score += 3;
            if (ex.code.toLowerCase().includes(q)) score += 1;
        }
        if (score > 0) hits.push({ name: c.name, score, importFrom: c.importFrom });
    }
    return hits.sort((a, b) => b.score - a.score).slice(0, 20);
};

const tools = [
    {
        name: 'list_components',
        description: 'List all components exported by fluxo-ui with their import paths.',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    },
    {
        name: 'get_component',
        description: 'Get details and example code for a specific fluxo-ui component by name.',
        inputSchema: {
            type: 'object',
            properties: { name: { type: 'string', description: 'Component name, e.g. "Button"' } },
            required: ['name'],
            additionalProperties: false,
        },
    },
    {
        name: 'search_components',
        description: 'Fuzzy-search fluxo-ui components and examples by keyword (e.g. "toast", "date picker").',
        inputSchema: {
            type: 'object',
            properties: { query: { type: 'string' } },
            required: ['query'],
            additionalProperties: false,
        },
    },
    {
        name: 'get_example',
        description: 'Get a specific example snippet for a component. Omit exampleTitle to get the first example.',
        inputSchema: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                exampleTitle: { type: 'string' },
            },
            required: ['name'],
            additionalProperties: false,
        },
    },
    {
        name: 'get_theme_tokens',
        description: 'Get fluxo-ui CSS custom properties (--eui-*), available themes, dark mode class, and SCSS breakpoints.',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    },
    {
        name: 'get_quick_start',
        description: 'Get install, setup (ThemeProvider + CSS import), and manager mount info for fluxo-ui.',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    },
    {
        name: 'get_props',
        description: 'Get the full props table for a fluxo-ui component — name, type, default, required, and description for every prop.',
        inputSchema: {
            type: 'object',
            properties: { name: { type: 'string', description: 'Component name, e.g. "Button"' } },
            required: ['name'],
            additionalProperties: false,
        },
    },
];

const asText = (value) => ({
    content: [{ type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value, null, 2) }],
});

const callTool = (name, args) => {
    const idx = getIndex();
    switch (name) {
        case 'list_components':
            return asText({ count: Object.keys(idx.components).length, components: componentList(idx) });
        case 'get_component': {
            const c = findComponent(idx, args?.name || '');
            if (!c) return asText(`Component "${args?.name}" not found.`);
            return asText({
                name: c.name,
                importStatement: c.importStatement || `import { ${c.name} } from '${c.importFrom}';`,
                importFrom: c.importFrom,
                examples: (c.examples || []).map((e) => ({ title: e.title })),
            });
        }
        case 'search_components':
            return asText({ results: searchComponents(idx, args?.query || '') });
        case 'get_example': {
            const c = findComponent(idx, args?.name || '');
            if (!c) return asText(`Component "${args?.name}" not found.`);
            const examples = c.examples || [];
            if (examples.length === 0) return asText(`No examples available for "${c.name}".`);
            const picked = args?.exampleTitle
                ? examples.find((e) => e.title.toLowerCase() === args.exampleTitle.toLowerCase()) || examples[0]
                : examples[0];
            return asText(`// ${c.name} — ${picked.title}\n\n${picked.code}`);
        }
        case 'get_theme_tokens':
            return asText(idx.themes);
        case 'get_quick_start':
            return asText({ ...idx.quickStart, entryPoints: idx.entryPoints, managers: idx.managers });
        case 'get_props': {
            const c = findComponent(idx, args?.name || '');
            if (!c) return asText(`Component "${args?.name}" not found.`);
            const props = c.props || {};
            if (Object.keys(props).length === 0) return asText(`No props data available for "${c.name}".`);
            // Flatten all prop groups (each key in props is either a PropDefinition or a nested group)
            const flattened = {};
            for (const [groupOrProp, val] of Object.entries(props)) {
                if (val && typeof val === 'object' && ('type' in val || 'description' in val)) {
                    flattened[groupOrProp] = val;
                } else if (val && typeof val === 'object') {
                    Object.assign(flattened, val);
                }
            }
            return asText({ component: c.name, props: flattened });
        }
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
};

const resources = [
    { uri: 'fluxo-ui://index', name: 'Full MCP Index', description: 'Complete fluxo-ui metadata JSON', mimeType: 'application/json' },
    { uri: 'fluxo-ui://components', name: 'Component List', description: 'All exported components', mimeType: 'application/json' },
];

const readResource = (uri) => {
    const idx = getIndex();
    if (uri === 'fluxo-ui://index') return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(idx, null, 2) }] };
    if (uri === 'fluxo-ui://components')
        return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(componentList(idx), null, 2) }] };
    throw new Error(`Unknown resource: ${uri}`);
};

const send = (msg) => process.stdout.write(JSON.stringify(msg) + '\n');

const handle = (req) => {
    const { id, method, params } = req;
    try {
        let result;
        switch (method) {
            case 'initialize':
                result = { protocolVersion: PROTOCOL_VERSION, capabilities: { tools: {}, resources: {} }, serverInfo: getServerInfo() };
                break;
            case 'initialized':
            case 'notifications/initialized':
                return;
            case 'tools/list':
                result = { tools };
                break;
            case 'tools/call':
                result = callTool(params?.name, params?.arguments || {});
                break;
            case 'resources/list':
                result = { resources };
                break;
            case 'resources/read':
                result = readResource(params?.uri);
                break;
            case 'ping':
                result = {};
                break;
            default:
                send({ jsonrpc: '2.0', id, error: { code: -32601, message: `Method not found: ${method}` } });
                return;
        }
        if (id !== undefined) send({ jsonrpc: '2.0', id, result });
    } catch (err) {
        if (id !== undefined) send({ jsonrpc: '2.0', id, error: { code: -32603, message: err?.message || String(err) } });
    }
};

const rl = createInterface({ input: process.stdin });
rl.on('line', (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    try {
        handle(JSON.parse(trimmed));
    } catch (err) {
        process.stderr.write(`[fluxo-ui-mcp] parse error: ${err?.message}\n`);
    }
});
