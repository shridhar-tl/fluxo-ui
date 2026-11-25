import React, { useState } from 'react';

import { Button, TreeTable } from '../../../components';
import type { TreeTableColumn } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { readoutStyle, stackStyle } from '../../demo-styles';
import { formatCurrency, type ProjectNode, projectTree } from './tree-table-story-data';

const createColumns = (onOpen: (row: ProjectNode) => void): TreeTableColumn<ProjectNode>[] => [
    { key: 'name', title: 'Project', width: 240, frozen: 'left', sortable: true },
    { key: 'owner', title: 'Owner', width: 160, group: 'People' },
    { key: 'region', title: 'Region', width: 120, group: 'People' },
    { key: 'status', title: 'Status', width: 120, group: 'Delivery' },
    { key: 'progress', title: 'Progress', width: 110, align: 'right', group: 'Delivery', format: (value) => `${Number(value) || 0}%` },
    { key: 'hours', title: 'Hours', width: 110, align: 'right', group: 'Delivery', aggregate: 'sum' },
    { key: 'budget', title: 'Budget', width: 140, align: 'right', group: 'Finance', aggregate: 'sum', format: formatCurrency },
    { key: 'spent', title: 'Spent', width: 140, align: 'right', group: 'Finance', aggregate: 'sum', format: formatCurrency },
    {
        key: 'remaining',
        title: 'Remaining',
        width: 140,
        align: 'right',
        group: 'Finance',
        valueGetter: (row) => row.budget - row.spent,
        aggregate: 'sum',
        format: formatCurrency,
    },
    {
        key: 'actions',
        title: 'Actions',
        width: 110,
        frozen: 'right',
        resizable: false,
        cell: ({ row }) => (
            <Button
                size="xs"
                layout="outlined"
                ariaLabel={`Open ${row.name}`}
                onClick={(event) => {
                    event.stopPropagation();
                    onOpen(row);
                }}
            >
                Open
            </Button>
        ),
    },
];

const code = `const columns = [
    { key: 'name', title: 'Project', width: 240, frozen: 'left' },
    { key: 'owner', title: 'Owner', group: 'People' },
    { key: 'region', title: 'Region', group: 'People' },
    { key: 'budget', title: 'Budget', group: 'Finance', aggregate: 'sum' },
    { key: 'remaining', title: 'Remaining', group: 'Finance', valueGetter: (row) => row.budget - row.spent },
    { key: 'actions', title: 'Actions', frozen: 'right', resizable: false, cell: ({ row }) => <Button label="Open" /> },
];

<TreeTable
    data={projects}
    columns={columns}
    resizableColumns
    reorderableColumns
    onColumnResize={(key, width) => saveWidth(key, width)}
    onColumnOrderChange={(order) => saveOrder(order)}
/>`;

const ColumnFeatures: React.FC = () => {
    const [log, setLog] = useState('Drag a header edge to resize, or drag a header to reorder it.');
    const [columns] = useState(() => createColumns((row) => setLog(`Opened "${row.name}"`)));

    return (
        <>
            <ComponentDemo
                title="Frozen, Grouped, Resizable & Reorderable Columns"
                description="Pinned columns stay visible while scrolling sideways. Resize with the header handle (or focus it and use the arrow keys); reorder by dragging a header or with Alt + Shift + Left/Right."
            >
                <div style={stackStyle}>
                    <TreeTable<ProjectNode>
                        data={projectTree}
                        columns={columns}
                        resizableColumns
                        reorderableColumns
                        gridLines="both"
                        defaultExpandAll
                        height={400}
                        ariaLabel="Project portfolio"
                        onColumnResize={(key, width) => setLog(`Resized "${key}" to ${width}px`)}
                        onColumnOrderChange={(order) => setLog(`Column order: ${order.join(', ')}`)}
                    />
                    <div style={readoutStyle} aria-live="polite">
                        {log}
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default ColumnFeatures;
