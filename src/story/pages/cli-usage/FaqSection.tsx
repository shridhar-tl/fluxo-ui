import React from 'react';

interface FaqItem {
    question: string;
    answer: React.ReactNode;
}

const faqItems: FaqItem[] = [
    {
        question: 'Do I still need the fluxo-ui npm package?',
        answer: (
            <>
                Only as a transient dependency of <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">npx</code>.
                Once components are vendored into your repo, you can remove <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">fluxo-ui</code>
                {' '}from <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">dependencies</code> entirely. You will still
                need the underlying peers like <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">react</code>,{' '}
                <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">react-dom</code>, and{' '}
                <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">classnames</code>.
            </>
        ),
    },
    {
        question: 'Can I edit the generated files?',
        answer: (
            <>
                Yes — that is the whole point. Your edits are tracked via SHA-256 checksums in{' '}
                <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">fluxo-ui.config.json</code> and preserved on
                future <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">update</code> runs unless you pass{' '}
                <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">--force</code> or explicitly choose{' '}
                <em>Overwrite</em> at the prompt.
            </>
        ),
    },
    {
        question: 'How do I get notified of upstream changes?',
        answer: (
            <>
                Run <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">fluxo-cli update</code> on a schedule (or as a CI
                job). The drift summary tells you which components have new upstream content vs your local edits before any file is touched —
                so the workflow is review, then commit.
            </>
        ),
    },
    {
        question: 'What about styles?',
        answer: (
            <>
                Component SCSS files are vendored alongside the <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">.tsx</code>{' '}
                files and imported directly inside them. The shared <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">_eui-vars.scss</code>{' '}
                module and every theme stylesheet (base + per-color themes) are also vendored — into{' '}
                <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">&lt;install&gt;/_eui-vars.scss</code> and{' '}
                <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">&lt;install&gt;/styles/</code>. Import the
                generated <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">styles/index.css</code> once at your app
                entry. You never need to import anything from the <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">fluxo-ui</code>{' '}
                npm package at runtime.
            </>
        ),
    },
    {
        question: 'My project does not use SCSS — can I get plain CSS?',
        answer: (
            <>
                Yes. Pass <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">--css</code> on{' '}
                <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">add</code> or{' '}
                <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">update</code>. The CLI compiles every
                .scss file to plain .css at install time, rewrites the corresponding{' '}
                <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">import './Foo.scss'</code> in the .tsx files to{' '}
                <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">import './Foo.css'</code>, and skips the SCSS-only
                helpers. Your project only needs a CSS loader, no Sass toolchain.
            </>
        ),
    },
    {
        question: 'How do I add a brand-new component to my install?',
        answer: (
            <>
                Run <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">npx fluxo-cli add &lt;new-component&gt;</code>.
                Existing config is reused, only the new component (and its transitive deps) is fetched and written, and the export line is
                appended to your <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">index.ts</code> automatically.
            </>
        ),
    },
    {
        question: 'Why was my locally-edited file not overwritten when I ran update?',
        answer: (
            <>
                That is the safe default. Locally-modified files are skipped unless you pass{' '}
                <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">--force</code> or explicitly choose{' '}
                <em>Overwrite</em> at the per-file prompt. The skipped files are listed under{' '}
                <em>Files preserved due to local changes</em> at the end of the run with a footer telling you how to override.
            </>
        ),
    },
    {
        question: 'Can I run the CLI without any network access?',
        answer: (
            <>
                Yes — set <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">FLUXO_UI_LOCAL_SOURCE</code> to a local
                clone of FluxoUI (point it at the <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">src/</code>{' '}
                directory). The CLI never falls back to the network when this env var is set, so it is safe in air-gapped environments.
            </>
        ),
    },
    {
        question: 'How do I script this in CI?',
        answer: (
            <>
                Always pass <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">--force</code> in CI: it bypasses every
                prompt, prints a single banner, and exits with a meaningful code. Errors are still surfaced with a hint and a non-zero exit
                so you can fail the pipeline cleanly.
            </>
        ),
    },
];

const FaqSection: React.FC = () => (
    <section className="scroll-mt-8" id="faq">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">FAQ</h2>
        <div className="space-y-4">
            {faqItems.map((item) => (
                <details
                    key={item.question}
                    className="group rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
                >
                    <summary className="font-semibold text-gray-900 flex items-center justify-between gap-3 cursor-pointer marker:hidden list-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--eui-primary)] rounded">
                        <span>{item.question}</span>
                        <span aria-hidden="true" className="text-[var(--eui-primary)] transition-transform group-open:rotate-90 motion-reduce:transition-none">
                            ▶
                        </span>
                    </summary>
                    <div className="mt-3 text-sm text-gray-600 leading-relaxed">{item.answer}</div>
                </details>
            ))}
        </div>
    </section>
);

export default FaqSection;
