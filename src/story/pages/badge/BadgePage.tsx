import React from 'react';

import badgePropsJson from '../../../components/badge/Badge.props.json';
import { CodeBlock } from '../../CodeBlock';
import { headingStyle, subtleStyle } from '../../demo-styles';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import BasicUsage from './BasicUsage';
import Counts from './Counts';
import DotStatus from './DotStatus';
import Placement from './Placement';
import Standalone from './Standalone';
import VariantsColors from './VariantsColors';

const { badgeProps } = badgePropsJson;

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Anchored badges' },
    { id: 'counts', title: 'Counts', description: 'Max, zero and animation' },
    { id: 'placement', title: 'Placement', description: 'Corners, overlap, offset' },
    { id: 'dot-status', title: 'Dot & Status', description: 'Presence and status' },
    { id: 'variants', title: 'Variants', description: 'Variants, colors, icons' },
    { id: 'standalone', title: 'Standalone', description: 'Inline badges' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API' },
];

const sections: { id: string; title: string; content: React.ReactNode }[] = [
    { id: 'basic-usage', title: 'Basic Usage', content: <BasicUsage /> },
    { id: 'counts', title: 'Counts, Max & Animation', content: <Counts /> },
    { id: 'placement', title: 'Placement, Overlap & Offset', content: <Placement /> },
    { id: 'dot-status', title: 'Dots & Status', content: <DotStatus /> },
    { id: 'variants', title: 'Variants, Colors & Icons', content: <VariantsColors /> },
    { id: 'standalone', title: 'Standalone & Inline', content: <Standalone /> },
];

const BadgePage: React.FC = () => (
    <PageLayout sectionNavItems={sectionNavItems}>
        <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>
                Badge
            </h1>
            <p className="text-base md:text-xl" style={subtleStyle}>
                Counters, dots and status indicators that attach to any element or sit inline. Overflow caps, four placements, circular overlap,
                offsets, pulse and change animations, icons and accessible labels.
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
            <CodeBlock code={'import { Badge } from \'fluxo-ui\';\nimport type { BadgeProps } from \'fluxo-ui\';'} />
        </section>

        <section id="props" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>
                Props
            </h2>
            <PropsTable props={badgeProps} />
        </section>
    </PageLayout>
);

export default BadgePage;
