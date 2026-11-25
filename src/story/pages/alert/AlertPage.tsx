import React from 'react';

import alertPropsJson from '../../../components/alert/Alert.props.json';
import { CodeBlock } from '../../CodeBlock';
import { headingStyle, subtleStyle } from '../../demo-styles';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import Actions from './Actions';
import BannerCustom from './BannerCustom';
import BasicUsage from './BasicUsage';
import Dismissible from './Dismissible';
import Variants from './Variants';

const { alertProps } = alertPropsJson;

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Alert types' },
    { id: 'variants', title: 'Variants', description: 'Six styles and sizes' },
    { id: 'actions', title: 'Actions & Details', description: 'Buttons and disclosure' },
    { id: 'dismissible', title: 'Dismissible', description: 'Close and auto-close' },
    { id: 'banner', title: 'Banner & Custom', description: 'Banners, colors, icons' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API' },
];

const sections: { id: string; title: string; content: React.ReactNode }[] = [
    { id: 'basic-usage', title: 'Basic Usage', content: <BasicUsage /> },
    { id: 'variants', title: 'Variants & Sizes', content: <Variants /> },
    { id: 'actions', title: 'Actions & Details', content: <Actions /> },
    { id: 'dismissible', title: 'Dismissible & Auto-close', content: <Dismissible /> },
    { id: 'banner', title: 'Banners & Customization', content: <BannerCustom /> },
];

const AlertPage: React.FC = () => (
    <PageLayout sectionNavItems={sectionNavItems}>
        <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>
                Alert
            </h1>
            <p className="text-base md:text-xl" style={subtleStyle}>
                Contextual messages for feedback, warnings and announcements. Five types, six variants, actions, expandable details, dismiss and
                auto-close with progress, banners, custom colors and accessible live-region roles.
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
            <CodeBlock code={'import { Alert } from \'fluxo-ui\';\nimport type { AlertProps } from \'fluxo-ui\';'} />
        </section>

        <section id="props" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>
                Props
            </h2>
            <PropsTable props={alertProps} />
        </section>
    </PageLayout>
);

export default AlertPage;
