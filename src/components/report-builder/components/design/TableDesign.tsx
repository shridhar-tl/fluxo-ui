import React from 'react';
import type { ReportComponent, TableComponentProps } from '../../report-definition-types';
import {
    flattenColumns,
    getEffectiveColumnTree,
} from '../../table-helpers';
import { buildHeaderMatrix } from '../../viewer/TableHeaderRenderer';

interface Props {
    component: ReportComponent;
}

const skeletonBar = (width: string): React.CSSProperties => ({
    height: 10,
    width,
    borderRadius: 4,
    background: 'var(--eui-border-subtle)',
});

export const TableDesign: React.FC<Props> = ({ component }) => {
    const p = component.props as unknown as TableComponentProps;
    const tree = getEffectiveColumnTree(p);
    const leafColumns = flattenColumns(tree);

    if (leafColumns.length === 0) {
        return (
            <div
                style={{
                    padding: '20px 16px',
                    background: 'var(--eui-bg-subtle)',
                    border: '1px dashed var(--eui-border-subtle)',
                    borderRadius: 6,
                    color: 'var(--eui-text-muted)',
                    fontSize: 12,
                    fontStyle: 'italic',
                    textAlign: 'center',
                }}
            >
                Configure table in Properties
            </div>
        );
    }

    const headerMatrix = buildHeaderMatrix(tree);
    const skeletonWidths = ['60%', '45%', '70%', '50%', '55%', '40%'];

    return (
        <div
            style={{
                border: '1px solid var(--eui-border-subtle)',
                borderRadius: 6,
                overflow: 'hidden',
                fontSize: 12,
            }}
        >
            <table
                style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: 12,
                }}
            >
                <thead>
                    {headerMatrix.map((row, ri) => (
                        <tr key={ri}>
                            {row.map((cell) => (
                                <th
                                    key={cell.id}
                                    colSpan={cell.colSpan}
                                    rowSpan={cell.rowSpan}
                                    style={{
                                        padding: '6px 10px',
                                        background: 'var(--eui-bg-subtle)',
                                        color: 'var(--eui-text)',
                                        borderBottom: '1px solid var(--eui-border-subtle)',
                                        borderRight: '1px solid var(--eui-border-subtle)',
                                        textAlign: cell.isLeaf ? cell.align ?? 'left' : 'center',
                                        fontWeight: 600,
                                    }}
                                >
                                    {cell.label}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {[0, 1, 2].map((rowIdx) => (
                        <tr key={rowIdx}>
                            {leafColumns.map((col, colIdx) => (
                                <td
                                    key={col.id}
                                    style={{
                                        padding: '6px 10px',
                                        borderBottom:
                                            rowIdx < 2
                                                ? '1px solid var(--eui-border-subtle)'
                                                : undefined,
                                        textAlign: col.align ?? 'left',
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent:
                                                col.align === 'center'
                                                    ? 'center'
                                                    : col.align === 'right'
                                                        ? 'flex-end'
                                                        : 'flex-start',
                                        }}
                                    >
                                        <div
                                            style={skeletonBar(
                                                skeletonWidths[
                                                    (rowIdx * leafColumns.length + colIdx) %
                                                        skeletonWidths.length
                                                ],
                                            )}
                                        />
                                    </div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            {p.rowGroups && p.rowGroups.length > 0 && (
                <div
                    style={{
                        padding: '6px 10px',
                        borderTop: '1px solid var(--eui-border-subtle)',
                        background: 'var(--eui-bg-subtle)',
                        fontSize: 10,
                        color: 'var(--eui-text-muted)',
                        fontStyle: 'italic',
                    }}
                >
                    Row groups configured: {p.rowGroups.map((g) => g.name).join(', ')}
                </div>
            )}
        </div>
    );
};
