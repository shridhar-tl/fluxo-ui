import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import BasicUsage from './BasicUsage';
import Fills from './Fills';
import Shapes from './Shapes';
import Spacing from './Spacing';
import SizesVariants from './SizesVariants';

import _WeekDaySelector_props_json from './../../../components/week-day-selector/WeekDaySelector.props.json';
const { weekDayProps } = _WeekDaySelector_props_json;
const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Single and multiple selection' },
    { id: 'fills', title: 'Fill Styles', description: 'Solid, outlined, subtle' },
    { id: 'shapes', title: 'Shapes', description: 'Rounded, squared, circle' },
    { id: 'spacing', title: 'Spacing', description: 'Spaced and joined layouts' },
    { id: 'sizes-variants', title: 'Sizes & Variants', description: 'Size and color options' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API' },
];


const headingStyle: React.CSSProperties = { color: 'var(--eui-text)' };
const subtleStyle: React.CSSProperties = { color: 'var(--eui-text-muted)' };

const WeekDaySelectorPage: React.FC = () => (
    <PageLayout sectionNavItems={sectionNavItems}>
        <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>
                Week Day Selector
            </h1>
            <p className="text-base md:text-xl" style={subtleStyle}>
                Compact weekday picker with single or multi-day selection, multiple shapes, joined or spaced layouts, and full keyboard support.
            </p>
        </div>

        <section id="basic-usage" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Basic Usage</h2>
            <BasicUsage />
        </section>

        <section id="fills" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Fill Styles</h2>
            <Fills />
        </section>

        <section id="shapes" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Shapes</h2>
            <Shapes />
        </section>

        <section id="spacing" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Spacing</h2>
            <Spacing />
        </section>

        <section id="sizes-variants" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Sizes & Variants</h2>
            <SizesVariants />
        </section>

        <section id="import" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Import</h2>
            <CodeBlock code={`import { WeekDaySelector } from 'fluxo-ui';\nimport type { WeekDaySelectorProps } from 'fluxo-ui';`} />
        </section>

        <section id="props" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>Props</h2>
            <PropsTable props={weekDayProps} />
        </section>
    </PageLayout>
);

export default WeekDaySelectorPage;
