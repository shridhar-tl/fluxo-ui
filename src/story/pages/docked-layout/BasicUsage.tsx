import React, { useState } from 'react';
import { DockedLayout } from '../../../components/docked-layout';
import type { PanelConfig } from '../../../components/docked-layout';
import { BarChartIcon, FilterIcon, FolderIcon, SearchIcon, SettingsIcon } from '../../../assets/icons';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const panels: PanelConfig[] = [
    {
        id: 'explorer',
        title: 'Explorer',
        icon: FolderIcon,
        defaultPosition: 'left',
        defaultState: 'pinned',
        defaultSize: 220,
        children: (
            <div style={{ padding: '12px', color: 'var(--eui-text)' }}>
                <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 8, color: 'var(--eui-text-muted)' }}>FILES</div>
                {['src/', 'public/', 'package.json', 'tsconfig.json', 'README.md'].map((f) => (
                    <div
                        key={f}
                        style={{ padding: '4px 8px', borderRadius: 4, fontSize: 13, cursor: 'pointer' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--eui-bg-hover)'; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                        {f}
                    </div>
                ))}
            </div>
        ),
    },
    {
        id: 'search',
        title: 'Search',
        icon: SearchIcon,
        defaultPosition: 'left',
        defaultState: 'pinned',
        defaultSize: 220,
        children: (
            <div style={{ padding: '12px', color: 'var(--eui-text)' }}>
                <input
                    placeholder="Search files..."
                    style={{
                        width: '100%', padding: '6px 10px', borderRadius: 4,
                        border: '1px solid var(--eui-border)', background: 'var(--eui-bg-subtle)',
                        color: 'var(--eui-text)', fontSize: 13, boxSizing: 'border-box',
                    }}
                    aria-label="Search files"
                />
                <div style={{ marginTop: 12, fontSize: 12, color: 'var(--eui-text-muted)' }}>
                    Type to search across files
                </div>
            </div>
        ),
    },
    {
        id: 'properties',
        title: 'Properties',
        icon: SettingsIcon,
        defaultPosition: 'right',
        defaultState: 'pinned',
        defaultSize: 240,
        children: (
            <div style={{ padding: '12px', color: 'var(--eui-text)' }}>
                <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 8, color: 'var(--eui-text-muted)' }}>PROPERTIES</div>
                {[['Name', 'MyComponent'], ['Type', 'React.FC'], ['Width', '100%'], ['Height', 'auto']].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13, borderBottom: '1px solid var(--eui-border-subtle)' }}>
                        <span style={{ color: 'var(--eui-text-muted)' }}>{k}</span>
                        <span>{v}</span>
                    </div>
                ))}
            </div>
        ),
    },
    {
        id: 'filters',
        title: 'Filters',
        icon: FilterIcon,
        defaultPosition: 'right',
        defaultState: 'auto-hide',
        defaultSize: 240,
        children: (
            <div style={{ padding: '12px', color: 'var(--eui-text)' }}>
                <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 8, color: 'var(--eui-text-muted)' }}>FILTERS</div>
                <div style={{ fontSize: 13, color: 'var(--eui-text-muted)' }}>No active filters</div>
            </div>
        ),
    },
    {
        id: 'output',
        title: 'Output',
        icon: BarChartIcon,
        defaultPosition: 'bottom',
        defaultState: 'pinned',
        defaultSize: 150,
        children: (
            <div style={{ padding: '8px 12px', fontFamily: 'Menlo, monospace', fontSize: 12, color: 'var(--eui-text)' }}>
                <div style={{ color: '#22c55e' }}>[INFO] Build complete in 324ms</div>
                <div style={{ color: 'var(--eui-text-muted)' }}>[INFO] Watching for file changes...</div>
                <div style={{ color: '#f59e0b' }}>[WARN] Unused variable at line 42</div>
            </div>
        ),
    },
];

const code = `import { DockedLayout } from 'fluxo-ui';
import type { PanelConfig } from 'fluxo-ui';

const panels: PanelConfig[] = [
  {
    id: 'explorer',
    title: 'Explorer',
    icon: FolderIcon,
    defaultPosition: 'left',
    defaultState: 'pinned',
    defaultSize: 220,
    children: <ExplorerPanel />,
  },
  {
    id: 'properties',
    title: 'Properties',
    icon: SettingsIcon,
    defaultPosition: 'right',
    defaultState: 'pinned',
    defaultSize: 240,
    children: <PropertiesPanel />,
  },
  {
    id: 'output',
    title: 'Output',
    icon: BarChartIcon,
    defaultPosition: 'bottom',
    defaultState: 'pinned',
    defaultSize: 150,
    children: <OutputPanel />,
  },
];

<DockedLayout panels={panels}>
  <main style={{ padding: 24 }}>Main content here</main>
</DockedLayout>`;

const BasicUsage: React.FC = () => {
    const [count, setCount] = useState(0);

    return (
        <ComponentDemo
            title="Basic Usage"
            description="Left, right, and bottom panels with tabbed groups. 'Filters' starts as auto-hide. Drag panel headers to re-dock. Click the pin button to toggle pinned/auto-hide."
            centered={false}
        >
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ height: 480, width: '100%', border: '1px solid var(--eui-border-subtle)', borderRadius: 6, overflow: 'hidden' }}>
                    <DockedLayout panels={panels}>
                        <div style={{ padding: 24, color: 'var(--eui-text)' }}>
                            <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 600 }}>Main Content</h2>
                            <p style={{ color: 'var(--eui-text-muted)', fontSize: 14, margin: '0 0 16px' }}>
                                Resize by dragging the edge between panel and center.
                                Drag a panel header to re-dock it. Press the pin icon to toggle auto-hide.
                            </p>
                            <button
                                onClick={() => setCount((c) => c + 1)}
                                style={{
                                    padding: '8px 16px', borderRadius: 6, border: '1px solid var(--eui-border)',
                                    background: 'var(--eui-primary)', color: '#fff', cursor: 'pointer', fontSize: 13,
                                }}
                            >
                                Clicked {count} times
                            </button>
                        </div>
                    </DockedLayout>
                </div>
                <CodeBlock code={code} />
            </div>
        </ComponentDemo>
    );
};


export default BasicUsage;
