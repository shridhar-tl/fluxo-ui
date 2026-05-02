import classNames from 'classnames';
import React from 'react';
import { getFieldValue } from '../../utils/common-fns';
import { Column } from './table-types';

type TableBodyProps = {
    columns: Column[];
    rows: any[];
    noRowsMessage?: string;
    onRowClick?: (arg: { row: any; index: number; event: React.MouseEvent | React.KeyboardEvent }) => void;
    keyField?: string;
};

const hideColClass = (hideBelow: Column['hideBelow']) => {
    if (!hideBelow) return null;
    return {
        'eui-table-col-hidden': true,
        'eui-table-col-xs': hideBelow === 'xs',
        'eui-table-col-sm': hideBelow === 'sm',
        'eui-table-col-md': hideBelow === 'md',
        'eui-table-col-lg': hideBelow === 'lg' || hideBelow === 'mlg',
        'eui-table-col-xl': hideBelow === 'xl',
        'eui-table-col-2xl': hideBelow === '2xl' || hideBelow === '3xl',
    };
};

const TableBody = ({ columns, rows, noRowsMessage, onRowClick, keyField }: TableBodyProps) => (
    <tbody className="eui-table-body">
        {rows.length === 0 ? (
            <tr>
                <td className="eui-table-empty-row" colSpan={columns.length}>
                    {noRowsMessage || 'No records found.'}
                </td>
            </tr>
        ) : (
            rows.map((row, rowIndex) => {
                const rowKey = keyField && row[keyField] !== undefined ? String(row[keyField]) : `row-${rowIndex}`;
                const isClickable = !!onRowClick;
                const handleRowKeyDown = isClickable
                    ? (event: React.KeyboardEvent<HTMLTableRowElement>) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              onRowClick?.({ row, index: rowIndex, event });
                          }
                      }
                    : undefined;
                return (
                    <tr
                        key={rowKey}
                        className={classNames({ 'eui-table-row-clickable': isClickable })}
                        role={isClickable ? 'button' : undefined}
                        tabIndex={isClickable ? 0 : undefined}
                        onClick={isClickable ? (event) => onRowClick?.({ row, index: rowIndex, event }) : undefined}
                        onKeyDown={handleRowKeyDown}
                    >
                        {columns.map((col, colIndex) => {
                            const cellContent = col.template ? col.template(row) : getFieldValue(row, col.field);
                            const isStringLike = typeof cellContent === 'string' || typeof cellContent === 'number';
                            const titleValue = isStringLike ? String(cellContent) : undefined;
                            return (
                                <td
                                    key={colIndex}
                                    className={classNames(hideColClass(col.hideBelow), col.cellClassName)}
                                    title={titleValue}
                                    data-label={col.title}
                                >
                                    {cellContent}
                                </td>
                            );
                        })}
                    </tr>
                );
            })
        )}
    </tbody>
);

export default TableBody;
