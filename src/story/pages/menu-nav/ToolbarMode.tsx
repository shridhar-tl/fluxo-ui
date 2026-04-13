import React, { useState } from 'react';
import { MenuNav } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { toolbarMenuItems } from './menu-nav-story-data';

const code = `import { MenuNav } from 'fluxo-ui';

const items = [
  { id: 'file', label: 'File', children: [
    { id: 'new', label: 'New' },
    { id: 'open', label: 'Open' },
    { id: 'save', label: 'Save' },
  ]},
  { id: 'edit', label: 'Edit', children: [
    { id: 'undo', label: 'Undo' },
    { id: 'redo', label: 'Redo' },
    { id: 'copy', label: 'Copy' },
  ]},
  { id: 'view', label: 'View', children: [
    { id: 'zoom-in', label: 'Zoom In' },
    { id: 'zoom-out', label: 'Zoom Out' },
  ]},
  { id: 'help', label: 'Help', children: [
    { id: 'docs', label: 'Documentation' },
    { id: 'about', label: 'About' },
  ]},
];

<MenuNav
  items={items}
  toolbar
  selectedId={selectedId}
  onSelect={(id) => setSelectedId(id)}
/>`;

const ToolbarMode: React.FC = () => {
    const [selectedId, setSelectedId] = useState('');

    return (
        <>
            <ComponentDemo
                title="Toolbar Mode"
                description="A horizontal toolbar-style menu, typical of application menu bars."
                centered={false}
            >
                <div className="w-full">
                    <MenuNav items={toolbarMenuItems} toolbar selectedId={selectedId} onSelect={(id) => setSelectedId(id)} />
                    {selectedId && (
                        <div className="mt-4 text-sm opacity-60 text-center">
                            Selected: <strong>{selectedId}</strong>
                        </div>
                    )}
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default ToolbarMode;
