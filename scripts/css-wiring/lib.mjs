import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const REPO = path.resolve(here, '..', '..');
export const DIST = path.join(REPO, 'dist');
export const SRC = path.join(REPO, 'src');
export const WORK = path.join(REPO, '.css-test');
export const CONSUMER = path.join(WORK, 'consumer');

export const log = (...a) => console.log(...a);

const EUI_CLASS_RE = /eui-[a-z0-9]+(?:-[a-z0-9]+)*/g;

export const readIfExists = (f) => (fs.existsSync(f) ? fs.readFileSync(f, 'utf-8') : null);

export function writeConsumerPackageJson(dir) {
    fs.writeFileSync(
        path.join(dir, 'package.json'),
        JSON.stringify({ name: 'fluxo-ui-css-consumer', version: '0.0.0', private: true, type: 'module' }, null, 2) +
            '\n',
        'utf-8'
    );
}

export function linkFluxoUi(consumerDir, target) {
    const nm = path.join(consumerDir, 'node_modules');
    const link = path.join(nm, 'fluxo-ui');
    fs.mkdirSync(nm, { recursive: true });
    try {
        fs.rmSync(link, { recursive: true, force: true });
    } catch {}
    fs.symlinkSync(target, link, process.platform === 'win32' ? 'junction' : 'dir');
    return link;
}

export function ensureConsumerLink() {
    fs.mkdirSync(CONSUMER, { recursive: true });
    writeConsumerPackageJson(CONSUMER);
    return linkFluxoUi(CONSUMER, DIST);
}

export function discoverEntries() {
    const pkg = JSON.parse(fs.readFileSync(path.join(DIST, 'package.json'), 'utf-8'));
    const entries = {};
    for (const [key, val] of Object.entries(pkg.exports || {})) {
        const subpath = key === '.' ? 'fluxo-ui' : `fluxo-ui/${key.replace(/^\.\//, '')}`;
        let file = null;
        let kind = 'other';
        if (typeof val === 'string') {
            file = path.join(DIST, val.replace(/^\.\//, ''));
            kind = val.endsWith('.css') ? 'css' : val.endsWith('.json') ? 'json' : 'other';
        } else if (val && typeof val === 'object' && val.import) {
            file = path.join(DIST, val.import.replace(/^\.\//, ''));
            kind = 'js';
        }
        entries[subpath] = { subpath, key, file, kind, exists: file ? fs.existsSync(file) : false };
    }
    return entries;
}

export function parseRuntimeExports(jsFile) {
    const src = readIfExists(jsFile);
    if (!src) return [];
    const names = new Set();
    const re = /export\s*\{([^}]*)\}/g;
    let m;
    while ((m = re.exec(src))) {
        for (const part of m[1].split(',')) {
            const t = part.trim();
            if (!t) continue;
            const asMatch = t.match(/\bas\s+([A-Za-z0-9_$]+)\s*$/);
            const name = asMatch ? asMatch[1] : t;
            if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name) && name !== 'default') names.add(name);
        }
    }
    return [...names];
}

export function buildCssUniverse() {
    const stylesDir = path.join(DIST, 'styles');
    const tokenFile = path.join(stylesDir, 'components.css');
    const files = [];
    const walk = (d) => {
        for (const e of fs.readdirSync(d, { withFileTypes: true })) {
            const p = path.join(d, e.name);
            if (e.isDirectory()) walk(p);
            else if (e.name.endsWith('.css')) files.push(p);
        }
    };
    walk(stylesDir);
    const universe = new Set();
    for (const f of files) {
        if (path.resolve(f) === path.resolve(tokenFile)) continue;
        const css = fs.readFileSync(f, 'utf-8');
        for (const mm of css.matchAll(/\.(eui-[a-z0-9-]+)/g)) universe.add(mm[1]);
    }
    const tokenCss = readIfExists(tokenFile) || '';
    return { universe, tokenCss, tokenFile, cssFileCount: files.length };
}

const RESOLVE_EXT = ['.tsx', '.ts', '.jsx', '.js'];
function resolveSourceFile(spec, fromFile) {
    if (!spec.startsWith('.')) return null;
    const base = path.resolve(path.dirname(fromFile), spec);
    const candidates = [];
    if (path.extname(base) && fs.existsSync(base)) candidates.push(base);
    for (const ext of RESOLVE_EXT) candidates.push(base + ext);
    for (const ext of RESOLVE_EXT) candidates.push(path.join(base, 'index' + ext));
    for (const c of candidates) {
        if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
    }
    return null;
}

export function topFolderOf(file) {
    const rel = path.relative(path.join(SRC, 'components'), file).replace(/\\/g, '/');
    if (rel.startsWith('..')) return 'misc:' + path.relative(SRC, file).replace(/\\/g, '/').split('/')[0];
    const seg = rel.split('/')[0];
    return seg.replace(/\.(tsx|ts|jsx|js|scss)$/, '');
}

const fileCache = new Map();
function fileFacts(file) {
    if (fileCache.has(file)) return fileCache.get(file);
    const src = readIfExists(file) || '';
    const eui = new Set();
    for (const mm of src.matchAll(EUI_CLASS_RE)) eui.add(mm[0]);
    const imports = new Set();
    const importRe = /(?:import|export)\b[^'"]*?from\s*['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\)|import\s*['"]([^'"]+)['"]/g;
    let m;
    while ((m = importRe.exec(src))) {
        const spec = m[1] || m[2] || m[3];
        if (!spec || !spec.startsWith('.')) continue;
        const resolved = resolveSourceFile(spec, file);
        if (resolved) imports.add(resolved);
    }
    const facts = { eui, imports };
    fileCache.set(file, facts);
    return facts;
}

function walkGraph(rootFile) {
    const seen = new Set();
    const stack = [rootFile];
    const eui = new Set();
    const folders = new Set();
    while (stack.length) {
        const f = stack.pop();
        if (!f || seen.has(f)) continue;
        seen.add(f);
        const facts = fileFacts(f);
        for (const c of facts.eui) eui.add(c);
        folders.add(topFolderOf(f));
        for (const imp of facts.imports) stack.push(imp);
    }
    return { eui, files: seen, folders };
}

function parseReExports(barrelFile) {
    const src = readIfExists(barrelFile) || '';
    const out = [];
    const namedRe = /export\s*\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]/g;
    let m;
    while ((m = namedRe.exec(src))) {
        const names = [];
        const namesRaw = [];
        for (const part of m[1].split(',')) {
            const t = part.trim();
            if (!t) continue;
            namesRaw.push(t);
            const asMatch = t.match(/^(.+?)\s+as\s+([A-Za-z0-9_$]+)$/);
            const exported = asMatch ? asMatch[2] : t;
            if (exported !== 'default' && /^[A-Za-z_$]/.test(exported)) names.push(exported);
        }
        out.push({ names, namesRaw, spec: m[2], star: false });
    }
    const starRe = /export\s*\*\s*from\s*['"]([^'"]+)['"]/g;
    while ((m = starRe.exec(src))) out.push({ names: null, spec: m[1], star: true });
    return out;
}

function collectReExportedNames(file, seen = new Set()) {
    if (!file || seen.has(file)) return new Set();
    seen.add(file);
    const names = new Set();
    parseRuntimeNamesFromSource(file).forEach((n) => names.add(n));
    for (const re of parseReExports(file)) {
        const target = resolveSourceFile(re.spec, file);
        if (re.star && target) {
            for (const n of collectReExportedNames(target, seen)) names.add(n);
        } else if (re.names) {
            for (const n of re.names) names.add(n);
        }
    }
    return names;
}

function parseRuntimeNamesFromSource(file) {
    const src = readIfExists(file) || '';
    const names = new Set();
    for (const mm of src.matchAll(/export\s+(?:const|function|class|let)\s+([A-Za-z0-9_$]+)/g)) names.add(mm[1]);
    for (const mm of src.matchAll(/export\s*\{([^}]*)\}(?!\s*from)/g)) {
        for (const part of mm[1].split(',')) {
            const t = part.trim();
            if (!t) continue;
            const asMatch = t.match(/^(.+?)\s+as\s+([A-Za-z0-9_$]+)$/);
            const exported = asMatch ? asMatch[2] : t;
            if (exported !== 'default' && /^[A-Za-z_$]/.test(exported)) names.add(exported);
        }
    }
    return names;
}

function localDefines(file, name) {
    const src = readIfExists(file) || '';
    if (new RegExp(`export\\s+(?:const|function|class|let)\\s+${name}\\b`).test(src)) return true;
    if (new RegExp(`export\\s+default\\s+(?:function|class)\\s+${name}\\b`).test(src)) return true;
    return false;
}

function resolveNameToFile(barrelFile, name, seen = new Set()) {
    const sig = barrelFile + '::' + name;
    if (seen.has(sig)) return null;
    seen.add(sig);
    if (localDefines(barrelFile, name)) return barrelFile;
    const src = readIfExists(barrelFile) || '';
    if (new RegExp(`export\\s*\\{[^}]*\\b${name}\\b[^}]*\\}(?!\\s*from)`).test(src)) return barrelFile;
    for (const re of parseReExports(barrelFile)) {
        const target = resolveSourceFile(re.spec, barrelFile);
        if (!target) continue;
        if (re.star) {
            const names = collectReExportedNames(target);
            if (names.has(name)) {
                const r = resolveNameToFile(target, name, seen);
                return r || target;
            }
        } else if (re.names) {
            for (const part of re.namesRaw || []) {
                const asMatch = part.match(/^(.+?)\s+as\s+([A-Za-z0-9_$]+)$/);
                const exported = asMatch ? asMatch[2] : part;
                const local = asMatch ? asMatch[1].trim() : part;
                if (exported === name) {
                    if (local === 'default') return target;
                    const r = resolveNameToFile(target, local, seen);
                    return r || target;
                }
            }
        }
    }
    return null;
}

export function buildSymbolGraphMap(barrelFile, runtimeNames) {
    const symbolToRoot = new Map();
    for (const n of runtimeNames) {
        const f = resolveNameToFile(barrelFile, n);
        if (f) symbolToRoot.set(n, f);
    }
    return symbolToRoot;
}

function scssTopLevelRoots(scssText) {
    const roots = new Set();
    for (const line of scssText.split('\n')) {
        if (/^\.eui-[a-z0-9-]/.test(line)) {
            for (const mm of line.matchAll(/\.(eui-[a-z0-9-]+)/g)) roots.add(mm[1]);
        }
    }
    return roots;
}

function listScssFiles(dir) {
    const out = [];
    const walk = (d) => {
        if (!fs.existsSync(d)) return;
        for (const e of fs.readdirSync(d, { withFileTypes: true })) {
            const p = path.join(d, e.name);
            if (e.isDirectory()) walk(p);
            else if (e.name.endsWith('.scss') && !e.name.startsWith('_')) out.push(p);
        }
    };
    walk(dir);
    return out;
}

export function buildOwnership(universe) {
    const componentsDir = path.join(SRC, 'components');
    const prefixFolders = new Map();
    for (const scss of listScssFiles(componentsDir)) {
        const folder = topFolderOf(scss);
        const roots = scssTopLevelRoots(fs.readFileSync(scss, 'utf-8'));
        for (const r of roots) {
            if (!prefixFolders.has(r)) prefixFolders.set(r, new Set());
            prefixFolders.get(r).add(folder);
        }
    }
    const ownedPrefixes = [];
    for (const [prefix, folders] of prefixFolders) {
        if (folders.size === 1) ownedPrefixes.push({ prefix, folder: [...folders][0] });
    }
    ownedPrefixes.sort((a, b) => b.prefix.length - a.prefix.length);
    const classOwner = new Map();
    for (const c of universe) {
        let best = null;
        for (const op of ownedPrefixes) {
            if (c === op.prefix || c.startsWith(op.prefix + '-')) {
                best = op;
                break;
            }
        }
        if (best) classOwner.set(c, best.folder);
    }
    return { classOwner, ownedPrefixes };
}

export function signatureForRoot(rootFile, universe, classOwner) {
    const definingFolder = topFolderOf(rootFile);
    const { eui, folders } = walkGraph(rootFile);
    const renderedBuilt = [...eui].filter((c) => universe.has(c));
    const ownClasses = renderedBuilt.filter((c) => classOwner.get(c) === definingFolder);
    const depClasses = renderedBuilt.filter((c) => classOwner.has(c) && classOwner.get(c) !== definingFolder);
    return {
        definingFolder,
        renderedBuilt,
        signature: ownClasses,
        depClasses,
        declaredEui: [...eui],
        graphFolders: [...folders],
    };
}

export function collectCssFromManifest(manifest, key, outDir) {
    const seen = new Set();
    const cssFiles = new Set();
    const walk = (k) => {
        if (!k || seen.has(k)) return;
        seen.add(k);
        const m = manifest[k];
        if (!m) return;
        for (const f of m.css || []) cssFiles.add(f);
        for (const imp of m.imports || []) walk(imp);
        for (const imp of m.dynamicImports || []) walk(imp);
    };
    walk(key);
    let css = '';
    for (const f of cssFiles) css += fs.readFileSync(path.join(outDir, f), 'utf-8') + '\n';
    return { css, cssFileCount: cssFiles.size };
}

export function rmrf(p) {
    try {
        fs.rmSync(p, { recursive: true, force: true });
    } catch {}
}

export function writeEntryFile(file, importSpec, symbols) {
    const names = symbols.join(', ');
    const refs = symbols.map((s) => `tryRender(${s});`).join('\n');
    fs.writeFileSync(
        file,
        `import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { ${names} } from '${importSpec}';
function tryRender(C) {
    globalThis.__keep = (globalThis.__keep || []);
    globalThis.__keep.push(C);
    if (typeof C !== 'function') return;
    try { const el = document.createElement('div'); createRoot(el).render(createElement(C)); } catch (e) {}
}
${refs}
`,
        'utf-8'
    );
}

export async function runConsumerBuild({ consumerDir, input, outSub, single, viteBuild, reactPlugin }) {
    const outDir = path.join(consumerDir, outSub);
    const rollupOutput = {};
    if (single) {
        rollupOutput.codeSplitting = false;
    }
    await viteBuild({
        root: consumerDir,
        logLevel: 'silent',
        plugins: [reactPlugin()],
        define: { 'process.env.NODE_ENV': '"production"' },
        build: {
            outDir,
            emptyOutDir: true,
            manifest: !single,
            cssCodeSplit: !single,
            minify: false,
            chunkSizeWarningLimit: 100000,
            rollupOptions: { input, output: rollupOutput },
        },
    });
    let manifest = null;
    const manifestPath = path.join(outDir, '.vite', 'manifest.json');
    if (fs.existsSync(manifestPath)) manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    return { outDir, manifest };
}

export function readAllCss(outDir) {
    let css = '';
    const walk = (d) => {
        if (!fs.existsSync(d)) return;
        for (const e of fs.readdirSync(d, { withFileTypes: true })) {
            const p = path.join(d, e.name);
            if (e.isDirectory()) walk(p);
            else if (e.name.endsWith('.css')) css += fs.readFileSync(p, 'utf-8') + '\n';
        }
    };
    walk(outDir);
    return css;
}

export function classesPresent(css, classList) {
    const present = [];
    const missing = [];
    for (const c of classList) {
        if (css.includes('.' + c)) present.push(c);
        else missing.push(c);
    }
    return { present, missing };
}

export const hasTokenDefinition = (css) => /--eui-bg\s*:/.test(css) && /--eui-text\s*:/.test(css);

