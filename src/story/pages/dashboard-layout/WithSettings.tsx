import React, { useMemo } from 'react';
import { DashboardLayout } from '../../../components/dashboard-layout';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { buildDemoWidgets, demoDefaultLayouts } from './dashboard-story-data';

const code = `const widgets: DashboardWidget[] = [
  {
    id: 'sales',
    title: 'Sales',
    renderSettings: ({ closeSettings }) => (
      <>
        <label><input type="checkbox" /> Compare to prev period</label>
        <button onClick={closeSettings}>Save</button>
      </>
    ),
    onRefresh: async () => {
      await fetch('/api/sales').then(/*...*/);
    },
    children: <Sales />,
  },
];`;

const WithSettings: React.FC = () => {
    const widgets = useMemo(() => buildDemoWidgets({ withSettings: true }), []);

    return (
        <ComponentDemo
            title="Per-widget Refresh & Settings"
            description="Hand each widget an onRefresh handler to enable the refresh icon (the icon spins while the promise resolves) and a renderSettings function to expose a settings popover."
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
                        toolbarTitle="With Settings"
                        rowHeight={48}
                    />
                </div>
                <CodeBlock code={code} />
            </div>
        </ComponentDemo>
    );
};

export default WithSettings;
