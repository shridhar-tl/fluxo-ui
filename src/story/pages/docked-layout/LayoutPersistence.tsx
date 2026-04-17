import React, { useState } from 'react';
import { DockedLayout } from '../../../components/docked-layout';
import type { DockedLayoutState, PanelConfig } from '../../../components/docked-layout';
import { BarChartIcon, FolderIcon, SettingsIcon } from '../../../assets/icons';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const panels: PanelConfig[] = [
    {
        id: 'explorer4',
        title: 'Explorer',
        icon: FolderIcon,
        defaultPosition: 'left',
        defaultState: 'pinned',
        defaultSize: 200,
        children: <div style={{ padding: 12, color: 'var(--eui-text)', fontSize: 13 }}>Explorer content</div>,
    },
    {
        id: 'properties4',
        title: 'Properties',
        icon: SettingsIcon,
        defaultPosition: 'right',
        defaultState: 'pinned',
        defaultSize: 200,
        children: <div style={{ padding: 12, color: 'var(--eui-text)', fontSize: 13 }}>Properties content</div>,
    },
    {
        id: 'output4',
        title: 'Output',
        icon: BarChartIcon,
        defaultPosition: 'bottom',
        defaultState: 'pinned',
        defaultSize: 120,
        children: <div style={{ padding: 12, fontFamily: 'monospace', fontSize: 12, color: 'var(--eui-text)' }}>Build output…</div>,
    },
];

const code = `const [layoutState, setLayoutState] = useState<DockedLayoutState>();

<DockedLayout
  panels={panels}
  layoutState={layoutState}
  onChange={(state) => {
    setLayoutState(state);
    localStorage.setItem('layout', JSON.stringify(state));
  }}
>
  <Content />
</DockedLayout>`;

export const LayoutPersistence: React.FC = () => {
    const [layoutState, setLayoutState] = useState<DockedLayoutState | undefined>(undefined);
    const [saveCount, setSaveCount] = useState(0);

    const handleChange = (state: DockedLayoutState) => {
        setLayoutState(state);
        setSaveCount((c) => c + 1);
    };

    return (
        <ComponentDemo
            title="Layout Persistence"
            description="The onChange callback fires on every layout change — resize, pin toggle, re-dock. Pass the state back via layoutState to restore it."
            centered={false}
        >
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ height: 360, border: '1px solid var(--eui-border-subtle)', borderRadius: 6, overflow: 'hidden' }}>
                    <DockedLayout
                        panels={panels}
                        layoutState={layoutState}
                        onChange={handleChange}
                    >
                        <div style={{ padding: 24, color: 'var(--eui-text)' }}>
                            <p style={{ margin: 0, fontSize: 14, color: 'var(--eui-text-muted)' }}>
                                Resize or re-dock panels. Layout changes are captured via onChange.
                            </p>
                        </div>
                    </DockedLayout>
                </div>
                <div style={{ padding: '10px 14px', background: 'var(--eui-bg-subtle)', border: '1px solid var(--eui-border-subtle)', borderRadius: 6, fontSize: 13, color: 'var(--eui-text)' }}>
                    Layout onChange fired: <strong>{saveCount}</strong> times
                </div>
                <CodeBlock code={code} />
            </div>
        </ComponentDemo>
    );
};
