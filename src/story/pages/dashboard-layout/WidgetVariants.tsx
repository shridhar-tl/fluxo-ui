import React, { useMemo } from 'react';
import { DashboardLayout } from '../../../components/dashboard-layout';
import type { DashboardLayouts, DashboardWidget } from '../../../components/dashboard-layout';
import { BarChartIcon, LineChartUpIcon, PieChartIcon, UsersIcon } from '../../../assets/icons';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `const widgets: DashboardWidget[] = [
  { id: 'a', title: 'Card chrome',       chrome: 'card',       children: <Demo /> },
  { id: 'b', title: 'Borderless chrome', chrome: 'borderless', children: <Demo /> },
  { id: 'c', title: 'Sunken chrome',     chrome: 'sunken',     children: <Demo /> },
  { id: 'd', title: 'Plain chrome',      chrome: 'plain',      children: <Demo /> },
  { id: 'e', title: 'With badge',  badge: <span>NEW</span>, children: <Demo /> },
  { id: 'f', title: 'With error',  error: 'Service unavailable', children: <Demo /> },
];`;

const SampleBody: React.FC<{ label: string }> = ({ label }) => (
    <div
        style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--eui-text-muted)',
            fontSize: 13,
        }}
    >
        {label}
    </div>
);

const layouts: DashboardLayouts = {
    lg: [
        { id: 'a', x: 0, y: 0, w: 4, h: 3 },
        { id: 'b', x: 4, y: 0, w: 4, h: 3 },
        { id: 'c', x: 8, y: 0, w: 4, h: 3 },
        { id: 'd', x: 0, y: 3, w: 4, h: 3 },
        { id: 'e', x: 4, y: 3, w: 4, h: 3 },
        { id: 'f', x: 8, y: 3, w: 4, h: 3 },
    ],
};

const WidgetVariants: React.FC = () => {
    const widgets = useMemo<DashboardWidget[]>(
        () => [
            { id: 'a', title: 'Card chrome', icon: LineChartUpIcon, chrome: 'card', children: <SampleBody label="card" /> },
            { id: 'b', title: 'Borderless', icon: UsersIcon, chrome: 'borderless', children: <SampleBody label="borderless" /> },
            { id: 'c', title: 'Sunken', icon: PieChartIcon, chrome: 'sunken', children: <SampleBody label="sunken" /> },
            { id: 'd', title: 'Plain', icon: BarChartIcon, chrome: 'plain', children: <SampleBody label="plain (no chrome)" /> },
            {
                id: 'e',
                title: 'With badge',
                icon: LineChartUpIcon,
                badge: (
                    <span style={{ background: '#10b981', color: '#fff', padding: '0 6px', borderRadius: 9999, fontSize: 10 }}>NEW</span>
                ),
                children: <SampleBody label="Pill rendered next to the title" />,
            },
            {
                id: 'f',
                title: 'With error',
                icon: BarChartIcon,
                error: 'Service unavailable — retry in 30s',
                children: <SampleBody label="(hidden — error in place)" />,
            },
        ],
        [],
    );

    return (
        <ComponentDemo
            title="Widget Chrome & States"
            description="Each widget can pick its visual chrome and surface badges, errors, and loading states without extra wiring."
            centered={false}
        >
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div
                    style={{
                        minHeight: 420,
                        background: 'var(--eui-bg)',
                        border: '1px solid var(--eui-border-subtle)',
                        borderRadius: 8,
                        padding: 12,
                    }}
                >
                    <DashboardLayout widgets={widgets} defaultLayouts={layouts} toolbarTitle="Chrome variants" rowHeight={48} />
                </div>
                <CodeBlock code={code} />
            </div>
        </ComponentDemo>
    );
};

export default WidgetVariants;
