import path from 'path';
import { promises as fs } from 'fs';
import chalk from 'chalk';
import type { CliOptions } from './types.js';
import { detectProject, formatDetectionWarnings } from './project-detection.js';
import {
  readConfig,
  removeInstalledComponent,
  resolveComponentDir,
  writeConfig,
  DEFAULT_CONFIG_FILENAME,
  type FluxoConfig,
} from './config.js';
import {
  ConfigStateError,
  UnknownComponentError,
  reportAndExit,
} from './errors.js';
import { getComponentById, loadManifest } from './manifest.js';
import type { ManifestComponent } from './manifest.js';
import { removeIndexExports, specifierForComponent } from './index-rewriter.js';
import {
  isCancelled,
  isInteractive,
  printForceBanner,
  printSection,
  printSubtle,
  printWarning,
  promptRemoveConfirmation,
  promptRemoveSelection,
} from './interactive.js';

export async function handleRemove(options: CliOptions, components?: string[]): Promise<void> {
  try {
    await runHandleRemove(options, components);
  } catch (err) {
    reportAndExit(err, 'remove');
  }
}

async function runHandleRemove(options: CliOptions, components?: string[]): Promise<void> {
  const forceMode = options.force === true;
  const interactiveMode = !forceMode && isInteractive();

  if (forceMode) printForceBanner('remove');

  const detection = await detectProject(options.path || './', process.cwd());
  const warnings = formatDetectionWarnings(detection);
  if (warnings) console.log(chalk.yellow(warnings));

  if (!detection.isNpmProject) {
    throw new ConfigStateError(
      'No npm project detected at the current working directory or any parent directory.',
      {
        hint: 'Run `fluxo-cli remove` from your project root (the directory with package.json).',
        mode: 'remove',
        exitCode: 1,
      }
    );
  }

  const loaded = await readConfig(detection.projectRoot);
  if (!loaded) {
    throw new ConfigStateError(
      `No FluxoUI config found at ${path.join(detection.projectRoot, DEFAULT_CONFIG_FILENAME)}.`,
      {
        hint: 'Nothing to remove. Run `fluxo-cli add <component>` first to install components.',
        mode: 'remove',
        exitCode: 1,
      }
    );
  }

  let { config } = loaded;
  const { filePath: configPath } = loaded;
  const installRootAbs = path.resolve(detection.projectRoot, config.path);

  const installedIds = Object.keys(config.components);
  if (installedIds.length === 0) {
    console.log(chalk.yellow('No components currently installed. Nothing to remove.'));
    return;
  }

  let requestedIds: string[] | undefined = components;
  if ((!requestedIds || requestedIds.length === 0) && interactiveMode) {
    const installedSummaries = installedIds
      .sort()
      .map((id) => ({ id, name: config.components[id].name || id }));
    const picked = await promptRemoveSelection({ installedComponents: installedSummaries });
    if (isCancelled(picked)) {
      console.log(chalk.gray('\nAborted by user.'));
      process.exit(0);
    }
    requestedIds = picked;
  }

  if (!requestedIds || requestedIds.length === 0) {
    console.log(chalk.yellow('No components selected. Nothing to remove.'));
    return;
  }

  const normalized = await normalizeRemoveIds(requestedIds, config);
  if (normalized.unknown.length > 0) {
    printWarning(`\nWarning: not currently installed: ${normalized.unknown.join(', ')}`);
    printSubtle('  `remove` only removes components recorded in fluxo-ui.config.json. Spelling or version mismatch?');
  }
  if (normalized.installed.length === 0) {
    throw new UnknownComponentError(normalized.unknown, {
      mode: 'remove',
      hint: 'Run `fluxo-cli remove` (no arguments) to pick from the installed list.',
    });
  }

  printSection('Reverse-dependency check');
  const blockReport = await computeRemovalBlockers(normalized.installed, config);
  if (blockReport.blocked.length > 0) {
    printWarning(`\nCannot remove the following components — they are still required by other installed components:`);
    for (const blocker of blockReport.blocked) {
      console.log(chalk.yellow(`  • ${blocker.id}`));
      for (const dep of blocker.dependents) {
        console.log(chalk.gray(`      ↳ used by ${dep.id} (${dep.name})`));
      }
    }
    printSubtle('\n  To remove these too, include the dependent component(s) in the same `fluxo-cli remove` command.');
    if (blockReport.removable.length === 0) {
      console.log(chalk.red('\nNothing to remove. Aborting.'));
      process.exit(1);
    }
    printSubtle(`\n  Proceeding with ${blockReport.removable.length} removable component(s) only.`);
  }

  const proceedIds = blockReport.removable;
  if (proceedIds.length === 0) return;

  if (!forceMode) {
    const confirmed = await promptRemoveConfirmation(proceedIds);
    if (isCancelled(confirmed)) {
      console.log(chalk.gray('\nAborted by user.'));
      process.exit(0);
    }
    if (!confirmed) {
      console.log(chalk.gray('Aborted. Nothing was removed.'));
      return;
    }
  }

  printSection('Removing components');
  let updatedConfig = config;
  const removedFolders: string[] = [];
  for (const id of proceedIds) {
    const componentDir = resolveComponentDir(detection.projectRoot, updatedConfig, id);
    const dirExists = await fs
      .stat(componentDir)
      .then((s) => s.isDirectory())
      .catch(() => false);
    if (dirExists) {
      await fs.rm(componentDir, { recursive: true, force: true });
      removedFolders.push(componentDir);
      console.log(chalk.green(`  - removed ${path.relative(detection.projectRoot, componentDir) || componentDir}`));
    } else {
      console.log(chalk.gray(`  - ${id}: folder already missing, skipping disk removal`));
    }
    updatedConfig = removeInstalledComponent(updatedConfig, id);
  }

  await writeConfig(detection.projectRoot, updatedConfig, configPath);

  const indexResult = await removeIndexExports({
    installRootAbs,
    specifierPrefixes: proceedIds.map((id) => `./${id}`),
  });
  if (indexResult.removedSpecifiers.length > 0) {
    printSection('Index updates');
    for (const spec of indexResult.removedSpecifiers) {
      console.log(chalk.gray(`  - removed export from ${path.basename(indexResult.indexFilePath)}: ${spec}`));
    }
  }

  printSection('Summary');
  console.log(chalk.green(`Removed ${proceedIds.length} component(s): ${proceedIds.join(', ')}`));
  if (blockReport.blocked.length > 0) {
    console.log(chalk.yellow(`Skipped (still required): ${blockReport.blocked.map((b) => b.id).join(', ')}`));
  }
  printSubtle('Hooks, utils, and shared modules were left in place — they may still be used by other components or by your own code.');
}

interface NormalizedRemoveIds {
  installed: string[];
  unknown: string[];
}

async function normalizeRemoveIds(input: string[], config: FluxoConfig): Promise<NormalizedRemoveIds> {
  const installed: string[] = [];
  const unknown: string[] = [];
  const seen = new Set<string>();
  for (const raw of input) {
    if (!raw) continue;
    const candidate = raw.trim();
    if (!candidate || seen.has(candidate)) continue;
    seen.add(candidate);
    if (config.components[candidate]) {
      installed.push(candidate);
      continue;
    }
    const resolved = await getComponentById(candidate);
    if (resolved && config.components[resolved.id]) {
      installed.push(resolved.id);
      continue;
    }
    unknown.push(candidate);
  }
  return { installed, unknown };
}

interface RemovalBlocker {
  id: string;
  dependents: { id: string; name: string }[];
}

interface RemovalBlockReport {
  removable: string[];
  blocked: RemovalBlocker[];
}

async function computeRemovalBlockers(
  candidateIds: readonly string[],
  config: FluxoConfig
): Promise<RemovalBlockReport> {
  const manifest = await loadManifest();
  const componentById = new Map<string, ManifestComponent>();
  for (const c of manifest.components) componentById.set(c.id, c);

  const candidateSet = new Set(candidateIds);
  const installedIds = Object.keys(config.components);
  const remainingAfterRemoval = installedIds.filter((id) => !candidateSet.has(id));

  const dependentsByCandidate = new Map<string, { id: string; name: string }[]>();
  for (const candidateId of candidateIds) {
    const dependents: { id: string; name: string }[] = [];
    for (const remainingId of remainingAfterRemoval) {
      const remaining = componentById.get(remainingId);
      if (!remaining) continue;
      const dependencyIds = remaining.dependencies?.components ?? [];
      if (dependencyIds.includes(candidateId)) {
        dependents.push({
          id: remainingId,
          name: config.components[remainingId]?.name ?? remainingId,
        });
      }
    }
    if (dependents.length > 0) dependentsByCandidate.set(candidateId, dependents);
  }

  const blocked: RemovalBlocker[] = [];
  const removable: string[] = [];
  for (const id of candidateIds) {
    const dependents = dependentsByCandidate.get(id);
    if (dependents && dependents.length > 0) {
      blocked.push({ id, dependents });
    } else {
      removable.push(id);
    }
  }
  return { removable, blocked };
}

void specifierForComponent;
