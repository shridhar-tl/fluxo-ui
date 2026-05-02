import React from 'react';
import { CodeBlock } from '../../CodeBlock';

interface FlagRow {
    flag: string;
    aliases?: string;
    description: string;
    example: string;
}

interface EnvRow {
    name: string;
    description: string;
}

const flagRows: FlagRow[] = [
    {
        flag: '--path <dir>',
        aliases: '-p',
        description:
            'Install root. On `add`, this is where components land (default `./src/components/fluxo-ui`). On `update`, supplying `--path` rewrites the recorded path in `fluxo-ui.config.json`. Absolute paths inside the project root collapse to a relative form.',
        example: 'npx fluxo-cli add button --path ./app/ui/components',
    },
    {
        flag: '--force',
        aliases: '-f',
        description:
            'Skip every prompt. Auto-selects every installed component for `update` when no argv ids are given. Overwrites locally-modified files without asking. Bypasses the TSX warning, path prompt, component selection, and per-component / per-file conflict prompts. A one-time warning banner is printed at the start.',
        example: 'npx fluxo-cli update --force',
    },
    {
        flag: '--css',
        description:
            'Pre-compile every vendored .scss file (component styles plus the shared theme stylesheets) to plain .css at install time. Imports inside the generated .tsx files are rewritten from `./Foo.scss` to `./Foo.css` automatically. Use this in projects that do not have a Sass toolchain.',
        example: 'npx fluxo-cli add button --css',
    },
    {
        flag: '--no-export',
        description:
            'Skip rewriting the install-root index.ts entirely. Useful when you maintain a hand-curated barrel file and do not want the CLI to append re-exports.',
        example: 'npx fluxo-cli add button --no-export',
    },
    {
        flag: '--no-export-hooks',
        description:
            'Suppress hook re-exports from the install-root index.ts. Components and utils still get exported.',
        example: 'npx fluxo-cli add button --no-export-hooks',
    },
    {
        flag: '--no-export-utils',
        description:
            'Suppress util re-exports from the install-root index.ts. Components and hooks still get exported.',
        example: 'npx fluxo-cli add button --no-export-utils',
    },
    {
        flag: '--help',
        aliases: '-h',
        description:
            'Print full usage including interactive flow notes, force-mode semantics, per-file resolver choices, and Ctrl+C abort. Available on the root command and after the subcommand.',
        example: 'npx fluxo-cli --help',
    },
];

const envRows: EnvRow[] = [
    {
        name: 'FLUXO_UI_LOCAL_SOURCE',
        description:
            'Absolute path to a local clone of the FluxoUI `src/` directory. When set, the CLI reads from disk instead of GitHub. Useful for offline installs, internal forks, or running from a feature branch.',
    },
    {
        name: 'FLUXO_UI_REF',
        description:
            'Branch, tag, or commit SHA to fetch from when using the GitHub source provider (defaults to the package’s repo default branch). Set this when you need a reproducible install pinned to a specific revision.',
    },
    {
        name: 'GITHUB_TOKEN',
        description:
            'Optional. Sent as the bearer token on raw-content requests so unauthenticated users hit higher GitHub API rate limits. Useful when running in CI.',
    },
    {
        name: 'HTTPS_PROXY / NODE_EXTRA_CA_CERTS',
        description:
            'Standard Node networking knobs. Configure these when running behind a corporate proxy or with a self-signed certificate authority.',
    },
];

const FlagRowCard: React.FC<FlagRow> = ({ flag, aliases, description, example }) => (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-baseline gap-2 mb-2">
            <code className="px-2 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-sm font-semibold">{flag}</code>
            {aliases && (
                <code className="px-1.5 py-0.5 rounded bg-gray-200 text-gray-700 font-mono text-xs">alias: {aliases}</code>
            )}
        </div>
        <p className="text-sm text-gray-600 mb-3 leading-relaxed">{description}</p>
        <CodeBlock code={example} language="bash" />
    </div>
);

const FlagsSection: React.FC = () => (
    <section className="scroll-mt-8" id="flags">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Flags &amp; environment</h2>
        <p className="mb-6 text-gray-600 leading-relaxed">
            All flags work on both <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-sm">add</code> and{' '}
            <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-sm">update</code>. Argv positional values are component ids
            (kebab-case slug or display name).
        </p>
        <div className="space-y-4 mb-10">
            {flagRows.map((row) => (
                <FlagRowCard key={row.flag} {...row} />
            ))}
        </div>

        <h3 className="text-lg font-semibold mb-3 text-gray-900" id="env-vars">Environment variables</h3>
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
                <caption className="sr-only">Environment variables recognised by the FluxoUI CLI</caption>
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-700 w-64">
                            Variable
                        </th>
                        <th scope="col" className="text-left px-4 py-3 font-semibold text-gray-700">
                            Purpose
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {envRows.map((row, idx) => (
                        <tr key={row.name} className={idx > 0 ? 'border-t border-gray-200' : undefined}>
                            <td className="align-top px-4 py-3 font-mono text-xs text-[var(--eui-primary)] whitespace-nowrap">{row.name}</td>
                            <td className="px-4 py-3 text-gray-600 leading-relaxed">{row.description}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </section>
);

export default FlagsSection;
