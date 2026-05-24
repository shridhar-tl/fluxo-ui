import { build as viteBuild } from 'vite';
import reactPlugin from '@vitejs/plugin-react';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/*
 * Runtime export-resolution suite.
 *
 * Guarantee under test: EVERY symbol the package advertises from a barrel
 * (`fluxo-ui`, `fluxo-ui/chat`, `fluxo-ui/report-builder`, `fluxo-ui/report-viewer`,
 * `fluxo-ui/draw`, plus the secondary entries `hooks`/`store`/`utils`/`services`/
 * `icons`) actually resolves to a DEFINED, non-null runtime value when a consumer
 * imports it from the BUILT package — exactly the way a client app does.
 *
 * Why this exists: the css-wiring / tree-shaking / exports suites prove styling,
 * chunk-isolation, and that advertised files exist on disk. NONE of them imported
 * the symbols and checked the value. A chunking change can leave a symbol exported
 * by name but `undefined` at runtime (rolldown imports the lazy `t` value of a
 * component chunk but never calls its `init_*`, so the binding is never assigned).
 * That ships a broken `import { Drawer } from 'fluxo-ui'` to every client even
 * though `Drawer` appears in the export list. This suite is the guard against that
 * entire class of bug.
 *
 * Method: for each barrel, generate a tiny consumer entry that does
 * `import * as M from '<subpath>'` and writes, for every own-enumerable key, whether
 * `M[key]` is undefined/null. The entry is bundled with Vite (noExternal) the way a
 * client bundles, executed, and any key that came back BROKEN fails the suite with
 * the exact subpath + symbol names.
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, '..', '..');
const DIST = path.join(REPO, 'dist');
const WORK = path.join(REPO, '.exports-runtime');
const CONSUMER = path.join(WORK, 'consumer');

const args = new Set(process.argv.slice(2));
const NO_BUILD = args.has('--no-build') || process.env.EXPORTS_RUNTIME_NO_BUILD === '1';

// Subpaths whose barrels we import * from and value-check every symbol.
const BARRELS = ['fluxo-ui', 'fluxo-ui/chat', 'fluxo-ui/report-builder', 'fluxo-ui/report-viewer', 'fluxo-ui/draw'];
// Secondary entries that are also public; same value-check.
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

function ensureConsumer() {
    fs.mkdirSync(CONSUMER, { recursive: true });
    fs.writeFileSync(
        path.join(CONSUMER, 'package.json'),
        JSON.stringify({ name: 'fluxo-ui-exports-runtime-consumer', version: '0.0.0', private: true, type: 'module' }, null, 2),
        'utf-8'
    );
    const nm = path.join(CONSUMER, 'node_modules');
    fs.mkdirSync(nm, { recursive: true });
    const link = path.join(nm, 'fluxo-ui');
    try {
        fs.rmSync(link, { recursive: true, force: true });
    } catch {}
    fs.symlinkSync(DIST, link, process.platform === 'win32' ? 'junction' : 'dir');
}

const safe = (s) => s.replace(/[^A-Za-z0-9]/g, '_');

async function probeBarrel(subpath) {
    const id = safe(subpath);
    const entry = path.join(CONSUMER, `entry-${id}.mjs`);
    const reportPath = path.join(CONSUMER, `report-${id}.json`);
    try {
        fs.rmSync(reportPath, { force: true });
    } catch {}
    fs.writeFileSync(
        entry,
        `import * as M from '${subpath}';\n` +
            `import { writeFileSync } from 'fs';\n` +
            `const out = {};\n` +
            `for (const k of Object.keys(M)) { const v = M[k]; out[k] = (v === undefined || v === null) ? 'BROKEN' : (typeof v); }\n` +
            `writeFileSync(${JSON.stringify(reportPath)}, JSON.stringify(out));\n`,
        'utf-8'
    );
    const outDir = path.join(CONSUMER, `out-${id}`);
    await viteBuild({
        root: CONSUMER,
        logLevel: 'silent',
        plugins: [reactPlugin()],
        define: { 'process.env.NODE_ENV': '"production"' },
        build: {
            outDir,
            emptyOutDir: true,
            ssr: entry,
            minify: false,
            rollupOptions: { output: { format: 'es' } },
        },
        ssr: { noExternal: true },
    });
    const built = fs.readdirSync(outDir).find((f) => f.endsWith('.js'));
    if (!built) throw new Error('no built ssr bundle');
    await import(pathToFileURL(path.join(outDir, built)).href + `?t=${Date.now()}`);
    if (!fs.existsSync(reportPath)) throw new Error('entry did not execute / wrote no report');
    const rep = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
    const total = Object.keys(rep).length;
    const broken = Object.entries(rep)
        .filter(([, v]) => v === 'BROKEN')
        .map(([k]) => k)
        .sort();
    try {
        fs.rmSync(outDir, { recursive: true, force: true });
    } catch {}
    return { subpath, total, broken };
}

async function main() {
    if (!NO_BUILD) runBuildLib();
    else console.log(c.yellow('› --no-build: testing the existing dist/ as-is.'));

    if (!fs.existsSync(path.join(DIST, 'package.json'))) {
        console.error(c.red('No dist build found. Run `npm run build-lib` first or omit --no-build.'));
        process.exit(2);
    }

    ensureConsumer();

    const all = [...BARRELS, ...SECONDARY];
    const results = [];
    process.stdout.write(c.gray(`Importing every exported symbol from ${all.length} entry points through a real consumer bundle…\n`));
    for (const subpath of all) {
        let r;
        try {
            r = await probeBarrel(subpath);
        } catch (e) {
            r = { subpath, total: 0, broken: [], error: String(e).split('\n').slice(0, 3).join(' | ') };
        }
        results.push(r);
        if (r.error) process.stdout.write(c.red('E'));
        else process.stdout.write(r.broken.length === 0 ? c.green('.') : c.red('F'));
    }
    process.stdout.write('\n');

    report(results);
}

function report(results) {
    console.log('\n' + c.bold('═'.repeat(80)));
    console.log(c.bold('  RUNTIME EXPORT-RESOLUTION REPORT'));
    console.log(c.bold('═'.repeat(80)));
    console.log(
        '\n' +
            c.bold('Every advertised symbol must resolve to a defined runtime value when imported from the built package.') +
            c.gray('\n(A symbol exported by name but `undefined` at runtime ships a broken import to every client.)')
    );

    let failed = false;
    let totalSymbols = 0;
    let totalBroken = 0;

    for (const r of results) {
        totalSymbols += r.total;
        if (r.error) {
            failed = true;
            console.log('\n' + c.red(`  ✗ ${r.subpath} — entry failed to build/execute:`));
            console.log(c.gray(`      ${r.error}`));
            continue;
        }
        if (r.broken.length === 0) {
            console.log('\n' + c.green(`  ✓ ${r.subpath}`) + c.gray(`  (${r.total} symbols, all resolve)`));
        } else {
            failed = true;
            totalBroken += r.broken.length;
            console.log('\n' + c.red(`  ✗ ${r.subpath} — ${r.broken.length}/${r.total} symbol(s) resolve to undefined/null at runtime:`));
            for (const s of r.broken) console.log(c.red(`      • ${s}`) + c.gray(`  → import { ${s} } from '${r.subpath}'  yields undefined`));
        }
    }

    console.log('\n' + c.bold('─'.repeat(80)));
    console.log(c.bold('  SUMMARY'));
    console.log(`  Entry points checked: ${results.length}   Symbols checked: ${totalSymbols}`);
    if (totalBroken > 0) {
        console.log(c.red(`  BROKEN exports (undefined at runtime): ${totalBroken}`));
        console.log(
            c.gray(
                '  Cause: the barrel imports a component chunk’s value but never runs its initializer ' +
                    '(rolldown chunk hoisting). Fix the chunk config / barrel so the init runs before the value is read.'
            )
        );
    } else {
        console.log(c.green('  All advertised symbols resolve to real runtime values. ✓'));
    }
    console.log(c.bold('─'.repeat(80)) + '\n');

    process.exit(failed ? 1 : 0);
}

main().catch((e) => {
    console.error(c.red('exports-runtime suite crashed:'));
    console.error(e);
    process.exit(2);
});
