import React from 'react';
import PageLayout from '../../PageLayout';
import type { SectionNavItem } from '../../SectionNav';
import AddCommandSection from './AddCommandSection';
import ConfigurationSection from './ConfigurationSection';
import ConflictsSection from './ConflictsSection';
import ErrorHandlingSection from './ErrorHandlingSection';
import FaqSection from './FaqSection';
import FlagsSection from './FlagsSection';
import InstallSection from './InstallSection';
import InteractiveFlowSection from './InteractiveFlowSection';
import OverviewSection from './OverviewSection';
import RemoveCommandSection from './RemoveCommandSection';
import ScenariosSection from './ScenariosSection';
import StylesAndThemesSection from './StylesAndThemesSection';
import UpdateCommandSection from './UpdateCommandSection';

const sectionNavItems: SectionNavItem[] = [
    { id: 'overview', title: 'Overview', description: 'Why use fluxo-cli' },
    { id: 'install', title: 'Running the CLI', description: 'npx, prerequisites, first run' },
    { id: 'add-command', title: 'add command', description: 'Install components' },
    { id: 'update-command', title: 'update command', description: 'Refresh installed components' },
    { id: 'remove-command', title: 'remove command', description: 'Uninstall components safely' },
    { id: 'styles-themes', title: 'Styles & themes', description: 'Vendored CSS, theme picker' },
    { id: 'interactive-flow', title: 'Interactive flow', description: 'Prompts, walkthroughs, Ctrl+C' },
    { id: 'flags', title: 'Flags & environment', description: '--path, --force, --css, --themes' },
    { id: 'configuration', title: 'Configuration', description: 'fluxo-ui.config.json & index.ts' },
    { id: 'conflicts', title: 'Conflict resolution', description: 'Per-file kinds & batch decisions' },
    { id: 'scenarios', title: 'Common scenarios', description: 'Copy-paste recipes' },
    { id: 'errors', title: 'Error messages', description: 'Typed errors & remediation' },
    { id: 'faq', title: 'FAQ', description: 'Quick answers' },
];

const CliUsagePage: React.FC = () => (
    <PageLayout sectionNavItems={sectionNavItems}>
        <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full text-xs font-semibold bg-[var(--eui-primary)]/15 text-[var(--eui-primary)]">
                fluxo-cli · Cherry-Pick Components
            </div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4 text-gray-900">CLI Usage</h1>
            <p className="text-base md:text-xl text-gray-500 leading-relaxed">
                <code className="font-mono">fluxo-cli</code> is a standalone npm package that vendors individual FluxoUI components into your project as plain
                source files — install fresh, refresh on demand, remove cleanly, never compromise your local edits. Your project never depends on the{' '}
                <code className="font-mono">fluxo-ui</code> library at runtime.
            </p>
        </div>

        <OverviewSection />
        <InstallSection />
        <AddCommandSection />
        <UpdateCommandSection />
        <RemoveCommandSection />
        <StylesAndThemesSection />
        <InteractiveFlowSection />
        <FlagsSection />
        <ConfigurationSection />
        <ConflictsSection />
        <ScenariosSection />
        <ErrorHandlingSection />
        <FaqSection />
    </PageLayout>
);

export default CliUsagePage;
