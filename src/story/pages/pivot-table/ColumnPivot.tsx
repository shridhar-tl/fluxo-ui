import React from 'react';
import { PivotTable } from '../../../components';
import type { PivotConfig } from '../../../components/pivot-table/pivot-table-types';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { currencyFormat, salesData } from './pivot-table-story-data';

const config: PivotConfig = {
    rows: ['region'],
    columns: ['quarter'],
    values: [{ field: 'revenue', label: 'Revenue', aggregateFunction: 'sum', format: currencyFormat }],
};

const code = `import { PivotTable } from 'fluxo-ui';
import type { PivotConfig } from 'fluxo-ui';

const config: PivotConfig = {
    rows: ['region'],
    columns: ['quarter'],
    values: [
        { field: 'revenue', label: 'Revenue', aggregateFunction: 'sum', format: currencyFormat },
    ],
};

<PivotTable
    data={salesData}
    config={config}
    showGrandTotal
    showColumnTotals
    compact
/>`;

const ColumnPivot: React.FC = () => (
    <>
        <ComponentDemo
            title="Column Pivoting by Quarter"
            description="Revenue by region with quarterly columns. Each quarter becomes a column header, creating a cross-tabulation view."
        >
            <PivotTable data={salesData} config={config} showGrandTotal showColumnTotals compact />
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default ColumnPivot;
