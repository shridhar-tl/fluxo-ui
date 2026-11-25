import React from 'react';

import chipPropsJson from '../../../components/chip/Chip.props.json';
import { CodeBlock } from '../../CodeBlock';
import { headingStyle, subtleStyle } from '../../demo-styles';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import ActionChips from './ActionChips';
import BasicUsage from './BasicUsage';
import ChoiceChips from './ChoiceChips';
import FilterChips from './FilterChips';
import InputChips from './InputChips';
import Variants from './Variants';

const { chipProps, chipGroupProps } = chipPropsJson;

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Filter chips' },
    { id: 'variants', title: 'Variants', description: 'Variants, sizes, shapes' },
    { id: 'filter', title: 'Multiple Selection', description: 'Limits and styles' },
    { id: 'choice', title: 'Choice Chips', description: 'Single selection' },
    { id: 'input', title: 'Input Chips', description: 'Removable entries' },
    { id: 'action', title: 'Action Chips', description: 'Actions, links, toggles' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API' },
];

const sections: { id: string; title: string; content: React.ReactNode }[] = [
    { id: 'basic-usage', title: 'Basic Usage', content: <BasicUsage /> },
    { id: 'variants', title: 'Variants, Sizes & Shapes', content: <Variants /> },
    { id: 'filter', title: 'Multiple Selection', content: <FilterChips /> },
    { id: 'choice', title: 'Choice Chips', content: <ChoiceChips /> },
    { id: 'input', title: 'Input Chips', content: <InputChips /> },
    { id: 'action', title: 'Action, Link & Toggle Chips', content: <ActionChips /> },
];

const ChipPage: React.FC = () => (
    <PageLayout sectionNavItems={sectionNavItems}>
        <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>
                Chip
            </h1>
            <p className="text-base md:text-xl" style={subtleStyle}>
                Interactive chips for filtering, choosing, entering and acting. Single and multiple selection groups with keyboard navigation,
                selection limits, removable input chips, action and link chips, avatars, icons and four variants.
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
            <CodeBlock code={'import { Chip, ChipGroup } from \'fluxo-ui\';\nimport type { ChipProps, ChipGroupProps, ChipOption } from \'fluxo-ui\';'} />
        </section>

        <section id="props" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>
                Chip Props
            </h2>
            <PropsTable props={chipProps} />
            <h2 className="text-2xl font-semibold mt-8 mb-4" style={headingStyle}>
                ChipGroup Props
            </h2>
            <PropsTable props={chipGroupProps} />
        </section>
    </PageLayout>
);

export default ChipPage;
