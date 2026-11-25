import React, { memo } from 'react';

import cn from 'classnames';

import type { TreeTableColumn, TreeTableRowData } from './tree-table-types';
import { formatAggregate } from './tree-table-utils';
import type { ColumnLayout } from './useTreeTableColumns';

interface TreeTableFooterProps<T extends TreeTableRowData> {
    layout: ColumnLayout<T>;
    roots: T[];
    rowIndex: number;
    aggregate: (rows: T[], column: TreeTableColumn<T>) => number | null;
}

function TreeTableFooterInner<T extends TreeTableRowData>({ layout, roots, rowIndex, aggregate }: TreeTableFooterProps<T>) {
    return (
        <div role="row" className="eui-tree-table-footer-row" aria-rowindex={rowIndex}>
            {layout.columns.map((entry) => {
                const { column } = entry;
                let content: React.ReactNode = null;
                if (typeof column.footer === 'function') {
                    content = column.footer({ column, rows: roots, aggregate: column.aggregate ? aggregate(roots, column) : null });
                } else if (column.footer !== undefined) {
                    content = column.footer;
                } else if (column.aggregate) {
                    const value = aggregate(roots, column);
                    content = column.format ? column.format(value, roots[0]) : formatAggregate(value);
                }
                return (
                    <div
                        key={entry.key}
                        role="gridcell"
                        aria-colindex={entry.index + 1}
                        className={cn('eui-tree-table-footer-cell', `eui-tree-table-align-${column.align ?? 'left'}`, {
                            'eui-tree-table-cell-frozen': entry.frozen,
                            'eui-tree-table-cell-frozen-left': entry.frozen === 'left',
                            'eui-tree-table-cell-frozen-right': entry.frozen === 'right',
                            'eui-tree-table-cell-frozen-edge-left': entry.isLastLeftFrozen,
                            'eui-tree-table-cell-frozen-edge-right': entry.isFirstRightFrozen,
                        })}
                        style={entry.stickyStyle}
                    >
                        <div className="eui-tree-table-cell-content">{content}</div>
                    </div>
                );
            })}
        </div>
    );
}

export const TreeTableFooter = memo(TreeTableFooterInner) as <T extends TreeTableRowData>(props: TreeTableFooterProps<T>) => React.ReactElement;
