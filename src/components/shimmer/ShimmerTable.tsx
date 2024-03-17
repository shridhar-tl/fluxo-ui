import classNames from 'classnames';
import React from 'react';
import ShimmerDiv from './ShimmerDiv';

export interface ShimmerTableProps extends React.HTMLAttributes<HTMLDivElement> {
    rows?: number;
    columns?: number;
    className?: string;
    headerRowClassName?: string;
    headerCellClassName?: string;
    dataRowClassName?: string;
    dataCellClassName?: string;
}

function ShimmerTable({
    rows = 5,
    columns = 8,
    className,
    headerRowClassName,
    headerCellClassName,
    dataRowClassName,
    dataCellClassName,
    ...rest
}: ShimmerTableProps) {
    const headerCells = Array.from({ length: columns });
    const dataRows = Array.from({ length: rows });
    const gridStyle = { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` };

    return (
        <div className={classNames('eui-shimmer-table', className)} {...rest}>
            <div className={classNames('eui-shimmer-table-header-row', headerRowClassName)} style={gridStyle}>
                {headerCells.map((_, index) => (
                    <div key={index} className={classNames('eui-shimmer-table-header-cell', headerCellClassName)}>
                        <ShimmerDiv className="h-4 w-full rounded" level={3} />
                    </div>
                ))}
            </div>
            {dataRows.map((_, rowIndex) => (
                <div
                    key={rowIndex}
                    className={classNames('eui-shimmer-table-data-row', dataRowClassName)}
                    style={gridStyle}
                >
                    {headerCells.map((_, cellIndex) => (
                        <div key={cellIndex} className={classNames('eui-shimmer-table-data-cell', dataCellClassName)}>
                            <ShimmerDiv className="h-3 w-full rounded" />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

export default ShimmerTable;
