import path from 'path';
import { loadManifest, resolveComponentClosure } from './manifest.js';
import type {
  ManifestData,
  ManifestComponent,
  ManifestHook,
  ManifestUtil,
  ManifestShared,
  ResolvedClosure,
} from './manifest.js';
import type { SourceProvider } from './source-provider.js';
import { loadIconRegistry, ICONS_INDEX_SRC_PATH, ICONS_FOLDER_SRC_PATH } from './asset-resolver.js';
import type { IconRegistry } from './asset-resolver.js';
import { resolveRelativeSrcImport, isRelativeSpec } from './import-rewriter.js';
import { buildStylesBundleEntries } from './styles-bundle.js';

const TEXT_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx',
  '.scss', '.css', '.json', '.md',
]);

function isPropsJsonFile(filePath: string): boolean {
  return /\.props\.json$/i.test(filePath);
}
const SVG_EXTENSION = '.svg';
const SOURCE_TS_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);

const IMPORT_SOURCE_PATTERNS: RegExp[] = [
  /(?:^|[^.\w$])(?:import|export)(?:\s+type)?\s+(?:[\s\S]*?)\s+from\s*['"]([^'"]+)['"]/g,
  /(?:^|[^.\w$])import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  /(?:^|[^.\w$])(?:import|require)\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  /(?:^|[^.\w$])import\s*['"]([^'"]+)['"]/g,
  /(?:^|[^.\w$])export\s*\*\s+from\s*['"]([^'"]+)['"]/g,
];

export type PlanFileKind =
  | 'component-source'
  | 'component-asset'
  | 'hook'
  | 'util'
  | 'shared'
  | 'asset'
  | 'icon'
  | 'styles-bundle';

export interface PlanFile {
  srcRelative: string;
  targetRelative: string;
  kind: PlanFileKind;
  componentId: string | null;
  isText: boolean;
}

export interface DependencyPlan {
  installRoot: string;
  files: PlanFile[];
  filesByComponent: Record<string, PlanFile[]>;
  hookFiles: PlanFile[];
  utilFiles: PlanFile[];
  sharedFiles: PlanFile[];
  assetFiles: PlanFile[];
  iconFiles: PlanFile[];
  closure: ResolvedClosure;
  externalPackages: string[];
  optionalPeers: string[];
  unknownComponents: string[];
  missingFiles: string[];
  unresolvedImports: { fromFile: string; spec: string }[];
  iconRegistry: IconRegistry | null;
  contentCache: Map<string, string | null>;
  binaryCache: Map<string, Buffer | null>;
  manifest: ManifestData;
}

export interface BuildPlanOptions {
  componentIds: readonly string[];
  installRoot: string;
  sourceProvider: SourceProvider;
  manifest?: ManifestData;
  includeIconRegistryFile?: boolean;
  cssMode?: boolean;
  includeStylesBundle?: boolean;
  themes?: readonly string[];
}

export async function buildDependencyPlan(options: BuildPlanOptions): Promise<DependencyPlan> {
  const manifest = options.manifest ?? (await loadManifest());
  const closure = await resolveComponentClosure(options.componentIds);
  const iconRegistry = await loadIconRegistry(options.sourceProvider);

  const componentById = new Map<string, ManifestComponent>();
  for (const c of manifest.components) componentById.set(c.id, c);
  const hookById = new Map<string, ManifestHook>();
  for (const h of manifest.hooks) hookById.set(h.id, h);
  const utilById = new Map<string, ManifestUtil>();
  for (const u of manifest.utils) utilById.set(u.id, u);
  const sharedById = new Map<string, ManifestShared>();
  for (const s of manifest.shared) sharedById.set(s.id, s);

  const fileEntries = new Map<string, PlanFile>();
  const contentCache = new Map<string, string | null>();
  const binaryCache = new Map<string, Buffer | null>();
  const missingFiles = new Set<string>();
  const unresolvedImports: { fromFile: string; spec: string }[] = [];
  const iconFilesAdded = new Set<string>();

  const addFile = (entry: PlanFile) => {
    if (!fileEntries.has(entry.srcRelative)) {
      fileEntries.set(entry.srcRelative, entry);
    }
  };

  for (const componentId of closure.components) {
    const component = componentById.get(componentId);
    if (!component) continue;
    for (const fileRel of component.files) {
      if (isPropsJsonFile(fileRel)) continue;
      const srcRel = sourceRelativeForComponentFile(component, fileRel);
      if (!srcRel) continue;
      const targetRel = targetRelativeForComponentFile(component, fileRel);
      addFile({
        srcRelative: srcRel,
        targetRelative: targetRel,
        kind: isSourceFile(fileRel) ? 'component-source' : 'component-asset',
        componentId: component.id,
        isText: isTextSrc(fileRel),
      });
    }
  }

  for (const hookId of closure.hooks) {
    const hook = hookById.get(hookId);
    if (!hook) continue;
    for (const fileRel of hook.files) {
      if (isPropsJsonFile(fileRel)) continue;
      const srcRel = `hooks/${fileRel}`;
      addFile({
        srcRelative: srcRel,
        targetRelative: `hooks/${fileRel}`,
        kind: 'hook',
        componentId: null,
        isText: isTextSrc(fileRel),
      });
    }
  }

  for (const utilId of closure.utils) {
    const util = utilById.get(utilId);
    if (!util) continue;
    for (const fileRel of util.files) {
      if (isPropsJsonFile(fileRel)) continue;
      const srcRel = `utils/${fileRel}`;
      addFile({
        srcRelative: srcRel,
        targetRelative: `utils/${fileRel}`,
        kind: 'util',
        componentId: null,
        isText: isTextSrc(fileRel),
      });
    }
  }

  for (const sharedId of closure.shared) {
    const shared = sharedById.get(sharedId);
    if (!shared) continue;
    for (const fileRel of shared.files) {
      if (isPropsJsonFile(fileRel)) continue;
      addFile({
        srcRelative: fileRel,
        targetRelative: fileRel,
        kind: 'shared',
        componentId: null,
        isText: isTextSrc(fileRel),
      });
    }
  }

  if (options.includeStylesBundle !== false) {
    const stylesEntries = buildStylesBundleEntries({
      cssMode: options.cssMode === true,
      themes: options.themes ?? [],
    });
    for (const entry of stylesEntries) {
      addFile({
        srcRelative: entry.srcRelative,
        targetRelative: entry.targetRelative,
        kind: 'styles-bundle',
        componentId: null,
        isText: entry.isText,
      });
    }
  }

  const fetchText = async (srcRel: string): Promise<string | null> => {
    if (contentCache.has(srcRel)) return contentCache.get(srcRel) ?? null;
    const text = await options.sourceProvider.fetchText(srcRel);
    contentCache.set(srcRel, text);
    return text;
  };

  const fetchBinary = async (srcRel: string): Promise<Buffer | null> => {
    if (binaryCache.has(srcRel)) return binaryCache.get(srcRel) ?? null;
    const buf = await options.sourceProvider.fetchBinary(srcRel);
    binaryCache.set(srcRel, buf);
    return buf;
  };

  const queue: string[] = [...fileEntries.keys()];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const srcRel = queue.shift()!;
    if (visited.has(srcRel)) continue;
    visited.add(srcRel);

    const ext = path.posix.extname(srcRel);
    if (!TEXT_EXTENSIONS.has(ext) || ext === '.json' || ext === '.scss' || ext === '.css' || ext === '.md') {
      continue;
    }

    const content = await fetchText(srcRel);
    if (content == null) {
      missingFiles.add(srcRel);
      continue;
    }

    const specs = extractImportSources(content);
    for (const spec of specs) {
      if (!isRelativeSpec(spec)) continue;
      if (specResolvesToIconsIndex(srcRel, spec)) {
        const iconResolution = resolveIconImport(srcRel, spec, iconRegistry, content);
        for (const svgRel of iconResolution) {
          if (!iconFilesAdded.has(svgRel)) {
            iconFilesAdded.add(svgRel);
            addFile({
              srcRelative: svgRel,
              targetRelative: svgRel,
              kind: 'icon',
              componentId: null,
              isText: false,
            });
          }
        }
        continue;
      }
      const resolved = resolveRelativeSrcImport(srcRel, spec, (p) => fileEntries.has(p));
      if (resolved) {
        if (isPropsJsonFile(resolved)) continue;
        if (!fileEntries.has(resolved)) {
          addDiscoveredFile(resolved, fileEntries, addFile);
        }
        if (!visited.has(resolved)) queue.push(resolved);
        continue;
      }
      const probed = await probeRemoteResolve(srcRel, spec, fetchText, fetchBinary);
      if (probed) {
        if (isPropsJsonFile(probed)) continue;
        if (!fileEntries.has(probed)) {
          addDiscoveredFile(probed, fileEntries, addFile);
        }
        if (!visited.has(probed)) queue.push(probed);
        continue;
      }
      unresolvedImports.push({ fromFile: srcRel, spec });
    }
  }

  if (options.includeIconRegistryFile && iconRegistry && iconFilesAdded.size > 0) {
    addFile({
      srcRelative: ICONS_INDEX_SRC_PATH,
      targetRelative: ICONS_INDEX_SRC_PATH,
      kind: 'asset',
      componentId: null,
      isText: true,
    });
  }

  for (const entry of fileEntries.values()) {
    if (entry.isText && !contentCache.has(entry.srcRelative)) {
      const text = await fetchText(entry.srcRelative);
      if (text == null) missingFiles.add(entry.srcRelative);
    } else if (!entry.isText && !binaryCache.has(entry.srcRelative)) {
      const buf = await fetchBinary(entry.srcRelative);
      if (buf == null) missingFiles.add(entry.srcRelative);
    }
  }

  const files = [...fileEntries.values()].sort((a, b) =>
    a.srcRelative < b.srcRelative ? -1 : a.srcRelative > b.srcRelative ? 1 : 0
  );

  const filesByComponent: Record<string, PlanFile[]> = {};
  for (const f of files) {
    if (f.componentId) {
      (filesByComponent[f.componentId] ??= []).push(f);
    }
  }

  return {
    installRoot: options.installRoot,
    files,
    filesByComponent,
    hookFiles: files.filter((f) => f.kind === 'hook'),
    utilFiles: files.filter((f) => f.kind === 'util'),
    sharedFiles: files.filter((f) => f.kind === 'shared'),
    assetFiles: files.filter((f) => f.kind === 'asset'),
    iconFiles: files.filter((f) => f.kind === 'icon'),
    closure,
    externalPackages: closure.externalPackages,
    optionalPeers: closure.optionalPeers,
    unknownComponents: closure.unknown,
    missingFiles: [...missingFiles].sort(),
    unresolvedImports,
    iconRegistry,
    contentCache,
    binaryCache,
    manifest,
  };
}

function addDiscoveredFile(
  srcRelative: string,
  fileEntries: Map<string, PlanFile>,
  addFile: (entry: PlanFile) => void
): void {
  const targetRelative = computeTargetForDiscoveredSrc(srcRelative);
  if (!targetRelative) return;
  let kind: PlanFileKind = 'component-source';
  if (srcRelative.startsWith('hooks/')) kind = 'hook';
  else if (srcRelative.startsWith('utils/')) kind = 'util';
  else if (
    srcRelative.startsWith('types/') ||
    srcRelative.startsWith('themes/') ||
    srcRelative.startsWith('styles/') ||
    srcRelative.startsWith('store/')
  ) kind = 'shared';
  else if (srcRelative.startsWith('assets/')) kind = 'asset';
  else if (srcRelative.startsWith('components/')) {
    kind = isSourceFile(srcRelative) ? 'component-source' : 'component-asset';
  }
  const componentId = kind === 'component-source' || kind === 'component-asset'
    ? deriveComponentIdFromSrc(srcRelative)
    : null;
  addFile({
    srcRelative,
    targetRelative,
    kind,
    componentId,
    isText: isTextSrc(srcRelative),
  });
  if (fileEntries.has(srcRelative)) return;
}

function deriveComponentIdFromSrc(srcRelative: string): string | null {
  if (!srcRelative.startsWith('components/')) return null;
  const rest = srcRelative.slice('components/'.length);
  const segs = rest.split('/');
  if (segs.length === 1) {
    const base = stripExt(segs[0]);
    return toKebab(base);
  }
  return toKebab(segs[0]);
}

function computeTargetForDiscoveredSrc(srcRelative: string): string | null {
  if (srcRelative.startsWith('components/')) {
    const rest = srcRelative.slice('components/'.length);
    const segs = rest.split('/');
    if (segs.length === 1) {
      const baseName = stripExt(segs[0]);
      const id = toKebab(baseName);
      return `${id}/${segs[0]}`;
    }
    const id = toKebab(segs[0]);
    return `${id}/${segs.slice(1).join('/')}`;
  }
  return srcRelative;
}

function sourceRelativeForComponentFile(component: ManifestComponent, fileRel: string): string {
  if (component.kind === 'directory') {
    return `${component.sourcePath}/${fileRel}`;
  }
  return `components/${fileRel}`;
}

function targetRelativeForComponentFile(component: ManifestComponent, fileRel: string): string {
  return `${component.id}/${fileRel}`;
}

function isSourceFile(filePath: string): boolean {
  const ext = path.posix.extname(filePath);
  return SOURCE_TS_EXTENSIONS.has(ext);
}

function isTextSrc(filePath: string): boolean {
  const ext = path.posix.extname(filePath);
  if (ext === SVG_EXTENSION) return false;
  return TEXT_EXTENSIONS.has(ext);
}

function stripExt(filename: string): string {
  const ext = path.posix.extname(filename);
  return ext ? filename.slice(0, -ext.length) : filename;
}

function toKebab(input: string): string {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase();
}

function extractImportSources(source: string): string[] {
  const sources = new Set<string>();
  const stripped = source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1');
  for (const pattern of IMPORT_SOURCE_PATTERNS) {
    pattern.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(stripped)) !== null) {
      const value = m[1];
      if (value) sources.add(value);
    }
  }
  return [...sources];
}

async function probeRemoteResolve(
  fileSrcPath: string,
  spec: string,
  fetchText: (srcRel: string) => Promise<string | null>,
  fetchBinary: (srcRel: string) => Promise<Buffer | null>
): Promise<string | null> {
  const fromDir = path.posix.dirname(fileSrcPath);
  const queryless = spec.indexOf('?') >= 0 ? spec.slice(0, spec.indexOf('?')) : spec;
  const joined = posixJoin(fromDir, queryless);
  const candidate = posixNormalize(joined);
  if (!candidate) return null;
  const probes = [
    candidate,
    `${candidate}.tsx`,
    `${candidate}.ts`,
    `${candidate}.jsx`,
    `${candidate}.js`,
    `${candidate}/index.ts`,
    `${candidate}/index.tsx`,
    `${candidate}/index.js`,
    `${candidate}/index.jsx`,
    `${candidate}.scss`,
    `${candidate}.css`,
    `${candidate}.json`,
    `${candidate}.svg`,
  ];
  for (const probe of probes) {
    if (path.posix.extname(probe) === SVG_EXTENSION) {
      const buf = await fetchBinary(probe);
      if (buf) return probe;
    } else {
      const text = await fetchText(probe);
      if (text != null) return probe;
    }
  }
  return null;
}

function resolveIconImport(
  fileSrcPath: string,
  spec: string,
  iconRegistry: IconRegistry | null,
  content: string
): string[] {
  if (!iconRegistry) return [];
  if (!specResolvesToIconsIndex(fileSrcPath, spec)) return [];
  const named = parseNamedImportsFor(content, spec);
  const svgs: string[] = [];
  for (const name of named) {
    const entry = iconRegistry.byName.get(name);
    if (entry) svgs.push(entry.svgRelative);
  }
  return svgs;
}

function specResolvesToIconsIndex(fileSrcPath: string, spec: string): boolean {
  const queryless = spec.indexOf('?') >= 0 ? spec.slice(0, spec.indexOf('?')) : spec;
  const fromDir = path.posix.dirname(fileSrcPath);
  const joined = posixJoin(fromDir, queryless);
  const candidate = posixNormalize(joined);
  return (
    candidate === ICONS_INDEX_SRC_PATH.replace(/\.ts$/, '')
    || candidate === ICONS_INDEX_SRC_PATH
    || candidate === ICONS_FOLDER_SRC_PATH
  );
}

function parseNamedImportsFor(content: string, spec: string): string[] {
  const out = new Set<string>();
  const escaped = spec.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`import\\s*\\{([^{}]*?)\\}\\s*from\\s*['"]${escaped}['"]`, 'g');
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const body = m[1];
    for (const raw of body.split(',')) {
      const part = raw.trim();
      if (!part) continue;
      const stripped = part.replace(/^type\s+/, '').trim();
      const asMatch = stripped.match(/^([A-Za-z_$][A-Za-z0-9_$]*)\s+as\s+([A-Za-z_$][A-Za-z0-9_$]*)$/);
      if (asMatch) out.add(asMatch[1]);
      else if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(stripped)) out.add(stripped);
    }
  }
  return [...out];
}

function posixJoin(...segments: string[]): string {
  return segments.filter(Boolean).join('/');
}

function posixNormalize(p: string): string {
  const parts = p.split('/');
  const out: string[] = [];
  for (const part of parts) {
    if (!part || part === '.') continue;
    if (part === '..') {
      if (out.length === 0 || out[out.length - 1] === '..') {
        out.push('..');
      } else {
        out.pop();
      }
      continue;
    }
    out.push(part);
  }
  return out.join('/');
}
