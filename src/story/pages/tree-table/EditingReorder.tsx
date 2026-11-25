import React, { useState } from 'react';

import { TreeTable } from '../../../components';
import type { TreeTableCellEditEvent, TreeTableColumn, TreeTableRowMoveEvent } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { readoutStyle, stackStyle } from '../../demo-styles';
import { formatCurrency, moveNode, type ProjectNode, projectTree, updateNode } from './tree-table-story-data';

const columns: TreeTableColumn<ProjectNode>[] = [
    {
        key: 'name',
        title: 'Project',
        minWidth: 240,
        editable: true,
        validate: (value) => (String(value ?? '').trim() ? null : 'Name is required'),
    },
    { key: 'owner', title: 'Owner', width: 170, editable: true },
    {
        key: 'budget',
        title: 'Budget',
        width: 150,
        align: 'right',
        format: formatCurrency,
        aggregate: 'sum',
        editable: (row) => !row.children,
        validate: (value) => (typeof value === 'number' && value >= 0 ? null : 'Enter a positive number'),
    },
];

const code = `const [projects, setProjects] = useState(initialProjects);

<TreeTable
    data={projects}
    columns={[
        { key: 'name', title: 'Project', editable: true, validate: (v) => (v ? null : 'Name is required') },
        { key: 'budget', title: 'Budget', editable: (row) => !row.children, aggregate: 'sum' },
    ]}
    onCellEdit={({ rowKey, field, value }) => setProjects((rows) => updateNode(rows, rowKey, { [field]: value }))}
    rowReorder
    onRowMove={({ rowKey, targetKey, position }) => setProjects((rows) => moveNode(rows, rowKey, targetKey, position))}
/>`;

const EditingReorder: React.FC = () => {
    const [data, setData] = useState<ProjectNode[]>(projectTree);
    const [log, setLog] = useState('Double-click a cell, or focus it and press Enter or F2.');

    const handleEdit = ({ rowKey, field, value, previousValue }: TreeTableCellEditEvent<ProjectNode>) => {
        setData((rows) => updateNode(rows, rowKey, { [field]: value } as Partial<ProjectNode>));
        setLog(`Changed ${field} from "${String(previousValue)}" to "${String(value)}"`);
    };

    const handleMove = ({ row, rowKey, target, targetKey, position }: TreeTableRowMoveEvent<ProjectNode>) => {
        setData((rows) => moveNode(rows, rowKey, targetKey, position));
        setLog(`Moved "${row.name}" ${position} "${target.name}"`);
    };

    return (
        <>
            <ComponentDemo
                title="Inline Editing & Row Reordering"
                description="Edit with double-click, Enter or F2; Enter saves and Escape cancels. Drag a row onto the top, middle or bottom of another row, or use Alt + Up/Down to reorder, Alt + Right to nest under the previous sibling and Alt + Left to move out of a parent."
            >
                <div style={stackStyle}>
                    <TreeTable<ProjectNode>
                        data={data}
                        columns={columns}
                        onCellEdit={handleEdit}
                        rowReorder
                        onRowMove={handleMove}
                        defaultExpandAll
                        showGuides
                        height={420}
                        ariaLabel="Editable projects"
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

export default EditingReorder;
