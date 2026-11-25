import React from 'react';

import { AppShell } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { shellFrameStyle, shellHeight } from './app-shell-story-data';
import { BrandMark, DemoContent, DemoHeader, DemoNav, DemoSidebarFooter } from './AppShellDemoParts';

const code = `import { AppShell, AppShellToggle, MenuNav } from 'fluxo-ui';

<AppShell
    header={<><AppShellToggle /><Logo /><Search /></>}
    sidebarHeader={<Logo />}
    sidebar={({ collapsed, closeMobile }) => (
        <MenuNav items={items} collapsed={collapsed} onSelect={closeMobile} mobileBreakpoint={0} />
    )}
    sidebarFooter={({ collapsed }) => <UserCard compact={collapsed} />}
>
    <Dashboard />
</AppShell>`;

const BasicUsage: React.FC = () => (
    <>
        <ComponentDemo
            title="Application Shell"
            description="Header, collapsible sidebar and main content. Resize the window: below the breakpoint the sidebar becomes a drawer."
            centered={false}
        >
            <div style={shellFrameStyle}>
                <AppShell
                    fullHeight={false}
                    height={shellHeight}
                    header={<DemoHeader showBrand={false} />}
                    sidebarHeader={
                        <div style={{ padding: '0.75rem' }}>
                            <BrandMark />
                        </div>
                    }
                    sidebar={({ collapsed, closeMobile }) => <DemoNav collapsed={collapsed} onNavigate={closeMobile} />}
                    sidebarFooter={({ collapsed }) => <DemoSidebarFooter collapsed={collapsed} />}
                >
                    <DemoContent />
                </AppShell>
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default BasicUsage;
