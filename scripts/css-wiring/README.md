# CSS & Asset Wiring Test Suite

This suite catches a class of bug that unit tests and source-level checks cannot see: a
component whose styles ship correctly **only because some sibling file happened to import its
SCSS**. When a real consumer imports just that one component, the bundler tree-shakes the
unused sibling away and the component renders with **zero CSS** — looking broken on first
load, fine after navigating somewhere that pulls the sibling in.

The drag-drop components had this bug. This suite verifies the rest of the library, the way a
real npm consumer actually bundles it.

## Core principle

**Never test the source. Never test via deep file paths.** Every check runs against the
output of `npm run build-lib`, consumed exactly like a published npm package:

- A throwaway consumer app is generated whose `package.json` has its **own name** (not
  `fluxo-ui`). This is essential — without it, Node/Vite "self-reference" resolution would
  resolve `import 'fluxo-ui'` back to this repo's own `package.json`/`src`, silently
  bypassing the build entirely. The consumer's `node_modules/fluxo-ui` is a junction to
  `dist/`, so imports resolve through `dist/package.json` `exports`, like any consumer.
- Imports use **package specifiers only** (`fluxo-ui`, `fluxo-ui/report-viewer`,
  `fluxo-ui/styles`, …) — never `fluxo-ui/dist/components/Foo`.
- Each component is **rendered** (`createElement(C)` into a root), so it is genuinely
  retained. A component that is only imported-but-not-used, or only referenced inside an
  array, would be tree-shaken and its CSS check would be meaningless.

## How "does this component have CSS" is decided

Class-name guessing is unreliable (`TextArea` → `.eui-textarea`, `CommandPalette` →
`.eui-cmdp`, `DeferredView` → `.eui-deferred-view-placeholder`). Expected selectors are
derived, not guessed:

1. **Universe** — every `.eui-*` class that physically exists in the built CSS
   (`dist/styles/**`, excluding the token file). This is the ground truth of what the build
   actually ships.
2. **Ownership** — a class is "owned" by a component folder when that folder's SCSS is the
   *only* one that declares the class's top-level prefix. Classes declared in several
   folders (e.g. the shared `.eui-visually-hidden`) are excluded so a signature can never
   pass on a shared utility.
3. **Render graph** — for each exported symbol, its source import graph is walked to collect
   the `eui-*` class literals it actually renders. This is independent of which file imports
   the SCSS, so it is immune to the very bug we are hunting.
4. **Signature** = rendered classes ∩ universe ∩ classes owned by the component's *own*
   defining folder. This excludes classes that belong to imported dependency components
   (e.g. a `<Button>` rendered inside another component) and classes of co-located but
   unused components.

A component with an empty signature is reported as **N/A** (non-visual export, a constant, or
a component styled entirely by shared/utility classes — these legitimately have no own CSS).

## What runs

- **Test A — isolation (the sharp test).** One consumer per component, importing *only* that
  component, built with `cssCodeSplit`. Its CSS is collected transitively through the Vite
  manifest's `imports` graph (a component's CSS often lives in a shared chunk). PASS = all of
  the component's own signature classes are present; FAIL = none present; PARTIAL = some
  missing (a real split-CSS problem).
- **Test B — single vendor chunk.** Every component imported into one app and forced into a
  single merged chunk (`codeSplitting: false`) — the worst case for a consumer that collapses
  everything with `manualChunks`. Confirms the collapse path drops no CSS.
- **Assets & secondary entries.** `fluxo-ui/styles` ships `--eui-*` tokens + themes + dark
  mode; `fluxo-ui/icons` resolve and bundle; `fluxo-ui/hooks|store|store/middlewares|utils|
  services` resolve through their exports; fonts (`Inter` token + fallback; reports binary
  font assets shipped, currently 0 — Inter is referenced by name).
- **Self-check (sensitivity proof).** Copies `dist/` to a temp dir, removes a known-good
  component's own CSS import from its chunk (faithfully reproducing the bug), and rebuilds a
  consumer against the tampered copy in a clean child process. The suite must report the
  pristine build as fully styled **and** the tampered build as fully unstyled. If it cannot
  tell the two apart, the suite declares itself NOT SENSITIVE and fails — a green run is only
  trustworthy because this proves the checks actually bite.

## Running

```bash
# Canonical: fresh build-lib, then verify (this is what `npm test` runs)
npm run test:css

# Iterate locally against the existing dist/ without rebuilding
npm run test:css:fast

# Smoke-test the harness on the first 12 components
node scripts/css-wiring/verify-css-wiring.mjs --no-build --quick
```

`build-lib` is run as a prerequisite by default. Pass `--no-build` (or set
`CSS_TEST_NO_BUILD=1`) to test the `dist/` already on disk — the suite assumes that build is
fresh and tells you which mode it used.

Exit code is non-zero if any component FAILs/PARTIALs, any asset/entry check fails, or the
self-check is not sensitive. The generated consumer apps live in `.css-test/` (gitignored).

## Files

- `verify-css-wiring.mjs` — orchestrator: discovery, Test A, Test B, asset checks, self-check,
  report, exit code.
- `lib.mjs` — discovery, the signature oracle, the consumer-build runner, CSS collection.
- `build-worker.mjs` — runs one consumer build in a clean child process (used by the
  self-check so a tampered `dist` resolution can't be polluted by an earlier in-process build).
