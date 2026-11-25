import React, { useCallback, useEffect, useRef, useState } from 'react';

import { TreeTable } from '../../../components';
import type { TreeTableColumn, TreeTableLoadChildren } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { readoutStyle, stackStyle } from '../../demo-styles';
import { fetchLazyChildren, fetchRootPage, formatCurrency, type LazyNode, totalLazyRoots } from './tree-table-story-data';

const columns: TreeTableColumn<LazyNode>[] = [
    { key: 'name', title: 'Region', minWidth: 220 },
    { key: 'items', title: 'Items', width: 110, align: 'right' },
    { key: 'revenue', title: 'Revenue', width: 150, align: 'right', format: formatCurrency },
];

const pageSize = 40;
const hasChildren = (row: LazyNode) => row.hasChildren;
const loadChildren: TreeTableLoadChildren<LazyNode> = (row, { offset, signal }) => fetchLazyChildren(row, offset, signal);

const code = `const [rows, setRows] = useState<Region[]>([]);
const [loadingMore, setLoadingMore] = useState(false);

const loadNextPage = async () => {
    setLoadingMore(true);
    const page = await api.regions({ offset: rows.length, limit: 40 });
    setRows((current) => [...current, ...page]);
    setLoadingMore(false);
};

<TreeTable
    data={rows}
    columns={columns}
    onEndReached={loadNextPage}
    hasMore={rows.length < total}
    loadingMore={loadingMore}
    loading={rows.length === 0}
/>`;

const InfiniteRoots: React.FC = () => {
    const [rows, setRows] = useState<LazyNode[]>([]);
    const [loadingMore, setLoadingMore] = useState(false);
    const busyRef = useRef(false);
    const mountedRef = useRef(true);

    const loadNextPage = useCallback((offset: number) => {
        if (busyRef.current) return;
        busyRef.current = true;
        setLoadingMore(true);
        fetchRootPage(offset, pageSize).then((page) => {
            busyRef.current = false;
            if (!mountedRef.current) return;
            setRows((current) => (current.length === offset ? [...current, ...page] : current));
            setLoadingMore(false);
        });
    }, []);

    useEffect(() => {
        mountedRef.current = true;
        loadNextPage(0);
        return () => {
            mountedRef.current = false;
        };
    }, [loadNextPage]);

    return (
        <>
            <ComponentDemo
                title="Infinite Root Rows"
                description="Root rows are appended as you scroll near the end. Combine it with lazy children for trees of any size."
            >
                <div style={stackStyle}>
                    <TreeTable<LazyNode>
                        data={rows}
                        columns={columns}
                        loadChildren={loadChildren}
                        hasChildren={hasChildren}
                        onEndReached={() => loadNextPage(rows.length)}
                        hasMore={rows.length < totalLazyRoots}
                        loadingMore={loadingMore && rows.length > 0}
                        loading={rows.length === 0}
                        height={380}
                        ariaLabel="Regions"
                    />
                    <div style={readoutStyle} aria-live="polite">
                        {`${rows.length} of ${totalLazyRoots} regions loaded`}
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default InfiniteRoots;
