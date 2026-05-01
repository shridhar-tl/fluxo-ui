import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import BasicUsage from './BasicUsage';
import Layouts from './Layouts';
import Magnification from './Magnification';
import Orientation from './Orientation';

import _Dock_props_json from './../../../components/dock/Dock.props.json';
const { dockProps } = _Dock_props_json;

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Dock with magnification and tooltips' },
    { id: 'layouts', title: 'Layouts × Backgrounds', description: 'Pill, rectangle, floating, attached' },
    { id: 'orientation', title: 'Position & Orientation', description: 'Bottom, top, left, right' },
    { id: 'magnification', title: 'Magnification', description: 'Tune scale and falloff' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: 'Mac-style Magnification',
        description: 'Smooth scale-on-hover with a configurable falloff distance — disable by setting magnification to 1.',
        icon: 'M9.53 16.122',
    },
    {
        title: '4 Positions',
        description: 'Anchor to bottom, top, left, or right. Tooltips and badges adapt automatically.',
        icon: 'M3.75 12h16.5',
    },
    {
        title: 'Auto-Hide',
        description: 'Slide off-screen and reveal on edge hover/focus — great for distraction-free apps.',
        icon: 'M15 19.128a9.38 9.38 0 0 0 2.625.372',
    },
    {
        title: 'Inline or Fixed',
        description: 'mode="fixed" anchors to the viewport; mode="inline" keeps the dock inside its parent.',
        icon: 'M12 6v6h4.5',
    },
];

const headingStyle: React.CSSProperties = { color: 'var(--eui-text)' };
const subtleStyle: React.CSSProperties = { color: 'var(--eui-text-muted)' };

const DockPage: React.FC = () => (
    <PageLayout sectionNavItems={sectionNavItems}>
        <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>
                Dock
            </h1>
            <p className="text-base md:text-xl" style={subtleStyle}>
                A floating bar of icons with optional Mac-style magnification, auto-hide, and configurable visual treatments.
            </p>
        </div>

        <section id="basic-usage" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Basic Usage</h2>
            <BasicUsage />
        </section>

        <section id="layouts" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Layouts × Backgrounds</h2>
            <Layouts />
        </section>

        <section id="orientation" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Position & Orientation</h2>
            <Orientation />
        </section>

        <section id="magnification" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Magnification</h2>
            <Magnification />
        </section>

        <section id="import" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Import</h2>
            <CodeBlock code={`import { Dock } from 'fluxo-ui';\nimport type { DockProps, DockItem, DockEdgePosition, DockLayout, DockBackground, DockMode } from 'fluxo-ui';`} />
        </section>

        <section id="props" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Props</h2>
            <PropsTable props={dockProps} />
        </section>

        <section id="features" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-6" style={headingStyle}>Features</h2>
            <FeatureGrid features={features} />
        </section>
    </PageLayout>
);

export default DockPage;
