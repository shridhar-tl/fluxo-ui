import React from 'react';

const InteractiveFlowSection: React.FC = () => (
    <section className="scroll-mt-8" id="interactive-flow">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Interactive flow</h2>
        <p className="mb-4 text-gray-600 leading-relaxed">
            When you run the CLI from a TTY without arguments, it walks you through component selection, install path, and any conflicts.
            Under CI, piped input, or <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-sm">--force</code>, every prompt
            short-circuits to a sane default so argv-driven usage stays scriptable.
        </p>
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Cancel-safe by design</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
                Press <kbd className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">Ctrl+C</kbd> at any prompt to abort. The
                process exits with code 0, never partially writes (every file write is atomic via temp + rename), so the project is left in a
                consistent state. Re-running picks up exactly where you left off.
            </p>
        </div>
    </section>
);

export default InteractiveFlowSection;
