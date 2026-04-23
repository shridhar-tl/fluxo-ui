import React, { useMemo } from 'react';
import { LiveExampleViewer, type ExpressionHighlight } from '../shared/LiveExampleViewer';
import { buildHeadFooterDefinition } from './definitions/head-footer-definition';

const highlights: ExpressionHighlight[] = [
    {
        label: 'Head banner cell',
        expression:
            "Concat('As of ', FormatDate(Today(), 'YYYY-MM-DD'), ' — ', Count(Datasources.orders.id), ' orders, ', FormatCurrency(Sum(Datasources.orders.revenue), '$', 0), ' total revenue')",
        explanation:
            'Inside a headRow cell, textExpression is evaluated once against the top-level context — not per row. Use it for dynamic banners, context lines, as-of dates.',
    },
    {
        label: 'Spanned totals row',
        expression: "colSpan: 3, align: 'right', textExpression: \"'Totals'\"",
        explanation:
            'colSpan collapses several columns into one cell. Fill from the left with label cells, then right-align the numeric totals under their columns.',
    },
    {
        label: 'Multiple footer rows',
        expression: '[ { id: "ft-totals", … }, { id: "ft-avg", … } ]',
        explanation:
            'Extra rows are just an array — you can stack as many as you need. Order is preserved top-to-bottom.',
    },
];

export const HeadFooterSection: React.FC = () => {
    const definition = useMemo(() => buildHeadFooterDefinition(), []);
    return (
        <LiveExampleViewer
            title="5 · Head & Footer Rows"
            description="Dynamic banner up top; Totals and Averages rows at the bottom, each powered by aggregate expressions."
            definition={definition}
            highlights={highlights}
            height={520}
        />
    );
};
