import React, { useState } from 'react';

import { AppShell, SelectButton } from '../../../components';
import type { AppShellLayout, AppShellSidebarPosition, AppShellSidebarVariant } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { rowStyle } from '../../demo-styles';
import { layoutItems, positionItems, shellFrameStyle, shellHeight, variantItems } from './app-shell-story-data';
import { BrandMark, DemoContent, DemoHeader, DemoNav, DemoSidebarFooter } from './AppShellDemoParts';

const LayoutVariants: React.FC = () => {
    const [layout, setLayout] = useState<AppShellLayout>('sidebar-first');
    const [variant, setVariant] = useState<AppShellSidebarVariant>('floating');
    const [position, setPosition] = useState<AppShellSidebarPosition>('left');

    const code = `<AppShell
    layout="${layout}"
    sidebarVariant="${variant}"
    sidebarPosition="${position}"
    header={<Header />}
    sidebar={({ collapsed }) => <Nav collapsed={collapsed} />}
>
    <Page />
</AppShell>`;

    return (
        <>
            <ComponentDemo
                title="Layouts, Variants & Position"
                description="Let the header span the full width or sit beside the sidebar, float or inset the sidebar, and place it on either side."
                centered={false}
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={rowStyle}>
                        <SelectButton items={layoutItems} value={layout} onChange={(event) => setLayout(event.value as AppShellLayout)} ariaLabel="Layout" />
                        <SelectButton
                            items={variantItems}
                            value={variant}
                            onChange={(event) => setVariant(event.value as AppShellSidebarVariant)}
                            ariaLabel="Sidebar variant"
                        />
                        <SelectButton
                            items={positionItems}
                            value={position}
                            onChange={(event) => setPosition(event.value as AppShellSidebarPosition)}
                            ariaLabel="Sidebar position"
                        />
                    </div>
                    <div style={shellFrameStyle}>
                        <AppShell
                            fullHeight={false}
                            height={shellHeight}
                            layout={layout}
                            sidebarVariant={variant}
                            sidebarPosition={position}
                            header={<DemoHeader showBrand={layout === 'header-first'} />}
                            sidebarHeader={
                                layout === 'sidebar-first' ? (
                                    <div style={{ padding: '0.75rem' }}>
                                        <BrandMark />
                                    </div>
                                ) : undefined
                            }
                            sidebar={({ collapsed, closeMobile }) => <DemoNav collapsed={collapsed} onNavigate={closeMobile} />}
                            sidebarFooter={({ collapsed }) => <DemoSidebarFooter collapsed={collapsed} />}
                        >
                            <DemoContent />
                        </AppShell>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default LayoutVariants;
