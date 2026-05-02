export function showHelp(): void {
  const help = `
FluxoUI CLI — Cherry Pick Components

Usage:
  npx fluxo-cli add [components] [options]
  npx fluxo-cli update [components] [options]
  npx fluxo-cli remove [components] [options]
  fluxo-cli add [components] [options]
  fluxo-cli update [components] [options]
  fluxo-cli remove [components] [options]

Commands:
  add       Add new components to your project
  update    Update existing components in your project
  remove    Uninstall components from your project

Options:
  --path, -p <path>    Destination path for components (default: ./src/components/fluxo-ui)
  --force, -f          Skip every prompt; overwrite local edits without asking
  --css                Pre-compile vendored .scss files to plain .css (rewrites
                       .tsx imports from './Foo.scss' to './Foo.css').
  --themes <list>      Comma-separated theme list to vendor (default: blue).
                       Available: blue, lara, green, purple, orange, indigo,
                       rose, amber, teal, emerald, fuchsia, slate.
  --no-export          Skip rewriting the install-root index.ts entirely
  --no-export-hooks    Suppress hook re-exports from the install-root index.ts
  --no-export-utils    Suppress util re-exports from the install-root index.ts
  --help, -h           Show this help message

Environment variables:
  FLUXO_UI_LOCAL_SOURCE  Use a local FluxoUI src/ checkout instead of GitHub.
  FLUXO_UI_REF           Branch, tag, or commit SHA to fetch from GitHub
                         (default: repo default branch).
  GITHUB_TOKEN           Bearer token for GitHub raw fetches (raises rate limit).
  HTTPS_PROXY,
  NODE_EXTRA_CA_CERTS    Standard Node networking knobs for proxies / corp CAs.

Interactive prompts:
  • If components are omitted, you will be asked to multi-select from the
    full FluxoUI catalogue (Space toggles, Enter confirms).
  • If --path is omitted on a fresh add, you will be asked for an install
    path (default: ./src/components/fluxo-ui).
  • Each existing component subfolder triggers an "overwrite or skip" prompt
    before files are touched.
  • Any locally-modified file shows a "overwrite / skip / overwrite-all /
    skip-all" choice before being written.
  • TypeScript-less projects show a one-time warning before adding TSX
    components — they still install if you confirm.
  • Press Ctrl+C at any prompt to abort the run cleanly.

Examples:
  npx fluxo-cli add                       # interactive: pick components + themes
  npx fluxo-cli add Button Card Form
  npx fluxo-cli add --path ./src/fluxo Button
  npx fluxo-cli add --themes blue,lara Button
  npx fluxo-cli update                    # interactive: pick installed
  npx fluxo-cli update Card Modal
  npx fluxo-cli update --force            # overwrite everything, skip prompts
  npx fluxo-cli remove                    # interactive: pick components to uninstall
  npx fluxo-cli remove Card Modal

Force mode (--force):
  • Auto-selects every installed component (for update).
  • Overwrites locally-modified files without asking.
  • Bypasses TS warning, path prompt, and component selection.
  Use with care — local edits will be lost.

For more information, visit: https://fluxo-ui.utilsware.com/

`;
  console.log(help);
}

export function showVersion(): void {
  console.log('fluxo-ui-cli version 1.0.0');
}
