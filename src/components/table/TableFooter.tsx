import { Dropdown as SelectBox } from '../Dropdown';
import { Column } from './table-types';

type TableFooterProps = {
    columns: Column[];
    rowsCount: number;
    onChangeCount: any;
    rowsCounts: number[];
    pageIndex: number;
    totalPages: number;
    onNavigate: any;
};

function TableFooter({
    columns,
    rowsCount: count,
    pageIndex: currentPage,
    totalPages,
    rowsCounts,
    onChangeCount,
    onNavigate: goToPage,
}: TableFooterProps) {
    const counts = rowsCounts.map((value) => ({ label: value, value }));
    return (
        <tfoot className="eui-table-footer">
            <tr>
                <td colSpan={columns.length}>
                    <div className="eui-table-footer-inner">
                        <div className="eui-table-rows-per-page">
                            <span>Rows per page</span>
                            <SelectBox
                                value={count}
                                options={counts}
                                showClear={false}
                                onChange={(e) => onChangeCount(e.value)}
                            />
                        </div>
                        <div className="eui-table-pagination">
                            <button
                                className="eui-table-nav-btn"
                                onClick={() => goToPage(1)}
                                disabled={currentPage === 1}
                            >
                                «
                            </button>
                            <button
                                className="eui-table-nav-btn"
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                ‹
                            </button>
                            <span className="eui-table-page-info">
                                {currentPage} of {!totalPages ? 1 : totalPages}
                            </span>
                            <button
                                className="eui-table-nav-btn"
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage >= totalPages || !totalPages}
                            >
                                ›
                            </button>
                            <button
                                className="eui-table-nav-btn"
                                onClick={() => goToPage(totalPages)}
                                disabled={currentPage >= totalPages || !totalPages}
                            >
                                »
                            </button>
                        </div>
                    </div>
                </td>
            </tr>
        </tfoot>
    );
}

export default TableFooter;
