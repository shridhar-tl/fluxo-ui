import React, { useState } from 'react';
import { MenuNav } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { collapsibleMenuItems } from './menu-nav-story-data';

const code = `import { MenuNav } from 'ether-ui';

const [collapsed, setCollapsed] = useState(false);

<MenuNav
  items={items}
  collapsible
  collapsed={collapsed}
  onCollapsedChange={setCollapsed}
  selectedId={selectedId}
  onSelect={(id) => setSelectedId(id)}
/>`;

const Collapsible: React.FC = () => {
    const [selectedId, setSelectedId] = useState('home');
    const [collapsed, setCollapsed] = useState(false);

    return (
        <>
            <ComponentDemo title="Collapsible Sidebar" description="Toggle between full and icon-only mode. Click the hamburger icon to collapse/expand." centered={false}>
                <div className="flex flex-col sm:flex-row gap-6 w-full">
                    <div className="shrink-0" style={{ width: collapsed ? 'auto' : undefined, maxWidth: collapsed ? undefined : '240px', transition: 'width 0.2s ease' }}>
                        <MenuNav
                            items={collapsibleMenuItems}
                            collapsible
                            collapsed={collapsed}
                            onCollapsedChange={setCollapsed}
                            selectedId={selectedId}
                            onSelect={(id) => setSelectedId(id)}
                        />
                    </div>
                    <div className="flex-1 flex items-center justify-center text-sm opacity-60">
                        <div className="text-center">
                            <p>Selected: <strong>{selectedId}</strong></p>
                            <p className="mt-1">Collapsed: <strong>{collapsed ? 'Yes' : 'No'}</strong></p>
                        </div>
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default Collapsible;
