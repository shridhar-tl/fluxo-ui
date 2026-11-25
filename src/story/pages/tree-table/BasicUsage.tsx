import React from 'react';

import { FileIcon, FolderIcon } from '../../../assets/icons';
import { TreeTable } from '../../../components';
import type { TreeTableColumn } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { type FileNode, fileTree, formatBytes } from './tree-table-story-data';

const columns: TreeTableColumn<FileNode>[] = [
    { key: 'name', title: 'Name', minWidth: 220, sortable: true },
    { key: 'size', title: 'Size', width: 120, align: 'right', format: formatBytes, aggregate: 'sum', sortable: true },
    { key: 'modified', title: 'Modified', width: 140, sortable: true },
    { key: 'owner', title: 'Owner', width: 120, hideBelow: 'sm' },
];

const renderIcon = (row: FileNode, context: { expanded: boolean }) =>
    row.kind === 'folder' ? <FolderIcon style={{ color: context.expanded ? 'var(--eui-primary)' : undefined }} /> : <FileIcon />;

const code = `import { TreeTable } from 'fluxo-ui';

const columns = [
    { key: 'name', title: 'Name', sortable: true },
    { key: 'size', title: 'Size', align: 'right', format: formatBytes, aggregate: 'sum' },
    { key: 'modified', title: 'Modified' },
    { key: 'owner', title: 'Owner', hideBelow: 'sm' },
];

<TreeTable
    data={files}
    columns={columns}
    rowKey="id"
    defaultExpandLevel={1}
    showGuides
    rowIcon={(row) => (row.kind === 'folder' ? <FolderIcon /> : <FileIcon />)}
    caption="Project files"
    height={360}
/>`;

const BasicUsage: React.FC = () => (
    <>
        <ComponentDemo
            title="Nested Data"
            description="Pass nested rows with a children array. Folder sizes roll up from their files with aggregate: 'sum'. Use the arrow keys to move, Right/Left to expand and collapse."
        >
            <div style={{ width: '100%' }}>
                <TreeTable<FileNode>
                    data={fileTree}
                    columns={columns}
                    rowKey="id"
                    defaultExpandLevel={1}
                    showGuides
                    rowIcon={renderIcon}
                    caption="Project files"
                    height={360}
                />
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default BasicUsage;
