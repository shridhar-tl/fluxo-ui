import React, { useRef, useState } from 'react';

import { Button, SelectButton, TreeTable } from '../../../components';
import type { TreeTableColumn, TreeTableHandle } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { readoutStyle, rowStyle, stackStyle } from '../../demo-styles';
import { type BigNode, bigTreeSizes, buildBigTree, formatCurrency } from './tree-table-story-data';

const columns: TreeTableColumn<BigNode>[] = [
    { key: 'name', title: 'Account', minWidth: 200, sortable: true },
    { key: 'category', title: 'Category', width: 140, sortable: true, hideBelow: 'sm' },
    { key: 'quantity', title: 'Qty', width: 100, align: 'right', aggregate: 'sum', sortable: true },
    { key: 'amount', title: 'Amount', width: 150, align: 'right', aggregate: 'sum', format: formatCurrency, sortable: true },
];

const layouts: Record<string, [number, number]> = {
    '10000': [100, 99],
    '100000': [1000, 99],
    '1000000': [1000, 999],
};

const measureBuild = (size: string) => {
    const [roots, children] = layouts[size];
    const started = performance.now();
    const result = buildBigTree(roots, children);
    return { ...result, ms: Math.round(performance.now() - started) as number | null };
};

const code = `const tableRef = useRef<TreeTableHandle<Row>>(null);

<TreeTable
    ref={tableRef}
    data={oneMillionRows}
    columns={columns}
    size="sm"
    height={420}
    showFooter
/>

tableRef.current?.expandAll();
tableRef.current?.scrollToIndex(999_999, 'end');`;

const LargeDataset: React.FC = () => {
    const [size, setSize] = useState('10000');
    const [expandedCount, setExpandedCount] = useState(0);
    const tableRef = useRef<TreeTableHandle<BigNode>>(null);

    const [built, setBuilt] = useState(() => ({ ...buildBigTree(...layouts['10000']), ms: null as number | null }));

    return (
        <>
            <ComponentDemo
                title="One Million Rows"
                description="Rows are virtualized and flattened only for expanded branches, so expanding every account still scrolls smoothly. The footer sums every leaf row."
            >
                <div style={stackStyle}>
                    <div style={rowStyle}>
                        <SelectButton
                            items={bigTreeSizes}
                            value={size}
                            onChange={(event) => {
                                setSize(event.value);
                                setBuilt(measureBuild(event.value));
                                setExpandedCount(0);
                            }}
                            ariaLabel="Dataset size"
                        />
                        <Button size="sm" variant="primary" onClick={() => tableRef.current?.expandAll()}>
                            Expand all
                        </Button>
                        <Button size="sm" layout="outlined" onClick={() => tableRef.current?.collapseAll()}>
                            Collapse all
                        </Button>
                        <Button size="sm" layout="outlined" onClick={() => tableRef.current?.scrollToIndex(Number.MAX_SAFE_INTEGER, 'end')}>
                            Jump to last row
                        </Button>
                    </div>
                    <TreeTable<BigNode>
                        key={size}
                        ref={tableRef}
                        data={built.data}
                        columns={columns}
                        size="sm"
                        height={420}
                        striped
                        showFooter
                        ariaLabel="Large dataset"
                        onExpandedChange={(keys) => setExpandedCount(keys.size)}
                    />
                    <div style={readoutStyle} aria-live="polite">
                        {`${built.total.toLocaleString()} rows${built.ms === null ? '' : ` generated in ${built.ms} ms`} · ${expandedCount.toLocaleString()} accounts expanded`}
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default LargeDataset;
