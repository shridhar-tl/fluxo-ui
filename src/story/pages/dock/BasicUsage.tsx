import React, { useState } from 'react';
import {
    DashboardIcon,
    EditIcon,
    FileUpload,
    FolderIcon,
    SearchIcon,
    SettingsIcon,
    ShareIcon,
    TrashIcon,
    UserIcon,
} from '../../../assets/icons';
import { Dock } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const code = `import { Dock } from 'fluxo-ui';

<Dock
  position="bottom"
  layout="pill"
  background="glass"
  mode="inline"
  items={[
    { id: 'home', icon: DashboardIcon, label: 'Home' },
    { id: 'docs', icon: FolderIcon, label: 'Docs' },
    { id: 'edit', icon: EditIcon, label: 'Edit', badge: 3 },
    { id: 'sep1', icon: ShareIcon, label: 'Share', separatorAfter: true },
    { id: 'settings', icon: SettingsIcon, label: 'Settings' },
  ]}
/>`;

const BasicUsage: React.FC = () => {
    const [last, setLast] = useState<string | null>(null);
    return (
        <>
            <ComponentDemo
                title="Default Dock"
                description="Hover an icon to see magnification and a tooltip. Set mode='fixed' (default) in real apps; this demo uses mode='inline' to live inside the example."
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
                    <Dock
                        position="bottom"
                        layout="pill"
                        background="glass"
                        mode="inline"
                        iconSize={44}
                        magnification={1.5}
                        magnificationDistance={70}
                        onItemClick={(id) => setLast(id)}
                        items={[
                            { id: 'home', icon: DashboardIcon, label: 'Home' },
                            { id: 'docs', icon: FolderIcon, label: 'Documents' },
                            { id: 'upload', icon: FileUpload, label: 'Upload', badge: 2 },
                            { id: 'edit', icon: EditIcon, label: 'Edit', separatorAfter: true },
                            { id: 'share', icon: ShareIcon, label: 'Share' },
                            { id: 'search', icon: SearchIcon, label: 'Search' },
                            { id: 'profile', icon: UserIcon, label: 'Profile' },
                            { id: 'sep2', icon: SettingsIcon, label: 'Settings', separatorAfter: true },
                            { id: 'trash', icon: TrashIcon, label: 'Trash', disabled: true },
                        ]}
                    />
                    <div
                        style={{
                            padding: '10px 14px',
                            background: 'var(--eui-bg-subtle)',
                            border: '1px solid var(--eui-border-subtle)',
                            borderRadius: 6,
                            fontSize: 13,
                            textAlign: 'center',
                            minWidth: 240,
                        }}
                    >
                        Last activated: <strong>{last ?? '—'}</strong>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default BasicUsage;
