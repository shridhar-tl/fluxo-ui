#!/usr/bin/env node
import { readFileSync, existsSync, readdirSync, statSync, watch } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

const flattenProps = (raw) => {
    if (!raw || typeof raw !== 'object') return {};
    const out = {};
    for (const [groupOrProp, val] of Object.entries(raw)) {
        if (val && typeof val === 'object' && ('type' in val || 'description' in val)) {
            out[groupOrProp] = val;
        } else if (val && typeof val === 'object') {
            for (const [k, v] of Object.entries(val)) out[k] = v;
        }
    }
    return out;
};

const slugToTitle = (slug) =>
    slug.split('-').map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('');

const buildIndexFromSource = (sourcePath) => {
    const rootDir = resolve(sourcePath, '..');
    const pkg = existsSync(resolve(rootDir, 'package.json'))
        ? JSON.parse(readFileSync(resolve(rootDir, 'package.json'), 'utf-8'))
        : {};

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

    const storeApi = {
        groups: {},
        examples: {},
    };
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

    return {
        generatedAt: new Date().toISOString(),
        library: { name: pkg.name, version: pkg.version, description: pkg.description, homepage: pkg.homepage },
        entryPoints,
        components,
        storeApi,
        themes: {
            available: ['theme-blue', 'theme-green', 'theme-orange', 'theme-purple', 'theme-lara', 'theme-indigo', 'theme-rose', 'theme-amber', 'theme-teal', 'theme-emerald', 'theme-fuchsia', 'theme-slate'],
            darkModeClass: 'mode-dark',
            howToApply: `Apply a theme and dark mode by adding the class names to the <body> element. Both are optional — without them components render in the default blue/light palette.\n\ndocument.body.classList.add('theme-purple', 'mode-dark');`,
            howToImport: `Each theme ships as its own CSS subpath so only the theme you use is bundled. Import it once at your app entry:\n\nimport '${pkg.name || 'fluxo-ui'}/themes/purple';\n\nAvailable: ${pkg.name || 'fluxo-ui'}/themes/blue · green · orange · purple · lara · indigo · rose · amber · teal · emerald · fuchsia · slate. The default blue palette is already included with the components — only import a theme subpath if you switch to a non-blue theme.`,
            tokens,
            breakpoints,
        },
        quickStart: {
            install: `npm install ${pkg.name || 'fluxo-ui'}`,
            stylesAreAutomatic: `You do NOT need to import a global stylesheet. Importing any component automatically applies that component's CSS plus the base design tokens and dark-mode support. Just import and use:\n\nimport { Button, TextInput } from '${pkg.name || 'fluxo-ui'}';\n\nexport default function App() {\n  return (\n    <>\n      <TextInput placeholder="Your name" />\n      <Button label="Submit" />\n    </>\n  );\n}`,
            optionalTheme: `To use a brand theme other than the default blue, import its theme CSS once and add the class to <body>:\n\nimport '${pkg.name || 'fluxo-ui'}/themes/purple';\ndocument.body.classList.add('theme-purple');`,
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

const getServerInfo = () => ({ name: 'fluxo-ui-mcp', version: getIndex().library?.version || '0.0.0' });

const TYPE_ONLY_SUFFIXES = ['Props', 'State', 'Position', 'Variant', 'Size', 'Layout', 'Orientation', 'Mode', 'Direction', 'Item', 'Result', 'Spec', 'Return', 'RenderProps', 'ChangeEvent', 'Type', 'Status', 'Indicator', 'CallbackArg', 'Event', 'Theme'];
const TYPE_ONLY_NAMES = new Set(['CheckState', 'Column', 'JsonValue', 'JsonObject', 'JsonArray', 'JsonValueType', 'DragItem', 'DragDropInfo', 'DragLayerState', 'DragPreviewProp', 'RangeOption', 'SelectionMode', 'TreeNode', 'ListItem', 'ComponentEvent', 'StepStatus']);

const isLikelyComponent = (c) => {
    if (Object.keys(c.props || {}).length > 0) return true;
    if ((c.examples?.length || 0) > 0) return true;
    if (TYPE_ONLY_NAMES.has(c.name)) return false;
    for (const suffix of TYPE_ONLY_SUFFIXES) {
        if (c.name.endsWith(suffix) && c.name !== suffix) return false;
    }
    return true;
};

const componentList = (idx) =>
    Object.values(idx.components)
        .filter(isLikelyComponent)
        .map((c) => ({ name: c.name, hasProps: Object.keys(c.props || {}).length > 0, hasExamples: (c.examples?.length || 0) > 0 }))
        .sort((a, b) => a.name.localeCompare(b.name));

const findComponent = (idx, name) => {
    if (!name) return null;
    const lower = name.toLowerCase();
    for (const c of Object.values(idx.components)) {
        if (c.name.toLowerCase() === lower) return c;
    }
    for (const c of Object.values(idx.components)) {
        if (c.name.toLowerCase().includes(lower)) return c;
    }
    return null;
};

const searchAll = (idx, query) => {
    const q = query.toLowerCase();
    const hits = [];
    for (const c of Object.values(idx.components)) {
        let score = 0;
        if (c.name.toLowerCase().includes(q)) score += 10;
        for (const ex of c.examples || []) {
            if (ex.title.toLowerCase().includes(q)) score += 3;
            if (ex.code.toLowerCase().includes(q)) score += 1;
        }
        if (score > 0) hits.push({ name: c.name, kind: 'component', score });
    }
    if (idx.storeApi?.groups) {
        for (const [groupKey, groupValue] of Object.entries(idx.storeApi.groups)) {
            for (const apiKey of Object.keys(groupValue || {})) {
                if (apiKey.toLowerCase().includes(q)) hits.push({ name: apiKey, kind: 'store-api', group: groupKey, score: 8 });
            }
        }
    }
    return hits.sort((a, b) => b.score - a.score).slice(0, 25);
};

const tools = [
    {
        name: 'list_components',
        description: 'List every fluxo-ui component name (sorted). Use this first, then call get_props for the one you need.',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    },
    {
        name: 'get_props',
        description: 'Get the props table for a fluxo-ui component. Returns a flat map of prop name to { type, default, required, description }.',
        inputSchema: {
            type: 'object',
            properties: { name: { type: 'string', description: 'Component name, e.g. "Button"' } },
            required: ['name'],
            additionalProperties: false,
        },
    },
    {
        name: 'list_examples',
        description: 'List example titles available for a component. Pair with get_example to fetch one.',
        inputSchema: {
            type: 'object',
            properties: { name: { type: 'string' } },
            required: ['name'],
            additionalProperties: false,
        },
    },
    {
        name: 'get_example',
        description: 'Get the source code of a specific example. Omit exampleTitle to get the first one.',
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
        name: 'search',
        description: 'Fuzzy search across components and store APIs. Returns names + kind so you know which fetcher to call next.',
        inputSchema: {
            type: 'object',
            properties: { query: { type: 'string' } },
            required: ['query'],
            additionalProperties: false,
        },
    },
    {
        name: 'list_store_apis',
        description: 'List the state-management API surfaces (store, slice, middleware). Returns group names + API keys. Pair with get_store_api.',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    },
    {
        name: 'get_store_api',
        description: 'Get the description of a state-management API by key (e.g. "createSlice(name, initializer, middlewares?)" or "persistMiddleware(options)").',
        inputSchema: {
            type: 'object',
            properties: { name: { type: 'string', description: 'API key from list_store_apis, or a fragment like "persist" or "createSlice"' } },
            required: ['name'],
            additionalProperties: false,
        },
    },
    {
        name: 'list_store_examples',
        description: 'List state-management example topics (basic, slice, middleware, model). Pair with get_store_example.',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    },
    {
        name: 'get_store_example',
        description: 'Get the source code of a state-management example by topic + title.',
        inputSchema: {
            type: 'object',
            properties: {
                topic: { type: 'string', description: 'One of: basic, slice, middleware, model' },
                exampleTitle: { type: 'string' },
            },
            required: ['topic'],
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
        description: 'Get install command, ThemeProvider setup snippet, entry points, and manager mount info.',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    },
];

const asText = (value) => ({
    content: [{ type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value) }],
});

const findStoreApi = (idx, name) => {
    if (!name || !idx.storeApi?.groups) return null;
    const lower = name.toLowerCase();
    for (const [groupKey, group] of Object.entries(idx.storeApi.groups)) {
        for (const [apiKey, apiValue] of Object.entries(group || {})) {
            if (apiKey.toLowerCase() === lower) return { group: groupKey, key: apiKey, value: apiValue };
        }
    }
    for (const [groupKey, group] of Object.entries(idx.storeApi.groups)) {
        for (const [apiKey, apiValue] of Object.entries(group || {})) {
            if (apiKey.toLowerCase().includes(lower)) return { group: groupKey, key: apiKey, value: apiValue };
        }
    }
    return null;
};

const callTool = (name, args) => {
    const idx = getIndex();
    switch (name) {
        case 'list_components': {
            const list = componentList(idx);
            return asText({ count: list.length, components: list });
        }

        case 'get_props': {
            const c = findComponent(idx, args?.name || '');
            if (!c) return asText(`Component "${args?.name}" not found.`);
            const props = flattenProps(c.props);
            if (Object.keys(props).length === 0) return asText({ component: c.name, props: {}, note: 'No props metadata available' });
            return asText({ component: c.name, props });
        }

        case 'list_examples': {
            const c = findComponent(idx, args?.name || '');
            if (!c) return asText(`Component "${args?.name}" not found.`);
            return asText({ component: c.name, examples: (c.examples || []).map((e) => e.title) });
        }

        case 'get_example': {
            const c = findComponent(idx, args?.name || '');
            if (!c) return asText(`Component "${args?.name}" not found.`);
            const examples = c.examples || [];
            if (examples.length === 0) return asText(`No examples for "${c.name}".`);
            const picked = args?.exampleTitle
                ? examples.find((e) => e.title.toLowerCase() === args.exampleTitle.toLowerCase()) || examples[0]
                : examples[0];
            return asText(`// ${c.name} — ${picked.title}\n\n${picked.code}`);
        }

        case 'search':
            return asText({ results: searchAll(idx, args?.query || '') });

        case 'list_store_apis': {
            const groups = idx.storeApi?.groups || {};
            const out = {};
            for (const [groupKey, group] of Object.entries(groups)) {
                out[groupKey] = Object.keys(group || {});
            }
            return asText({ groups: out });
        }

        case 'get_store_api': {
            const hit = findStoreApi(idx, args?.name || '');
            if (!hit) return asText(`Store API "${args?.name}" not found. Call list_store_apis to see available keys.`);
            return asText({ group: hit.group, key: hit.key, ...hit.value });
        }

        case 'list_store_examples': {
            const examples = idx.storeApi?.examples || {};
            const out = {};
            for (const [topic, list] of Object.entries(examples)) {
                out[topic] = list.map((e) => e.title);
            }
            return asText({ topics: out });
        }

        case 'get_store_example': {
            const examples = idx.storeApi?.examples || {};
            const topicList = examples[args?.topic];
            if (!topicList) return asText(`Topic "${args?.topic}" not found. Call list_store_examples.`);
            const picked = args?.exampleTitle
                ? topicList.find((e) => e.title.toLowerCase() === args.exampleTitle.toLowerCase()) || topicList[0]
                : topicList[0];
            return asText(`// store/${args?.topic} — ${picked.title}\n\n${picked.code}`);
        }

        case 'get_theme_tokens':
            return asText(idx.themes);

        case 'get_quick_start':
            return asText({ ...idx.quickStart, entryPoints: idx.entryPoints, managers: idx.managers });

        default:
            throw new Error(`Unknown tool: ${name}`);
    }
};

const resources = [
    { uri: 'fluxo-ui://index', name: 'Full MCP Index', description: 'Complete fluxo-ui metadata JSON', mimeType: 'application/json' },
    { uri: 'fluxo-ui://components', name: 'Component List', description: 'All exported components', mimeType: 'application/json' },
    { uri: 'fluxo-ui://store', name: 'Store API', description: 'State-management API surfaces', mimeType: 'application/json' },
];

const readResource = (uri) => {
    const idx = getIndex();
    if (uri === 'fluxo-ui://index') return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(idx) }] };
    if (uri === 'fluxo-ui://components')
        return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(componentList(idx)) }] };
    if (uri === 'fluxo-ui://store')
        return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(idx.storeApi || {}) }] };
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
