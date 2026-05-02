import { promises as fs } from 'fs';
import path from 'path';

export interface ProjectDetectionResult {
  projectRoot: string;
  targetPath: string;
  isNpmProject: boolean;
  hasTypeScript: boolean;
  hasTsxFiles: boolean;
  tsDetectionMethod: 'tsconfig' | 'package-json-dep' | 'tsx-file' | 'none';
  tsConfigPath?: string;
  packageJsonPath?: string;
  tsxFilePath?: string;
  warnings: string[];
  isSafe: boolean;
}

const SCAN_SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  'build',
  'out',
  '.git',
  '.next',
  '.turbo',
  '.cache',
  '.parcel-cache',
  'coverage',
  '.svelte-kit',
  '.nuxt',
  '.vercel',
  '.idea',
  '.vscode',
]);

const MAX_SCAN_DEPTH = 6;
const MAX_SCAN_ENTRIES = 5000;

export async function findProjectRoot(startDir: string): Promise<string> {
  let current = path.resolve(startDir);
  const root = path.parse(current).root;

  while (true) {
    try {
      await fs.access(path.join(current, 'package.json'));
      return current;
    } catch {
      // not here
    }
    if (current === root) {
      return path.resolve(startDir);
    }
    const parent = path.dirname(current);
    if (parent === current) {
      return path.resolve(startDir);
    }
    current = parent;
  }
}

async function findFirstTsxFile(rootDir: string): Promise<string | undefined> {
  const queue: { dir: string; depth: number }[] = [{ dir: rootDir, depth: 0 }];
  let scanned = 0;

  while (queue.length > 0) {
    const { dir, depth } = queue.shift()!;
    if (depth > MAX_SCAN_DEPTH) continue;
    if (scanned >= MAX_SCAN_ENTRIES) return undefined;

    let entries: import('fs').Dirent[];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      continue;
    }

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

export async function detectProject(
  targetPath: string,
  cwd: string = process.cwd()
): Promise<ProjectDetectionResult> {
  const resolvedTarget = path.resolve(cwd, targetPath);
  const projectRoot = await findProjectRoot(cwd);

  const result: ProjectDetectionResult = {
    projectRoot,
    targetPath: resolvedTarget,
    isNpmProject: false,
    hasTypeScript: false,
    hasTsxFiles: false,
    tsDetectionMethod: 'none',
    warnings: [],
    isSafe: false,
  };

  const packageJsonPath = path.join(projectRoot, 'package.json');
  let packageJson: Record<string, unknown> | undefined;
  try {
    const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
    packageJson = JSON.parse(packageJsonContent) as Record<string, unknown>;
    result.packageJsonPath = packageJsonPath;
    result.isNpmProject = true;
  } catch {
    result.warnings.push(
      `No package.json found at project root (${projectRoot}). Target directory is not part of an npm project.`
    );
  }

  const tsConfigPath = path.join(projectRoot, 'tsconfig.json');
  try {
    await fs.access(tsConfigPath);
    result.tsConfigPath = tsConfigPath;
    result.hasTypeScript = true;
    result.tsDetectionMethod = 'tsconfig';
  } catch {
    // fall through to next method
  }

  if (!result.hasTypeScript && packageJson) {
    const deps = (packageJson.dependencies as Record<string, string> | undefined) ?? {};
    const devDeps = (packageJson.devDependencies as Record<string, string> | undefined) ?? {};
    if (deps.typescript !== undefined || devDeps.typescript !== undefined) {
      result.hasTypeScript = true;
      result.tsDetectionMethod = 'package-json-dep';
    }
  }

  if (!result.hasTypeScript) {
    try {
      const tsxFile = await findFirstTsxFile(projectRoot);
      if (tsxFile) {
        result.hasTypeScript = true;
        result.hasTsxFiles = true;
        result.tsxFilePath = tsxFile;
        result.tsDetectionMethod = 'tsx-file';
      }
    } catch {
      result.warnings.push('Unable to scan project directory for TypeScript/TSX files.');
    }
  } else if (!result.hasTsxFiles) {
    try {
      const tsxFile = await findFirstTsxFile(projectRoot);
      if (tsxFile) {
        result.hasTsxFiles = true;
        result.tsxFilePath = tsxFile;
      }
    } catch {
      // non-fatal — we already have TS confirmation
    }
  }

  if (!result.isNpmProject) {
    result.warnings.push('Target directory is not an npm project (no package.json found).');
  }

  if (!result.hasTypeScript) {
    result.warnings.push(
      'No TypeScript support detected (no tsconfig.json, no typescript dependency, no .tsx files). Components will still be added, but the project may not compile them without TS support.'
    );
  }

  result.isSafe = result.isNpmProject && result.hasTypeScript;

  return result;
}

export function formatDetectionWarnings(result: ProjectDetectionResult): string {
  if (result.warnings.length === 0) {
    return '';
  }

  return (
    '\n[!] Project Detection Warnings:\n' +
    result.warnings.map((w) => `  - ${w}`).join('\n') +
    '\n'
  );
}
