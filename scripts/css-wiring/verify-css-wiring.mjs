import { build as viteBuild } from 'vite';
import reactPlugin from '@vitejs/plugin-react';
import { execFileSync, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {
    REPO,
    DIST,
    SRC,
    WORK,
    CONSUMER,
    discoverEntries,
    parseRuntimeExports,
    buildCssUniverse,
    buildSymbolGraphMap,
    buildOwnership,
    signatureForRoot,
    ensureConsumerLink,
    writeConsumerPackageJson,
    linkFluxoUi,
    writeEntryFile,
    runConsumerBuild,
    collectCssFromManifest,
    readAllCss,
    classesPresent,
    hasTokenDefinition,
    rmrf,
} from './lib.mjs';

const args = new Set(process.argv.slice(2));
const NO_BUILD = args.has('--no-build') || process.env.CSS_TEST_NO_BUILD === '1';
const QUICK = args.has('--quick');

const COMPONENT_BARRELS = {
    'fluxo-ui': path.join(SRC, 'components/index.ts'),
    'fluxo-ui/report-builder': path.join(SRC, 'components/report-builder/index.ts'),
    'fluxo-ui/report-viewer': path.join(SRC, 'components/report-builder/report-viewer-index.ts'),
    'fluxo-ui/chat': path.join(SRC, 'components/chat/index.ts'),
    'fluxo-ui/draw': path.join(SRC, 'components/canvas-draw/index.ts'),
};

const c = {
    green: (s) => `\x1b[32m${s}\x1b[0m`,
    red: (s) => `\x1b[31m${s}\x1b[0m`,
    yellow: (s) => `\x1b[33m${s}\x1b[0m`,
    gray: (s) => `\x1b[90m${s}\x1b[0m`,
    cyan: (s) => `\x1b[36m${s}\x1b[0m`,
    bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

function runBuildLib() {
    console.log(c.cyan('› Running `npm run build-lib` (fresh build is the system under test)…'));
    execSync('npm run build-lib', { cwd: REPO, stdio: 'inherit' });
}

function safeName(s) {
    return s.replace(/[^A-Za-z0-9]/g, '_');
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

    const entries = discoverEntries();
    const { universe, tokenCss, cssFileCount } = buildCssUniverse();
    const { classOwner } = buildOwnership(universe);

    console.log(
        c.gray(
            `\nDiscovered: ${Object.keys(entries).length} package exports · ${cssFileCount} CSS files · ${universe.size} CSS classes · ${classOwner.size} uniquely owned`
        )
    );

    const components = [];
    const naSymbols = [];
    for (const [subpath, barrel] of Object.entries(COMPONENT_BARRELS)) {
        const entry = entries[subpath];
        if (!entry || !entry.exists) {
            console.log(c.red(`  entry missing for ${subpath}`));
            continue;
        }
        const runtime = parseRuntimeExports(entry.file);
        const map = buildSymbolGraphMap(barrel, runtime);
        for (const sym of runtime) {
            if (!/^[A-Z]/.test(sym)) continue;
            if (/^[A-Z0-9_]+$/.test(sym)) {
                naSymbols.push({ sym, subpath, reason: 'constant (non-component export)' });
                continue;
            }
            const root = map.get(sym);
            if (!root) {
                naSymbols.push({ sym, subpath, reason: 'unresolved source' });
                continue;
            }
            const sig = signatureForRoot(root, universe, classOwner);
            if (sig.signature.length > 0) {
                components.push({ sym, subpath, root, ...sig });
            } else {
                const reason = sig.declaredEui.length
                    ? 'renders only shared/utility classes'
                    : 'no own CSS class (non-visual or composed)';
                naSymbols.push({ sym, subpath, reason });
            }
        }
    }

    console.log(
        c.gray(
            `Component candidates with own CSS: ${components.length} · non-visual / shared-styled (N/A): ${naSymbols.length}`
        )
    );

    const testList = QUICK ? components.slice(0, 12) : components;

    const input = {};
    const idOf = (item) => `${safeName(item.subpath)}__${item.sym}`;
    for (const item of testList) {
        const id = idOf(item);
        const file = path.join(CONSUMER, 'entries', `${id}.jsx`);
        writeEntryFile(file, item.subpath, [item.sym]);
        input[id] = file;
    }

    console.log(c.cyan(`\n› Test A — isolation: building ${testList.length} single-component consumers…`));
    const a = await runConsumerBuild({
        consumerDir: CONSUMER,
        input,
        outSub: 'out-a',
        single: false,
        viteBuild,
        reactPlugin,
    });

    for (const item of testList) {
        const id = idOf(item);
        const key = path.relative(CONSUMER, input[id]).replace(/\\/g, '/');
        const { css } = collectCssFromManifest(a.manifest, key, a.outDir);
        const own = classesPresent(css, item.signature);
        const dep = classesPresent(css, item.depClasses);
        item.aPresent = own.present.length;
        item.aMissing = own.missing;
        item.aDepMissing = dep.missing;
        item.aToken = hasTokenDefinition(css);
        item.aVerdict =
            own.present.length === item.signature.length
                ? 'PASS'
                : own.present.length === 0
                  ? 'FAIL'
                  : 'PARTIAL';
    }

    console.log(c.cyan('\n› Test B — single vendor chunk: bundling every component into one merged chunk…'));
    const bFile = path.join(CONSUMER, 'entries', '__merge_all.jsx');
    const bySub = {};
    for (const item of testList) (bySub[item.subpath] ||= []).push(item.sym);
    let bSrc = `import { createElement } from 'react';\nimport { createRoot } from 'react-dom/client';\n`;
    let idx = 0;
    const keepRefs = [];
    for (const [sub, syms] of Object.entries(bySub)) {
        const alias = syms.map((s) => `${s} as M${idx}_${s}`);
        bSrc += `import { ${alias.join(', ')} } from '${sub}';\n`;
        for (const s of syms) keepRefs.push(`M${idx}_${s}`);
        idx++;
    }
    bSrc += `const keep = [${keepRefs.join(', ')}];\nfor (const C of keep) { try { if (typeof C === 'function') { const el = document.createElement('div'); createRoot(el).render(createElement(C)); } } catch (e) {} }\nglobalThis.__all = keep;\n`;
    fs.writeFileSync(bFile, bSrc, 'utf-8');

    const b = await runConsumerBuild({
        consumerDir: CONSUMER,
        input: { merge_all: bFile },
        outSub: 'out-b',
        single: true,
        viteBuild,
        reactPlugin,
    });
    const bCss = readAllCss(b.outDir);
    for (const item of testList) {
        const r = classesPresent(bCss, item.signature);
        item.bVerdict =
            r.present.length === item.signature.length ? 'PASS' : r.present.length === 0 ? 'FAIL' : 'PARTIAL';
        item.bMissing = r.missing;
    }

    const assets = await runAssetTests();
    const selfCheck = await runSelfCheck();

    report({ entries, components: testList, naSymbols, assets, selfCheck, tokenCss });
}

async function runAssetTests() {
    const results = [];
    const entriesDir = path.join(CONSUMER, 'entries');

    const stylesFile = path.join(entriesDir, '__styles.jsx');
    fs.writeFileSync(stylesFile, `import 'fluxo-ui/styles';\nglobalThis.__s = 1;\n`, 'utf-8');

    const iconNames = parseRuntimeExports(path.join(DIST, 'icons.js')).slice(0, 8);
    const iconFile = path.join(entriesDir, '__icons.jsx');
    writeEntryFile(iconFile, 'fluxo-ui/icons', iconNames);

    const smokeSubpaths = ['fluxo-ui/hooks', 'fluxo-ui/store', 'fluxo-ui/store/middlewares', 'fluxo-ui/utils', 'fluxo-ui/services'];
    const smokeFiles = {};
    for (const sp of smokeSubpaths) {
        const names = parseRuntimeExports(discoverEntries()[sp].file);
        if (!names.length) continue;
        const f = path.join(entriesDir, `__smoke_${safeName(sp)}.jsx`);
        fs.writeFileSync(f, `import * as M from '${sp}';\nglobalThis.__k = Object.keys(M).length;\n`, 'utf-8');
        smokeFiles[sp] = f;
    }

    const input = { styles: stylesFile, icons: iconFile };
    for (const [sp, f] of Object.entries(smokeFiles)) input[`smoke_${safeName(sp)}`] = f;

    let buildOk = true;
    let outDir, manifest;
    try {
        const r = await runConsumerBuild({
            consumerDir: CONSUMER,
            input,
            outSub: 'out-assets',
            single: false,
            viteBuild,
            reactPlugin,
        });
        outDir = r.outDir;
        manifest = r.manifest;
    } catch (e) {
        buildOk = false;
        results.push({ name: 'asset build', verdict: 'FAIL', detail: String(e).split('\n')[0] });
    }

    if (buildOk) {
        const stylesKey = path.relative(CONSUMER, stylesFile).replace(/\\/g, '/');
        const { css } = collectCssFromManifest(manifest, stylesKey, outDir);
        const tokenOk = hasTokenDefinition(css);
        const themeOk = ['theme-blue', 'theme-green', 'theme-purple'].every((t) => css.includes('.' + t));
        const darkOk = css.includes('body.mode-dark') || css.includes('.mode-dark');
        results.push({
            name: 'fluxo-ui/styles → tokens',
            verdict: tokenOk ? 'PASS' : 'FAIL',
            detail: tokenOk ? '--eui-* token definitions present' : 'no --eui-* token definitions',
        });
        results.push({
            name: 'fluxo-ui/styles → themes + dark mode',
            verdict: themeOk && darkOk ? 'PASS' : 'FAIL',
            detail: `themes:${themeOk} darkMode:${darkOk}`,
        });
        results.push({
            name: `fluxo-ui/icons (${iconNames.length} icons resolve & bundle)`,
            verdict: iconNames.length > 0 ? 'PASS' : 'FAIL',
            detail: iconNames.join(', '),
        });
        for (const sp of Object.keys(smokeFiles)) {
            results.push({ name: `${sp} resolves`, verdict: 'PASS', detail: 'imported via package exports' });
        }
    }

    const tokenCss = fs.readFileSync(path.join(DIST, 'styles', 'components.css'), 'utf-8');
    const fontReferenced = /font-family[^;{]*Inter/i.test(tokenCss);
    const fontFiles = collectFontAssets();
    results.push({
        name: 'fonts',
        verdict: fontReferenced ? 'PASS' : 'WARN',
        detail: fontReferenced
            ? `--eui-font-family references 'Inter' with system fallback; binary font assets shipped: ${fontFiles.length}`
            : 'no Inter font-family token found',
    });

    return results;
}

function collectFontAssets() {
    const out = [];
    const walk = (d) => {
        if (!fs.existsSync(d)) return;
        for (const e of fs.readdirSync(d, { withFileTypes: true })) {
            const p = path.join(d, e.name);
            if (e.isDirectory()) walk(p);
            else if (/\.(woff2?|ttf|otf|eot)$/i.test(e.name)) out.push(p);
        }
    };
    walk(DIST);
    return out;
}

async function runSelfCheck() {
    const { universe } = buildCssUniverse();
    const { classOwner } = buildOwnership(universe);
    const barrel = COMPONENT_BARRELS['fluxo-ui'];
    const runtime = parseRuntimeExports(entriesFile('fluxo-ui'));
    const map = buildSymbolGraphMap(barrel, runtime);
    const targetSym = 'Modal';
    const root = map.get(targetSym);
    const sig = signatureForRoot(root, universe, classOwner);

    const distCssDir = path.join(DIST, 'styles', 'components');
    let targetCss = null;
    for (const f of fs.readdirSync(distCssDir)) {
        const content = fs.readFileSync(path.join(distCssDir, f), 'utf-8');
        const hits = sig.signature.filter((cl) => content.includes('.' + cl)).length;
        if (hits === sig.signature.length && hits > 0) {
            targetCss = path.join(distCssDir, f);
            break;
        }
    }
    if (!targetCss) {
        return { ok: false, detail: `could not locate a dedicated CSS file for ${targetSym}; self-check inconclusive` };
    }

    const tmp = path.join(WORK, 'tmpdist');
    rmrf(tmp);
    fs.cpSync(DIST, tmp, { recursive: true });
    const cssBase = path.basename(targetCss);
    const distJsRoot = tmp;
    let importerFound = false;
    const stripImport = (file) => {
        let src = fs.readFileSync(file, 'utf-8');
        const re = new RegExp(`import\\s*['"][^'"]*${cssBase.replace('.', '\\.')}['"];?`, 'g');
        if (re.test(src)) {
            src = src.replace(re, '');
            fs.writeFileSync(file, src, 'utf-8');
            importerFound = true;
        }
    };
    const walkJs = (d) => {
        for (const e of fs.readdirSync(d, { withFileTypes: true })) {
            const p = path.join(d, e.name);
            if (e.isDirectory()) walkJs(p);
            else if (e.name.endsWith('.js')) stripImport(p);
        }
    };
    walkJs(distJsRoot);

    const buildAgainst = (distPath, tag) => {
        const cdir = path.join(WORK, `selfcheck-${tag}`);
        fs.mkdirSync(cdir, { recursive: true });
        writeConsumerPackageJson(cdir);
        linkFluxoUi(cdir, distPath);
        fs.mkdirSync(path.join(cdir, 'entries'), { recursive: true });
        const entryFile = path.join(cdir, 'entries', `${targetSym}.jsx`);
        writeEntryFile(entryFile, 'fluxo-ui', [targetSym]);
        const cssOut = path.join(cdir, 'collected.css');
        const cfgPath = path.join(cdir, 'cfg.json');
        fs.writeFileSync(
            cfgPath,
            JSON.stringify({ consumerDir: cdir, input: { [targetSym]: entryFile }, outSub: 'out', single: false, cssOut }),
            'utf-8'
        );
        execFileSync(process.execPath, [path.join(REPO, 'scripts', 'css-wiring', 'build-worker.mjs'), cfgPath], {
            stdio: 'ignore',
        });
        return classesPresent(fs.readFileSync(cssOut, 'utf-8'), sig.signature).present.length;
    };

    const pristinePresent = buildAgainst(DIST, 'pristine');
    const tamperedPresent = buildAgainst(tmp, 'tampered');
    const pristineOk = pristinePresent === sig.signature.length;
    const tamperedDetectsBreak = tamperedPresent === 0;

    return {
        ok: importerFound && pristineOk && tamperedDetectsBreak,
        importerFound,
        pristineOk,
        tamperedDetectsBreak,
        target: targetSym,
        cssFile: cssBase,
        pristinePresent,
        tamperedPresent,
        total: sig.signature.length,
        detail:
            pristineOk && tamperedDetectsBreak
                ? `Pristine build shows all ${sig.signature.length} ${targetSym} classes; removing ${targetSym}'s own CSS import makes them all vanish (${tamperedPresent}/${sig.signature.length}). The suite detects a deliberately broken wiring.`
                : `pristine=${pristinePresent}/${sig.signature.length} tampered=${tamperedPresent}/${sig.signature.length} importerFound=${importerFound} — suite did NOT cleanly distinguish good vs broken!`,
    };
}

function entriesFile(subpath) {
    return discoverEntries()[subpath].file;
}

function report({ components, naSymbols, assets, selfCheck }) {
    console.log('\n' + c.bold('═'.repeat(78)));
    console.log(c.bold('  CSS & ASSET WIRING REPORT'));
    console.log(c.bold('═'.repeat(78)));

    const bySub = {};
    for (const item of components) (bySub[item.subpath] ||= []).push(item);

    const fmt = (v) =>
        v === 'PASS' ? c.green('PASS') : v === 'FAIL' ? c.red('FAIL') : v === 'PARTIAL' ? c.yellow('PART') : c.gray(v);

    for (const [sub, items] of Object.entries(bySub)) {
        console.log('\n' + c.cyan(c.bold(`▌ ${sub}`)) + c.gray(`  (${items.length} components)`));
        items.sort((a, b) => a.sym.localeCompare(b.sym));
        for (const it of items) {
            const tok = it.aToken ? '' : c.yellow(' no-token');
            const note =
                it.aVerdict === 'PASS'
                    ? ''
                    : c.gray('  missing: ' + it.aMissing.slice(0, 4).join(', ') + (it.aMissing.length > 4 ? '…' : ''));
            console.log(
                `  ${it.sym.padEnd(26)} A:${fmt(it.aVerdict)}  B:${fmt(it.bVerdict)}  ` +
                    c.gray(`own=${String(it.signature.length).padStart(3)}`) +
                    tok +
                    note
            );
        }
    }

    console.log('\n' + c.cyan(c.bold('▌ Assets & secondary entries')));
    for (const a of assets) console.log(`  ${a.name.padEnd(46)} ${fmt(a.verdict)}  ${c.gray(a.detail)}`);

    console.log('\n' + c.cyan(c.bold('▌ N/A — no own CSS to assert (non-visual / composed / shared-styled)')));
    const naByReason = {};
    for (const n of naSymbols) ((naByReason[n.reason] ||= new Set()).add(n.sym));
    for (const [reason, syms] of Object.entries(naByReason)) {
        console.log(c.gray(`  ${reason} (${syms.size}): `) + [...syms].sort().join(', '));
    }

    console.log('\n' + c.cyan(c.bold('▌ Self-check (sensitivity proof)')));
    console.log(
        `  ${selfCheck.ok ? c.green('SENSITIVE') : c.red('NOT SENSITIVE')}  ${c.gray(selfCheck.detail)}`
    );

    const aFails = components.filter((x) => x.aVerdict === 'FAIL');
    const aParts = components.filter((x) => x.aVerdict === 'PARTIAL');
    const bFails = components.filter((x) => x.bVerdict === 'FAIL');
    const assetFails = assets.filter((a) => a.verdict === 'FAIL');

    console.log('\n' + c.bold('─'.repeat(78)));
    console.log(c.bold('  SUMMARY'));
    console.log(
        `  Components tested: ${components.length}   ` +
            `${c.green('PASS ' + components.filter((x) => x.aVerdict === 'PASS').length)}   ` +
            `${c.red('FAIL ' + aFails.length)}   ` +
            `${c.yellow('PARTIAL ' + aParts.length)}   ` +
            `${c.gray('N/A ' + naSymbols.length)}`
    );
    console.log(`  Single-vendor-chunk (Test B) failures: ${bFails.length}`);
    console.log(`  Asset/entry failures: ${assetFails.length}`);
    console.log(`  Self-check sensitive: ${selfCheck.ok ? c.green('yes') : c.red('no')}`);

    if (aFails.length) {
        console.log('\n' + c.red(c.bold('  REAL FAILURES (component imported alone ships unstyled):')));
        for (const f of aFails) console.log(c.red(`   ✗ ${f.sym} [${f.subpath}] — missing ${f.aMissing.length}/${f.signature.length} own classes`));
    }
    console.log(c.bold('─'.repeat(78)) + '\n');

    const failed = aFails.length > 0 || aParts.length > 0 || bFails.length > 0 || assetFails.length > 0 || !selfCheck.ok;
    process.exit(failed ? 1 : 0);
}

main().catch((e) => {
    console.error(c.red('css-wiring suite crashed:'));
    console.error(e);
    process.exit(2);
});
