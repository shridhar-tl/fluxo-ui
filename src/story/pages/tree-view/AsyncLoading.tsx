import React from 'react';
import type { TreeNode } from '../../../components';
import { TreeView } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const nodes: TreeNode[] = [
    { id: 'node-1', label: 'Lazy Folder A' },
    { id: 'node-2', label: 'Lazy Folder B' },
    { id: 'node-3', label: 'Lazy Folder C' },
    { id: 'leaf-1', label: 'Static File.txt', isLeaf: true },
];

const loadChildren = (node: TreeNode): Promise<TreeNode[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { id: `${node.id}-child-1`, label: `${node.label} - Child 1`, isLeaf: true },
                { id: `${node.id}-child-2`, label: `${node.label} - Child 2`, isLeaf: true },
                { id: `${node.id}-sub`, label: `${node.label} - Subfolder` },
            ]);
        }, 1200);
    });
};

const code = `import { TreeView } from 'fluxo-ui';
import type { TreeNode } from 'fluxo-ui';

const loadChildren = (node: TreeNode): Promise<TreeNode[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: \`\${node.id}-child-1\`, label: 'Child 1', isLeaf: true },
        { id: \`\${node.id}-child-2\`, label: 'Child 2', isLeaf: true },
        { id: \`\${node.id}-sub\`, label: 'Subfolder' },
      ]);
    }, 1200);
  });
};

<TreeView
  nodes={nodes}
  loadChildren={loadChildren}
/>`;

const AsyncLoading: React.FC = () => (
    <>
        <ComponentDemo
            title="Async Loading"
            description="Nodes load their children lazily when expanded. A spinner is shown during loading."
        >
            <div className="w-full max-w-sm">
                <TreeView nodes={nodes} loadChildren={loadChildren} />
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default AsyncLoading;
