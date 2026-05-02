import path from 'path';
import { promises as fs } from 'fs';
import type { DependencyPlan, PlanFile } from './dependency-planner.js';
import { rewriteFileContent } from './import-rewriter.js';
import type { RewriteContext } from './import-rewriter.js';
import {
  setInstalledComponent,
  type FluxoConfig,
  type ComponentFileEntry,
} from './config.js';
import {
  computeBufferChecksum,
  computeStringChecksum,
  computeFileChecksum,
} from './checksum.js';
import {
  rewriteScssEuiVarsPath,
  rewriteTsxScssImportToCss,
  rewriteScssImportsToCss,
  rewriteStylesIndexForThemes,
} from './styles-bundle.js';

export type FileConflictKind =
  | 'new'
  | 'unchanged'
  | 'updated'
  | 'locally-modified'
  | 'foreign';

export type FileConflictDecision = 'overwrite' | 'skip';

export interface FileConflictContext {
  srcRelative: string;
  targetRelative: string;
  targetAbsolute: string;
  kind: FileConflictKind;
  componentId: string | null;
  isText: boolean;
  recordedChecksum: string | null;
  onDiskChecksum: string | null;
  newChecksum: string;
}

export type FileConflictResolver = (
  ctx: FileConflictContext
) => FileConflictDecision | Promise<FileConflictDecision>;

export interface FileOutcome {
  srcRelative: string;
  targetRelative: string;
  componentId: string | null;
  kind: FileConflictKind;
  decision: 'wrote' | 'skipped' | 'unchanged';
  newChecksum: string;
  onDiskChecksum: string | null;
  recordedChecksum: string | null;
}

export interface ApplyPlanOptions {
  plan: DependencyPlan;
  installRootAbs: string;
  config: FluxoConfig;
  version: string;
  dryRun?: boolean;
  forceMode?: boolean;
  cssMode?: boolean;
  themes?: readonly string[];
  resolveConflict?: FileConflictResolver;
  manifestComponentName?: (componentId: string) => string | undefined;
}

export interface ApplyPlanResult {
  written: string[];
  skipped: string[];
  unchanged: string[];
  outcomes: FileOutcome[];
  conflicts: FileOutcome[];
  config: FluxoConfig;
  unresolvedImports: { fromFile: string; spec: string }[];
}

export async function applyDependencyPlan(options: ApplyPlanOptions): Promise<ApplyPlanResult> {
  const { plan } = options;
  const cssMode = options.cssMode === true;
  const themes = options.themes ?? [];
  const transformedPlanFiles = await applyCssModeTransforms(plan, cssMode);

  const targetMap = new Map<string, string>();
  for (const entry of transformedPlanFiles) {
    targetMap.set(entry.srcRelative, entry.targetRelative);
  }

  const fileExistsInSrc = (srcRelative: string): boolean => targetMap.has(srcRelative);

  const written: string[] = [];
  const skipped: string[] = [];
  const unchanged: string[] = [];
  const outcomes: FileOutcome[] = [];
  const conflicts: FileOutcome[] = [];
  const allUnresolved: { fromFile: string; spec: string }[] = [...plan.unresolvedImports];

  const filesByComponentTarget = new Map<string, ComponentFileEntry[]>();
  const initBucket = (componentId: string): ComponentFileEntry[] => {
    const existing = filesByComponentTarget.get(componentId);
    if (existing) return existing;
    const arr: ComponentFileEntry[] = [];
    filesByComponentTarget.set(componentId, arr);
    return arr;
  };

  const recordedByTarget = buildRecordedChecksumMap(options.config, options.installRootAbs);

  for (const file of transformedPlanFiles) {
    const prepared = await prepareFileForWrite(file, plan, targetMap, fileExistsInSrc, cssMode, themes);
    if (!prepared) {
      const stub: FileOutcome = {
        srcRelative: file.srcRelative,
        targetRelative: file.targetRelative,
        componentId: file.componentId,
        kind: 'new',
        decision: 'skipped',
        newChecksum: '',
        onDiskChecksum: null,
        recordedChecksum: null,
      };
      outcomes.push(stub);
      skipped.push(file.targetRelative);
      continue;
    }
    if (prepared.unresolved.length > 0) {
      for (const u of prepared.unresolved) {
        allUnresolved.push({ fromFile: file.srcRelative, spec: u });
      }
    }

    const newChecksum = prepared.binary
      ? computeBufferChecksum(prepared.binary)
      : computeStringChecksum(prepared.text!);

    const absTarget = path.join(options.installRootAbs, ...file.targetRelative.split('/'));
    const onDiskChecksum = await safeOnDiskChecksum(absTarget);
    const recordedChecksum = recordedByTarget.get(file.targetRelative) ?? null;

    const kind = classifyConflict({
      onDisk: onDiskChecksum,
      recorded: recordedChecksum,
      next: newChecksum,
    });

    let decision: 'wrote' | 'skipped' | 'unchanged';
    if (kind === 'unchanged') {
      decision = 'unchanged';
    } else if (kind === 'new' || kind === 'updated') {
      decision = 'wrote';
    } else {
      const resolved = await resolveDecision({
        kind,
        file,
        absTarget,
        onDiskChecksum,
        recordedChecksum,
        newChecksum,
        forceMode: options.forceMode === true,
        resolver: options.resolveConflict,
      });
      decision = resolved === 'overwrite' ? 'wrote' : 'skipped';
    }

    if (!options.dryRun && decision === 'wrote') {
      await fs.mkdir(path.dirname(absTarget), { recursive: true });
      if (prepared.binary) {
        await writeBinaryAtomic(absTarget, prepared.binary);
      } else {
        await writeTextAtomic(absTarget, prepared.text!);
      }
    }

    const outcome: FileOutcome = {
      srcRelative: file.srcRelative,
      targetRelative: file.targetRelative,
      componentId: file.componentId,
      kind,
      decision,
      newChecksum,
      onDiskChecksum,
      recordedChecksum,
    };
    outcomes.push(outcome);
    if (decision === 'wrote') written.push(file.targetRelative);
    else if (decision === 'unchanged') unchanged.push(file.targetRelative);
    else skipped.push(file.targetRelative);

    if (kind === 'locally-modified' || kind === 'foreign') {
      conflicts.push(outcome);
    }

    if (file.componentId) {
      initBucket(file.componentId).push({
        path: file.targetRelative.split('/').slice(1).join('/'),
        checksum: newChecksum,
      });
    }
  }

  let config = options.config;
  for (const [componentId, files] of filesByComponentTarget.entries()) {
    const displayName = options.manifestComponentName?.(componentId) ?? componentId;
    config = setInstalledComponent(config, componentId, {
      name: displayName,
      version: options.version,
      files,
    });
  }

  return {
    written,
    skipped,
    unchanged,
    outcomes,
    conflicts,
    config,
    unresolvedImports: allUnresolved,
  };
}

interface PreparedFile {
  text?: string;
  binary?: Buffer;
  unresolved: string[];
}

async function prepareFileForWrite(
  file: PlanFile,
  plan: DependencyPlan,
  targetMap: Map<string, string>,
  fileExistsInSrc: (srcRelative: string) => boolean,
  cssMode: boolean,
  themes: readonly string[]
): Promise<PreparedFile | null> {
  if (!file.isText) {
    const buf = plan.binaryCache.get(file.srcRelative);
    if (!buf) return null;
    return { binary: buf, unresolved: [] };
  }
  const text = plan.contentCache.get(file.srcRelative);
  if (text == null) return null;
  const targetExt = path.posix.extname(file.targetRelative);
  if (targetExt === '.scss' || targetExt === '.css') {
    let content = text;
    content = stripPropsJsonImports(content);
    if (file.kind === 'styles-bundle' && file.srcRelative === 'styles/components.css') {
      content = rewriteStylesIndexForThemes(content, themes);
    }
    if (cssMode) {
      if (targetExt === '.css' && path.posix.extname(file.srcRelative) === '.scss') {
        const euiVarsSource = plan.contentCache.get('components/_eui-vars.scss') ?? '';
        content = await compileScssToCss(content, file.srcRelative, euiVarsSource);
      } else {
        content = rewriteScssImportsToCss(content);
      }
    } else {
      content = rewriteScssEuiVarsPath(content, file.targetRelative);
    }
    return { text: content, unresolved: [] };
  }
  if (!shouldRewrite(file)) {
    return { text, unresolved: [] };
  }
  const ctx: RewriteContext = {
    fileSrcPath: file.srcRelative,
    targetMap,
    fileExistsInSrc,
    iconRegistry: plan.iconRegistry,
  };
  const rewrite = rewriteFileContent(text, ctx);
  let finalContent = stripPropsJsonImports(rewrite.content);
  if (cssMode) {
    finalContent = rewriteTsxScssImportToCss(finalContent);
  }
  return { text: finalContent, unresolved: rewrite.unresolved };
}

function shouldRewrite(file: PlanFile): boolean {
  const ext = path.posix.extname(file.srcRelative);
  return ext === '.ts' || ext === '.tsx' || ext === '.js' || ext === '.jsx';
}

const PROPS_JSON_IMPORT_RE =
  /^\s*import\s+[\s\S]*?from\s+['"][^'"]+\.props\.json['"]\s*;?\s*\r?\n/gm;
const PROPS_JSON_TYPE_USAGE_RE = /\bassert\s*\{\s*type:\s*['"]json['"]\s*\}/g;

function stripPropsJsonImports(content: string): string {
  if (!/\.props\.json/.test(content)) return content;
  const cleaned = content.replace(PROPS_JSON_IMPORT_RE, '');
  return cleaned.replace(PROPS_JSON_TYPE_USAGE_RE, '');
}

async function applyCssModeTransforms(plan: DependencyPlan, cssMode: boolean): Promise<PlanFile[]> {
  if (!cssMode) return plan.files;
  return plan.files.map((file) => {
    if (file.kind === 'styles-bundle' && file.srcRelative === 'components/_eui-vars.scss') {
      return { ...file, targetRelative: '_eui-vars.css' };
    }
    if (file.isText && file.targetRelative.endsWith('.scss')) {
      const targetCss = file.targetRelative.replace(/\.scss$/, '.css');
      return { ...file, targetRelative: targetCss };
    }
    return file;
  });
}

type SassModule = typeof import('sass');
let cachedSassModule: SassModule | null = null;

async function loadSass(): Promise<SassModule> {
  if (cachedSassModule) return cachedSassModule;
  try {
    const moduleId = 'sass';
    const dynamicImport = new Function('id', 'return import(id)') as (id: string) => Promise<SassModule>;
    const mod = await dynamicImport(moduleId);
    cachedSassModule = mod;
    return mod;
  } catch (err) {
    throw new Error(
      `Failed to load the 'sass' package required for --css mode. Install it with \`npm install sass\` or remove --css. (${err instanceof Error ? err.message : String(err)})`
    );
  }
}

async function compileScssToCss(
  scssSource: string,
  srcRelative: string,
  euiVarsSource: string
): Promise<string> {
  const sass = await loadSass();
  const result = sass.compileString(scssSource, {
    style: 'expanded',
    loadPaths: [],
    importers: [
      {
        canonicalize(url: string): URL | null {
          const cleaned = url.replace(/^['"]|['"]$/g, '');
          if (
            /(^|\/)_?eui-vars(\.scss)?$/.test(cleaned) ||
            cleaned === 'eui-vars' ||
            cleaned === '_eui-vars'
          ) {
            return new URL('eui-vars://shared');
          }
          return null;
        },
        load(canonicalUrl: URL): { contents: string; syntax: 'scss' } | null {
          if (canonicalUrl.href === 'eui-vars://shared') {
            return { contents: euiVarsSource, syntax: 'scss' };
          }
          return null;
        },
      },
    ],
  });
  void srcRelative;
  return result.css;
}

async function writeTextAtomic(target: string, content: string): Promise<void> {
  const tmp = `${target}.tmp-${process.pid}-${Date.now()}`;
  await fs.writeFile(tmp, content, 'utf-8');
  await fs.rename(tmp, target);
}

async function writeBinaryAtomic(target: string, buf: Buffer): Promise<void> {
  const tmp = `${target}.tmp-${process.pid}-${Date.now()}`;
  await fs.writeFile(tmp, buf);
  await fs.rename(tmp, target);
}

function classifyConflict(args: {
  onDisk: string | null;
  recorded: string | null;
  next: string;
}): FileConflictKind {
  if (args.onDisk === null) return 'new';
  if (args.onDisk === args.next) return 'unchanged';
  if (args.recorded && args.onDisk === args.recorded) return 'updated';
  if (args.recorded && args.onDisk !== args.recorded) return 'locally-modified';
  return 'foreign';
}

async function safeOnDiskChecksum(absPath: string): Promise<string | null> {
  try {
    const stat = await fs.stat(absPath);
    if (!stat.isFile()) return null;
  } catch {
    return null;
  }
  try {
    return await computeFileChecksum(absPath);
  } catch {
    return null;
  }
}

function buildRecordedChecksumMap(config: FluxoConfig, installRootAbs: string): Map<string, string> {
  void installRootAbs;
  const out = new Map<string, string>();
  for (const [componentId, entry] of Object.entries(config.components)) {
    for (const fileEntry of entry.files) {
      const targetRelative = `${componentId}/${fileEntry.path}`;
      out.set(targetRelative, fileEntry.checksum);
    }
  }
  return out;
}

interface ResolveDecisionArgs {
  kind: FileConflictKind;
  file: PlanFile;
  absTarget: string;
  onDiskChecksum: string | null;
  recordedChecksum: string | null;
  newChecksum: string;
  forceMode: boolean;
  resolver: FileConflictResolver | undefined;
}

async function resolveDecision(args: ResolveDecisionArgs): Promise<FileConflictDecision> {
  if (args.resolver) {
    const ctx: FileConflictContext = {
      srcRelative: args.file.srcRelative,
      targetRelative: args.file.targetRelative,
      targetAbsolute: args.absTarget,
      kind: args.kind,
      componentId: args.file.componentId,
      isText: args.file.isText,
      recordedChecksum: args.recordedChecksum,
      onDiskChecksum: args.onDiskChecksum,
      newChecksum: args.newChecksum,
    };
    return await args.resolver(ctx);
  }
  if (args.forceMode) return 'overwrite';
  return 'skip';
}
