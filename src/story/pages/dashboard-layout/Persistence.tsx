import React, { useMemo } from 'react';
import { DashboardLayout } from '../../../components/dashboard-layout';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { buildDemoWidgets, demoDefaultLayouts } from './dashboard-story-data';

const code = `<DashboardLayout
  widgets={widgets}
  defaultLayouts={defaultLayouts}
  persistKey="my-app-dashboard"
  toolbarTitle="My Dashboard"
/>`;

const Persistence: React.FC = () => {
    const widgets = useMemo(() => buildDemoWidgets(), []);

    return (
        <ComponentDemo
            title="LocalStorage Persistence"
            description="Pass a persistKey and the full DashboardLayoutState (layouts, hidden, collapsed, maximized, preset) is saved automatically. Drag a widget, refresh the page, and watch it come back."
            centered={false}
        >
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div
                    style={{
                        minHeight: 540,
                        background: 'var(--eui-bg)',
                        border: '1px solid var(--eui-border-subtle)',
                        borderRadius: 8,
                        padding: 12,
                    }}
                >
                    <DashboardLayout
                        widgets={widgets}
                        defaultLayouts={demoDefaultLayouts}
                        toolbarTitle="My Dashboard"
                        persistKey="fluxo-dashboard-demo"
                        rowHeight={48}
                    />
                </div>
                <div
                    style={{
                        padding: '10px 14px',
                        background: 'var(--eui-bg-subtle)',
                        border: '1px solid var(--eui-border-subtle)',
                        borderRadius: 6,
                        fontSize: 12,
                        color: 'var(--eui-text-muted)',
                    }}
                >
                    Saved to <code style={{ color: 'var(--eui-text)' }}>localStorage["fluxo-dashboard-demo"]</code>. Use the Reset
                    button in the toolbar to restore defaults.
                </div>
                <CodeBlock code={code} />
            </div>
        </ComponentDemo>
    );
};

export default Persistence;
