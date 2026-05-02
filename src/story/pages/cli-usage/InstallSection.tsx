import React from 'react';
import { CodeBlock } from '../../CodeBlock';

const InstallSection: React.FC = () => (
    <section className="scroll-mt-8" id="install">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Running the CLI</h2>
        <p className="mb-6 text-gray-600 leading-relaxed">
            The CLI ships as the <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-sm">fluxo-cli</code>{' '}
            bin inside the standalone <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-sm">fluxo-cli</code> npm package
            (separate from the <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-sm">fluxo-ui</code> library).
            Run it with <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-sm">npx</code> — no global install,
            no runtime dependency added to your project:
        </p>
        <div className="space-y-4">
            <CodeBlock title="npm" code="npx fluxo-cli add Button TextInput" language="bash" />
            <CodeBlock title="pnpm" code="pnpm dlx fluxo-cli add Button TextInput" language="bash" />
            <CodeBlock title="yarn" code="yarn dlx fluxo-cli add Button TextInput" language="bash" />
        </div>

        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Prerequisites</h3>
            <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--eui-primary)] shrink-0" />
                    <span>
                        Run from your project root (the directory with{' '}
                        <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">package.json</code>).
                    </span>
                </li>
                <li className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--eui-primary)] shrink-0" />
                    <span>
                        TypeScript is required — components are{' '}
                        <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">.tsx</code>.
                    </span>
                </li>
                <li className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--eui-primary)] shrink-0" />
                    <span>
                        <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">react</code>,{' '}
                        <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">react-dom</code>, and{' '}
                        <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">classnames</code> in your dependencies.
                    </span>
                </li>
                <li className="flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--eui-primary)] shrink-0" />
                    <span>
                        A Sass compiler if you keep the default SCSS output. Pass{' '}
                        <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">--css</code> to vendor pre-compiled CSS instead.
                    </span>
                </li>
            </ul>
            <p className="mt-3 text-sm text-gray-600">
                Theme variables, base styles, and per-component styles are vendored into your install root — you do not need to import anything from{' '}
                <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">fluxo-ui</code> at runtime. Import the
                generated <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">styles/index.css</code> from your install
                root once at your app entry to apply the theme tokens.
            </p>
        </div>
    </section>
);

export default InstallSection;
