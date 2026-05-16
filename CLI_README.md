# fluxo-cli

Cherry-pick FluxoUI components into your project as **plain source files**. No runtime dependency on the `fluxo-ui` library — everything lands in your repo, ready to edit, review, and ship.

```bash
npx fluxo-cli add Button TextInput
```

That's it. Real `.tsx` files appear in `./src/components/fluxo-ui/`, the matching SCSS is vendored alongside, and your project's `package.json` gains nothing from the FluxoUI library at runtime.

---

## Why fluxo-cli?

- **Vendor in, library out** — copies real component source into your repo.
- **No hidden dependency** — your project never imports from `fluxo-ui` at runtime.
- **Transitive resolution** — pulls every sub-component, hook, util, type, theme, and icon SVG a component needs.
- **Drift-aware updates** — SHA-256 checksums per file. `update` warns before overwriting your local edits.
- **Theme-aware** — only the brand themes you pick get vendored.
- **SCSS or plain CSS** — default ships SCSS; pass `--css` to pre-compile.
- **Interactive & scriptable** — TTY prompts when you need them, `--force` for CI.
- **Safe `remove`** — won't delete a component another installed component still depends on.

---

## Install / running

`fluxo-cli` is published as a separate npm package from the `fluxo-ui` library. Run it with `npx` (no install needed) or install it globally.

```bash
# One-off via npx
npx fluxo-cli add Button

# pnpm / yarn equivalents
pnpm dlx fluxo-cli add Button
yarn dlx fluxo-cli add Button

# Global install (then run as 'fluxo-cli ...' anywhere)
npm i -g fluxo-cli
fluxo-cli add Button
```

### Prerequisites in your project

- A `package.json` (run from your project root).
- TypeScript — components are `.tsx`. JS-only projects get a one-time warning.
- `react`, `react-dom`, and `classnames` in your project dependencies.
- A Sass loader if you keep the default SCSS output. Otherwise pass `--css`.

---

## Commands

| Command | What it does |
|---|---|
| `add` | Install components (interactive picker if no ids) |
| `update` | Refresh installed components from upstream |
| `remove` | Uninstall components (with reverse-dependency safety) |

### `add`

```bash
# Interactive: pick components + themes
npx fluxo-cli add

# By id (kebab-case slug or PascalCase name both work)
npx fluxo-cli add button text-input

# Custom install path
npx fluxo-cli add Button --path ./app/ui/components

# Pick themes inline
npx fluxo-cli add Button --themes blue,lara

# Pre-compile SCSS to plain CSS
npx fluxo-cli add Button --css

# CI / scripted: skip every prompt, overwrite local edits
npx fluxo-cli add Button --force
```

### `update`

```bash
# Refresh every installed component
npx fluxo-cli update

# Refresh just these
npx fluxo-cli update button modal

# Add a new theme to the existing install
npx fluxo-cli update --themes purple

# CI: bypass prompts, overwrite local edits
npx fluxo-cli update --force
```

Drift detection: each file's SHA-256 is recorded in `fluxo-ui.config.json`. On update, the CLI compares on-disk content against the recorded checksum. Locally-modified files are **skipped by default** — re-run with `--force` (or pick `Overwrite` at the prompt) to replace them.

### `remove`

```bash
# Interactive: pick components to uninstall
npx fluxo-cli remove

# Specific ids
npx fluxo-cli remove modal tooltip

# Bypass the confirm prompt
npx fluxo-cli remove modal --force
```

`remove` checks for **reverse dependencies** before deleting anything. If `tooltip` is still required by `button` and you didn't include `button` in the same command, `tooltip` is preserved with a clear message:

```
Cannot remove the following components — they are still required by other installed components:
  • tooltip
      ↳ used by button (Button)
```

---

## Styles & themes

Every install vendors a complete styling bundle. **You do not need to import anything from `fluxo-ui`** at runtime.

After your first `add`, import the generated `styles/index.css` once at your app entry:

```ts
// main.tsx / app.tsx / _app.tsx
import './components/fluxo-ui/styles/index.css';
```

Apply a theme by setting a class on `<body>` (or any ancestor): `theme-blue`, `theme-lara`, etc. Add `mode-dark` for dark mode.

### Theme selection

The CLI does **not** dump every theme into your project. On the first `add` you see a multi-select prompt; the choice is persisted in `fluxo-ui.config.json` and reused on every subsequent run.

```bash
# Inline (comma-separated)
npx fluxo-cli add Button --themes blue,lara

# Add another theme later
npx fluxo-cli update --themes purple
```

Available themes: `blue`, `lara`, `green`, `purple`, `orange`, `indigo`, `rose`, `amber`, `teal`, `emerald`, `fuchsia`, `slate`.

### What lands in your install root

```
./src/components/fluxo-ui/
  _eui-vars.scss            # shared SCSS variables, mixins, tokens
  styles/
    index.css               # entry point — import this in your app
    base-theme.css          # CSS custom properties (always vendored)
    theme-blue.css          # only the themes you selected
    theme-lara.css
  button/
    Button.tsx
    Button.scss             # @use '../eui-vars' as *;
  index.ts                  # auto-managed barrel
```

### SCSS or CSS

Default vendor: `.scss`. Your project needs a Sass loader (e.g. `npm i -D sass` for Vite/Next.js).

`--css` mode: every `.scss` is compiled to `.css` at install time, and `.tsx` imports are rewritten from `'./Foo.scss'` to `'./Foo.css'`. Useful for projects without a Sass toolchain.

---

## Configuration file

The first `add` writes `fluxo-ui.config.json` next to your `package.json`:

```json
{
  "version": "1.0.0",
  "path": "./src/components/fluxo-ui",
  "themes": ["blue", "lara"],
  "components": {
    "button": {
      "name": "Button",
      "version": "github:shridhar-tl/fluxo-ui@main",
      "checksum": "8d4f...e102",
      "files": [
        { "path": "Button.tsx",  "checksum": "5c1a...771b" },
        { "path": "Button.scss", "checksum": "9e0d...2a44" }
      ],
      "installedAt": "2026-05-02T10:23:11.491Z"
    }
  },
  "lastUpdated": "2026-05-02T10:23:11.491Z"
}
```

Commit this file alongside your source — it's the source of truth for what's installed and which themes you've opted into.

---

## Flags & environment

| Flag | Purpose |
|---|---|
| `--path <dir>` | Install root (default `./src/components/fluxo-ui`) |
| `--force` | Skip every prompt; overwrite local edits |
| `--css` | Compile SCSS to CSS at install time |
| `--themes <list>` | Comma-separated theme list (e.g. `blue,lara`) |
| `--no-export` | Don't rewrite the install-root `index.ts` |
| `--no-export-hooks` | Don't re-export hooks from `index.ts` |
| `--no-export-utils` | Don't re-export utils from `index.ts` |
| `--help` | Show full usage |

| Env var | Purpose |
|---|---|
| `FLUXO_UI_LOCAL_SOURCE` | Use a local clone of FluxoUI `src/` instead of GitHub |
| `FLUXO_UI_REF` | Branch / tag / commit SHA to fetch from (default: repo's default branch) |
| `GITHUB_TOKEN` | Bearer token for higher GitHub raw-content rate limits |
| `HTTPS_PROXY` / `NODE_EXTRA_CA_CERTS` | Standard Node networking knobs |

---

## Source resolution

By default, the CLI fetches component source from the GitHub repo recorded in your project's `package.json` `repository` field. It falls back to `shridhar-tl/fluxo-ui` if no `repository` is set.

For air-gapped installs or working from a fork:

```bash
FLUXO_UI_LOCAL_SOURCE=/path/to/fluxo-ui/src npx fluxo-cli add Button
```

Pin to a specific upstream revision:

```bash
FLUXO_UI_REF=v1.4.0 npx fluxo-cli update --force
```

---

## Cancel-safe by design

Press `Ctrl+C` at any prompt. The process exits cleanly with code 0, never partially writes (every file write is atomic via temp + rename), and re-running picks up exactly where you left off.

---

## License

MIT — see [LICENSE](./LICENSE).

---

For the full FluxoUI showcase and component documentation, visit [fluxo-ui.utilsware.com](https://fluxo-ui.utilsware.com/).
