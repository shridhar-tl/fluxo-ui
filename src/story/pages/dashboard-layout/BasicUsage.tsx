import React, { useMemo } from 'react';
import { DashboardLayout } from '../../../components/dashboard-layout';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { buildDemoWidgets, demoDefaultLayouts } from './dashboard-story-data';

const code = `import { DashboardLayout } from 'fluxo-ui';
import type { DashboardWidget, DashboardLayouts } from 'fluxo-ui';

const widgets: DashboardWidget[] = [
  { id: 'sales',    title: 'Sales',    icon: LineChartUpIcon, children: <Sales /> },
  { id: 'visitors', title: 'Visitors', icon: UsersIcon,       children: <Visitors /> },
  { id: 'channels', title: 'Channels', icon: PieChartIcon,    children: <Channels /> },
  // ...
];

const defaultLayouts: DashboardLayouts = {
  lg: [
    { id: 'sales',    x: 0, y: 0, w: 4, h: 4 },
    { id: 'visitors', x: 4, y: 0, w: 4, h: 4 },
    { id: 'channels', x: 8, y: 0, w: 4, h: 4 },
    // ...
  ],
};

<DashboardLayout
  widgets={widgets}
  defaultLayouts={defaultLayouts}
  toolbarTitle="Overview"
/>`;

const BasicUsage: React.FC = () => {
    const widgets = useMemo(() => buildDemoWidgets(), []);

    return (
        <ComponentDemo
            title="Basic Dashboard"
            description="Click 'Edit layout' to drag widget headers, resize from the corners, and toggle visibility. Use the maximize / collapse buttons on each widget for focused views."
            centered={false}
        >
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div
                    style={{
                        minHeight: 600,
                        background: 'var(--eui-bg)',
                        border: '1px solid var(--eui-border-subtle)',
                        borderRadius: 8,
                        padding: 12,
                    }}
                >
                    <DashboardLayout
                        widgets={widgets}
                        defaultLayouts={demoDefaultLayouts}
                        toolbarTitle="Overview"
                        rowHeight={48}
                    />
                </div>
                <CodeBlock code={code} />
            </div>
        </ComponentDemo>
    );
};

export default BasicUsage;
