import path from 'path';
import { promises as fs } from 'fs';
import type {
  ManifestData,
  ManifestComponent,
  ManifestHook,
  ManifestUtil,
} from './manifest.js';
import type { DependencyPlan } from './dependency-planner.js';

export type IndexEntryRole = 'component' | 'hook' | 'util';

export interface IndexExportEntry {
  specifier: string;
  role: IndexEntryRole;
  unitId: string;
  comment?: string;
}

export interface ParsedIndexExport {
  raw: string;
  startIndex: number;
  endIndex: number;
  specifier: string;
  kind: 'export-star' | 'export-star-as' | 'export-named' | 'export-default-as' | 'side-effect-import';
  isType: boolean;
}

export interface ParsedIndexFile {
  content: string;
  exports: ParsedIndexExport[];
  exportsBySpecifier: Map<string, ParsedIndexExport[]>;
}

export interface PlanIndexExportsOptions {
  plan: DependencyPlan;
  manifest: ManifestData;
  exportHooks?: boolean;
  exportUtils?: boolean;
  exportPrivateComponents?: boolean;
}

export interface ApplyIndexExportsOptions extends PlanIndexExportsOptions {
  installRootAbs: string;
  dryRun?: boolean;
}

export interface ApplyIndexExportsResult {
  indexFilePath: string;
  created: boolean;
  before: string;
  after: string;
  added: IndexExportEntry[];
  alreadyPresent: IndexExportEntry[];
  wrote: boolean;
  entries: IndexExportEntry[];
}

const EXPORT_FROM_RE =
  /\bexport\s+(type\s+)?(?:\*(?:\s+as\s+([A-Za-z_$][A-Za-z0-9_$]*))?|\{[\s\S]*?\})\s+from\s*(['"])([^'"]+)\3\s*;?/g;
const SIDE_EFFECT_IMPORT_RE = /\bimport\s*(['"])([^'"]+)\1\s*;?/g;
const STYLE_IMPORT_HINT_RE = /\.(?:s?css|less|sass|styl)$/i;

function isLikelyStyleImport(spec: string): boolean {
  return STYLE_IMPORT_HINT_RE.test(spec);
}

export function parseIndexFile(content: string): ParsedIndexFile {
  const exports: ParsedIndexExport[] = [];
  const exportsBySpecifier = new Map<string, ParsedIndexExport[]>();
  const scanText = stripCommentsForScan(content);

  EXPORT_FROM_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = EXPORT_FROM_RE.exec(scanText)) !== null) {
    const isType = !!match[1];
    const starAsName = match[2];
    const spec = match[4];
    let kind: ParsedIndexExport['kind'];
    const head = match[0];
    if (/\bexport\s+(?:type\s+)?\*\s+as\s+/.test(head)) {
      kind = 'export-star-as';
    } else if (/\bexport\s+(?:type\s+)?\*\s+from/.test(head)) {
      kind = 'export-star';
    } else if (/\{\s*default\s+as\s+/.test(head)) {
      kind = 'export-default-as';
    } else {
      kind = 'export-named';
    }
    void starAsName;
    const entry: ParsedIndexExport = {
      raw: head,
      startIndex: match.index,
      endIndex: match.index + head.length,
      specifier: spec,
      kind,
      isType,
    };
    exports.push(entry);
    addToBucket(exportsBySpecifier, spec, entry);
  }

  SIDE_EFFECT_IMPORT_RE.lastIndex = 0;
  while ((match = SIDE_EFFECT_IMPORT_RE.exec(scanText)) !== null) {
    const spec = match[2];
    if (!isLikelyStyleImport(spec)) continue;
    const entry: ParsedIndexExport = {
      raw: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      specifier: spec,
      kind: 'side-effect-import',
      isType: false,
    };
    exports.push(entry);
    addToBucket(exportsBySpecifier, spec, entry);
  }

  exports.sort((a, b) => a.startIndex - b.startIndex);

  return { content, exports, exportsBySpecifier };
}

function addToBucket(map: Map<string, ParsedIndexExport[]>, key: string, entry: ParsedIndexExport): void {
  const bucket = map.get(key);
  if (bucket) bucket.push(entry);
  else map.set(key, [entry]);
}

export function planIndexExports(options: PlanIndexExportsOptions): IndexExportEntry[] {
  const { plan, manifest } = options;
  const exportHooks = options.exportHooks !== false;
  const exportUtils = options.exportUtils !== false;
  const exportPrivate = options.exportPrivateComponents === true;

  const componentById = new Map<string, ManifestComponent>();
  for (const c of manifest.components) componentById.set(c.id, c);
  const hookById = new Map<string, ManifestHook>();
  for (const h of manifest.hooks) hookById.set(h.id, h);
  const utilById = new Map<string, ManifestUtil>();
  for (const u of manifest.utils) utilById.set(u.id, u);

  const entries: IndexExportEntry[] = [];
  const seen = new Set<string>();

  for (const id of plan.closure.components) {
    const component = componentById.get(id);
    if (!component) continue;
    if (component.private && !exportPrivate) continue;
    const specifier = specifierForComponent(component);
    if (!specifier) continue;
    const key = `component:${specifier}`;
    if (seen.has(key)) continue;
    seen.add(key);
    entries.push({
      specifier,
      role: 'component',
      unitId: component.id,
      comment: component.name,
    });
  }

  if (exportHooks) {
    for (const id of plan.closure.hooks) {
      const hook = hookById.get(id);
      if (!hook) continue;
      const specifier = specifierForHook(hook);
      if (!specifier) continue;
      const key = `hook:${specifier}`;
      if (seen.has(key)) continue;
      seen.add(key);
      entries.push({
        specifier,
        role: 'hook',
        unitId: hook.id,
        comment: hook.name,
      });
    }
  }

  if (exportUtils) {
    for (const id of plan.closure.utils) {
      const util = utilById.get(id);
      if (!util) continue;
      const specifier = specifierForUtil(util);
      if (!specifier) continue;
      const key = `util:${specifier}`;
      if (seen.has(key)) continue;
      seen.add(key);
      entries.push({
        specifier,
        role: 'util',
        unitId: util.id,
        comment: util.name,
      });
    }
  }

  return entries;
}

export function specifierForComponent(component: ManifestComponent): string | null {
  const id = component.id;
  if (!id) return null;
  if (component.kind === 'directory') {
    const hasIndexEntry =
      /\/index\.(?:ts|tsx|js|jsx)$/.test(component.entryFile) ||
      component.files.some((f) => /^index\.(?:ts|tsx|js|jsx)$/.test(f));
    if (hasIndexEntry) return `./${id}`;
    const entryRel = stripPosixPrefix(component.entryFile, `${component.sourcePath}/`);
    if (!entryRel) return `./${id}`;
    const noExt = stripSourceExt(entryRel);
    return `./${id}/${noExt}`;
  }
  const entryRel = component.entryFile.replace(/^components\//, '');
  const baseName = stripSourceExt(entryRel.split('/').pop() ?? '');
  if (!baseName) return null;
  return `./${id}/${baseName}`;
}

function specifierForHook(hook: ManifestHook): string | null {
  const file = pickPrimarySourceFile(hook.files);
  if (!file) return null;
  const baseName = stripSourceExt(file);
  if (!baseName) return null;
  return `./hooks/${baseName}`;
}

function specifierForUtil(util: ManifestUtil): string | null {
  const file = pickPrimarySourceFile(util.files);
  if (!file) return null;
  const baseName = stripSourceExt(file);
  if (!baseName) return null;
  return `./utils/${baseName}`;
}

function pickPrimarySourceFile(files: readonly string[]): string | null {
  const sourceCandidates = files.filter((f) => /\.(?:ts|tsx|js|jsx)$/.test(f));
  if (sourceCandidates.length === 0) return null;
  const indexCandidate = sourceCandidates.find((f) => /^index\.(?:ts|tsx|js|jsx)$/.test(f));
  if (indexCandidate) return indexCandidate;
  return sourceCandidates[0];
}

function stripPosixPrefix(value: string, prefix: string): string {
  return value.startsWith(prefix) ? value.slice(prefix.length) : value;
}

function stripSourceExt(file: string): string {
  return file.replace(/\.(?:tsx|ts|jsx|js)$/, '');
}

export interface MergeIndexExportsResult {
  content: string;
  added: IndexExportEntry[];
  alreadyPresent: IndexExportEntry[];
}

export function mergeIndexExports(
  parsed: ParsedIndexFile,
  entries: readonly IndexExportEntry[]
): MergeIndexExportsResult {
  const added: IndexExportEntry[] = [];
  const alreadyPresent: IndexExportEntry[] = [];
  const additions: string[] = [];

  for (const entry of entries) {
    if (parsed.exportsBySpecifier.has(entry.specifier)) {
      alreadyPresent.push(entry);
      continue;
    }
    additions.push(formatExportLine(entry));
    added.push(entry);
  }

  if (additions.length === 0) {
    return { content: parsed.content, added, alreadyPresent };
  }

  const block = formatAdditionsBlock(parsed.content, additions);
  const content = appendBlock(parsed.content, block);
  return { content, added, alreadyPresent };
}

function formatExportLine(entry: IndexExportEntry): string {
  return `export * from '${entry.specifier}';`;
}

function formatAdditionsBlock(existing: string, lines: readonly string[]): string {
  const sep = existing.length === 0 ? '' : existing.endsWith('\n\n') ? '' : existing.endsWith('\n') ? '\n' : '\n\n';
  return `${sep}${lines.join('\n')}\n`;
}

function appendBlock(existing: string, block: string): string {
  if (!existing) return block.replace(/^\n+/, '');
  return existing + block;
}

export async function applyIndexExports(
  options: ApplyIndexExportsOptions
): Promise<ApplyIndexExportsResult> {
  const entries = planIndexExports(options);
  const { indexFilePath, content: existing, created } = await locateOrPrepareIndexFile(
    options.installRootAbs
  );
  const parsed = parseIndexFile(existing);
  const merged = mergeIndexExports(parsed, entries);

  let wrote = false;
  if (!options.dryRun && merged.content !== existing) {
    await fs.mkdir(path.dirname(indexFilePath), { recursive: true });
    await writeAtomic(indexFilePath, merged.content);
    wrote = true;
  }

  return {
    indexFilePath,
    created,
    before: existing,
    after: merged.content,
    added: merged.added,
    alreadyPresent: merged.alreadyPresent,
    wrote,
    entries,
  };
}

interface LocatedIndexFile {
  indexFilePath: string;
  content: string;
  created: boolean;
}

export interface RemoveIndexExportsOptions {
  installRootAbs: string;
  specifierPrefixes: readonly string[];
  dryRun?: boolean;
}

export interface RemoveIndexExportsResult {
  indexFilePath: string;
  removedSpecifiers: string[];
  before: string;
  after: string;
  wrote: boolean;
}

export async function removeIndexExports(
  options: RemoveIndexExportsOptions
): Promise<RemoveIndexExportsResult> {
  const { indexFilePath, content: before } = await locateOrPrepareIndexFile(options.installRootAbs);
  const parsed = parseIndexFile(before);
  const removedSpecifiers: string[] = [];
  const removalRanges: Array<[number, number]> = [];
  for (const exp of parsed.exports) {
    const matches = options.specifierPrefixes.some((prefix) => {
      if (exp.specifier === prefix) return true;
      return exp.specifier.startsWith(`${prefix}/`);
    });
    if (!matches) continue;
    removedSpecifiers.push(exp.specifier);
    let endIdx = exp.endIndex;
    while (endIdx < before.length && /[ \t]/.test(before[endIdx])) endIdx++;
    if (before[endIdx] === '\n') endIdx++;
    let startIdx = exp.startIndex;
    while (startIdx > 0 && (before[startIdx - 1] === ' ' || before[startIdx - 1] === '\t')) startIdx--;
    removalRanges.push([startIdx, endIdx]);
  }
  if (removalRanges.length === 0) {
    return { indexFilePath, removedSpecifiers: [], before, after: before, wrote: false };
  }
  removalRanges.sort((a, b) => b[0] - a[0]);
  let after = before;
  for (const [start, end] of removalRanges) {
    after = after.slice(0, start) + after.slice(end);
  }
  after = after.replace(/\n{3,}/g, '\n\n');
  let wrote = false;
  if (!options.dryRun && after !== before) {
    await writeAtomic(indexFilePath, after);
    wrote = true;
  }
  return { indexFilePath, removedSpecifiers, before, after, wrote };
}

async function locateOrPrepareIndexFile(installRootAbs: string): Promise<LocatedIndexFile> {
  const candidates = ['index.ts', 'index.tsx', 'index.js', 'index.jsx'];
  for (const name of candidates) {
    const candidate = path.join(installRootAbs, name);
    try {
      const stat = await fs.stat(candidate);
      if (stat.isFile()) {
        const content = await fs.readFile(candidate, 'utf-8');
        return { indexFilePath: candidate, content, created: false };
      }
    } catch {
      // not found, continue
    }
  }
  return {
    indexFilePath: path.join(installRootAbs, 'index.ts'),
    content: '',
    created: true,
  };
}

async function writeAtomic(targetPath: string, content: string): Promise<void> {
  const tmp = `${targetPath}.tmp-${process.pid}-${Date.now()}`;
  await fs.writeFile(tmp, content, 'utf-8');
  await fs.rename(tmp, targetPath);
}

function stripCommentsForScan(source: string): string {
  let out = '';
  let i = 0;
  const len = source.length;
  while (i < len) {
    const ch = source[i];
    const next = i + 1 < len ? source[i + 1] : '';
    if (ch === '/' && next === '*') {
      out += '  ';
      i += 2;
      while (i < len && !(source[i] === '*' && source[i + 1] === '/')) {
        out += source[i] === '\n' ? '\n' : ' ';
        i++;
      }
      if (i < len) {
        out += '  ';
        i += 2;
      }
      continue;
    }
    if (ch === '/' && next === '/') {
      while (i < len && source[i] !== '\n') {
        out += ' ';
        i++;
      }
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch;
      out += ch;
      i++;
      while (i < len && source[i] !== quote) {
        if (source[i] === '\\' && i + 1 < len) {
          out += source[i];
          out += source[i + 1];
          i += 2;
          continue;
        }
        out += source[i];
        i++;
      }
      if (i < len) {
        out += source[i];
        i++;
      }
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}
