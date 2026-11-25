import React from 'react';

import { ClockIcon, FolderIcon, ListCheckIcon } from '../../../assets/icons';
import { ProgressBar, Tag, TreeTable } from '../../../components';
import type { TreeTableColumn } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { formatCurrency, type ProjectNode, projectTree, statusColors } from './tree-table-story-data';

const columns: TreeTableColumn<ProjectNode>[] = [
    {
        key: 'name',
        title: 'Project',
        minWidth: 260,
        cell: ({ row, hasChildren }) => (
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25, minWidth: 0 }}>
                <span style={{ fontWeight: hasChildren ? 600 : 500, color: 'var(--eui-text)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.name}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--eui-text-muted)' }}>{row.owner}</span>
            </div>
        ),
    },
    {
        key: 'status',
        title: 'Status',
        width: 120,
        cell: ({ row }) => <Tag size="sm" variant="soft" color={statusColors[row.status]} label={row.status} />,
    },
    {
        key: 'progress',
        title: 'Progress',
        width: 170,
        hideBelow: 'md',
        cell: ({ value }) => <ProgressBar value={Number(value) || 0} size="sm" showValue aria-label="Progress" style={{ width: '100%' }} />,
    },
    {
        key: 'budget',
        title: 'Budget',
        width: 130,
        align: 'right',
        aggregate: 'sum',
        format: formatCurrency,
        footer: ({ aggregate }) => <strong>{formatCurrency(aggregate)}</strong>,
    },
    {
        key: 'spent',
        title: 'Spent',
        width: 130,
        align: 'right',
        aggregate: 'sum',
        cell: ({ row, value, aggregated }) => {
            const over = !aggregated && typeof value === 'number' && value > row.budget;
            return <span style={{ color: over ? 'var(--eui-btn-danger-tone)' : undefined, fontWeight: over ? 600 : undefined }}>{formatCurrency(value)}</span>;
        },
        footer: ({ aggregate }) => <strong>{formatCurrency(aggregate)}</strong>,
    },
    {
        key: 'hours',
        title: 'Hours',
        width: 100,
        align: 'right',
        headerAriaLabel: 'Logged hours',
        aggregate: 'sum',
        header: () => (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <ClockIcon aria-hidden="true" style={{ width: 14, height: 14 }} />
                Hours
            </span>
        ),
        footer: 'Total',
    },
];

const renderIcon = (_row: ProjectNode, context: { hasChildren: boolean }) => (context.hasChildren ? <FolderIcon /> : <ListCheckIcon />);

const code = `const columns = [
    {
        key: 'name',
        title: 'Project',
        cell: ({ row, hasChildren }) => (
            <div>
                <strong>{row.name}</strong>
                <small>{row.owner}</small>
            </div>
        ),
    },
    { key: 'status', title: 'Status', cell: ({ row }) => <Tag color={statusColors[row.status]} label={row.status} /> },
    { key: 'progress', title: 'Progress', cell: ({ value }) => <ProgressBar value={value} showValue /> },
    {
        key: 'budget',
        title: 'Budget',
        align: 'right',
        aggregate: 'sum',
        format: formatCurrency,
        footer: ({ aggregate }) => <strong>{formatCurrency(aggregate)}</strong>,
    },
];

<TreeTable data={projects} columns={columns} rowHeight={52} rowIcon={(row, { hasChildren }) => (hasChildren ? <FolderIcon /> : <TaskIcon />)} />`;

const Templates: React.FC = () => (
    <>
        <ComponentDemo
            title="Cell, Header & Footer Templates"
            description="Render any content in cells, headers and footers. Parent rows show rolled-up totals (aggregated is true in the cell context) and the footer sums all leaves."
        >
            <div style={{ width: '100%' }}>
                <TreeTable<ProjectNode>
                    data={projectTree}
                    columns={columns}
                    rowHeight={52}
                    rowIcon={renderIcon}
                    defaultExpandAll
                    gridLines="both"
                    height={440}
                    ariaLabel="Project budgets"
                />
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default Templates;
