import React, { useMemo } from 'react';
import { LiveExampleViewer, type ExpressionHighlight } from '../shared/LiveExampleViewer';
import { buildColumnGroupsDefinition } from './definitions/column-groups-definition';

const highlights: ExpressionHighlight[] = [
    {
        label: 'Column tree structure',
        expression: '{ kind: "group", label: "Personal", children: [ { kind: "column", … } ] }',
        explanation:
            'columnTree is a recursive list of column nodes. A group node has children and contributes a header cell that spans all its descendant columns. Column nodes are the leaves.',
    },
    {
        label: 'Filter with rowVisibleExpr',
        expression: '!Parameters.onlyActive || Field.active',
        explanation:
            'rowVisibleExpr runs per row. Here it reads a parameter (Parameters.onlyActive) and keeps the row only when the filter is off or the record is active.',
    },
];

export const ColumnGroupsSection: React.FC = () => {
    const definition = useMemo(() => buildColumnGroupsDefinition(), []);
    return (
        <LiveExampleViewer
            title="2 · Nested Column Headers"
            description="Three top-level groups — Personal, Role, Compensation — rendered via colSpan/rowSpan in the header matrix."
            definition={definition}
            highlights={highlights}
            height={520}
        />
    );
};
