import { build as viteBuild } from 'vite';
import reactPlugin from '@vitejs/plugin-react';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {
    REPO,
    DIST,
    SRC,
    CONSUMER,
    discoverEntries,
    parseRuntimeExports,
    buildCssUniverse,
    buildSymbolGraphMap,
    buildOwnership,
    signatureForRoot,
    ensureConsumerLink,
    readAllCss,
} from '../css-wiring/lib.mjs';

/*
 * Tree-shaking & chunk-isolation suite.
 *
 * Guarantee under test: a consumer who imports ONE thing from fluxo-ui gets ONLY
 * that thing (plus its genuine dependencies) in their final bundle — never an
 * unrelated component, never an optional peer dep they don't use, and never the
 * whole library. CSS follows JS (vite-plugin-lib-inject-css), so isolating the
 * JS chunks isolates the CSS too.
 *
 * Five independent checks, each with explicit pass criteria and a clear failure
 * message that names exactly what leaked into what:
 *
 *   CHECK 1  Component isolation — importing a component alone bundles only the
 *            CSS of its own dist-chunk closure. A foreign component's CSS class
 *            appearing means an unrelated component got bundled in.
 *   CHECK 2  No barrel import — no per-component chunk may statically import the
 *            top-level index barrel (doing so re-bundles the ENTIRE library).
 *   CHECK 3  Optional peer-dep confinement — chart.js / react-chartjs-2 /
 *            html2canvas may only appear in the chunks that genuinely use them.
 *   CHECK 4  No big CSS duplication — a component-owned class may be a full rule
 *            block in only one CSS file (scoped single-prop overrides allowed).
 *   CHECK 5  Pure-logic export isolation — a directly-exported context / enum /
 *            parser must import with ZERO component CSS attached.
 */

const args = new Set(process.argv.slice(2));
const NO_BUILD = args.has('--no-build') || process.env.TREE_TEST_NO_BUILD === '1';
const QUICK = args.has('--quick');

const COMPONENT_BARRELS = {
    'fluxo-ui': path.join(SRC, 'components/index.ts'),
    'fluxo-ui/report-builder': path.join(SRC, 'components/report-builder/index.ts'),
    'fluxo-ui/report-viewer': path.join(SRC, 'components/report-builder/report-viewer-index.ts'),
    'fluxo-ui/chat': path.join(SRC, 'components/chat/index.ts'),
    'fluxo-ui/draw': path.join(SRC, 'components/canvas-draw/index.ts'),
};

const OPTIONAL_PEER_DEPS = ['chart.js', 'react-chartjs-2', 'html2canvas'];
const OPTIONAL_DEP_MARKERS = {
    'chart.js': /PolarAreaController|RadialLinearScale|getDatasetMeta|_metasets|Chart\.register/,
    'react-chartjs-2': /react-chartjs-2|reactChartjs2|ChartComponent/,
    html2canvas: /html2canvas|__html2canvas|cloneWindow|documentClone/,
};

// Genuinely shared single-rule utilities that every component may legitimately
// re-emit (one tiny rule). These are exempt from the duplication / bleed checks.
const SHARED_UTILITY_CLASSES = new Set(['eui-visually-hidden', 'eui-sr-only']);
// A class that appears in N files but where every occurrence beyond the owner is
// a SCOPED override (nested under another selector) counts as a minimal override,
// not a big duplication. Controlled by CHECK 4's rule-vs-override analysis.

const c = {
    green: (s) => `\x1b[32m${s}\x1b[0m`,
    red: (s) => `\x1b[31m${s}\x1b[0m`,
    yellow: (s) => `\x1b[33m${s}\x1b[0m`,
    gray: (s) => `\x1b[90m${s}\x1b[0m`,
    cyan: (s) => `\x1b[36m${s}\x1b[0m`,
    bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

function runBuildLib() {
    console.log(c.cyan('› Running `npm run build-lib` (the dist under test)…'));
    execSync('npm run build-lib', { cwd: REPO, stdio: 'inherit' });
}

const safeName = (s) => s.replace(/[^A-Za-z0-9]/g, '_');
const euiClassesInCss = (css) => new Set([...css.matchAll(/\.(eui-[a-z0-9-]+)/g)].map((m) => m[1]));
const isSharedUtility = (cls) => SHARED_UTILITY_CLASSES.has(cls);

// ─── dist chunk graph: the authoritative "what does X actually pull in" ───────
function buildDistChunkGraph() {
    const jsFiles = [];
    const walk = (d) => {
        for (const e of fs.readdirSync(d, { withFileTypes: true })) {
            const p = path.join(d, e.name);
            if (e.isDirectory()) walk(p);
            else if (e.name.endsWith('.js')) jsFiles.push(p);
        }
    };
    walk(DIST);

    const fromRe = /from\s*['"]([^'"]+)['"]/g;
    const bareImportRe = /(?:^|;|\n)\s*import\s*['"]([^'"]+)['"]/g;
    const graph = new Map();
    for (const f of jsFiles) {
        const src = fs.readFileSync(f, 'utf-8');
        const imports = new Set();
        const cssFiles = new Set();
        const addSpec = (spec) => {
            if (!spec.startsWith('.')) return;
            const abs = path.resolve(path.dirname(f), spec);
            if (spec.endsWith('.css')) cssFiles.add(abs);
            else if (fs.existsSync(abs)) imports.add(abs);
        };
        let m;
        fromRe.lastIndex = 0;
        while ((m = fromRe.exec(src))) addSpec(m[1]);
        bareImportRe.lastIndex = 0;
        while ((m = bareImportRe.exec(src))) addSpec(m[1]);
        graph.set(f, { imports, cssFiles });
    }
    return { graph, jsFiles };
}

function cssClosureFor(graph, startChunk) {
    const seen = new Set();
    const stack = [startChunk];
    const cssFiles = new Set();
    while (stack.length) {
        const f = stack.pop();
        if (!f || seen.has(f)) continue;
        seen.add(f);
        const g = graph.get(f);
        if (!g) continue;
        for (const css of g.cssFiles) cssFiles.add(path.basename(css));
        for (const i of g.imports) stack.push(i);
    }
    return cssFiles;
}

// Resolve an exported symbol to its dist chunk by reading where the entry file
// imports it from, then following to the concrete component chunk.
//
// A dist entry looks like:
//   import { a as Draggable_default } from "./components/drag-drop-X.js";  // local → chunk
//   ...
//   export { Draggable_default as Draggable, ReportBuilder };             // public → local
// where a symbol may also be defined inline in the entry chunk itself
// (then its chunk IS the entry file). We resolve the PUBLIC export name to the
// chunk that ultimately holds it.
function buildSymbolToChunk(entryFile, jsFiles) {
    const src = fs.existsSync(entryFile) ? fs.readFileSync(entryFile, 'utf-8') : '';

    // local identifier → chunk it was imported from
    const localToChunk = new Map();
    const importRe = /import\s*\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]/g;
    let m;
    while ((m = importRe.exec(src))) {
        const spec = m[2];
        if (!spec.startsWith('.')) continue;
        const abs = path.resolve(path.dirname(entryFile), spec);
        if (!fs.existsSync(abs)) continue;
        for (const part of m[1].split(',')) {
            const t = part.trim();
            if (!t) continue;
            const asMatch = t.match(/^(.+?)\s+as\s+([A-Za-z0-9_$]+)$/);
            const local = asMatch ? asMatch[2].trim() : t;
            localToChunk.set(local, abs);
        }
    }

    // public export name → local identifier (and thus chunk, or entry file if inline)
    const map = new Map();
    const exportRe = /export\s*\{([^}]*)\}/g;
    while ((m = exportRe.exec(src))) {
        for (const part of m[1].split(',')) {
            const t = part.trim();
            if (!t) continue;
            const asMatch = t.match(/^(.+?)\s+as\s+([A-Za-z0-9_$]+)$/);
            const local = asMatch ? asMatch[1].trim() : t;
            const exported = asMatch ? asMatch[2].trim() : t;
            const chunk = localToChunk.get(local) || entryFile; // inline → entry chunk
            map.set(exported, chunk);
        }
    }
    // also expose direct local names (covers symbols re-exported without an explicit export{} block)
    for (const [local, chunk] of localToChunk) if (!map.has(local)) map.set(local, chunk);

    void jsFiles;
    return map;
}

function readAllJs(outDir) {
    let js = '';
    const walk = (d) => {
        if (!fs.existsSync(d)) return;
        for (const e of fs.readdirSync(d, { withFileTypes: true })) {
            const p = path.join(d, e.name);
            if (e.isDirectory()) walk(p);
            else if (e.name.endsWith('.js') || e.name.endsWith('.mjs')) js += fs.readFileSync(p, 'utf-8') + '\n';
        }
    };
    walk(outDir);
    return js;
}

function writeImportOnlyEntry(file, subpath, symbol, render) {
    const renderBlock = render
        ? `if (typeof C === 'function') { try { const el = document.createElement('div'); createRoot(el).render(createElement(C)); } catch (e) {} }`
        : '';
    fs.writeFileSync(
        file,
        `import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { ${symbol} } from '${subpath}';
const C = ${symbol};
globalThis.__keep = C;
${renderBlock}
`,
        'utf-8'
    );
}

async function buildIsolated(consumerDir, id, entryFile) {
    const outDir = path.join(consumerDir, `ts-out-${id}`);
    await viteBuild({
        root: consumerDir,
        logLevel: 'silent',
        plugins: [reactPlugin()],
        define: { 'process.env.NODE_ENV': '"production"' },
        build: {
            outDir,
            emptyOutDir: true,
            cssCodeSplit: false,
            minify: false,
            chunkSizeWarningLimit: 1e7,
            rollupOptions: {
                input: { [id]: entryFile },
                external: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime'],
                output: { codeSplitting: false },
            },
        },
    });
    return outDir;
}

// Map every eui- class to the dist CSS file that defines it as a rule.
function buildClassToCssFile() {
    const cssDir = path.join(DIST, 'styles', 'components');
    const classToFiles = new Map();
    if (!fs.existsSync(cssDir)) return classToFiles;
    const ruleRe = /(^|})\s*((?:\.eui-[a-z0-9-]+\s*[^{,]*(?:,\s*)?)+)\{/g;
    for (const f of fs.readdirSync(cssDir).filter((x) => x.endsWith('.css'))) {
        const css = fs.readFileSync(path.join(cssDir, f), 'utf-8');
        for (const cm of css.matchAll(/\.(eui-[a-z0-9-]+)/g)) {
            const cls = cm[1];
            if (!classToFiles.has(cls)) classToFiles.set(cls, new Set());
            classToFiles.get(cls).add(f);
        }
        void ruleRe;
    }
    return classToFiles;
}

function classifyExports() {
    const entries = discoverEntries();
    const { universe } = buildCssUniverse();
    const { classOwner } = buildOwnership(universe);
    const { graph, jsFiles } = buildDistChunkGraph();

    const visual = [];
    const pureLogic = [];
    const seen = new Set();

    for (const [subpath, barrel] of Object.entries(COMPONENT_BARRELS)) {
        const entry = entries[subpath];
        if (!entry || !entry.exists) continue;
        const runtime = parseRuntimeExports(entry.file);
        const map = buildSymbolGraphMap(barrel, runtime);
        const symbolToChunk = buildSymbolToChunk(entry.file, jsFiles);

        for (const sym of runtime) {
            const key = `${subpath}::${sym}`;
            if (seen.has(key)) continue;
            seen.add(key);
            if (!/^[A-Z]/.test(sym)) continue; // hooks/functions handled elsewhere
            if (/^[A-Z0-9_]+$/.test(sym)) continue; // constants

            const root = map.get(sym);
            const chunk = symbolToChunk.get(sym);
            const allowedCss = chunk ? cssClosureFor(graph, chunk) : new Set();

            if (!root) continue;
            const sig = signatureForRoot(root, universe, classOwner);
            if (sig.signature.length > 0) {
                visual.push({
                    sym,
                    subpath,
                    chunk,
                    allowedCssFiles: allowedCss,
                    signature: sig.signature,
                    expectsOptionalDeps: OPTIONAL_PEER_DEPS.filter((dep) => sourceGraphUsesDep(root, dep)),
                });
            } else if (sig.declaredEui.length === 0) {
                pureLogic.push({ sym, subpath, chunk });
            }
        }
    }
    return { visual, pureLogic, classOwner, graph };
}

// ─── CHECK 2: no built chunk imports the top-level barrel ────────────────────
function checkNoBarrelImport() {
    const offenders = [];
    const barrelNames = new Set(['index.js']);
    const componentsDir = path.join(DIST, 'components');
    if (!fs.existsSync(componentsDir)) return offenders;
    const importRe = /import\s*(?:\{[^}]*\}|\*\s*as\s*\w+|\w+)?\s*(?:,\s*\{[^}]*\})?\s*from\s*['"]([^'"]+)['"]/g;
    for (const file of fs.readdirSync(componentsDir).filter((f) => f.endsWith('.js'))) {
        const abs = path.join(componentsDir, file);
        const src = fs.readFileSync(abs, 'utf-8');
        let m;
        importRe.lastIndex = 0;
        while ((m = importRe.exec(src))) {
            if (barrelNames.has(path.basename(m[1]))) {
                offenders.push({
                    chunk: `components/${file}`,
                    spec: m[1],
                    snippet: src.slice(m.index, m.index + m[0].length).slice(0, 160),
                });
            }
        }
    }
    return offenders;
}

// ─── CHECK 4: a component-owned class fully (re)defined in >1 CSS file ────────
// Distinguishes a big duplication (full rule block repeated) from a scoped
// single-property override nested under another component's selector.
function checkCssDuplication(classOwner) {
    const cssDir = path.join(DIST, 'styles', 'components');
    if (!fs.existsSync(cssDir)) return [];

    // For each css file, collect classes that appear as a TOP-LEVEL rule selector
    // (i.e. the rule's selector starts with that class, not nested under another).
    const topLevelDefiners = new Map();
    for (const f of fs.readdirSync(cssDir).filter((x) => x.endsWith('.css'))) {
        const css = fs.readFileSync(path.join(cssDir, f), 'utf-8');
        // crude rule tokenizer: split on '}', take the selector before each '{'
        for (const block of css.split('}')) {
            const braceIdx = block.indexOf('{');
            if (braceIdx === -1) continue;
            const selector = block.slice(0, braceIdx).trim();
            if (!selector) continue;
            for (const sel of selector.split(',')) {
                const s = sel.trim();
                // top-level rule for class X: selector is exactly .X or .X:pseudo or .X.modifier
                const m = s.match(/^\.(eui-[a-z0-9-]+)(?:[:.\[][^ >+~]*)?$/);
                if (!m) continue;
                const cls = m[1];
                if (!topLevelDefiners.has(cls)) topLevelDefiners.set(cls, new Set());
                topLevelDefiners.get(cls).add(f);
            }
        }
    }

    const dups = [];
    for (const [cls, files] of topLevelDefiners) {
        if (files.size <= 1) continue;
        if (isSharedUtility(cls)) continue;
        if (!classOwner.has(cls)) continue;
        dups.push({ cls, owner: classOwner.get(cls), files: [...files] });
    }
    dups.sort((a, b) => b.files.length - a.files.length);
    return dups;
}

// ─── CHECK 6: base design tokens / dark-mode / global rules emitted ONCE ──────
// The base layer (:root { --eui-* } light tokens, body.mode-dark overrides, the
// global [class*="eui-"] scrollbar rule) is shared by EVERY component. It must be
// emitted in exactly ONE shared base CSS file and pulled in transitively — never
// copied into each component's CSS. If it appears in N component CSS files, every
// consumer who imports a single component re-ships the whole token block, and N-1
// copies are dead weight. CHECK 4 cannot see this because :root / body.mode-dark
// selectors do not start with `.eui-`.
const BASE_LAYER_SIGNATURES = [
    {
        id: 'root-eui-tokens',
        label: ':root { --eui-* } base design tokens',
        // a :root rule that defines the core --eui- color tokens
        test: (css) => /:root\s*\{[^}]*--eui-bg\s*:/.test(css) && /:root\s*\{[^}]*--eui-text\s*:/.test(css),
    },
    {
        id: 'dark-mode-tokens',
        label: 'body.mode-dark { --eui-* } dark-mode overrides',
        test: (css) => /\.mode-dark\b[^{]*\{[^}]*--eui-bg\s*:/.test(css),
    },
    {
        id: 'global-scrollbar',
        label: '[class*="eui-"] global scrollbar rule',
        test: (css) => /\[class\*=["']?eui-["']?\]/.test(css),
    },
];

function checkBaseLayerDuplication() {
    const cssDir = path.join(DIST, 'styles', 'components');
    const results = [];
    if (!fs.existsSync(cssDir)) {
        return BASE_LAYER_SIGNATURES.map((sig) => ({ ...sig, files: [], missing: true }));
    }
    const cssFiles = fs.readdirSync(cssDir).filter((x) => x.endsWith('.css'));
    const contents = new Map();
    for (const f of cssFiles) contents.set(f, fs.readFileSync(path.join(cssDir, f), 'utf-8'));

    for (const sig of BASE_LAYER_SIGNATURES) {
        const files = [];
        for (const [f, css] of contents) if (sig.test(css)) files.push(f);
        results.push({ ...sig, files, missing: files.length === 0 });
    }
    return results;
}

// ─── source-graph external-dep helper (for optional-dep expectations) ────────
const depGraphCache = new Map();
function sourceGraphUsesDep(rootFile, dep) {
    let usage = depGraphCache.get(rootFile);
    if (!usage) {
        usage = collectExternalSpecs(rootFile);
        depGraphCache.set(rootFile, usage);
    }
    return usage.has(dep);
}
const RESOLVE_EXT = ['.tsx', '.ts', '.jsx', '.js'];
function resolveRel(spec, fromFile) {
    if (!spec.startsWith('.')) return null;
    const base = path.resolve(path.dirname(fromFile), spec);
    const candidates = [];
    if (path.extname(base) && fs.existsSync(base)) candidates.push(base);
    for (const ext of RESOLVE_EXT) candidates.push(base + ext);
    for (const ext of RESOLVE_EXT) candidates.push(path.join(base, 'index' + ext));
    for (const cand of candidates) if (fs.existsSync(cand) && fs.statSync(cand).isFile()) return cand;
    return null;
}
function collectExternalSpecs(rootFile) {
    const seen = new Set();
    const stack = [rootFile];
    const externals = new Set();
    const importRe = /(?:import|export)\b[^'"]*?from\s*['"]([^'"]+)['"]|import\s*\(\s*(?:\/\*[\s\S]*?\*\/\s*)?['"]([^'"]+)['"]\s*\)|import\s*['"]([^'"]+)['"]/g;
    while (stack.length) {
        const f = stack.pop();
        if (!f || seen.has(f)) continue;
        seen.add(f);
        const src = fs.existsSync(f) ? fs.readFileSync(f, 'utf-8') : '';
        let m;
        importRe.lastIndex = 0;
        while ((m = importRe.exec(src))) {
            const spec = m[1] || m[2] || m[3];
            if (!spec) continue;
            if (spec.startsWith('.')) {
                const resolved = resolveRel(spec, f);
                if (resolved) stack.push(resolved);
            } else externals.add(spec);
        }
    }
    return externals;
}

async function main() {
    if (!NO_BUILD) runBuildLib();
    else console.log(c.yellow('› --no-build: testing the existing dist/ as-is.'));

    if (!fs.existsSync(path.join(DIST, 'package.json'))) {
        console.error(c.red('No dist build found. Run `npm run build-lib` first or omit --no-build.'));
        process.exit(2);
    }

    fs.mkdirSync(path.join(CONSUMER, 'entries'), { recursive: true });
    ensureConsumerLink();

    const { visual, pureLogic, classOwner } = classifyExports();
    const classToCssFile = buildClassToCssFile();

    const visualList = QUICK ? visual.slice(0, 16) : visual;
    const logicList = QUICK ? pureLogic.slice(0, 8) : pureLogic;

    console.log(
        c.gray(
            `\nDiscovered ${visual.length} visual components + ${pureLogic.length} pure-logic direct exports across ${Object.keys(COMPONENT_BARRELS).length} entry points.`
        )
    );
    console.log(c.gray(`Isolated-consumer builds: ${visualList.length} visual + ${logicList.length} pure-logic.\n`));

    const barrelOffenders = checkNoBarrelImport();
    const cssDups = checkCssDuplication(classOwner);
    const baseLayer = checkBaseLayerDuplication();

    const isoResults = [];
    let i = 0;
    for (const item of visualList) {
        i++;
        const id = `${safeName(item.subpath)}__${item.sym}`;
        const entryFile = path.join(CONSUMER, 'entries', `${id}.jsx`);
        writeImportOnlyEntry(entryFile, item.subpath, item.sym, true);
        let outDir;
        try {
            outDir = await buildIsolated(CONSUMER, id, entryFile);
        } catch (e) {
            isoResults.push({ ...item, verdict: 'BUILD_FAIL', detail: String(e).split('\n')[0], foreign: [], leakedDeps: [] });
            process.stdout.write(c.red('E'));
            continue;
        }
        const css = readAllCss(outDir);
        const js = readAllJs(outDir);
        const present = euiClassesInCss(css);

        const foreign = [];
        for (const cls of present) {
            if (isSharedUtility(cls)) continue;
            const definingFiles = classToCssFile.get(cls);
            if (!definingFiles) continue; // not a built component class (token/shared)
            // allowed iff at least one defining CSS file is in this component's closure
            const allowed = [...definingFiles].some((f) => item.allowedCssFiles.has(f));
            if (allowed) continue;
            foreign.push({ cls, files: [...definingFiles] });
        }
        const leakedDeps = OPTIONAL_PEER_DEPS.filter(
            (dep) => OPTIONAL_DEP_MARKERS[dep].test(js) && !item.expectsOptionalDeps.includes(dep)
        );

        const verdict = foreign.length === 0 && leakedDeps.length === 0 ? 'PASS' : 'FAIL';
        isoResults.push({ ...item, verdict, foreign, leakedDeps });
        fs.rmSync(outDir, { recursive: true, force: true });
        process.stdout.write(verdict === 'PASS' ? c.green('.') : c.red('F'));
        if (i % 60 === 0) process.stdout.write('\n');
    }
    process.stdout.write('\n');

    const logicResults = [];
    let j = 0;
    for (const item of logicList) {
        j++;
        const id = `${safeName(item.subpath)}__logic__${item.sym}`;
        const entryFile = path.join(CONSUMER, 'entries', `${id}.jsx`);
        writeImportOnlyEntry(entryFile, item.subpath, item.sym, false);
        let outDir;
        try {
            outDir = await buildIsolated(CONSUMER, id, entryFile);
        } catch (e) {
            logicResults.push({ ...item, verdict: 'BUILD_FAIL', detail: String(e).split('\n')[0], pulled: [] });
            process.stdout.write(c.red('E'));
            continue;
        }
        const css = readAllCss(outDir);
        const pulled = [...euiClassesInCss(css)].filter((cls) => !isSharedUtility(cls) && classToCssFile.has(cls));
        const verdict = pulled.length === 0 ? 'PASS' : 'FAIL';
        logicResults.push({ ...item, verdict, pulled, cssKB: Math.round(css.length / 1024) });
        fs.rmSync(outDir, { recursive: true, force: true });
        process.stdout.write(verdict === 'PASS' ? c.green('.') : c.red('L'));
        if (j % 60 === 0) process.stdout.write('\n');
    }
    process.stdout.write('\n');

    report({ isoResults, logicResults, barrelOffenders, cssDups, baseLayer });
}

function report({ isoResults, logicResults, barrelOffenders, cssDups, baseLayer }) {
    console.log('\n' + c.bold('═'.repeat(80)));
    console.log(c.bold('  TREE-SHAKING & CHUNK-ISOLATION REPORT'));
    console.log(c.bold('═'.repeat(80)));

    let failed = false;

    // CHECK 1
    const isoFail = isoResults.filter((r) => r.verdict !== 'PASS');
    console.log(
        '\n' +
            c.bold('CHECK 1 — Component isolation: ') +
            c.gray('importing a component alone must bundle only its own dist-chunk closure CSS.')
    );
    if (isoFail.length === 0) {
        console.log(c.green(`  ✓ PASS — all ${isoResults.length} components isolate cleanly; none drags in a foreign component.`));
    } else {
        failed = true;
        console.log(c.red(`  ✗ FAIL — ${isoFail.length}/${isoResults.length} components pull in code they should not.`));
        for (const r of isoFail) {
            console.log(c.red(`    • ${r.sym} [${r.subpath}]`));
            if (r.detail) console.log(c.gray(`        build error: ${r.detail}`));
            if (r.foreign && r.foreign.length) {
                const fileSet = new Set();
                for (const f of r.foreign) for (const ff of f.files) fileSet.add(ff);
                console.log(
                    c.red(
                        `        FOREIGN COMPONENT BUNDLED IN: importing "${r.sym}" shipped CSS owned by other ` +
                            `component(s) [${[...fileSet].join(', ')}] — ${r.foreign.length} foreign class(es).`
                    )
                );
                for (const f of r.foreign.slice(0, 8)) console.log(c.gray(`          ${f.cls}  (defined in ${f.files.join(', ')})`));
                if (r.foreign.length > 8) console.log(c.gray(`          … and ${r.foreign.length - 8} more`));
            }
        }
        console.log(
            c.gray(
                "    Fix: the foreign component got merged into this component's chunk, or this component imports it unnecessarily. " +
                    'Each component must be its own chunk that IMPORTS shared deps, never inlines a sibling.'
            )
        );
    }

    // CHECK 3
    const depFail = isoResults.filter((r) => r.leakedDeps && r.leakedDeps.length);
    console.log(
        '\n' +
            c.bold('CHECK 3 — Optional peer-dep confinement: ') +
            c.gray('chart.js / react-chartjs-2 / html2canvas must stay inside components that use them.')
    );
    if (depFail.length === 0) {
        console.log(c.green('  ✓ PASS — no component bundles an optional peer dep it does not use.'));
    } else {
        failed = true;
        console.log(c.red(`  ✗ FAIL — ${depFail.length} component(s) bundle an optional dep they should not.`));
        for (const r of depFail)
            console.log(
                c.red(`    • ${r.sym} [${r.subpath}] leaked: ${r.leakedDeps.join(', ')}`) +
                    c.gray(' — a consumer without these installed would break just by importing this component.')
            );
    }

    // CHECK 2
    console.log(
        '\n' + c.bold('CHECK 2 — No barrel import: ') + c.gray('no component chunk may statically import the top-level index barrel.')
    );
    if (barrelOffenders.length === 0) {
        console.log(c.green('  ✓ PASS — no chunk imports the barrel; importing one component never pulls the whole library.'));
    } else {
        failed = true;
        console.log(c.red(`  ✗ FAIL — ${barrelOffenders.length} chunk(s) import the barrel (this re-bundles the ENTIRE library):`));
        for (const o of barrelOffenders) {
            console.log(c.red(`    • ${o.chunk} imports "${o.spec}"`));
            console.log(c.gray(`        ${o.snippet}`));
        }
        console.log(
            c.gray(
                '    Fix: the imported symbol(s) live in a shared module that got merged into index.js. ' +
                    'Give that module its own chunk (perSharedModuleName in vite.lib.config.ts).'
            )
        );
    }

    // CHECK 4
    console.log(
        '\n' +
            c.bold('CHECK 4 — No big CSS duplication: ') +
            c.gray('a component-owned class may be a top-level rule in only one CSS file.')
    );
    if (cssDups.length === 0) {
        console.log(c.green('  ✓ PASS — no component-owned class is fully redefined across chunks.'));
    } else {
        failed = true;
        console.log(c.red(`  ✗ FAIL — ${cssDups.length} component-owned class(es) are defined as a top-level rule in >1 CSS file:`));
        for (const d of cssDups.slice(0, 20))
            console.log(c.red(`    • ${d.cls}`) + c.gray(` (owner: ${d.owner}) in: ${d.files.join(', ')}`));
        if (cssDups.length > 20) console.log(c.gray(`    … and ${cssDups.length - 20} more`));
        console.log(
            c.gray(
                "    Fix: the owner's full styles are @use'd / inlined into another component's SCSS. " +
                    'Move shared styles into the owning component and import that component instead.'
            )
        );
    }

    // CHECK 5
    const logicFail = logicResults.filter((r) => r.verdict !== 'PASS');
    console.log(
        '\n' +
            c.bold('CHECK 5 — Pure-logic export isolation: ') +
            c.gray('a directly-exported context / enum / util must import with ZERO component CSS.')
    );
    if (logicResults.length === 0) {
        console.log(c.gray('  (no pure-logic exports discovered)'));
    } else if (logicFail.length === 0) {
        console.log(c.green(`  ✓ PASS — all ${logicResults.length} pure-logic exports import with no component CSS.`));
    } else {
        failed = true;
        console.log(c.red(`  ✗ FAIL — ${logicFail.length}/${logicResults.length} pure-logic exports drag in a whole component:`));
        for (const r of logicFail) {
            if (r.detail) {
                console.log(c.red(`    • ${r.sym} [${r.subpath}] build error: ${r.detail}`));
                continue;
            }
            console.log(
                c.red(`    • ${r.sym} [${r.subpath}]`) +
                    c.gray(` pulled ${r.pulled.length} component class(es) / ${r.cssKB}KB CSS — e.g. ${r.pulled.slice(0, 6).join(', ')}`)
            );
        }
        console.log(
            c.gray(
                '    Fix: this export shares a chunk with its CSS-heavy component. Split the pure-logic module so it tree-shakes alone.'
            )
        );
    }

    // CHECK 6
    const baseDupes = baseLayer.filter((b) => !b.missing && b.files.length > 1);
    const baseMissing = baseLayer.filter((b) => b.missing);
    console.log(
        '\n' +
            c.bold('CHECK 6 — Base layer emitted once: ') +
            c.gray('shared :root tokens / dark-mode / global scrollbar must live in ONE base CSS file, not every component.')
    );
    if (baseDupes.length === 0 && baseMissing.length === 0) {
        console.log(
            c.green('  ✓ PASS — every base-layer block is emitted in exactly one component CSS file (no per-component duplication).')
        );
        for (const b of baseLayer) console.log(c.gray(`        ${b.label} → ${b.files[0]}`));
    } else {
        failed = true;
        if (baseDupes.length) {
            console.log(c.red(`  ✗ FAIL — ${baseDupes.length} base-layer block(s) are DUPLICATED across component CSS files:`));
            for (const b of baseDupes) {
                console.log(
                    c.red(`    • ${b.label} appears in ${b.files.length} files`) +
                        c.gray(' — this whole block is re-shipped by every consumer who imports any one of these components.')
                );
                console.log(c.gray(`        e.g. ${b.files.slice(0, 6).join(', ')}${b.files.length > 6 ? `, … (+${b.files.length - 6})` : ''}`));
            }
            console.log(
                c.gray(
                    '    Fix: move the shared base CSS out of the per-component SCSS (_eui-vars.scss must emit nothing) into a single ' +
                        'base style module that every component imports transitively (the eui-base chunk). Then it ships once.'
                )
            );
        }
        if (baseMissing.length) {
            console.log(c.red(`  ✗ FAIL — ${baseMissing.length} base-layer block(s) were NOT FOUND in any component CSS file:`));
            for (const b of baseMissing)
                console.log(
                    c.red(`    • ${b.label} is missing`) +
                        c.gray(' — components would render unstyled (no tokens). The base chunk is not being emitted/wired.')
                );
        }
    }

    console.log('\n' + c.bold('─'.repeat(80)));
    console.log(c.bold('  SUMMARY'));
    const line = (label, ok, extra) =>
        console.log(`  ${ok ? c.green('PASS') : c.red('FAIL')}  ${label}${extra ? c.gray('  ' + extra) : ''}`);
    line('CHECK 1 component isolation', isoFail.length === 0, `${isoResults.length - isoFail.length}/${isoResults.length}`);
    line('CHECK 2 no barrel import', barrelOffenders.length === 0, `${barrelOffenders.length} offenders`);
    line('CHECK 3 optional-dep confinement', depFail.length === 0, `${depFail.length} leaks`);
    line('CHECK 4 no big CSS duplication', cssDups.length === 0, `${cssDups.length} dup classes`);
    line('CHECK 5 pure-logic isolation', logicFail.length === 0, `${logicResults.length - logicFail.length}/${logicResults.length}`);
    const baseDupCount = baseLayer.filter((b) => !b.missing && b.files.length > 1).length;
    const baseMissCount = baseLayer.filter((b) => b.missing).length;
    line('CHECK 6 base layer emitted once', baseDupCount === 0 && baseMissCount === 0, `${baseDupCount} duped, ${baseMissCount} missing`);
    console.log(c.bold('─'.repeat(80)) + '\n');

    process.exit(failed ? 1 : 0);
}

main().catch((e) => {
    console.error(c.red('tree-shaking suite crashed:'));
    console.error(e);
    process.exit(2);
});
