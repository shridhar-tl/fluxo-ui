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

async function loadCliInternals() {
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
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), `fluxo-fileops-${prefix}-`));
  await fs.writeFile(path.join(dir, 'package.json'), JSON.stringify({ name: 'sandbox', version: '0.0.0' }, null, 2));
  return dir;
}

async function applyButton({ cli, manifest, sandbox, options = {} }) {
  const { plannerMod, installerMod, configMod, sourceProviderMod } = cli;
  const localProvider = new sourceProviderMod.LocalSourceProvider({ sourceRoot: SRC });
  const installPath = './src/components/fluxo-ui';
  const installRootAbs = path.resolve(sandbox, installPath);
  await fs.mkdir(installRootAbs, { recursive: true });
  let baseConfig;
  let cfgPath;
  const existing = await configMod.readConfig(sandbox);
  if (existing) {
    baseConfig = existing.config;
    cfgPath = existing.filePath;
  } else {
    baseConfig = configMod.createDefaultConfig(installPath);
    cfgPath = await configMod.writeConfig(sandbox, baseConfig);
  }

  const plan = await plannerMod.buildDependencyPlan({
    componentIds: ['button'],
    installRoot: installRootAbs,
    sourceProvider: localProvider,
    manifest,
  });
  const apply = await installerMod.applyDependencyPlan({
    plan,
    installRootAbs,
    config: baseConfig,
    version: 'local-test',
    forceMode: options.forceMode === true,
    resolveConflict: options.resolveConflict,
  });
  await configMod.writeConfig(sandbox, apply.config, cfgPath);
  return { apply, installRootAbs, plan };
}

async function main() {
  await ensureBuilt();
  const cli = await loadCliInternals();
  const manifest = await loadDistManifest();
  cli.setManifestForTesting(manifest);
  const cliBundle = {
    plannerMod: cli,
    installerMod: cli,
    configMod: cli,
    sourceProviderMod: cli,
    checksumMod: cli,
  };

  console.log('\n[1] Type surface exported');
  check('FileConflictKind values include new/unchanged/updated/locally-modified/foreign', true);
  check('applyDependencyPlan exports', typeof cli.applyDependencyPlan === 'function');
  check('computeFileChecksum exported', typeof cli.computeFileChecksum === 'function');

  console.log('\n[2] Fresh install — every file is new and is written');
  {
    const sandbox = await makeSandbox('fresh');
    try {
      const { apply } = await applyButton({ cli: cliBundle, manifest, sandbox });
      check('Outcomes provided per planned file', Array.isArray(apply.outcomes) && apply.outcomes.length > 0, `outcomes=${apply.outcomes?.length}`);
      const allNew = apply.outcomes.every((o) => o.kind === 'new');
      check('All outcomes classified as "new"', allNew);
      const allWrote = apply.outcomes.every((o) => o.decision === 'wrote');
      check('All outcomes decision="wrote"', allWrote);
      check('apply.written matches outcomes wrote count', apply.written.length === apply.outcomes.filter((o) => o.decision === 'wrote').length);
      check('apply.unchanged is empty on fresh install', apply.unchanged.length === 0);
      check('apply.skipped is empty on fresh install', apply.skipped.length === 0);
      check('apply.conflicts is empty on fresh install', apply.conflicts.length === 0);
    } finally {
      await fs.rm(sandbox, { recursive: true, force: true });
    }
  }

  console.log('\n[3] Idempotent re-install — files classified as unchanged, no rewrites');
  {
    const sandbox = await makeSandbox('idem');
    try {
      await applyButton({ cli: cliBundle, manifest, sandbox });
      const buttonPath = path.join(sandbox, 'src/components/fluxo-ui/button/Button.tsx');
      const statBefore = await fs.stat(buttonPath);
      const mtimeBefore = statBefore.mtimeMs;
      await new Promise((r) => setTimeout(r, 25));
      const { apply } = await applyButton({ cli: cliBundle, manifest, sandbox });
      const allUnchanged = apply.outcomes.every((o) => o.kind === 'unchanged' && o.decision === 'unchanged');
      check('All outcomes classified as "unchanged"', allUnchanged);
      check('apply.written empty on identical reinstall', apply.written.length === 0);
      check('apply.unchanged populated on identical reinstall', apply.unchanged.length > 0, `unchanged=${apply.unchanged.length}`);
      const statAfter = await fs.stat(buttonPath);
      check('Button.tsx mtime unchanged after no-op apply', statAfter.mtimeMs === mtimeBefore);
    } finally {
      await fs.rm(sandbox, { recursive: true, force: true });
    }
  }

  console.log('\n[4] Locally modified file — preserved by default');
  {
    const sandbox = await makeSandbox('drift');
    try {
      const first = await applyButton({ cli: cliBundle, manifest, sandbox });
      const buttonPath = path.join(first.installRootAbs, 'button/Button.tsx');
      const original = await fs.readFile(buttonPath, 'utf-8');
      await fs.writeFile(buttonPath, '// LOCAL EDIT\n' + original, 'utf-8');
      const { apply } = await applyButton({ cli: cliBundle, manifest, sandbox });
      const buttonOutcome = apply.outcomes.find((o) => o.targetRelative === 'button/Button.tsx');
      check('Modified Button.tsx classified as "locally-modified"', buttonOutcome?.kind === 'locally-modified', JSON.stringify(buttonOutcome));
      check('Modified Button.tsx decision is "skipped" without --force', buttonOutcome?.decision === 'skipped');
      const onDisk = await fs.readFile(buttonPath, 'utf-8');
      check('Modified content preserved on disk', onDisk.startsWith('// LOCAL EDIT'));
      check('apply.conflicts surfaces the locally-modified file', apply.conflicts.some((c) => c.targetRelative === 'button/Button.tsx'));
    } finally {
      await fs.rm(sandbox, { recursive: true, force: true });
    }
  }

  console.log('\n[5] Locally modified file — overwritten when forceMode=true');
  {
    const sandbox = await makeSandbox('force');
    try {
      const first = await applyButton({ cli: cliBundle, manifest, sandbox });
      const buttonPath = path.join(first.installRootAbs, 'button/Button.tsx');
      const original = await fs.readFile(buttonPath, 'utf-8');
      await fs.writeFile(buttonPath, '// LOCAL EDIT\n' + original, 'utf-8');
      const { apply } = await applyButton({ cli: cliBundle, manifest, sandbox, options: { forceMode: true } });
      const outcome = apply.outcomes.find((o) => o.targetRelative === 'button/Button.tsx');
      check('Force mode classifies as "locally-modified"', outcome?.kind === 'locally-modified');
      check('Force mode decision is "wrote"', outcome?.decision === 'wrote');
      const onDisk = await fs.readFile(buttonPath, 'utf-8');
      check('Force mode actually overwrote local edit', !onDisk.startsWith('// LOCAL EDIT'));
    } finally {
      await fs.rm(sandbox, { recursive: true, force: true });
    }
  }

  console.log('\n[6] Resolver callback overrides default — overwrite');
  {
    const sandbox = await makeSandbox('resolver-overwrite');
    try {
      const first = await applyButton({ cli: cliBundle, manifest, sandbox });
      const buttonPath = path.join(first.installRootAbs, 'button/Button.tsx');
      const original = await fs.readFile(buttonPath, 'utf-8');
      await fs.writeFile(buttonPath, '// LOCAL EDIT\n' + original, 'utf-8');
      const calls = [];
      const resolver = (ctx) => {
        calls.push({ kind: ctx.kind, target: ctx.targetRelative });
        return 'overwrite';
      };
      const { apply } = await applyButton({ cli: cliBundle, manifest, sandbox, options: { resolveConflict: resolver } });
      check('Resolver invoked with locally-modified kind', calls.some((c) => c.kind === 'locally-modified' && c.target === 'button/Button.tsx'));
      const outcome = apply.outcomes.find((o) => o.targetRelative === 'button/Button.tsx');
      check('Resolver overwrite decision honored', outcome?.decision === 'wrote');
      const onDisk = await fs.readFile(buttonPath, 'utf-8');
      check('Resolver overwrite removed local edit', !onDisk.startsWith('// LOCAL EDIT'));
    } finally {
      await fs.rm(sandbox, { recursive: true, force: true });
    }
  }

  console.log('\n[7] Resolver callback — skip preserves local edit');
  {
    const sandbox = await makeSandbox('resolver-skip');
    try {
      const first = await applyButton({ cli: cliBundle, manifest, sandbox });
      const buttonPath = path.join(first.installRootAbs, 'button/Button.tsx');
      const original = await fs.readFile(buttonPath, 'utf-8');
      await fs.writeFile(buttonPath, '// LOCAL EDIT\n' + original, 'utf-8');
      const resolver = () => 'skip';
      const { apply } = await applyButton({ cli: cliBundle, manifest, sandbox, options: { resolveConflict: resolver, forceMode: true } });
      const outcome = apply.outcomes.find((o) => o.targetRelative === 'button/Button.tsx');
      check('Skip resolver wins over forceMode', outcome?.decision === 'skipped');
      const onDisk = await fs.readFile(buttonPath, 'utf-8');
      check('Skip resolver preserved local edit', onDisk.startsWith('// LOCAL EDIT'));
    } finally {
      await fs.rm(sandbox, { recursive: true, force: true });
    }
  }

  console.log('\n[8] Foreign file — present on disk but not in config');
  {
    const sandbox = await makeSandbox('foreign');
    try {
      const installPath = './src/components/fluxo-ui';
      const installRootAbs = path.resolve(sandbox, installPath);
      await fs.mkdir(path.join(installRootAbs, 'button'), { recursive: true });
      await fs.writeFile(path.join(installRootAbs, 'button/Button.tsx'), 'export default function Button(){ return null; }', 'utf-8');
      const calls = [];
      const resolver = (ctx) => {
        if (ctx.kind === 'foreign') {
          calls.push(ctx.targetRelative);
          return 'overwrite';
        }
        return 'overwrite';
      };
      const { apply } = await applyButton({ cli: cliBundle, manifest, sandbox, options: { resolveConflict: resolver } });
      check('Foreign Button.tsx classified as "foreign"', calls.includes('button/Button.tsx'));
      const outcome = apply.outcomes.find((o) => o.targetRelative === 'button/Button.tsx');
      check('Foreign file decision after resolver overwrite is "wrote"', outcome?.decision === 'wrote');
    } finally {
      await fs.rm(sandbox, { recursive: true, force: true });
    }
  }

  console.log('\n[9] Updated file — clean update path skips resolver');
  {
    const sandbox = await makeSandbox('clean-update');
    try {
      const first = await applyButton({ cli: cliBundle, manifest, sandbox });
      const buttonPath = path.join(first.installRootAbs, 'button/Button.tsx');
      const recorded = first.apply.config.components.button.files.find((f) => f.path === 'Button.tsx');
      check('Initial install recorded Button.tsx checksum', !!recorded?.checksum);
      const fakeNewerContent = 'export const Button = () => null;\n';
      await fs.writeFile(buttonPath, fakeNewerContent, 'utf-8');
      const recordedChecksum = cli.computeStringChecksum(fakeNewerContent);
      const updatedConfig = cli.setInstalledComponent(first.apply.config, 'button', {
        name: 'Button',
        version: 'forced-by-test',
        files: first.apply.config.components.button.files.map((f) =>
          f.path === 'Button.tsx' ? { ...f, checksum: recordedChecksum } : f
        ),
      });
      await cli.writeConfig(sandbox, updatedConfig);

      let resolverCalledForButton = false;
      const resolver = (ctx) => {
        if (ctx.targetRelative === 'button/Button.tsx') resolverCalledForButton = true;
        return 'skip';
      };
      const { apply } = await applyButton({ cli: cliBundle, manifest, sandbox, options: { resolveConflict: resolver } });
      const outcome = apply.outcomes.find((o) => o.targetRelative === 'button/Button.tsx');
      check('Updated kind detected (recorded matches on-disk, new differs)', outcome?.kind === 'updated', JSON.stringify(outcome));
      check('Resolver NOT consulted for clean updates', resolverCalledForButton === false);
      check('Clean update decision is "wrote"', outcome?.decision === 'wrote');
    } finally {
      await fs.rm(sandbox, { recursive: true, force: true });
    }
  }

  console.log('\n[10] Skipped locally-modified file still recorded in config');
  {
    const sandbox = await makeSandbox('record-after-skip');
    try {
      const first = await applyButton({ cli: cliBundle, manifest, sandbox });
      const buttonPath = path.join(first.installRootAbs, 'button/Button.tsx');
      const original = await fs.readFile(buttonPath, 'utf-8');
      await fs.writeFile(buttonPath, '// LOCAL EDIT\n' + original, 'utf-8');
      const { apply } = await applyButton({ cli: cliBundle, manifest, sandbox });
      const recorded = apply.config.components.button.files.find((f) => f.path === 'Button.tsx');
      check('Config still records Button.tsx after skip', !!recorded);
      const drift = await cli.detectAllComponentDrift(sandbox, apply.config);
      const buttonReport = drift.find((r) => r.id === 'button');
      check('Drift detection still flags Button.tsx as modified after skip',
        buttonReport && buttonReport.modifiedFiles.includes('Button.tsx'),
        JSON.stringify(buttonReport));
    } finally {
      await fs.rm(sandbox, { recursive: true, force: true });
    }
  }

  console.log('\n[11] Directory creation under configured path');
  {
    const sandbox = await makeSandbox('mkdir');
    try {
      const installPath = './nested/custom/dir/components';
      const installRootAbs = path.resolve(sandbox, installPath);
      const baseConfig = cli.createDefaultConfig(installPath);
      await cli.writeConfig(sandbox, baseConfig);
      const localProvider = new cli.LocalSourceProvider({ sourceRoot: SRC });
      const plan = await cli.buildDependencyPlan({
        componentIds: ['button'],
        installRoot: installRootAbs,
        sourceProvider: localProvider,
        manifest,
      });
      const apply = await cli.applyDependencyPlan({
        plan,
        installRootAbs,
        config: baseConfig,
        version: 'local-test',
      });
      await cli.writeConfig(sandbox, apply.config);
      const buttonExists = await fs
        .access(path.join(installRootAbs, 'button/Button.tsx'))
        .then(() => true)
        .catch(() => false);
      check('Installer creates nested target dir tree on demand', buttonExists);
      check('apply.written reports the new file', apply.written.includes('button/Button.tsx'));
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
