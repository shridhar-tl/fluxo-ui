import React, { useMemo } from 'react';
import { LiveExampleViewer, type ExpressionHighlight } from '../shared/LiveExampleViewer';
import { buildRowGroupsDefinition } from './definitions/row-groups-definition';

const highlights: ExpressionHighlight[] = [
    {
        label: 'Per-bucket variable',
        expression: "Sum(RowGroup('regionGroup').values, 'revenue')",
        explanation:
            'RowGroup("name").values is the rows currently in that bucket. The variable is computed once per bucket and cached in the GroupFrame — use it from column formatExprs to avoid re-summing on every cell.',
    },
    {
        label: '% of region — use the cached variable',
        expression:
            "FormatPercent(Field.revenue / IIf(RowGroup('regionGroup').Variables.regionTotal > 0, RowGroup('regionGroup').Variables.regionTotal, 1), 1)",
        explanation:
            'Read the per-bucket variable through RowGroup("name").Variables.<key>. The IIf guard avoids divide-by-zero on empty buckets.',
    },
    {
        label: 'Details rows',
        expression: "{ groupKind: 'details' }",
        explanation:
            'A details group renders the individual rows of its parent bucket. Put it at the end of a row-group chain to get "parent → parent → rows".',
    },
];

export const RowGroupsSection: React.FC = () => {
    const definition = useMemo(() => buildRowGroupsDefinition(), []);
    return (
        <LiveExampleViewer
            title="3 · Multi-level Row Groups"
            description="Region → Category → orders. Each parent renders a collapsible row; per-bucket variables feed the column formats and group footers."
            definition={definition}
            highlights={highlights}
            height={600}
        />
    );
};
