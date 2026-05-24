import { build as viteBuild } from 'vite';
import reactPlugin from '@vitejs/plugin-react';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/*
 * Runtime export-resolution suite.
 *
 * Guarantee under test: EVERY symbol the package advertises resolves to a DEFINED,
 * non-null runtime value when a client app imports JUST THAT ONE SYMBOL by name and
 * ships it through a production build with tree-shaking — the exact pipeline a real
 * consumer uses.
 *
 * Two things make this test faithful where earlier versions silently passed:
 *
 *  1. ISOLATED, ONE-SYMBOL-PER-BUNDLE. A consumer writes `import { Splitter }` and
 *     uses nothing else. Importing ALL advertised symbols into one entry keeps the
 *     whole module graph reachable, so every lazy `init_*()` survives and the test
 *     can't fail. The bug only appears when a single symbol is imported alone: the
 *     tree-shaker prunes every init not reachable from that one binding, and if the
 *     binding's value is assigned only inside a pruned init it ends up `undefined`.
 *     So each symbol is bundled in its own entry, alone.
 *
 *  2. REAL CLIENT BUILD honouring `package.json` "sideEffects". `fluxo-ui` is resolved
 *     through a node_modules symlink so its `sideEffects` field is read, and the build
 *     is a normal client build (NOT `ssr`, NOT `import *`). SSR and namespace imports
 *     both retain the graph and hide the bug.
 *
 * A symbol that comes back `BROKEN` ships a broken `import { X }` to every client even
 * though `X` still appears in the export list. This suite is the guard against that
 * entire class of bug.
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, '..', '..');
const DIST = path.join(REPO, 'dist');
const WORK = path.join(REPO, '.exports-runtime');

const args = new Set(process.argv.slice(2));
const NO_BUILD = args.has('--no-build') || process.env.EXPORTS_RUNTIME_NO_BUILD === '1';
const POOL = Number(process.env.EXPORTS_RUNTIME_POOL || 8);

const BARRELS = ['fluxo-ui', 'fluxo-ui/chat', 'fluxo-ui/report-builder', 'fluxo-ui/report-viewer', 'fluxo-ui/draw'];
const SECONDARY = ['fluxo-ui/hooks', 'fluxo-ui/store', 'fluxo-ui/store/middlewares', 'fluxo-ui/utils', 'fluxo-ui/services', 'fluxo-ui/icons'];

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

function ensureConsumerRoot() {
    fs.mkdirSync(WORK, { recursive: true });
    const root = fs.mkdtempSync(path.join(WORK, 'consumer-'));
    const nm = path.join(root, 'node_modules');
    fs.mkdirSync(nm, { recursive: true });
    const linkKind = process.platform === 'win32' ? 'junction' : 'dir';
    fs.symlinkSync(DIST, path.join(nm, 'fluxo-ui'), linkKind);
    for (const dep of ['react', 'react-dom']) {
        fs.symlinkSync(path.join(REPO, 'node_modules', dep), path.join(nm, dep), linkKind);
    }
    return root;
}

const distPkg = () => JSON.parse(fs.readFileSync(path.join(DIST, 'package.json'), 'utf-8'));

function builtFileFor(subpath) {
    const pkg = distPkg();
    const key = subpath === 'fluxo-ui' ? '.' : subpath.replace(/^fluxo-ui/, '.');
    const entry = pkg.exports[key];
    const imp = typeof entry === 'string' ? entry : entry && entry.import;
    if (!imp || !imp.endsWith('.js')) return null;
    return path.join(DIST, imp.replace(/^\.\//, ''));
}

function exportedNames(jsFile) {
    const src = fs.readFileSync(jsFile, 'utf-8');
    const names = new Set();
    const exportBlock = /export\s*\{([\s\S]*?)\}\s*;?/g;
    let m;
    while ((m = exportBlock.exec(src)) !== null) {
        for (const raw of m[1].split(',')) {
            const part = raw.trim();
            if (!part) continue;
            const publicName = part.split(/\s+as\s+/).pop().trim();
            if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(publicName) && publicName !== 'default') names.add(publicName);
        }
    }
    return [...names].sort();
}

const sink = (s) => `__fx_${s.replace(/[^A-Za-z0-9_$]/g, '_')}`;

async function probeOne(consumerRoot, subpath, symbol) {
    const tmp = fs.mkdtempSync(path.join(consumerRoot, 's-'));
    const entry = path.join(tmp, 'entry.js');
    fs.writeFileSync(
        entry,
        `import { ${symbol} } from '${subpath}';\n` +
            `globalThis[${JSON.stringify(sink(symbol))}] = (typeof ${symbol} === 'undefined' || ${symbol} === null) ? 'BROKEN' : (typeof ${symbol});\n`,
        'utf-8'
    );
    let value;
    try {
        const res = await viteBuild({
            root: consumerRoot,
            logLevel: 'silent',
            plugins: [reactPlugin()],
            define: { 'process.env.NODE_ENV': '"production"' },
            build: {
                write: false,
                minify: false,
                target: 'esnext',
                rollupOptions: { input: entry, external: [], output: { format: 'es' } },
            },
        });
        const out = Array.isArray(res) ? res[0] : res;
        const chunk = out.output.find((o) => o.type === 'chunk' && o.isEntry);
        if (!chunk) throw new Error('no entry chunk produced');
        const runFile = path.join(tmp, 'run.mjs');
        fs.writeFileSync(runFile, chunk.code, 'utf-8');
        delete globalThis[sink(symbol)];
        await import(pathToFileURL(runFile).href + `?t=${Date.now()}`);
        value = globalThis[sink(symbol)];
        if (value === undefined) value = 'BROKEN';
    } catch (e) {
        value = 'ERROR:' + String(e).split('\n')[0];
    } finally {
        try {
            fs.rmSync(tmp, { recursive: true, force: true });
        } catch {}
    }
    return value;
}

async function probeBarrel(consumerRoot, subpath, onTick) {
    const jsFile = builtFileFor(subpath);
    if (!jsFile || !fs.existsSync(jsFile)) return { subpath, total: 0, broken: [], error: `no built js for ${subpath}` };
    const names = exportedNames(jsFile);
    if (names.length === 0) return { subpath, total: 0, broken: [], error: `no exported names parsed for ${subpath}` };

    const broken = [];
    let i = 0;
    async function worker() {
        while (i < names.length) {
            const symbol = names[i++];
            const v = await probeOne(consumerRoot, subpath, symbol);
            if (v === 'BROKEN' || (typeof v === 'string' && v.startsWith('ERROR:'))) broken.push(symbol);
            onTick(v === 'BROKEN' || (typeof v === 'string' && v.startsWith('ERROR:')));
        }
    }
    await Promise.all(Array.from({ length: Math.min(POOL, names.length) }, worker));
    broken.sort();
    return { subpath, total: names.length, broken };
}

async function main() {
    if (!NO_BUILD) runBuildLib();
    else console.log(c.yellow('› --no-build: testing the existing dist/ as-is.'));

    if (!fs.existsSync(path.join(DIST, 'package.json'))) {
        console.error(c.red('No dist build found. Run `npm run build-lib` first or omit --no-build.'));
        process.exit(2);
    }

    try {
        fs.rmSync(WORK, { recursive: true, force: true });
    } catch {}
    const consumerRoot = ensureConsumerRoot();

    const all = [...BARRELS, ...SECONDARY];
    const results = [];
    console.log(
        c.gray(
            `Importing every exported symbol ONE-AT-A-TIME from ${all.length} entry points through real consumer client builds (production tree-shaking)…`
        )
    );
    let printed = 0;
    const onTick = (isBroken) => {
        process.stdout.write(isBroken ? c.red('F') : c.green('.'));
        if (++printed % 80 === 0) process.stdout.write('\n');
    };

    for (const subpath of all) {
        let r;
        try {
            r = await probeBarrel(consumerRoot, subpath, onTick);
        } catch (e) {
            r = { subpath, total: 0, broken: [], error: String(e).split('\n').slice(0, 3).join(' | ') };
            process.stdout.write(c.red('E'));
        }
        results.push(r);
    }
    process.stdout.write('\n');

    try {
        fs.rmSync(WORK, { recursive: true, force: true });
    } catch {}

    report(results);
}

function report(results) {
    console.log('\n' + c.bold('═'.repeat(80)));
    console.log(c.bold('  RUNTIME EXPORT-RESOLUTION REPORT  (each symbol imported ALONE, consumer client build)'));
    console.log(c.bold('═'.repeat(80)));
    console.log(
        '\n' +
            c.bold('Every advertised symbol must resolve to a defined runtime value when imported BY ITSELF.') +
            c.gray('\n(A symbol exported by name but `undefined` after tree-shaking ships a broken import to every client.)')
    );

    let failed = false;
    let totalSymbols = 0;
    let totalBroken = 0;

    for (const r of results) {
        totalSymbols += r.total;
        if (r.error) {
            failed = true;
            console.log('\n' + c.red(`  ✗ ${r.subpath} — could not probe:`));
            console.log(c.gray(`      ${r.error}`));
            continue;
        }
        if (r.broken.length === 0) {
            console.log('\n' + c.green(`  ✓ ${r.subpath}`) + c.gray(`  (${r.total} symbols, each resolves when imported alone)`));
        } else {
            failed = true;
            totalBroken += r.broken.length;
            console.log('\n' + c.red(`  ✗ ${r.subpath} — ${r.broken.length}/${r.total} symbol(s) resolve to undefined/null when imported alone:`));
            for (const s of r.broken) console.log(c.red(`      • ${s}`) + c.gray(`  → import { ${s} } from '${r.subpath}'  yields undefined`));
        }
    }

    console.log('\n' + c.bold('─'.repeat(80)));
    console.log(c.bold('  SUMMARY'));
    console.log(`  Entry points checked: ${results.length}   Symbols checked: ${totalSymbols}`);
    if (totalBroken > 0) {
        console.log(c.red(`  BROKEN exports (undefined when imported alone): ${totalBroken}`));
        console.log(
            c.gray(
                '  Cause: the value is assigned only inside a lazy init function whose eager call is an\n' +
                    '  unused expression statement; with "sideEffects" marking .js pure, the consumer prunes it.\n' +
                    '  Fix: make the export bindings survive tree-shaking (eager assignment / retained init).'
            )
        );
    } else {
        console.log(c.green('  Every advertised symbol resolves to a real runtime value when imported alone. ✓'));
    }
    console.log(c.bold('─'.repeat(80)) + '\n');

    process.exit(failed ? 1 : 0);
}

main().catch((e) => {
    console.error(c.red('exports-runtime suite crashed:'));
    console.error(e);
    process.exit(2);
});
