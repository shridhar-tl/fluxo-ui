import { promises as fs } from 'fs';
import path from 'path';
import promptsLib from 'prompts';
import chalk from 'chalk';

interface PromptOnCancelOption {
  onCancel?: () => boolean | void;
}
type PromptQuestion<TName extends string = string> = Parameters<typeof promptsLib<TName>>[0];
import {
  getAllComponents,
  type ManifestComponent,
} from './manifest.js';
import type {
  FileConflictContext,
  FileConflictDecision,
  FileConflictResolver,
} from './installer.js';
import type { ComponentDriftReport } from './config.js';

export interface PromptCancellation {
  cancelled: true;
}

export type PromptResult<T> = T | PromptCancellation;

export function isCancelled<T>(value: PromptResult<T>): value is PromptCancellation {
  return typeof value === 'object' && value !== null && (value as PromptCancellation).cancelled === true;
}

const SUPPORTS_INTERACTIVE = process.stdin.isTTY === true && process.stdout.isTTY === true;

export function isInteractive(): boolean {
  return SUPPORTS_INTERACTIVE;
}

let cancelledFlag = false;

function makeOptions(): PromptOnCancelOption {
  return {
    onCancel: () => {
      cancelledFlag = true;
      return false;
    },
  };
}

async function ask<TName extends string>(
  question: PromptQuestion<TName>
): Promise<Record<TName, unknown> | PromptCancellation> {
  cancelledFlag = false;
  const answers = (await promptsLib<TName>(
    question,
    makeOptions() as Parameters<typeof promptsLib<TName>>[1]
  )) as Record<string, unknown>;
  if (cancelledFlag) return { cancelled: true };
  const nameKey = (question as { name: TName }).name;
  if (answers[nameKey] === undefined) return { cancelled: true };
  return answers as Record<TName, unknown>;
}

export function printForceBanner(action: 'add' | 'update' | 'remove'): void {
  const lines = [
    chalk.bgYellow.black.bold(' FORCE MODE '),
    chalk.yellow(`Running \`fluxo-cli ${action}\` with --force.`),
    chalk.yellow(`  • All prompts will be skipped.`),
  ];
  if (action === 'add' || action === 'update') {
    lines.push(chalk.yellow(`  • Locally modified files in the install path WILL be overwritten.`));
    lines.push(
      chalk.yellow(`  • Components and hooks/utils will be ${action === 'add' ? 'added' : 'refreshed'} without confirmation.`),
    );
  } else {
    lines.push(chalk.yellow(`  • Components matching your arguments will be deleted from disk without confirmation.`));
  }
  lines.push('');
  for (const line of lines) console.log(line);
}

export function printSection(title: string): void {
  console.log(chalk.cyan.bold(`\n${title}`));
}

export function printSubtle(text: string): void {
  console.log(chalk.gray(text));
}

export function printWarning(text: string): void {
  console.log(chalk.yellow(text));
}

export function printError(text: string): void {
  console.log(chalk.red(text));
}

export function printSuccess(text: string): void {
  console.log(chalk.green(text));
}

export interface PromptForPathOptions {
  defaultPath: string;
  message?: string;
  validateExists?: boolean;
  projectRoot: string;
}

export async function promptForInstallPath(
  options: PromptForPathOptions
): Promise<PromptResult<string>> {
  if (!isInteractive()) return options.defaultPath;
  const result = await ask<'value'>({
    type: 'text',
    name: 'value',
    message: options.message ?? 'Where should components be installed?',
    initial: options.defaultPath,
    validate: (input: string) => {
      const trimmed = (input ?? '').trim();
      if (!trimmed) return 'Path cannot be empty.';
      return true;
    },
  });
  if (isCancelled(result)) return result;
  const raw = String(result.value ?? '').trim();
  return raw || options.defaultPath;
}

export interface PromptConfirmOptions {
  message: string;
  initial?: boolean;
  hint?: string;
}

export async function promptConfirm(options: PromptConfirmOptions): Promise<PromptResult<boolean>> {
  if (!isInteractive()) return options.initial ?? false;
  const result = await ask<'value'>({
    type: 'confirm',
    name: 'value',
    message: options.message,
    initial: options.initial ?? false,
    hint: options.hint,
  });
  if (isCancelled(result)) return result;
  return Boolean(result.value);
}

export interface PromptComponentSelectionOptions {
  preselected?: string[];
  message?: string;
  includePrivate?: boolean;
  installedIds?: Set<string>;
}

interface ComponentChoice {
  title: string;
  value: string;
  description?: string;
  selected: boolean;
}

export async function promptComponentSelection(
  options: PromptComponentSelectionOptions = {}
): Promise<PromptResult<string[]>> {
  if (!isInteractive()) return options.preselected ?? [];
  const components = await getAllComponents(options.includePrivate ?? false);
  if (components.length === 0) return [];

  const choices = buildComponentChoices(components, {
    preselected: new Set(options.preselected ?? []),
    installedIds: options.installedIds,
  });

  const result = await ask<'value'>({
    type: 'autocompleteMultiselect',
    name: 'value',
    message: options.message ?? 'Select components to add (Space to toggle, Enter to confirm)',
    instructions: false,
    choices,
    min: 1,
    hint: 'Type to filter • Space to toggle • Enter to confirm',
  });
  if (isCancelled(result)) return result;
  const raw = result.value;
  if (!Array.isArray(raw)) return [];
  return raw.map((v: unknown) => String(v));
}

function buildComponentChoices(
  components: ManifestComponent[],
  args: { preselected: Set<string>; installedIds?: Set<string> }
): ComponentChoice[] {
  const sorted = [...components].sort((a, b) => {
    const ca = a.category || 'Other';
    const cb = b.category || 'Other';
    if (ca !== cb) return ca < cb ? -1 : 1;
    const la = (a.label || a.name).toLowerCase();
    const lb = (b.label || b.name).toLowerCase();
    return la < lb ? -1 : la > lb ? 1 : 0;
  });
  return sorted.map((c) => {
    const installed = args.installedIds?.has(c.id) ? ' [installed]' : '';
    const category = c.category ? `${c.category} • ` : '';
    return {
      title: `${category}${c.label || c.name}${installed}`,
      value: c.id,
      description: c.description || undefined,
      selected: args.preselected.has(c.id),
    };
  });
}

export interface PromptUpdateSelectionOptions {
  installedComponents: { id: string; name: string; isModified: boolean }[];
  preselected?: string[];
  message?: string;
}

export async function promptUpdateSelection(
  options: PromptUpdateSelectionOptions
): Promise<PromptResult<string[]>> {
  if (!isInteractive()) return options.preselected ?? options.installedComponents.map((c) => c.id);
  if (options.installedComponents.length === 0) return [];
  const preselected = new Set(options.preselected ?? options.installedComponents.map((c) => c.id));
  const choices: ComponentChoice[] = options.installedComponents.map((c) => ({
    title: `${c.name}${c.isModified ? chalk.yellow(' [locally modified]') : ''}`,
    value: c.id,
    selected: preselected.has(c.id),
  }));

  const result = await ask<'value'>({
    type: 'autocompleteMultiselect',
    name: 'value',
    message: options.message ?? 'Select components to update (Space to toggle, Enter to confirm)',
    instructions: false,
    choices,
    min: 1,
    hint: 'Type to filter • Space to toggle • Enter to confirm',
  });
  if (isCancelled(result)) return result;
  const raw = result.value;
  if (!Array.isArray(raw)) return [];
  return raw.map((v: unknown) => String(v));
}

export interface PromptComponentConflictOptions {
  componentId: string;
  componentName: string;
  componentDir: string;
  fileCount: number;
  mode: 'add' | 'update';
}

export type ComponentConflictDecision = 'overwrite' | 'skip';

export async function promptComponentConflict(
  options: PromptComponentConflictOptions
): Promise<PromptResult<ComponentConflictDecision>> {
  if (!isInteractive()) return 'skip';
  const message =
    options.mode === 'add'
      ? `${options.componentName}: a folder with ${options.fileCount} file(s) already exists at ${options.componentDir}. Overwrite or skip?`
      : `${options.componentName}: ${options.fileCount} file(s) already exist at ${options.componentDir}. Overwrite or skip?`;
  const result = await ask<'value'>({
    type: 'select',
    name: 'value',
    message,
    choices: [
      { title: 'Overwrite (apply update)', value: 'overwrite' },
      { title: 'Skip (keep existing files)', value: 'skip' },
    ],
    initial: 0,
  });
  if (isCancelled(result)) return result;
  return result.value === 'overwrite' ? 'overwrite' : 'skip';
}

export interface PromptMissingComponentOptions {
  componentId: string;
  componentName: string;
  componentDir: string;
  mode: 'update';
}

export async function promptMissingComponentOnUpdate(
  options: PromptMissingComponentOptions
): Promise<PromptResult<'add' | 'skip'>> {
  if (!isInteractive()) return 'skip';
  const result = await ask<'value'>({
    type: 'select',
    name: 'value',
    message: `${options.componentName}: subfolder missing at ${options.componentDir}. Add the component, or skip it?`,
    choices: [
      { title: 'Add (install fresh copy)', value: 'add' },
      { title: 'Skip (do nothing)', value: 'skip' },
    ],
    initial: 0,
  });
  if (isCancelled(result)) return result;
  return result.value === 'add' ? 'add' : 'skip';
}

export interface CreateFileResolverOptions {
  forceMode: boolean;
  mode: 'add' | 'update';
}

interface ConflictBatchDecision {
  applyToAll: 'overwrite' | 'skip' | null;
  applyToAllForeign: 'overwrite' | 'skip' | null;
}

export function createInteractiveFileResolver(options: CreateFileResolverOptions): FileConflictResolver {
  const batch: ConflictBatchDecision = { applyToAll: null, applyToAllForeign: null };
  return async (ctx: FileConflictContext): Promise<FileConflictDecision> => {
    if (options.forceMode) return 'overwrite';
    if (!isInteractive()) return 'skip';
    if (ctx.kind === 'locally-modified' && batch.applyToAll) return batch.applyToAll;
    if (ctx.kind === 'foreign' && batch.applyToAllForeign) return batch.applyToAllForeign;

    const headline =
      ctx.kind === 'locally-modified'
        ? `Locally modified: ${ctx.targetRelative}`
        : `Untracked file at target path: ${ctx.targetRelative}`;
    const subline =
      ctx.kind === 'locally-modified'
        ? 'This file was edited after the last install. Overwriting discards those changes.'
        : 'This file is not tracked by FluxoUI but already lives at the install target.';

    console.log('');
    console.log(chalk.yellow(headline));
    console.log(chalk.gray(`  ${subline}`));

    const result = await ask<'value'>({
      type: 'select',
      name: 'value',
      message: 'How should this file be handled?',
      choices: [
        { title: 'Overwrite this file', value: 'overwrite' },
        { title: 'Skip this file (keep existing)', value: 'skip' },
        { title: 'Overwrite all conflicts of this kind', value: 'overwrite-all' },
        { title: 'Skip all conflicts of this kind', value: 'skip-all' },
      ],
      initial: 1,
    });
    if (isCancelled(result)) return 'skip';

    const choice = String(result.value);
    if (choice === 'overwrite-all') {
      const decision: FileConflictDecision = 'overwrite';
      if (ctx.kind === 'locally-modified') batch.applyToAll = decision;
      else batch.applyToAllForeign = decision;
      return decision;
    }
    if (choice === 'skip-all') {
      const decision: FileConflictDecision = 'skip';
      if (ctx.kind === 'locally-modified') batch.applyToAll = decision;
      else batch.applyToAllForeign = decision;
      return decision;
    }
    return choice === 'overwrite' ? 'overwrite' : 'skip';
  };
}

export interface ResolvePathOptions {
  projectRoot: string;
  defaultPath: string;
  forceMode: boolean;
  initialPath?: string;
  mode: 'add' | 'update';
}

export interface ResolvedPath {
  absolute: string;
  relativeFromRoot: string;
  raw: string;
}

export async function resolveInstallPathInteractive(
  options: ResolvePathOptions
): Promise<PromptResult<ResolvedPath>> {
  const seedPath = options.initialPath || options.defaultPath;

  if (options.forceMode || !isInteractive()) {
    return finalizePath(options.projectRoot, seedPath);
  }

  const promptedPath = await promptForInstallPath({
    defaultPath: seedPath,
    projectRoot: options.projectRoot,
    message:
      options.mode === 'add'
        ? `Install path (default: ${seedPath})`
        : `Update install path (current: ${seedPath})`,
  });
  if (isCancelled(promptedPath)) return promptedPath;
  return finalizePath(options.projectRoot, promptedPath);
}

function finalizePath(projectRoot: string, raw: string): ResolvedPath {
  const trimmed = (raw || '').trim();
  const absolute = path.isAbsolute(trimmed) ? trimmed : path.resolve(projectRoot, trimmed);
  const rel = path.relative(projectRoot, absolute);
  const relativeFromRoot = !rel || rel.startsWith('..')
    ? absolute
    : `./${rel.split(path.sep).join('/')}`;
  return {
    absolute,
    relativeFromRoot,
    raw: trimmed,
  };
}

export async function ensureDirectoryExists(absolute: string): Promise<void> {
  await fs.mkdir(absolute, { recursive: true });
}

export async function directoryHasFiles(absolute: string): Promise<{ exists: boolean; fileCount: number }> {
  try {
    const stat = await fs.stat(absolute);
    if (!stat.isDirectory()) return { exists: false, fileCount: 0 };
  } catch {
    return { exists: false, fileCount: 0 };
  }
  const entries = await fs.readdir(absolute, { withFileTypes: true });
  let fileCount = 0;
  for (const entry of entries) {
    if (entry.isFile()) fileCount += 1;
    else if (entry.isDirectory()) {
      const nested = await fs.readdir(path.join(absolute, entry.name), { withFileTypes: true });
      fileCount += nested.filter((e) => e.isFile()).length;
    }
  }
  return { exists: true, fileCount };
}

export interface ConfirmTsxWarningOptions {
  forceMode: boolean;
}

export async function confirmTsxWarningOnAdd(
  options: ConfirmTsxWarningOptions
): Promise<PromptResult<boolean>> {
  if (options.forceMode) return true;
  if (!isInteractive()) return true;
  console.log(
    chalk.yellow(
      `\n⚠ TypeScript / TSX support was not detected in this project. The components are TSX files and will work only after you install TypeScript and configure JSX support.`
    )
  );
  const decision = await promptConfirm({
    message: 'Continue installing TSX components anyway?',
    initial: false,
  });
  return decision;
}

export async function summarizeDriftBeforeUpdate(
  reports: ComponentDriftReport[],
  forceMode: boolean
): Promise<void> {
  const modified = reports.filter((r) => r.isModified);
  if (modified.length === 0) return;
  console.log(chalk.yellow(`\n${modified.length} component(s) have local modifications:`));
  for (const r of modified) {
    const parts: string[] = [];
    if (r.modifiedFiles.length > 0) parts.push(`${r.modifiedFiles.length} modified`);
    if (r.missingFiles.length > 0) parts.push(`${r.missingFiles.length} missing`);
    if (r.addedFiles.length > 0) parts.push(`${r.addedFiles.length} added`);
    console.log(chalk.yellow(`  • ${r.id}: ${parts.join(', ')}`));
  }
  if (forceMode) {
    console.log(chalk.yellow(`Force mode is active — all local changes will be overwritten.`));
  } else {
    console.log(chalk.gray(`You will be asked per-file before any locally modified file is overwritten.`));
  }
}

export interface PromptThemeSelectionOptions {
  available: readonly string[];
  preselected?: readonly string[];
  message?: string;
}

export async function promptThemeSelection(
  options: PromptThemeSelectionOptions
): Promise<PromptResult<string[]>> {
  if (!isInteractive()) return [...(options.preselected ?? [])];
  const preselected = new Set(options.preselected ?? []);
  const choices = options.available.map((id) => ({
    title: id,
    value: id,
    selected: preselected.has(id),
  }));
  const result = await ask<'value'>({
    type: 'multiselect',
    name: 'value',
    message: options.message ?? 'Select theme(s) to vendor (Space to toggle, Enter to confirm)',
    instructions: false,
    choices,
    min: 1,
    hint: 'Space to toggle • Enter to confirm',
  });
  if (isCancelled(result)) return result;
  const raw = result.value;
  if (!Array.isArray(raw)) return [];
  return raw.map((v: unknown) => String(v));
}

export interface PromptRemoveSelectionOptions {
  installedComponents: { id: string; name: string }[];
  message?: string;
}

export async function promptRemoveSelection(
  options: PromptRemoveSelectionOptions
): Promise<PromptResult<string[]>> {
  if (!isInteractive()) return [];
  if (options.installedComponents.length === 0) return [];
  const choices: ComponentChoice[] = options.installedComponents.map((c) => ({
    title: c.name,
    value: c.id,
    selected: false,
  }));
  const result = await ask<'value'>({
    type: 'autocompleteMultiselect',
    name: 'value',
    message: options.message ?? 'Select components to remove (Space to toggle, Enter to confirm)',
    instructions: false,
    choices,
    min: 1,
    hint: 'Type to filter • Space to toggle • Enter to confirm',
  });
  if (isCancelled(result)) return result;
  const raw = result.value;
  if (!Array.isArray(raw)) return [];
  return raw.map((v: unknown) => String(v));
}

export async function promptRemoveConfirmation(
  ids: string[]
): Promise<PromptResult<boolean>> {
  if (!isInteractive()) return true;
  const result = await ask<'value'>({
    type: 'confirm',
    name: 'value',
    message: `Remove ${ids.length} component(s) (${ids.join(', ')})? Files will be deleted from disk.`,
    initial: false,
  });
  if (isCancelled(result)) return result;
  return Boolean(result.value);
}
