import React from 'react';
import { PivotTable } from '../../../components';
import type { PivotConfig } from '../../../components/pivot-table/pivot-table-types';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { salesData, currencyFormat, decimalFormat, numberFormat } from './pivot-table-story-data';

const config: PivotConfig = {
    rows: ['category'],
    columns: [],
    values: [
        { field: 'revenue', label: 'Total Revenue (Sum)', aggregateFunction: 'sum', format: currencyFormat },
        { field: 'revenue', label: 'Avg Revenue', aggregateFunction: 'average', format: currencyFormat },
        { field: 'revenue', label: 'Min Revenue', aggregateFunction: 'min', format: currencyFormat },
        { field: 'revenue', label: 'Max Revenue', aggregateFunction: 'max', format: currencyFormat },
        { field: 'quantity', label: 'Orders (Count)', aggregateFunction: 'count', format: numberFormat },
        { field: 'profit', label: 'Median Profit', aggregateFunction: 'median', format: currencyFormat },
        { field: 'salesperson', label: 'Unique Sellers', aggregateFunction: 'distinctCount', format: decimalFormat },
    ],
};

const code = `import { PivotTable } from 'ether-ui';
import type { PivotConfig } from 'ether-ui';

const config: PivotConfig = {
    rows: ['category'],
    columns: [],
    values: [
        { field: 'revenue', label: 'Total Revenue (Sum)', aggregateFunction: 'sum', format: currencyFormat },
        { field: 'revenue', label: 'Avg Revenue', aggregateFunction: 'average', format: currencyFormat },
        { field: 'revenue', label: 'Min Revenue', aggregateFunction: 'min', format: currencyFormat },
        { field: 'revenue', label: 'Max Revenue', aggregateFunction: 'max', format: currencyFormat },
        { field: 'quantity', label: 'Orders (Count)', aggregateFunction: 'count', format: numberFormat },
        { field: 'profit', label: 'Median Profit', aggregateFunction: 'median', format: currencyFormat },
        { field: 'salesperson', label: 'Unique Sellers', aggregateFunction: 'distinctCount' },
    ],
};

<PivotTable data={salesData} config={config} striped />`;

const MultipleFunctions: React.FC = () => (
    <>
        <ComponentDemo
            title="Aggregate Functions"
            description="Demonstrates sum, average, min, max, count, median, and distinctCount aggregations on sales data by category."
        >
            <PivotTable data={salesData} config={config} striped />
        </ComponentDemo>
        <div className="mt-4">
            <CodeBlock code={code} language="tsx" />
        </div>
    </>
);

export default MultipleFunctions;
