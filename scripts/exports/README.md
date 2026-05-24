# Package exports integrity suite

`node scripts/exports/verify-exports.mjs`

Proves that every path the published package advertises actually exists, so a
consumer never hits "module not found" / ENOENT the moment they import a subpath,
a `types` file, a `require` (CJS) build, `./styles`, `./mcp-index.json`, or run
the `bin`.

## How to run

```bash
npm run test:exports        # build-lib first, then check
npm run test:exports:fast   # check the existing dist/ (no rebuild)
```

`npm test` runs this after the css-wiring and tree-shaking suites (with
`--no-build`, reusing their fresh build).

## The three checks

1. **dist exports resolve.** For the SHIPPED `dist/package.json` (what consumers
   actually get), every target of every `exports` condition (`types`, `import`,
   `require`, and plain-string targets such as `./styles` and `./mcp-index.json`)
   plus `main`, `module`, `types`, and each `bin` must exist on disk. Failure
   names the subpath, the condition, and the missing absolute path.

2. **root exports resolve.** Same check against the root `package.json` (whose
   `./dist/...` targets are rewritten into the shipped manifest at build time).

3. **exports ↔ vite-plugin alias sync.** Every code subpath in the root
   `exports` (anything with an `import`/`types` condition) must have a matching
   `aliases['fluxo-ui/<subpath>']` entry in `src/plugins/vite/index.ts`, so
   `EUI_USE_SOURCE` consumers can resolve it to source. Plain-string targets
   (`.css`/`.json`) need no alias. `./vite-plugin` is exempt
   (`ALIAS_EXEMPT_SUBPATHS`) because it is the bootstrap plugin that turns on
   source mode and must load from the installed package.

## Adding a new export

When you add a subpath to `package.json` `exports`, this suite will fail until:
- the build emits the target files (CHECK 1/2), and
- you add the matching alias in `src/plugins/vite/index.ts` (CHECK 3),

which is exactly the sync invariant documented in CLAUDE.md.
