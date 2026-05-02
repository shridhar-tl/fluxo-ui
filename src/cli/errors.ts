import chalk from 'chalk';

export type CliErrorMode = 'add' | 'update' | 'remove' | 'general';

export interface CliErrorOptions {
  exitCode?: number;
  hint?: string;
  cause?: unknown;
  mode?: CliErrorMode;
}

export class CliError extends Error {
  readonly exitCode: number;
  readonly hint?: string;
  readonly mode: CliErrorMode;
  readonly cause?: unknown;

  constructor(message: string, options: CliErrorOptions = {}) {
    super(message);
    this.name = 'CliError';
    this.exitCode = options.exitCode ?? 1;
    this.hint = options.hint;
    this.mode = options.mode ?? 'general';
    this.cause = options.cause;
  }
}

export class SourceAccessError extends CliError {
  readonly originUrl?: string;
  readonly statusCode?: number;
  constructor(
    message: string,
    options: CliErrorOptions & { originUrl?: string; statusCode?: number } = {}
  ) {
    super(message, options);
    this.name = 'SourceAccessError';
    this.originUrl = options.originUrl;
    this.statusCode = options.statusCode;
  }
}

export class ConfigStateError extends CliError {
  constructor(message: string, options: CliErrorOptions = {}) {
    super(message, options);
    this.name = 'ConfigStateError';
  }
}

export class UnknownComponentError extends CliError {
  readonly unknownIds: string[];
  constructor(unknownIds: string[], options: CliErrorOptions = {}) {
    const list = unknownIds.join(', ');
    super(`No installable components from the requested list: ${list}`, options);
    this.name = 'UnknownComponentError';
    this.unknownIds = unknownIds;
  }
}

export class PartialInstallError extends CliError {
  readonly missingFiles: string[];
  readonly unresolvedImports: string[];
  constructor(
    missingFiles: string[],
    unresolvedImports: string[],
    options: CliErrorOptions = {}
  ) {
    super(
      `Partial install: ${missingFiles.length} file(s) could not be fetched and ${unresolvedImports.length} import(s) were left unresolved.`,
      options
    );
    this.name = 'PartialInstallError';
    this.missingFiles = missingFiles;
    this.unresolvedImports = unresolvedImports;
  }
}

export interface FormattedError {
  header: string;
  body: string[];
  hint?: string;
  exitCode: number;
}

export function formatCliError(err: unknown, mode: CliErrorMode = 'general'): FormattedError {
  if (err instanceof CliError) {
    const effectiveMode = err.mode === 'general' ? mode : err.mode;
    return {
      header: prefixForMode(effectiveMode, err.name),
      body: splitMessage(err.message),
      hint: err.hint,
      exitCode: err.exitCode,
    };
  }
  if (err instanceof Error) {
    return {
      header: prefixForMode(mode, 'Error'),
      body: splitMessage(err.message),
      exitCode: 1,
    };
  }
  return {
    header: prefixForMode(mode, 'Error'),
    body: [String(err)],
    exitCode: 1,
  };
}

function prefixForMode(mode: CliErrorMode, name: string): string {
  switch (mode) {
    case 'add':
      return `[fluxo-cli add] ${name}`;
    case 'update':
      return `[fluxo-cli update] ${name}`;
    case 'remove':
      return `[fluxo-cli remove] ${name}`;
    default:
      return `[fluxo-cli] ${name}`;
  }
}

function splitMessage(message: string): string[] {
  if (!message) return [''];
  return message.split('\n');
}

export function printFormattedError(formatted: FormattedError): void {
  console.error(chalk.red.bold(formatted.header));
  for (const line of formatted.body) {
    console.error(chalk.red(`  ${line}`));
  }
  if (formatted.hint) {
    console.error('');
    console.error(chalk.yellow(`Hint: ${formatted.hint}`));
  }
}

export function reportAndExit(err: unknown, mode: CliErrorMode = 'general'): never {
  const formatted = formatCliError(err, mode);
  printFormattedError(formatted);
  process.exit(formatted.exitCode);
}

export interface ClassifiedFetchError {
  message: string;
  hint: string;
  isNetworkLevel: boolean;
  statusCode?: number;
}

export function classifyFetchError(err: unknown, originUrl?: string): ClassifiedFetchError {
  const message = err instanceof Error ? err.message : String(err);
  const lower = message.toLowerCase();
  const httpStatus = parseHttpStatusFromMessage(message);
  if (lower.includes('timeout')) {
    return {
      message: `Network request timed out${originUrl ? ` while fetching ${originUrl}` : ''}.`,
      hint: 'Check your internet connection and retry. If you are behind a corporate proxy, configure HTTPS_PROXY before re-running.',
      isNetworkLevel: true,
    };
  }
  if (
    lower.includes('enotfound') ||
    lower.includes('eai_again') ||
    lower.includes('econnrefused') ||
    lower.includes('econnreset') ||
    lower.includes('eaddrnotavail')
  ) {
    return {
      message: `Cannot reach the source repository${originUrl ? ` (${originUrl})` : ''}.`,
      hint: 'Verify your internet connection. If GitHub is unreachable, set FLUXO_UI_LOCAL_SOURCE=<path-to-fluxo-ui-src> to install from a local clone.',
      isNetworkLevel: true,
    };
  }
  if (lower.includes('cert') || lower.includes('ssl') || lower.includes('tls')) {
    return {
      message: `TLS/SSL error while fetching${originUrl ? ` ${originUrl}` : ''}.`,
      hint: 'Ensure your system clock is correct, certificate trust store is up to date, or set NODE_EXTRA_CA_CERTS to your corporate root certificate.',
      isNetworkLevel: true,
    };
  }
  if (httpStatus === 404) {
    return {
      message: `Source not found${originUrl ? ` (${originUrl})` : ''}.`,
      hint: 'The branch or file may have been renamed. Try the latest release ref via FLUXO_UI_REF=<branch|tag|sha> or report this in the FluxoUI issue tracker.',
      isNetworkLevel: false,
      statusCode: 404,
    };
  }
  if (httpStatus === 403) {
    return {
      message: `GitHub API rate limit hit or access denied${originUrl ? ` (${originUrl})` : ''}.`,
      hint: 'Wait a few minutes and retry. For higher limits set GITHUB_TOKEN, or set FLUXO_UI_LOCAL_SOURCE to bypass GitHub entirely.',
      isNetworkLevel: false,
      statusCode: 403,
    };
  }
  if (httpStatus && httpStatus >= 500 && httpStatus < 600) {
    return {
      message: `GitHub returned a server error (HTTP ${httpStatus})${originUrl ? ` for ${originUrl}` : ''}.`,
      hint: 'Retry in a moment — the upstream looks degraded. https://www.githubstatus.com/ has live status.',
      isNetworkLevel: false,
      statusCode: httpStatus,
    };
  }
  if (httpStatus) {
    return {
      message: `Unexpected HTTP ${httpStatus} response${originUrl ? ` from ${originUrl}` : ''}.`,
      hint: 'Re-run with --force after fixing connectivity, or use FLUXO_UI_LOCAL_SOURCE to install from a local clone.',
      isNetworkLevel: false,
      statusCode: httpStatus,
    };
  }
  return {
    message: message || 'Unknown source-provider error.',
    hint: 'Re-run the command. If the failure persists, set FLUXO_UI_LOCAL_SOURCE=<path-to-fluxo-ui-src> to install from a local clone.',
    isNetworkLevel: false,
  };
}

function parseHttpStatusFromMessage(message: string): number | undefined {
  const m = message.match(/HTTP\s+(\d{3})/i);
  if (m) return Number(m[1]);
  return undefined;
}
