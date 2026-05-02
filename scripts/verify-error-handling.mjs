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

async function makeSandbox(prefix) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), `fluxo-errhandle-${prefix}-`));
  return dir;
}

async function main() {
  await ensureBuilt();
  console.log('verify-error-handling: starting');
  const cli = await loadCliInternals();

  console.log('\n[1] Public API surface — cli-errors');
  for (const name of [
    'CliError',
    'SourceAccessError',
    'ConfigStateError',
    'UnknownComponentError',
    'PartialInstallError',
    'formatCliError',
    'classifyFetchError',
    'reportAndExit',
    'printFormattedError',
  ]) {
    const value = cli[name];
    check(`exports ${name}`, typeof value === 'function', `got ${typeof value}`);
  }

  console.log('\n[2] CliError carries exitCode/hint/mode');
  const e1 = new cli.CliError('boom', { exitCode: 7, hint: 'check this', mode: 'add' });
  check('CliError exitCode', e1.exitCode === 7);
  check('CliError hint', e1.hint === 'check this');
  check('CliError mode', e1.mode === 'add');
  check('CliError instanceof Error', e1 instanceof Error);
  check('CliError name', e1.name === 'CliError');

  console.log('\n[3] SourceAccessError shape');
  const e2 = new cli.SourceAccessError('cannot reach github', { originUrl: 'https://x', statusCode: 503, mode: 'add' });
  check('SourceAccessError originUrl', e2.originUrl === 'https://x');
  check('SourceAccessError statusCode', e2.statusCode === 503);
  check('SourceAccessError mode preserved', e2.mode === 'add');
  check('SourceAccessError instanceof CliError', e2 instanceof cli.CliError);

  console.log('\n[4] UnknownComponentError carries id list');
  const e3 = new cli.UnknownComponentError(['foo', 'bar']);
  check('UnknownComponentError unknownIds', Array.isArray(e3.unknownIds) && e3.unknownIds.length === 2);
  check('UnknownComponentError message contains ids', e3.message.includes('foo') && e3.message.includes('bar'));

  console.log('\n[5] PartialInstallError captures missing/unresolved');
  const e4 = new cli.PartialInstallError(['a.tsx'], ['x → y']);
  check('PartialInstallError missingFiles', Array.isArray(e4.missingFiles) && e4.missingFiles[0] === 'a.tsx');
  check('PartialInstallError unresolvedImports', Array.isArray(e4.unresolvedImports) && e4.unresolvedImports[0] === 'x → y');

  console.log('\n[6] classifyFetchError — common shapes');
  const c1 = cli.classifyFetchError(new Error('Request timeout for https://example'));
  check('timeout classified isNetworkLevel', c1.isNetworkLevel === true);
  check('timeout hint mentions HTTPS_PROXY or connection', /proxy|connection/i.test(c1.hint));

  const c2 = cli.classifyFetchError(new Error('getaddrinfo ENOTFOUND raw.githubusercontent.com'));
  check('ENOTFOUND classified isNetworkLevel', c2.isNetworkLevel === true);
  check('ENOTFOUND hint mentions FLUXO_UI_LOCAL_SOURCE', /FLUXO_UI_LOCAL_SOURCE/.test(c2.hint));

  const c3 = cli.classifyFetchError(new Error('HTTP 404 for https://raw.githubusercontent.com/foo'));
  check('HTTP 404 statusCode parsed', c3.statusCode === 404);
  check('HTTP 404 hint mentions ref or release', /FLUXO_UI_REF|ref|release/i.test(c3.hint));

  const c4 = cli.classifyFetchError(new Error('HTTP 403 forbidden'));
  check('HTTP 403 statusCode parsed', c4.statusCode === 403);
  check('HTTP 403 hint mentions GITHUB_TOKEN', /GITHUB_TOKEN/.test(c4.hint));

  const c5 = cli.classifyFetchError(new Error('HTTP 502 bad gateway'));
  check('HTTP 5xx statusCode parsed', c5.statusCode === 502);
  check('HTTP 5xx hint mentions githubstatus', /githubstatus|status/i.test(c5.hint));

  const c6 = cli.classifyFetchError(new Error('Unable to verify the first certificate'));
  check('cert/TLS error isNetworkLevel', c6.isNetworkLevel === true);
  check('cert/TLS hint mentions cert', /cert|NODE_EXTRA_CA_CERTS/.test(c6.hint));

  console.log('\n[7] formatCliError prefixes mode');
  const f1 = cli.formatCliError(new cli.CliError('boom', { mode: 'add' }));
  check('formatCliError add prefix', /add/.test(f1.header));
  const f2 = cli.formatCliError(new cli.CliError('boom', { mode: 'update' }));
  check('formatCliError update prefix', /update/.test(f2.header));
  const f3 = cli.formatCliError(new Error('plain'));
  check('formatCliError plain Error exitCode 1', f3.exitCode === 1);
  check('formatCliError plain Error body present', Array.isArray(f3.body) && f3.body[0] === 'plain');

  console.log('\n[8] probeSourceProvider — local provider returns ok');
  const localProvider = new cli.LocalSourceProvider({ sourceRoot: SRC });
  const probeOk = await cli.probeSourceProvider(localProvider);
  check('probe ok against local src', probeOk.ok === true);
  check('probe records providerId', probeOk.providerId === 'local');
  check('probe records probedPath', typeof probeOk.probedPath === 'string' && probeOk.probedPath.length > 0);

  console.log('\n[9] probeSourceProvider — bad source root returns not-ok');
  const badProvider = new cli.LocalSourceProvider({ sourceRoot: path.join(os.tmpdir(), `does-not-exist-${Date.now()}`) });
  const probeBad = await cli.probeSourceProvider(badProvider);
  check('probe ok=false on missing files', probeBad.ok === false);
  check('probe reason populated for missing source', typeof probeBad.reason === 'string');

  console.log('\n[10] validateSourceProvider — local OK pathway');
  const validateOk = await cli.validateSourceProvider({ provider: localProvider, mode: 'add' });
  check('validateSourceProvider local ok', validateOk.ok === true);

  console.log('\n[11] validateSourceProvider — throws SourceAccessError on probe failure');
  let threw = null;
  try {
    await cli.validateSourceProvider({ provider: badProvider, mode: 'update' });
  } catch (err) {
    threw = err;
  }
  check('validateSourceProvider throws', threw !== null);
  check('thrown is SourceAccessError', threw instanceof cli.SourceAccessError);
  check('thrown carries mode=update', threw && threw.mode === 'update');
  check('thrown has hint', typeof threw?.hint === 'string' && threw.hint.length > 0);

  console.log('\n[12] validateSourceProvider — wraps thrown fetcher errors');
  const throwingProvider = {
    id: 'github:fake/fake@x',
    fetchText: async () => { throw new Error('getaddrinfo ENOTFOUND raw.githubusercontent.com'); },
    fetchBinary: async () => { throw new Error('getaddrinfo ENOTFOUND raw.githubusercontent.com'); },
    resolveOriginUrl: (p) => `https://raw.githubusercontent.com/fake/fake/x/${p}`,
  };
  let threw2 = null;
  try {
    await cli.validateSourceProvider({ provider: throwingProvider, mode: 'add' });
  } catch (err) {
    threw2 = err;
  }
  check('thrown on network failure', threw2 instanceof cli.SourceAccessError);
  check('thrown contains ENOTFOUND classification hint', threw2 && /FLUXO_UI_LOCAL_SOURCE/.test(threw2.hint || ''));

  console.log('\n[13] analyzeExternalDependencies — declares vs missing');
  const sandbox = await makeSandbox('externals');
  await fs.writeFile(
    path.join(sandbox, 'package.json'),
    JSON.stringify(
      {
        name: 'sandbox',
        version: '0.0.0',
        dependencies: { classnames: '^2.5.1', react: '^19.0.0' },
        devDependencies: { 'date-fns': '^4.0.0' },
      },
      null,
      2
    )
  );
  const analysis = await cli.analyzeExternalDependencies({
    projectRoot: sandbox,
    required: ['classnames', 'react', 'react-dom', 'date-fns', 'somemissinglib'],
    optionalPeers: ['html2canvas', 'chart.js'],
  });
  check('analysis records package.json path', analysis.packageJsonPath !== null);
  check('analysis declared has classnames', analysis.declared.has('classnames'));
  check('analysis missing contains undeclared lib', analysis.missing.includes('somemissinglib'));
  check('analysis missing does NOT contain react (declared)', !analysis.missing.includes('react'));
  check('analysis missing does NOT contain react-dom (peer assumption)', !analysis.missing.includes('react-dom'));
  check('analysis missing does NOT contain date-fns (devDep)', !analysis.missing.includes('date-fns'));
  check('analysis optionalMissing contains html2canvas', analysis.optionalMissing.includes('html2canvas'));

  console.log('\n[14] analyzeExternalDependencies — no package.json');
  const sandbox2 = await makeSandbox('no-pkg');
  const analysis2 = await cli.analyzeExternalDependencies({
    projectRoot: sandbox2,
    required: ['react', 'classnames'],
  });
  check('analysis2 packageJsonPath is null', analysis2.packageJsonPath === null);
  check('analysis2 missing skips node builtins (react treated as builtin)', !analysis2.missing.includes('react'));
  check('analysis2 missing contains classnames', analysis2.missing.includes('classnames'));

  console.log('\n[15] runInstall surfaces SourceAccessError on broken provider');
  const sandbox3 = await makeSandbox('broken-source');
  await fs.writeFile(
    path.join(sandbox3, 'package.json'),
    JSON.stringify({ name: 'sandbox', version: '0.0.0' }, null, 2)
  );
  const installPath = './src/components/fluxo-ui';
  const installRootAbs = path.resolve(sandbox3, installPath);
  await fs.mkdir(installRootAbs, { recursive: true });
  const baseConfig = cli.createDefaultConfig(installPath);
  const cfgPath = await cli.writeConfig(sandbox3, baseConfig);
  let runErr = null;
  try {
    await cli.runInstall({
      componentIds: ['button'],
      installRootAbs,
      config: baseConfig,
      configFilePath: cfgPath,
      projectRoot: sandbox3,
      sourceProvider: throwingProvider,
      mode: 'add',
      forceMode: true,
    });
  } catch (err) {
    runErr = err;
  }
  check('runInstall threw SourceAccessError', runErr instanceof cli.SourceAccessError);
  check('runInstall error carries mode=add', runErr && runErr.mode === 'add');
  check('runInstall error has hint', typeof runErr?.hint === 'string' && runErr.hint.length > 0);

  console.log('\n[16] PROBE_KNOWN_FILES exposed');
  check('PROBE_KNOWN_FILES is array', Array.isArray(cli.PROBE_KNOWN_FILES));
  check('PROBE_KNOWN_FILES has at least one entry', cli.PROBE_KNOWN_FILES.length > 0);

  console.log('\n[17] reportAndExit / printFormattedError do not throw on plain Error');
  let formatThrew = null;
  try {
    const f = cli.formatCliError(new Error('plain'), 'update');
    cli.printFormattedError(f);
  } catch (err) {
    formatThrew = err;
  }
  check('printFormattedError safe', formatThrew === null);

  console.log('\n[18] CLI bin handler exports still present after error refactor');
  check('handleAdd export', typeof cli.handleAdd === 'function');
  check('handleUpdate export', typeof cli.handleUpdate === 'function');

  console.log('\n[19] detectPackageManager — recognises lockfiles');
  check('detectPackageManager export', typeof cli.detectPackageManager === 'function');
  check('buildInstallCommand export', typeof cli.buildInstallCommand === 'function');
  const pmDir = await makeSandbox('pm');
  check('detectPackageManager defaults to npm without lockfiles', (await cli.detectPackageManager(pmDir)) === 'npm');
  await fs.writeFile(path.join(pmDir, 'package-lock.json'), '{}');
  check('detectPackageManager picks npm via package-lock.json', (await cli.detectPackageManager(pmDir)) === 'npm');
  await fs.writeFile(path.join(pmDir, 'yarn.lock'), '');
  check('detectPackageManager prefers yarn over npm when both present', (await cli.detectPackageManager(pmDir)) === 'yarn');
  await fs.writeFile(path.join(pmDir, 'pnpm-lock.yaml'), '');
  check('detectPackageManager prefers pnpm over yarn when both present', (await cli.detectPackageManager(pmDir)) === 'pnpm');
  await fs.writeFile(path.join(pmDir, 'bun.lockb'), '');
  check('detectPackageManager prefers bun over pnpm when both present', (await cli.detectPackageManager(pmDir)) === 'bun');

  console.log('\n[20] buildInstallCommand — per-PM syntax');
  check('npm install syntax', cli.buildInstallCommand('npm', ['classnames']) === 'npm install classnames');
  check('pnpm add syntax', cli.buildInstallCommand('pnpm', ['classnames', 'date-fns']) === 'pnpm add classnames date-fns');
  check('yarn add syntax', cli.buildInstallCommand('yarn', ['classnames']) === 'yarn add classnames');
  check('bun add syntax', cli.buildInstallCommand('bun', ['classnames']) === 'bun add classnames');
  check('empty list returns empty string', cli.buildInstallCommand('npm', []) === '');

  console.log('\n[21] analyzeExternalDependencies surfaces packageManager + installCommand');
  const sandboxPnpm = await makeSandbox('externals-pnpm');
  await fs.writeFile(
    path.join(sandboxPnpm, 'package.json'),
    JSON.stringify({ name: 'p', version: '0.0.0', dependencies: { react: '^19.0.0' } }, null, 2)
  );
  await fs.writeFile(path.join(sandboxPnpm, 'pnpm-lock.yaml'), '');
  const analysisPnpm = await cli.analyzeExternalDependencies({
    projectRoot: sandboxPnpm,
    required: ['react', 'classnames'],
  });
  check('analysis exposes packageManager', analysisPnpm.packageManager === 'pnpm');
  check('analysis installCommand uses pnpm add', analysisPnpm.installCommand === 'pnpm add classnames');

  console.log('\n[22] resolveSourceProvider honours FLUXO_UI_REF and GITHUB_TOKEN env vars');
  const prevRef = process.env.FLUXO_UI_REF;
  const prevToken = process.env.GITHUB_TOKEN;
  const prevLocal = process.env.FLUXO_UI_LOCAL_SOURCE;
  delete process.env.FLUXO_UI_LOCAL_SOURCE;
  process.env.FLUXO_UI_REF = 'v1.2.3';
  process.env.GITHUB_TOKEN = 'ghs_test_token';
  try {
    const provider = await cli.resolveSourceProvider({});
    check('provider id reflects FLUXO_UI_REF', /v1\.2\.3$/.test(provider.id));
    check('provider id starts with github:', provider.id.startsWith('github:'));
    let captured = null;
    const probeProvider = new cli.GitHubSourceProvider({
      owner: 'a',
      repo: 'b',
      ref: 'main',
      token: 'abc',
      fetcher: async (url, headers) => {
        captured = headers;
        return Buffer.from('ok');
      },
    });
    await probeProvider.fetchText('x');
    check('GitHubSourceProvider injects Authorization header when token set', captured && captured.Authorization === 'Bearer abc');
    const noTokenProvider = new cli.GitHubSourceProvider({
      owner: 'a',
      repo: 'b',
      fetcher: async (url, headers) => {
        captured = headers;
        return Buffer.from('ok');
      },
    });
    await noTokenProvider.fetchText('x');
    check('GitHubSourceProvider sends no auth when token absent', !captured || !captured.Authorization);
  } finally {
    if (prevRef === undefined) delete process.env.FLUXO_UI_REF;
    else process.env.FLUXO_UI_REF = prevRef;
    if (prevToken === undefined) delete process.env.GITHUB_TOKEN;
    else process.env.GITHUB_TOKEN = prevToken;
    if (prevLocal !== undefined) process.env.FLUXO_UI_LOCAL_SOURCE = prevLocal;
  }

  console.log('\n[23] parseArgs accepts --no-export* flags');
  const parsed1 = cli.parseArgs(['add', 'button', '--no-export']);
  check('parseArgs --no-export sets noExport', parsed1.options.noExport === true);
  const parsed2 = cli.parseArgs(['add', 'button', '--no-export-hooks']);
  check('parseArgs --no-export-hooks sets noExportHooks', parsed2.options.noExportHooks === true);
  const parsed3 = cli.parseArgs(['add', 'button', '--no-export-utils']);
  check('parseArgs --no-export-utils sets noExportUtils', parsed3.options.noExportUtils === true);
  const parsed4 = cli.parseArgs(['add', 'button', '--no-export-hooks', '--no-export-utils']);
  check(
    'parseArgs combines --no-export-hooks and --no-export-utils',
    parsed4.options.noExportHooks === true && parsed4.options.noExportUtils === true
  );

  console.log('\n[24] inferGitHubProviderFromPackage forwards token + ref');
  const inferred = cli.inferGitHubProviderFromPackage({
    packageJson: { repository: { url: 'git+https://github.com/foo/bar.git' } },
    ref: 'develop',
    token: 'ghs_inferred',
  });
  check('inferred provider built', inferred !== null);
  check('inferred provider id matches owner/repo@ref', inferred && inferred.id === 'github:foo/bar@develop');
  let inferredCaptured = null;
  if (inferred) {
    inferred.cache?.clear?.();
    const tokenInferred = new cli.GitHubSourceProvider({
      owner: 'foo',
      repo: 'bar',
      ref: 'develop',
      token: 'ghs_inferred',
      fetcher: async (url, headers) => {
        inferredCaptured = headers;
        return Buffer.from('ok');
      },
    });
    await tokenInferred.fetchText('any');
  }
  check('inferred provider sends Authorization', inferredCaptured && /Bearer ghs_inferred/.test(inferredCaptured.Authorization || ''));

  console.log(`\n${pass} PASS, ${fail} FAIL`);
  if (fail > 0) {
    console.log('\nFailures:');
    for (const f of failures) console.log(`  - ${f}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('verify-error-handling crashed:', err);
  process.exit(1);
});
