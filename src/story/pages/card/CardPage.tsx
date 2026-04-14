import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import BasicUsage from './BasicUsage';
import Variants from './Variants';
import WithCover from './WithCover';

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Title, subtitle, actions, footer' },
    { id: 'variants', title: 'Variants', description: 'Elevated, outlined, filled, ghost, interactive' },
    { id: 'cover', title: 'Cover & Orientation', description: 'Media slot and horizontal layout' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API' },
];

const cardProps = {
    variant: { type: "'elevated' | 'outlined' | 'filled' | 'ghost' | 'interactive'", default: "'outlined'", description: 'Visual style.' },
    padding: { type: "'none' | 'sm' | 'md' | 'lg'", default: "'md'", description: 'Body padding preset.' },
    orientation: { type: "'vertical' | 'horizontal'", default: "'vertical'", description: 'Layout direction (horizontal puts cover on the left).' },
    size: { type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Overall size preset.' },
    title: { type: 'ReactNode', description: 'Header title.' },
    subtitle: { type: 'ReactNode', description: 'Header subtitle.' },
    actions: { type: 'ReactNode', description: 'Header right-side actions (usually buttons).' },
    cover: { type: 'ReactNode', description: 'Top (or left) media slot.' },
    footer: { type: 'ReactNode', description: 'Footer area.' },
    loading: { type: 'boolean', default: 'false', description: 'Show shimmer overlay.' },
    as: { type: "'div' | 'a' | 'button'", description: 'Render as a different element.' },
    href: { type: 'string', description: 'When set, card renders as a link.' },
    onClick: { type: '(e) => void', description: 'Click handler (makes the card interactive).' },
};

const headingStyle: React.CSSProperties = { color: 'var(--eui-text)' };
const subtleStyle: React.CSSProperties = { color: 'var(--eui-text-muted)' };

const CardPage: React.FC = () => (
    <PageLayout sectionNavItems={sectionNavItems}>
        <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>
                Card
            </h1>
            <p className="text-base md:text-xl" style={subtleStyle}>
                Versatile content container with header, body, footer, and optional cover — in five visual variants and both vertical and horizontal orientations.
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

        <section id="cover" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Cover & Orientation</h2>
            <WithCover />
        </section>

        <section id="import" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Import</h2>
            <CodeBlock code={`import { Card } from 'fluxo-ui';\nimport type { CardProps, CardVariant } from 'fluxo-ui';`} />
        </section>

        <section id="props" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Props</h2>
            <PropsTable props={cardProps} />
        </section>
    </PageLayout>
);

export default CardPage;
