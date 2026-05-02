#!/usr/bin/env node
/**
 * CLI test aggregator — runs every verify-* suite that exercises the
 * Cherry Pick Components CLI and reports a combined PASS/FAIL summary.
 *
 * Each child suite is invoked as its own Node process so a hard crash in one
 * suite never short-circuits the rest. Stdout/stderr from children stream
 * through unchanged so individual PASS/FAIL lines stay visible.
 *
 * Exit codes:
 *   0 — every suite reported pass
 *   1 — at least one suite reported fail (or crashed)
 */

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));

const SUITES = [
  { id: 'cli-args', script: 'verify-cli-args.mjs', label: 'CLI argument parser' },
  { id: 'project-detection', script: 'verify-project-detection.mjs', label: 'Project detection' },
  { id: 'config', script: 'verify-config.mjs', label: 'Config CRUD + drift detection' },
  { id: 'manifest', script: 'verify-manifest.mjs', label: 'Component manifest + closure resolver' },
  { id: 'dependency-resolution', script: 'verify-dependency-resolution.mjs', label: 'Source providers + planner + installer' },
  { id: 'file-operations', script: 'verify-file-operations.mjs', label: 'Per-file conflict classification + atomic write' },
  { id: 'index-rewriter', script: 'verify-index-rewriter.mjs', label: 'Index export rewriter' },
  { id: 'interactive', script: 'verify-interactive.mjs', label: 'Interactive prompt helpers' },
  { id: 'error-handling', script: 'verify-error-handling.mjs', label: 'Typed errors + source probe + dep analysis' },
  { id: 'styles-bundle', script: 'verify-styles-bundle.mjs', label: 'Theme/styles vendoring + --css mode' },
];

const COLOR = process.stdout.isTTY ? {
  reset: '[0m',
  bold: '[1m',
  green: '[32m',
  red: '[31m',
  yellow: '[33m',
  cyan: '[36m',
  dim: '[2m',
} : Object.fromEntries(['reset', 'bold', 'green', 'red', 'yellow', 'cyan', 'dim'].map((k) => [k, '']));

const argv = process.argv.slice(2);
const onlyFlag = argv.indexOf('--only');
const only = onlyFlag !== -1 && argv[onlyFlag + 1]
  ? argv[onlyFlag + 1].split(',').map((s) => s.trim()).filter(Boolean)
  : null;

const suitesToRun = only ? SUITES.filter((s) => only.includes(s.id)) : SUITES;

if (only && suitesToRun.length === 0) {
  console.error(`${COLOR.red}No matching suite for --only ${argv[onlyFlag + 1]}${COLOR.reset}`);
  console.error(`Known suite ids: ${SUITES.map((s) => s.id).join(', ')}`);
  process.exit(1);
}

const results = [];
const startedAt = Date.now();

for (const suite of suitesToRun) {
  const scriptPath = path.join(here, suite.script);
  const header = `${COLOR.bold}${COLOR.cyan}━━━ ${suite.label} (${suite.id}) ━━━${COLOR.reset}`;
  console.log(`\n${header}`);
  const t0 = Date.now();
  const proc = spawnSync(process.execPath, [scriptPath], {
    stdio: 'inherit',
    env: process.env,
  });
  const ms = Date.now() - t0;
  const ok = proc.status === 0;
  results.push({ ...suite, ok, ms, status: proc.status, signal: proc.signal });
  const tag = ok ? `${COLOR.green}PASS${COLOR.reset}` : `${COLOR.red}FAIL${COLOR.reset}`;
  console.log(`${COLOR.dim}↳ ${tag} ${COLOR.dim}${ms} ms${COLOR.reset}`);
}

const totalMs = Date.now() - startedAt;
const passed = results.filter((r) => r.ok).length;
const failed = results.length - passed;

console.log(`\n${COLOR.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLOR.reset}`);
console.log(`${COLOR.bold}CLI test aggregator summary${COLOR.reset} ${COLOR.dim}(${totalMs} ms)${COLOR.reset}`);
console.log(`${COLOR.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLOR.reset}`);

const idCol = Math.max(...results.map((r) => r.id.length));
for (const r of results) {
  const tag = r.ok ? `${COLOR.green}PASS${COLOR.reset}` : `${COLOR.red}FAIL${COLOR.reset}`;
  const id = r.id.padEnd(idCol, ' ');
  const extra = r.ok ? '' : ` ${COLOR.dim}(exit=${r.status}${r.signal ? `, signal=${r.signal}` : ''})${COLOR.reset}`;
  console.log(`  ${tag}  ${id}  ${COLOR.dim}${r.ms} ms${COLOR.reset}${extra}`);
}

console.log(`\n${COLOR.bold}Totals:${COLOR.reset} ${passed} passed, ${failed} failed, ${results.length} suites.`);

if (failed > 0) {
  console.error(`\n${COLOR.red}${COLOR.bold}One or more verify suites failed.${COLOR.reset}`);
  process.exit(1);
}

console.log(`${COLOR.green}${COLOR.bold}All CLI verify suites passed.${COLOR.reset}`);
process.exit(0);
