import classNames from 'classnames';
import { Column } from './table-types';

type TableHeaderProps = {
    columns: Column[];
    sortColumn?: Column;
    sortAsc: boolean;
    onSort?: any;
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

const TableHeader = ({ columns, sortColumn, sortAsc, onSort }: TableHeaderProps) => (
    <thead className="eui-table-header">
        <tr>
            {columns.map((col, index) => {
                const isSorted = col.sortable && sortColumn?.field === col.field;
                return (
                    <th
                        key={index}
                        title={col.helpText}
                        className={classNames(
                            {
                                'eui-table-th-sortable': col.sortable,
                                ...hideColClass(col.hideBelow),
                            },
                            col.headerClassName
                        )}
                        onClick={() => onSort(col)}
                    >
                        {col.title}
                        {isSorted && <span className="eui-table-sort-icon">{sortAsc ? '↓' : '↑'}</span>}
                    </th>
                );
            })}
        </tr>
    </thead>
);

export default TableHeader;
