import React from 'react';
import {
    DashboardIcon,
    FolderIcon,
    SettingsIcon,
    ShareIcon,
    UserIcon,
} from '../../../assets/icons';
import { Dock } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const items = [
    { id: '1', icon: DashboardIcon, label: 'Home' },
    { id: '2', icon: FolderIcon, label: 'Files' },
    { id: '3', icon: ShareIcon, label: 'Share' },
    { id: '4', icon: UserIcon, label: 'Profile' },
    { id: '5', icon: SettingsIcon, label: 'Settings' },
];

const code = `<Dock position="bottom" mode="inline" items={items} />
<Dock position="top" mode="inline" items={items} />
<Dock position="left" mode="inline" items={items} />
<Dock position="right" mode="inline" items={items} />`;

const Orientation: React.FC = () => (
    <>
        <ComponentDemo
            title="Position & Orientation"
            description="Bottom and top render horizontally; left and right render vertically. Each side has its own anchor for tooltips."
        >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, width: '100%' }}>
                {(['bottom', 'top', 'left', 'right'] as const).map((position) => (
                    <div
                        key={position}
                        style={{
                            border: '1px solid var(--eui-border-subtle)',
                            borderRadius: 8,
                            padding: 16,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 8,
                        }}
                    >
                        <span style={{ fontSize: 12, color: 'var(--eui-text-muted)' }}>position="{position}"</span>
                        <Dock
                            position={position}
                            mode="inline"
                            layout="pill"
                            iconSize={36}
                            magnification={1.3}
                            items={items}
                        />
                    </div>
                ))}
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default Orientation;
