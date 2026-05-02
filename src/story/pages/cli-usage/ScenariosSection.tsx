import React from 'react';
import { CodeBlock } from '../../CodeBlock';

interface Scenario {
    id: string;
    title: string;
    description: string;
    code: string;
}

const scenarios: Scenario[] = [
    {
        id: 'scenario-fresh',
        title: 'Fresh install, custom path',
        description:
            'Bootstrapping a brand-new project with a couple of components into a non-default path. The CLI creates the install root, writes both files, and emits `fluxo-ui.config.json` next to `package.json`.',
        code: `# package.json already exists. No fluxo-ui.config.json yet.
npx fluxo-cli add button text-input --path ./app/ui/components

# Result on disk:
# ./app/ui/components/
#   button/Button.tsx
#   button/Button.scss
#   text-input/TextInput.tsx
#   ...
#   index.ts          (auto-generated)
# ./fluxo-ui.config.json`,
    },
    {
        id: 'scenario-incremental',
        title: 'Add another component later',
        description:
            'You shipped the project a month ago with Button and now need a Modal. The CLI re-uses the existing config, runs the dependency walk for Modal only, and appends the new exports to your existing index.',
        code: `npx fluxo-cli add modal

# index.ts diff:
# + export * from './modal';
# + export * from './hooks/useFocusTrap';`,
    },
    {
        id: 'scenario-refresh',
        title: 'Refresh installed components without losing edits',
        description:
            'Pull the latest source for everything you have installed. Drift is detected per file; locally-modified files are preserved by default and surfaced at the end of the run.',
        code: `npx fluxo-cli update

# Files preserved due to local changes:
#   button/Button.tsx [locally-modified]
#
# Re-run with --force to overwrite locally-edited files.`,
    },
    {
        id: 'scenario-force',
        title: 'Force-update everything (CI / scripted)',
        description:
            'Run from a CI job after pulling the latest source. The force banner prints once, every prompt is bypassed, and any locally-modified file is overwritten and listed in the summary.',
        code: `npx fluxo-cli update --force

# Locally-edited files overwritten (1):
#   button/Button.tsx`,
    },
    {
        id: 'scenario-relocate',
        title: 'Move the install root',
        description:
            'You decided to relocate `./src/components/fluxo-ui` to `./app/ui/components`. Running update with `--path` rewrites the recorded path in the config and reinstalls into the new location. The old directory is left untouched — delete it manually after verifying.',
        code: `npx fluxo-cli update --path ./app/ui/components

# fluxo-ui.config.json now has "path": "./app/ui/components".
# After the move, remove the old folder yourself:
rm -rf ./src/components/fluxo-ui`,
    },
    {
        id: 'scenario-offline',
        title: 'Install from a local clone (no GitHub access)',
        description:
            'Behind a firewall or working from a fork? Point the CLI at a local checkout of FluxoUI. The CLI uses the local provider exclusively and never touches the network.',
        code: `# Linux/macOS
FLUXO_UI_LOCAL_SOURCE=/work/fluxo-ui-fork/src \\
  npx fluxo-cli add button modal

# PowerShell
$env:FLUXO_UI_LOCAL_SOURCE = "C:\\work\\fluxo-ui-fork\\src"
npx fluxo-cli add button modal`,
    },
    {
        id: 'scenario-pinned',
        title: 'Pin to a specific upstream revision',
        description:
            'Lock your install to a tagged release or commit SHA so re-running update reproduces the exact same source.',
        code: `FLUXO_UI_REF=v1.4.0 npx fluxo-cli update --force

# fluxo-ui.config.json records:
# "version": "github:shridhar-tl/fluxo-ui@v1.4.0"`,
    },
    {
        id: 'scenario-uninstall',
        title: 'Remove a previously-installed component',
        description:
            'There is no `remove` command — components are plain files in your repo. Delete the directory, drop the entry from the config, and remove the export line from `index.ts`. (You can also leave the entry in the config; future updates will simply ignore the missing folder if you skip when prompted.)',
        code: `# 1. Delete the component folder
rm -rf ./src/components/fluxo-ui/timeline

# 2. Remove the export line from index.ts
# - export * from './timeline';

# 3. Remove the entry from fluxo-ui.config.json
# (or run \`fluxo-cli update\` and skip the missing-folder prompt)`,
    },
];

const ScenariosSection: React.FC = () => (
    <section className="scroll-mt-8" id="scenarios">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Common scenarios</h2>
        <p className="mb-6 text-gray-600 leading-relaxed">
            End-to-end recipes for the workflows the CLI is built around. Each one is copy-paste ready — no setup required beyond a project
            with a <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-sm">package.json</code>.
        </p>

        <div className="space-y-6">
            {scenarios.map((scenario) => (
                <div key={scenario.id} id={scenario.id} className="scroll-mt-8 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">{scenario.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">{scenario.description}</p>
                    <CodeBlock code={scenario.code} language="bash" />
                </div>
            ))}
        </div>
    </section>
);

export default ScenariosSection;
