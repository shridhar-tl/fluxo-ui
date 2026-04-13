import React, { useMemo, useState } from 'react';
import { Button, PivotTable } from '../../../components';
import type { PivotConfig, PivotFilter } from '../../../components/pivot-table/pivot-table-types';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { currencyFormat, numberFormat, salesData } from './pivot-table-story-data';

const regionOptions = ['All Regions', 'North America', 'Europe', 'Asia Pacific'] as const;
const categoryOptions = ['All Categories', 'Electronics', 'Accessories'] as const;

const code = `import { PivotTable } from 'fluxo-ui';
import type { PivotConfig, PivotFilter } from 'fluxo-ui';

const filters: PivotFilter[] = [
    { field: 'region', operator: 'eq', value: 'Europe' },
    { field: 'category', operator: 'eq', value: 'Electronics' },
];

const config: PivotConfig = {
    rows: ['country', 'product'],
    columns: [],
    values: [
        { field: 'revenue', label: 'Revenue', aggregateFunction: 'sum', format: currencyFormat },
        { field: 'quantity', label: 'Quantity', aggregateFunction: 'sum', format: numberFormat },
        { field: 'profit', label: 'Profit', aggregateFunction: 'sum', format: currencyFormat },
    ],
    filters,
};

<PivotTable data={salesData} config={config} expandAll />`;

const Filtering: React.FC = () => {
    const [selectedRegion, setSelectedRegion] = useState<string>('All Regions');
    const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');

    const config: PivotConfig = useMemo(() => {
        const filters: PivotFilter[] = [];

        if (selectedRegion !== 'All Regions') {
            filters.push({ field: 'region', operator: 'eq', value: selectedRegion });
        }
        if (selectedCategory !== 'All Categories') {
            filters.push({ field: 'category', operator: 'eq', value: selectedCategory });
        }

        return {
            rows: ['country', 'product'],
            columns: [],
            values: [
                { field: 'revenue', label: 'Revenue', aggregateFunction: 'sum', format: currencyFormat },
                { field: 'quantity', label: 'Quantity', aggregateFunction: 'sum', format: numberFormat },
                { field: 'profit', label: 'Profit', aggregateFunction: 'sum', format: currencyFormat },
            ],
            filters,
        };
    }, [selectedRegion, selectedCategory]);

    return (
        <>
            <ComponentDemo
                title="Filtered Pivot Data"
                description="Apply filters to narrow pivot table data. Select a region and/or category to see filtered results."
            >
                <div className="flex flex-wrap gap-3 mb-4">
                    <div className="flex flex-wrap gap-2">
                        {regionOptions.map((region) => (
                            <Button
                                key={region}
                                variant={selectedRegion === region ? 'primary' : 'default'}
                                size="sm"
                                onClick={() => setSelectedRegion(region)}
                            >
                                {region}
                            </Button>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {categoryOptions.map((cat) => (
                            <Button
                                key={cat}
                                variant={selectedCategory === cat ? 'primary' : 'default'}
                                size="sm"
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat}
                            </Button>
                        ))}
                    </div>
                </div>
                <PivotTable data={salesData} config={config} expandAll showToolbar />
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default Filtering;
