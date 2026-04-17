import React from 'react';
import { DockedLayout } from '../../../components/docked-layout';
import type { PanelConfig } from '../../../components/docked-layout';
import { FolderIcon, PaletteIcon } from '../../../assets/icons';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const panels: PanelConfig[] = [
    {
        id: 'explorer3',
        title: 'Explorer',
        icon: FolderIcon,
        defaultPosition: 'left',
        defaultState: 'pinned',
        defaultSize: 180,
        children: <div style={{ padding: 12, color: 'var(--eui-text)', fontSize: 13 }}>Left panel content</div>,
    },
    {
        id: 'color-picker3',
        title: 'Color Picker',
        icon: PaletteIcon,
        defaultPosition: 'float',
        defaultFloatPos: { x: 240, y: 60, width: 280, height: 200 },
        children: (
            <div style={{ padding: 12, color: 'var(--eui-text)', fontSize: 13 }}>
                <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 8, color: 'var(--eui-text-muted)' }}>COLOR SWATCHES</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'].map((c) => (
                        <div
                            key={c}
                            style={{ width: 28, height: 28, borderRadius: 4, background: c, cursor: 'pointer', border: '2px solid transparent' }}
                            title={c}
                        />
                    ))}
                </div>
            </div>
        ),
    },
];

const code = `const panels: PanelConfig[] = [
  {
    id: 'floating-panel',
    title: 'Color Picker',
    icon: PaletteIcon,
    defaultPosition: 'float',
    defaultFloatPos: { x: 240, y: 60, width: 280, height: 200 },
    children: <ColorPickerContent />,
  },
];

<DockedLayout panels={panels}>
  <Content />
</DockedLayout>`;

export const FloatingPanels: React.FC = () => (
    <ComponentDemo
        title="Floating Panels"
        description="Panels with defaultPosition='float' are freely draggable and resizable. Drag the header to move. Resize from the bottom-right corner. Use the dock buttons to attach to a side."
        centered={false}
    >
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ height: 360, border: '1px solid var(--eui-border-subtle)', borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
                <DockedLayout panels={panels}>
                    <div style={{ padding: 24, color: 'var(--eui-text)' }}>
                        <p style={{ margin: 0, fontSize: 14, color: 'var(--eui-text-muted)' }}>
                            The "Color Picker" panel is floating. Drag its header to reposition it.
                            Use the dock buttons in its header to attach it to a side.
                        </p>
                    </div>
                </DockedLayout>
            </div>
            <CodeBlock code={code} />
        </div>
    </ComponentDemo>
);
