import path from 'path';
import { promises as fs } from 'fs';
import chalk from 'chalk';
import type { CliOptions } from './types.js';
import { detectProject, formatDetectionWarnings } from './project-detection.js';
import {
  readConfig,
  detectAllComponentDrift,
  listInstalledComponents,
  summarizeDriftReport,
  resolveComponentDir,
  setInstallPath,
  setThemes,
  setCssMode,
  toRelativeFromRoot,
  writeConfig,
  DEFAULT_INSTALL_PATH,
  DEFAULT_CONFIG_FILENAME,
  type FluxoConfig,
} from './config.js';
import { AVAILABLE_THEMES, DEFAULT_THEME, normalizeThemeList } from './styles-bundle.js';
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
import {
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
  promptMissingComponentOnUpdate,
  promptUpdateSelection,
  resolveInstallPathInteractive,
  summarizeDriftBeforeUpdate,
} from './interactive.js';

export async function handleUpdate(options: CliOptions, components?: string[]): Promise<void> {
  try {
    await runHandleUpdate(options, components);
  } catch (err) {
    reportAndExit(err, 'update');
  }
}

async function runHandleUpdate(options: CliOptions, components?: string[]): Promise<void> {
  const targetPathRaw = options.path || DEFAULT_INSTALL_PATH;
  const forceMode = options.force || false;
  const interactiveMode = !forceMode && isInteractive();

  if (forceMode) printForceBanner('update');

  const detection = await detectProject(targetPathRaw, process.cwd());
  const warnings = formatDetectionWarnings(detection);

  if (warnings) {
    console.log(chalk.yellow(warnings));
  }

  if (!detection.isNpmProject) {
    throw new ConfigStateError(
      'No npm project detected at the current working directory or any parent directory.',
      {
        hint: 'Run `npm init -y` in your project root, then run `fluxo-cli add` first to install components before invoking `update`.',
        mode: 'update',
        exitCode: 1,
      }
    );
  }

  printSection('Project Detection Summary');
  console.log(`  Project Root   : ${detection.projectRoot}`);
  console.log(`  Install Target : ${detection.targetPath}`);
  console.log(`  NPM Project    : ${detection.isNpmProject ? chalk.green('Yes') : chalk.red('No')}`);
  console.log(
    `  TypeScript     : ${detection.hasTypeScript ? chalk.green(`Yes (via ${detection.tsDetectionMethod})`) : chalk.yellow('No')}`
  );
  console.log(`  TSX Files      : ${detection.hasTsxFiles ? chalk.green('Yes') : chalk.gray('No')}`);

  const loaded = await readConfig(detection.projectRoot);

  if (!loaded) {
    throw new ConfigStateError(
      `No FluxoUI config found at ${path.join(detection.projectRoot, DEFAULT_CONFIG_FILENAME)}.`,
      {
        hint: 'Run `fluxo-cli add <component>` first — it creates the config and installs the initial components. `update` only refreshes existing installs.',
        mode: 'update',
        exitCode: 1,
      }
    );
  }

  let { config } = loaded;
  const { filePath: configPath } = loaded;
  let installRootAbs = path.resolve(detection.projectRoot, config.path);

  if (interactiveMode && options.path) {
    const resolved = await resolveInstallPathInteractive({
      projectRoot: detection.projectRoot,
      defaultPath: config.path,
      forceMode,
      initialPath: options.path,
      mode: 'update',
    });
    if (isCancelled(resolved)) {
      console.log(chalk.gray('\nAborted by user.'));
      process.exit(0);
    }
    if (resolved.relativeFromRoot !== config.path) {
      config = setInstallPath(config, detection.projectRoot, resolved.relativeFromRoot);
      await writeConfig(detection.projectRoot, config, configPath);
      installRootAbs = path.resolve(detection.projectRoot, resolved.relativeFromRoot);
    }
  } else if (options.path && !forceMode && !isInteractive()) {
    const desired = toRelativeFromRoot(detection.projectRoot, options.path);
    if (desired !== config.path) {
      config = setInstallPath(config, detection.projectRoot, options.path);
      await writeConfig(detection.projectRoot, config, configPath);
      installRootAbs = path.resolve(detection.projectRoot, desired);
    }
  } else if (forceMode && options.path) {
    const desired = toRelativeFromRoot(detection.projectRoot, options.path);
    if (desired !== config.path) {
      config = setInstallPath(config, detection.projectRoot, options.path);
      await writeConfig(detection.projectRoot, config, configPath);
      installRootAbs = path.resolve(detection.projectRoot, desired);
    }
  }

  let installRootMissing = false;
  try {
    const stat = await fs.stat(installRootAbs);
    if (!stat.isDirectory()) installRootMissing = true;
  } catch {
    installRootMissing = true;
  }

  if (installRootMissing) {
    if (interactiveMode) {
      printWarning(
        `\nThe configured install path does not exist on disk: ${installRootAbs}`
      );
      const resolved = await resolveInstallPathInteractive({
        projectRoot: detection.projectRoot,
        defaultPath: config.path,
        forceMode,
        mode: 'update',
      });
      if (isCancelled(resolved)) {
        console.log(chalk.gray('\nAborted by user.'));
        process.exit(0);
      }
      if (resolved.relativeFromRoot !== config.path) {
        config = setInstallPath(config, detection.projectRoot, resolved.relativeFromRoot);
        await writeConfig(detection.projectRoot, config, configPath);
      }
      installRootAbs = path.resolve(detection.projectRoot, resolved.relativeFromRoot);
      await ensureDirectoryExists(installRootAbs);
    } else if (forceMode) {
      printWarning(
        `\nThe configured install path does not exist on disk; recreating: ${installRootAbs}`
      );
      await ensureDirectoryExists(installRootAbs);
    } else {
      throw new ConfigStateError(
        `Configured install path does not exist on disk: ${installRootAbs}`,
        {
          hint: 'Re-run `fluxo-cli update` interactively, pass `--path <new-path>` to relocate, or pass `--force` to recreate the directory in place.',
          mode: 'update',
          exitCode: 1,
        }
      );
    }
  }

  const installed = listInstalledComponents(config);

  printSection('Config Summary');
  console.log(`  Config File   : ${path.relative(detection.projectRoot, configPath) || configPath}`);
  console.log(`  Schema        : ${config.version}`);
  console.log(`  Install Path  : ${config.path}`);
  console.log(`  Installed     : ${installed.length}`);
  console.log(`  Last Updated  : ${config.lastUpdated}`);

  let modifiedComponentIds: string[] = [];
  if (installed.length > 0) {
    const drift = await detectAllComponentDrift(detection.projectRoot, config);
    const modifiedReports = drift.filter((r) => r.isModified);
    modifiedComponentIds = modifiedReports.map((r) => r.id);
    printSection('Drift Check');
    console.log(`  Components Inspected : ${drift.length}`);
    console.log(`  Modified             : ${modifiedReports.length}`);
    if (modifiedReports.length > 0) {
      for (const report of modifiedReports) {
        console.log(`    - ${report.id}: ${summarizeDriftReport(report)}`);
        for (const f of report.modifiedFiles) console.log(chalk.gray(`        modified: ${f}`));
        for (const f of report.missingFiles) console.log(chalk.gray(`        missing : ${f}`));
        for (const f of report.addedFiles) console.log(chalk.gray(`        added   : ${f}`));
      }
      await summarizeDriftBeforeUpdate(modifiedReports, forceMode);
    }
  }

  let requestedTargets: string[] | undefined;
  if (components && components.length > 0) {
    const requested = await resolveUpdateTargets({
      requested: components,
      installedIds: Object.keys(config.components),
    });
    if (requested.unknown.length > 0) {
      printWarning(`\nWarning: Unknown or not-installed components requested: ${requested.unknown.join(', ')}`);
      printSubtle(`  \`update\` only refreshes already-installed components. To install a new component, run \`fluxo-cli add ${requested.unknown.join(' ')}\` instead.`);
    }
    if (requested.targets.length === 0 && requested.unknown.length > 0) {
      throw new UnknownComponentError(requested.unknown, {
        mode: 'update',
        hint: 'Use `fluxo-cli add <ids>` to install components, or pass installed component ids to `update`.',
      });
    }
    requestedTargets = requested.targets;
  }

  if ((!requestedTargets || requestedTargets.length === 0) && interactiveMode && installed.length > 0) {
    const installedSummaries = Object.keys(config.components)
      .sort()
      .map((id) => ({
        id,
        name: config.components[id].name,
        isModified: modifiedComponentIds.includes(id),
      }));
    const selected = await promptUpdateSelection({
      installedComponents: installedSummaries,
    });
    if (isCancelled(selected)) {
      console.log(chalk.gray('\nAborted by user.'));
      process.exit(0);
    }
    requestedTargets = selected;
  } else if ((!requestedTargets || requestedTargets.length === 0) && forceMode && installed.length > 0) {
    requestedTargets = Object.keys(config.components).sort();
  }

  if (!requestedTargets || requestedTargets.length === 0) {
    if (forceMode) {
      console.log(chalk.yellow('\n[Force mode] No installed components to update.'));
    } else if (installed.length === 0) {
      console.log(chalk.yellow('\nNo installed components found. Run `fluxo-cli add` to install some first.'));
    } else {
      console.log(chalk.yellow('\nNo components selected. Nothing to update.'));
    }
    return;
  }

  let themes = config.themes && config.themes.length > 0 ? [...config.themes] : [DEFAULT_THEME];
  if (options.themes && options.themes.length > 0) {
    const { valid, invalid } = normalizeThemeList(options.themes);
    if (invalid.length > 0) {
      printWarning(
        `\nUnknown theme(s) ignored: ${invalid.join(', ')}. Valid themes: ${AVAILABLE_THEMES.join(', ')}.`,
      );
    }
    if (valid.length > 0) {
      const merged = new Set<string>([...themes, ...valid]);
      themes = [...merged].sort();
    }
  }
  const themesChanged = !arraysEqualSorted(themes, config.themes ?? []);
  if (themesChanged) {
    config = setThemes(config, themes);
    await writeConfig(detection.projectRoot, config, configPath);
  }
  const cssMode = options.css === true || config.cssMode === true;
  if (config.cssMode !== cssMode) {
    config = setCssMode(config, cssMode);
    await writeConfig(detection.projectRoot, config, configPath);
  }

  printSection('Themes');
  console.log(`  Selected      : ${themes.join(', ')}`);
  console.log(`  CSS mode      : ${cssMode ? 'on (compile SCSS to CSS)' : 'off (vendor SCSS as-is)'}`);

  await updateComponents({
    componentIds: requestedTargets,
    projectRoot: detection.projectRoot,
    installRootAbs,
    config,
    configPath,
    forceMode,
    cssMode,
    themes,
    modifiedComponentIds,
    interactive: interactiveMode,
    updateIndex: !options.noExport,
    exportHooksFromIndex: !options.noExportHooks,
    exportUtilsFromIndex: !options.noExportUtils,
  });
}

function arraysEqualSorted(a: readonly string[], b: readonly string[]): boolean {
  const sa = [...a].sort();
  const sb = [...b].sort();
  if (sa.length !== sb.length) return false;
  for (let i = 0; i < sa.length; i++) if (sa[i] !== sb[i]) return false;
  return true;
}

interface UpdateComponentsOptions {
  componentIds: string[];
  projectRoot: string;
  installRootAbs: string;
  config: FluxoConfig;
  configPath: string;
  forceMode: boolean;
  cssMode: boolean;
  themes: readonly string[];
  modifiedComponentIds: string[];
  interactive: boolean;
  updateIndex: boolean;
  exportHooksFromIndex: boolean;
  exportUtilsFromIndex: boolean;
}

async function updateComponents(options: UpdateComponentsOptions): Promise<void> {
  let targets = options.componentIds;
  if (options.interactive && !options.forceMode) {
    targets = await filterTargetsForUpdateInteractive({
      componentIds: options.componentIds,
      projectRoot: options.projectRoot,
      config: options.config,
    });
    if (targets.length === 0) {
      console.log(chalk.yellow('\nAll selected components were skipped. Nothing to update.'));
      return;
    }
  }

  const manifest = await loadManifest();
  console.log(chalk.cyan(`\nResolving dependencies for: ${targets.join(', ')}`));

  const sourceProvider = await resolveSourceProvider();
  printSubtle(`  Source: ${sourceProvider.id}`);

  const probe = await validateSourceProvider({ provider: sourceProvider, mode: 'update' });
  printSubtle(`  Probed : ${probe.probedPath} (${probe.originUrl})`);

  const resolveConflict = options.interactive
    ? createInteractiveFileResolver({ forceMode: options.forceMode, mode: 'update' })
    : undefined;

  const result = await runInstall({
    componentIds: targets,
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
    mode: 'update',
  });

  await printUpdateSummary(result, options.installRootAbs, options.projectRoot);
  evaluatePartialInstallForUpdate(result);
}

async function filterTargetsForUpdateInteractive(args: {
  componentIds: string[];
  projectRoot: string;
  config: FluxoConfig;
}): Promise<string[]> {
  const accepted: string[] = [];
  for (const id of args.componentIds) {
    const dirAbs = resolveComponentDir(args.projectRoot, args.config, id);
    const probe = await directoryHasFiles(dirAbs);
    const component = await getComponentById(id);
    const componentName = component?.name ?? id;
    const relativeDir = path.relative(args.projectRoot, dirAbs) || dirAbs;

    if (!probe.exists || probe.fileCount === 0) {
      const decision = await promptMissingComponentOnUpdate({
        componentId: id,
        componentName,
        componentDir: relativeDir,
        mode: 'update',
      });
      if (isCancelled(decision)) {
        console.log(chalk.gray('\nAborted by user.'));
        process.exit(0);
      }
      if (decision === 'add') {
        accepted.push(id);
      } else {
        console.log(chalk.gray(`  Skipped ${id} (subfolder missing).`));
      }
      continue;
    }

    const isModified = args.config.components[id]?.files.length === 0
      ? false
      : await componentHasDrift(args.projectRoot, args.config, id);

    if (isModified) {
      const decision = await promptComponentConflict({
        componentId: id,
        componentName,
        componentDir: relativeDir,
        fileCount: probe.fileCount,
        mode: 'update',
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
      continue;
    }

    accepted.push(id);
  }
  return accepted;
}

async function componentHasDrift(
  projectRoot: string,
  config: FluxoConfig,
  componentId: string
): Promise<boolean> {
  const { detectComponentDrift } = await import('./config.js');
  const report = await detectComponentDrift(projectRoot, config, componentId);
  return report.isModified;
}

interface ResolvedUpdateTargets {
  targets: string[];
  unknown: string[];
}

async function resolveUpdateTargets(args: {
  requested: string[] | undefined;
  installedIds: string[];
}): Promise<ResolvedUpdateTargets> {
  if (!args.requested || args.requested.length === 0) {
    return { targets: [...args.installedIds].sort(), unknown: [] };
  }
  const targets: string[] = [];
  const unknown: string[] = [];
  const installedSet = new Set(args.installedIds);
  for (const raw of args.requested) {
    if (!raw) continue;
    const candidate = raw.trim();
    if (!candidate) continue;
    const found = await getComponentById(candidate);
    const id = found?.id ?? candidate;
    if (!found) {
      unknown.push(candidate);
      continue;
    }
    if (!installedSet.has(id)) {
      unknown.push(candidate);
      continue;
    }
    if (!targets.includes(id)) targets.push(id);
  }
  return { targets, unknown };
}

async function printUpdateSummary(
  result: RunInstallResult,
  installRootAbs: string,
  projectRoot: string
): Promise<void> {
  const { plan, apply, configWritten } = result;
  printSection('Dependency Closure (refreshed)');
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
    printSection('External packages required');
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
  if (plan.missingFiles.length > 0) {
    printWarning(`\nFiles missing from source provider:`);
    for (const f of plan.missingFiles) console.log(`  - ${f}`);
    printSubtle(`  These files could not be fetched. The update completed only partially. Verify network connectivity, then re-run \`fluxo-cli update\`.`);
  }
  if (apply.unresolvedImports.length > 0) {
    printWarning(`\nImports left unresolved (passed through unchanged):`);
    for (const u of apply.unresolvedImports.slice(0, 20)) {
      console.log(`  - ${u.fromFile} → ${u.spec}`);
    }
    if (apply.unresolvedImports.length > 20) {
      console.log(`  ...and ${apply.unresolvedImports.length - 20} more`);
    }
    printSubtle(`  Unresolved imports usually indicate the upstream component layout has shifted since your last install. Re-run \`fluxo-cli update --force\` after backing up local edits.`);
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
    chalk.green(`\nUpdated ${apply.written.length} files`) +
      `, kept ${apply.unchanged.length} unchanged, skipped ${apply.skipped.length}, target: ${installRootAbs}`
  );
  console.log(`Config ${configWritten ? chalk.green('updated') : 'unchanged'}.`);

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

function evaluatePartialInstallForUpdate(result: RunInstallResult): void {
  const { plan, apply } = result;
  const writtenCount = apply.written.length;
  const unchangedCount = apply.unchanged.length;
  const totalPlanned = plan.files.length;
  const missingCount = plan.missingFiles.length;
  if (missingCount === 0) return;
  if (writtenCount === 0 && unchangedCount === 0 && missingCount === totalPlanned) {
    throw new PartialInstallError(plan.missingFiles, apply.unresolvedImports.map((u) => `${u.fromFile} → ${u.spec}`), {
      mode: 'update',
      hint: 'No files were refreshed. Verify network connectivity, GitHub status, or set FLUXO_UI_LOCAL_SOURCE to a local checkout, then re-run `fluxo-cli update`.',
      exitCode: 2,
    });
  }
  printWarning('\nPartial update detected.');
  printSubtle('  Re-run `fluxo-cli update` after fixing connectivity to refresh the missing files.');
  printSubtle(`  ${missingCount} file(s) could not be fetched from the source provider.`);
}
