import React from 'react';
import { TreeView } from '../../../components';
import type { TreeNode } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const nodes: TreeNode[] = [
    {
        id: 'docs',
        label: 'Documents',
        children: [
            {
                id: 'work',
                label: 'Work',
                children: [
                    { id: 'resume', label: 'Resume.pdf', isLeaf: true },
                    { id: 'cover', label: 'CoverLetter.docx', isLeaf: true },
                ],
            },
            {
                id: 'personal',
                label: 'Personal',
                children: [
                    { id: 'taxes', label: 'Taxes_2024.pdf', isLeaf: true },
                    { id: 'notes', label: 'Notes.txt', isLeaf: true },
                ],
            },
        ],
    },
    {
        id: 'photos',
        label: 'Photos',
        children: [
            { id: 'vacation', label: 'Vacation.jpg', isLeaf: true },
            { id: 'family', label: 'Family.png', isLeaf: true },
        ],
    },
    {
        id: 'music',
        label: 'Music',
        children: [
            { id: 'track1', label: 'Song1.mp3', isLeaf: true },
            { id: 'track2', label: 'Song2.mp3', isLeaf: true },
        ],
    },
];

const code = `import { TreeView } from 'ether-ui';
import type { TreeNode } from 'ether-ui';

const nodes: TreeNode[] = [
  {
    id: 'docs',
    label: 'Documents',
    children: [
      {
        id: 'work',
        label: 'Work',
        children: [
          { id: 'resume', label: 'Resume.pdf', isLeaf: true },
          { id: 'cover', label: 'CoverLetter.docx', isLeaf: true },
        ],
      },
    ],
  },
  {
    id: 'photos',
    label: 'Photos',
    children: [
      { id: 'vacation', label: 'Vacation.jpg', isLeaf: true },
    ],
  },
];

<TreeView
  nodes={nodes}
  defaultExpandedKeys={new Set(['docs'])}
  onSelect={(keys, node) => console.log('Selected:', node.label)}
/>`;

const BasicUsage: React.FC = () => (
    <>
        <ComponentDemo title="File Explorer Tree" description="A basic tree view with expandable folders and selectable nodes.">
            <div className="w-full max-w-sm">
                <TreeView
                    nodes={nodes}
                    defaultExpandedKeys={new Set(['docs'])}
                    onSelect={(_keys, node) => console.log('Selected:', node.label)}
                />
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default BasicUsage;
