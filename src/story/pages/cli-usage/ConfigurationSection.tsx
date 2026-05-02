import React from 'react';
import { CodeBlock } from '../../CodeBlock';

const configExample = `{
  "version": "1.0.0",
  "path": "./src/components/fluxo-ui",
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
}`;

const indexExample = `// Auto-managed by 'fluxo-cli add' / 'fluxo-cli update'
// You can add your own re-exports below — they are preserved.

export * from './button/Button';
export * from './confirm-popover';
export * from './tooltip/tooltip-api';
export * from './hooks/useClickOutside';
export * from './types';

// Your custom additions stay untouched.
export { default as MyCustomBadge } from './my-custom-badge/MyCustomBadge';`;

const ConfigurationSection: React.FC = () => (
    <section className="scroll-mt-8" id="configuration">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Generated configuration</h2>
        <p className="mb-6 text-gray-600 leading-relaxed">
            On the first <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-sm">add</code>, the CLI writes a
            <code className="ml-1 px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-sm">fluxo-ui.config.json</code> at the project root
            (next to <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-sm">package.json</code>) and an{' '}
            <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-sm">index.ts</code> at the install root. Both files are
            kept in sync on every subsequent run.
        </p>

        <h3 className="text-lg font-semibold mb-3 text-gray-900" id="config-file">
            <code className="px-2 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-base">fluxo-ui.config.json</code>
        </h3>
        <p className="mb-3 text-sm text-gray-600">Stable, sorted JSON suitable for git diffs. Commit this file alongside your source.</p>
        <CodeBlock code={configExample} language="json" />

        <ul className="space-y-2 text-sm text-gray-700 mt-4 mb-10">
            <li className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--eui-primary)] shrink-0" />
                <span>
                    <strong className="text-gray-900">path</strong> — install root, relative to the project root. Always written in forward-slash
                    form so the file stays portable across hosts.
                </span>
            </li>
            <li className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--eui-primary)] shrink-0" />
                <span>
                    <strong className="text-gray-900">components.&lt;id&gt;.files[*].checksum</strong> — SHA-256 of the file content with CR/CRLF
                    normalized to LF. <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">update</code> compares this
                    against the on-disk file to detect drift.
                </span>
            </li>
            <li className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--eui-primary)] shrink-0" />
                <span>
                    <strong className="text-gray-900">components.&lt;id&gt;.checksum</strong> — rollup of all per-file checksums. Lets you tell at a glance whether
                    a component matches the source release.
                </span>
            </li>
            <li className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--eui-primary)] shrink-0" />
                <span>
                    <strong className="text-gray-900">version</strong> — provenance string (e.g.{' '}
                    <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">github:owner/repo@branch</code> or{' '}
                    <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">local:&lt;path&gt;</code>).
                </span>
            </li>
            <li className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--eui-primary)] shrink-0" />
                <span>
                    <strong className="text-gray-900">Legacy filename support.</strong> If you previously had{' '}
                    <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">fluxo-ui.json</code>, the CLI keeps using that
                    name on writes — it never silently migrates filenames.
                </span>
            </li>
        </ul>

        <h3 className="text-lg font-semibold mb-3 text-gray-900" id="generated-index">
            Generated <code className="px-2 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-base">index.ts</code>
        </h3>
        <p className="mb-3 text-sm text-gray-600">
            The CLI parses the existing index, dedupes by specifier, and appends only the missing exports. Your own re-exports, comments,
            and side-effect imports are preserved.
        </p>
        <CodeBlock code={indexExample} language="typescript" />

        <p className="mt-4 text-sm text-gray-600 leading-relaxed">
            Hooks and utils that a component depends on are also re-exported by default. Pass{' '}
            <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">--no-export-hooks</code> or{' '}
            <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">--no-export-utils</code> to suppress just those, or{' '}
            <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">--no-export</code> to skip the index file entirely.
            Internal helpers (Link, Icon, editor-core, context) are flagged{' '}
            <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">private</code> and never appear in the index.
        </p>
    </section>
);

export default ConfigurationSection;
