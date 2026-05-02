#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const MANIFEST_FILE = path.join(ROOT, 'src', 'cli', 'manifest-data.json');

let pass = 0;
let fail = 0;
const failures = [];

function check(label, condition, detail) {
  if (condition) {
    pass++;
    console.log(`  PASS  ${label}`);
  } else {
    fail++;
    failures.push(`${label}${detail ? ` — ${detail}` : ''}`);
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ''}`);
  }
}

function indexById(list) {
  const map = new Map();
  for (const item of list) map.set(item.id, item);
  return map;
}

function resolveClosure(componentIds, byCmp, byHook, byUtil) {
  const visitedComponents = new Set();
  const visitedHooks = new Set();
  const visitedUtils = new Set();
  const visitedShared = new Set();
  const externals = new Set();
  const optionalPeers = new Set();
  const unknown = new Set();
  const queue = [];
  for (const id of componentIds) {
    if (!byCmp.has(id)) unknown.add(id);
    else queue.push(id);
  }
  while (queue.length > 0) {
    const id = queue.shift();
    if (visitedComponents.has(id)) continue;
    const cmp = byCmp.get(id);
    if (!cmp) {
      unknown.add(id);
      continue;
    }
    visitedComponents.add(id);
    for (const c of cmp.dependencies.components) if (!visitedComponents.has(c)) queue.push(c);
    for (const h of cmp.dependencies.hooks) {
      if (visitedHooks.has(h)) continue;
      visitedHooks.add(h);
      const hook = byHook.get(h);
      if (!hook) continue;
      for (const c of hook.dependencies.components) if (!visitedComponents.has(c)) queue.push(c);
      for (const e of hook.dependencies.external) externals.add(e);
      for (const p of hook.dependencies.optionalPeers) optionalPeers.add(p);
      for (const u of hook.dependencies.utils) visitedUtils.add(u);
      for (const s of hook.dependencies.shared) visitedShared.add(s);
    }
    for (const u of cmp.dependencies.utils) {
      if (visitedUtils.has(u)) continue;
      visitedUtils.add(u);
      const util = byUtil.get(u);
      if (!util) continue;
      for (const c of util.dependencies.components) if (!visitedComponents.has(c)) queue.push(c);
      for (const e of util.dependencies.external) externals.add(e);
    }
    for (const s of cmp.dependencies.shared) visitedShared.add(s);
    for (const e of cmp.dependencies.external) externals.add(e);
    for (const p of cmp.dependencies.optionalPeers) optionalPeers.add(p);
  }
  return {
    components: [...visitedComponents].sort(),
    hooks: [...visitedHooks].sort(),
    utils: [...visitedUtils].sort(),
    shared: [...visitedShared].sort(),
    externalPackages: [...externals].sort(),
    optionalPeers: [...optionalPeers].sort(),
    unknown: [...unknown].sort(),
  };
}

async function main() {
  console.log('Verifying manifest data...\n');
  const exists = await fs
    .stat(MANIFEST_FILE)
    .then(() => true)
    .catch(() => false);
  check('manifest JSON exists at src/cli/manifest-data.json', exists);
  if (!exists) {
    console.log('\nRun `node scripts/generate-manifest.mjs` to produce it.');
    process.exit(1);
  }

  const raw = await fs.readFile(MANIFEST_FILE, 'utf-8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    check('manifest JSON parses', false, err.message);
    process.exit(1);
  }
  check('manifest JSON parses', true);

  check('schemaVersion is "1.0.0"', data.schemaVersion === '1.0.0', `got "${data.schemaVersion}"`);
  check('generatedAt is ISO timestamp', typeof data.generatedAt === 'string' && /T.*Z/.test(data.generatedAt));
  check('sourceRoot is "src"', data.sourceRoot === 'src');
  check('components is array', Array.isArray(data.components));
  check('hooks is array', Array.isArray(data.hooks));
  check('utils is array', Array.isArray(data.utils));

  check('discovered at least 50 components', data.components.length >= 50, `got ${data.components.length}`);
  check('discovered at least 5 hooks', data.hooks.length >= 5, `got ${data.hooks.length}`);
  check('discovered at least 3 utils', data.utils.length >= 3, `got ${data.utils.length}`);

  const byId = new Map();
  let dupId = null;
  for (const c of data.components) {
    if (byId.has(c.id)) dupId = c.id;
    byId.set(c.id, c);
  }
  check('all component ids are unique', dupId === null, dupId ? `duplicate id ${dupId}` : '');

  const button = byId.get('button');
  check('Button component is present', !!button);
  if (button) {
    check('Button name is "Button"', button.name === 'Button');
    check('Button kind is "flat"', button.kind === 'flat');
    check('Button category is "Actions & Interaction"', button.category === 'Actions & Interaction');
    check('Button is not private', button.private === false);
    check(
      'Button declares confirm-popover dependency',
      button.dependencies.components.includes('confirm-popover')
    );
    check('Button declares tooltip dependency', button.dependencies.components.includes('tooltip'));
    check('Button declares link dependency', button.dependencies.components.includes('link'));
    check('Button externals include classnames', button.dependencies.external.includes('classnames'));
    check('Button externals include react', button.dependencies.external.includes('react'));
    check('Button does not depend on itself', !button.dependencies.components.includes('button'));
    check('Button has no duplicate files', button.files.length === new Set(button.files).size);
    check('Button.tsx is in the file list', button.files.includes('Button.tsx'));
    check('Button.scss is in the file list', button.files.includes('Button.scss'));
  }

  const tooltip = byId.get('tooltip');
  check('Tooltip is a directory component', !!tooltip && tooltip.kind === 'directory');
  if (tooltip) {
    check('Tooltip externals include react-dom', tooltip.dependencies.external.includes('react-dom'));
    check(
      'Tooltip files include tooltip-api.ts',
      tooltip.files.some((f) => f === 'tooltip-api.ts')
    );
  }

  const confirmPopover = byId.get('confirm-popover');
  check('confirm-popover declares button + icon deps', !!confirmPopover && confirmPopover.dependencies.components.includes('button') && confirmPopover.dependencies.components.includes('icon'));
  check(
    'confirm-popover declares useClickOutside hook',
    !!confirmPopover && confirmPopover.dependencies.hooks.includes('useClickOutside')
  );

  const link = byId.get('link');
  check('link is private', !!link && link.private === true);
  check('link is in Internal category', !!link && link.category === 'Internal');

  const ganttChart = byId.get('gantt-chart');
  check(
    'gantt-chart depends on splitter',
    !!ganttChart && ganttChart.dependencies.components.includes('splitter')
  );
  check(
    'gantt-chart category is Charts & Boards',
    !!ganttChart && ganttChart.category === 'Charts & Boards'
  );

  const reportBuilder = byId.get('report-builder');
  check('report-builder is present', !!reportBuilder);
  if (reportBuilder) {
    check('report-builder is in Report Builder category', reportBuilder.category === 'Report Builder');
  }

  const hookIds = new Set(data.hooks.map((h) => h.id));
  check('useClickOutside hook is present', hookIds.has('useClickOutside'));
  check('useDebounce hook is present', hookIds.has('useDebounce'));
  check('useMobile hook is present', hookIds.has('useMobile'));

  const utilIds = new Set(data.utils.map((u) => u.id));
  check('common-fns util is present', utilIds.has('common-fns'));
  check('field-label util is present', utilIds.has('field-label'));

  for (const c of data.components) {
    if (!c.dependencies) {
      check(`component ${c.id} has dependencies object`, false);
      continue;
    }
    for (const dep of c.dependencies.components) {
      if (!byId.has(dep)) {
        check(`component ${c.id} -> component ${dep} resolves`, false);
        break;
      }
    }
    for (const hook of c.dependencies.hooks) {
      if (!hookIds.has(hook)) {
        check(`component ${c.id} -> hook ${hook} resolves`, false);
        break;
      }
    }
    for (const util of c.dependencies.utils) {
      if (!utilIds.has(util)) {
        check(`component ${c.id} -> util ${util} resolves`, false);
        break;
      }
    }
  }
  check('all component->component edges resolve', true);
  check('all component->hook edges resolve', true);
  check('all component->util edges resolve', true);

  const byHook = indexById(data.hooks);
  const byUtil = indexById(data.utils);

  const closure = resolveClosure(['button'], byId, byHook, byUtil);
  check(
    'closure(button) pulls in confirm-popover transitively',
    closure.components.includes('confirm-popover')
  );
  check('closure(button) pulls in icon transitively', closure.components.includes('icon'));
  check('closure(button) hooks include useClickOutside', closure.hooks.includes('useClickOutside'));
  check('closure(button) external includes react-dom', closure.externalPackages.includes('react-dom'));
  check('closure(button) has no unknown ids', closure.unknown.length === 0, JSON.stringify(closure.unknown));

  const closureKb = resolveClosure(['kanban-board'], byId, byHook, byUtil);
  check(
    'closure(kanban-board) includes drag-drop',
    closureKb.components.includes('drag-drop')
  );

  const unknownClosure = resolveClosure(['this-is-not-a-component'], byId, byHook, byUtil);
  check(
    'unknown component id is reported in closure.unknown',
    unknownClosure.unknown.includes('this-is-not-a-component')
  );
  check(
    'unknown component id does not appear in closure.components',
    !unknownClosure.components.includes('this-is-not-a-component')
  );

  console.log('');
  console.log(`Result: ${pass} passed, ${fail} failed`);
  if (fail > 0) {
    console.log('\nFailures:');
    for (const f of failures) console.log(`  - ${f}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('verify-manifest failed:', err);
  process.exit(1);
});
