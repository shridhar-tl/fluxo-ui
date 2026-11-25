import React, { useState } from 'react';

import { AppShell, InputSwitch } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { rowStyle } from '../../demo-styles';
import { shellFrameStyle, shellHeight } from './app-shell-story-data';
import { DemoAside, DemoContent, DemoHeader, DemoNav } from './AppShellDemoParts';

const footerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem',
    padding: '0.75rem 1rem',
    color: 'var(--eui-text-muted)',
    fontSize: '0.75rem',
    flexWrap: 'wrap',
};

const code = `<AppShell
    header={<Header />}
    sidebar={({ collapsed }) => <Nav collapsed={collapsed} />}
    aside={<DetailsPanel />}
    asideWidth={260}
    asideOpen={showAside}
    footer={<Footer />}
    contentMaxWidth={960}
    defaultCollapsed
>
    <Page />
</AppShell>`;

const AsideFooter: React.FC = () => {
    const [showAside, setShowAside] = useState(true);
    const [showFooter, setShowFooter] = useState(true);

    return (
        <>
            <ComponentDemo
                title="Aside Panel, Footer & Content Width"
                description="Add a secondary panel on the far side and a footer under the content. The aside hides automatically on mobile."
                centered={false}
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ ...rowStyle, gap: '1.25rem' }}>
                        <InputSwitch label="Aside panel" checked={showAside} onChange={(event) => setShowAside(Boolean(event.value))} />
                        <InputSwitch label="Footer" checked={showFooter} onChange={(event) => setShowFooter(Boolean(event.value))} />
                    </div>
                    <div style={shellFrameStyle}>
                        <AppShell
                            fullHeight={false}
                            height={shellHeight}
                            defaultCollapsed
                            header={<DemoHeader />}
                            sidebar={({ collapsed, closeMobile }) => <DemoNav collapsed={collapsed} onNavigate={closeMobile} />}
                            aside={<DemoAside />}
                            asideWidth={240}
                            asideOpen={showAside}
                            footer={
                                showFooter ? (
                                    <div style={footerStyle}>
                                        <span>© 2026 Acme Cloud</span>
                                        <span>All systems operational</span>
                                    </div>
                                ) : undefined
                            }
                            contentMaxWidth={960}
                        >
                            <DemoContent title="Project overview" />
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

export default AsideFooter;
