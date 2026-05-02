export interface CliOptions {
  path?: string;
  force?: boolean;
  help?: boolean;
  css?: boolean;
  themes?: string[];
  noExport?: boolean;
  noExportHooks?: boolean;
  noExportUtils?: boolean;
}

export interface ParsedArgs {
  command: 'add' | 'update' | 'remove' | null;
  options: CliOptions;
  components?: string[];
}

export interface ComponentMetadata {
  id: string;
  name: string;
  category: string;
  description: string;
  dependencies: {
    components?: string[];
    hooks?: string[];
    utils?: string[];
  };
}

export type { ProjectDetectionResult } from './project-detection.js';
export type {
  FluxoConfig,
  InstalledComponentEntry,
  ComponentFileEntry,
  ComponentDriftReport,
  LoadedConfig,
} from './config.js';
export type {
  ManifestData,
  ManifestComponent,
  ManifestHook,
  ManifestUtil,
  ManifestShared,
  ManifestDependencies,
  ResolvedClosure,
} from './manifest.js';
export type {
  SourceProvider,
  LocalSourceProviderOptions,
  GitHubSourceProviderOptions,
  InferGitHubProviderOptions,
} from './source-provider.js';
export type {
  IconRegistry,
  IconExportEntry,
} from './asset-resolver.js';
export type {
  PlanFile,
  PlanFileKind,
  DependencyPlan,
  BuildPlanOptions,
} from './dependency-planner.js';
export type {
  RewriteContext,
  RewriteResult,
} from './import-rewriter.js';
export type {
  ApplyPlanOptions,
  ApplyPlanResult,
  FileConflictKind,
  FileConflictDecision,
  FileConflictContext,
  FileConflictResolver,
  FileOutcome,
} from './installer.js';
export type {
  IndexEntryRole,
  IndexExportEntry,
  ParsedIndexExport,
  ParsedIndexFile,
  PlanIndexExportsOptions,
  ApplyIndexExportsOptions,
  ApplyIndexExportsResult,
  MergeIndexExportsResult,
} from './index-rewriter.js';
export type {
  RunInstallOptions,
  RunInstallResult,
  ResolveSourceProviderOptions,
  PackageManager,
  ExternalDependencyAnalysis,
  ValidateSourceOptions,
} from './pipeline.js';
