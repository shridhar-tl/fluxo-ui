import classNames from 'classnames';
import React from 'react';
import { ChevronDownIcon, ChevronUpIcon, SortIcon } from '../../assets/icons';
import Tooltip from '../tooltip/Tooltip';
import { Column } from './table-types';

type TableHeaderProps = {
    columns: Column[];
    sortColumn?: Column;
    sortAsc: boolean;
    onSort?: (col: Column) => void;
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

const SortIndicator: React.FC<{ ariaSort: 'ascending' | 'descending' | 'none' }> = ({ ariaSort }) => (
    <span className="eui-table-sort-icon" aria-hidden="true">
        {ariaSort === 'ascending' && <ChevronUpIcon />}
        {ariaSort === 'descending' && <ChevronDownIcon />}
        {ariaSort === 'none' && <SortIcon />}
    </span>
);

const TableHeader = ({ columns, sortColumn, sortAsc, onSort }: TableHeaderProps) => (
    <thead className="eui-table-header">
        <tr>
            {columns.map((col, index) => {
                const isSorted = !!col.sortable && sortColumn?.field === col.field;
                const ariaSort: 'ascending' | 'descending' | 'none' = isSorted
                    ? (sortAsc ? 'ascending' : 'descending')
                    : 'none';
                const headerInner = col.sortable ? (
                    <button
                        type="button"
                        className="eui-table-th-sort-btn"
                        onClick={() => onSort?.(col)}
                        aria-label={`Sort by ${col.title}${isSorted ? (sortAsc ? ', currently ascending' : ', currently descending') : ''}`}
                    >
                        <span>{col.title}</span>
                        <SortIndicator ariaSort={ariaSort} />
                        {isSorted && (
                            <span className="eui-visually-hidden">{sortAsc ? '(sorted ascending)' : '(sorted descending)'}</span>
                        )}
                    </button>
                ) : (
                    <span>{col.title}</span>
                );
                const wrappedHeader = col.helpText ? (
                    <Tooltip content={col.helpText}>
                        <span>{headerInner}</span>
                    </Tooltip>
                ) : (
                    headerInner
                );
                return (
                    <th
                        key={index}
                        scope="col"
                        aria-sort={col.sortable ? ariaSort : undefined}
                        className={classNames(
                            {
                                'eui-table-th-sortable': col.sortable,
                                'eui-table-th-sorted': isSorted,
                                ...hideColClass(col.hideBelow),
                            },
                            col.headerClassName
                        )}
                    >
                        {wrappedHeader}
                    </th>
                );
            })}
        </tr>
    </thead>
);

export default TableHeader;
