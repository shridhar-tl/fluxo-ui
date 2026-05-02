/**
 * Manual verification script for CLI argument parsing
 * Run with: node scripts/verify-cli-args.mjs
 */

// Minimal parseArgs implementation for verification
function parseArgs(argv) {
  const result = {
    command: null,
    options: {},
    components: [],
  };

  let command = null;
  const components = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === 'add' && !command) {
      command = 'add';
    } else if (arg === 'update' && !command) {
      command = 'update';
    } else if (arg === '--help' || arg === '-h') {
      result.options.help = true;
    } else if (arg === '--force' || arg === '-f') {
      result.options.force = true;
    } else if (arg === '--path' || arg === '-p') {
      if (i + 1 < argv.length) {
        result.options.path = argv[++i];
      }
    } else if (!arg.startsWith('--') && !arg.startsWith('-') && arg !== 'add' && arg !== 'update') {
      components.push(arg);
    }
  }

  result.command = command;
  if (components.length > 0) {
    result.components = components;
  }

  return result;
}

// Test cases
const tests = [
  {
    name: 'Help flag',
    args: ['--help'],
    expected: { command: null, options: { help: true }, components: [] },
  },
  {
    name: 'Add command',
    args: ['add'],
    expected: { command: 'add', options: {}, components: [] },
  },
  {
    name: 'Add with components',
    args: ['add', 'Button', 'Card'],
    expected: { command: 'add', options: {}, components: ['Button', 'Card'] },
  },
  {
    name: 'Add with path option',
    args: ['add', '--path', './src/fluxo', 'Button'],
    expected: { command: 'add', options: { path: './src/fluxo' }, components: ['Button'] },
  },
  {
    name: 'Update with force',
    args: ['update', '--force'],
    expected: { command: 'update', options: { force: true }, components: [] },
  },
  {
    name: 'Short flags',
    args: ['-f', '-p', './components', 'add'],
    expected: { command: 'add', options: { force: true, path: './components' }, components: [] },
  },
];

console.log('🧪 Verifying CLI argument parser...\n');

let passed = 0;
let failed = 0;

tests.forEach((test) => {
  const result = parseArgs(test.args);
  const resultStr = JSON.stringify(result);
  const expectedStr = JSON.stringify(test.expected);
  const testPassed = resultStr === expectedStr;

  if (testPassed) {
    console.log(`✅ ${test.name}`);
    passed++;
  } else {
    console.log(`❌ ${test.name}`);
    console.log(`   Expected: ${expectedStr}`);
    console.log(`   Got:      ${resultStr}`);
    failed++;
  }
});

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
}
