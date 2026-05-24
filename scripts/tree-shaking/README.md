# Tree-shaking & chunk-isolation suite

`node scripts/tree-shaking/verify-tree-shaking.mjs`

This suite proves the library's central bundling guarantee:

> A consumer who imports one thing from `fluxo-ui` gets only that thing (plus its
> genuine dependencies) in their final bundle — never an unrelated component,
> never an optional peer dep they don't use, never the whole library.

It is the permanent regression guard for the class of bug where a component's
code (or CSS) gets inlined into, or merged with, another component's chunk.
Because component CSS is delivered by `vite-plugin-lib-inject-css` (a JS-side
import), isolating the JS chunks isolates the CSS too — so the checks key on the
built dist chunk graph and on per-component isolated consumer builds.

## How to run

```bash
npm run test:tree          # build-lib first, then run all checks
npm run test:tree:fast     # run against the existing dist/ (no rebuild)
node scripts/tree-shaking/verify-tree-shaking.mjs --quick   # sample subset (dev loop)
```

`npm test` runs this automatically after the CSS-wiring suite (with `--no-build`,
reusing that suite's fresh build).

## The five checks

Each check is independent, has explicit pass criteria, and on failure prints
exactly what leaked into what.

1. **Component isolation.** For every exported visual component, a throwaway
   consumer app that imports only that component is built. Its emitted CSS may
   only contain classes belonging to the component's own dist-chunk closure
   (the chunk it resolves to, plus everything that chunk statically imports).
   A foreign component's CSS class appearing = an unrelated component was bundled
   in. The dist chunk graph is the source of truth, so a genuine dependency
   (e.g. `ChatWindow` → `Splitter`) is allowed automatically, while a real leak
   (e.g. `TextInput` dragging in `ReportViewer`) fails.

2. **No barrel import.** No per-component chunk in `dist/components/` may
   statically import the top-level `index.js` barrel. A chunk that does
   re-bundles the ENTIRE library for anyone importing that one component. This is
   a fast static scan of the built chunks.

3. **Optional peer-dep confinement.** `chart.js`, `react-chartjs-2`, and
   `html2canvas` are optional peer deps. A component that does not use them must
   not bundle them — otherwise a consumer without those installed breaks just by
   importing an unrelated component. The check fails the import if a marker for
   one of these deps appears in a component that doesn't declare it in its source
   import graph.

4. **No big CSS duplication.** A component-owned class may appear as a top-level
   rule block in only one CSS file. A scoped single-property override nested
   under another component's selector (e.g. `.eui-multiselect-item .eui-checkbox
   { pointer-events: none }`) is allowed; a full re-definition of the owner's
   styles in a second file (the symptom of `@use`-ing one component's SCSS into
   another) fails.

5. **Pure-logic export isolation.** A directly-exported context / enum / registry
   / parser (a module that renders no `eui-` class and imports no CSS) must
   import with ZERO component CSS attached. This guards the case where importing
   a lightweight public export (e.g. `CalendarContext`) drags in its whole
   CSS-heavy feature component.

## Relationship to the CSS-wiring suite

The two suites are complementary:

- **css-wiring** (`scripts/css-wiring/`) proves each component is fully *styled*
  when imported alone (its CSS is present).
- **tree-shaking** (this suite) proves each component pulls in *nothing extra*
  when imported alone (no foreign CSS/JS/deps).

Together they pin both directions: styled enough, but not bloated.

## Shared infrastructure

This suite reuses the consumer-build harness in
`scripts/css-wiring/lib.mjs` (`discoverEntries`, `parseRuntimeExports`,
`buildOwnership`, `signatureForRoot`, `ensureConsumerLink`, `readAllCss`, …).
Keep the two suites' barrel list (`COMPONENT_BARRELS`) in sync.
