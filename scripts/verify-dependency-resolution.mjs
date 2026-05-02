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
  const dist = path.join(ROOT, 'cli', 'entry.js');
  try {
    await fs.access(dist);
  } catch {
    throw new Error('cli/ not present. Run `npm run build-cli` first.');
  }
}

async function loadCliInternals() {
  const file = path.join(ROOT, 'cli', 'internals.js');
  try {
    await fs.access(file);
  } catch {
    throw new Error(`Missing CLI file ${file}. Run \`npm run build-cli\`.`);
  }
  return import(`file://${file.split(path.sep).join('/')}`);
}

async function loadDistManifest() {
  const dataFile = path.join(ROOT, 'cli', 'manifest-data.json');
  try {
    await fs.access(dataFile);
  } catch {
    const srcData = path.join(SRC, 'cli', 'manifest-data.json');
    return JSON.parse(await fs.readFile(srcData, 'utf-8'));
  }
  return JSON.parse(await fs.readFile(dataFile, 'utf-8'));
}

async function main() {
  await ensureBuilt();

  const cli = await loadCliInternals();
  const sourceProviderMod = cli;
  const plannerMod = cli;
  const rewriterMod = cli;
  const assetMod = cli;
  const installerMod = cli;
  const manifestMod = cli;
  const configMod = cli;
  const checksumMod = cli;

  const manifest = await loadDistManifest();
  manifestMod.setManifestForTesting(manifest);

  const localProvider = new sourceProviderMod.LocalSourceProvider({ sourceRoot: SRC });

  console.log('\n[1] Source providers');
  check('LocalSourceProvider id is "local"', localProvider.id === 'local');
  const buttonText = await localProvider.fetchText('components/Button.tsx');
  check('LocalSourceProvider fetches Button.tsx', !!buttonText && buttonText.includes('Button'));
  const buttonOriginUrl = localProvider.resolveOriginUrl('components/Button.tsx');
  check('LocalSourceProvider origin is file URL', buttonOriginUrl.startsWith('file://'));

  const githubProvider = new sourceProviderMod.GitHubSourceProvider({
    owner: 'test-owner',
    repo: 'test-repo',
    ref: 'main',
    basePath: 'src',
    fetcher: async () => Buffer.from('content', 'utf-8'),
  });
  check('GitHubSourceProvider id includes owner/repo/ref', githubProvider.id === 'github:test-owner/test-repo@main');
  const ghUrl = githubProvider.resolveOriginUrl('components/Button.tsx');
  check(
    'GitHubSourceProvider builds raw URL',
    ghUrl === 'https://raw.githubusercontent.com/test-owner/test-repo/main/src/components/Button.tsx'
  );
  const ghContent = await githubProvider.fetchText('any/path.ts');
  check('GitHubSourceProvider fetcher returns text', ghContent === 'content');

  const inferred = sourceProviderMod.inferGitHubProviderFromPackage({
    packageJson: { repository: { url: 'git+https://github.com/foo/bar.git' } },
  });
  check('inferGitHubProviderFromPackage parses git+https url', !!inferred && inferred.id === 'github:foo/bar@main');

  console.log('\n[2] Icon registry');
  const iconRegistry = await assetMod.loadIconRegistry(localProvider);
  check('Icon registry loads', !!iconRegistry);
  check('Icon registry has ChevronDownIcon', iconRegistry?.byName.has('ChevronDownIcon'));
  const chevron = iconRegistry?.byName.get('ChevronDownIcon');
  check('ChevronDownIcon maps to assets/icons/chevron-down.svg', chevron?.svgRelative === 'assets/icons/chevron-down.svg');
  check('Icon import query is ?react', chevron?.importQuery === '?react');
  check('SuccessIcon shares svg with CheckCircleIcon (alias)',
    iconRegistry?.byName.get('SuccessIcon')?.svgRelative === iconRegistry?.byName.get('CheckCircleIcon')?.svgRelative);

  console.log('\n[3] Dependency planner — Button');
  const buttonPlan = await plannerMod.buildDependencyPlan({
    componentIds: ['button'],
    installRoot: '/tmp/install',
    sourceProvider: localProvider,
    manifest,
  });
  check('Button closure includes button', buttonPlan.closure.components.includes('button'));
  check('Button closure includes link', buttonPlan.closure.components.includes('link'));
  check('Button closure includes tooltip', buttonPlan.closure.components.includes('tooltip'));
  check('Button closure includes confirm-popover', buttonPlan.closure.components.includes('confirm-popover'));
  check('Button plan files include Button.tsx', buttonPlan.files.some((f) => f.targetRelative === 'button/Button.tsx'));
  check('Button plan target Button.scss', buttonPlan.files.some((f) => f.targetRelative === 'button/Button.scss'));
  check('Button plan target link/Link.tsx', buttonPlan.files.some((f) => f.targetRelative === 'link/Link.tsx'));
  check('Button plan target tooltip/Tooltip.tsx', buttonPlan.files.some((f) => f.targetRelative === 'tooltip/Tooltip.tsx'));
  check('Button plan includes shared types', buttonPlan.files.some((f) => f.kind === 'shared' && f.srcRelative.startsWith('types/')));
  check('Button plan has zero unresolved imports', buttonPlan.unresolvedImports.length === 0,
    buttonPlan.unresolvedImports.slice(0, 5).map((u) => `${u.fromFile}→${u.spec}`).join('; '));
  check('Button plan has zero missing files', buttonPlan.missingFiles.length === 0,
    buttonPlan.missingFiles.slice(0, 5).join('; '));

  console.log('\n[4] Asset & icon discovery — Accordion');
  const accordionPlan = await plannerMod.buildDependencyPlan({
    componentIds: ['accordion'],
    installRoot: '/tmp/install',
    sourceProvider: localProvider,
    manifest,
  });
  check('Accordion plan discovered ChevronDownIcon SVG',
    accordionPlan.iconFiles.some((f) => f.srcRelative === 'assets/icons/chevron-down.svg'));
  check('Accordion plan iconFiles all have target under assets/icons/',
    accordionPlan.iconFiles.every((f) => f.targetRelative.startsWith('assets/icons/')));
  check('Accordion plan does NOT include all 100+ SVGs',
    accordionPlan.iconFiles.length < 30,
    `actual=${accordionPlan.iconFiles.length}`);

  console.log('\n[5] Hook + util closure — AnimateOnView');
  const animPlan = await plannerMod.buildDependencyPlan({
    componentIds: ['animate-on-view'],
    installRoot: '/tmp/install',
    sourceProvider: localProvider,
    manifest,
  });
  check('AnimateOnView pulls useReducedMotion hook', animPlan.closure.hooks.includes('useReducedMotion'));
  check('Hook file targets hooks/useReducedMotion.ts',
    animPlan.hookFiles.some((f) => f.targetRelative === 'hooks/useReducedMotion.ts'));

  console.log('\n[6] Import rewriter — Button.tsx');
  const buttonSrc = await localProvider.fetchText('components/Button.tsx');
  const buttonTargetMap = new Map(buttonPlan.files.map((f) => [f.srcRelative, f.targetRelative]));
  const buttonRewrite = rewriterMod.rewriteFileContent(buttonSrc, {
    fileSrcPath: 'components/Button.tsx',
    targetMap: buttonTargetMap,
    fileExistsInSrc: (p) => buttonTargetMap.has(p),
    iconRegistry,
  });
  check('Rewritten Button still imports React', buttonRewrite.content.includes("from 'react'"));
  check('Rewritten Button still imports classnames', buttonRewrite.content.includes("from 'classnames'"));
  check('Rewritten Button keeps a relative ../types reference', buttonRewrite.content.includes("from '../types'"));
  check('Rewritten Button has no ../../types reference', !buttonRewrite.content.includes("from '../../types'"));
  check('Rewritten Button keeps own scss side-effect import', buttonRewrite.content.includes("'./Button.scss'"));
  check('Rewritten Button rewrites ./Link → ../link/Link', buttonRewrite.content.includes("'../link/Link'"));
  check('Rewritten Button rewrites ./tooltip/Tooltip → ../tooltip/Tooltip', buttonRewrite.content.includes("'../tooltip/Tooltip'"));
  check('Button has no unresolved imports during rewrite', buttonRewrite.unresolved.length === 0,
    buttonRewrite.unresolved.join(', '));

  console.log('\n[7] Icon import rewrite — Accordion');
  const accordionSrc = await localProvider.fetchText('components/accordion/Accordion.tsx');
  const accordionMap = new Map(accordionPlan.files.map((f) => [f.srcRelative, f.targetRelative]));
  const accRewrite = rewriterMod.rewriteFileContent(accordionSrc, {
    fileSrcPath: 'components/accordion/Accordion.tsx',
    targetMap: accordionMap,
    fileExistsInSrc: (p) => accordionMap.has(p),
    iconRegistry,
  });
  check('Accordion rewrite drops ../../assets/icons named import',
    !/from '\.\.\/\.\.\/assets\/icons['"]/.test(accRewrite.content));
  check('Accordion rewrite emits direct ChevronDownIcon SVG import',
    accRewrite.content.includes("import ChevronDownIcon from") &&
    accRewrite.content.includes('assets/icons/chevron-down.svg?react'));
  check('Accordion rewrite computes correct relative path to assets',
    /from ['"]\.\.\/assets\/icons\/chevron-down\.svg\?react['"]/.test(accRewrite.content));

  console.log('\n[8] End-to-end install (sandbox)');
  const sandbox = await fs.mkdtemp(path.join(os.tmpdir(), 'fluxo-cli-dep-'));
  try {
    await fs.writeFile(path.join(sandbox, 'package.json'), JSON.stringify({ name: 'sandbox', version: '0.0.0' }, null, 2));
    const installPath = './src/components/fluxo-ui';
    const installRootAbs = path.resolve(sandbox, installPath);
    await fs.mkdir(installRootAbs, { recursive: true });
    const baseConfig = configMod.createDefaultConfig(installPath);
    const cfgPath = await configMod.writeConfig(sandbox, baseConfig);

    const ePlan = await plannerMod.buildDependencyPlan({
      componentIds: ['button'],
      installRoot: installRootAbs,
      sourceProvider: localProvider,
      manifest,
    });
    const apply = await installerMod.applyDependencyPlan({
      plan: ePlan,
      installRootAbs,
      config: baseConfig,
      version: 'local-test',
    });
    await configMod.writeConfig(sandbox, apply.config, cfgPath);
    check('Apply wrote at least 5 files', apply.written.length >= 5, `wrote=${apply.written.length}`);
    const buttonOnDisk = await fs.readFile(path.join(installRootAbs, 'button', 'Button.tsx'), 'utf-8');
    check('Installed Button.tsx exists on disk', buttonOnDisk.length > 0);
    check('Installed Button.tsx imports rewritten link', buttonOnDisk.includes("'../link/Link'"));
    check('Installed Button.tsx imports tooltip path', buttonOnDisk.includes("'../tooltip/Tooltip'"));
    check('Config records button installation', !!apply.config.components.button);
    const buttonRecord = apply.config.components.button;
    check('Button record has files array', Array.isArray(buttonRecord.files) && buttonRecord.files.length > 0);
    check('Button record has rollup checksum', typeof buttonRecord.checksum === 'string' && buttonRecord.checksum.length === 64);
    const recordedPath = buttonRecord.files.find((f) => f.path === 'Button.tsx');
    check('Recorded Button.tsx checksum matches installer-computed value',
      recordedPath?.checksum === checksumMod.computeStringChecksum(buttonOnDisk));

    const drift = await configMod.detectAllComponentDrift(sandbox, apply.config);
    const buttonDrift = drift.find((d) => d.id === 'button');
    check('No drift detected immediately after install', buttonDrift && !buttonDrift.isModified,
      buttonDrift ? configMod.summarizeDriftReport(buttonDrift) : 'no report');
  } finally {
    await fs.rm(sandbox, { recursive: true, force: true });
  }

  console.log('\n[9] Recursive depth — Calendar');
  const calendarPlan = await plannerMod.buildDependencyPlan({
    componentIds: ['calendar'],
    installRoot: '/tmp/install',
    sourceProvider: localProvider,
    manifest,
  });
  check('Calendar plan includes nested views/agenda/AgendaView',
    calendarPlan.files.some((f) => f.targetRelative === 'calendar/views/agenda/AgendaView.tsx'));
  check('Calendar plan includes interactions/useDragMove',
    calendarPlan.files.some((f) => f.targetRelative === 'calendar/interactions/useDragMove.ts'));
  check('Calendar plan resolved its missing files set', calendarPlan.missingFiles.length === 0,
    calendarPlan.missingFiles.slice(0, 5).join('; '));
  check('Calendar plan resolved its unresolved imports', calendarPlan.unresolvedImports.length === 0,
    calendarPlan.unresolvedImports.slice(0, 5).map((u) => `${u.fromFile}→${u.spec}`).join('; '));

  const calendarMap = new Map(calendarPlan.files.map((f) => [f.srcRelative, f.targetRelative]));
  const overflowSrc = await localProvider.fetchText('components/calendar/entries/OverflowPopover.tsx');
  const overflowRewrite = rewriterMod.rewriteFileContent(overflowSrc, {
    fileSrcPath: 'components/calendar/entries/OverflowPopover.tsx',
    targetMap: calendarMap,
    fileExistsInSrc: (p) => calendarMap.has(p),
    iconRegistry,
  });
  check('OverflowPopover triple-up hook import rewrites to ../../hooks/useMobile',
    overflowRewrite.content.includes("'../../hooks/useMobile'"),
    'expected ../../hooks/useMobile after rewriting ../../../hooks/useMobile');

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
