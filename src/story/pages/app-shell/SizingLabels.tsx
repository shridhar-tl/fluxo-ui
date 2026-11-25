import React, { useState } from 'react';

import { AppShell, InputSwitch, Slider } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { readoutStyle, rowLabelStyle, rowStyle } from '../../demo-styles';
import { shellClassNames, shellFrameStyle, shellHeight } from './app-shell-story-data';
import { DemoContent, DemoHeader, DemoNav, DemoSidebarFooter } from './AppShellDemoParts';

const sliderGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
    width: '100%',
};

const sliderFieldStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.5rem' };

const pixelFormat = (value: number) => `${value}px`;

const toNumber = (value: number | [number, number]) => (Array.isArray(value) ? value[0] : value);

const SizingLabels: React.FC = () => {
    const [sidebarWidth, setSidebarWidth] = useState(240);
    const [collapsedWidth, setCollapsedWidth] = useState(72);
    const [headerHeight, setHeaderHeight] = useState(60);
    const [stickyHeader, setStickyHeader] = useState(true);
    const [showCollapseButton, setShowCollapseButton] = useState(true);
    const [styled, setStyled] = useState(true);

    const code = `<AppShell
    sidebarWidth={${sidebarWidth}}
    collapsedWidth={${collapsedWidth}}
    headerHeight={${headerHeight}}
    stickyHeader={${stickyHeader}}
    showCollapseButton={${showCollapseButton}}
    mainId="dashboard-main"
    skipLinkLabel="Skip to dashboard"
    sidebarLabel="Workspace navigation"
    collapseLabel="Shrink menu"
    expandLabel="Grow menu"
    classNames={{ header: 'shadow-md!', sidebar: 'bg-[color-mix(in_srgb,var(--eui-primary)_6%,var(--eui-bg))]!' }}
    header={<><AppShellToggle hideOnDesktop /><Logo /></>}
    sidebar={({ collapsed }) => <Nav collapsed={collapsed} />}
>
    <Page />
</AppShell>`;

    return (
        <>
            <ComponentDemo
                title="Sizing, Sticky Header, Labels & Class Hooks"
                description="Tune every dimension, keep the header pinned while the page scrolls, localise the accessible labels, and target each region with your own classes."
                centered={false}
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={sliderGridStyle}>
                        <div style={sliderFieldStyle}>
                            <span style={rowLabelStyle}>Sidebar width</span>
                            <Slider
                                ariaLabel="Sidebar width"
                                valueFormat={pixelFormat}
                                value={sidebarWidth}
                                min={200}
                                max={320}
                                step={10}
                                showValue
                                onChange={(value) => setSidebarWidth(toNumber(value))}
                            />
                        </div>
                        <div style={sliderFieldStyle}>
                            <span style={rowLabelStyle}>Collapsed width</span>
                            <Slider
                                ariaLabel="Collapsed width"
                                valueFormat={pixelFormat}
                                value={collapsedWidth}
                                min={56}
                                max={96}
                                step={4}
                                showValue
                                onChange={(value) => setCollapsedWidth(toNumber(value))}
                            />
                        </div>
                        <div style={sliderFieldStyle}>
                            <span style={rowLabelStyle}>Header height</span>
                            <Slider
                                ariaLabel="Header height"
                                valueFormat={pixelFormat}
                                value={headerHeight}
                                min={48}
                                max={80}
                                step={4}
                                showValue
                                onChange={(value) => setHeaderHeight(toNumber(value))}
                            />
                        </div>
                    </div>
                    <div style={{ ...rowStyle, gap: '1.25rem' }}>
                        <InputSwitch label="Sticky header" checked={stickyHeader} onChange={(event) => setStickyHeader(Boolean(event.value))} />
                        <InputSwitch
                            label="Collapse button"
                            checked={showCollapseButton}
                            onChange={(event) => setShowCollapseButton(Boolean(event.value))}
                        />
                        <InputSwitch label="Custom region classes" checked={styled} onChange={(event) => setStyled(Boolean(event.value))} />
                    </div>
                    <div style={shellFrameStyle}>
                        <AppShell
                            fullHeight={false}
                            height={shellHeight}
                            sidebarWidth={sidebarWidth}
                            collapsedWidth={collapsedWidth}
                            headerHeight={headerHeight}
                            stickyHeader={stickyHeader}
                            showCollapseButton={showCollapseButton}
                            mainId="app-shell-sizing-main"
                            skipLinkLabel="Skip to dashboard"
                            sidebarLabel="Workspace navigation"
                            collapseLabel="Shrink menu"
                            expandLabel="Grow menu"
                            classNames={styled ? shellClassNames : undefined}
                            header={<DemoHeader showBrand toggleMode="mobile" hideToggleOnDesktop />}
                            sidebar={({ collapsed, closeMobile }) => <DemoNav collapsed={collapsed} onNavigate={closeMobile} />}
                            sidebarFooter={({ collapsed }) => <DemoSidebarFooter collapsed={collapsed} />}
                        >
                            <DemoContent title="Scroll this page" />
                        </AppShell>
                    </div>
                    <div style={readoutStyle}>
                        Press Tab inside the frame to reveal the skip link. The header toggle only shows on mobile because it uses hideOnDesktop.
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default SizingLabels;
