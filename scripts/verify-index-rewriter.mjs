#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

let pass = 0;
let fail = 0;
const failures = [];

function check(label, condition, detail) {
  if (condition) {
    pass++;
    console.log(`  PASS  ${label}`);
  } else {
    fail++;
    const msg = `${label}${detail ? ` — ${detail}` : ''}`;
    failures.push(msg);
    console.log(`  FAIL  ${msg}`);
  }
}

async function ensureBuilt() {
  const dist = path.join(ROOT, 'cli', 'internals.js');
  try {
    await fs.access(dist);
  } catch {
    throw new Error('cli/internals.js missing. Run `npm run build-cli` first.');
  }
}

async function loadCli() {
  const file = path.join(ROOT, 'cli', 'internals.js');
  return import(`file://${file.split(path.sep).join('/')}`);
}

async function loadDistManifest() {
  const dataFile = path.join(ROOT, 'cli', 'manifest-data.json');
  try {
    await fs.access(dataFile);
    return JSON.parse(await fs.readFile(dataFile, 'utf-8'));
  } catch {
    const srcData = path.join(SRC, 'cli', 'manifest-data.json');
    return JSON.parse(await fs.readFile(srcData, 'utf-8'));
  }
}

async function makeSandbox(prefix) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), `fluxo-index-${prefix}-`));
  await fs.writeFile(
    path.join(dir, 'package.json'),
    JSON.stringify({ name: 'sandbox', version: '0.0.0' }, null, 2)
  );
  return dir;
}

async function applyComponents({ cli, manifest, sandbox, ids, options = {} }) {
  const localProvider = new cli.LocalSourceProvider({ sourceRoot: SRC });
  const installPath = './src/components/fluxo-ui';
  const installRootAbs = path.resolve(sandbox, installPath);
  await fs.mkdir(installRootAbs, { recursive: true });
  let baseConfig;
  let cfgPath;
  const existing = await cli.readConfig(sandbox);
  if (existing) {
    baseConfig = existing.config;
    cfgPath = existing.filePath;
  } else {
    baseConfig = cli.createDefaultConfig(installPath);
    cfgPath = await cli.writeConfig(sandbox, baseConfig);
  }
  const result = await cli.runInstall({
    componentIds: ids,
    installRootAbs,
    config: baseConfig,
    configFilePath: cfgPath,
    projectRoot: sandbox,
    sourceProvider: localProvider,
    manifest,
    forceMode: options.forceMode === true,
    updateIndex: options.updateIndex,
    exportHooksFromIndex: options.exportHooksFromIndex,
    exportUtilsFromIndex: options.exportUtilsFromIndex,
  });
  return { result, installRootAbs };
}

async function main() {
  await ensureBuilt();
  const cli = await loadCli();
  const manifest = await loadDistManifest();
  cli.setManifestForTesting(manifest);

  console.log('\n[1] Public API surface');
  check('parseIndexFile exported', typeof cli.parseIndexFile === 'function');
  check('mergeIndexExports exported', typeof cli.mergeIndexExports === 'function');
  check('planIndexExports exported', typeof cli.planIndexExports === 'function');
  check('applyIndexExports exported', typeof cli.applyIndexExports === 'function');

  console.log('\n[2] parseIndexFile recognizes the common ES export forms');
  {
    const sample = `
export * from './a';
export type * from './b';
export * as Foo from './c';
export { A, B as C } from './d';
export type { D } from './e';
export { default as Heading } from './f';
import './g.css';
import './h'; // not a style import — should not register
// export * from './commented-out';
/* export * from './also-commented'; */
`;
    const parsed = cli.parseIndexFile(sample);
    check('Found export * for ./a', parsed.exportsBySpecifier.has('./a'));
    check('Found export type * for ./b', parsed.exportsBySpecifier.has('./b'));
    check('Found export * as Foo for ./c', parsed.exportsBySpecifier.has('./c'));
    check('Found named export for ./d', parsed.exportsBySpecifier.has('./d'));
    check('Found type-only named export for ./e', parsed.exportsBySpecifier.has('./e'));
    check('Found default-as export for ./f', parsed.exportsBySpecifier.has('./f'));
    check('Found side-effect style import for ./g.css', parsed.exportsBySpecifier.has('./g.css'));
    check('Did NOT register non-style ./h side-effect import', !parsed.exportsBySpecifier.has('./h'));
    check('Did NOT register commented-out ./commented-out', !parsed.exportsBySpecifier.has('./commented-out'));
    check('Did NOT register block-commented ./also-commented', !parsed.exportsBySpecifier.has('./also-commented'));

    const dEntries = parsed.exportsBySpecifier.get('./d') ?? [];
    check('Named export classified as export-named', dEntries[0]?.kind === 'export-named');
    const fEntries = parsed.exportsBySpecifier.get('./f') ?? [];
    check('Default-as classified as export-default-as', fEntries[0]?.kind === 'export-default-as');
    const cEntries = parsed.exportsBySpecifier.get('./c') ?? [];
    check('Star-as classified as export-star-as', cEntries[0]?.kind === 'export-star-as');
    const aEntries = parsed.exportsBySpecifier.get('./a') ?? [];
    check('Plain star classified as export-star', aEntries[0]?.kind === 'export-star');
    const bEntries = parsed.exportsBySpecifier.get('./b') ?? [];
    check('Type star classified with isType=true', bEntries[0]?.isType === true);
  }

  console.log('\n[3] mergeIndexExports — append into empty file');
  {
    const parsed = cli.parseIndexFile('');
    const entries = [
      { specifier: './button/Button', role: 'component', unitId: 'button', comment: 'Button' },
      { specifier: './hooks/useDebounce', role: 'hook', unitId: 'useDebounce', comment: 'useDebounce' },
    ];
    const merged = cli.mergeIndexExports(parsed, entries);
    check('Both entries marked as added', merged.added.length === 2);
    check('No alreadyPresent', merged.alreadyPresent.length === 0);
    check("Content includes export * from './button/Button';", merged.content.includes("export * from './button/Button';"));
    check("Content includes export * from './hooks/useDebounce';", merged.content.includes("export * from './hooks/useDebounce';"));
    check('Content ends with newline', merged.content.endsWith('\n'));
  }

  console.log('\n[4] mergeIndexExports — preserves existing content + skips duplicates');
  {
    const before = `export { Button } from './button/Button';\nexport * from './confirm-popover';\n`;
    const parsed = cli.parseIndexFile(before);
    const entries = [
      { specifier: './button/Button', role: 'component', unitId: 'button' },
      { specifier: './accordion', role: 'component', unitId: 'accordion' },
    ];
    const merged = cli.mergeIndexExports(parsed, entries);
    check('Already-present specifier ./button/Button skipped', merged.alreadyPresent.some((e) => e.specifier === './button/Button'));
    check('New ./accordion entry added', merged.added.some((e) => e.specifier === './accordion'));
    check('Existing export { Button } preserved', merged.content.includes("export { Button } from './button/Button';"));
    check('Appended export for ./accordion', merged.content.includes("export * from './accordion';"));
    check('No duplicate export * from ./button/Button', (merged.content.match(/from\s*['"]\.\/button\/Button['"]/g) ?? []).length === 1);
  }

  console.log('\n[5] applyIndexExports end-to-end with Button install');
  {
    const sandbox = await makeSandbox('button-fresh');
    try {
      const { result, installRootAbs } = await applyComponents({
        cli,
        manifest,
        sandbox,
        ids: ['button'],
      });
      check('result.indexResult populated', !!result.indexResult);
      check('Index file path under installRoot', result.indexResult.indexFilePath.startsWith(installRootAbs));
      check('Index file created on first install', result.indexResult.created === true);
      const indexContent = await fs.readFile(result.indexResult.indexFilePath, 'utf-8');
      check('Index includes button export', /export\s+\*\s+from\s+['"]\.\/button\/Button['"]\s*;?/.test(indexContent));
      const closure = result.plan.closure.components;
      check('Index includes confirm-popover export (transitive)', /export\s+\*\s+from\s+['"]\.\/confirm-popover['"]\s*;?/.test(indexContent), `closure=${closure.join(',')}`);
      check('Index includes tooltip entry-file export', /export\s+\*\s+from\s+['"]\.\/tooltip\/tooltip-api['"]\s*;?/.test(indexContent));
      check('Index does NOT export private link helper', !/export\s+\*\s+from\s+['"]\.\/link/.test(indexContent));
      check('Index does NOT export private icon helper', !/export\s+\*\s+from\s+['"]\.\/icon[\b/'"]/.test(indexContent));
      check('result.indexResult.added covers button', result.indexResult.added.some((e) => e.unitId === 'button'));
    } finally {
      await fs.rm(sandbox, { recursive: true, force: true });
    }
  }

  console.log('\n[6] Idempotent — re-running install does not duplicate exports');
  {
    const sandbox = await makeSandbox('idem');
    try {
      await applyComponents({ cli, manifest, sandbox, ids: ['button'] });
      const { result } = await applyComponents({ cli, manifest, sandbox, ids: ['button'] });
      check('Second pass added 0 entries', result.indexResult.added.length === 0);
      check('Second pass alreadyPresent > 0', result.indexResult.alreadyPresent.length > 0);
      const content = await fs.readFile(result.indexResult.indexFilePath, 'utf-8');
      const buttonMatches = content.match(/from\s*['"]\.\/button\/Button['"]/g) ?? [];
      check('Only one export line for ./button/Button', buttonMatches.length === 1);
      const confirmMatches = content.match(/from\s*['"]\.\/confirm-popover['"]/g) ?? [];
      check('Only one export line for ./confirm-popover', confirmMatches.length === 1);
    } finally {
      await fs.rm(sandbox, { recursive: true, force: true });
    }
  }

  console.log('\n[7] Hook-only / util-only export gating');
  {
    const sandbox = await makeSandbox('gates');
    try {
      const { result } = await applyComponents({
        cli,
        manifest,
        sandbox,
        ids: ['button'],
        options: { exportHooksFromIndex: false, exportUtilsFromIndex: false },
      });
      const indexContent = await fs.readFile(result.indexResult.indexFilePath, 'utf-8');
      const hookExports = (indexContent.match(/from\s*['"]\.\/hooks\//g) ?? []).length;
      check('No hook exports when exportHooksFromIndex=false', hookExports === 0);
      const utilExports = (indexContent.match(/from\s*['"]\.\/utils\//g) ?? []).length;
      check('No util exports when exportUtilsFromIndex=false', utilExports === 0);
      check('Component exports still present', /from\s+['"]\.\/button\/Button['"]/.test(indexContent));
    } finally {
      await fs.rm(sandbox, { recursive: true, force: true });
    }
  }

  console.log('\n[8] Existing user content preserved when components added');
  {
    const sandbox = await makeSandbox('preserve');
    try {
      const installPath = './src/components/fluxo-ui';
      const installRootAbs = path.resolve(sandbox, installPath);
      await fs.mkdir(installRootAbs, { recursive: true });
      const userIndex = `// User-authored barrel\nexport * from './my-local-component';\nexport { custom } from './custom';\n`;
      const indexFilePath = path.join(installRootAbs, 'index.ts');
      await fs.writeFile(indexFilePath, userIndex, 'utf-8');
      const { result } = await applyComponents({ cli, manifest, sandbox, ids: ['button'] });
      check('Index file not re-created — found existing', result.indexResult.created === false);
      const after = await fs.readFile(indexFilePath, 'utf-8');
      check('User comment preserved', after.includes('// User-authored barrel'));
      check('User-local export preserved', after.includes("export * from './my-local-component';"));
      check('User custom export preserved', after.includes("export { custom } from './custom';"));
      check('Button export appended', after.includes("export * from './button/Button';"));
    } finally {
      await fs.rm(sandbox, { recursive: true, force: true });
    }
  }

  console.log('\n[9] updateIndex=false disables index writing entirely');
  {
    const sandbox = await makeSandbox('disabled');
    try {
      const { result, installRootAbs } = await applyComponents({
        cli,
        manifest,
        sandbox,
        ids: ['button'],
        options: { updateIndex: false },
      });
      check('result.indexResult is null when updateIndex=false', result.indexResult === null);
      const candidate = path.join(installRootAbs, 'index.ts');
      let exists = false;
      try {
        await fs.access(candidate);
        exists = true;
      } catch {
        exists = false;
      }
      check('No index.ts created when disabled', exists === false);
    } finally {
      await fs.rm(sandbox, { recursive: true, force: true });
    }
  }

  console.log('\n[10] Existing .tsx index file is preferred over .ts');
  {
    const sandbox = await makeSandbox('tsx-pref');
    try {
      const installPath = './src/components/fluxo-ui';
      const installRootAbs = path.resolve(sandbox, installPath);
      await fs.mkdir(installRootAbs, { recursive: true });
      const tsxPath = path.join(installRootAbs, 'index.tsx');
      await fs.writeFile(tsxPath, `// pre-existing tsx index\nexport const sentinel = 1;\n`, 'utf-8');
      const { result } = await applyComponents({ cli, manifest, sandbox, ids: ['button'] });
      check('Rewriter used existing index.tsx', result.indexResult.indexFilePath === tsxPath);
      check('Did not flag as created', result.indexResult.created === false);
      const tsExists = await fs.access(path.join(installRootAbs, 'index.ts')).then(() => true).catch(() => false);
      check('No stray index.ts created alongside index.tsx', tsExists === false);
      const after = await fs.readFile(tsxPath, 'utf-8');
      check('Pre-existing sentinel preserved in tsx index', after.includes('export const sentinel = 1;'));
      check('Component export added to tsx index', /export\s+\*\s+from\s+['"]\.\/button\/Button['"]\s*;?/.test(after));
    } finally {
      await fs.rm(sandbox, { recursive: true, force: true });
    }
  }

  console.log('\n[11] Hook + util exports use proper relative specifiers');
  {
    const sandbox = await makeSandbox('hook-util');
    try {
      const { result } = await applyComponents({
        cli,
        manifest,
        sandbox,
        ids: ['button'],
      });
      const content = await fs.readFile(result.indexResult.indexFilePath, 'utf-8');
      const hookEntries = result.indexResult.added.filter((e) => e.role === 'hook');
      for (const entry of hookEntries) {
        check(`Hook entry specifier matches ./hooks/<name> for ${entry.unitId}`, /^\.\/hooks\//.test(entry.specifier));
        check(`Hook export written for ${entry.unitId}`, content.includes(`from '${entry.specifier}';`));
      }
    } finally {
      await fs.rm(sandbox, { recursive: true, force: true });
    }
  }

  console.log('\n[12] Adding a second component appends new entries without rewriting old');
  {
    const sandbox = await makeSandbox('multi-add');
    try {
      await applyComponents({ cli, manifest, sandbox, ids: ['button'] });
      const indexFilePath = path.join(
        path.resolve(sandbox, './src/components/fluxo-ui'),
        'index.ts'
      );
      const beforeSecond = await fs.readFile(indexFilePath, 'utf-8');
      const { result } = await applyComponents({ cli, manifest, sandbox, ids: ['accordion'] });
      const afterSecond = await fs.readFile(indexFilePath, 'utf-8');
      check('Accordion export written', /export\s+\*\s+from\s+['"]\.\/accordion['"]\s*;?/.test(afterSecond));
      check('Original button export retained', /export\s+\*\s+from\s+['"]\.\/button\/Button['"]\s*;?/.test(afterSecond));
      check('After-content is superset of before-content', afterSecond.startsWith(beforeSecond));
      check('result.indexResult.added contains accordion entry', result.indexResult.added.some((e) => e.unitId === 'accordion'));
    } finally {
      await fs.rm(sandbox, { recursive: true, force: true });
    }
  }

  console.log(`\nResult: ${pass} passed, ${fail} failed`);
  if (fail > 0) {
    console.log('\nFailures:');
    for (const f of failures) console.log(`  - ${f}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Verification crashed:', err);
  process.exit(1);
});
