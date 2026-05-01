import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import type { FeatureItem } from '../../FeatureCard';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import BasicUsage from './BasicUsage';
import Gauge from './Gauge';
import Interactive from './Interactive';
import Sizes from './Sizes';
import Variants from './Variants';

import _Knob_props_json from './../../../components/knob/Knob.props.json';
const { knobProps } = _Knob_props_json;

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Read-only and interactive knobs' },
    { id: 'variants', title: 'Variants', description: 'Solid, gradient, striped, dashed, pie' },
    { id: 'sizes', title: 'Sizes', description: 'Five preset sizes' },
    { id: 'gauge', title: 'Partial Arcs', description: 'Half/3-quarter gauges via arcStart/arcEnd' },
    { id: 'interactive', title: 'Interactive', description: 'Drag and keyboard editing' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

const features: FeatureItem[] = [
    {
        title: '5 Variants',
        description: 'Solid, gradient, striped, dashed, and pie treatments — fully theme aware.',
        icon: 'M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245',
    },
    {
        title: 'Partial Arcs',
        description: 'Build gauges, half-circles or 3/4 rings by configuring arcStart and arcEnd.',
        icon: 'M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5',
    },
    {
        title: 'Interactive',
        description: 'Pointer drag plus full keyboard support: arrows, PageUp/Down, Home/End.',
        icon: 'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493',
    },
    {
        title: 'ARIA Compliant',
        description: 'Slider role with valuenow/min/max/text in interactive mode; img + roledescription read-only.',
        icon: 'M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    },
];

const headingStyle: React.CSSProperties = { color: 'var(--eui-text)' };
const subtleStyle: React.CSSProperties = { color: 'var(--eui-text-muted)' };

const KnobPage: React.FC = () => (
    <PageLayout sectionNavItems={sectionNavItems}>
        <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>
                Knob
            </h1>
            <p className="text-base md:text-xl" style={subtleStyle}>
                A circular indicator that displays a numeric value as an arc, with optional drag editing and full keyboard support.
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

        <section id="sizes" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Sizes</h2>
            <Sizes />
        </section>

        <section id="gauge" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Partial Arcs</h2>
            <Gauge />
        </section>

        <section id="interactive" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Interactive</h2>
            <Interactive />
        </section>

        <section id="import" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Import</h2>
            <CodeBlock code={`import { Knob } from 'fluxo-ui';\nimport type { KnobProps, KnobSize, KnobVariant } from 'fluxo-ui';`} />
        </section>

        <section id="props" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Props</h2>
            <PropsTable props={knobProps} />
        </section>

        <section id="features" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-6" style={headingStyle}>Features</h2>
            <FeatureGrid features={features} />
        </section>
    </PageLayout>
);

export default KnobPage;
