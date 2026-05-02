import React from 'react';
import { CodeBlock } from '../../CodeBlock';

const removeUsage = `# Interactive picker — choose components to uninstall
npx fluxo-cli remove

# Remove specific components
npx fluxo-cli remove modal tooltip

# Skip the confirm prompt
npx fluxo-cli remove modal --force`;

const removeBlockedExample = `[fluxo-cli remove]
Reverse-dependency check

Cannot remove the following components — they are still required by other installed components:
  • tooltip
      ↳ used by button (Button)
      ↳ used by autocomplete (Autocomplete)

  To remove these too, include the dependent component(s) in the same \`fluxo-cli remove\` command.

  Proceeding with 1 removable component(s) only.`;

const removeSuccessExample = `[fluxo-cli remove]
Removing components
  - removed src/components/fluxo-ui/modal
  - removed src/components/fluxo-ui/snackbar

Index updates
  - removed export from index.ts: ./modal
  - removed export from index.ts: ./snackbar

Summary
Removed 2 component(s): modal, snackbar
Hooks, utils, and shared modules were left in place — they may still be used by other components or by your own code.`;

const RemoveCommandSection: React.FC = () => (
    <section className="scroll-mt-8" id="remove-command">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">
            <code className="px-2 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono">remove</code> command
        </h2>
        <p className="mb-6 text-gray-600 leading-relaxed">
            Use <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-sm">remove</code> to uninstall components you no longer
            need. The CLI deletes the component folder, removes the entry from{' '}
            <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-sm">fluxo-ui.config.json</code>, and strips the matching
            export line from <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-sm">index.ts</code>.
        </p>

        <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Common invocations</h3>
            <CodeBlock code={removeUsage} language="bash" />
        </div>

        <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Reverse-dependency safety</h3>
            <p className="mb-3 text-sm text-gray-600 leading-relaxed">
                Before deleting anything, the CLI checks every other installed component for a manifest dependency on the targets you asked to remove.
                If <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">tooltip</code> is still required by{' '}
                <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">button</code> and you didn't include{' '}
                <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">button</code> in the same command, removal of
                <code className="ml-1 px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">tooltip</code> is blocked and the dependent
                components are listed so you know exactly why.
            </p>
            <CodeBlock code={removeBlockedExample} language="bash" />
        </div>

        <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-900">Successful removal</h3>
            <CodeBlock code={removeSuccessExample} language="bash" />
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold mb-2 text-gray-900">What is NOT removed</h3>
            <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--eui-primary)] shrink-0" />
                    <span>
                        Hooks, utils, shared modules, icon SVGs, and theme stylesheets are left in place. They may still be used by other components — or by
                        your own code that imports them directly. Delete them yourself if you're sure they're orphans.
                    </span>
                </li>
                <li className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--eui-primary)] shrink-0" />
                    <span>
                        Custom export lines you've added to <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">index.ts</code>{' '}
                        are preserved. Only the matching auto-generated <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">{`export * from './<id>'`}</code> lines are stripped.
                    </span>
                </li>
            </ul>
        </div>
    </section>
);

export default RemoveCommandSection;
