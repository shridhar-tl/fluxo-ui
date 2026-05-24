import path from 'path';
import type { SourceProvider } from './source-provider.js';

export interface StylesBundleEntry {
  srcRelative: string;
  targetRelative: string;
  isText: boolean;
}

export const AVAILABLE_THEMES = [
  'blue',
  'lara',
  'green',
  'purple',
  'orange',
  'indigo',
  'rose',
  'amber',
  'teal',
  'emerald',
  'fuchsia',
  'slate',
] as const;

export type ThemeId = typeof AVAILABLE_THEMES[number];

export const DEFAULT_THEME: ThemeId = 'blue';

export function isValidTheme(value: string): value is ThemeId {
  return (AVAILABLE_THEMES as readonly string[]).includes(value);
}

export function normalizeThemeList(input: readonly string[]): {
  valid: ThemeId[];
  invalid: string[];
} {
  const valid: ThemeId[] = [];
  const invalid: string[] = [];
  const seen = new Set<string>();
  for (const raw of input) {
    const cleaned = raw.trim().toLowerCase();
    if (!cleaned || seen.has(cleaned)) continue;
    seen.add(cleaned);
    if (isValidTheme(cleaned)) valid.push(cleaned);
    else invalid.push(cleaned);
  }
  return { valid, invalid };
}

const BASE_THEME_FILE = 'styles/base-theme.css';
const STYLES_INDEX_SOURCE = 'styles/components.css';
const STYLES_INDEX_TARGET = 'styles/index.css';
const EUI_VARS_SOURCE = 'components/_eui-vars.scss';
const EUI_VARS_TARGET_SCSS = '_eui-vars.scss';
const EUI_VARS_TARGET_CSS = '_eui-vars.css';
const EUI_BASE_SOURCE = 'components/eui-base.scss';
const EUI_BASE_TARGET_SCSS = 'eui-base.scss';
const EUI_BASE_TARGET_CSS = 'eui-base.css';

export interface BuildStylesBundleOptions {
  cssMode: boolean;
  themes: readonly string[];
}

function themeFileFor(themeId: string): string {
  return `styles/theme-${themeId}.css`;
}

function selectedThemeFiles(themes: readonly string[]): string[] {
  const { valid } = normalizeThemeList(themes);
  const list = valid.length > 0 ? valid : [DEFAULT_THEME];
  return list.map(themeFileFor);
}

export function buildStylesBundleEntries(options: BuildStylesBundleOptions): StylesBundleEntry[] {
  const entries: StylesBundleEntry[] = [];
  entries.push({
    srcRelative: BASE_THEME_FILE,
    targetRelative: BASE_THEME_FILE,
    isText: true,
  });
  for (const themeFile of selectedThemeFiles(options.themes)) {
    entries.push({
      srcRelative: themeFile,
      targetRelative: themeFile,
      isText: true,
    });
  }
  entries.push({
    srcRelative: STYLES_INDEX_SOURCE,
    targetRelative: STYLES_INDEX_TARGET,
    isText: true,
  });
  entries.push({
    srcRelative: EUI_VARS_SOURCE,
    targetRelative: options.cssMode ? EUI_VARS_TARGET_CSS : EUI_VARS_TARGET_SCSS,
    isText: true,
  });
  entries.push({
    srcRelative: EUI_BASE_SOURCE,
    targetRelative: options.cssMode ? EUI_BASE_TARGET_CSS : EUI_BASE_TARGET_SCSS,
    isText: true,
  });
  return entries;
}

export function getStylesBundleSrcPaths(options: BuildStylesBundleOptions): string[] {
  return [
    BASE_THEME_FILE,
    ...selectedThemeFiles(options.themes),
    STYLES_INDEX_SOURCE,
    EUI_VARS_SOURCE,
    EUI_BASE_SOURCE,
  ];
}

export async function fetchStylesBundleContents(
  provider: SourceProvider,
  options: BuildStylesBundleOptions
): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  for (const srcRel of getStylesBundleSrcPaths(options)) {
    const text = await provider.fetchText(srcRel);
    if (text != null) out.set(srcRel, text);
  }
  return out;
}

export function rewriteStylesIndexForThemes(
  componentsCssContent: string,
  themes: readonly string[]
): string {
  const { valid } = normalizeThemeList(themes);
  const list = valid.length > 0 ? valid : [DEFAULT_THEME];
  const wantedFiles = new Set<string>();
  wantedFiles.add('./base-theme.css');
  for (const t of list) wantedFiles.add(`./theme-${t}.css`);
  const lines = componentsCssContent.split(/\r?\n/);
  const kept: string[] = [];
  for (const rawLine of lines) {
    const m = rawLine.match(/@import\s+['"]([^'"]+)['"]/);
    if (!m) {
      kept.push(rawLine);
      continue;
    }
    if (wantedFiles.has(m[1])) {
      kept.push(rawLine);
    }
  }
  return kept.join('\n');
}

export function isStylesBundleScssFile(srcRelative: string): boolean {
  return srcRelative === EUI_VARS_SOURCE || srcRelative === EUI_BASE_SOURCE;
}

export function targetForStylesBundleSource(
  srcRelative: string,
  options: BuildStylesBundleOptions
): string | null {
  if (srcRelative === EUI_VARS_SOURCE) {
    return options.cssMode ? EUI_VARS_TARGET_CSS : EUI_VARS_TARGET_SCSS;
  }
  if (srcRelative === EUI_BASE_SOURCE) {
    return options.cssMode ? EUI_BASE_TARGET_CSS : EUI_BASE_TARGET_SCSS;
  }
  if (srcRelative === STYLES_INDEX_SOURCE) return STYLES_INDEX_TARGET;
  if (srcRelative === BASE_THEME_FILE) return srcRelative;
  if (selectedThemeFiles(options.themes).includes(srcRelative)) return srcRelative;
  return null;
}

export function isComponentScssFile(targetRelative: string): boolean {
  return targetRelative.endsWith('.scss');
}

export function isVendoredScssAtInstallRoot(targetRelative: string): boolean {
  if (!targetRelative.endsWith('.scss')) return false;
  const segments = targetRelative.split('/');
  return segments.length === 1;
}

export function rewriteScssEuiVarsPath(content: string, targetRelative: string): string {
  const depth = depthFromInstallRoot(targetRelative);
  if (depth <= 0) return content;
  const expectedPath = depth === 1 ? '../eui-vars' : `${'../'.repeat(depth)}eui-vars`;
  return content.replace(
    /(@use\s+['"])(\.{1,2}\/eui-vars|_eui-vars|eui-vars)(['"])/g,
    (_match, prefix: string, _path: string, suffix: string) => `${prefix}${expectedPath}${suffix}`
  );
}

function depthFromInstallRoot(targetRelative: string): number {
  const norm = targetRelative.split(path.sep).join('/');
  const segments = norm.split('/').filter((s) => s.length > 0);
  return Math.max(0, segments.length - 1);
}

export function rewriteTsxScssImportToCss(content: string): string {
  const stringPattern = /(['"])([^'"]+\.scss)(\1)/g;
  return content.replace(stringPattern, (_match, q1: string, spec: string, q2: string) => {
    const replaced = spec.replace(/\.scss$/, '.css');
    return `${q1}${replaced}${q2}`;
  });
}

export function rewriteScssImportsToCss(content: string): string {
  return content.replace(
    /(@(?:use|import|forward)\s+['"])([^'"]+?)(['"])/g,
    (_match, prefix: string, spec: string, suffix: string) => {
      const replaced = rewriteScssSpecToCss(spec);
      return `${prefix}${replaced}${suffix}`;
    }
  );
}

function rewriteScssSpecToCss(spec: string): string {
  if (spec.endsWith('.scss')) return spec.replace(/\.scss$/, '.css');
  if (spec.endsWith('.css')) return spec;
  return `${spec}.css`;
}
