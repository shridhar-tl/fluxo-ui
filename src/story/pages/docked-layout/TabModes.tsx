import React, { useState } from 'react';
import { DockedLayout } from '../../../components/docked-layout';
import type { PanelConfig, TabMode } from '../../../components/docked-layout';
import { FolderIcon, SearchIcon, SettingsIcon } from '../../../assets/icons';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const panels: PanelConfig[] = [
    {
        id: 'explorer2',
        title: 'Explorer',
        icon: FolderIcon,
        defaultPosition: 'left',
        defaultState: 'pinned',
        defaultSize: 180,
        children: (
            <div style={{ padding: 12, color: 'var(--eui-text)', fontSize: 13 }}>
                <div style={{ color: 'var(--eui-text-muted)', fontSize: 11, fontWeight: 600, marginBottom: 8 }}>FILES</div>
                {['index.ts', 'App.tsx', 'styles.css'].map((f) => (
                    <div key={f} style={{ padding: '3px 6px', cursor: 'pointer', borderRadius: 3 }}>{f}</div>
                ))}
            </div>
        ),
    },
    {
        id: 'search2',
        title: 'Search',
        icon: SearchIcon,
        defaultPosition: 'left',
        defaultState: 'pinned',
        defaultSize: 180,
        children: (
            <div style={{ padding: 12, color: 'var(--eui-text)', fontSize: 13 }}>
                <input
                    placeholder="Search..."
                    aria-label="Search"
                    style={{ width: '100%', padding: '5px 8px', borderRadius: 4, border: '1px solid var(--eui-border)', background: 'var(--eui-bg-subtle)', color: 'var(--eui-text)', fontSize: 12, boxSizing: 'border-box' }}
                />
            </div>
        ),
    },
    {
        id: 'settings2',
        title: 'Settings',
        icon: SettingsIcon,
        defaultPosition: 'left',
        defaultState: 'pinned',
        defaultSize: 180,
        children: (
            <div style={{ padding: 12, color: 'var(--eui-text)', fontSize: 13 }}>
                <div style={{ color: 'var(--eui-text-muted)', fontSize: 11, fontWeight: 600, marginBottom: 8 }}>SETTINGS</div>
                <div>Theme: Blue</div>
            </div>
        ),
    },
];

const code = (mode: TabMode) => `<DockedLayout panels={panels} tabMode="${mode}">
  <Content />
</DockedLayout>`;

export const TabModes: React.FC = () => {
    const [mode, setMode] = useState<TabMode>('icon');

    return (
        <ComponentDemo
            title="Tab Modes"
            description="Switch between 'icon' (compact icon-only) and 'icon-label' (icon with label text below) activity bar modes."
            centered={false}
        >
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                    {(['icon', 'icon-label'] as TabMode[]).map((m) => (
                        <button
                            key={m}
                            onClick={() => setMode(m)}
                            style={{
                                padding: '6px 14px', borderRadius: 6, border: '1px solid var(--eui-border)',
                                background: mode === m ? 'var(--eui-primary)' : 'var(--eui-bg-subtle)',
                                color: mode === m ? '#fff' : 'var(--eui-text)', cursor: 'pointer', fontSize: 13,
                            }}
                        >
                            {m}
                        </button>
                    ))}
                </div>
                <div style={{ height: 360, border: '1px solid var(--eui-border-subtle)', borderRadius: 6, overflow: 'hidden' }}>
                    <DockedLayout panels={panels} tabMode={mode}>
                        <div style={{ padding: 24, color: 'var(--eui-text)' }}>
                            <strong>tabMode: "{mode}"</strong>
                            <p style={{ color: 'var(--eui-text-muted)', fontSize: 14, marginTop: 8 }}>
                                Activity bar shows {mode === 'icon' ? 'icons only' : 'icons with labels'}.
                            </p>
                        </div>
                    </DockedLayout>
                </div>
                <CodeBlock code={code(mode)} />
            </div>
        </ComponentDemo>
    );
};
