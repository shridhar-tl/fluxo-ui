import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const CONFIG_SCHEMA_VERSION = '1.0.0';
const DEFAULT_CONFIG_FILENAME = 'fluxo-ui.config.json';
const LEGACY_CONFIG_FILENAMES = ['fluxo-ui.json'];
const ALL_CONFIG_FILENAMES = [DEFAULT_CONFIG_FILENAME, ...LEGACY_CONFIG_FILENAMES];

function normalizeRelativePath(value) {
  return value.split(path.sep).join('/').replace(/\/+$/, '') || './';
}

function toRelativeFromRoot(projectRoot, targetPath) {
  const abs = path.isAbsolute(targetPath) ? targetPath : path.resolve(projectRoot, targetPath);
  const rel = path.relative(projectRoot, abs);
  if (!rel || rel.startsWith('..')) {
    return normalizeRelativePath(rel || '.');
  }
  return normalizeRelativePath('./' + rel);
}

function normalizeNewlines(buf) {
  if (buf.indexOf(0x0d) === -1) return buf;
  const out = [];
  for (let i = 0; i < buf.length; i++) {
    const byte = buf[i];
    if (byte === 0x0d) {
      const next = buf[i + 1];
      if (next === 0x0a) continue;
      out.push(0x0a);
      continue;
    }
    out.push(byte);
  }
  return Buffer.from(out);
}

async function computeFileChecksum(filePath) {
  const buf = await fs.readFile(filePath);
  return createHash('sha256').update(normalizeNewlines(buf)).digest('hex');
}

function rollupFileChecksums(files) {
  const sorted = [...files].sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  const hash = createHash('sha256');
  for (const e of sorted) {
    hash.update(e.path);
    hash.update(' ');
    hash.update(e.checksum);
    hash.update(' ');
  }
  return hash.digest('hex');
}

async function computeDirectoryFileChecksums(rootDir) {
  const result = [];
  async function walk(currentDir) {
    let entries;
    try {
      entries = await fs.readdir(currentDir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const abs = path.join(currentDir, entry.name);
      if (entry.isDirectory()) await walk(abs);
      else if (entry.isFile()) {
        const rel = path.relative(rootDir, abs).split(path.sep).join('/');
        result.push({ path: rel, checksum: await computeFileChecksum(abs) });
      }
    }
  }
  await walk(rootDir);
  result.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  return result;
}

function createDefaultConfig(targetPath) {
  return {
    version: CONFIG_SCHEMA_VERSION,
    path: normalizeRelativePath(targetPath),
    components: {},
    lastUpdated: new Date().toISOString(),
  };
}

function validateConfigShape(value) {
  if (!value || typeof value !== 'object') return false;
  const cfg = value;
  if (typeof cfg.version !== 'string') return false;
  if (typeof cfg.path !== 'string') return false;
  if (typeof cfg.lastUpdated !== 'string') return false;
  if (!cfg.components || typeof cfg.components !== 'object') return false;
  for (const [, entry] of Object.entries(cfg.components)) {
    if (!entry || typeof entry !== 'object') return false;
    if (typeof entry.name !== 'string') return false;
    if (typeof entry.version !== 'string') return false;
    if (typeof entry.installedAt !== 'string') return false;
    if (entry.checksum !== undefined && typeof entry.checksum !== 'string') return false;
    if (entry.files !== undefined) {
      if (!Array.isArray(entry.files)) return false;
      for (const f of entry.files) {
        if (typeof f.path !== 'string' || typeof f.checksum !== 'string') return false;
      }
    }
  }
  return true;
}

async function findExistingConfigFile(projectRoot) {
  for (const filename of ALL_CONFIG_FILENAMES) {
    const candidate = path.join(projectRoot, filename);
    try {
      const stat = await fs.stat(candidate);
      if (stat.isFile()) return candidate;
    } catch {
      continue;
    }
  }
  return null;
}

async function readConfig(projectRoot) {
  const filePath = await findExistingConfigFile(projectRoot);
  if (!filePath) return null;
  const raw = await fs.readFile(filePath, 'utf-8');
  const parsed = JSON.parse(raw);
  if (parsed.components && typeof parsed.components === 'object') {
    for (const [, entry] of Object.entries(parsed.components)) {
      if (!Array.isArray(entry.files)) entry.files = [];
      if (typeof entry.checksum !== 'string') entry.checksum = '';
    }
  }
  if (!validateConfigShape(parsed)) throw new Error(`Invalid config at ${filePath}`);
  return { config: parsed, filePath };
}

function sortConfigForOutput(config) {
  const sortedComponents = {};
  for (const id of Object.keys(config.components).sort()) {
    const entry = config.components[id];
    sortedComponents[id] = {
      name: entry.name,
      version: entry.version,
      checksum: entry.checksum,
      files: [...entry.files].sort((a, b) => (a.path < b.path ? -1 : 1)),
      installedAt: entry.installedAt,
    };
  }
  return {
    ...(config.$schema ? { $schema: config.$schema } : {}),
    version: config.version,
    path: normalizeRelativePath(config.path),
    components: sortedComponents,
    lastUpdated: config.lastUpdated,
  };
}

async function writeConfig(projectRoot, config, filePath) {
  const target = filePath ?? (await findExistingConfigFile(projectRoot)) ?? path.join(projectRoot, DEFAULT_CONFIG_FILENAME);
  await fs.mkdir(path.dirname(target), { recursive: true });
  const serialized = JSON.stringify(sortConfigForOutput(config), null, 2) + '\n';
  const tmp = target + '.tmp-' + process.pid + '-' + Date.now();
  await fs.writeFile(tmp, serialized, 'utf-8');
  await fs.rename(tmp, target);
  return target;
}

async function ensureConfig(projectRoot, targetPath) {
  const existing = await readConfig(projectRoot);
  if (existing) return { config: existing.config, filePath: existing.filePath, created: false };
  const config = createDefaultConfig(toRelativeFromRoot(projectRoot, targetPath));
  const filePath = await writeConfig(projectRoot, config);
  return { config, filePath, created: true };
}

function setInstalledComponent(config, componentId, entry) {
  const installedAt = entry.installedAt ?? new Date().toISOString();
  const files = [...entry.files].sort((a, b) => (a.path < b.path ? -1 : 1));
  const checksum = entry.checksum ?? rollupFileChecksums(files);
  return {
    ...config,
    components: {
      ...config.components,
      [componentId]: { name: entry.name, version: entry.version, checksum, files, installedAt },
    },
    lastUpdated: new Date().toISOString(),
  };
}

function removeInstalledComponent(config, componentId) {
  if (!config.components[componentId]) return config;
  const next = { ...config.components };
  delete next[componentId];
  return { ...config, components: next, lastUpdated: new Date().toISOString() };
}

function resolveComponentDir(projectRoot, config, componentId) {
  return path.join(path.resolve(projectRoot, config.path), componentId);
}

async function detectComponentDrift(projectRoot, config, componentId) {
  const entry = config.components[componentId];
  if (!entry) return { id: componentId, modifiedFiles: [], missingFiles: [], addedFiles: [], isModified: false };
  const componentDir = resolveComponentDir(projectRoot, config, componentId);
  const expectedByPath = new Map(entry.files.map((f) => [f.path, f.checksum]));
  const modifiedFiles = [];
  const missingFiles = [];
  const addedFiles = [];
  let onDisk = [];
  let dirExists = true;
  try { await fs.access(componentDir); } catch { dirExists = false; }
  if (dirExists) onDisk = await computeDirectoryFileChecksums(componentDir);
  const onDiskByPath = new Map(onDisk.map((f) => [f.path, f.checksum]));
  for (const [relPath, expected] of expectedByPath.entries()) {
    const actual = onDiskByPath.get(relPath);
    if (actual === undefined) missingFiles.push(relPath);
    else if (actual !== expected) modifiedFiles.push(relPath);
  }
  for (const f of onDisk) if (!expectedByPath.has(f.path)) addedFiles.push(f.path);
  return {
    id: componentId,
    modifiedFiles: modifiedFiles.sort(),
    missingFiles: missingFiles.sort(),
    addedFiles: addedFiles.sort(),
    isModified: modifiedFiles.length + missingFiles.length + addedFiles.length > 0,
  };
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let passed = 0;
let failed = 0;
function assert(name, cond) {
  if (cond) { console.log(`PASS ${name}`); passed++; }
  else { console.log(`FAIL ${name}`); failed++; }
}

async function main() {
  const sandbox = await fs.mkdtemp(path.join(os.tmpdir(), 'fluxo-config-test-'));
  try {
    const projectRoot = sandbox;
    await fs.writeFile(path.join(projectRoot, 'package.json'), JSON.stringify({ name: 'sandbox', version: '1.0.0' }), 'utf-8');

    const targetPath = './src/components/fluxo-ui';
    const installRoot = path.resolve(projectRoot, targetPath);
    await fs.mkdir(installRoot, { recursive: true });

    // Test 1: ensureConfig creates new config
    const ensured1 = await ensureConfig(projectRoot, targetPath);
    assert('ensureConfig creates new config', ensured1.created === true);
    assert('config file is at default name', path.basename(ensured1.filePath) === DEFAULT_CONFIG_FILENAME);
    assert('config has expected schema version', ensured1.config.version === CONFIG_SCHEMA_VERSION);
    assert('config path is normalized to forward slashes', ensured1.config.path === './src/components/fluxo-ui');
    assert('components map is empty', Object.keys(ensured1.config.components).length === 0);

    // Test 2: ensureConfig is idempotent (loads existing)
    const ensured2 = await ensureConfig(projectRoot, targetPath);
    assert('ensureConfig is idempotent', ensured2.created === false);
    assert('idempotent ensureConfig returns same path', ensured2.filePath === ensured1.filePath);

    // Test 3: write a component file and record it
    const buttonDir = path.join(installRoot, 'button');
    await fs.mkdir(buttonDir, { recursive: true });
    const buttonTsxPath = path.join(buttonDir, 'Button.tsx');
    const buttonScssPath = path.join(buttonDir, 'Button.scss');
    await fs.writeFile(buttonTsxPath, "export const Button = () => null;\n", 'utf-8');
    await fs.writeFile(buttonScssPath, ".eui-button { color: red; }\n", 'utf-8');

    const tsxChecksum = await computeFileChecksum(buttonTsxPath);
    const scssChecksum = await computeFileChecksum(buttonScssPath);
    const files = [
      { path: 'Button.tsx', checksum: tsxChecksum },
      { path: 'Button.scss', checksum: scssChecksum },
    ];
    let config = setInstalledComponent(ensured2.config, 'button', { name: 'Button', version: '0.4.1', files });
    await writeConfig(projectRoot, config, ensured2.filePath);

    // Test 4: re-read config and verify it round-trips
    const loaded = await readConfig(projectRoot);
    assert('config can be re-read', loaded !== null);
    assert('config has button component', !!loaded.config.components.button);
    assert('button has 2 files', loaded.config.components.button.files.length === 2);
    assert('button has rollup checksum', typeof loaded.config.components.button.checksum === 'string' && loaded.config.components.button.checksum.length > 0);
    assert('checksum is sha256 (64 hex chars)', /^[0-9a-f]{64}$/.test(loaded.config.components.button.checksum));

    // Test 5: drift detection on unmodified component
    let drift = await detectComponentDrift(projectRoot, loaded.config, 'button');
    assert('unmodified component has no drift', drift.isModified === false);

    // Test 6: modify a file -> drift detected as modified
    await fs.writeFile(buttonTsxPath, "export const Button = () => 'hi';\n", 'utf-8');
    drift = await detectComponentDrift(projectRoot, loaded.config, 'button');
    assert('modified file is detected', drift.modifiedFiles.includes('Button.tsx'));
    assert('drift isModified true', drift.isModified === true);

    // Test 7: delete a file -> missing file detected
    await fs.unlink(buttonScssPath);
    drift = await detectComponentDrift(projectRoot, loaded.config, 'button');
    assert('missing file is detected', drift.missingFiles.includes('Button.scss'));

    // Test 8: add a new file -> added file detected
    const extraPath = path.join(buttonDir, 'Extra.ts');
    await fs.writeFile(extraPath, "export const extra = 1;\n", 'utf-8');
    drift = await detectComponentDrift(projectRoot, loaded.config, 'button');
    assert('added file is detected', drift.addedFiles.includes('Extra.ts'));

    // Test 9: remove component from config
    config = removeInstalledComponent(loaded.config, 'button');
    assert('removed component absent', !config.components.button);

    // Test 10: detect legacy filename
    await fs.unlink(ensured1.filePath);
    const legacyPath = path.join(projectRoot, 'fluxo-ui.json');
    await fs.writeFile(legacyPath, JSON.stringify(createDefaultConfig(targetPath), null, 2), 'utf-8');
    const loadedLegacy = await readConfig(projectRoot);
    assert('legacy fluxo-ui.json is detected', loadedLegacy !== null);
    assert('legacy file path matches', loadedLegacy.filePath === legacyPath);

    // Test 11: writeConfig preserves the existing file location
    await writeConfig(projectRoot, loadedLegacy.config);
    const stillLegacy = await readConfig(projectRoot);
    assert('writeConfig preserved legacy filename', stillLegacy.filePath === legacyPath);

    // Test 12: invalid JSON throws
    await fs.writeFile(legacyPath, '{ not valid json', 'utf-8');
    let threw = false;
    try { await readConfig(projectRoot); } catch { threw = true; }
    assert('invalid JSON config throws', threw);

    // Test 13: malformed shape throws
    await fs.writeFile(legacyPath, JSON.stringify({ version: 1, path: 'x', components: {}, lastUpdated: 'now' }), 'utf-8');
    threw = false;
    try { await readConfig(projectRoot); } catch { threw = true; }
    assert('non-string version throws', threw);
  } finally {
    try { await fs.rm(sandbox, { recursive: true, force: true }); } catch {}
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
