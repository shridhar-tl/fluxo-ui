import React from 'react';

import { Sparkline, Table, Tag } from '../../../components';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { stockRows } from './sparkline-story-data';
import type { StockRow } from './sparkline-story-data';

const formatPrice = (value: number) => `$${value.toFixed(2)}`;

const columns = [
    {
        title: 'Symbol',
        field: 'symbol',
        template: (row: StockRow) => (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <strong style={{ color: 'var(--eui-text)' }}>{row.symbol}</strong>
                <span style={{ color: 'var(--eui-text-muted)', fontSize: '0.75rem' }}>{row.name}</span>
            </div>
        ),
    },
    { title: 'Price', field: 'price', template: (row: StockRow) => formatPrice(row.price) },
    {
        title: 'Change',
        field: 'change',
        template: (row: StockRow) => (
            <Tag color={row.change > 0.5 ? 'success' : row.change < -0.5 ? 'danger' : 'secondary'} size="xs">
                {row.change > 0 ? '+' : ''}
                {row.change.toFixed(1)}%
            </Tag>
        ),
    },
    {
        title: '9-day trend',
        field: 'history',
        template: (row: StockRow) => (
            <Sparkline data={row.history} trendColors width={110} height={28} formatValue={formatPrice} valueLabel={`${row.symbol} price`} />
        ),
    },
    {
        title: 'Volume',
        field: 'volume',
        hideBelow: 'md' as const,
        template: (row: StockRow) => <Sparkline type="bar" data={row.volume} color="secondary" width={80} height={24} valueLabel={`${row.symbol} volume`} />,
    },
];

const code = `const columns = [
    { title: 'Symbol', field: 'symbol' },
    {
        title: '9-day trend',
        field: 'history',
        template: (row) => <Sparkline data={row.history} trendColors width={110} height={28} />,
    },
];

<Table columns={columns} rows={rows} totalRows={rows.length} pagination={false} />`;

const TableCells: React.FC = () => (
    <>
        <ComponentDemo title="Table Cells" description="trendColors paints each line green or red based on whether the series rose or fell.">
            <div style={{ width: '100%', overflowX: 'auto' }}>
                <Table columns={columns} rows={stockRows} totalRows={stockRows.length} pagination={false} ariaLabel="Watchlist" />
            </div>
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default TableCells;
