import React, { useState } from 'react';

import { AppShell, Button } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { readoutStyle, rowStyle } from '../../demo-styles';
import { BrandMark, DemoAside, DemoContent, DemoHeader, DemoNav, DemoSidebarFooter } from './AppShellDemoParts';

const phoneFrameStyle: React.CSSProperties = {
    width: 380,
    maxWidth: '100%',
    borderRadius: '1.75rem',
    overflow: 'hidden',
    border: '8px solid var(--eui-border)',
    boxShadow: 'var(--eui-shadow)',
};

const code = `const [open, setOpen] = useState(false);

<AppShell
    mobileBreakpoint="lg"
    responsiveMode="container"
    mobileOpen={open}
    onMobileOpenChange={setOpen}
    swipeToClose
    closeOnNavigate
    mobileSidebarWidth="85%"
    aside={<DetailsPanel />}
    hideAsideOnMobile
    openNavigationLabel="Open menu"
    closeNavigationLabel="Close menu"
    header={<><AppShellToggle /><Logo /></>}
    sidebar={({ closeMobile }) => <Nav onSelect={closeMobile} />}
>
    <Page />
</AppShell>`;

const MobileDrawer: React.FC = () => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <ComponentDemo
                title="Mobile Drawer"
                description="In a narrow container the sidebar becomes a modal drawer with focus trap, Escape to close, backdrop click and swipe to close."
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div style={rowStyle}>
                        <Button label={open ? 'Close drawer' : 'Open drawer'} size="sm" variant="primary" onClick={() => setOpen((v) => !v)} />
                    </div>
                    <div style={phoneFrameStyle}>
                        <AppShell
                            fullHeight={false}
                            height={600}
                            mobileBreakpoint="lg"
                            responsiveMode="container"
                            mobileOpen={open}
                            onMobileOpenChange={setOpen}
                            mobileSidebarWidth="85%"
                            aside={<DemoAside />}
                            hideAsideOnMobile
                            openNavigationLabel="Open menu"
                            closeNavigationLabel="Close menu"
                            header={<DemoHeader />}
                            sidebarHeader={
                                <div style={{ padding: '0.75rem' }}>
                                    <BrandMark />
                                </div>
                            }
                            sidebar={({ collapsed, closeMobile }) => <DemoNav collapsed={collapsed} onNavigate={closeMobile} />}
                            sidebarFooter={({ collapsed }) => <DemoSidebarFooter collapsed={collapsed} />}
                            mainPadding={16}
                        >
                            <DemoContent />
                        </AppShell>
                    </div>
                    <div style={readoutStyle} aria-live="polite">
                        Drawer is {open ? 'open' : 'closed'}
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default MobileDrawer;
