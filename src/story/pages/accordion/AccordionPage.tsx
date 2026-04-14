import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import BasicUsage from './BasicUsage';
import Modes from './Modes';
import Variants from './Variants';

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Simple single-expand accordion' },
    { id: 'variants', title: 'Variants', description: 'Five visual styles' },
    { id: 'modes', title: 'Modes & Chevron', description: 'Single vs multi, chevron placement' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API' },
];

const accordionProps = {
    items: { type: 'AccordionItemDef[]', description: 'Array of { id, title, content, icon?, disabled? }.' },
    mode: { type: "'single' | 'multi'", default: "'single'", description: 'Whether multiple panels can be open at once.' },
    variant: { type: "'default' | 'bordered' | 'filled' | 'minimal' | 'separated'", default: "'default'", description: 'Visual style.' },
    chevronPosition: { type: "'left' | 'right'", default: "'right'", description: 'Where the expand chevron appears in the header.' },
    defaultOpen: { type: 'string[]', description: 'Initial open item ids (uncontrolled).' },
    value: { type: 'string[]', description: 'Controlled open item ids.' },
    onChange: { type: '(openIds: string[]) => void', description: 'Called when the set of open items changes.' },
};

const headingStyle: React.CSSProperties = { color: 'var(--eui-text)' };
const subtleStyle: React.CSSProperties = { color: 'var(--eui-text-muted)' };

const AccordionPage: React.FC = () => (
    <PageLayout sectionNavItems={sectionNavItems}>
        <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>
                Accordion
            </h1>
            <p className="text-base md:text-xl" style={subtleStyle}>
                Multi-item collapsible panel group with single or multi expand modes, five visual variants, and full keyboard navigation.
            </p>
        </div>

        <section id="basic-usage" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Basic Usage</h2>
            <BasicUsage />
        </section>

        <section id="variants" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Variants</h2>
            <Variants />
        </section>

        <section id="modes" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Modes & Chevron Position</h2>
            <Modes />
        </section>

        <section id="import" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Import</h2>
            <CodeBlock code={`import { Accordion } from 'fluxo-ui';\nimport type { AccordionProps, AccordionItemDef } from 'fluxo-ui';`} />
        </section>

        <section id="props" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Props</h2>
            <PropsTable props={accordionProps} />
        </section>
    </PageLayout>
);

export default AccordionPage;
