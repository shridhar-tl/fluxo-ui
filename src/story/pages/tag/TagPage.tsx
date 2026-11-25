import React from 'react';

import tagPropsJson from '../../../components/tag/Tag.props.json';
import { CodeBlock } from '../../CodeBlock';
import { headingStyle, subtleStyle } from '../../demo-styles';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import BasicUsage from './BasicUsage';
import Clickable from './Clickable';
import Closable from './Closable';
import CustomColors from './CustomColors';
import IconsAvatars from './IconsAvatars';
import SizesShapes from './SizesShapes';
import TagGroupDemo from './TagGroupDemo';
import Variants from './Variants';

const { tagProps, tagGroupProps } = tagPropsJson;

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Semantic colors' },
    { id: 'variants', title: 'Variants', description: 'Seven visual styles' },
    { id: 'sizes-shapes', title: 'Sizes & Shapes', description: 'Sizes, shapes and styling' },
    { id: 'icons-avatars', title: 'Icons & Avatars', description: 'Icons, avatars and counts' },
    { id: 'closable', title: 'Closable', description: 'Removable tags' },
    { id: 'clickable', title: 'Clickable', description: 'Buttons, links, selection' },
    { id: 'custom-colors', title: 'Custom Colors', description: 'Any color and gradients' },
    { id: 'tag-group', title: 'Tag Group', description: 'Overflow and shared defaults' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API' },
];

const sections: { id: string; title: string; content: React.ReactNode }[] = [
    { id: 'basic-usage', title: 'Basic Usage', content: <BasicUsage /> },
    { id: 'variants', title: 'Variants', content: <Variants /> },
    { id: 'sizes-shapes', title: 'Sizes & Shapes', content: <SizesShapes /> },
    { id: 'icons-avatars', title: 'Icons, Avatars & Counts', content: <IconsAvatars /> },
    { id: 'closable', title: 'Closable', content: <Closable /> },
    { id: 'clickable', title: 'Clickable, Links & Selection', content: <Clickable /> },
    { id: 'custom-colors', title: 'Custom Colors & Gradients', content: <CustomColors /> },
    { id: 'tag-group', title: 'Tag Group', content: <TagGroupDemo /> },
];

const TagPage: React.FC = () => (
    <PageLayout sectionNavItems={sectionNavItems}>
        <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>
                Tag
            </h1>
            <p className="text-base md:text-xl" style={subtleStyle}>
                Compact labels for categorising, filtering and annotating content. Seven variants, semantic and custom colors, icons, avatars,
                counts, removable and clickable tags, and groups that collapse overflow.
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
            <CodeBlock code={'import { Tag, TagGroup } from \'fluxo-ui\';\nimport type { TagProps, TagGroupProps } from \'fluxo-ui\';'} />
        </section>

        <section id="props" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>
                Tag Props
            </h2>
            <PropsTable props={tagProps} />
            <h2 className="text-2xl font-semibold mt-8 mb-4" style={headingStyle}>
                TagGroup Props
            </h2>
            <PropsTable props={tagGroupProps} />
        </section>
    </PageLayout>
);

export default TagPage;
