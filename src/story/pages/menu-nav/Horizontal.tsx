import React, { useState } from 'react';
import { MenuNav } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { basicMenuItems, horizontalMenuItems } from './menu-nav-story-data';

const code = `import { MenuNav } from 'fluxo-ui';

<MenuNav
  items={items}
  orientation="horizontal"
  selectedId={selectedId}
  onSelect={(id) => setSelectedId(id)}
/>`;

const glowCode = `import { MenuNav } from 'fluxo-ui';

<MenuNav
  items={items}
  orientation="horizontal"
  selectionStyle="glow"
  selectedId={selectedId}
  onSelect={(id) => setSelectedId(id)}
/>`;

const Horizontal: React.FC = () => {
    const [selectedId, setSelectedId] = useState('home');
    const [glowSelectedId, setGlowSelectedId] = useState('home');

    return (
        <>
            <ComponentDemo title="Horizontal Menu" description="A horizontal navigation bar with dropdown submenus." centered={false}>
                <div className="w-full">
                    <MenuNav
                        items={horizontalMenuItems}
                        orientation="horizontal"
                        selectedId={selectedId}
                        onSelect={(id) => setSelectedId(id)}
                    />
                    <div className="mt-4 text-sm opacity-60 text-center">
                        Selected: <strong>{selectedId}</strong>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>

            <ComponentDemo
                title="Glow Pill Track"
                description="A pill-shaped track with an animated, primary-tinted glowing indicator that slides behind the active item."
                centered={false}
            >
                <div className="w-full" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <MenuNav
                        items={basicMenuItems}
                        orientation="horizontal"
                        selectionStyle="glow"
                        selectedId={glowSelectedId}
                        onSelect={(id) => setGlowSelectedId(id)}
                    />
                    <div
                        style={{
                            padding: '12px 16px',
                            background: 'var(--eui-bg-subtle)',
                            border: '1px solid var(--eui-border-subtle)',
                            borderRadius: 6,
                            color: 'var(--eui-text-muted)',
                        }}
                    >
                        Selected: <strong style={{ color: 'var(--eui-text)' }}>{glowSelectedId}</strong>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={glowCode} language="tsx" />
            </div>
        </>
    );
};

export default Horizontal;
