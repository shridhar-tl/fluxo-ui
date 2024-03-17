import classNames from 'classnames';
import { useState } from 'react';
import { ShimmerTable } from '../shimmer';
import { Column, OnChangeParams } from './table-types';
import TableBody from './TableBody';
import TableFooter from './TableFooter';
import TableHeader from './TableHeader';
import useSortedData from './useSortedData';
import './table.scss';

const defaultRowCounts = [10, 20, 25, 50, 75, 100];

function Table({
    id,
    isLoading,
    expectedRows,
    columns,
    rows,
    totalRows,
    page,
    sortColumn: colToSort,
    sortAsc: isAsc,
    onSort,
    onChange,
    noRowsMessage,
    rowsPerPage,
    rowCounts = defaultRowCounts,
    pagination,
    containerClassName,
    onRowClick,
    bordered,
    striped,
    compact,
    comfortable,
    borderless,
    hoverable,
    cardStyle,
    minimalHeader,
    stickyHeader,
}: TableProps) {
    const [sortColumn, setSortColumn] = useState<Column | undefined>(colToSort);
    const [sortAsc, setSortAsc] = useState<boolean>(isAsc ?? true);
    const [currentPage, setCurrentPage] = useState<number>(page || 1);
    const [count, setCount] = useState<number>(rowsPerPage ?? rowCounts[0]);

    const totalPages = Math.ceil(totalRows / count);

    const sortedRows = useSortedData(rows, sortColumn?.field as string, sortAsc, totalRows === rows?.length);

    const isClientSidePagination = totalRows === rows?.length;
    const paginatedRows = isClientSidePagination
        ? sortedRows.slice((currentPage - 1) * count, currentPage * count)
        : sortedRows;

    if (isLoading) {
        return <ShimmerTable columns={columns?.length} rows={expectedRows} />;
    }

    const handleSort = (col: Column) => {
        if (!col.sortable) return;
        let asc = true;
        if (sortColumn && sortColumn.field === col.field) {
            asc = !sortAsc;
        }
        setSortColumn(col);
        setSortAsc(asc);
        if (onSort) {
            onSort(col, asc);
        }
        if (onChange) {
            onChange({ sortColumn: col, sortAsc: asc, count, pageNumber: currentPage });
        }
    };

    const handleChangeRowsCount = (newCount: number) => {
        setCount(newCount);
        setCurrentPage(1);
        if (onChange) {
            onChange({ sortColumn: sortColumn || undefined, sortAsc, count: newCount, pageNumber: 1 });
        }
    };

    const goToPage = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
        if (onChange) {
            onChange({ sortColumn: sortColumn || undefined, sortAsc, count, pageNumber: page });
        }
    };

    const tableClasses = classNames('eui-table', {
        'eui-table-bordered': bordered,
        'eui-table-striped': striped,
        'eui-table-compact': compact,
        'eui-table-comfortable': comfortable,
        'eui-table-borderless': borderless,
        'eui-table-hoverable': hoverable,
        'eui-table-card': cardStyle,
        'eui-table-minimal-header': minimalHeader,
        'eui-table-sticky-header': stickyHeader,
    });

    return (
        <div id={id} className={classNames('eui-table-container', containerClassName)}>
            <table className={tableClasses}>
                <TableHeader columns={columns} sortColumn={sortColumn} sortAsc={sortAsc} onSort={handleSort} />
                <TableBody columns={columns} rows={paginatedRows} noRowsMessage={noRowsMessage} onRowClick={onRowClick} />
                {pagination !== false && (
                    <TableFooter
                        columns={columns}
                        pageIndex={currentPage}
                        rowsCount={count}
                        rowsCounts={rowCounts}
                        totalPages={totalPages}
                        onChangeCount={handleChangeRowsCount}
                        onNavigate={goToPage}
                    />
                )}
            </table>
        </div>
    );
}

export default Table;

export type TableProps = {
    id?: string;
    isLoading?: boolean;
    expectedRows?: number;
    columns: Column[];
    rows: any[];
    totalRows: number;
    onSort?: (column: Column, asc: boolean) => void;
    onChange?: (params: OnChangeParams) => void;
    noRowsMessage?: string;
    rowCounts?: number[];
    rowsPerPage?: number;
    sortColumn?: Column;
    sortAsc?: boolean;
    page?: number;
    pagination?: boolean;
    containerClassName?: string;
    onRowClick?: (arg: { row: any; index: number; event: any }) => void;
    bordered?: boolean;
    striped?: boolean;
    compact?: boolean;
    comfortable?: boolean;
    borderless?: boolean;
    hoverable?: boolean;
    cardStyle?: boolean;
    minimalHeader?: boolean;
    stickyHeader?: boolean;
};
