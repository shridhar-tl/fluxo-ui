import React, { useState } from 'react';
import {
    DashboardIcon,
    FolderIcon,
    SearchIcon,
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
    { id: '3', icon: SearchIcon, label: 'Search' },
    { id: '4', icon: ShareIcon, label: 'Share' },
    { id: '5', icon: UserIcon, label: 'Profile' },
    { id: '6', icon: SettingsIcon, label: 'Settings' },
];

const code = `<Dock magnification={1.6} magnificationDistance={80} items={items} />
<Dock magnification={1} items={items} />`;

const Magnification: React.FC = () => {
    const [magnification, setMagnification] = useState(1.6);
    const [distance, setDistance] = useState(80);
    const [iconSize, setIconSize] = useState(40);

    return (
        <>
            <ComponentDemo
                title="Magnification Controls"
                description="Tune the peak scale, falloff distance, and base icon size to match your app's feel. Set magnification to 1 to disable it."
            >
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
                    <Dock
                        mode="inline"
                        layout="pill"
                        background="glass"
                        magnification={magnification}
                        magnificationDistance={distance}
                        iconSize={iconSize}
                        items={items}
                    />
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'auto 1fr auto',
                            gap: 12,
                            alignItems: 'center',
                            padding: '12px 16px',
                            background: 'var(--eui-bg-subtle)',
                            border: '1px solid var(--eui-border-subtle)',
                            borderRadius: 6,
                            width: '100%',
                            maxWidth: 520,
                            fontSize: 13,
                        }}
                    >
                        <label htmlFor="magn">Magnification</label>
                        <input
                            id="magn"
                            type="range"
                            min={1}
                            max={3}
                            step={0.05}
                            value={magnification}
                            onChange={(e) => setMagnification(Number(e.target.value))}
                        />
                        <span>{magnification.toFixed(2)}×</span>

                        <label htmlFor="dist">Distance</label>
                        <input
                            id="dist"
                            type="range"
                            min={20}
                            max={200}
                            step={4}
                            value={distance}
                            onChange={(e) => setDistance(Number(e.target.value))}
                        />
                        <span>{distance}px</span>

                        <label htmlFor="icon">Icon size</label>
                        <input
                            id="icon"
                            type="range"
                            min={28}
                            max={72}
                            step={2}
                            value={iconSize}
                            onChange={(e) => setIconSize(Number(e.target.value))}
                        />
                        <span>{iconSize}px</span>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default Magnification;
