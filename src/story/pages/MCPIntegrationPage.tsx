import cn from 'classnames';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CodeBlock } from '../CodeBlock';
import PageLayout from '../PageLayout';
import type { SectionNavItem } from '../SectionNav';
import { useStoryTheme } from '../StoryThemeContext';
import './mcp-integration-page.scss';

const sectionNavItems: SectionNavItem[] = [
    { id: 'overview', title: 'Overview', description: 'Why it matters' },
    { id: 'demo', title: 'How It Helps You', description: 'See it in action' },
    { id: 'claude-code', title: 'Claude Code', description: 'One-command setup' },
    { id: 'copilot', title: 'GitHub Copilot', description: 'VS Code setup' },
    { id: 'cursor', title: 'Cursor & Others', description: 'Other MCP clients' },
    { id: 'faq', title: 'FAQ', description: 'Quick answers' },
];

const mcpConfigClaudeCmd = 'claude mcp add fluxo-ui -- npx fluxo-ui-mcp';

const mcpConfigVsCode = `{
  "servers": {
    "fluxo-ui": {
      "command": "npx",
      "args": ["fluxo-ui-mcp"]
    }
  }
}`;

const mcpConfigCursor = `{
  "mcpServers": {
    "fluxo-ui": {
      "command": "npx",
      "args": ["fluxo-ui-mcp"]
    }
  }
}`;

const demoWithoutMcp = `// Hallucinated API — looks plausible, but wrong
import { Button } from 'fluxo-ui';

<Button
  type="primary"
  icon="save"
  label="Save"
  onPress={handleSave}
/>`;

const demoWithMcp = `// Real Fluxo UI API — first try, no guessing
import { Button } from 'fluxo-ui';
import { SaveIcon } from 'fluxo-ui/icons';

<Button
  variant="primary"
  icon={<SaveIcon />}
  onClick={handleSave}
>
  Save
</Button>`;

const promptSteps = [
    { actor: 'you', text: 'Add a save button with an icon using Fluxo UI' },
    { actor: 'ai', text: 'Checking Fluxo UI components...' },
    { actor: 'ai', text: 'Found Button with variant and icon props' },
    { actor: 'ai', text: 'Generating code with correct API' },
    { actor: 'done', text: 'Done — ready to paste' },
];

const MCPIntegrationPage: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [step, setStep] = useState(0);

    useEffect(() => {
        const id = setInterval(() => setStep((s) => (s + 1) % (promptSteps.length + 1)), 1400);
        return () => clearInterval(id);
    }, []);

    const cardClass = cn('rounded-lg p-6 border', {
        'bg-white/4 border-white/8': isDark,
        'bg-white border-gray-200 shadow-sm': !isDark,
    });

    const headingClass = cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark });
    const bodyClass = cn('mb-4', { 'text-gray-300': isDark, 'text-gray-600': !isDark });
    const mutedClass = cn('text-sm', { 'text-gray-400': isDark, 'text-gray-500': !isDark });

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full text-xs font-semibold bg-[var(--eui-primary)]/15 text-[var(--eui-primary)]">
                    AI Integration
                </div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Code Fluxo UI with Your AI Assistant
                </h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                    Claude Code, GitHub Copilot, and Cursor can now generate Fluxo UI code that actually works — correct component names,
                    real props, and real examples. No hallucinated APIs. No guessing. Ship features faster.
                </p>
            </div>

            <section className="scroll-mt-8" id="overview">
                <h2 className={headingClass}>Why This Matters</h2>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className={cardClass}>
                        <div className="text-2xl mb-2">⚡</div>
                        <h3 className={cn('text-base font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                            First-try correctness
                        </h3>
                        <p className={mutedClass}>
                            Your AI assistant stops guessing prop names. You stop fixing hallucinated code. Features ship sooner.
                        </p>
                    </div>
                    <div className={cardClass}>
                        <div className="text-2xl mb-2">🎯</div>
                        <h3 className={cn('text-base font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                            Real examples, real props
                        </h3>
                        <p className={mutedClass}>
                            The AI sees the actual components you have installed — never suggestions from a version you don't use.
                        </p>
                    </div>
                    <div className={cardClass}>
                        <div className="text-2xl mb-2">🔌</div>
                        <h3 className={cn('text-base font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                            Nothing extra to install
                        </h3>
                        <p className={mutedClass}>
                            It comes bundled with <code>fluxo-ui</code>. If you have the library, you already have it. One command to
                            enable.
                        </p>
                    </div>
                    <div className={cardClass}>
                        <div className="text-2xl mb-2">🔒</div>
                        <h3 className={cn('text-base font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                            Private and local
                        </h3>
                        <p className={mutedClass}>
                            Runs entirely on your machine. No accounts, no network calls, no telemetry. Your code stays yours.
                        </p>
                    </div>
                </div>
            </section>

            <section className="scroll-mt-8" id="demo">
                <h2 className={headingClass}>See How It Helps</h2>
                <p className={bodyClass}>
                    Same prompt, same assistant — here's the difference when your AI can actually read the Fluxo UI catalog.
                </p>

                <div className={cn('eui-mcp-flow', cardClass)}>
                    <div className="eui-mcp-flow-prompt">
                        <div className={cn('eui-mcp-flow-label', { 'is-dark': isDark })}>Your Prompt</div>
                        <div
                            className={cn('eui-mcp-flow-bubble', {
                                'is-dark': isDark,
                            })}
                        >
                            "Add a save button with an icon using Fluxo UI"
                        </div>
                    </div>

                    <div className="eui-mcp-flow-steps">
                        {promptSteps.map((s, i) => {
                            const active = i <= step;
                            return (
                                <div
                                    key={i}
                                    className={cn('eui-mcp-flow-step', {
                                        'is-active': active,
                                        'is-current': i === step,
                                        'is-done': s.actor === 'done',
                                        'is-dark': isDark,
                                    })}
                                >
                                    <div className="eui-mcp-flow-step-dot" />
                                    <div className="eui-mcp-flow-step-text">{s.text}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-6">
                    <div>
                        <div className={cn('text-xs font-semibold uppercase tracking-wide mb-2 text-red-400')}>
                            Without MCP — looks right, breaks at runtime
                        </div>
                        <CodeBlock code={demoWithoutMcp} language="typescript" />
                    </div>
                    <div>
                        <div className={cn('text-xs font-semibold uppercase tracking-wide mb-2 text-emerald-400')}>
                            With MCP — correct on the first try
                        </div>
                        <CodeBlock code={demoWithMcp} language="typescript" />
                    </div>
                </div>
            </section>

            <section className="scroll-mt-8" id="claude-code">
                <h2 className={headingClass}>Claude Code</h2>
                <p className={bodyClass}>
                    Once you have <code className="text-[var(--eui-primary)]">fluxo-ui</code> installed in your project, enable the
                    integration with a single command:
                </p>
                <CodeBlock title="Enable Fluxo UI MCP" code={mcpConfigClaudeCmd} language="bash" />
                <p className={cn('mt-4', mutedClass)}>
                    That's it. Ask Claude anything about Fluxo UI — "how do I show a toast?", "build me a kanban board", "what themes are
                    available?" — and it will answer with real components and real props.
                </p>
            </section>

            <section className="scroll-mt-8" id="copilot">
                <h2 className={headingClass}>GitHub Copilot (VS Code)</h2>
                <p className={bodyClass}>
                    Create a <code className="text-[var(--eui-primary)]">.vscode/mcp.json</code> file at the root of your workspace with
                    the following contents, then reload the window:
                </p>
                <CodeBlock title=".vscode/mcp.json" code={mcpConfigVsCode} language="json" />
                <p className={cn('mt-4', mutedClass)}>
                    Copilot Chat will automatically pick up the integration and start answering Fluxo UI questions with accurate code.
                </p>
            </section>

            <section className="scroll-mt-8" id="cursor">
                <h2 className={headingClass}>Cursor, Windsurf & Other AI Editors</h2>
                <p className={bodyClass}>
                    Any AI editor that supports MCP works with Fluxo UI. Add this to your Cursor MCP config (or the equivalent file for
                    your editor):
                </p>
                <CodeBlock title="Cursor / Windsurf MCP config" code={mcpConfigCursor} language="json" />
                <p className={cn('mt-4', mutedClass)}>
                    The config file location depends on the editor, but the command stays the same everywhere:{' '}
                    <code>npx fluxo-ui-mcp</code>.
                </p>
            </section>

            <section className="scroll-mt-8" id="faq">
                <h2 className={headingClass}>FAQ</h2>
                <div className="space-y-4">
                    <div className={cardClass}>
                        <h3 className={cn('text-lg font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                            Do I need to install anything extra?
                        </h3>
                        <p className={mutedClass}>
                            No. The integration comes bundled with the <code>fluxo-ui</code> package. If you have Fluxo UI, you already
                            have it.
                        </p>
                    </div>
                    <div className={cardClass}>
                        <h3 className={cn('text-lg font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                            Is any of my code sent to a server?
                        </h3>
                        <p className={mutedClass}>
                            No. Everything runs locally on your machine. There are no accounts, no network calls, and no telemetry.
                        </p>
                    </div>
                    <div className={cardClass}>
                        <h3 className={cn('text-lg font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                            How does it stay up to date?
                        </h3>
                        <p className={mutedClass}>
                            Upgrading the <code>fluxo-ui</code> package upgrades the integration automatically. There's nothing separate to
                            sync.
                        </p>
                    </div>
                    <div className={cardClass}>
                        <h3 className={cn('text-lg font-semibold mb-2', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                            Is it optional?
                        </h3>
                        <p className={mutedClass}>
                            Completely. If you don't enable it in any AI editor, it has zero impact on your project.
                        </p>
                    </div>
                </div>
                <div className="mt-6">
                    <Link to="/installation" className="text-sm font-medium text-[var(--eui-primary)] hover:underline">
                        ← Back to Installation
                    </Link>
                </div>
            </section>
        </PageLayout>
    );
};

export default MCPIntegrationPage;
