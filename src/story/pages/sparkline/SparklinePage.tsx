import React from 'react';

import sparklinePropsJson from '../../../components/sparkline/Sparkline.props.json';
import { CodeBlock } from '../../CodeBlock';
import { headingStyle, subtleStyle } from '../../demo-styles';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import Annotations from './Annotations';
import BasicUsage from './BasicUsage';
import Interactive from './Interactive';
import KpiCards from './KpiCards';
import Styling from './Styling';
import TableCells from './TableCells';
import TypesGallery from './TypesGallery';

const { sparklineProps } = sparklinePropsJson;

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Inline trends' },
    { id: 'types', title: 'Chart Types', description: 'Seven chart types' },
    { id: 'kpi-cards', title: 'KPI Cards', description: 'Stat cards' },
    { id: 'table-cells', title: 'Table Cells', description: 'Trends in tables' },
    { id: 'annotations', title: 'Annotations', description: 'Markers, lines, bands' },
    { id: 'interactive', title: 'Interactive', description: 'Tooltips and events' },
    { id: 'styling', title: 'Styling', description: 'Curves, fills, colors' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API' },
];

const sections: { id: string; title: string; content: React.ReactNode }[] = [
    { id: 'basic-usage', title: 'Basic Usage', content: <BasicUsage /> },
    { id: 'types', title: 'Chart Types', content: <TypesGallery /> },
    { id: 'kpi-cards', title: 'KPI Stat Cards', content: <KpiCards /> },
    { id: 'table-cells', title: 'Table Cells', content: <TableCells /> },
    { id: 'annotations', title: 'Markers, Reference Lines & Bands', content: <Annotations /> },
    { id: 'interactive', title: 'Tooltips, Events & Keyboard', content: <Interactive /> },
    { id: 'styling', title: 'Curves, Fills, Colors & Gaps', content: <Styling /> },
];

const SparklinePage: React.FC = () => (
    <PageLayout sectionNavItems={sectionNavItems}>
        <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>
                Sparkline
            </h1>
            <p className="text-base md:text-xl" style={subtleStyle}>
                Mini inline trend charts for KPI cards, table cells and running text. Line, area, bar, win/loss, discrete, bullet and pie types
                with markers, reference lines, bands, trend colors, tooltips and full keyboard and screen reader support. No chart library required.
            </p>
        </div>

        {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-8">
                <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>
                    {section.title}
                </h2>
                {section.content}
            </section>
        ))}

        <section id="import" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>
                Import
            </h2>
            <CodeBlock code={'import { Sparkline } from \'fluxo-ui\';\nimport type { SparklineProps, SparklinePointInfo } from \'fluxo-ui\';'} />
        </section>

        <section id="props" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>
                Props
            </h2>
            <PropsTable props={sparklineProps} />
        </section>
    </PageLayout>
);

export default SparklinePage;
