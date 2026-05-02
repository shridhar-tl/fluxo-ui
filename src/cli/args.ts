import type { ParsedArgs } from './types.js';

const COMMAND_NAMES = new Set(['add', 'update', 'remove']);

export function parseArgs(argv: string[]): ParsedArgs {
  const result: ParsedArgs = {
    command: null,
    options: {},
    components: [],
  };

  let command: 'add' | 'update' | 'remove' | null = null;
  const components: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (COMMAND_NAMES.has(arg) && !command) {
      command = arg as 'add' | 'update' | 'remove';
    } else if (arg === '--help' || arg === '-h') {
      result.options.help = true;
    } else if (arg === '--force' || arg === '-f') {
      result.options.force = true;
    } else if (arg === '--path' || arg === '-p') {
      if (i + 1 < argv.length) {
        result.options.path = argv[++i];
      }
    } else if (arg === '--css') {
      result.options.css = true;
    } else if (arg === '--themes') {
      if (i + 1 < argv.length) {
        result.options.themes = argv[++i]
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t.length > 0);
      }
    } else if (arg.startsWith('--themes=')) {
      result.options.themes = arg
        .slice('--themes='.length)
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
    } else if (arg === '--no-export') {
      result.options.noExport = true;
    } else if (arg === '--no-export-hooks') {
      result.options.noExportHooks = true;
    } else if (arg === '--no-export-utils') {
      result.options.noExportUtils = true;
    } else if (!arg.startsWith('--') && !arg.startsWith('-') && !COMMAND_NAMES.has(arg)) {
      components.push(arg);
    }
  }

  result.command = command;
  if (components.length > 0) {
    result.components = components;
  }

  return result;
}

export function validatePath(path: string | undefined): boolean {
  if (!path) return true;
  if (typeof path !== 'string') return false;
  if (path.trim() === '') return false;
  return true;
}
