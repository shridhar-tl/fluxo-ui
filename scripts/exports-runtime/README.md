# Runtime export-resolution suite

`node scripts/exports-runtime/verify-exports-runtime.mjs`

For **every** advertised symbol from every barrel (`.`, `./chat`, `./report-builder`,
`./report-viewer`, `./draw`, plus `./hooks`, `./store`, `./store/middlewares`,
`./utils`, `./services`, `./icons`), it bundles a consumer entry that imports **just
that one symbol by name**, through a real **client** build with **production
tree-shaking**, and asserts the binding resolves to a **defined, non-null** value —
exactly what a client app ships to the browser.

## Why it exists

A chunking / output setting can leave a symbol exported by name but `undefined` at
runtime: the value is assigned only inside a lazy `__esmMin` init whose single eager
kickoff call is an unused expression statement, and because the package's
`sideEffects` marks all `.js` pure, the consumer's tree-shaker drops that call. The
binding ships as `undefined`. This shipped **nearly the whole library** (391/450
symbols) as `undefined` to consumers in one release while the other suites were green —
none of them ever imported a symbol and checked its value.

## The method is the whole point

Three things make this test faithful. Do **not** weaken any of them:

1. **Each symbol imported ALONE.** Importing all of a barrel's symbols into one entry
   keeps the entire module graph reachable, so every lazy init survives and the test
   can't fail — it masks the bug. A real consumer imports a handful; that is the
   failing case. So each symbol gets its own isolated bundle.
2. **Client build, named import.** `import { X } from '<subpath>'` in a normal client
   build (NOT `ssr`, NOT `import * as M`). SSR builds and namespace imports both retain
   the graph and hide the bug.
3. **Resolve through a real package.** `fluxo-ui` (and react/react-dom) are symlinked
   into a temp consumer's `node_modules`, so the package's own `exports` map and
   `sideEffects` field drive resolution and tree-shaking — exactly as for a real
   consumer. Do **not** hard-alias `fluxo-ui` to `dist/index.js`; that breaks every
   `fluxo-ui/<subpath>` import and produces false positives.

## How to run

```bash
npm run test:runtime        # build-lib first, then check
npm run test:runtime:fast   # check the existing dist/ (no rebuild)
```

`npm test` runs this as part of the single gate (with `--no-build`, after css-wiring's
build). It fails with the exact `import { X } from '<subpath>'` that yields
`undefined`. Probing runs concurrently (pool size via `EXPORTS_RUNTIME_POOL`, default
8) and finishes in ~15s.
