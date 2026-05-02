import type { SourceProvider } from './source-provider.js';

export interface IconExportEntry {
  exportName: string;
  svgRelative: string;
  importQuery: string;
}

export interface IconRegistry {
  byName: Map<string, IconExportEntry>;
  bySvg: Map<string, IconExportEntry[]>;
  source: string;
}

const ICONS_INDEX_PATH = 'assets/icons.ts';
const ICONS_FOLDER = 'assets/icons';

const EXPORT_DEFAULT_AS_RE = /export\s*\{\s*default\s+as\s+([A-Za-z0-9_$]+)(?:\s*,\s*default\s+as\s+([A-Za-z0-9_$]+))*\s*\}\s*from\s*['"]([^'"]+)['"]\s*;?/g;
const EXPORT_DEFAULT_LIST_RE = /export\s*\{\s*((?:default\s+as\s+[A-Za-z0-9_$]+\s*,?\s*)+)\}\s*from\s*['"]([^'"]+)['"]\s*;?/g;
const ALIAS_TOKEN_RE = /default\s+as\s+([A-Za-z0-9_$]+)/g;

export async function loadIconRegistry(provider: SourceProvider): Promise<IconRegistry | null> {
  const content = await provider.fetchText(ICONS_INDEX_PATH);
  if (!content) return null;

  const byName = new Map<string, IconExportEntry>();
  const bySvg = new Map<string, IconExportEntry[]>();

  const stripped = content
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1');

  EXPORT_DEFAULT_LIST_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = EXPORT_DEFAULT_LIST_RE.exec(stripped)) !== null) {
    const aliasBlock = match[1];
    const spec = match[2];
    const { svgRelative, importQuery } = normalizeIconSpec(spec);
    if (!svgRelative) continue;
    ALIAS_TOKEN_RE.lastIndex = 0;
    let aliasMatch: RegExpExecArray | null;
    while ((aliasMatch = ALIAS_TOKEN_RE.exec(aliasBlock)) !== null) {
      const exportName = aliasMatch[1];
      const entry: IconExportEntry = { exportName, svgRelative, importQuery };
      byName.set(exportName, entry);
      const list = bySvg.get(svgRelative) ?? [];
      list.push(entry);
      bySvg.set(svgRelative, list);
    }
  }

  if (byName.size === 0) {
    EXPORT_DEFAULT_AS_RE.lastIndex = 0;
    while ((match = EXPORT_DEFAULT_AS_RE.exec(stripped)) !== null) {
      const exportName = match[1];
      const spec = match[3];
      const { svgRelative, importQuery } = normalizeIconSpec(spec);
      if (!svgRelative) continue;
      const entry: IconExportEntry = { exportName, svgRelative, importQuery };
      byName.set(exportName, entry);
      const list = bySvg.get(svgRelative) ?? [];
      list.push(entry);
      bySvg.set(svgRelative, list);
    }
  }

  return { byName, bySvg, source: content };
}

function normalizeIconSpec(spec: string): { svgRelative: string; importQuery: string } {
  const queryIdx = spec.indexOf('?');
  const rawPath = queryIdx >= 0 ? spec.slice(0, queryIdx) : spec;
  const importQuery = queryIdx >= 0 ? spec.slice(queryIdx) : '';
  const cleaned = rawPath.replace(/^\.\//, '');
  if (!cleaned.endsWith('.svg')) return { svgRelative: '', importQuery };
  const fileName = cleaned.startsWith('icons/') ? cleaned.slice('icons/'.length) : cleaned;
  return { svgRelative: `${ICONS_FOLDER}/${fileName}`, importQuery: importQuery || '?react' };
}

export const ICONS_INDEX_SRC_PATH = ICONS_INDEX_PATH;
export const ICONS_FOLDER_SRC_PATH = ICONS_FOLDER;
