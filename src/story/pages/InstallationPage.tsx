import cn from 'classnames';
import React from 'react';
import { Link } from 'react-router-dom';
import { CodeBlock } from '../CodeBlock';
import PageLayout from '../PageLayout';
import type { SectionNavItem } from '../SectionNav';
import { useStoryTheme } from '../StoryThemeContext';

const themeList: { name: string; importPath: string; className: string }[] = [
    { name: 'Blue (default)', importPath: 'fluxo-ui/themes/blue', className: 'theme-blue' },
    { name: 'Green', importPath: 'fluxo-ui/themes/green', className: 'theme-green' },
    { name: 'Orange', importPath: 'fluxo-ui/themes/orange', className: 'theme-orange' },
    { name: 'Purple', importPath: 'fluxo-ui/themes/purple', className: 'theme-purple' },
    { name: 'Lara', importPath: 'fluxo-ui/themes/lara', className: 'theme-lara' },
    { name: 'Indigo', importPath: 'fluxo-ui/themes/indigo', className: 'theme-indigo' },
    { name: 'Rose', importPath: 'fluxo-ui/themes/rose', className: 'theme-rose' },
    { name: 'Amber', importPath: 'fluxo-ui/themes/amber', className: 'theme-amber' },
    { name: 'Teal', importPath: 'fluxo-ui/themes/teal', className: 'theme-teal' },
    { name: 'Emerald', importPath: 'fluxo-ui/themes/emerald', className: 'theme-emerald' },
    { name: 'Fuchsia', importPath: 'fluxo-ui/themes/fuchsia', className: 'theme-fuchsia' },
    { name: 'Slate', importPath: 'fluxo-ui/themes/slate', className: 'theme-slate' },
];

const sectionNavItems: SectionNavItem[] = [
    { id: 'prerequisites', title: 'Prerequisites', description: 'Requirements before installing' },
    { id: 'npm-install', title: 'NPM Installation', description: 'Install via npm, yarn, or pnpm' },
    { id: 'setup', title: 'Setup', description: 'Import a component and use it' },
    { id: 'theming', title: 'Theming & Dark Mode', description: 'Apply a brand theme and dark mode' },
    { id: 'typescript', title: 'TypeScript Support', description: 'Built-in type definitions' },
    { id: 'ai-mcp', title: 'AI / MCP Integration', description: 'Use with Claude Code, Copilot, Cursor' },
    { id: 'next-steps', title: 'Next Steps', description: 'Explore components and theming' },
    { id: 'troubleshooting', title: 'Troubleshooting', description: 'Common issues and fixes' },
];

const InstallationPage: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Installation
                </h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Get started with Fluxo UI in your React project
                </p>
            </div>

            <section className="scroll-mt-8" id="prerequisites">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Prerequisites</h2>
                <div
                    className={cn('rounded-lg p-6 border', {
                        'bg-white/4 border-white/8': isDark,
                        'bg-white border-gray-200 shadow-sm': !isDark,
                    })}
                >
                    <p className={cn('mb-4', { 'text-gray-300': isDark, 'text-gray-600': !isDark })}>
                        Before installing Fluxo UI, make sure you have the following:
                    </p>
                    <ul className="space-y-2">
                        {['React 16.8+ or React 17+', 'TypeScript 4.0+ (recommended)'].map((item) => (
                            <li key={item} className={cn('flex items-center', { 'text-gray-300': isDark, 'text-gray-600': !isDark })}>
                                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 shrink-0"></span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <section className="scroll-mt-8" id="npm-install">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    NPM Installation
                </h2>
                <p className={cn('mb-6', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Install Fluxo UI using your preferred package manager. View the package on{' '}
                    <a
                        href="https://www.npmjs.com/package/fluxo-ui"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--eui-primary)] hover:underline"
                    >
                        npm
                    </a>
                    .
                </p>
                <div className="space-y-4">
                    <CodeBlock title="npm" code="npm install fluxo-ui" language="bash" />
                    <CodeBlock title="yarn" code="yarn add fluxo-ui" language="bash" />
                    <CodeBlock title="pnpm" code="pnpm add fluxo-ui" language="bash" />
                </div>
            </section>

            <section className="scroll-mt-8" id="setup">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Setup</h2>

                <div className="mb-8">
                    <h3 className={cn('text-lg font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                        Styles are automatic
                    </h3>
                    <p className={cn('mb-4', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                        There is no required global stylesheet import. Importing any component applies that component's CSS along with
                        the base design tokens and dark-mode support, and your bundler includes only the CSS for the components you
                        actually import. To use a brand theme other than the default blue, see the Theming section below.
                    </p>
                </div>

                <div className="mb-8">
                    <h3 className={cn('text-lg font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                        Start using components
                    </h3>
                    <p className={cn('mb-4', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                        Import and use components in your React application:
                    </p>
                    <CodeBlock
                        code={`import React, { useState } from 'react';
import { Button, TextInput, Checkbox } from 'fluxo-ui';

function MyForm() {
  const [name, setName] = useState('');
  const [agreed, setAgreed] = useState(false);

  return (
    <div>
      <TextInput
        label="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
      />

      <Checkbox
        checked={agreed}
        onChange={(e) => setAgreed(e.target.checked)}
        label="I agree to the terms and conditions"
      />

      <Button
        variant="primary"
        disabled={!name || !agreed}
        onClick={() => console.log('Submit')}
      >
        Submit
      </Button>
    </div>
  );
}

export default MyForm;`}
                        language="typescript"
                    />
                </div>
            </section>

            <section className="scroll-mt-8" id="theming">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Theming &amp; Dark Mode
                </h2>
                <p className={cn('mb-6', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Components render in the default blue palette out of the box. To switch to another brand theme, import that
                    theme's CSS once at your app entry, then add the matching class to the <code>body</code> element. Each theme is a
                    separate import, so only the theme you actually use is bundled.
                </p>
                <CodeBlock
                    code={`import 'fluxo-ui/themes/purple';

document.body.classList.add('theme-purple');`}
                    language="typescript"
                />

                <h3 className={cn('text-lg font-semibold mt-8 mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Available themes
                </h3>
                <div
                    className={cn('rounded-lg border overflow-hidden', {
                        'bg-white/4 border-white/8': isDark,
                        'bg-white border-gray-200 shadow-sm': !isDark,
                    })}
                >
                    <table className="w-full text-sm">
                        <thead>
                            <tr className={cn('text-left', { 'text-gray-300': isDark, 'text-gray-600': !isDark })}>
                                <th className="px-4 py-3 font-semibold">Theme</th>
                                <th className="px-4 py-3 font-semibold">Import</th>
                                <th className="px-4 py-3 font-semibold">Body class</th>
                            </tr>
                        </thead>
                        <tbody>
                            {themeList.map((t) => (
                                <tr key={t.className} className={cn('border-t', { 'border-white/8': isDark, 'border-gray-100': !isDark })}>
                                    <td className={cn('px-4 py-3', { 'text-gray-200': isDark, 'text-gray-800': !isDark })}>{t.name}</td>
                                    <td className="px-4 py-3">
                                        <code className="text-(--eui-primary)">{t.importPath}</code>
                                    </td>
                                    <td className={cn('px-4 py-3', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                                        <code>{t.className}</code>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <h3 className={cn('text-lg font-semibold mt-8 mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Dark mode
                </h3>
                <p className={cn('mb-4', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Add the <code>mode-dark</code> class to the <code>body</code> element. It works with or without a brand theme — no
                    extra import is needed because dark-mode tokens ship with every component.
                </p>
                <CodeBlock code={`document.body.classList.add('theme-purple', 'mode-dark');`} language="typescript" />

                <h3 className={cn('text-lg font-semibold mt-8 mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Loading every theme (theme switcher)
                </h3>
                <p className={cn('mb-4', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    If you let users switch themes at runtime, import the all-themes bundle once instead of an individual theme:
                </p>
                <CodeBlock code={`import 'fluxo-ui/styles';`} language="typescript" />
            </section>

            <section className="scroll-mt-8" id="typescript">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    TypeScript Support
                </h2>
                <div
                    className={cn('rounded-lg p-6 border', {
                        'bg-white/4 border-white/8': isDark,
                        'bg-white border-gray-200 shadow-sm': !isDark,
                    })}
                >
                    <p className={cn('mb-4', { 'text-gray-300': isDark, 'text-gray-600': !isDark })}>
                        Fluxo UI is built with TypeScript and provides complete type definitions out of the box. No additional @types
                        packages are needed.
                    </p>
                    <CodeBlock
                        code={`// All components are fully typed
import { Button, ButtonProps } from 'fluxo-ui';

// Props are strongly typed with IntelliSense support
const MyButton: React.FC<ButtonProps> = (props) => {
  return <Button {...props} />;
};`}
                        language="typescript"
                    />
                </div>
            </section>

            <section className="scroll-mt-8" id="ai-mcp">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    AI / MCP Integration
                </h2>
                <div
                    className={cn('rounded-lg p-6 border relative overflow-hidden', {
                        'bg-white/4 border-white/8': isDark,
                        'bg-white border-gray-200 shadow-sm': !isDark,
                    })}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full text-xs font-semibold bg-[var(--eui-primary)]/15 text-[var(--eui-primary)]">
                        Built-in
                    </div>
                    <p className={cn('mb-4', { 'text-gray-300': isDark, 'text-gray-600': !isDark })}>
                        Fluxo UI ships with an MCP server bundled inside the package — so Claude Code, GitHub Copilot, Cursor, and any
                        other AI assistant can write correct Fluxo UI code on the first try. No extra install, no separate package.
                    </p>
                    <p className={cn('mb-4 text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                        Enable it in Claude Code with one command:
                    </p>
                    <CodeBlock code="claude mcp add fluxo-ui -- npx fluxo-ui-mcp" language="bash" />
                    <div className="mt-4">
                        <Link to="/mcp-integration" className="text-sm font-medium text-[var(--eui-primary)] hover:underline">
                            Full guide for Claude Code, Copilot, Cursor &amp; more →
                        </Link>
                    </div>
                </div>
            </section>

            <section className="scroll-mt-8" id="next-steps">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Next Steps</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div
                        className={cn('p-6 rounded-lg border', {
                            'bg-white/4 border-white/8': isDark,
                            'bg-white border-gray-200 shadow-sm': !isDark,
                        })}
                    >
                        <h3 className={cn('text-lg font-semibold mb-3', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                            Explore Components
                        </h3>
                        <p className={cn('mb-4', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                            Browse through all available components and their documentation.
                        </p>
                        <Link to="/components/button" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                            View Components →
                        </Link>
                    </div>

                    <div
                        className={cn('p-6 rounded-lg border', {
                            'bg-white/4 border-white/8': isDark,
                            'bg-white border-gray-200 shadow-sm': !isDark,
                        })}
                    >
                        <h3 className={cn('text-lg font-semibold mb-3', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                            Customization
                        </h3>
                        <p className={cn('mb-4', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                            Learn how to customize themes and styling to match your brand.
                        </p>
                        <Link to="/" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                            Theming Guide →
                        </Link>
                    </div>
                </div>
            </section>

            <section className="scroll-mt-8" id="troubleshooting">
                <h2 className={cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Troubleshooting
                </h2>
                <div className="space-y-6">
                    <div
                        className={cn('p-6 rounded-lg border', {
                            'bg-white/4 border-white/8': isDark,
                            'bg-white border-gray-200 shadow-sm': !isDark,
                        })}
                    >
                        <h3 className={cn('text-lg font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                            Styles not loading?
                        </h3>
                        <p className={cn('mb-3', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                            Component styles are injected automatically when you import a component, so confirm your bundler is
                            configured to handle the CSS imports that ship inside the package (the default for Vite, Next.js, and
                            Create React App). If only the brand colors look wrong, you likely added a <code>theme-*</code> class to
                            the <code>body</code> without importing that theme — import it once at your entry point:
                        </p>
                        <CodeBlock code="import 'fluxo-ui/themes/purple';" language="typescript" />
                    </div>

                    <div
                        className={cn('p-6 rounded-lg border', {
                            'bg-white/4 border-white/8': isDark,
                            'bg-white border-gray-200 shadow-sm': !isDark,
                        })}
                    >
                        <h3 className={cn('text-lg font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                            TypeScript errors?
                        </h3>
                        <p className={cn('mb-3', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                            Ensure your TypeScript version is 4.0+ and your tsconfig.json includes:
                        </p>
                        <CodeBlock
                            code={`{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "jsx": "react-jsx"
  }
}`}
                            language="json"
                        />
                    </div>
                </div>
            </section>
        </PageLayout>
    );
};

export default InstallationPage;
