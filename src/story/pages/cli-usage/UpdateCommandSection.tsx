import React from 'react';
import { CodeBlock } from '../../CodeBlock';

const updateUsage = `# Refresh every installed component (interactive picker pre-selects them)
npx fluxo-cli update

# Refresh only the listed ids
npx fluxo-cli update button modal

# Refresh everything and overwrite locally-edited files without asking
npx fluxo-cli update --force

# Move the install root and refresh in place
npx fluxo-cli update --path ./app/ui/components`;

const updateDriftExample = `[fluxo-cli update]
  Project root : /work/my-app
  Install path : ./src/components/fluxo-ui

Drift summary:
  button         : 1 modified, 0 missing, 0 added  [locally modified]
  modal          : unchanged
  tooltip        : 0 modified, 1 missing, 0 added

Resolving dependencies...
Writing 14 file(s) to ./src/components/fluxo-ui/
  + tooltip/Tooltip.tsx (added missing)
  ~ modal/Modal.tsx (unchanged)
  - button/Button.tsx (skipped, locally modified)

Files preserved due to local changes:
  button/Button.tsx [locally-modified]

Re-run with --force to overwrite locally-edited files.`;

const UpdateCommandSection: React.FC = () => (
    <section className="scroll-mt-8" id="update-command">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            <code className="px-2 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono">update</code> command
        </h2>
        <p className="mb-6 text-gray-600 leading-relaxed">
            Use <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-sm">update</code> to refresh already-installed
            components from the source (default branch by default). Drift is computed per-file via SHA-256 checksums recorded in{' '}
            <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-sm">fluxo-ui.config.json</code>, so the CLI knows which
            files you have edited locally and which still match the original source.
        </p>

        <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Common invocations</h3>
            <CodeBlock code={updateUsage} language="bash" />
        </div>

        <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Sample output with drift</h3>
            <p className="mb-3 text-sm text-gray-600">
                When some files have been edited locally, the default behavior is to skip them and surface the list at the end of the run
                so you can review what was preserved:
            </p>
            <CodeBlock code={updateDriftExample} language="bash" />
        </div>
    </section>
);

export default UpdateCommandSection;
