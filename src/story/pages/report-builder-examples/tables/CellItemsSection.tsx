import React, { useMemo } from 'react';
import { LiveExampleViewer, type ExpressionHighlight } from '../shared/LiveExampleViewer';
import { buildCellItemsDefinition } from './definitions/cell-items-definition';

const highlights: ExpressionHighlight[] = [
    {
        label: 'Drill cell item — click writes a variable',
        expression: "{ type: 'expression', clickAction: 'drill', drillVariable: 'selectedOrder', drillValueExpr: '=Field.id' }",
        explanation:
            'A drill action writes Variables.selectedOrder. The callout above the table reads the variable and updates without a re-render. onDrillThrough on ReportViewer also notifies the host.',
    },
    {
        label: 'Conditional format on a column',
        expression: "expression: \"Field.status == 'paid'\"  →  textColor: '#10b981', fontWeight: 'bold'",
        explanation:
            'conditionalFormats runs per row against Field. The first matching rule wins — keep the most specific rules first.',
    },
];

export const CellItemsSection: React.FC = () => {
    const definition = useMemo(() => buildCellItemsDefinition(), []);
    return (
        <LiveExampleViewer
            title="4 · Multi-item Cells + Click Actions"
            description="Order ids are drill-able — clicking one writes Variables.selectedOrder. Status cells use conditional formatting based on the status value."
            definition={definition}
            highlights={highlights}
            height={560}
        />
    );
};
