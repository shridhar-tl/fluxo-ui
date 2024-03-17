import classNames from 'classnames';
import { getFieldValue } from '../../utils/common-fns';
import { Column } from './table-types';

type TableBodyProps = {
    columns: Column[];
    rows: any[];
    noRowsMessage?: string;
    onRowClick?: (arg: { row: any; index: number; event: any }) => void;
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

const TableBody = ({ columns, rows, noRowsMessage, onRowClick }: TableBodyProps) => (
    <tbody className="eui-table-body">
        {rows.length === 0 ? (
            <tr>
                <td className="eui-table-empty-row" colSpan={columns.length}>
                    {noRowsMessage || 'No records found.'}
                </td>
            </tr>
        ) : (
            rows.map((row, rowIndex) => (
                <tr
                    key={rowIndex}
                    className={classNames({ 'eui-table-row-clickable': !!onRowClick })}
                    onClick={onRowClick ? (event) => onRowClick({ row, index: rowIndex, event }) : undefined}
                >
                    {columns.map((col, colIndex) => {
                        const cellContent = col.template ? col.template(row) : getFieldValue(row, col.field);
                        const cellText = typeof cellContent === 'string' || typeof cellContent === 'number' ? cellContent : '';
                        return (
                            <td
                                key={colIndex}
                                className={classNames(hideColClass(col.hideBelow), col.cellClassName)}
                                title={cellText.toString()}
                            >
                                {cellContent}
                            </td>
                        );
                    })}
                </tr>
            ))
        )}
    </tbody>
);

export default TableBody;
