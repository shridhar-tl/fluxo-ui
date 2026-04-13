import React, { useState } from 'react';
import { TreeView } from '../../../components';
import type { TreeNode, DragDropInfo } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const initialNodes: TreeNode[] = [
    {
        id: 'src',
        label: 'src',
        children: [
            {
                id: 'components',
                label: 'components',
                children: [
                    { id: 'button', label: 'Button.tsx', isLeaf: true },
                    { id: 'modal', label: 'Modal.tsx', isLeaf: true },
                    { id: 'input', label: 'Input.tsx', isLeaf: true },
                ],
            },
            {
                id: 'hooks',
                label: 'hooks',
                children: [
                    { id: 'use-state', label: 'useState.ts', isLeaf: true },
                    { id: 'use-effect', label: 'useEffect.ts', isLeaf: true },
                ],
            },
            { id: 'app', label: 'App.tsx', isLeaf: true },
            { id: 'main', label: 'main.tsx', isLeaf: true },
        ],
    },
    {
        id: 'public',
        label: 'public',
        children: [
            { id: 'index-html', label: 'index.html', isLeaf: true },
            { id: 'favicon', label: 'favicon.ico', isLeaf: true },
        ],
    },
];

const code = `import { TreeView } from 'ether-ui';
import type { TreeNode, DragDropInfo } from 'ether-ui';

<TreeView
  nodes={nodes}
  draggable
  defaultExpandedKeys={new Set(['src', 'components'])}
  onDragDrop={(info: DragDropInfo) => {
    console.log('Dragged:', info.dragNode.label);
    console.log('Dropped on:', info.dropNode.label);
    console.log('Position:', info.dropPosition);
  }}
/>`;

const DragDrop: React.FC = () => {
    const [nodes, setNodes] = useState(initialNodes);

    const handleDragDrop = (info: DragDropInfo) => {
        console.log(`Dragged "${info.dragNode.label}" ${info.dropPosition} "${info.dropNode.label}"`);
        setNodes((prev) => structuredClone(prev));
    };

    return (
        <>
            <ComponentDemo title="Drag and Drop" description="Drag nodes to reorder or move them into other folders. Drop positions: before, inside, or after.">
                <div className="w-full max-w-sm">
                    <TreeView
                        nodes={nodes}
                        draggable
                        defaultExpandedKeys={new Set(['src', 'components', 'hooks'])}
                        onDragDrop={handleDragDrop}
                    />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default DragDrop;
