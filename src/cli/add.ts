import path from 'path';
import chalk from 'chalk';
import type { CliOptions } from './types.js';
import { detectProject, formatDetectionWarnings } from './project-detection.js';
import {
  ensureConfig,
  DEFAULT_INSTALL_PATH,
  setInstallPath,
  setThemes,
  setCssMode,
  toRelativeFromRoot,
  writeConfig,
  listInstalledComponents,
  resolveComponentDir,
  type FluxoConfig,
} from './config.js';
import {
  AVAILABLE_THEMES,
  DEFAULT_THEME,
  normalizeThemeList,
} from './styles-bundle.js';
import {
  resolveSourceProvider,
  runInstall,
  validateSourceProvider,
  analyzeExternalDependencies,
  type RunInstallResult,
} from './pipeline.js';
import {
  ConfigStateError,
  PartialInstallError,
  UnknownComponentError,
  reportAndExit,
} from './errors.js';
import { loadManifest, getComponentById } from './manifest.js';
import type { DependencyPlan } from './dependency-planner.js';
import {
  confirmTsxWarningOnAdd,
  createInteractiveFileResolver,
  directoryHasFiles,
  ensureDirectoryExists,
  isCancelled,
  isInteractive,
  printForceBanner,
  printSection,
  printSubtle,
  printWarning,
  promptComponentConflict,
  promptComponentSelection,
  promptThemeSelection,
  resolveInstallPathInteractive,
} from './interactive.js';

export async function handleAdd(options: CliOptions, components?: string[]): Promise<void> {
  try {
    await runHandleAdd(options, components);
  } catch (err) {
    reportAndExit(err, 'add');
  }
}

async function runHandleAdd(options: CliOptions, components?: string[]): Promise<void> {
  const targetPathRaw = options.path || DEFAULT_INSTALL_PATH;
  const forceMode = options.force || false;
  const interactiveMode = !forceMode && isInteractive() && (!components || components.length === 0 || !options.path);

  if (forceMode) printForceBanner('add');

  const detection = await detectProject(targetPathRaw, process.cwd());
  const warnings = formatDetectionWarnings(detection);

  if (warnings) {
    console.log(chalk.yellow(warnings));
  }

  if (!detection.isNpmProject) {
    throw new ConfigStateError(
      'No npm project detected at the current working directory or any parent directory.',
      {
        hint: 'Run `npm init -y` (or pnpm/yarn equivalent) to create a package.json before installing FluxoUI components.',
        mode: 'add',
        exitCode: 1,
      }
    );
  }

  if (!detection.hasTypeScript) {
    const proceed = await confirmTsxWarningOnAdd({ forceMode });
    if (isCancelled(proceed)) {
      console.log(chalk.gray('\nAborted by user.'));
      process.exit(0);
    }
    if (!proceed) {
      console.log(chalk.gray('\nAborted: TypeScript is required for FluxoUI components.'));
      process.exit(0);
    }
  }

  printSection('Project Detection Summary');
  console.log(`  Project Root   : ${detection.projectRoot}`);
  console.log(`  Install Target : ${detection.targetPath}`);
  console.log(`  NPM Project    : ${detection.isNpmProject ? chalk.green('Yes') : chalk.red('No')}`);
  console.log(
    `  TypeScript     : ${detection.hasTypeScript ? chalk.green(`Yes (via ${detection.tsDetectionMethod})`) : chalk.yellow('No')}`
  );
  console.log(`  TSX Files      : ${detection.hasTsxFiles ? chalk.green('Yes') : chalk.gray('No')}`);

  let resolvedPath = targetPathRaw;
  if (interactiveMode && !options.path) {
    const pathResult = await resolveInstallPathInteractive({
      projectRoot: detection.projectRoot,
      defaultPath: DEFAULT_INSTALL_PATH,
      forceMode,
      mode: 'add',
    });
    if (isCancelled(pathResult)) {
      console.log(chalk.gray('\nAborted by user.'));
      process.exit(0);
    }
    resolvedPath = pathResult.relativeFromRoot;
  }

  const installRootAbs = path.resolve(detection.projectRoot, resolvedPath);
  await ensureDirectoryExists(installRootAbs);

  const ensureResult = await ensureConfig(detection.projectRoot, resolvedPath);
  let config = ensureResult.config;
  const configPath = ensureResult.filePath;

  const desiredRelativePath = toRelativeFromRoot(detection.projectRoot, resolvedPath);
  if (config.path !== desiredRelativePath) {
    config = setInstallPath(config, detection.projectRoot, resolvedPath);
    await writeConfig(detection.projectRoot, config, configPath);
  }

  const installedCount = listInstalledComponents(config).length;

  printSection('Config Summary');
  console.log(`  Config File   : ${path.relative(detection.projectRoot, configPath) || configPath}`);
  console.log(`  Status        : ${ensureResult.created ? chalk.green('Created (new)') : chalk.gray('Loaded (existing)')}`);
  console.log(`  Schema        : ${config.version}`);
  console.log(`  Install Path  : ${config.path}`);
  console.log(`  Installed     : ${installedCount}`);
  console.log(`  Last Updated  : ${config.lastUpdated}`);

  let componentIds: string[] | undefined = components;
  if ((!componentIds || componentIds.length === 0) && interactiveMode) {
    const installedSet = new Set(Object.keys(config.components));
    const selected = await promptComponentSelection({
      message: 'Select components to add (Space to toggle, Enter to confirm)',
      installedIds: installedSet,
    });
    if (isCancelled(selected)) {
      console.log(chalk.gray('\nAborted by user.'));
      process.exit(0);
    }
    componentIds = selected;
  }

  if (!componentIds || componentIds.length === 0) {
    if (forceMode) {
      console.log(chalk.yellow('\n[Force mode] No components specified. Nothing to install.'));
    } else {
      console.log(chalk.yellow('\nNo components selected. Nothing to install.'));
    }
    return;
  }

  const themeResolution = await resolveThemesForAdd({
    options,
    config,
    interactiveMode,
    forceMode,
  });
  if (themeResolution === 'cancelled') {
    console.log(chalk.gray('\nAborted by user.'));
    process.exit(0);
  }
  const themes = themeResolution;
  const themesChanged =
    !arraysEqualSorted(themes, config.themes ?? [DEFAULT_THEME]);
  const cssMode = options.css === true;
  const cssModeChanged = config.cssMode === undefined ? cssMode : config.cssMode !== cssMode;

  if (themesChanged) {
    config = setThemes(config, themes);
  }
  if (cssModeChanged) {
    config = setCssMode(config, cssMode);
  }
  if (themesChanged || cssModeChanged) {
    await writeConfig(detection.projectRoot, config, configPath);
  }

  printSection('Themes');
  console.log(`  Selected      : ${themes.join(', ')}`);
  console.log(`  CSS mode      : ${cssMode ? 'on (compile SCSS to CSS)' : 'off (vendor SCSS as-is)'}`);

  await installComponents({
    componentIds,
    projectRoot: detection.projectRoot,
    installRootAbs,
    config,
    configPath,
    forceMode,
    cssMode,
    themes,
    interactive: interactiveMode,
    updateIndex: !options.noExport,
    exportHooksFromIndex: !options.noExportHooks,
    exportUtilsFromIndex: !options.noExportUtils,
  });
}

interface ResolveThemesArgs {
  options: CliOptions;
  config: FluxoConfig;
  interactiveMode: boolean;
  forceMode: boolean;
}

async function resolveThemesForAdd(args: ResolveThemesArgs): Promise<string[] | 'cancelled'> {
  const existing = args.config.themes ?? [];
  if (args.options.themes && args.options.themes.length > 0) {
    const { valid, invalid } = normalizeThemeList(args.options.themes);
    if (invalid.length > 0) {
      printWarning(
        `\nUnknown theme(s) ignored: ${invalid.join(', ')}. Valid themes: ${AVAILABLE_THEMES.join(', ')}.`,
      );
    }
    if (valid.length > 0) return mergeThemeLists(existing, valid);
  }
  if (existing.length > 0 && !args.forceMode) {
    return [...existing];
  }
  if (args.forceMode || !args.interactiveMode) {
    return existing.length > 0 ? [...existing] : [DEFAULT_THEME];
  }
  const initial = existing.length > 0 ? existing : [DEFAULT_THEME];
  const picked = await promptThemeSelection({
    available: AVAILABLE_THEMES,
    preselected: initial,
  });
  if (isCancelled(picked)) return 'cancelled';
  if (picked.length === 0) return [DEFAULT_THEME];
  return mergeThemeLists(existing, picked);
}

function mergeThemeLists(existing: readonly string[], next: readonly string[]): string[] {
  const merged = new Set<string>(existing);
  for (const t of next) merged.add(t);
  return [...merged].sort();
}

function arraysEqualSorted(a: readonly string[], b: readonly string[]): boolean {
  const sa = [...a].sort();
  const sb = [...b].sort();
  if (sa.length !== sb.length) return false;
  for (let i = 0; i < sa.length; i++) if (sa[i] !== sb[i]) return false;
  return true;
}

interface InstallComponentsOptions {
  componentIds: string[];
  projectRoot: string;
  installRootAbs: string;
  config: FluxoConfig;
  configPath: string;
  forceMode: boolean;
  cssMode: boolean;
  themes: readonly string[];
  interactive: boolean;
  updateIndex: boolean;
  exportHooksFromIndex: boolean;
  exportUtilsFromIndex: boolean;
}

async function installComponents(options: InstallComponentsOptions): Promise<void> {
  const manifest = await loadManifest();
  const requestedIds = await normalizeComponentIds(options.componentIds);

  if (requestedIds.unknown.length > 0) {
    printWarning(`\nWarning: Unknown components: ${requestedIds.unknown.join(', ')}`);
    printSubtle('  Unknown ids are typo-checked against the latest manifest. Run `fluxo-ui --help` to see the supported component list.');
  }
  if (requestedIds.known.length === 0) {
    throw new UnknownComponentError(requestedIds.unknown, {
      mode: 'add',
      hint: 'Run `npx fluxo-cli add` (no arguments) to launch the interactive picker, or pass valid component ids.',
    });
  }

  let filteredIds = requestedIds.known;
  if (options.interactive && !options.forceMode) {
    filteredIds = await filterComponentsForAddInteractive({
      componentIds: requestedIds.known,
      projectRoot: options.projectRoot,
      config: options.config,
    });
    if (filteredIds.length === 0) {
      console.log(chalk.yellow('\nAll selected components were skipped. Nothing to install.'));
      return;
    }
  }

  console.log(chalk.cyan(`\nResolving dependencies for: ${filteredIds.join(', ')}`));

  const sourceProvider = await resolveSourceProvider();

  printSubtle(`  Source: ${sourceProvider.id}`);

  const probe = await validateSourceProvider({ provider: sourceProvider, mode: 'add' });
  printSubtle(`  Probed : ${probe.probedPath} (${probe.originUrl})`);

  const resolveConflict = options.interactive
    ? createInteractiveFileResolver({ forceMode: options.forceMode, mode: 'add' })
    : undefined;

  const result = await runInstall({
    componentIds: filteredIds,
    installRootAbs: options.installRootAbs,
    config: options.config,
    configFilePath: options.configPath,
    projectRoot: options.projectRoot,
    sourceProvider,
    manifest,
    forceMode: options.forceMode,
    cssMode: options.cssMode,
    themes: options.themes,
    resolveConflict,
    updateIndex: options.updateIndex,
    exportHooksFromIndex: options.exportHooksFromIndex,
    exportUtilsFromIndex: options.exportUtilsFromIndex,
    mode: 'add',
  });

  await printInstallSummary(result, options.installRootAbs, options.projectRoot);
  printDependencyTree(result, filteredIds);
  evaluatePartialInstallForAdd(result);
}

async function filterComponentsForAddInteractive(args: {
  componentIds: string[];
  projectRoot: string;
  config: FluxoConfig;
}): Promise<string[]> {
  const accepted: string[] = [];
  for (const id of args.componentIds) {
    const dirAbs = resolveComponentDir(args.projectRoot, args.config, id);
    const probe = await directoryHasFiles(dirAbs);
    if (!probe.exists || probe.fileCount === 0) {
      accepted.push(id);
      continue;
    }
    const component = await getComponentById(id);
    const decision = await promptComponentConflict({
      componentId: id,
      componentName: component?.name ?? id,
      componentDir: path.relative(args.projectRoot, dirAbs) || dirAbs,
      fileCount: probe.fileCount,
      mode: 'add',
    });
    if (isCancelled(decision)) {
      console.log(chalk.gray('\nAborted by user.'));
      process.exit(0);
    }
    if (decision === 'overwrite') {
      accepted.push(id);
    } else {
      console.log(chalk.gray(`  Skipped ${id}.`));
    }
  }
  return accepted;
}

interface NormalizedIds {
  known: string[];
  unknown: string[];
}

async function normalizeComponentIds(input: string[]): Promise<NormalizedIds> {
  const known: string[] = [];
  const unknown: string[] = [];
  const seen = new Set<string>();
  for (const raw of input) {
    if (!raw) continue;
    const candidate = raw.trim();
    if (!candidate) continue;
    if (seen.has(candidate)) continue;
    seen.add(candidate);
    const found = await getComponentById(candidate);
    if (!found) {
      const lowered = candidate.toLowerCase();
      const fallback = await getComponentById(lowered);
      if (!fallback) {
        unknown.push(candidate);
        continue;
      }
      known.push(fallback.id);
    } else {
      known.push(found.id);
    }
  }
  return { known, unknown };
}

async function printInstallSummary(
  result: RunInstallResult,
  installRootAbs: string,
  projectRoot: string
): Promise<void> {
  const { plan, apply, configWritten } = result;
  printSection('Dependency Closure');
  console.log(`  Components : ${plan.closure.components.length} (${plan.closure.components.join(', ') || '—'})`);
  console.log(`  Hooks      : ${plan.closure.hooks.length} (${plan.closure.hooks.join(', ') || '—'})`);
  console.log(`  Utils      : ${plan.closure.utils.length} (${plan.closure.utils.join(', ') || '—'})`);
  console.log(`  Shared     : ${plan.closure.shared.length} (${plan.closure.shared.join(', ') || '—'})`);
  console.log(`  Icons      : ${plan.iconFiles.length}`);

  const analysis = await analyzeExternalDependencies({
    projectRoot,
    required: plan.externalPackages,
    optionalPeers: plan.optionalPeers,
  });
  if (plan.externalPackages.length > 0) {
    printSection('External packages required by installed components');
    const missingSet = new Set(analysis.missing);
    for (const pkg of plan.externalPackages) {
      const tag = analysis.declared.has(pkg)
        ? chalk.green('present')
        : missingSet.has(pkg)
          ? chalk.yellow('missing')
          : chalk.gray('peer (assumed available)');
      console.log(`  - ${pkg} (${tag})`);
    }
    if (analysis.missing.length > 0) {
      console.log(chalk.yellow(`\n  Install the missing packages with:`));
      console.log(chalk.yellow(`    ${analysis.installCommand}`));
    }
  }
  if (plan.optionalPeers.length > 0) {
    printSection('Optional peer dependencies (install only if used)');
    for (const pkg of plan.optionalPeers) {
      const present = analysis.declared.has(pkg);
      console.log(`  - ${pkg} (${present ? chalk.green('present') : chalk.gray('missing — optional')})`);
    }
  }
  if (plan.unknownComponents.length > 0) {
    printWarning(`\nUnresolved component ids: ${plan.unknownComponents.join(', ')}`);
    printSubtle(`  These ids did not match any component in the manifest. Re-check spelling or run \`fluxo-cli add\` interactively to pick from the catalogue.`);
  }
  if (plan.missingFiles.length > 0) {
    printWarning(`\nFiles missing from source provider:`);
    for (const f of plan.missingFiles) console.log(`  - ${f}`);
    printSubtle(`  These files could not be fetched. The install completed only partially. Verify network connectivity, then re-run.`);
  }
  if (apply.unresolvedImports.length > 0) {
    printWarning(`\nImports left unresolved (passed through unchanged):`);
    for (const u of apply.unresolvedImports.slice(0, 20)) {
      console.log(`  - ${u.fromFile} → ${u.spec}`);
    }
    if (apply.unresolvedImports.length > 20) {
      console.log(`  ...and ${apply.unresolvedImports.length - 20} more`);
    }
    printSubtle(`  Unresolved imports may indicate a stale manifest or a removed module. Re-run with --force after \`npm run generate-manifest\` if you maintain a fork.`);
  }

  if (apply.conflicts.length > 0) {
    const skipped = apply.conflicts.filter((c) => c.decision === 'skipped');
    const overwrote = apply.conflicts.filter((c) => c.decision === 'wrote');
    if (skipped.length > 0) {
      printWarning(`\nFiles preserved due to local changes (${skipped.length}):`);
      for (const c of skipped.slice(0, 20)) {
        console.log(`  - ${c.targetRelative} [${c.kind}]`);
      }
      if (skipped.length > 20) {
        console.log(`  ...and ${skipped.length - 20} more`);
      }
      console.log(chalk.gray(`  Re-run with --force to overwrite preserved files.`));
    }
    if (overwrote.length > 0) {
      printWarning(`\nLocally-edited files overwritten (${overwrote.length}):`);
      for (const c of overwrote.slice(0, 20)) {
        console.log(`  - ${c.targetRelative} [${c.kind}]`);
      }
      if (overwrote.length > 20) {
        console.log(`  ...and ${overwrote.length - 20} more`);
      }
    }
  }

  console.log(
    chalk.green(
      `\nWrote ${apply.written.length} files`
    ) +
      `, kept ${apply.unchanged.length} unchanged, skipped ${apply.skipped.length}, target: ${installRootAbs}`
  );
  console.log(`Config ${configWritten ? chalk.green('updated') : 'unchanged'} (${listInstalledNamesFromPlan(plan)}).`);

  printIndexSummary(result);
}

function printIndexSummary(result: RunInstallResult): void {
  const indexResult = result.indexResult;
  if (!indexResult) return;
  const indexPath = indexResult.indexFilePath;
  if (indexResult.added.length === 0) {
    console.log(`Index file ${indexResult.created ? chalk.green('would be created') : 'unchanged'}: ${indexPath}`);
    return;
  }
  console.log(chalk.cyan(`\nIndex file ${indexResult.created ? 'created' : 'updated'}: ${indexPath}`));
  for (const entry of indexResult.added) {
    const tag = entry.role === 'component' ? 'component' : entry.role === 'hook' ? 'hook' : 'util';
    const label = entry.comment ?? entry.unitId;
    console.log(`  + ${tag}: ${label} (${entry.specifier})`);
  }
  if (indexResult.alreadyPresent.length > 0) {
    console.log(chalk.gray(`  ${indexResult.alreadyPresent.length} export(s) already present, left as-is.`));
  }
}

function listInstalledNamesFromPlan(plan: DependencyPlan): string {
  return plan.closure.components.length
    ? `${plan.closure.components.length} component(s) recorded`
    : 'no component changes';
}

function printDependencyTree(result: RunInstallResult, requestedIds: readonly string[]): void {
  const { plan } = result;
  const requestedSet = new Set(requestedIds);
  const componentById = new Map<string, ReturnType<typeof manifestComponentLite>>();
  for (const c of plan.manifest.components) componentById.set(c.id, manifestComponentLite(c));
  const closureSet = new Set(plan.closure.components);

  const transitiveOnly = plan.closure.components.filter((id) => !requestedSet.has(id));
  if (closureSet.size === 0) return;

  printSection('Why each component was installed');
  for (const reqId of [...requestedSet].sort()) {
    if (!closureSet.has(reqId)) continue;
    const meta = componentById.get(reqId);
    console.log(chalk.cyan(`  ${meta?.name ?? reqId} (${reqId}) — requested`));
  }

  if (transitiveOnly.length === 0) {
    printSubtle('  No transitive components were pulled in.');
    return;
  }

  const reverseDeps = buildReverseDependencyMap(plan, requestedSet);
  for (const transitiveId of transitiveOnly.sort()) {
    const meta = componentById.get(transitiveId);
    const pulledBy = reverseDeps.get(transitiveId) ?? [];
    const pulledByLabel = pulledBy.length > 0
      ? pulledBy.map((p) => p).join(', ')
      : 'transitive (indirect)';
    console.log(`  ${chalk.gray('↳')} ${meta?.name ?? transitiveId} (${transitiveId}) ${chalk.gray('— required by ' + pulledByLabel)}`);
  }
}

function manifestComponentLite(c: { id: string; name: string }): { id: string; name: string } {
  return { id: c.id, name: c.name };
}

function buildReverseDependencyMap(
  plan: DependencyPlan,
  requestedSet: Set<string>
): Map<string, string[]> {
  const componentById = new Map<string, { id: string; deps: string[] }>();
  for (const c of plan.manifest.components) {
    componentById.set(c.id, { id: c.id, deps: c.dependencies?.components ?? [] });
  }
  const closureSet = new Set(plan.closure.components);
  const reverse = new Map<string, Set<string>>();
  const queue: string[] = [...requestedSet].filter((id) => closureSet.has(id));
  const visited = new Set<string>();
  while (queue.length > 0) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    const meta = componentById.get(id);
    if (!meta) continue;
    for (const childId of meta.deps) {
      if (!closureSet.has(childId)) continue;
      const set = reverse.get(childId) ?? new Set<string>();
      set.add(id);
      reverse.set(childId, set);
      if (!visited.has(childId)) queue.push(childId);
    }
  }
  const out = new Map<string, string[]>();
  for (const [id, set] of reverse.entries()) out.set(id, [...set].sort());
  return out;
}

function evaluatePartialInstallForAdd(result: RunInstallResult): void {
  const { plan, apply } = result;
  const writtenCount = apply.written.length;
  const totalPlanned = plan.files.length;
  const missingCount = plan.missingFiles.length;
  if (missingCount === 0) return;
  if (writtenCount === 0 && missingCount === totalPlanned) {
    throw new PartialInstallError(plan.missingFiles, apply.unresolvedImports.map((u) => `${u.fromFile} → ${u.spec}`), {
      mode: 'add',
      hint: 'Nothing was written. Verify network connectivity, GitHub status, or set FLUXO_UI_LOCAL_SOURCE to a local checkout, then re-run `fluxo-cli add`.',
      exitCode: 2,
    });
  }
  printWarning('\nPartial install detected.');
  printSubtle('  Re-run `fluxo-cli add` after fixing connectivity to fetch the missing files.');
  printSubtle(`  ${missingCount} file(s) could not be fetched from the source provider.`);
}
