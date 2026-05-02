import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const SCAN_SKIP_DIRS = new Set([
  'node_modules', 'dist', 'build', 'out', '.git', '.next', '.turbo',
  '.cache', '.parcel-cache', 'coverage', '.svelte-kit', '.nuxt',
  '.vercel', '.idea', '.vscode',
]);
const MAX_SCAN_DEPTH = 6;
const MAX_SCAN_ENTRIES = 5000;

async function findProjectRoot(startDir) {
  let current = path.resolve(startDir);
  const root = path.parse(current).root;
  while (true) {
    try {
      await fs.access(path.join(current, 'package.json'));
      return current;
    } catch {}
    if (current === root) return path.resolve(startDir);
    const parent = path.dirname(current);
    if (parent === current) return path.resolve(startDir);
    current = parent;
  }
}

async function findFirstTsxFile(rootDir) {
  const queue = [{ dir: rootDir, depth: 0 }];
  let scanned = 0;
  while (queue.length) {
    const { dir, depth } = queue.shift();
    if (depth > MAX_SCAN_DEPTH) continue;
    if (scanned >= MAX_SCAN_ENTRIES) return undefined;
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch { continue; }
    for (const entry of entries) {
      scanned++;
      if (scanned >= MAX_SCAN_ENTRIES) return undefined;
      if (entry.isDirectory()) {
        if (SCAN_SKIP_DIRS.has(entry.name)) continue;
        if (entry.name.startsWith('.')) continue;
        queue.push({ dir: path.join(dir, entry.name), depth: depth + 1 });
        continue;
      }
      if (entry.isFile() && entry.name.endsWith('.tsx')) {
        return path.join(dir, entry.name);
      }
    }
  }
  return undefined;
}

async function detectProject(targetPath, cwd) {
  const resolvedTarget = path.resolve(cwd, targetPath);
  const projectRoot = await findProjectRoot(cwd);
  const result = {
    projectRoot, targetPath: resolvedTarget,
    isNpmProject: false, hasTypeScript: false, hasTsxFiles: false,
    tsDetectionMethod: 'none', warnings: [], isSafe: false,
  };

  let packageJson;
  try {
    const packageJsonContent = await fs.readFile(path.join(projectRoot, 'package.json'), 'utf-8');
    packageJson = JSON.parse(packageJsonContent);
    result.packageJsonPath = path.join(projectRoot, 'package.json');
    result.isNpmProject = true;
  } catch {}

  try {
    await fs.access(path.join(projectRoot, 'tsconfig.json'));
    result.tsConfigPath = path.join(projectRoot, 'tsconfig.json');
    result.hasTypeScript = true;
    result.tsDetectionMethod = 'tsconfig';
  } catch {}

  if (!result.hasTypeScript && packageJson) {
    const deps = packageJson.dependencies ?? {};
    const devDeps = packageJson.devDependencies ?? {};
    if (deps.typescript !== undefined || devDeps.typescript !== undefined) {
      result.hasTypeScript = true;
      result.tsDetectionMethod = 'package-json-dep';
    }
  }

  if (!result.hasTypeScript) {
    const tsxFile = await findFirstTsxFile(projectRoot);
    if (tsxFile) {
      result.hasTypeScript = true;
      result.hasTsxFiles = true;
      result.tsxFilePath = tsxFile;
      result.tsDetectionMethod = 'tsx-file';
    }
  } else if (!result.hasTsxFiles) {
    const tsxFile = await findFirstTsxFile(projectRoot);
    if (tsxFile) {
      result.hasTsxFiles = true;
      result.tsxFilePath = tsxFile;
    }
  }

  result.isSafe = result.isNpmProject && result.hasTypeScript;
  return result;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

console.log('Verifying detectProject against fluxo-ui repo...\n');

const detection = await detectProject('./src/components/fluxo-ui', repoRoot);

console.log(JSON.stringify(detection, null, 2));

let passed = 0;
let failed = 0;
function assert(name, cond) {
  if (cond) { console.log(`PASS ${name}`); passed++; }
  else { console.log(`FAIL ${name}`); failed++; }
}

assert('isNpmProject is true', detection.isNpmProject === true);
assert('hasTypeScript is true', detection.hasTypeScript === true);
assert('hasTsxFiles is true', detection.hasTsxFiles === true);
assert('isSafe is true', detection.isSafe === true);
assert('projectRoot is repo root', detection.projectRoot === repoRoot);
assert('targetPath resolves under repo', detection.targetPath.startsWith(repoRoot));
assert('tsDetectionMethod is tsconfig (preferred)', detection.tsDetectionMethod === 'tsconfig');
assert('packageJsonPath set', !!detection.packageJsonPath);
assert('tsConfigPath set', !!detection.tsConfigPath);

console.log(`\nResults: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
