import React, { useMemo } from 'react';
import { LiveExampleViewer, type ExpressionHighlight } from '../shared/LiveExampleViewer';
import { buildBasicsDefinition } from './definitions/basics-definition';

const highlights: ExpressionHighlight[] = [
    {
        label: 'Revenue column format',
        expression: "FormatCurrency(Field.revenue, '$', 0)",
        explanation:
            'formatExpr on a column is an expression evaluated per-row. FormatCurrency takes the value, currency symbol, and decimal places.',
    },
    {
        label: 'Sortable columns',
        expression: 'sortable: true',
        explanation:
            'Per-column flag. enableSorting on the table turns on the click-to-sort behaviour overall; sortable per column says which headers react.',
    },
];

export const BasicsSection: React.FC = () => {
    const definition = useMemo(() => buildBasicsDefinition(), []);
    return (
        <LiveExampleViewer
            title="1 · Basics"
            description="A flat list of columns with sort, resize, reorder, copy-to-clipboard."
            definition={definition}
            highlights={highlights}
            height={480}
        />
    );
};
