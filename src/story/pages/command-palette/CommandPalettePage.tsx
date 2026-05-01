import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import BasicUsage from './BasicUsage';
import Customization from './Customization';

import _CommandPalette_props_json from './../../../components/command-palette/CommandPalette.props.json';
const { commandPaletteProps } = _CommandPalette_props_json;

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Default ⌘K palette with recents' },
    { id: 'customization', title: 'Customization', description: 'Hotkey, group order, empty state' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: 'Global Hotkey',
        description: '⌘K / Ctrl+K out of the box — fully configurable with the hotkey prop.',
        icon: 'M12 6v6h4.5',
    },
    {
        title: 'Fuzzy Search',
        description: 'Sub-sequence matching with score-based ranking; supply a custom filterFn for full control.',
        icon: 'M3.75 6A2.25 2.25 0 0 1 6 3.75',
    },
    {
        title: 'Recents',
        description: 'Optional localStorage-backed recents bubble up under no-query state.',
        icon: 'M9.53 16.122a3 3 0 0 0-5.78 1.128',
    },
    {
        title: 'Full Keyboard',
        description: 'Arrow / Home / End to navigate, Enter to run, Esc to close, Tab cycles input/list.',
        icon: 'M15 19.128a9.38 9.38 0 0 0 2.625.372',
    },
];

const headingStyle: React.CSSProperties = { color: 'var(--eui-text)' };
const subtleStyle: React.CSSProperties = { color: 'var(--eui-text-muted)' };

const CommandPalettePage: React.FC = () => (
    <PageLayout sectionNavItems={sectionNavItems}>
        <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>
                Command Palette
            </h1>
            <p className="text-base md:text-xl" style={subtleStyle}>
                A modal launcher with fuzzy search across registered commands, opened via a global hotkey.
            </p>
        </div>

        <section id="basic-usage" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Basic Usage</h2>
            <BasicUsage />
        </section>

        <section id="customization" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Customization</h2>
            <Customization />
        </section>

        <section id="import" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Import</h2>
            <CodeBlock code={`import { CommandPalette } from 'fluxo-ui';\nimport type { CommandPaletteProps, CommandPaletteCommand } from 'fluxo-ui';`} />
        </section>

        <section id="props" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Props</h2>
            <PropsTable props={commandPaletteProps} />
        </section>

        <section id="features" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-6" style={headingStyle}>Features</h2>
            <FeatureGrid features={features} />
        </section>
    </PageLayout>
);

export default CommandPalettePage;
