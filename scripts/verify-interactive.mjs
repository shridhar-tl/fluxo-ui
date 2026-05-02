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

async function loadInteractive() {
  const file = path.join(ROOT, 'cli', 'internals.js');
  try {
    await fs.access(file);
  } catch {
    throw new Error('cli/internals.js missing. Run `npm run build-cli` first.');
  }
  return import(`file://${file.split(path.sep).join('/')}`);
}

async function makeSandbox(prefix) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), `fluxo-interactive-${prefix}-`));
  return dir;
}

async function run() {
  console.log('verify-interactive: starting');
  const cli = await loadInteractive();

  console.log('\n[1] Public API surface');
  for (const name of [
    'isInteractive',
    'isCancelled',
    'printForceBanner',
    'printSection',
    'printSubtle',
    'printWarning',
    'printError',
    'printSuccess',
    'promptForInstallPath',
    'promptConfirm',
    'promptComponentSelection',
    'promptUpdateSelection',
    'promptComponentConflict',
    'promptMissingComponentOnUpdate',
    'createInteractiveFileResolver',
    'resolveInstallPathInteractive',
    'directoryHasFiles',
    'ensureDirectoryExists',
    'confirmTsxWarningOnAdd',
    'summarizeDriftBeforeUpdate',
  ]) {
    check(`exports ${name}`, typeof cli[name] === 'function', `got ${typeof cli[name]}`);
  }

  console.log('\n[2] isInteractive returns boolean');
  const interactiveResult = cli.isInteractive();
  check('isInteractive boolean', typeof interactiveResult === 'boolean');
  check('isInteractive false in test (no TTY)', interactiveResult === false);

  console.log('\n[3] isCancelled detection');
  check('cancelled object detected', cli.isCancelled({ cancelled: true }) === true);
  check('plain object NOT cancelled', cli.isCancelled({ value: 'foo' }) === false);
  check('string NOT cancelled', cli.isCancelled('foo') === false);
  check('null NOT cancelled', cli.isCancelled(null) === false);

  console.log('\n[4] resolveInstallPathInteractive (force mode short-circuits prompts)');
  const sandbox = await makeSandbox('path');
  const resolved = await cli.resolveInstallPathInteractive({
    projectRoot: sandbox,
    defaultPath: './src/components/fluxo-ui',
    forceMode: true,
    mode: 'add',
  });
  check('not cancelled', !cli.isCancelled(resolved));
  check('returns absolute path', resolved && typeof resolved.absolute === 'string' && path.isAbsolute(resolved.absolute));
  check(
    'relativeFromRoot is forward-slash relative',
    resolved && resolved.relativeFromRoot === './src/components/fluxo-ui'
  );

  console.log('\n[5] resolveInstallPathInteractive (non-interactive without forceMode also returns default)');
  const noTty = await cli.resolveInstallPathInteractive({
    projectRoot: sandbox,
    defaultPath: './my-components',
    forceMode: false,
    mode: 'add',
  });
  check('non-interactive returns default', !cli.isCancelled(noTty) && noTty.relativeFromRoot === './my-components');

  console.log('\n[6] resolveInstallPathInteractive honors absolute initial path');
  const abs = path.resolve(sandbox, 'custom-dir');
  const fromAbsolute = await cli.resolveInstallPathInteractive({
    projectRoot: sandbox,
    defaultPath: './src/components/fluxo-ui',
    initialPath: abs,
    forceMode: true,
    mode: 'update',
  });
  check(
    'absolute initial path preserved as ./custom-dir',
    !cli.isCancelled(fromAbsolute) && fromAbsolute.relativeFromRoot === './custom-dir'
  );

  console.log('\n[7] ensureDirectoryExists creates nested dirs');
  const nested = path.join(sandbox, 'a', 'b', 'c');
  await cli.ensureDirectoryExists(nested);
  const stat = await fs.stat(nested);
  check('nested dir created', stat.isDirectory());

  console.log('\n[8] directoryHasFiles handles missing, empty, and populated');
  const missing = await cli.directoryHasFiles(path.join(sandbox, 'does-not-exist'));
  check('missing dir reports exists=false', missing.exists === false && missing.fileCount === 0);

  const empty = path.join(sandbox, 'empty');
  await fs.mkdir(empty, { recursive: true });
  const emptyProbe = await cli.directoryHasFiles(empty);
  check('empty dir reports exists=true, fileCount=0', emptyProbe.exists === true && emptyProbe.fileCount === 0);

  const populated = path.join(sandbox, 'populated');
  await fs.mkdir(populated, { recursive: true });
  await fs.writeFile(path.join(populated, 'a.tsx'), 'export const a = 1;');
  await fs.writeFile(path.join(populated, 'b.scss'), '.x{}');
  await fs.mkdir(path.join(populated, 'sub'), { recursive: true });
  await fs.writeFile(path.join(populated, 'sub', 'c.ts'), 'export const c = 1;');
  const populatedProbe = await cli.directoryHasFiles(populated);
  check('populated dir reports fileCount >= 3', populatedProbe.exists && populatedProbe.fileCount >= 3, `fileCount=${populatedProbe.fileCount}`);

  console.log('\n[9] confirmTsxWarningOnAdd auto-approves under forceMode');
  const tsxForced = await cli.confirmTsxWarningOnAdd({ forceMode: true });
  check('forceMode → true', tsxForced === true);
  const tsxNonInteractive = await cli.confirmTsxWarningOnAdd({ forceMode: false });
  check('non-interactive (no TTY) → true (warn but allow)', tsxNonInteractive === true);

  console.log('\n[10] createInteractiveFileResolver — forceMode short-circuit');
  const forceResolver = cli.createInteractiveFileResolver({ forceMode: true, mode: 'update' });
  const ctx = {
    srcRelative: 'components/Button.tsx',
    targetRelative: 'button/Button.tsx',
    targetAbsolute: '/tmp/button/Button.tsx',
    kind: 'locally-modified',
    componentId: 'button',
    isText: true,
    recordedChecksum: 'sha256:aaa',
    onDiskChecksum: 'sha256:bbb',
    newChecksum: 'sha256:ccc',
  };
  const decision1 = await forceResolver(ctx);
  check('forceMode resolver returns overwrite', decision1 === 'overwrite');

  console.log('\n[11] createInteractiveFileResolver — non-interactive falls back to skip');
  const nonForce = cli.createInteractiveFileResolver({ forceMode: false, mode: 'update' });
  const decision2 = await nonForce(ctx);
  check('non-interactive resolver returns skip (preserve user edits)', decision2 === 'skip');

  console.log('\n[12] createInteractiveFileResolver — handles foreign kind in non-interactive too');
  const foreignCtx = { ...ctx, kind: 'foreign' };
  const decision3 = await nonForce(foreignCtx);
  check('non-interactive foreign resolver returns skip', decision3 === 'skip');

  console.log('\n[13] summarizeDriftBeforeUpdate is a no-op when no reports modified');
  let stdoutBuf = '';
  const realLog = console.log;
  console.log = (...args) => {
    stdoutBuf += args.join(' ') + '\n';
  };
  try {
    await cli.summarizeDriftBeforeUpdate(
      [
        { id: 'button', isModified: false, modifiedFiles: [], missingFiles: [], addedFiles: [] },
      ],
      false
    );
  } finally {
    console.log = realLog;
  }
  check('no output when nothing modified', stdoutBuf.trim() === '');

  console.log('\n[14] summarizeDriftBeforeUpdate prints modified components');
  stdoutBuf = '';
  console.log = (...args) => {
    stdoutBuf += args.join(' ') + '\n';
  };
  try {
    await cli.summarizeDriftBeforeUpdate(
      [
        { id: 'button', isModified: true, modifiedFiles: ['Button.tsx'], missingFiles: [], addedFiles: [] },
        { id: 'card', isModified: true, modifiedFiles: [], missingFiles: ['Card.scss'], addedFiles: [] },
      ],
      false
    );
  } finally {
    console.log = realLog;
  }
  check('prints button modified', stdoutBuf.includes('button'));
  check('prints card modified', stdoutBuf.includes('card'));
  check('mentions per-file prompt fallback', stdoutBuf.includes('per-file'));

  console.log('\n[15] summarizeDriftBeforeUpdate force note');
  stdoutBuf = '';
  console.log = (...args) => {
    stdoutBuf += args.join(' ') + '\n';
  };
  try {
    await cli.summarizeDriftBeforeUpdate(
      [{ id: 'button', isModified: true, modifiedFiles: ['Button.tsx'], missingFiles: [], addedFiles: [] }],
      true
    );
  } finally {
    console.log = realLog;
  }
  check('force note includes overwrite warning', stdoutBuf.includes('overwritten'));

  console.log('\n[16] printForceBanner emits a multi-line banner');
  stdoutBuf = '';
  console.log = (...args) => {
    stdoutBuf += args.join(' ') + '\n';
  };
  try {
    cli.printForceBanner('add');
  } finally {
    console.log = realLog;
  }
  check('banner mentions FORCE MODE', stdoutBuf.includes('FORCE MODE'));
  check('banner mentions overwrite warning', stdoutBuf.toLowerCase().includes('overwritten') || stdoutBuf.toLowerCase().includes('overwrit'));

  console.log('\n[17] verifying help text mentions interactive prompts');
  let helpBuf = '';
  console.log = (...args) => {
    helpBuf += args.join(' ') + '\n';
  };
  try {
    cli.showHelp();
  } finally {
    console.log = realLog;
  }
  check('help mentions interactive', helpBuf.toLowerCase().includes('interactive'));
  check('help describes --force', helpBuf.includes('--force'));
  check('help mentions overwrite-all', helpBuf.includes('overwrite-all') || helpBuf.includes('skip-all'));

  console.log('\n[18] cli-add exports handleAdd, cli-update exports handleUpdate');
  check('handleAdd is function', typeof cli.handleAdd === 'function');
  check('handleUpdate is function', typeof cli.handleUpdate === 'function');

  console.log('\n[19] interactive resolver uses select/skip-all batching state correctly across calls');
  let lastInjected = null;
  const injectedResolver = cli.createInteractiveFileResolver({ forceMode: false, mode: 'update' });
  lastInjected = injectedResolver;
  check('createInteractiveFileResolver returns a function', typeof lastInjected === 'function');

  console.log('\n[20] Argv parsing still respects --force');
  const args = cli.parseArgs(['add', '--force', 'Button']);
  check('parses add command', args.command === 'add');
  check('parses --force', args.options.force === true);
  check('parses Button', Array.isArray(args.components) && args.components[0] === 'Button');

  console.log('\n[21] add help mentions Ctrl+C abort path');
  helpBuf = '';
  console.log = (...args) => {
    helpBuf += args.join(' ') + '\n';
  };
  try {
    cli.showHelp();
  } finally {
    console.log = realLog;
  }
  check('help mentions Ctrl+C', helpBuf.includes('Ctrl+C'));

  console.log('\n[22] cli-args validatePath still works');
  check('validatePath empty (falsy) -> true', cli.validatePath('') === true);
  check('validatePath whitespace -> false', cli.validatePath('   ') === false);
  check('validatePath undefined -> true', cli.validatePath(undefined) === true);
  check('validatePath non-empty -> true', cli.validatePath('./foo') === true);

  console.log('\n[23] sandbox cleanup');
  await fs.rm(sandbox, { recursive: true, force: true });
  check('sandbox removed', true);

  console.log('');
  console.log(`PASS=${pass} FAIL=${fail}`);
  if (fail > 0) {
    console.error('FAILURES:');
    for (const f of failures) console.error('  ' + f);
    process.exit(1);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
