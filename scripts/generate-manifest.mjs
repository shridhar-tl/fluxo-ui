#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const COMPONENTS_DIR = path.join(SRC, 'components');
const HOOKS_DIR = path.join(SRC, 'hooks');
const UTILS_DIR = path.join(SRC, 'utils');
const ASSETS_DIR = path.join(SRC, 'assets');
const TYPES_DIR = path.join(SRC, 'types');
const THEMES_DIR = path.join(SRC, 'themes');
const STYLES_DIR = path.join(SRC, 'styles');
const STORE_DIR = path.join(SRC, 'store');
const NAVIGATION_FILE = path.join(SRC, 'story', 'Navigation.tsx');

const SCHEMA_VERSION = '1.0.0';

const COMPONENT_FILE_EXTENSIONS = new Set(['.tsx', '.ts', '.jsx', '.js', '.scss', '.css', '.svg']);

const SOURCE_FILE_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];

const KNOWN_OPTIONAL_PEERS = new Set(['html2canvas', 'chart.js', 'chart.js/auto', 'react-chartjs-2']);

const PRIVATE_COMPONENT_IDS = new Set([
  'link',
  'icon',
  'editor-core',
  'context',
]);

const toKebab = (input) => {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase();
};

const toPascal = (input) => {
  return input
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (c) => c.toUpperCase());
};

const stripExt = (filename) => {
  const ext = path.extname(filename);
  return ext ? filename.slice(0, -ext.length) : filename;
};

const isSourceFile = (filename) => SOURCE_FILE_EXTENSIONS.includes(path.extname(filename));

async function pathExists(p) {
  try {
    await fs.stat(p);
    return true;
  } catch {
    return false;
  }
}

async function readFileSafe(p) {
  try {
    return await fs.readFile(p, 'utf-8');
  } catch {
    return null;
  }
}

async function listDir(dir) {
  try {
    return await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

async function walkDirFiles(dir, baseDir = dir, out = []) {
  const entries = await listDir(dir);
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkDirFiles(full, baseDir, out);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (!COMPONENT_FILE_EXTENSIONS.has(ext)) continue;
      const rel = path.relative(baseDir, full).split(path.sep).join('/');
      out.push(rel);
    }
  }
  return out;
}

const IMPORT_PATTERNS = [
  /(?:^|\n)\s*import\s+(?:[\s\S]*?from\s+)?['"]([^'"]+)['"];?/g,
  /(?:^|\n)\s*export\s+(?:\*|\{[\s\S]*?\}|type\s+\*|type\s+\{[\s\S]*?\})\s+from\s+['"]([^'"]+)['"];?/g,
  /import\(\s*['"]([^'"]+)['"]\s*\)/g,
];

function extractImportSources(source) {
  const sources = new Set();
  const stripped = source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1');
  for (const pattern of IMPORT_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(stripped)) !== null) {
      const value = match[1];
      if (value) sources.add(value);
    }
  }
  return [...sources];
}

function isRelative(spec) {
  return spec.startsWith('./') || spec.startsWith('../') || spec === '.' || spec === '..';
}

function isSideEffectStyle(spec) {
  return /\.(css|scss|sass|less)$/.test(spec);
}

async function resolveRelativeImport(fromFileAbs, spec) {
  const baseDir = path.dirname(fromFileAbs);
  let target = path.resolve(baseDir, spec);
  if (await pathExists(target)) {
    const stat = await fs.stat(target);
    if (stat.isDirectory()) {
      for (const ext of ['index.ts', 'index.tsx', 'index.js', 'index.jsx']) {
        const idx = path.join(target, ext);
        if (await pathExists(idx)) return idx;
      }
      return target;
    }
    return target;
  }
  for (const ext of SOURCE_FILE_EXTENSIONS) {
    const candidate = target + ext;
    if (await pathExists(candidate)) return candidate;
  }
  for (const ext of ['.scss', '.css', '.json', '.svg']) {
    const candidate = target + ext;
    if (await pathExists(candidate)) return candidate;
  }
  return target;
}

function classifyResolvedPath(absPath) {
  const norm = absPath.split(path.sep).join('/');
  const componentsRoot = COMPONENTS_DIR.split(path.sep).join('/');
  const hooksRoot = HOOKS_DIR.split(path.sep).join('/');
  const utilsRoot = UTILS_DIR.split(path.sep).join('/');
  const assetsRoot = ASSETS_DIR.split(path.sep).join('/');
  const typesRoot = TYPES_DIR.split(path.sep).join('/');
  const themesRoot = THEMES_DIR.split(path.sep).join('/');
  const stylesRoot = STYLES_DIR.split(path.sep).join('/');
  const storeRoot = STORE_DIR.split(path.sep).join('/');

  if (norm.startsWith(componentsRoot + '/') || norm === componentsRoot) {
    const rel = norm.slice(componentsRoot.length + 1);
    if (!rel) return null;
    const segments = rel.split('/');
    const first = segments[0];
    if (segments.length === 1) {
      const baseName = stripExt(first);
      if (!baseName || baseName === 'index') return null;
      return { kind: 'component', id: toKebab(baseName), origin: 'flat' };
    }
    return { kind: 'component', id: toKebab(first), origin: 'directory' };
  }
  if (norm === hooksRoot || norm.startsWith(hooksRoot + '/')) {
    const rel = norm.slice(hooksRoot.length + 1);
    if (!rel) return { kind: 'hook', id: '__index__' };
    const baseName = stripExt(rel.split('/')[0]);
    if (baseName === 'index') return { kind: 'hook', id: '__index__' };
    return { kind: 'hook', id: baseName };
  }
  if (norm === utilsRoot || norm.startsWith(utilsRoot + '/')) {
    const rel = norm.slice(utilsRoot.length + 1);
    if (!rel) return { kind: 'util', id: '__index__' };
    const baseName = stripExt(rel.split('/')[0]);
    if (baseName === 'index') return { kind: 'util', id: '__index__' };
    return { kind: 'util', id: baseName };
  }
  if (norm === assetsRoot || norm.startsWith(assetsRoot + '/')) {
    return { kind: 'asset' };
  }
  if (norm === typesRoot || norm.startsWith(typesRoot + '/')) {
    return { kind: 'shared', id: 'types' };
  }
  if (norm === themesRoot || norm.startsWith(themesRoot + '/')) {
    return { kind: 'shared', id: 'themes' };
  }
  if (norm === stylesRoot || norm.startsWith(stylesRoot + '/')) {
    return { kind: 'shared', id: 'styles' };
  }
  if (norm === storeRoot || norm.startsWith(storeRoot + '/')) {
    return { kind: 'shared', id: 'store' };
  }
  return null;
}

function classifyExternal(spec) {
  if (spec.startsWith('node:')) return { kind: 'builtin', name: spec.slice(5) };
  if (spec.startsWith('@')) {
    const parts = spec.split('/');
    return { kind: 'external', name: parts.slice(0, 2).join('/') };
  }
  const root = spec.split('/')[0];
  return { kind: 'external', name: root };
}

async function discoverComponents() {
  const entries = await listDir(COMPONENTS_DIR);
  const components = [];
  for (const entry of entries) {
    if (entry.name.startsWith('_')) continue;
    if (entry.isDirectory()) {
      const indexFiles = ['index.ts', 'index.tsx', 'index.js', 'index.jsx'];
      let entryFile = null;
      for (const idx of indexFiles) {
        const p = path.join(COMPONENTS_DIR, entry.name, idx);
        if (await pathExists(p)) {
          entryFile = p;
          break;
        }
      }
      if (!entryFile) {
        const dirEntries = await listDir(path.join(COMPONENTS_DIR, entry.name));
        const guessed = dirEntries.find((d) => d.isFile() && /\.(tsx|ts)$/.test(d.name));
        if (guessed) entryFile = path.join(COMPONENTS_DIR, entry.name, guessed.name);
      }
      if (!entryFile) continue;
      const id = toKebab(entry.name);
      const baseName = stripExt(path.basename(entryFile));
      const displayName = baseName === 'index' ? toPascal(entry.name) : toPascal(baseName);
      const files = await walkDirFiles(path.join(COMPONENTS_DIR, entry.name));
      components.push({
        id,
        kind: 'directory',
        dir: entry.name,
        displayName,
        entryFile,
        files: files.sort(),
      });
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      const baseName = stripExt(entry.name);
      if (!isSourceFile(entry.name)) continue;
      if (baseName === 'index') continue;
      const id = toKebab(baseName);
      const displayName = toPascal(baseName);
      const files = [entry.name];
      for (const sibling of entries) {
        if (!sibling.isFile()) continue;
        if (sibling.name === entry.name) continue;
        if (sibling.name.endsWith('.props.json')) continue;
        const sibBase = stripExt(sibling.name);
        const sibExt = path.extname(sibling.name);
        if (!['.scss', '.css'].includes(sibExt)) continue;
        if (sibBase.toLowerCase() === baseName.toLowerCase()) {
          files.push(sibling.name);
        }
      }
      void ext;
      components.push({
        id,
        kind: 'flat',
        dir: null,
        displayName,
        entryFile: path.join(COMPONENTS_DIR, entry.name),
        files: [...new Set(files)].sort(),
      });
    }
  }
  return components.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

async function discoverHooks() {
  const entries = await listDir(HOOKS_DIR);
  const hooks = [];
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!isSourceFile(entry.name)) continue;
    const baseName = stripExt(entry.name);
    if (baseName === 'index') continue;
    hooks.push({
      id: baseName,
      displayName: baseName,
      entryFile: path.join(HOOKS_DIR, entry.name),
      files: [entry.name],
    });
  }
  return hooks.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

async function discoverUtils() {
  const entries = await listDir(UTILS_DIR);
  const utils = [];
  for (const entry of entries) {
    if (entry.isFile() && isSourceFile(entry.name)) {
      const baseName = stripExt(entry.name);
      if (baseName === 'index' || baseName === 'lib') continue;
      utils.push({
        id: baseName,
        displayName: baseName,
        entryFile: path.join(UTILS_DIR, entry.name),
        files: [entry.name],
      });
    }
  }
  return utils.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

async function gatherDependencies(unit, selfComponentId) {
  const deps = {
    components: new Set(),
    hooks: new Set(),
    utils: new Set(),
    shared: new Set(),
    external: new Set(),
    optionalPeers: new Set(),
  };

  let scanFiles;
  if (unit.kind === 'directory') {
    const dirAbs = path.join(COMPONENTS_DIR, unit.dir);
    const files = await walkDirFiles(dirAbs);
    scanFiles = files.filter(isSourceFile).map((rel) => path.join(dirAbs, rel));
  } else {
    scanFiles = [unit.entryFile];
  }

  for (const fileAbs of scanFiles) {
    const source = await readFileSafe(fileAbs);
    if (!source) continue;
    const specs = extractImportSources(source);
    for (const spec of specs) {
      if (isRelative(spec)) {
        const resolved = await resolveRelativeImport(fileAbs, spec);
        const classification = classifyResolvedPath(resolved);
        if (!classification) continue;
        if (classification.kind === 'component') {
          if (classification.id && classification.id !== selfComponentId) {
            deps.components.add(classification.id);
          }
        } else if (classification.kind === 'hook') {
          if (classification.id !== '__index__') deps.hooks.add(classification.id);
        } else if (classification.kind === 'util') {
          if (classification.id !== '__index__') deps.utils.add(classification.id);
        } else if (classification.kind === 'shared') {
          deps.shared.add(classification.id);
        }
      } else {
        if (isSideEffectStyle(spec)) continue;
        const ext = classifyExternal(spec);
        if (ext.kind === 'external') {
          deps.external.add(ext.name);
          if (KNOWN_OPTIONAL_PEERS.has(spec) || KNOWN_OPTIONAL_PEERS.has(ext.name)) {
            deps.optionalPeers.add(ext.name);
          }
        }
      }
    }
  }

  return {
    components: [...deps.components].sort(),
    hooks: [...deps.hooks].sort(),
    utils: [...deps.utils].sort(),
    shared: [...deps.shared].sort(),
    external: [...deps.external].sort(),
    optionalPeers: [...deps.optionalPeers].sort(),
  };
}

const NAV_LABEL_TO_PATH_RE = /\{\s*label:\s*'([^']+)',\s*path:\s*'([^']+)'\s*\}/g;
const NAV_SECTION_RE = /title:\s*'([^']+)',\s*key:\s*'([^']+)',\s*items:\s*\[([\s\S]*?)\]/g;

async function buildCategoryMap() {
  const navSource = await readFileSafe(NAVIGATION_FILE);
  if (!navSource) return new Map();
  const map = new Map();
  let match;
  NAV_SECTION_RE.lastIndex = 0;
  while ((match = NAV_SECTION_RE.exec(navSource)) !== null) {
    const sectionTitle = match[1];
    const sectionBody = match[3];
    const itemRe = new RegExp(NAV_LABEL_TO_PATH_RE.source, 'g');
    let item;
    while ((item = itemRe.exec(sectionBody)) !== null) {
      const label = item[1];
      const navPath = item[2];
      const slug = navPath.split('/').pop();
      if (!slug) continue;
      map.set(slug.toLowerCase(), { category: sectionTitle, label });
    }
  }
  return map;
}

const STATIC_CATEGORY_OVERRIDES = {
  link: { category: 'Internal', label: 'Link', private: true },
  icon: { category: 'Internal', label: 'Icon', private: true },
  'editor-core': { category: 'Internal', label: 'Editor Core', private: true },
  context: { category: 'Internal', label: 'Theme Context', private: true },
};

const COMPONENT_ID_TO_NAV_SLUG = {
  'date-range': 'daterangepicker',
  fab: 'fab-speed-dial',
  'speed-dial': 'fab-speed-dial',
};

function findCategoryFor(componentId, navMap) {
  if (STATIC_CATEGORY_OVERRIDES[componentId]) {
    return STATIC_CATEGORY_OVERRIDES[componentId];
  }
  const direct = navMap.get(componentId.toLowerCase());
  if (direct) return { ...direct, private: false };
  const stripped = componentId.replace(/-/g, '').toLowerCase();
  const strippedMatch = navMap.get(stripped);
  if (strippedMatch) return { ...strippedMatch, private: false };
  const alias = COMPONENT_ID_TO_NAV_SLUG[componentId];
  if (alias) {
    const aliasMatch = navMap.get(alias.toLowerCase());
    if (aliasMatch) return { ...aliasMatch, private: false };
  }
  for (const [slug, entry] of navMap.entries()) {
    if (slug.replace(/-/g, '') === stripped) {
      return { ...entry, private: false };
    }
  }
  return { category: 'Misc', label: toPascal(componentId), private: false };
}

async function main() {
  const components = await discoverComponents();
  const hooks = await discoverHooks();
  const utils = await discoverUtils();
  const navMap = await buildCategoryMap();

  const componentEntries = [];
  for (const c of components) {
    const deps = await gatherDependencies(c, c.id);
    const meta = findCategoryFor(c.id, navMap);
    const isPrivate = meta.private || PRIVATE_COMPONENT_IDS.has(c.id);
    componentEntries.push({
      id: c.id,
      name: c.displayName,
      kind: c.kind,
      sourcePath: c.kind === 'directory' ? `components/${c.dir}` : `components/${path.basename(c.entryFile)}`,
      entryFile: c.kind === 'directory'
        ? `components/${c.dir}/${path.basename(c.entryFile)}`
        : `components/${path.basename(c.entryFile)}`,
      files: c.files,
      category: meta.category,
      label: meta.label,
      description: '',
      private: isPrivate,
      dependencies: deps,
    });
  }

  const hookEntries = [];
  for (const h of hooks) {
    const deps = await gatherDependencies(
      { kind: 'flat', entryFile: h.entryFile, scope: 'hook' },
      null,
    );
    hookEntries.push({
      id: h.id,
      name: h.displayName,
      sourcePath: `hooks/${path.basename(h.entryFile)}`,
      files: h.files,
      dependencies: deps,
    });
  }

  const utilEntries = [];
  for (const u of utils) {
    const deps = await gatherDependencies(
      { kind: 'flat', entryFile: u.entryFile, scope: 'util' },
      null,
    );
    utilEntries.push({
      id: u.id,
      name: u.displayName,
      sourcePath: `utils/${path.basename(u.entryFile)}`,
      files: u.files,
      dependencies: deps,
    });
  }

  const data = {
    schemaVersion: SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    sourceRoot: 'src',
    components: componentEntries,
    hooks: hookEntries,
    utils: utilEntries,
    shared: [
      { id: 'types', sourcePath: 'types', files: ['types/index.ts'] },
      { id: 'themes', sourcePath: 'themes', files: ['themes/index.ts'] },
      { id: 'store', sourcePath: 'store', files: [] },
    ],
  };

  const outFile = path.join(SRC, 'cli', 'manifest-data.json');
  await fs.writeFile(outFile, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  const summary = {
    components: componentEntries.length,
    hooks: hookEntries.length,
    utils: utilEntries.length,
    output: path.relative(ROOT, outFile),
  };
  console.log('[generate-manifest]', JSON.stringify(summary));
}

main().catch((err) => {
  console.error('[generate-manifest] failed:', err);
  process.exit(1);
});
