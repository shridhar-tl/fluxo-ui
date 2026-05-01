import React from 'react';
import { DashboardIcon, FolderIcon, SettingsIcon, UserIcon } from '../../../assets/icons';
import { Dock, DockBackground, DockLayout } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const items = [
    { id: '1', icon: DashboardIcon, label: 'Home' },
    { id: '2', icon: FolderIcon, label: 'Files' },
    { id: '3', icon: UserIcon, label: 'Profile' },
    { id: '4', icon: SettingsIcon, label: 'Settings' },
];

const layouts: DockLayout[] = ['pill', 'rectangle', 'floating', 'attached'];
const backgrounds: DockBackground[] = ['glass', 'solid', 'gradient', 'transparent'];

const code = `<Dock layout="pill" background="glass" mode="inline" items={items} />
<Dock layout="rectangle" background="solid" mode="inline" items={items} />
<Dock layout="floating" background="gradient" gradient={{ from: '#3b82f6', to: '#a855f7' }} mode="inline" items={items} />
<Dock layout="attached" background="transparent" mode="inline" items={items} />`;

const Layouts: React.FC = () => (
    <>
        <ComponentDemo title="Layouts × Backgrounds" description="Cross product of every layout and background treatment.">
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center' }}>
                {layouts.map((layout) => (
                    <div key={layout} style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: 'var(--eui-text-muted)' }}>{layout}</span>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                            {backgrounds.map((bg) => (
                                <Dock
                                    key={bg}
                                    layout={layout}
                                    background={bg}
                                    gradient={bg === 'gradient' ? { from: '#3b82f6', to: '#a855f7' } : undefined}
                                    mode="inline"
                                    iconSize={36}
                                    magnification={1.3}
                                    items={items}
                                    ariaLabel={`${layout} dock with ${bg} background`}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default Layouts;
