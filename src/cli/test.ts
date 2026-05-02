#!/usr/bin/env node

/**
 * CLI Test Suite for Cherry Pick Components
 *
 * Run this file to verify CLI functionality:
 * node cli/entry.js --help
 * node cli/entry.js add --help
 * node cli/entry.js add Button Card --path ./test-components
 * node cli/entry.js update --force --path ./test-components
 */

import { parseArgs } from './args.js';

// Test cases
const testCases = [
  {
    name: 'Help flag',
    args: ['--help'],
    expected: { command: null, options: { help: true } },
  },
  {
    name: 'Add command',
    args: ['add'],
    expected: { command: 'add', options: {} },
  },
  {
    name: 'Add with components',
    args: ['add', 'Button', 'Card'],
    expected: { command: 'add', options: {}, components: ['Button', 'Card'] },
  },
  {
    name: 'Add with path',
    args: ['add', '--path', './src/fluxo', 'Button'],
    expected: { command: 'add', options: { path: './src/fluxo' }, components: ['Button'] },
  },
  {
    name: 'Update with force',
    args: ['update', '--force'],
    expected: { command: 'update', options: { force: true } },
  },
  {
    name: 'Short flags',
    args: ['-f', '-p', './components', 'add'],
    expected: { command: 'add', options: { force: true, path: './components' } },
  },
];

console.log('🧪 Running CLI argument parser tests...\n');

let passed = 0;
let failed = 0;

testCases.forEach((test) => {
  const result = parseArgs(test.args);
  const passed_test =
    result.command === test.expected.command &&
    Object.keys(test.expected.options).every(
      (key) => result.options[key as keyof typeof test.expected.options] === test.expected.options[key as keyof typeof test.expected.options]
    ) &&
    JSON.stringify(result.components) === JSON.stringify(test.expected.components);

  if (passed_test) {
    console.log(`✅ ${test.name}`);
    passed++;
  } else {
    console.log(`❌ ${test.name}`);
    console.log(`   Expected: ${JSON.stringify(test.expected)}`);
    console.log(`   Got:      ${JSON.stringify(result)}`);
    failed++;
  }
});

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
