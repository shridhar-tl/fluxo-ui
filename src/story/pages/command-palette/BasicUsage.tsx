import React, { useState } from 'react';
import {
    CopyIcon,
    DashboardIcon,
    EditIcon,
    SearchIcon,
    SettingsIcon,
    ShareIcon,
    TrashIcon,
    UserIcon,
} from '../../../assets/icons';
import { Button, CommandPalette, CommandPaletteCommand } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { CommandPalette } from 'fluxo-ui';

const [open, setOpen] = useState(false);
const [last, setLast] = useState('');

const commands = [
  { id: 'new', title: 'New file', group: 'File', shortcut: '⌘N', icon: EditIcon, onSelect: () => setLast('new') },
  { id: 'open', title: 'Open file', group: 'File', shortcut: '⌘O', icon: CopyIcon, onSelect: () => setLast('open') },
  { id: 'settings', title: 'Open settings', group: 'App', shortcut: '⌘,', icon: SettingsIcon, onSelect: () => setLast('settings') },
];

<CommandPalette open={open} onOpenChange={setOpen} commands={commands} />`;

const BasicUsage: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [last, setLast] = useState('');

    const commands: CommandPaletteCommand[] = [
        { id: 'dashboard', title: 'Open dashboard', subtitle: 'Go to the main dashboard', group: 'Navigation', icon: DashboardIcon, shortcut: '⌘D', onSelect: () => setLast('dashboard') },
        { id: 'profile', title: 'View profile', group: 'Navigation', icon: UserIcon, onSelect: () => setLast('profile') },
        { id: 'search', title: 'Search', group: 'Actions', icon: SearchIcon, shortcut: '⌘F', onSelect: () => setLast('search') },
        { id: 'new', title: 'Create new file', subtitle: 'Start a blank document', group: 'Actions', icon: EditIcon, shortcut: '⌘N', onSelect: () => setLast('new') },
        { id: 'duplicate', title: 'Duplicate', group: 'Actions', icon: CopyIcon, shortcut: '⌘D', onSelect: () => setLast('duplicate') },
        { id: 'share', title: 'Share', group: 'Actions', icon: ShareIcon, onSelect: () => setLast('share') },
        { id: 'settings', title: 'Open settings', group: 'App', icon: SettingsIcon, shortcut: '⌘,', onSelect: () => setLast('settings') },
        { id: 'delete', title: 'Delete current item', subtitle: 'This cannot be undone', group: 'Actions', danger: true, icon: TrashIcon, onSelect: () => setLast('delete') },
    ];

    return (
        <>
            <ComponentDemo
                title="Default Command Palette"
                description="Open with ⌘K (or Ctrl+K) or click the button. Type to filter, arrow keys to navigate, Enter to run, Esc to close."
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
                    <Button onClick={() => setOpen(true)} variant="primary">
                        Open Command Palette (⌘K)
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
                commands={commands}
                hotkey="mod+k"
                recents={{ storageKey: 'fluxo-ui-cmdp-demo' }}
            />
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default BasicUsage;
