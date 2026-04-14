#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const locateIndex = () => {
    const candidates = [
        resolve(__dirname, 'mcp-index.json'),
        resolve(__dirname, '../mcp/mcp-index.json'),
        resolve(__dirname, '../dist/mcp/mcp-index.json'),
    ];
    for (const c of candidates) if (existsSync(c)) return c;
    return null;
};

const indexPath = locateIndex();
if (!indexPath) {
    process.stderr.write('[fluxo-ui-mcp] mcp-index.json not found. Reinstall fluxo-ui.\n');
    process.exit(1);
}

const index = JSON.parse(readFileSync(indexPath, 'utf-8'));

const PROTOCOL_VERSION = '2024-11-05';
const SERVER_INFO = { name: 'fluxo-ui-mcp', version: index.library?.version || '0.0.0' };

const componentList = () =>
    Object.values(index.components).map((c) => ({
        name: c.name,
        importFrom: c.importFrom,
        hasExamples: (c.examples?.length || 0) > 0,
    }));

const findComponent = (name) => {
    const lower = name.toLowerCase();
    for (const c of Object.values(index.components)) {
        if (c.name.toLowerCase() === lower) return c;
    }
    for (const c of Object.values(index.components)) {
        if (c.name.toLowerCase().includes(lower)) return c;
    }
    return null;
};

const searchComponents = (query) => {
    const q = query.toLowerCase();
    const hits = [];
    for (const c of Object.values(index.components)) {
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
];

const asText = (value) => ({
    content: [{ type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value, null, 2) }],
});

const callTool = (name, args) => {
    switch (name) {
        case 'list_components':
            return asText({ count: Object.keys(index.components).length, components: componentList() });
        case 'get_component': {
            const c = findComponent(args?.name || '');
            if (!c) return asText(`Component "${args?.name}" not found.`);
            return asText({
                name: c.name,
                importStatement: c.importStatement || `import { ${c.name} } from '${c.importFrom}';`,
                importFrom: c.importFrom,
                examples: (c.examples || []).map((e) => ({ title: e.title })),
            });
        }
        case 'search_components':
            return asText({ results: searchComponents(args?.query || '') });
        case 'get_example': {
            const c = findComponent(args?.name || '');
            if (!c) return asText(`Component "${args?.name}" not found.`);
            const examples = c.examples || [];
            if (examples.length === 0) return asText(`No examples available for "${c.name}".`);
            const picked = args?.exampleTitle
                ? examples.find((e) => e.title.toLowerCase() === args.exampleTitle.toLowerCase()) || examples[0]
                : examples[0];
            return asText(`// ${c.name} — ${picked.title}\n\n${picked.code}`);
        }
        case 'get_theme_tokens':
            return asText(index.themes);
        case 'get_quick_start':
            return asText({ ...index.quickStart, entryPoints: index.entryPoints, managers: index.managers });
        default:
            throw new Error(`Unknown tool: ${name}`);
    }
};

const resources = [
    { uri: 'fluxo-ui://index', name: 'Full MCP Index', description: 'Complete fluxo-ui metadata JSON', mimeType: 'application/json' },
    { uri: 'fluxo-ui://components', name: 'Component List', description: 'All exported components', mimeType: 'application/json' },
];

const readResource = (uri) => {
    if (uri === 'fluxo-ui://index') return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(index, null, 2) }] };
    if (uri === 'fluxo-ui://components')
        return { contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(componentList(), null, 2) }] };
    throw new Error(`Unknown resource: ${uri}`);
};

const send = (msg) => process.stdout.write(JSON.stringify(msg) + '\n');

const handle = (req) => {
    const { id, method, params } = req;
    try {
        let result;
        switch (method) {
            case 'initialize':
                result = { protocolVersion: PROTOCOL_VERSION, capabilities: { tools: {}, resources: {} }, serverInfo: SERVER_INFO };
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
