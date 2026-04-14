import cn from 'classnames';
import React from 'react';
import { Link } from 'react-router-dom';
import { CodeBlock } from '../CodeBlock';
import PageLayout from '../PageLayout';
import type { SectionNavItem } from '../SectionNav';
import { useStoryTheme } from '../StoryThemeContext';

const sectionNavItems: SectionNavItem[] = [
    { id: 'prerequisites', title: 'Prerequisites', description: 'Requirements before installing' },
    { id: 'npm-install', title: 'NPM Installation', description: 'Install via npm, yarn, or pnpm' },
    { id: 'setup', title: 'Setup', description: 'CSS, ThemeProvider, and first usage' },
    { id: 'typescript', title: 'TypeScript Support', description: 'Built-in type definitions' },
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
                    Install Fluxo UI using your preferred package manager:
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
                        1. Import CSS Styles
                    </h3>
                    <p className={cn('mb-4', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                        Import the component styles in your main CSS file or at the root of your application:
                    </p>
                    <CodeBlock
                        code={`// In your main CSS file (e.g., index.css or App.css)
@import 'fluxo-ui/dist/index.css';

// Or import directly in your component
import 'fluxo-ui/dist/index.css';`}
                        language="css"
                    />
                </div>

                <div className="mb-8">
                    <h3 className={cn('text-lg font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                        2. Wrap with ThemeProvider
                    </h3>
                    <p className={cn('mb-4', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                        Wrap your application with the ThemeProvider to ensure consistent theming:
                    </p>
                    <CodeBlock
                        code={`import React from 'react';
import { ThemeProvider } from 'fluxo-ui';
import App from './App';

function Root() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}

export default Root;`}
                        language="typescript"
                    />
                </div>

                <div className="mb-8">
                    <h3 className={cn('text-lg font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                        3. Start Using Components
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
                            Make sure you've imported the CSS file and that your bundler is configured to handle CSS imports.
                        </p>
                        <CodeBlock code="import 'fluxo-ui/dist/index.css';" language="typescript" />
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
