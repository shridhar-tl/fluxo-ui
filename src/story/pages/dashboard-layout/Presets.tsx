import React, { useMemo } from 'react';
import { DashboardLayout } from '../../../components/dashboard-layout';
import type { DashboardLayoutPreset } from '../../../components/dashboard-layout';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { buildDemoWidgets, demoDefaultLayouts } from './dashboard-story-data';

const code = `const presets: DashboardLayoutPreset[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'Balanced overview',
    layouts: defaultLayouts,
  },
  {
    id: 'sales-focus',
    name: 'Sales focus',
    description: 'Pin sales + orders, hide others',
    hiddenIds: ['channels', 'team', 'health', 'calendar'],
    layouts: {
      lg: [
        { id: 'sales',    x: 0, y: 0, w: 6, h: 6 },
        { id: 'orders',   x: 6, y: 0, w: 6, h: 6 },
        { id: 'visitors', x: 0, y: 6, w: 12, h: 5 },
      ],
    },
  },
];

<DashboardLayout widgets={widgets} presets={presets} ... />`;

const presets: DashboardLayoutPreset[] = [
    {
        id: 'default',
        name: 'Default',
        description: 'Balanced overview',
        layouts: demoDefaultLayouts,
    },
    {
        id: 'sales-focus',
        name: 'Sales focus',
        description: 'Pin sales + orders, hide other widgets',
        hiddenIds: ['channels', 'team', 'health', 'calendar'],
        layouts: {
            lg: [
                { id: 'sales', x: 0, y: 0, w: 6, h: 6 },
                { id: 'orders', x: 6, y: 0, w: 6, h: 6 },
                { id: 'visitors', x: 0, y: 6, w: 12, h: 5 },
            ],
        },
    },
    {
        id: 'ops',
        name: 'Operations',
        description: 'Team, health, calendar',
        hiddenIds: ['sales', 'orders', 'channels'],
        layouts: {
            lg: [
                { id: 'team', x: 0, y: 0, w: 4, h: 6 },
                { id: 'health', x: 4, y: 0, w: 4, h: 6 },
                { id: 'calendar', x: 8, y: 0, w: 4, h: 6 },
                { id: 'visitors', x: 0, y: 6, w: 12, h: 5 },
            ],
        },
    },
];

const Presets: React.FC = () => {
    const widgets = useMemo(() => buildDemoWidgets(), []);

    return (
        <ComponentDemo
            title="Layout Presets"
            description="Define named layouts (e.g. 'Sales focus', 'Operations'). Users pick from the Presets menu. Each preset can override visibility AND positions."
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
                        toolbarTitle="Presets"
                        presets={presets}
                        rowHeight={48}
                    />
                </div>
                <CodeBlock code={code} />
            </div>
        </ComponentDemo>
    );
};

export default Presets;
