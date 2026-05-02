import React from 'react';
import { CodeBlock } from '../../CodeBlock';

const importExample = `// Once at your app entry (e.g. main.tsx / app.tsx / _app.tsx):
import './components/fluxo-ui/styles/index.css';
// (replace ./components/fluxo-ui with your install path)`;

const themesUsage = `# Pick themes interactively (multi-select shown on first add)
npx fluxo-cli add Button

# Specify themes on the command line (comma-separated)
npx fluxo-cli add Button --themes blue,lara

# Add a new theme to an existing install
npx fluxo-cli update --themes purple

# Compile SCSS to plain CSS at install time
npx fluxo-cli add Button --css`;

const layoutExample = `./src/components/fluxo-ui/
  _eui-vars.scss            # shared SCSS variables, mixins, design tokens
  styles/
    index.css               # entry point — import this once in your app
    base-theme.css          # CSS custom properties (always included)
    theme-blue.css          # only the themes you selected
    theme-lara.css
  button/
    Button.tsx
    Button.scss             # @use '../eui-vars' as *;
  modal/
    Modal.tsx
    Modal.scss
  index.ts                  # auto-managed barrel`;

const themeNames = [
    'blue', 'lara', 'green', 'purple', 'orange', 'indigo',
    'rose', 'amber', 'teal', 'emerald', 'fuchsia', 'slate',
];

const StylesAndThemesSection: React.FC = () => (
    <section className="scroll-mt-8" id="styles-themes">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Styles &amp; themes</h2>
        <p className="mb-6 text-gray-600 leading-relaxed">
            Every install vendors a complete styling bundle so your project never depends on the{' '}
            <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-sm">fluxo-ui</code> npm package at runtime. The bundle
            includes the shared SCSS variables, the base theme stylesheet, and only the brand themes you actually selected.
        </p>

        <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3 text-gray-900" id="styles-import">Import the stylesheet once</h3>
            <p className="mb-3 text-sm text-gray-600 leading-relaxed">
                After running <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">fluxo-cli add</code>, import the
                generated <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">styles/index.css</code> from your app entry.
                It pulls in <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">base-theme.css</code> plus every theme
                you opted into.
            </p>
            <CodeBlock code={importExample} language="typescript" />
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                Apply a theme by setting a class on{' '}
                <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">{`<body>`}</code> (or any ancestor):
                {' '}
                <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">theme-blue</code>,{' '}
                <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">theme-lara</code>, etc. Add{' '}
                <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">mode-dark</code> to flip into dark mode.
            </p>
        </div>

        <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3 text-gray-900" id="theme-selection">Pick the themes you actually use</h3>
            <p className="mb-3 text-sm text-gray-600 leading-relaxed">
                The CLI does <strong>not</strong> dump every theme into your project. On the first{' '}
                <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">add</code> you'll see a multi-select prompt to choose
                which themes to vendor (default: <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">blue</code>). Your
                selection is recorded in <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">fluxo-ui.config.json</code>
                {' '}so future runs reuse it. Pass <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">--themes</code> on
                add or update to add more themes later.
            </p>
            <CodeBlock code={themesUsage} language="bash" />
            <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2 text-gray-900">Available themes</h4>
                <div className="flex flex-wrap gap-2">
                    {themeNames.map((name) => (
                        <code
                            key={name}
                            className="px-2 py-1 rounded bg-gray-100 border border-gray-200 text-[var(--eui-primary)] font-mono text-xs"
                        >
                            {name}
                        </code>
                    ))}
                </div>
            </div>
        </div>

        <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3 text-gray-900" id="vendored-layout">What lands in your install root</h3>
            <CodeBlock code={layoutExample} language="bash" />
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold mb-2 text-gray-900">SCSS or plain CSS?</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
                The default vendor is SCSS — component <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">.scss</code>{' '}
                files plus <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">_eui-vars.scss</code>. Your project needs a
                Sass loader (Vite, Next.js, CRA, etc. all handle this with <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">npm i -D sass</code>).
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
                Pass <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">--css</code> to compile every SCSS file to plain CSS at
                install time. The <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">.tsx</code> imports get rewritten
                from <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">'./Foo.scss'</code> to{' '}
                <code className="px-1.5 py-0.5 rounded bg-gray-200 text-[var(--eui-primary)] font-mono text-xs">'./Foo.css'</code> automatically. Useful for projects
                without a Sass toolchain.
            </p>
        </div>
    </section>
);

export default StylesAndThemesSection;
