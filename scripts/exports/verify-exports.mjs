import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/*
 * Package-exports integrity suite.
 *
 * Guarantee under test: every path the published package advertises actually
 * exists in dist/, so a consumer never hits a "module not found" / "ENOENT" the
 * moment they import a subpath, a `types` file, a `require` build, ./styles, or
 * the bin. Also guards the CLAUDE.md sync invariant between the root
 * package.json `exports` and the source aliases in src/plugins/vite/index.ts.
 *
 * Three checks, each with explicit pass criteria and a clear failure message:
 *
 *   CHECK 1  dist exports resolve — every target of every export condition
 *            (types/import/require + plain string targets like ./styles and
 *            ./mcp-index.json) in the SHIPPED dist/package.json exists on disk,
 *            plus main/module/types/bin.
 *   CHECK 2  root exports resolve — every target in the root package.json
 *            exports exists (it points at ./dist/... and is what gets rewritten
 *            into the shipped manifest).
 *   CHECK 3  exports ↔ vite-plugin alias sync — every runtime/type subpath in
 *            the root exports has a matching alias in src/plugins/vite/index.ts
 *            (so EUI_USE_SOURCE consumers can resolve it). Non-code targets
 *            (.css/.json) and ./vite-plugin (the bootstrap plugin itself) are
 *            exempt.
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, '..', '..');
const DIST = path.join(REPO, 'dist');

const args = new Set(process.argv.slice(2));
const NO_BUILD = args.has('--no-build') || process.env.EXPORTS_TEST_NO_BUILD === '1';

// Subpaths that intentionally have no source alias in the vite plugin.
//  - ./vite-plugin is the plugin a consumer adds to TURN ON source mode; it must
//    load from the installed package, so aliasing it to source is circular.
const ALIAS_EXEMPT_SUBPATHS = new Set(['./vite-plugin']);

const c = {
    green: (s) => `\x1b[32m${s}\x1b[0m`,
    red: (s) => `\x1b[31m${s}\x1b[0m`,
    yellow: (s) => `\x1b[33m${s}\x1b[0m`,
    gray: (s) => `\x1b[90m${s}\x1b[0m`,
    bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

function runBuildLib() {
    console.log(c.gray('› Running `npm run build-lib` (the dist under test)…'));
    execSync('npm run build-lib', { cwd: REPO, stdio: 'inherit' });
}

// Collect [subpath, condition, target] tuples from an exports map.
function exportTargets(exportsObj) {
    const out = [];
    for (const [subpath, value] of Object.entries(exportsObj || {})) {
        if (typeof value === 'string') {
            out.push({ subpath, condition: 'default', target: value });
        } else if (value && typeof value === 'object') {
            for (const [condition, target] of Object.entries(value)) {
                if (typeof target === 'string') out.push({ subpath, condition, target });
            }
        }
    }
    return out;
}

function checkManifestTargets(pkgPath, baseDir, label) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    const missing = [];
    const checkOne = (target, where) => {
        if (!target || typeof target !== 'string') return;
        const abs = path.resolve(baseDir, target.replace(/^\.\//, ''));
        if (!fs.existsSync(abs)) missing.push({ where, target, abs });
    };

    for (const t of exportTargets(pkg.exports)) checkOne(t.target, `exports["${t.subpath}"].${t.condition}`);
    checkOne(pkg.main, 'main');
    checkOne(pkg.module, 'module');
    checkOne(pkg.types, 'types');
    if (pkg.bin && typeof pkg.bin === 'object') for (const [k, v] of Object.entries(pkg.bin)) checkOne(v, `bin["${k}"]`);
    else if (typeof pkg.bin === 'string') checkOne(pkg.bin, 'bin');

    const total =
        exportTargets(pkg.exports).length +
        ['main', 'module', 'types'].filter((k) => pkg[k]).length +
        (pkg.bin ? Object.keys(typeof pkg.bin === 'object' ? pkg.bin : { bin: 1 }).length : 0);

    return { label, missing, total };
}

function checkAliasSync() {
    const rootPkg = JSON.parse(fs.readFileSync(path.join(REPO, 'package.json'), 'utf-8'));
    const pluginSrc = fs.readFileSync(path.join(REPO, 'src', 'plugins', 'vite', 'index.ts'), 'utf-8');
    const aliasKeys = new Set([...pluginSrc.matchAll(/aliases\[['"]([^'"]+)['"]\]/g)].map((m) => m[1]));

    const missingAliases = [];
    for (const [subpath, value] of Object.entries(rootPkg.exports || {})) {
        // Only runtime/type subpaths need an alias. Plain-string (.css/.json) targets don't.
        const isCodeSubpath = value && typeof value === 'object' && (value.import || value.types);
        if (!isCodeSubpath) continue;
        if (ALIAS_EXEMPT_SUBPATHS.has(subpath)) continue;
        const aliasKey = subpath === '.' ? 'fluxo-ui' : `fluxo-ui/${subpath.replace(/^\.\//, '')}`;
        if (!aliasKeys.has(aliasKey)) missingAliases.push({ subpath, aliasKey });
    }
    return { missingAliases, aliasCount: aliasKeys.size };
}

function main() {
    if (!NO_BUILD) runBuildLib();
    else console.log(c.yellow('› --no-build: testing the existing dist/ as-is.'));

    if (!fs.existsSync(path.join(DIST, 'package.json'))) {
        console.error(c.red('No dist build found. Run `npm run build-lib` first or omit --no-build.'));
        process.exit(2);
    }

    const distCheck = checkManifestTargets(path.join(DIST, 'package.json'), DIST, 'dist/package.json (shipped)');
    const rootCheck = checkManifestTargets(path.join(REPO, 'package.json'), REPO, 'package.json (root)');
    const alias = checkAliasSync();

    console.log('\n' + c.bold('═'.repeat(78)));
    console.log(c.bold('  PACKAGE EXPORTS INTEGRITY REPORT'));
    console.log(c.bold('═'.repeat(78)));

    let failed = false;

    for (const [n, chk] of [
        ['CHECK 1', distCheck],
        ['CHECK 2', rootCheck],
    ]) {
        console.log(
            '\n' +
                c.bold(`${n} — ${chk.label}: `) +
                c.gray('every advertised target (exports conditions + main/module/types/bin) must exist on disk.')
        );
        if (chk.missing.length === 0) {
            console.log(c.green(`  ✓ PASS — all ${chk.total} advertised target(s) exist.`));
        } else {
            failed = true;
            console.log(c.red(`  ✗ FAIL — ${chk.missing.length} advertised target(s) DO NOT exist:`));
            for (const m of chk.missing) console.log(c.red(`    • ${m.where} → "${m.target}"`) + c.gray(`  (missing: ${m.abs})`));
            console.log(c.gray('    Fix: a consumer importing this would hit ENOENT. Remove the export or build the missing file.'));
        }
    }

    console.log(
        '\n' +
            c.bold('CHECK 3 — exports ↔ vite-plugin alias sync: ') +
            c.gray('every code subpath in root exports needs a matching alias in src/plugins/vite/index.ts.')
    );
    if (alias.missingAliases.length === 0) {
        console.log(c.green(`  ✓ PASS — every code subpath has a source alias (${alias.aliasCount} aliases defined).`));
    } else {
        failed = true;
        console.log(c.red(`  ✗ FAIL — ${alias.missingAliases.length} code subpath(s) have no source alias:`));
        for (const m of alias.missingAliases)
            console.log(c.red(`    • exports["${m.subpath}"]`) + c.gray(` needs aliases['${m.aliasKey}'] in src/plugins/vite/index.ts`));
        console.log(
            c.gray(
                '    Fix: EUI_USE_SOURCE consumers cannot resolve this subpath to source without it ' +
                    '(or add it to ALIAS_EXEMPT_SUBPATHS if it is a bootstrap-only entry).'
            )
        );
    }

    console.log('\n' + c.bold('─'.repeat(78)));
    console.log(c.bold('  SUMMARY'));
    const line = (label, ok, extra) =>
        console.log(`  ${ok ? c.green('PASS') : c.red('FAIL')}  ${label}${extra ? c.gray('  ' + extra) : ''}`);
    line('CHECK 1 dist exports resolve', distCheck.missing.length === 0, `${distCheck.total} targets`);
    line('CHECK 2 root exports resolve', rootCheck.missing.length === 0, `${rootCheck.total} targets`);
    line('CHECK 3 exports ↔ alias sync', alias.missingAliases.length === 0, `${alias.aliasCount} aliases`);
    console.log(c.bold('─'.repeat(78)) + '\n');

    process.exit(failed ? 1 : 0);
}

main();
