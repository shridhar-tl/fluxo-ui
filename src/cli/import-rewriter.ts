import path from 'path';
import type { IconRegistry } from './asset-resolver.js';
import { ICONS_INDEX_SRC_PATH, ICONS_FOLDER_SRC_PATH } from './asset-resolver.js';

const SOURCE_FILE_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];
const ASSET_FILE_EXTENSIONS = ['.scss', '.css', '.json', '.svg'];

const IMPORT_FROM_RE = /(\bimport\b(?:\s+type)?(?:\s+[\s\S]*?)?\s+from\s*)(['"])([^'"]+)\2/g;
const IMPORT_SIDE_EFFECT_RE = /(\bimport\s*)(['"])([^'"]+)\2/g;
const EXPORT_FROM_RE = /(\bexport\s+(?:type\s+)?(?:\*|\{[\s\S]*?\}|\*\s+as\s+[A-Za-z0-9_$]+)\s+from\s*)(['"])([^'"]+)\2/g;
const DYNAMIC_IMPORT_RE = /(\bimport\s*\(\s*)(['"])([^'"]+)\2(\s*\))/g;

export interface RewriteContext {
  fileSrcPath: string;
  targetMap: Map<string, string>;
  fileExistsInSrc: (srcRelative: string) => boolean;
  iconRegistry: IconRegistry | null;
  installedComponentDirs?: Map<string, string>;
}

export interface RewriteResult {
  content: string;
  discovered: string[];
  unresolved: string[];
  iconImports: string[];
}

export function resolveRelativeSrcImport(
  fileSrcPath: string,
  spec: string,
  fileExistsInSrc: (srcRelative: string) => boolean
): string | null {
  if (!isRelativeSpec(spec)) return null;
  const fromDir = path.posix.dirname(toPosix(fileSrcPath));
  const joined = posixJoin(fromDir, stripQuery(spec));
  const candidate = posixNormalize(joined);
  if (!candidate) return null;
  const queryless = stripQuery(candidate);

  if (fileExistsInSrc(queryless)) return queryless;
  for (const ext of SOURCE_FILE_EXTENSIONS) {
    if (fileExistsInSrc(`${queryless}${ext}`)) return `${queryless}${ext}`;
  }
  for (const ext of ASSET_FILE_EXTENSIONS) {
    if (fileExistsInSrc(`${queryless}${ext}`)) return `${queryless}${ext}`;
  }
  for (const ext of SOURCE_FILE_EXTENSIONS) {
    if (fileExistsInSrc(`${queryless}/index${ext}`)) return `${queryless}/index${ext}`;
  }
  return null;
}

export function rewriteFileContent(content: string, ctx: RewriteContext): RewriteResult {
  const discovered = new Set<string>();
  const unresolved = new Set<string>();
  const iconImports = new Set<string>();
  let result = content;

  result = rewriteIconNamedImports(result, ctx, iconImports, discovered);

  const replaceWith = (
    re: RegExp,
    handler: (match: RegExpExecArray, originalSpec: string) => string
  ): string => {
    let out = '';
    let lastIndex = 0;
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(result)) !== null) {
      out += result.slice(lastIndex, m.index);
      out += handler(m, m[3] ?? m[m.length - 2]);
      lastIndex = re.lastIndex;
    }
    out += result.slice(lastIndex);
    return out;
  };

  const handleSpec = (spec: string): string => {
    if (!isRelativeSpec(spec)) return spec;
    const queryIdx = spec.indexOf('?');
    const query = queryIdx >= 0 ? spec.slice(queryIdx) : '';
    const resolvedSrc = resolveRelativeSrcImport(ctx.fileSrcPath, spec, ctx.fileExistsInSrc);
    if (!resolvedSrc) {
      if (specPointsToVendoredTarget(ctx, spec)) {
        return spec;
      }
      unresolved.add(spec);
      return spec;
    }
    discovered.add(resolvedSrc);
    const targetForResolved = ctx.targetMap.get(resolvedSrc);
    const targetForFile = ctx.targetMap.get(ctx.fileSrcPath);
    if (!targetForResolved || !targetForFile) {
      unresolved.add(spec);
      return spec;
    }
    const newRelative = computeRelative(targetForFile, targetForResolved);
    return ensureSpecifier(newRelative, spec) + query;
  };

  result = replaceWith(IMPORT_FROM_RE, (match) => {
    const before = match[1];
    const quote = match[2];
    const spec = match[3];
    return `${before}${quote}${handleSpec(spec)}${quote}`;
  });

  result = replaceWith(EXPORT_FROM_RE, (match) => {
    const before = match[1];
    const quote = match[2];
    const spec = match[3];
    return `${before}${quote}${handleSpec(spec)}${quote}`;
  });

  result = replaceWith(DYNAMIC_IMPORT_RE, (match) => {
    const before = match[1];
    const quote = match[2];
    const spec = match[3];
    const after = match[4];
    return `${before}${quote}${handleSpec(spec)}${quote}${after}`;
  });

  result = replaceWith(IMPORT_SIDE_EFFECT_RE, (match) => {
    const fullMatch = match[0];
    if (/\bfrom\s*$/.test(match[1])) return fullMatch;
    if (/^\s*import\s*\(/.test(match[1])) return fullMatch;
    if (/^\s*import\s*[A-Za-z_*{]/.test(match[1])) return fullMatch;
    const quote = match[2];
    const spec = match[3];
    return `${match[1]}${quote}${handleSpec(spec)}${quote}`;
  });

  return {
    content: result,
    discovered: [...discovered].sort(),
    unresolved: [...unresolved].sort(),
    iconImports: [...iconImports].sort(),
  };
}

interface NamedImportToken {
  importedName: string;
  localName: string;
  isType: boolean;
}

interface ParsedNamedImportClause {
  tokens: NamedImportToken[];
  hasDefault: boolean;
  hasNamespace: boolean;
  raw: string;
}

const NAMED_IMPORT_BLOCK_RE = /(\bimport\s+)([\s\S]*?)(\bfrom\s+)(['"])([^'"]+)\4/g;

function rewriteIconNamedImports(
  content: string,
  ctx: RewriteContext,
  iconImports: Set<string>,
  discovered: Set<string>
): string {
  if (!ctx.iconRegistry) return content;

  let out = '';
  let lastIndex = 0;
  NAMED_IMPORT_BLOCK_RE.lastIndex = 0;
  let m: RegExpExecArray | null;

  while ((m = NAMED_IMPORT_BLOCK_RE.exec(content)) !== null) {
    const importKw = m[1];
    const clause = m[2];
    const fromKw = m[3];
    const quote = m[4];
    const spec = m[5];

    if (!isRelativeSpec(spec)) {
      out += content.slice(lastIndex, NAMED_IMPORT_BLOCK_RE.lastIndex);
      lastIndex = NAMED_IMPORT_BLOCK_RE.lastIndex;
      continue;
    }
    if (!specResolvesToIconsIndex(ctx.fileSrcPath, spec)) {
      out += content.slice(lastIndex, NAMED_IMPORT_BLOCK_RE.lastIndex);
      lastIndex = NAMED_IMPORT_BLOCK_RE.lastIndex;
      continue;
    }

    const parsed = parseNamedImportClause(clause);
    if (!parsed.tokens.length || parsed.hasDefault || parsed.hasNamespace) {
      out += content.slice(lastIndex, NAMED_IMPORT_BLOCK_RE.lastIndex);
      lastIndex = NAMED_IMPORT_BLOCK_RE.lastIndex;
      continue;
    }

    const targetForFile = ctx.targetMap.get(ctx.fileSrcPath);
    if (!targetForFile) {
      out += content.slice(lastIndex, NAMED_IMPORT_BLOCK_RE.lastIndex);
      lastIndex = NAMED_IMPORT_BLOCK_RE.lastIndex;
      continue;
    }

    const replacementLines: string[] = [];
    let allResolved = true;
    for (const token of parsed.tokens) {
      const entry = ctx.iconRegistry.byName.get(token.importedName);
      if (!entry) {
        allResolved = false;
        break;
      }
      iconImports.add(entry.svgRelative);
      discovered.add(entry.svgRelative);
      const targetForSvg = ctx.targetMap.get(entry.svgRelative);
      if (!targetForSvg) {
        allResolved = false;
        break;
      }
      const newRel = computeRelative(targetForFile, targetForSvg);
      const specWithQuery = `${ensureSpecifier(newRel, spec)}${entry.importQuery}`;
      const typePrefix = token.isType ? 'type ' : '';
      replacementLines.push(`import ${typePrefix}${token.localName} from ${quote}${specWithQuery}${quote};`);
    }

    if (!allResolved) {
      out += content.slice(lastIndex, NAMED_IMPORT_BLOCK_RE.lastIndex);
      lastIndex = NAMED_IMPORT_BLOCK_RE.lastIndex;
      continue;
    }

    out += content.slice(lastIndex, m.index);
    out += replacementLines.join('\n');
    let restStart = NAMED_IMPORT_BLOCK_RE.lastIndex;
    while (restStart < content.length && (content[restStart] === ' ' || content[restStart] === '\t')) restStart++;
    if (content[restStart] === ';') restStart++;
    lastIndex = restStart;
    void importKw;
    void fromKw;
  }
  out += content.slice(lastIndex);
  return out;
}

function parseNamedImportClause(clause: string): ParsedNamedImportClause {
  const trimmed = clause.trim();
  const hasNamespace = /\*\s+as\s+/.test(trimmed);
  const braceMatch = trimmed.match(/\{([\s\S]*)\}/);
  const beforeBrace = braceMatch ? trimmed.slice(0, braceMatch.index!) : trimmed;
  const hasDefault = /[A-Za-z_$][A-Za-z0-9_$]*\s*,\s*\{/.test(trimmed)
    || /^\s*[A-Za-z_$][A-Za-z0-9_$]*\s*$/.test(beforeBrace.replace(/\b(type)\b/, '').trim());
  const tokens: NamedImportToken[] = [];
  if (braceMatch) {
    const body = braceMatch[1];
    for (const raw of body.split(',')) {
      const part = raw.trim();
      if (!part) continue;
      let isType = false;
      let work = part;
      if (/^type\s+/.test(work)) {
        isType = true;
        work = work.replace(/^type\s+/, '').trim();
      }
      const asMatch = work.match(/^([A-Za-z_$][A-Za-z0-9_$]*)\s+as\s+([A-Za-z_$][A-Za-z0-9_$]*)$/);
      if (asMatch) {
        tokens.push({ importedName: asMatch[1], localName: asMatch[2], isType });
      } else if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(work)) {
        tokens.push({ importedName: work, localName: work, isType });
      }
    }
  }
  return { tokens, hasDefault, hasNamespace, raw: clause };
}

export function isRelativeSpec(spec: string): boolean {
  return spec.startsWith('./') || spec.startsWith('../') || spec === '.' || spec === '..';
}

function stripQuery(spec: string): string {
  const q = spec.indexOf('?');
  return q >= 0 ? spec.slice(0, q) : spec;
}

function toPosix(p: string): string {
  return p.split(path.sep).join('/');
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

function computeRelative(fromTarget: string, toTarget: string): string {
  const fromDir = path.posix.dirname(toPosix(fromTarget));
  const toFile = toPosix(toTarget);
  let rel = path.posix.relative(fromDir || '.', toFile);
  if (!rel.startsWith('.') && !rel.startsWith('/')) rel = `./${rel}`;
  return rel;
}

function specPointsToVendoredTarget(ctx: RewriteContext, spec: string): boolean {
  const targetForFile = ctx.targetMap.get(ctx.fileSrcPath);
  if (!targetForFile) return false;
  const queryless = stripQuery(spec);
  const fromDir = path.posix.dirname(toPosix(targetForFile));
  const joined = posixJoin(fromDir, queryless);
  const candidate = posixNormalize(joined);
  if (!candidate) return false;
  for (const targetRel of ctx.targetMap.values()) {
    if (targetRel === candidate) return true;
  }
  return false;
}

function specResolvesToIconsIndex(fileSrcPath: string, spec: string): boolean {
  const queryless = stripQuery(spec);
  const fromDir = path.posix.dirname(toPosix(fileSrcPath));
  const joined = posixJoin(fromDir, queryless);
  const candidate = posixNormalize(joined);
  return (
    candidate === ICONS_INDEX_SRC_PATH.replace(/\.ts$/, '')
    || candidate === ICONS_INDEX_SRC_PATH
    || candidate === ICONS_FOLDER_SRC_PATH
  );
}

function ensureSpecifier(newRelative: string, originalSpec: string): string {
  let withoutExt = newRelative;
  const original = stripQuery(originalSpec);
  const originalHadExt = SOURCE_FILE_EXTENSIONS.some((ext) => original.endsWith(ext))
    || ASSET_FILE_EXTENSIONS.some((ext) => original.endsWith(ext));
  if (!originalHadExt) {
    for (const ext of SOURCE_FILE_EXTENSIONS) {
      if (withoutExt.endsWith(ext)) {
        withoutExt = withoutExt.slice(0, -ext.length);
        break;
      }
    }
    if (withoutExt.endsWith('/index')) withoutExt = withoutExt.slice(0, -'/index'.length);
  }
  return withoutExt;
}
