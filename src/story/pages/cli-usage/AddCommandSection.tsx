import React from 'react';
import { CodeBlock } from '../../CodeBlock';

const addUsage = `# Add components by id (kebab-case or display name)
npx fluxo-cli add button text-input

# Add into a custom path
npx fluxo-cli add button --path ./app/ui/components

# Pre-compile SCSS to CSS at install time
npx fluxo-cli add button --css

# Skip every prompt and overwrite local edits
npx fluxo-cli add button --force

# Launch interactive picker (no ids on argv)
npx fluxo-cli add`;

const addOutputExample = `[fluxo-cli add]
  Project root: /work/my-app
  Install path: ./src/components/fluxo-ui (created)

Resolving dependencies...
  + button
  + confirm-popover (transitive)
  + tooltip (transitive)
  + link (transitive, internal)

External packages required:
  classnames (present)
  react (peer (assumed available))

Writing 24 file(s) to ./src/components/fluxo-ui/
  + _eui-vars.scss
  + styles/index.css
  + styles/base-theme.css
  + styles/theme-blue.css
  + button/Button.tsx
  + button/Button.scss
  + confirm-popover/ConfirmPopover.tsx
  ...

Updating ./src/components/fluxo-ui/index.ts
  + component: ./button/Button
  + component: ./confirm-popover
  + component: ./tooltip/tooltip-api

Done. Wrote 24 file(s), 0 skipped, 0 conflicts.`;

const AddCommandSection: React.FC = () => (
    <section className="scroll-mt-8" id="add-command">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            <code className="px-2 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono">add</code> command
        </h2>
        <p className="mb-6 text-gray-600 leading-relaxed">
            Use <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-sm">add</code> for first-time installs and to add new
            components later. It walks the dependency closure for everything you select, fetches the source from GitHub (inferred from the package's{' '}
            <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-sm">repository</code> field) or a local clone,
            rewrites every relative import to land cleanly in your install root, vendors the shared theme stylesheets, writes each file atomically,
            and re-exports everything from{' '}
            <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-sm">&lt;install-root&gt;/index.ts</code>.
        </p>

        <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Common invocations</h3>
            <CodeBlock code={addUsage} language="bash" />
        </div>

        <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-900">What you'll see</h3>
            <p className="mb-3 text-sm text-gray-600">
                A typical successful run prints the resolved project root, install path, dependency closure, external package status,
                per-file write log, and the index re-exports it added:
            </p>
            <CodeBlock code={addOutputExample} language="bash" />
        </div>
    </section>
);

export default AddCommandSection;
