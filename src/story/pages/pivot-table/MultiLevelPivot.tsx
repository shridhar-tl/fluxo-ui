import React from 'react';
import { PivotTable } from '../../../components';
import type { PivotConfig } from '../../../components/pivot-table/pivot-table-types';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { currencyFormat, numberFormat, salesData } from './pivot-table-story-data';

const config: PivotConfig = {
    rows: ['region', 'country', 'city'],
    columns: [],
    values: [
        { field: 'revenue', label: 'Revenue', aggregateFunction: 'sum', format: currencyFormat },
        { field: 'quantity', label: 'Quantity', aggregateFunction: 'sum', format: numberFormat },
        { field: 'profit', label: 'Profit', aggregateFunction: 'sum', format: currencyFormat },
    ],
};

const code = `import { PivotTable } from 'fluxo-ui';
import type { PivotConfig } from 'fluxo-ui';

const config: PivotConfig = {
    rows: ['region', 'country', 'city'],
    columns: [],
    values: [
        { field: 'revenue', label: 'Revenue', aggregateFunction: 'sum', format: currencyFormat },
        { field: 'quantity', label: 'Quantity', aggregateFunction: 'sum', format: numberFormat },
        { field: 'profit', label: 'Profit', aggregateFunction: 'sum', format: currencyFormat },
    ],
};

<PivotTable
    data={salesData}
    config={config}
    expandAll
    showSubTotals
    showToolbar
    bordered
/>`;

const MultiLevelPivot: React.FC = () => (
    <>
        <ComponentDemo
            title="Multi-Level Row Pivot"
            description="Three levels of row grouping: Region > Country > City. Use the toolbar to expand or collapse all rows."
        >
            <PivotTable data={salesData} config={config} expandAll showSubTotals showToolbar bordered />
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default MultiLevelPivot;
