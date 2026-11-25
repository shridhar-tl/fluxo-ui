import React, { useState } from 'react';

import { AppShell, Button, InputSwitch } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { readoutStyle, rowStyle } from '../../demo-styles';
import { shellFrameStyle, shellHeight } from './app-shell-story-data';
import { BrandMark, DemoContent, DemoHeader, DemoNav, DemoSidebarFooter } from './AppShellDemoParts';

const code = `const [collapsed, setCollapsed] = useState(false);

<AppShell
    collapsed={collapsed}
    onCollapsedChange={setCollapsed}
    expandOnHover
    resizable
    minSidebarWidth={200}
    maxSidebarWidth={380}
    onSidebarWidthChange={setWidth}
    storageKey="my-app-shell"
    sidebar={({ collapsed }) => <Nav collapsed={collapsed} />}
>
    <Page />
</AppShell>`;

const CollapseResize: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [expandOnHover, setExpandOnHover] = useState(true);
    const [resizable, setResizable] = useState(true);
    const [width, setWidth] = useState(260);

    return (
        <>
            <ComponentDemo
                title="Collapse, Hover Expand & Resize"
                description="Collapse to an icon rail, peek on hover, and drag or use arrow keys on the edge handle to resize. State can persist with storageKey."
                centered={false}
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ ...rowStyle, gap: '1.25rem' }}>
                        <Button label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} size="sm" layout="outlined" onClick={() => setCollapsed((v) => !v)} />
                        <InputSwitch label="Expand on hover" checked={expandOnHover} onChange={(event) => setExpandOnHover(Boolean(event.value))} />
                        <InputSwitch label="Resizable" checked={resizable} onChange={(event) => setResizable(Boolean(event.value))} />
                    </div>
                    <div style={shellFrameStyle}>
                        <AppShell
                            fullHeight={false}
                            height={shellHeight}
                            layout="sidebar-first"
                            collapsed={collapsed}
                            onCollapsedChange={setCollapsed}
                            expandOnHover={expandOnHover}
                            resizable={resizable}
                            minSidebarWidth={200}
                            maxSidebarWidth={380}
                            onSidebarWidthChange={setWidth}
                            header={<DemoHeader showBrand={false} toggleMode="collapse" />}
                            sidebarHeader={
                                <div style={{ padding: '0.75rem' }}>
                                    <BrandMark />
                                </div>
                            }
                            sidebar={({ collapsed: isCollapsed, closeMobile }) => <DemoNav collapsed={isCollapsed} onNavigate={closeMobile} />}
                            sidebarFooter={({ collapsed: isCollapsed }) => <DemoSidebarFooter collapsed={isCollapsed} />}
                        >
                            <DemoContent />
                        </AppShell>
                    </div>
                    <div style={readoutStyle} aria-live="polite">
                        Sidebar {collapsed ? 'collapsed' : 'expanded'} · width {width}px
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default CollapseResize;
