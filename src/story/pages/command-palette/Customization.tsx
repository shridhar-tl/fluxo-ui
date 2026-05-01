import React, { useState } from 'react';
import { Button, CommandPalette, CommandPaletteCommand } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `<CommandPalette
  open={open}
  onOpenChange={setOpen}
  commands={commands}
  hotkey="mod+/"
  placeholder="Type to search..."
  emptyMessage={<span>Nothing matches "{query}"</span>}
  groupOrder={['Navigation', 'Actions']}
  maxResults={20}
/>`;

const Customization: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [last, setLast] = useState('');

    const commands: CommandPaletteCommand[] = [
        { id: 'home', title: 'Go to home', group: 'Navigation', keywords: ['dashboard', 'main'], onSelect: () => setLast('home') },
        { id: 'docs', title: 'Open documentation', group: 'Navigation', onSelect: () => setLast('docs') },
        { id: 'changelog', title: 'View changelog', group: 'Navigation', onSelect: () => setLast('changelog') },
        { id: 'export', title: 'Export current view', group: 'Actions', onSelect: () => setLast('export') },
        { id: 'import', title: 'Import data', group: 'Actions', onSelect: () => setLast('import') },
        { id: 'reset', title: 'Reset workspace', group: 'Actions', danger: true, onSelect: () => setLast('reset') },
        { id: 'preview', title: 'Preview only', group: 'Disabled', disabled: true, onSelect: () => setLast('preview') },
    ];

    return (
        <>
            <ComponentDemo
                title="Custom hotkey, group order, placeholder, empty message"
                description="Open with mod+/. Hidden command items (disabled) are visually dimmed and not selectable."
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
                    <Button onClick={() => setOpen(true)} variant="primary">
                        Open palette (mod+/)
                    </Button>
                    <div
                        style={{
                            padding: '10px 14px',
                            background: 'var(--eui-bg-subtle)',
                            border: '1px solid var(--eui-border-subtle)',
                            borderRadius: 6,
                            fontSize: 13,
                            minWidth: 240,
                            textAlign: 'center',
                        }}
                    >
                        Last command: <strong>{last || '—'}</strong>
                    </div>
                </div>
            </ComponentDemo>
            <CommandPalette
                open={open}
                onOpenChange={setOpen}
                hotkey="mod+/"
                placeholder="Type to filter — try 'export' or 'reset'…"
                emptyMessage="No matches yet."
                groupOrder={['Navigation', 'Actions', 'Disabled']}
                maxResults={20}
                commands={commands}
            />
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default Customization;
