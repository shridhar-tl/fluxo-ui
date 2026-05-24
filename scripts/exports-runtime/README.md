# Runtime export-resolution suite

`node scripts/exports-runtime/verify-exports-runtime.mjs`

Imports **every** advertised symbol from every barrel (`.`, `./chat`, `./report-builder`,
`./report-viewer`, `./draw`, plus `./hooks`, `./store`, `./store/middlewares`,
`./utils`, `./services`, `./icons`) through a real consumer bundle and asserts each
resolves to a **defined, non-null runtime value** — exactly what a client app does.

## Why it exists

The css-wiring / tree-shaking / exports suites prove styling, chunk-isolation, and that
advertised files exist. None of them ever imported a symbol and checked its value. A
chunking change can leave a symbol exported by name but `undefined` at runtime (a chunk's
lazy value is imported but its `init` never runs). That shipped `Drawer`, `FileBrowser`,
`JsonEditor`, `TreeView`, `NotificationCenter`, `ContextMenuManager`, `FileKindIcon` and
several calendar view-defs as `undefined` to clients while every other suite was green.
This suite is the guard against that entire class of bug.

## How to run

```bash
npm run test:runtime        # build-lib first, then check
npm run test:runtime:fast   # check the existing dist/ (no rebuild)
```

`npm test` runs this as part of the single gate (after css-wiring's build, with
`--no-build`). It fails with the exact `import { X } from '<subpath>'` that yields
`undefined`.

## Method

For each barrel it generates a tiny entry that does `import * as M from '<subpath>'`,
bundles it with Vite (`noExternal`) the way a client bundles, executes it, and reports any
key where `M[key]` is undefined/null. No static guessing — it runs the real built code.
