import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { ComponentMetadata } from './types.js';

export const MANIFEST_SCHEMA_VERSION = '1.0.0';

export interface ManifestDependencies {
  components: string[];
  hooks: string[];
  utils: string[];
  shared: string[];
  external: string[];
  optionalPeers: string[];
}

export interface ManifestComponent {
  id: string;
  name: string;
  kind: 'flat' | 'directory';
  sourcePath: string;
  entryFile: string;
  files: string[];
  category: string;
  label: string;
  description: string;
  private: boolean;
  dependencies: ManifestDependencies;
}

export interface ManifestHook {
  id: string;
  name: string;
  sourcePath: string;
  files: string[];
  dependencies: ManifestDependencies;
}

export interface ManifestUtil {
  id: string;
  name: string;
  sourcePath: string;
  files: string[];
  dependencies: ManifestDependencies;
}

export interface ManifestShared {
  id: string;
  sourcePath: string;
  files: string[];
}

export interface ManifestData {
  schemaVersion: string;
  generatedAt: string;
  sourceRoot: string;
  components: ManifestComponent[];
  hooks: ManifestHook[];
  utils: ManifestUtil[];
  shared: ManifestShared[];
}

export interface ResolvedClosure {
  components: string[];
  hooks: string[];
  utils: string[];
  shared: string[];
  externalPackages: string[];
  optionalPeers: string[];
  unknown: string[];
}

const EMPTY_DEPS: ManifestDependencies = Object.freeze({
  components: [],
  hooks: [],
  utils: [],
  shared: [],
  external: [],
  optionalPeers: [],
}) as ManifestDependencies;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FALLBACK_MANIFEST: ManifestData = {
  schemaVersion: MANIFEST_SCHEMA_VERSION,
  generatedAt: '1970-01-01T00:00:00.000Z',
  sourceRoot: 'src',
  components: [],
  hooks: [],
  utils: [],
  shared: [],
};

let cachedManifest: ManifestData | null = null;

const MANIFEST_CANDIDATE_FILENAMES = [
  'manifest-data.json',
  'cli-manifest-data.json',
];

async function readJsonIfExists(filePath: string): Promise<unknown | null> {
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function isManifestData(value: unknown): value is ManifestData {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.schemaVersion === 'string' &&
    Array.isArray(v.components) &&
    Array.isArray(v.hooks) &&
    Array.isArray(v.utils)
  );
}

async function loadManifestFromDisk(): Promise<ManifestData> {
  const candidateDirs = [
    __dirname,
    path.resolve(__dirname, '..'),
    path.resolve(__dirname, '..', 'src'),
    path.resolve(__dirname, '..', '..', 'src'),
  ];
  for (const dir of candidateDirs) {
    for (const file of MANIFEST_CANDIDATE_FILENAMES) {
      const candidate = path.join(dir, file);
      const json = await readJsonIfExists(candidate);
      if (isManifestData(json)) return json;
    }
  }
  return FALLBACK_MANIFEST;
}

export async function loadManifest(): Promise<ManifestData> {
  if (cachedManifest) return cachedManifest;
  cachedManifest = await loadManifestFromDisk();
  return cachedManifest;
}

export function setManifestForTesting(data: ManifestData | null): void {
  cachedManifest = data;
}

function buildDeps(): ManifestDependencies {
  return { components: [], hooks: [], utils: [], shared: [], external: [], optionalPeers: [] };
}

function indexManifest(manifest: ManifestData): {
  componentById: Map<string, ManifestComponent>;
  hookById: Map<string, ManifestHook>;
  utilById: Map<string, ManifestUtil>;
} {
  const componentById = new Map<string, ManifestComponent>();
  for (const c of manifest.components) componentById.set(c.id, c);
  const hookById = new Map<string, ManifestHook>();
  for (const h of manifest.hooks) hookById.set(h.id, h);
  const utilById = new Map<string, ManifestUtil>();
  for (const u of manifest.utils) utilById.set(u.id, u);
  return { componentById, hookById, utilById };
}

export async function getComponentById(id: string): Promise<ManifestComponent | undefined> {
  const manifest = await loadManifest();
  return manifest.components.find((c) => c.id === id || c.name === id);
}

export async function getAllComponents(includePrivate = false): Promise<ManifestComponent[]> {
  const manifest = await loadManifest();
  return includePrivate ? manifest.components : manifest.components.filter((c) => !c.private);
}

export async function getComponentsByCategory(category: string, includePrivate = false): Promise<ManifestComponent[]> {
  const all = await getAllComponents(includePrivate);
  return all.filter((c) => c.category === category);
}

export async function getCategories(includePrivate = false): Promise<string[]> {
  const all = await getAllComponents(includePrivate);
  const categories = new Set<string>();
  for (const c of all) categories.add(c.category);
  return [...categories].sort();
}

export async function getHookById(id: string): Promise<ManifestHook | undefined> {
  const manifest = await loadManifest();
  return manifest.hooks.find((h) => h.id === id || h.name === id);
}

export async function getUtilById(id: string): Promise<ManifestUtil | undefined> {
  const manifest = await loadManifest();
  return manifest.utils.find((u) => u.id === id || u.name === id);
}

export async function resolveComponentClosure(componentIds: readonly string[]): Promise<ResolvedClosure> {
  const manifest = await loadManifest();
  const { componentById, hookById, utilById } = indexManifest(manifest);

  const visitedComponents = new Set<string>();
  const visitedHooks = new Set<string>();
  const visitedUtils = new Set<string>();
  const visitedShared = new Set<string>();
  const externalPackages = new Set<string>();
  const optionalPeers = new Set<string>();
  const unknown = new Set<string>();
  const queue: string[] = [];

  for (const id of componentIds) {
    if (!componentById.has(id)) {
      unknown.add(id);
      continue;
    }
    queue.push(id);
  }

  while (queue.length > 0) {
    const id = queue.shift()!;
    if (visitedComponents.has(id)) continue;
    const component = componentById.get(id);
    if (!component) {
      unknown.add(id);
      continue;
    }
    visitedComponents.add(id);
    const deps = component.dependencies ?? EMPTY_DEPS;
    for (const childId of deps.components) {
      if (!visitedComponents.has(childId)) queue.push(childId);
    }
    for (const hookId of deps.hooks) {
      if (visitedHooks.has(hookId)) continue;
      visitedHooks.add(hookId);
      const hook = hookById.get(hookId);
      if (!hook) {
        unknown.add(`hook:${hookId}`);
        continue;
      }
      const hookDeps = hook.dependencies ?? EMPTY_DEPS;
      for (const cid of hookDeps.components) {
        if (!visitedComponents.has(cid)) queue.push(cid);
      }
      for (const u of hookDeps.utils) visitedUtils.add(u);
      for (const s of hookDeps.shared) visitedShared.add(s);
      for (const e of hookDeps.external) externalPackages.add(e);
      for (const p of hookDeps.optionalPeers) optionalPeers.add(p);
    }
    for (const utilId of deps.utils) {
      if (visitedUtils.has(utilId)) continue;
      visitedUtils.add(utilId);
      const util = utilById.get(utilId);
      if (!util) {
        unknown.add(`util:${utilId}`);
        continue;
      }
      const utilDeps = util.dependencies ?? EMPTY_DEPS;
      for (const cid of utilDeps.components) {
        if (!visitedComponents.has(cid)) queue.push(cid);
      }
      for (const h of utilDeps.hooks) {
        if (!visitedHooks.has(h)) {
          visitedHooks.add(h);
          const hookEntry = hookById.get(h);
          if (hookEntry) {
            const hookDeps = hookEntry.dependencies ?? EMPTY_DEPS;
            for (const e of hookDeps.external) externalPackages.add(e);
            for (const p of hookDeps.optionalPeers) optionalPeers.add(p);
          }
        }
      }
      for (const s of utilDeps.shared) visitedShared.add(s);
      for (const e of utilDeps.external) externalPackages.add(e);
      for (const p of utilDeps.optionalPeers) optionalPeers.add(p);
    }
    for (const s of deps.shared) visitedShared.add(s);
    for (const e of deps.external) externalPackages.add(e);
    for (const p of deps.optionalPeers) optionalPeers.add(p);
  }

  return {
    components: [...visitedComponents].sort(),
    hooks: [...visitedHooks].sort(),
    utils: [...visitedUtils].sort(),
    shared: [...visitedShared].sort(),
    externalPackages: [...externalPackages].sort(),
    optionalPeers: [...optionalPeers].sort(),
    unknown: [...unknown].sort(),
  };
}

export async function getComponentMetadata(id: string): Promise<ComponentMetadata | undefined> {
  const component = await getComponentById(id);
  if (!component) return undefined;
  return {
    id: component.id,
    name: component.name,
    category: component.category,
    description: component.description || component.label || component.name,
    dependencies: {
      components: component.dependencies.components,
      hooks: component.dependencies.hooks,
      utils: component.dependencies.utils,
    },
  };
}

export async function getAllComponentMetadata(includePrivate = false): Promise<ComponentMetadata[]> {
  const components = await getAllComponents(includePrivate);
  return components.map((c) => ({
    id: c.id,
    name: c.name,
    category: c.category,
    description: c.description || c.label || c.name,
    dependencies: {
      components: c.dependencies.components,
      hooks: c.dependencies.hooks,
      utils: c.dependencies.utils,
    },
  }));
}

export async function getComponentSourceFiles(id: string): Promise<string[]> {
  const component = await getComponentById(id);
  return component ? [...component.files] : [];
}

export async function getHookSourceFiles(id: string): Promise<string[]> {
  const hook = await getHookById(id);
  return hook ? [...hook.files] : [];
}

export async function getUtilSourceFiles(id: string): Promise<string[]> {
  const util = await getUtilById(id);
  return util ? [...util.files] : [];
}

export function buildEmptyDependencies(): ManifestDependencies {
  return buildDeps();
}
