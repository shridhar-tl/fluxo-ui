import React from 'react';
import { PivotTable } from '../../../components';
import type { PivotConfig } from '../../../components/pivot-table/pivot-table-types';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { currencyFormat, numberFormat, salesData } from './pivot-table-story-data';

const config: PivotConfig = {
    rows: ['region'],
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
    rows: ['region'],
    columns: [],
    values: [
        { field: 'revenue', label: 'Revenue', aggregateFunction: 'sum', format: currencyFormat },
        { field: 'quantity', label: 'Quantity', aggregateFunction: 'sum', format: numberFormat },
        { field: 'profit', label: 'Profit', aggregateFunction: 'sum', format: currencyFormat },
    ],
};

<PivotTable data={salesData} config={config} showToolbar />`;

const BasicUsage: React.FC = () => (
    <>
        <ComponentDemo title="Simple Pivot Table" description="Sales data pivoted by region showing revenue, quantity, and profit totals.">
            <PivotTable data={salesData} config={config} showToolbar />
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default BasicUsage;
