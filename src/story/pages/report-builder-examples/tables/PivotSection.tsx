import React, { useMemo } from 'react';
import { LiveExampleViewer, type ExpressionHighlight } from '../shared/LiveExampleViewer';
import { buildPivotDefinition } from './definitions/pivot-definition';

const highlights: ExpressionHighlight[] = [
    {
        label: 'Turn pivot mode on',
        expression: 'pivotMode: true, pivotRowField: "region", pivotColumnField: "category", pivotValueField: "revenue", pivotAggregation: "sum"',
        explanation:
            'Four fields configure pivot: the row axis, the column axis, the value, and the aggregation (sum/count/avg/min/max). Columns are built from the distinct values of pivotColumnField.',
    },
];

export const PivotSection: React.FC = () => {
    const definition = useMemo(() => buildPivotDefinition(), []);
    return (
        <LiveExampleViewer
            title="6 · Pivot Mode"
            description="Region rows × Category columns × Sum(revenue). The renderer builds the column matrix from the data at render time."
            definition={definition}
            highlights={highlights}
            height={400}
        />
    );
};
