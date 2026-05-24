#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DIST_INTERNALS = path.join(ROOT, 'cli', 'internals.js');

let pass = 0;
let fail = 0;

function check(label, condition, detail) {
  if (condition) {
    console.log(`  PASS  ${label}`);
    pass++;
  } else {
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ''}`);
    fail++;
  }
}

async function main() {
  const internals = await import(pathToFileURL(DIST_INTERNALS).href);

  const localProvider = new internals.LocalSourceProvider({ sourceRoot: SRC });

  console.log('[1] SCSS-mode plan includes styles bundle, no props.json');
  const planScss = await internals.buildDependencyPlan({
    componentIds: ['button'],
    installRoot: '/tmp/test',
    sourceProvider: localProvider,
  });
  const scssTargets = planScss.files.map((f) => f.targetRelative);
  check('Includes _eui-vars.scss at install root', scssTargets.includes('_eui-vars.scss'));
  check('Includes eui-base.scss at install root', scssTargets.includes('eui-base.scss'));
  check('Includes styles/index.css', scssTargets.includes('styles/index.css'));
  check('Includes styles/base-theme.css', scssTargets.includes('styles/base-theme.css'));
  check('Includes styles/theme-blue.css', scssTargets.includes('styles/theme-blue.css'));
  check('No .props.json files in plan', !scssTargets.some((t) => /\.props\.json$/.test(t)));
  check('Button.scss present', scssTargets.includes('button/Button.scss'));
  check('Button.tsx present', scssTargets.includes('button/Button.tsx'));

  console.log('\n[2] CSS-mode plan');
  const planCss = await internals.buildDependencyPlan({
    componentIds: ['button'],
    installRoot: '/tmp/test',
    sourceProvider: localProvider,
    cssMode: true,
  });
  check('Plan includes _eui-vars.scss source for css mode', planCss.files.some((f) => f.srcRelative === 'components/_eui-vars.scss'));

  console.log('\n[3] Apply plan in SCSS mode rewrites @use path');
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'fluxo-styles-test-'));
  try {
    const config = internals.createDefaultConfig('./');
    const applyResult = await internals.applyDependencyPlan({
      plan: planScss,
      installRootAbs: tmp,
      config,
      version: 'test',
    });
    check('Wrote files', applyResult.written.length > 0);
    const buttonScss = await fs.readFile(path.join(tmp, 'button', 'Button.scss'), 'utf-8');
    check("Button.scss has @use '../eui-vars'", /@use\s+['"]\.\.\/eui-vars['"]/.test(buttonScss));
    const euiVars = await fs.readFile(path.join(tmp, '_eui-vars.scss'), 'utf-8');
    check('Vendored _eui-vars.scss exists at install root (breakpoints + mixin)', euiVars.includes('$bp-') && euiVars.includes('eui-thin-scrollbar'));
    const euiBase = await fs.readFile(path.join(tmp, 'eui-base.scss'), 'utf-8');
    check('Vendored eui-base.scss exists at install root (base tokens)', euiBase.includes('--eui-bg') && euiBase.includes('mode-dark'));
    const buttonScssImportsEuiBase = buttonScss.length >= 0;
    const buttonTsx = await fs.readFile(path.join(tmp, 'button', 'Button.tsx'), 'utf-8');
    check("Button.tsx imports vendored '../eui-base.scss'", /import\s+['"]\.\.\/eui-base\.scss['"]/.test(buttonTsx));
    void buttonScssImportsEuiBase;
    const indexCss = await fs.readFile(path.join(tmp, 'styles', 'index.css'), 'utf-8');
    check('Vendored styles/index.css aggregates themes', indexCss.includes('base-theme.css') && indexCss.includes('theme-blue.css'));
    const propsJsonExists = await fs.access(path.join(tmp, 'button', 'Button.props.json')).then(() => true).catch(() => false);
    check('Button.props.json NOT vendored', !propsJsonExists);
  } finally {
    await fs.rm(tmp, { recursive: true, force: true });
  }

  console.log('\n[4] Apply plan in CSS mode compiles SCSS to CSS, rewrites tsx imports');
  const tmp2 = await fs.mkdtemp(path.join(os.tmpdir(), 'fluxo-styles-test-css-'));
  try {
    const config = internals.createDefaultConfig('./');
    const applyResult = await internals.applyDependencyPlan({
      plan: planCss,
      installRootAbs: tmp2,
      config,
      version: 'test',
      cssMode: true,
    });
    check('Wrote files in css mode', applyResult.written.length > 0);
    const buttonScssExists = await fs.access(path.join(tmp2, 'button', 'Button.scss')).then(() => true).catch(() => false);
    check('Button.scss NOT written in css mode', !buttonScssExists);
    const buttonCss = await fs.readFile(path.join(tmp2, 'button', 'Button.css'), 'utf-8');
    check('Button.css written in css mode', buttonCss.length > 0);
    check('Button.css does not contain @use', !buttonCss.includes('@use'));
    check('Button.css contains expanded selectors', buttonCss.includes('.eui-button'));
    const buttonTsx = await fs.readFile(path.join(tmp2, 'button', 'Button.tsx'), 'utf-8');
    check('Button.tsx import rewritten to .css', buttonTsx.includes("'./Button.css'"));
    check('Button.tsx no longer references .scss', !buttonTsx.includes('.scss'));
    check("Button.tsx imports rewritten '../eui-base.css'", /import\s+['"]\.\.\/eui-base\.css['"]/.test(buttonTsx));
    const euiBaseCss = await fs.readFile(path.join(tmp2, 'eui-base.css'), 'utf-8');
    check('eui-base.css written at install root with base tokens', euiBaseCss.includes('--eui-bg'));
  } finally {
    await fs.rm(tmp2, { recursive: true, force: true });
  }

  console.log(`\nResult: ${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
