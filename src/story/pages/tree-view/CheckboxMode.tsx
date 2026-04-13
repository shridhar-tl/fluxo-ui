import React, { useState } from 'react';
import type { TreeNode } from '../../../components';
import { TreeView } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';

const nodes: TreeNode[] = [
    {
        id: 'permissions',
        label: 'Permissions',
        children: [
            {
                id: 'users',
                label: 'User Management',
                children: [
                    { id: 'user-view', label: 'View Users', isLeaf: true },
                    { id: 'user-create', label: 'Create Users', isLeaf: true },
                    { id: 'user-edit', label: 'Edit Users', isLeaf: true },
                    { id: 'user-delete', label: 'Delete Users', isLeaf: true },
                ],
            },
            {
                id: 'roles',
                label: 'Role Management',
                children: [
                    { id: 'role-view', label: 'View Roles', isLeaf: true },
                    { id: 'role-create', label: 'Create Roles', isLeaf: true },
                    { id: 'role-edit', label: 'Edit Roles', isLeaf: true },
                ],
            },
            {
                id: 'settings',
                label: 'Settings',
                children: [
                    { id: 'settings-view', label: 'View Settings', isLeaf: true },
                    { id: 'settings-edit', label: 'Edit Settings', isLeaf: true },
                ],
            },
        ],
    },
];

const code = `import { TreeView } from 'fluxo-ui';
import type { TreeNode } from 'fluxo-ui';

<TreeView
  nodes={nodes}
  checkboxes
  defaultExpandedKeys={new Set(['permissions', 'users'])}
  onCheck={(keys, node) => console.log('Checked:', [...keys])}
/>`;

const CheckboxMode: React.FC = () => {
    const [checkedKeys, setCheckedKeys] = useState<Set<string>>(new Set(['user-view', 'user-create']));

    return (
        <>
            <ComponentDemo
                title="Checkbox Tree"
                description="Tree with tri-state checkboxes for permission management. Parent nodes show indeterminate state when partially checked."
            >
                <div className="w-full max-w-sm">
                    <TreeView
                        nodes={nodes}
                        checkboxes
                        checkedKeys={checkedKeys}
                        defaultExpandedKeys={new Set(['permissions', 'users', 'roles'])}
                        onCheck={(keys) => setCheckedKeys(keys)}
                    />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default CheckboxMode;
