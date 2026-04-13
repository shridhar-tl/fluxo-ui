import cn from 'classnames';
import React, { useState } from 'react';
import { PivotTable } from '../../../components';
import type { PivotConfig } from '../../../components/pivot-table/pivot-table-types';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';
import { currencyFormat, salesData } from './pivot-table-story-data';

const code = `import { PivotTable } from 'fluxo-ui';
import type { PivotConfig, FieldDefinition, PivotPlugin } from 'fluxo-ui';

const [config, setConfig] = useState<PivotConfig>({
  rows: ['region'],
  columns: [],
  values: [{ field: 'revenue', label: 'Revenue', aggregateFunction: 'sum' }],
});

<PivotTable
  data={data}
  config={config}
  onConfigChange={setConfig}
  showConfigPanel
  editable
  showToolbar
  exportable
  fieldDefinitions={fieldDefs}
  plugins={myPlugins}
  disabledFunctions={['product', 'variance']}
/>`;

const InteractiveDemo: React.FC = () => {
    const { isDark } = useStoryTheme();
    const [config, setConfig] = useState<PivotConfig>({
        rows: ['region', 'country'],
        columns: [],
        values: [
            { field: 'revenue', label: 'Revenue', aggregateFunction: 'sum', format: currencyFormat },
            { field: 'quantity', label: 'Qty', aggregateFunction: 'sum' },
        ],
    });
    const [data, setData] = useState(salesData);

    return (
        <>
            <ComponentDemo
                title="Interactive Pivot"
                description="Drag fields between zones. Double-click leaf cells to edit. Change aggregation functions on value chips."
            >
                <div className={cn('rounded-lg overflow-hidden border', { 'border-white/10': isDark, 'border-gray-200': !isDark })}>
                    <PivotTable
                        data={data}
                        config={config}
                        onConfigChange={setConfig}
                        onDataChange={(newData) => setData(newData as typeof salesData)}
                        showConfigPanel
                        configPanelPosition="left"
                        showToolbar
                        editable
                        exportable
                        showGrandTotal
                        showSubTotals
                        expandAll
                        height="400px"
                        fieldDefinitions={[
                            { field: 'region', label: 'Region', dataType: 'string' },
                            { field: 'country', label: 'Country', dataType: 'string' },
                            { field: 'city', label: 'City', dataType: 'string' },
                            { field: 'product', label: 'Product', dataType: 'string' },
                            { field: 'category', label: 'Category', dataType: 'string' },
                            { field: 'quarter', label: 'Quarter', dataType: 'string' },
                            { field: 'salesperson', label: 'Salesperson', dataType: 'string' },
                            { field: 'revenue', label: 'Revenue', dataType: 'number', editable: true },
                            { field: 'quantity', label: 'Quantity', dataType: 'number', editable: true },
                            { field: 'profit', label: 'Profit', dataType: 'number', editable: true },
                        ]}
                    />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default InteractiveDemo;
