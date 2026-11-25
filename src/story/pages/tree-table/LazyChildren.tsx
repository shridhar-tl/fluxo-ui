import React, { useCallback, useState } from 'react';

import { TreeTable } from '../../../components';
import type { TreeTableColumn, TreeTableLoadChildren } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { readoutStyle, stackStyle } from '../../demo-styles';
import { fetchLazyChildren, formatCurrency, type LazyNode, lazyRoots } from './tree-table-story-data';

const columns: TreeTableColumn<LazyNode>[] = [
    { key: 'name', title: 'Name', minWidth: 220 },
    { key: 'type', title: 'Type', width: 110 },
    { key: 'items', title: 'Items', width: 100, align: 'right' },
    { key: 'revenue', title: 'Revenue', width: 140, align: 'right', format: formatCurrency },
];

const roots = lazyRoots(0, 12);
const hasChildren = (row: LazyNode) => row.hasChildren;

const code = `const loadChildren = async (row, { offset, signal }) => {
    const response = await fetch(\`/api/nodes/\${row.id}/children?offset=\${offset}&limit=50\`, { signal });
    const page = await response.json();
    return { rows: page.rows, hasMore: page.hasMore };
};

<TreeTable
    data={regions}
    columns={columns}
    loadChildren={loadChildren}
    hasChildren={(row) => row.hasChildren}
    height={420}
/>`;

const LazyChildren: React.FC = () => {
    const [requests, setRequests] = useState<string[]>([]);

    const loadChildren = useCallback<TreeTableLoadChildren<LazyNode>>(async (row, { offset, signal }) => {
        setRequests((previous) => [`${row.name} · offset ${offset}`, ...previous].slice(0, 4));
        return fetchLazyChildren(row, offset, signal);
    }, []);

    return (
        <>
            <ComponentDemo
                title="Lazy Children with Paging"
                description="Each region holds 250 stores and each store 1,000 orders. Children load on first expand, 50 at a time; the next page loads as soon as you scroll to the end of a branch."
            >
                <div style={stackStyle}>
                    <TreeTable<LazyNode>
                        data={roots}
                        columns={columns}
                        loadChildren={loadChildren}
                        hasChildren={hasChildren}
                        showGuides
                        height={420}
                        ariaLabel="Sales by region"
                    />
                    <div style={readoutStyle} aria-live="polite">
                        {requests.length ? `Requests: ${requests.join('  |  ')}` : 'Expand a region to load its stores.'}
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default LazyChildren;
