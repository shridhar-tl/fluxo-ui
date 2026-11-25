import React from 'react';

import appShellPropsJson from '../../../components/app-shell/AppShell.props.json';
import { CodeBlock } from '../../CodeBlock';
import { headingStyle, subtleStyle } from '../../demo-styles';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import type { SectionNavItem } from '../../SectionNav';
import AsideFooter from './AsideFooter';
import BasicUsage from './BasicUsage';
import CollapseResize from './CollapseResize';
import LayoutVariants from './LayoutVariants';
import MobileDrawer from './MobileDrawer';
import SizingLabels from './SizingLabels';

const { appShellProps, appShellToggleProps } = appShellPropsJson;

const sectionNavItems: SectionNavItem[] = [
    { id: 'basic-usage', title: 'Basic Usage', description: 'Header, sidebar, content' },
    { id: 'layouts', title: 'Layouts & Variants', description: 'Arrangement and style' },
    { id: 'collapse', title: 'Collapse & Resize', description: 'Rail, hover, drag' },
    { id: 'mobile', title: 'Mobile Drawer', description: 'Responsive behaviour' },
    { id: 'aside', title: 'Aside & Footer', description: 'Extra regions' },
    { id: 'sizing', title: 'Sizing & Labels', description: 'Dimensions, a11y, classes' },
    { id: 'hook', title: 'useAppShell', description: 'Control from anywhere' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'props', title: 'Props', description: 'Component API' },
];

const sections: { id: string; title: string; content: React.ReactNode }[] = [
    { id: 'basic-usage', title: 'Basic Usage', content: <BasicUsage /> },
    { id: 'layouts', title: 'Layouts, Variants & Position', content: <LayoutVariants /> },
    { id: 'collapse', title: 'Collapse, Hover Expand & Resize', content: <CollapseResize /> },
    { id: 'mobile', title: 'Mobile Drawer', content: <MobileDrawer /> },
    { id: 'aside', title: 'Aside Panel & Footer', content: <AsideFooter /> },
    { id: 'sizing', title: 'Sizing, Sticky Header & Labels', content: <SizingLabels /> },
];

const hookCode = `import { useAppShell } from 'fluxo-ui';

const MenuButton = () => {
    const { toggleSidebar, collapsed, isMobile, mobileOpen } = useAppShell();
    return <Button label={isMobile ? 'Menu' : collapsed ? 'Expand' : 'Collapse'} onClick={toggleSidebar} />;
};`;

const AppShellPage: React.FC = () => (
    <PageLayout sectionNavItems={sectionNavItems}>
        <div>
            <h1 className="text-2xl md:text-4xl font-bold mb-4" style={headingStyle}>
                App Shell
            </h1>
            <p className="text-base md:text-xl" style={subtleStyle}>
                A responsive application frame with header, collapsible and resizable sidebar, mobile drawer, aside panel and footer. Includes a
                skip link, focus management, persisted state and a hook to control the shell from any component.
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

        <section id="hook" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>
                useAppShell
            </h2>
            <p className="mb-4" style={subtleStyle}>
                Any component rendered inside the shell can read its state and open, close or collapse the sidebar.
            </p>
            <CodeBlock code={hookCode} language="tsx" />
        </section>

        <section id="import" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>
                Import
            </h2>
            <CodeBlock code={'import { AppShell, AppShellToggle, useAppShell } from \'fluxo-ui\';\nimport type { AppShellProps, AppShellState } from \'fluxo-ui\';'} />
        </section>

        <section id="props" className="scroll-mt-8">
            <h2 className="text-2xl font-semibold mb-4" style={headingStyle}>
                AppShell Props
            </h2>
            <PropsTable props={appShellProps} />
            <h2 className="text-2xl font-semibold mt-8 mb-4" style={headingStyle}>
                AppShellToggle Props
            </h2>
            <PropsTable props={appShellToggleProps} />
        </section>
    </PageLayout>
);

export default AppShellPage;
