import path from 'path';
import { promises as fs } from 'fs';
import {
  buildDependencyPlan,
  type DependencyPlan,
} from './dependency-planner.js';
import {
  applyDependencyPlan,
  type ApplyPlanResult,
  type FileConflictResolver,
} from './installer.js';
import {
  LocalSourceProvider,
  GitHubSourceProvider,
  inferGitHubProviderFromPackage,
  probeSourceProvider,
  type SourceProvider,
  type SourceProbeResult,
} from './source-provider.js';
import {
  loadManifest,
  getComponentById,
  type ManifestData,
} from './manifest.js';
import {
  type FluxoConfig,
  writeConfig,
} from './config.js';
import {
  applyIndexExports,
  type ApplyIndexExportsResult,
} from './index-rewriter.js';
import {
  SourceAccessError,
  classifyFetchError,
  type CliErrorMode,
} from './errors.js';

export interface ResolveSourceProviderOptions {
  packageRoot?: string;
  ref?: string;
  basePath?: string;
  fallbackOwner?: string;
  fallbackRepo?: string;
  token?: string;
}

export async function resolveSourceProvider(
  options: ResolveSourceProviderOptions = {}
): Promise<SourceProvider> {
  if (process.env.FLUXO_UI_LOCAL_SOURCE) {
    return new LocalSourceProvider({ sourceRoot: process.env.FLUXO_UI_LOCAL_SOURCE });
  }
  const ref = options.ref ?? process.env.FLUXO_UI_REF ?? undefined;
  const token = options.token ?? process.env.GITHUB_TOKEN ?? undefined;
  const packageRoot = options.packageRoot;
  if (packageRoot) {
    try {
      const pkgRaw = await fs.readFile(path.join(packageRoot, 'package.json'), 'utf-8');
      const pkg = JSON.parse(pkgRaw);
      const provider = inferGitHubProviderFromPackage({
        packageJson: pkg,
        ref,
        basePath: options.basePath,
        token,
      });
      if (provider) return provider;
    } catch {
      // ignore, fall through to fallback
    }
  }
  if (options.fallbackOwner && options.fallbackRepo) {
    return new GitHubSourceProvider({
      owner: options.fallbackOwner,
      repo: options.fallbackRepo,
      ref,
      basePath: options.basePath,
      token,
    });
  }
  return new GitHubSourceProvider({
    owner: 'shridhar-tl',
    repo: 'fluxo-ui',
    ref: ref ?? 'main',
    basePath: options.basePath ?? 'src',
    token,
  });
}

export interface RunInstallOptions {
  componentIds: string[];
  installRootAbs: string;
  config: FluxoConfig;
  configFilePath: string;
  projectRoot: string;
  sourceProvider: SourceProvider;
  manifest?: ManifestData;
  version?: string;
  dryRun?: boolean;
  forceMode?: boolean;
  cssMode?: boolean;
  themes?: readonly string[];
  resolveConflict?: FileConflictResolver;
  writeConfigOnComplete?: boolean;
  updateIndex?: boolean;
  exportHooksFromIndex?: boolean;
  exportUtilsFromIndex?: boolean;
  mode?: CliErrorMode;
}

export interface RunInstallResult {
  plan: DependencyPlan;
  apply: ApplyPlanResult;
  configWritten: boolean;
  indexResult: ApplyIndexExportsResult | null;
}

export async function runInstall(options: RunInstallOptions): Promise<RunInstallResult> {
  const manifest = options.manifest ?? (await loadManifest());
  let plan: DependencyPlan;
  try {
    plan = await buildDependencyPlan({
      componentIds: options.componentIds,
      installRoot: options.installRootAbs,
      sourceProvider: options.sourceProvider,
      manifest,
      cssMode: options.cssMode,
      themes: options.themes,
    });
  } catch (err) {
    throw wrapPipelineFetchError(err, options.sourceProvider, options.mode);
  }

  const componentNameLookup = async (id: string): Promise<string | undefined> => {
    const comp = await getComponentById(id);
    return comp?.name;
  };

  const nameMap = new Map<string, string>();
  for (const id of plan.closure.components) {
    const name = await componentNameLookup(id);
    if (name) nameMap.set(id, name);
  }

  const apply = await applyDependencyPlan({
    plan,
    installRootAbs: options.installRootAbs,
    config: options.config,
    version: options.version ?? sourceVersionLabel(options.sourceProvider),
    dryRun: options.dryRun,
    forceMode: options.forceMode,
    cssMode: options.cssMode,
    themes: options.themes,
    resolveConflict: options.resolveConflict,
    manifestComponentName: (id) => nameMap.get(id),
  });

  let indexResult: ApplyIndexExportsResult | null = null;
  if (options.updateIndex !== false) {
    indexResult = await applyIndexExports({
      installRootAbs: options.installRootAbs,
      plan,
      manifest,
      exportHooks: options.exportHooksFromIndex,
      exportUtils: options.exportUtilsFromIndex,
      dryRun: options.dryRun === true,
    });
  }

  let configWritten = false;
  if (!options.dryRun && options.writeConfigOnComplete !== false) {
    await writeConfig(options.projectRoot, apply.config, options.configFilePath);
    configWritten = true;
  }

  return { plan, apply, configWritten, indexResult };
}

function sourceVersionLabel(provider: SourceProvider): string {
  return provider.id;
}

export interface ValidateSourceOptions {
  provider: SourceProvider;
  mode?: CliErrorMode;
}

export async function validateSourceProvider(options: ValidateSourceOptions): Promise<SourceProbeResult> {
  let probe: SourceProbeResult;
  try {
    probe = await probeSourceProvider(options.provider);
  } catch (err) {
    throw wrapPipelineFetchError(err, options.provider, options.mode);
  }
  if (!probe.ok) {
    throw buildSourceAccessError(probe, options.provider, options.mode);
  }
  return probe;
}

function wrapPipelineFetchError(
  err: unknown,
  provider: SourceProvider,
  mode?: CliErrorMode
): SourceAccessError {
  if (err instanceof SourceAccessError) return err;
  const probeUrl = provider.resolveOriginUrl('');
  const classified = classifyFetchError(err, probeUrl);
  return new SourceAccessError(
    `${classified.message}\nProvider: ${provider.id}`,
    {
      hint: classified.hint,
      cause: err,
      originUrl: probeUrl,
      statusCode: classified.statusCode,
      mode,
    }
  );
}

export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';

export interface ExternalDependencyAnalysis {
  packageJsonPath: string | null;
  declared: Set<string>;
  missing: string[];
  satisfied: string[];
  optionalMissing: string[];
  packageManager: PackageManager;
  installCommand: string;
}

export async function detectPackageManager(projectRoot: string): Promise<PackageManager> {
  const candidates: Array<[string, PackageManager]> = [
    ['bun.lockb', 'bun'],
    ['pnpm-lock.yaml', 'pnpm'],
    ['yarn.lock', 'yarn'],
    ['package-lock.json', 'npm'],
  ];
  for (const [file, pm] of candidates) {
    try {
      await fs.access(path.join(projectRoot, file));
      return pm;
    } catch {
      // not present, try next
    }
  }
  return 'npm';
}

export function buildInstallCommand(packageManager: PackageManager, packages: readonly string[]): string {
  if (packages.length === 0) return '';
  const list = packages.join(' ');
  switch (packageManager) {
    case 'pnpm':
      return `pnpm add ${list}`;
    case 'yarn':
      return `yarn add ${list}`;
    case 'bun':
      return `bun add ${list}`;
    default:
      return `npm install ${list}`;
  }
}

export async function analyzeExternalDependencies(args: {
  projectRoot: string;
  required: readonly string[];
  optionalPeers?: readonly string[];
}): Promise<ExternalDependencyAnalysis> {
  const declared = new Set<string>();
  let pkgPath: string | null = null;
  const candidate = path.resolve(args.projectRoot, 'package.json');
  try {
    const raw = await fs.readFile(candidate, 'utf-8');
    pkgPath = candidate;
    const pkg = JSON.parse(raw) as Record<string, unknown>;
    for (const key of [
      'dependencies',
      'devDependencies',
      'peerDependencies',
      'optionalDependencies',
    ]) {
      const block = pkg[key];
      if (block && typeof block === 'object') {
        for (const name of Object.keys(block as Record<string, unknown>)) {
          declared.add(name);
        }
      }
    }
  } catch {
    pkgPath = null;
  }
  const missing: string[] = [];
  const satisfied: string[] = [];
  for (const name of args.required) {
    if (declared.has(name) || isNodeBuiltin(name)) satisfied.push(name);
    else missing.push(name);
  }
  const optionalMissing: string[] = [];
  for (const name of args.optionalPeers ?? []) {
    if (!declared.has(name) && !isNodeBuiltin(name)) optionalMissing.push(name);
  }
  const sortedMissing = missing.sort();
  const packageManager = await detectPackageManager(args.projectRoot);
  return {
    packageJsonPath: pkgPath,
    declared,
    missing: sortedMissing,
    satisfied: satisfied.sort(),
    optionalMissing: optionalMissing.sort(),
    packageManager,
    installCommand: buildInstallCommand(packageManager, sortedMissing),
  };
}

const NODE_BUILTINS = new Set([
  'react',
  'react-dom',
  'react/jsx-runtime',
  'fs',
  'path',
  'crypto',
  'url',
  'https',
  'http',
  'process',
  'tty',
  'readline',
]);

function isNodeBuiltin(name: string): boolean {
  return NODE_BUILTINS.has(name);
}

function buildSourceAccessError(
  probe: SourceProbeResult,
  provider: SourceProvider,
  mode?: CliErrorMode
): SourceAccessError {
  const classified = classifyFetchError(
    probe.rawError ?? new Error(probe.reason ?? 'Source probe failed'),
    probe.originUrl
  );
  return new SourceAccessError(
    `${classified.message}\nProvider: ${provider.id}\nProbe path: ${probe.probedPath}`,
    {
      hint: classified.hint,
      cause: probe.rawError,
      originUrl: probe.originUrl,
      statusCode: classified.statusCode,
      mode,
    }
  );
}
