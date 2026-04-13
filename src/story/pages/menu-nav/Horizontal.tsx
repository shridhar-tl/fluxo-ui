import React, { useState } from 'react';
import { MenuNav } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { horizontalMenuItems } from './menu-nav-story-data';

const code = `import { MenuNav } from 'ether-ui';

<MenuNav
  items={items}
  orientation="horizontal"
  selectedId={selectedId}
  onSelect={(id) => setSelectedId(id)}
/>`;

const Horizontal: React.FC = () => {
    const [selectedId, setSelectedId] = useState('home');

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
        </>
    );
};

export default Horizontal;
