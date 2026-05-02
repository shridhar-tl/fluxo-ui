import { promises as fs } from 'fs';
import path from 'path';
import {
  computeFileChecksum,
  computeDirectoryFileChecksums,
  rollupFileChecksums,
  type FileChecksumEntry,
} from './checksum.js';

export const CONFIG_SCHEMA_VERSION = '1.0.0';
export const DEFAULT_CONFIG_FILENAME = 'fluxo-ui.config.json';
export const LEGACY_CONFIG_FILENAMES = ['fluxo-ui.json'] as const;
export const ALL_CONFIG_FILENAMES = [
  DEFAULT_CONFIG_FILENAME,
  ...LEGACY_CONFIG_FILENAMES,
] as const;
export const DEFAULT_INSTALL_PATH = './src/components/fluxo-ui';

export interface ComponentFileEntry {
  path: string;
  checksum: string;
}

export interface InstalledComponentEntry {
  name: string;
  version: string;
  checksum: string;
  files: ComponentFileEntry[];
  installedAt: string;
}

export interface FluxoConfig {
  $schema?: string;
  version: string;
  path: string;
  themes?: string[];
  cssMode?: boolean;
  components: Record<string, InstalledComponentEntry>;
  lastUpdated: string;
}

export interface LoadedConfig {
  config: FluxoConfig;
  filePath: string;
}

export interface ComponentDriftReport {
  id: string;
  modifiedFiles: string[];
  missingFiles: string[];
  addedFiles: string[];
  isModified: boolean;
}

export function createDefaultConfig(targetPath: string): FluxoConfig {
  const now = new Date().toISOString();
  return {
    version: CONFIG_SCHEMA_VERSION,
    path: normalizeRelativePath(targetPath),
    themes: ['blue'],
    components: {},
    lastUpdated: now,
  };
}

export function validateConfigShape(value: unknown): value is FluxoConfig {
  if (!value || typeof value !== 'object') return false;
  const cfg = value as Record<string, unknown>;
  if (typeof cfg.version !== 'string') return false;
  if (typeof cfg.path !== 'string') return false;
  if (typeof cfg.lastUpdated !== 'string') return false;
  if (!cfg.components || typeof cfg.components !== 'object') return false;
  for (const [, entry] of Object.entries(cfg.components as Record<string, unknown>)) {
    if (!entry || typeof entry !== 'object') return false;
    const e = entry as Record<string, unknown>;
    if (typeof e.name !== 'string') return false;
    if (typeof e.version !== 'string') return false;
    if (typeof e.installedAt !== 'string') return false;
    if (e.checksum !== undefined && typeof e.checksum !== 'string') return false;
    if (e.files !== undefined) {
      if (!Array.isArray(e.files)) return false;
      for (const f of e.files) {
        if (!f || typeof f !== 'object') return false;
        const fe = f as Record<string, unknown>;
        if (typeof fe.path !== 'string') return false;
        if (typeof fe.checksum !== 'string') return false;
      }
    }
  }
  if (cfg.themes !== undefined) {
    if (!Array.isArray(cfg.themes)) return false;
    for (const t of cfg.themes) {
      if (typeof t !== 'string') return false;
    }
  }
  if (cfg.cssMode !== undefined && typeof cfg.cssMode !== 'boolean') return false;
  return true;
}

export function getDefaultConfigPath(projectRoot: string): string {
  return path.join(projectRoot, DEFAULT_CONFIG_FILENAME);
}

export async function findExistingConfigFile(projectRoot: string): Promise<string | null> {
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

export async function readConfig(projectRoot: string): Promise<LoadedConfig | null> {
  const filePath = await findExistingConfigFile(projectRoot);
  if (!filePath) return null;
  const raw = await fs.readFile(filePath, 'utf-8');
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(
      `Failed to parse FluxoUI config at ${filePath}: ${err instanceof Error ? err.message : String(err)}`
    );
  }
  const migrated = migrateConfig(parsed);
  if (!validateConfigShape(migrated)) {
    throw new Error(
      `Invalid FluxoUI config at ${filePath}. Expected version, path, components, and lastUpdated fields.`
    );
  }
  return { config: migrated, filePath };
}

export async function writeConfig(
  projectRoot: string,
  config: FluxoConfig,
  filePath?: string
): Promise<string> {
  const target = filePath ?? (await findExistingConfigFile(projectRoot)) ?? getDefaultConfigPath(projectRoot);
  const dir = path.dirname(target);
  await fs.mkdir(dir, { recursive: true });
  const serialized = JSON.stringify(sortConfigForOutput(config), null, 2) + '\n';
  const tmp = target + '.tmp-' + process.pid + '-' + Date.now();
  await fs.writeFile(tmp, serialized, 'utf-8');
  await fs.rename(tmp, target);
  return target;
}

export async function ensureConfig(
  projectRoot: string,
  targetPath: string
): Promise<{ config: FluxoConfig; filePath: string; created: boolean }> {
  const existing = await readConfig(projectRoot);
  if (existing) {
    return { config: existing.config, filePath: existing.filePath, created: false };
  }
  const config = createDefaultConfig(toRelativeFromRoot(projectRoot, targetPath));
  const filePath = await writeConfig(projectRoot, config);
  return { config, filePath, created: true };
}

export function setInstalledComponent(
  config: FluxoConfig,
  componentId: string,
  entry: Omit<InstalledComponentEntry, 'installedAt' | 'checksum'> & {
    installedAt?: string;
    checksum?: string;
  }
): FluxoConfig {
  const installedAt = entry.installedAt ?? new Date().toISOString();
  const files = [...entry.files].sort((a, b) =>
    a.path < b.path ? -1 : a.path > b.path ? 1 : 0
  );
  const checksum = entry.checksum ?? rollupFileChecksums(files);
  return {
    ...config,
    components: {
      ...config.components,
      [componentId]: {
        name: entry.name,
        version: entry.version,
        checksum,
        files,
        installedAt,
      },
    },
    lastUpdated: new Date().toISOString(),
  };
}

export function removeInstalledComponent(config: FluxoConfig, componentId: string): FluxoConfig {
  if (!config.components[componentId]) return config;
  const next = { ...config.components };
  delete next[componentId];
  return {
    ...config,
    components: next,
    lastUpdated: new Date().toISOString(),
  };
}

export function listInstalledComponents(config: FluxoConfig): InstalledComponentEntry[] {
  return Object.values(config.components);
}

export function setInstallPath(config: FluxoConfig, projectRoot: string, targetPath: string): FluxoConfig {
  return {
    ...config,
    path: toRelativeFromRoot(projectRoot, targetPath),
    lastUpdated: new Date().toISOString(),
  };
}

export function resolveComponentDir(
  projectRoot: string,
  config: FluxoConfig,
  componentId: string
): string {
  const installRoot = path.resolve(projectRoot, config.path);
  return path.join(installRoot, componentId);
}

export async function detectComponentDrift(
  projectRoot: string,
  config: FluxoConfig,
  componentId: string
): Promise<ComponentDriftReport> {
  const entry = config.components[componentId];
  if (!entry) {
    return {
      id: componentId,
      modifiedFiles: [],
      missingFiles: [],
      addedFiles: [],
      isModified: false,
    };
  }
  const componentDir = resolveComponentDir(projectRoot, config, componentId);
  const expectedByPath = new Map(entry.files.map((f) => [f.path, f.checksum]));
  const modifiedFiles: string[] = [];
  const missingFiles: string[] = [];
  const addedFiles: string[] = [];

  let onDisk: FileChecksumEntry[] = [];
  let dirExists = true;
  try {
    await fs.access(componentDir);
  } catch {
    dirExists = false;
  }

  if (dirExists) {
    onDisk = await computeDirectoryFileChecksums(componentDir);
  }

  const onDiskByPath = new Map(onDisk.map((f) => [f.path, f.checksum]));

  for (const [relPath, expectedChecksum] of expectedByPath.entries()) {
    const actual = onDiskByPath.get(relPath);
    if (actual === undefined) {
      missingFiles.push(relPath);
    } else if (actual !== expectedChecksum) {
      modifiedFiles.push(relPath);
    }
  }

  for (const f of onDisk) {
    if (!expectedByPath.has(f.path)) {
      addedFiles.push(f.path);
    }
  }

  modifiedFiles.sort();
  missingFiles.sort();
  addedFiles.sort();

  return {
    id: componentId,
    modifiedFiles,
    missingFiles,
    addedFiles,
    isModified: modifiedFiles.length > 0 || missingFiles.length > 0 || addedFiles.length > 0,
  };
}

export async function detectAllComponentDrift(
  projectRoot: string,
  config: FluxoConfig
): Promise<ComponentDriftReport[]> {
  const reports: ComponentDriftReport[] = [];
  for (const id of Object.keys(config.components)) {
    reports.push(await detectComponentDrift(projectRoot, config, id));
  }
  return reports;
}

function migrateConfig(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value;
  const cfg = value as Record<string, unknown>;
  if (cfg.components && typeof cfg.components === 'object') {
    const components = cfg.components as Record<string, Record<string, unknown>>;
    for (const [, entry] of Object.entries(components)) {
      if (entry && typeof entry === 'object' && !Array.isArray(entry.files)) {
        entry.files = [];
      }
      if (entry && typeof entry === 'object' && typeof entry.checksum !== 'string') {
        entry.checksum = '';
      }
    }
  }
  return cfg;
}

function sortConfigForOutput(config: FluxoConfig): FluxoConfig {
  const sortedComponents: Record<string, InstalledComponentEntry> = {};
  for (const id of Object.keys(config.components).sort()) {
    const entry = config.components[id];
    sortedComponents[id] = {
      name: entry.name,
      version: entry.version,
      checksum: entry.checksum,
      files: [...entry.files].sort((a, b) =>
        a.path < b.path ? -1 : a.path > b.path ? 1 : 0
      ),
      installedAt: entry.installedAt,
    };
  }
  return {
    ...(config.$schema ? { $schema: config.$schema } : {}),
    version: config.version,
    path: normalizeRelativePath(config.path),
    ...(config.themes && config.themes.length > 0 ? { themes: [...config.themes].sort() } : {}),
    ...(config.cssMode === true ? { cssMode: true } : {}),
    components: sortedComponents,
    lastUpdated: config.lastUpdated,
  };
}

export function setThemes(config: FluxoConfig, themes: readonly string[]): FluxoConfig {
  const cleaned = [...new Set(themes.map((t) => t.trim().toLowerCase()).filter((t) => t.length > 0))].sort();
  return {
    ...config,
    themes: cleaned,
    lastUpdated: new Date().toISOString(),
  };
}

export function setCssMode(config: FluxoConfig, cssMode: boolean): FluxoConfig {
  if (config.cssMode === cssMode) return config;
  return {
    ...config,
    cssMode,
    lastUpdated: new Date().toISOString(),
  };
}

function normalizeRelativePath(value: string): string {
  return value.split(path.sep).join('/').replace(/\/+$/, '') || './';
}

export function toRelativeFromRoot(projectRoot: string, targetPath: string): string {
  const abs = path.isAbsolute(targetPath) ? targetPath : path.resolve(projectRoot, targetPath);
  const rel = path.relative(projectRoot, abs);
  if (!rel || rel.startsWith('..')) {
    return normalizeRelativePath(rel || '.');
  }
  return normalizeRelativePath('./' + rel);
}

export async function buildComponentFileEntries(
  projectRoot: string,
  config: FluxoConfig,
  componentId: string,
  files: { absPath: string; relPath: string }[]
): Promise<ComponentFileEntry[]> {
  void projectRoot;
  void config;
  void componentId;
  const entries: ComponentFileEntry[] = [];
  for (const f of files) {
    const checksum = await computeFileChecksum(f.absPath);
    entries.push({ path: f.relPath.split(path.sep).join('/'), checksum });
  }
  entries.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  return entries;
}

export function summarizeDriftReport(report: ComponentDriftReport): string {
  const parts: string[] = [];
  if (report.modifiedFiles.length > 0) {
    parts.push(`${report.modifiedFiles.length} modified`);
  }
  if (report.missingFiles.length > 0) {
    parts.push(`${report.missingFiles.length} missing`);
  }
  if (report.addedFiles.length > 0) {
    parts.push(`${report.addedFiles.length} added`);
  }
  if (parts.length === 0) return 'unchanged';
  return parts.join(', ');
}
