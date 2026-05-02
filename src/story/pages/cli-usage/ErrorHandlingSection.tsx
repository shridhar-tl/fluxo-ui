import React from 'react';
import { CodeBlock } from '../../CodeBlock';

interface ErrorRow {
    name: string;
    when: string;
    sample: string;
    fix: string;
}

const errorRows: ErrorRow[] = [
    {
        name: 'ConfigStateError',
        when: 'Project root, package.json, install root, or fluxo-ui.config.json is missing.',
        sample: `[fluxo-cli update] ConfigStateError: fluxo-ui.config.json was not found.
  Hint: Run \`fluxo-cli add <component>\` first — it creates the config and installs the initial components. \`update\` only refreshes existing installs.`,
        fix:
            'Run `fluxo-cli add` first to bootstrap the config. On `update` errors about a missing install root, re-run with `--path <new-path>` or `--force` to recreate the directory in place.',
    },
    {
        name: 'UnknownComponentError',
        when: 'Every supplied component id is unknown to the manifest.',
        sample: `[fluxo-cli add] UnknownComponentError: No matching components for: my-button, foobar.
  Hint: Run \`fluxo-cli add\` (without ids) to launch the interactive picker.`,
        fix:
            'Re-run without ids to use the interactive picker, or check the component table on the homepage for the exact id (kebab-case slug). Display names also match (e.g. `Button` and `button` both resolve).',
    },
    {
        name: 'SourceAccessError',
        when: 'The source provider (GitHub or local clone) cannot be reached. Probed BEFORE planning so you do not get spammed with per-file failures.',
        sample: `[fluxo-cli add] SourceAccessError: ENOTFOUND raw.githubusercontent.com.
  Hint: Verify your internet connection. If GitHub is unreachable, set FLUXO_UI_LOCAL_SOURCE=<path-to-fluxo-ui-src> to install from a local clone.`,
        fix:
            'Check connectivity, configure HTTPS_PROXY / NODE_EXTRA_CA_CERTS for corporate networks, set GITHUB_TOKEN for higher rate limits on 403, or fall back to FLUXO_UI_LOCAL_SOURCE for fully-offline installs.',
    },
    {
        name: 'PartialInstallError',
        when: 'Zero files were written and the missing/unresolved counts cover the entire plan — the install never made progress.',
        sample: `[fluxo-cli add] PartialInstallError: 0 of 22 files written. 22 missing on source.
  Hint: The source provider could not produce any of the planned files. Re-run with FLUXO_UI_REF=<branch|tag|sha> or check the manifest with \`npm run generate-manifest\`.`,
        fix:
            'Pin to a known-good ref via FLUXO_UI_REF, regenerate the manifest, or fall back to a local clone via FLUXO_UI_LOCAL_SOURCE. Exit code is 2 (distinct from 1 for other errors) so CI can branch on it.',
    },
];

const ErrorHandlingSection: React.FC = () => (
    <section className="scroll-mt-8" id="errors">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Error messages</h2>
        <p className="mb-6 text-gray-600 leading-relaxed">
            Every failure path emits a <em>typed, mode-tagged</em> error with a concrete remediation hint. No raw stack traces, no
            indistinguishable add-vs-update wording. The exit code is always meaningful (<code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">1</code>{' '}
            for most errors, <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">2</code> for partial installs).
        </p>

        <div className="space-y-6">
            {errorRows.map((row) => (
                <div key={row.name} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 flex items-center gap-2">
                        <code className="px-2 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-base font-semibold">{row.name}</code>
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                        <strong className="text-gray-900">When:</strong> {row.when}
                    </p>
                    <CodeBlock code={row.sample} language="bash" />
                    <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                        <strong className="text-gray-900">Fix:</strong> {row.fix}
                    </p>
                </div>
            ))}
        </div>

        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Network classification</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
                The source-provider probe maps Node fetch failures into actionable hints — <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">ETIMEDOUT</code> /{' '}
                <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">ECONNRESET</code> mention proxy/connectivity, TLS
                errors mention <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">NODE_EXTRA_CA_CERTS</code>, HTTP{' '}
                <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">404</code> mentions{' '}
                <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">FLUXO_UI_REF</code>, HTTP{' '}
                <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">403</code> mentions{' '}
                <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">GITHUB_TOKEN</code>, and HTTP{' '}
                <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">5xx</code> links to{' '}
                <a className="text-[var(--eui-primary)] hover:underline" href="https://www.githubstatus.com/" target="_blank" rel="noopener noreferrer">
                    githubstatus.com
                </a>
                . Every hint nudges you toward the right knob without making you parse a stack trace.
            </p>
        </div>
    </section>
);

export default ErrorHandlingSection;
