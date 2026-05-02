/**
 * FluxoUI CLI Type Definitions
 *
 * These types are exported for consumers who want to programmatically
 * interact with the CLI or extend its functionality.
 */

export type CommandType = 'add' | 'update';

export interface CliOptions {
  /**
   * Destination path for components.
   * @default './src/components/fluxo-ui'
   */
  path?: string;

  /**
   * Skip all interactive prompts and use defaults.
   * @default false
   */
  force?: boolean;

  /**
   * Show help message.
   * @default false
   */
  help?: boolean;

  /**
   * Skip rewriting the install-root `index.ts` entirely.
   * @default false
   */
  noExport?: boolean;

  /**
   * Suppress hook re-exports from the install-root `index.ts`.
   * @default false
   */
  noExportHooks?: boolean;

  /**
   * Suppress util re-exports from the install-root `index.ts`.
   * @default false
   */
  noExportUtils?: boolean;
}

export interface ParsedArgs {
  /**
   * The command to execute: 'add' or 'update'
   */
  command: CommandType | null;

  /**
   * Parsed options
   */
  options: CliOptions;

  /**
   * Component names specified on the command line
   */
  components?: string[];
}

export interface ComponentMetadata {
  /**
   * Unique component identifier (kebab-case)
   */
  id: string;

  /**
   * Display name of the component
   */
  name: string;

  /**
   * Component category for grouping
   */
  category: string;

  /**
   * Brief description of the component
   */
  description: string;

  /**
   * Dependency information
   */
  dependencies: {
    /**
     * Other components this component depends on
     */
    components?: string[];

    /**
     * Hooks this component needs
     */
    hooks?: string[];

    /**
     * Utility functions this component needs
     */
    utils?: string[];
  };
}

export interface ComponentFileEntry {
  /**
   * File path relative to the component directory.
   * Always uses forward slashes regardless of host OS.
   */
  path: string;

  /**
   * SHA-256 checksum of the file's UTF-8 content with newlines normalized to LF.
   */
  checksum: string;
}

export interface InstalledComponentEntry {
  /**
   * Component display name
   */
  name: string;

  /**
   * Installed version string (matches the source revision the files were copied from)
   */
  version: string;

  /**
   * Aggregated checksum across all files. Used to detect any drift cheaply
   * before walking the per-file list.
   */
  checksum: string;

  /**
   * Per-file checksums for granular modification detection.
   */
  files: ComponentFileEntry[];

  /**
   * ISO timestamp when component was installed/updated
   */
  installedAt: string;
}

/**
 * @deprecated Use `InstalledComponentEntry`. Kept for compatibility with earlier consumers.
 */
export type ComponentEntry = InstalledComponentEntry;

export interface FluxoConfig {
  /**
   * Optional JSON schema URL.
   */
  $schema?: string;

  /**
   * Config schema version
   */
  version: string;

  /**
   * Installation path for components, relative to the project root,
   * always normalized to forward slashes (e.g. `./src/components/fluxo-ui`).
   */
  path: string;

  /**
   * Installed components keyed by component id (kebab-case).
   */
  components: Record<string, InstalledComponentEntry>;

  /**
   * ISO timestamp of last config update
   */
  lastUpdated: string;
}

export interface ComponentDriftReport {
  /**
   * Component id
   */
  id: string;

  /**
   * Files whose on-disk checksum no longer matches the recorded one.
   */
  modifiedFiles: string[];

  /**
   * Files recorded in config that no longer exist on disk.
   */
  missingFiles: string[];

  /**
   * Files present on disk but not recorded in config.
   */
  addedFiles: string[];

  /**
   * Convenience flag: true if any of the above lists is non-empty.
   */
  isModified: boolean;
}

export interface AddOptions extends CliOptions {
  /**
   * Components to add
   */
  components?: string[];

  /**
   * Whether to automatically create parent directories
   * @default true
   */
  createDirs?: boolean;

  /**
   * Whether to update index.ts automatically
   * @default true
   */
  autoExport?: boolean;

  /**
   * Whether to check for TypeScript support
   * @default true
   */
  checkTypeScript?: boolean;
}

export interface UpdateOptions extends CliOptions {
  /**
   * Components to update (all if empty)
   */
  components?: string[];

  /**
   * How to handle modified files
   * @default 'prompt' - ask user
   */
  conflictResolution?: 'prompt' | 'keep' | 'overwrite' | 'merge';

  /**
   * Whether to check file checksums for modifications
   * @default true
   */
  checkModifications?: boolean;

  /**
   * Whether to update index.ts automatically
   * @default true
   */
  autoExport?: boolean;
}

/**
 * Per-file pre-write classification used during install/update.
 *
 * - `new`: target does not exist on disk yet
 * - `unchanged`: target exists and its content already matches the new content
 * - `updated`: target exists, on-disk content matches what was previously installed,
 *   and the new source content differs (a clean update)
 * - `locally-modified`: target exists, on-disk content differs from what was previously installed
 *   (the user has local edits relative to our last recorded checksum)
 * - `foreign`: target exists, no recorded checksum (file was added outside this CLI)
 */
export type FileConflictKind =
  | 'new'
  | 'unchanged'
  | 'updated'
  | 'locally-modified'
  | 'foreign';

/**
 * Decision returned by a `FileConflictResolver`. `overwrite` writes the new content,
 * `skip` leaves the file untouched on disk.
 */
export type FileConflictDecision = 'overwrite' | 'skip';

/**
 * Context passed to a `FileConflictResolver` for each potentially-conflicting file.
 */
export interface FileConflictContext {
  /** Source-relative path inside the upstream `src/` tree. */
  srcRelative: string;
  /** Target-relative path under the install root. */
  targetRelative: string;
  /** Absolute path on the user's disk. */
  targetAbsolute: string;
  /** Conflict classification. Resolver is only consulted for kinds that require user input. */
  kind: FileConflictKind;
  /** Component id this file belongs to, or null for shared/hook/util/asset/icon files. */
  componentId: string | null;
  /** Whether the file is a text file (vs. binary, e.g. SVG). */
  isText: boolean;
  /** Recorded checksum from the last install, or null if never tracked. */
  recordedChecksum: string | null;
  /** Current on-disk checksum, or null if the file is absent. */
  onDiskChecksum: string | null;
  /** Checksum of the new content the installer plans to write. */
  newChecksum: string;
}

/**
 * Caller-supplied callback that decides what to do for a given conflicting file.
 * The CLI invokes this only for `locally-modified` and `foreign` kinds — `new`, `unchanged`,
 * and `updated` kinds are handled automatically.
 */
export type FileConflictResolver = (
  ctx: FileConflictContext
) => FileConflictDecision | Promise<FileConflictDecision>;

/**
 * Per-file outcome of an apply pass. `outcomes` in `ApplyPlanResult` carries one
 * entry per planned file, including ones that were left unchanged or skipped.
 */
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

export interface CliResult {
  /**
   * Whether the operation succeeded
   */
  success: boolean;

  /**
   * Operation status message
   */
  message: string;

  /**
   * Components that were added/updated
   */
  components?: ComponentMetadata[];

  /**
   * Any warnings or notices
   */
  warnings?: string[];

  /**
   * Errors that occurred
   */
  errors?: string[];
}

/**
 * Aggregated dependency lists captured by the manifest generator.
 */
export interface ManifestDependencies {
  /** Component ids this unit depends on */
  components: string[];
  /** Hook ids this unit depends on */
  hooks: string[];
  /** Util ids this unit depends on */
  utils: string[];
  /** Shared module ids (types, themes, styles, store, ...) */
  shared: string[];
  /** External npm packages imported by source files */
  external: string[];
  /** Subset of `external` that are optional peer dependencies (e.g. chart.js) */
  optionalPeers: string[];
}

/**
 * Full description of a single component as captured in the generated manifest.
 */
export interface ManifestComponent {
  id: string;
  name: string;
  /** Whether the component lives as a flat `.tsx` file or a subdirectory */
  kind: 'flat' | 'directory';
  /** Path relative to `src/` of the component's root (file for flat, dir for directory). */
  sourcePath: string;
  /** Path relative to `src/` of the component's primary entry source file. */
  entryFile: string;
  /** Files that make up the component, relative to its source root. */
  files: string[];
  /** Display category (e.g. "Form Inputs", "Overlays", "Internal"). */
  category: string;
  /** Human-readable label used by the showcase nav. */
  label: string;
  /** Short description, may be empty if no curated copy exists yet. */
  description: string;
  /** Whether this is an internal helper rather than a user-facing component. */
  private: boolean;
  dependencies: ManifestDependencies;
}

export interface ManifestHook {
  id: string;
  name: string;
  sourcePath: string;
  files: string[];
  dependencies: ManifestDependencies;
}

export interface ManifestUtil {
  id: string;
  name: string;
  sourcePath: string;
  files: string[];
  dependencies: ManifestDependencies;
}

export interface ManifestShared {
  id: string;
  sourcePath: string;
  files: string[];
}

export interface ManifestData {
  schemaVersion: string;
  /** ISO timestamp the manifest was generated from source. */
  generatedAt: string;
  /** Source root the manifest paths are relative to (always `src`). */
  sourceRoot: string;
  components: ManifestComponent[];
  hooks: ManifestHook[];
  utils: ManifestUtil[];
  shared: ManifestShared[];
}

/**
 * Role assigned to an entry that the index rewriter plans to add to the
 * project's `index.ts(x)` after install.
 */
export type IndexEntryRole = 'component' | 'hook' | 'util';

/**
 * One re-export entry the rewriter plans to add to the install-root index file.
 */
export interface IndexExportEntry {
  /** Module specifier as it should appear in the export statement (e.g. `./button/Button`). */
  specifier: string;
  /** Role this entry plays — component re-exports vs. hook/util convenience re-exports. */
  role: IndexEntryRole;
  /** Source unit id from the manifest (component id, hook id, or util id). */
  unitId: string;
  /** Optional comment / display name to surface in CLI output. */
  comment?: string;
}

/**
 * Outcome of an index-rewriter pass.
 */
export interface ApplyIndexExportsResult {
  /** Absolute path of the index file that was inspected / written. */
  indexFilePath: string;
  /** True when the index file did not exist on disk before this pass. */
  created: boolean;
  /** Original index file content (empty string if created). */
  before: string;
  /** Final content (after merge) — equal to `before` when no entries were added. */
  after: string;
  /** Entries newly written into the index file in this pass. */
  added: IndexExportEntry[];
  /** Entries that already had a matching `from '<specifier>'` in the file. */
  alreadyPresent: IndexExportEntry[];
  /** Whether the file was actually written to disk on this pass. */
  wrote: boolean;
  /** Full set of entries the rewriter considered (added + alreadyPresent). */
  entries: IndexExportEntry[];
}

/**
 * Result of resolving the transitive closure of one or more component ids.
 */
export interface ResolvedClosure {
  /** All component ids that must be installed (input + transitive). */
  components: string[];
  /** All hook ids those components require. */
  hooks: string[];
  /** All util ids those components require. */
  utils: string[];
  /** All shared module ids referenced (types, themes, styles, store). */
  shared: string[];
  /** All external npm packages referenced. */
  externalPackages: string[];
  /** Subset of externalPackages that are optional peer deps. */
  optionalPeers: string[];
  /** Ids supplied that could not be resolved against the manifest. */
  unknown: string[];
}
