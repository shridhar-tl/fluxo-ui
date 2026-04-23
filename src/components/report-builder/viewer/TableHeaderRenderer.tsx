import React from 'react';
import { flattenColumns, getColumnTreeDepth, getLeafCountForNode, isGroupColumn, isLeafColumn } from '../table-helpers';
import type { TableColumnNode } from '../report-definition-types';

export interface HeaderCell {
    id: string;
    label: string;
    colSpan: number;
    rowSpan: number;
    align?: 'left' | 'center' | 'right';
    isLeaf: boolean;
    leafId?: string;
}

export function buildHeaderMatrix(tree: TableColumnNode[]): HeaderCell[][] {
    const totalDepth = getColumnTreeDepth(tree);
    if (totalDepth === 0) return [];
    const rows: HeaderCell[][] = Array.from({ length: totalDepth }, () => []);
    walk(tree, rows, 0, totalDepth);
    return rows;
}

function walk(
    nodes: TableColumnNode[],
    rows: HeaderCell[][],
    rowIndex: number,
    totalDepth: number,
): void {
    for (const node of nodes) {
        if (isLeafColumn(node)) {
            const remainingRows = totalDepth - rowIndex;
            rows[rowIndex].push({
                id: node.id,
                label: node.label || node.field,
                colSpan: 1,
                rowSpan: remainingRows,
                align: node.align,
                isLeaf: true,
                leafId: node.id,
            });
        } else if (isGroupColumn(node)) {
            const leafCount = getLeafCountForNode(node);
            rows[rowIndex].push({
                id: node.id,
                label: node.label,
                colSpan: leafCount,
                rowSpan: 1,
                align: 'center',
                isLeaf: false,
            });
            walk(node.children, rows, rowIndex + 1, totalDepth);
        }
    }
}

interface Props {
    tree: TableColumnNode[];
    headerBg: string;
    headerColor: string;
    cellBorder: string;
    renderLeafHeader: (columnId: string, label: string, align?: 'left' | 'center' | 'right') => React.ReactNode;
}

export const NestedTableHeader: React.FC<Props> = ({
    tree,
    headerBg,
    headerColor,
    cellBorder,
    renderLeafHeader,
}) => {
    const matrix = React.useMemo(() => buildHeaderMatrix(tree), [tree]);
    const leafColumns = React.useMemo(() => flattenColumns(tree), [tree]);

    if (leafColumns.length === 0) return null;

    return (
        <thead>
            {matrix.map((row, ri) => (
                <tr key={ri}>
                    {row.map((cell) => {
                        if (cell.isLeaf) {
                            return (
                                <React.Fragment key={cell.id}>
                                    {renderLeafHeader(cell.leafId!, cell.label, cell.align)}
                                </React.Fragment>
                            );
                        }
                        return (
                            <th
                                key={cell.id}
                                colSpan={cell.colSpan}
                                rowSpan={cell.rowSpan}
                                style={{
                                    padding: '6px 10px',
                                    fontWeight: 600,
                                    fontSize: 11,
                                    background: headerBg,
                                    color: headerColor,
                                    borderBottom: cellBorder,
                                    borderRight: cellBorder,
                                    textAlign: 'center',
                                }}
                            >
                                {cell.label}
                            </th>
                        );
                    })}
                </tr>
            ))}
        </thead>
    );
};
