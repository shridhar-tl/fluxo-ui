#!/usr/bin/env node

import { parseArgs } from './args.js';
import { showHelp } from './help.js';
import { handleAdd } from './add.js';
import { handleUpdate } from './update.js';
import { handleRemove } from './remove.js';
import { reportAndExit } from './errors.js';

async function main() {
  try {
    const args = parseArgs(process.argv.slice(2));

    if (args.options.help) {
      showHelp();
      process.exit(0);
    }

    if (!args.command) {
      console.error('Error: No command specified');
      showHelp();
      process.exit(1);
    }

    if (args.command === 'add') {
      await handleAdd(args.options, args.components);
    } else if (args.command === 'update') {
      await handleUpdate(args.options, args.components);
    } else if (args.command === 'remove') {
      await handleRemove(args.options, args.components);
    }
  } catch (error) {
    reportAndExit(error, 'general');
  }
}

main();
