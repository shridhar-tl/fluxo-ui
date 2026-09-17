import type { PdfDocument } from '../core/pdf-document';
import { cellBorderWidth } from './grid-layout';
import { resolvePadding } from './grid-model';
import type {
    GridCallbacks,
    ResolvedCell,
    ResolvedColumn,
    ResolvedRow,
    RepeatOptions,
} from './table-types';

export interface RenderInput extends GridCallbacks {
    doc: PdfDocument;
    columns: ResolvedColumn[];
    headRows: ResolvedRow[];
    bodyRows: ResolvedRow[];
    footRows: ResolvedRow[];
    startX: number;
    startY: number;
    bottomLimit: number;
    topLimit: number;
    repeat: Required<RepeatOptions>;
    outerBorderWidth: number;
    outerBorderColor: string | null;
}

export interface RenderOutput {
    finalY: number;
    startPageIndex: number;
    endPageIndex: number;
    rowsDrawn: number;
}

const drawCellBackground = (doc: PdfDocument, cell: ResolvedCell): void => {
    if (!cell.style.background) return;
    doc.drawRectangle(cell.x, cell.y, cell.width, cell.height, { fillColor: cell.style.background });
};

const drawCellBorders = (doc: PdfDocument, cell: ResolvedCell): void => {
    const sides = ['top', 'right', 'bottom', 'left'] as const;
    const color = cell.style.borderColor;

    for (const side of sides) {
        const width = cellBorderWidth(cell, side);
        if (width <= 0) continue;

        const style = { strokeColor: color, lineWidth: width };

        if (side === 'top') {
            doc.drawLine(cell.x, cell.y, cell.x + cell.width, cell.y, style);
        } else if (side === 'bottom') {
            doc.drawLine(cell.x, cell.y + cell.height, cell.x + cell.width, cell.y + cell.height, style);
        } else if (side === 'left') {
            doc.drawLine(cell.x, cell.y, cell.x, cell.y + cell.height, style);
        } else {
            doc.drawLine(cell.x + cell.width, cell.y, cell.x + cell.width, cell.y + cell.height, style);
        }
    }
};

const drawCellText = (doc: PdfDocument, cell: ResolvedCell): void => {
    if (cell.text.length === 0) return;

    const padding = resolvePadding(cell.style);
    const lineHeight = doc.getLineHeight(cell.style.fontSize, cell.style.lineHeightFactor);
    const textHeight = cell.text.length * lineHeight;

    let textY: number;
    if (cell.style.verticalAlign === 'bottom') {
        textY = cell.y + cell.height - padding.bottom - textHeight;
    } else if (cell.style.verticalAlign === 'middle') {
        textY = cell.y + (cell.height - textHeight) / 2;
    } else {
        textY = cell.y + padding.top;
    }

    const innerWidth = cell.width - padding.left - padding.right;
    const textX = cell.x + padding.left;

    doc.drawText(cell.text.join('\n'), textX, textY, {
        font: cell.style.font,
        fontSize: cell.style.fontSize,
        bold: cell.style.bold,
        italic: cell.style.italic,
        color: cell.style.textColor,
        align: cell.style.align,
        maxWidth: innerWidth,
        lineHeightFactor: cell.style.lineHeightFactor,
        baseline: 'top',
    });

    if (cell.href) {
        doc.addLink(textX, textY, innerWidth, textHeight, { url: cell.href });
    }
};

function positionRow(row: ResolvedRow, columns: ResolvedColumn[], startX: number, y: number): void {
    for (const [index, cell] of row.cells) {
        const offset = columns.slice(0, index).reduce((sum, column) => sum + column.width, 0);
        cell.x = startX + offset;
        cell.y = y;
        cell.height = cell.rowSpan > 1 && cell.spannedHeight > 0 ? cell.spannedHeight : row.height;
    }
}

export function renderGrid(input: RenderInput): RenderOutput {
    const { doc, columns, headRows, bodyRows, footRows } = input;

    const startPageIndex = doc.currentPageIndex;
    let cursorY = input.startY;
    let rowsDrawn = 0;
    let pageNumber = 1;

    const tableWidth = columns.reduce((sum, column) => sum + column.width, 0);

    const paintRows = (rows: ResolvedRow[]): void => {
        for (const row of rows) {
            positionRow(row, columns, input.startX, cursorY);

            for (const [index, cell] of row.cells) {
                const column = columns[index];
                if (!column) continue;

                const context = { cell, row, column, pageIndex: doc.currentPageIndex };
                const shouldDraw = input.onCellBeforeDraw?.(context);
                if (shouldDraw === false) continue;

                drawCellBackground(doc, cell);
                drawCellBorders(doc, cell);
                drawCellText(doc, cell);

                input.onCellAfterDraw?.(context);
            }

            cursorY += row.height;
        }
    };

    const footHeight = footRows.reduce((sum, row) => sum + row.height, 0);

    const beginPage = (): void => {
        input.onPageStart?.({
            pageIndex: doc.currentPageIndex,
            pageNumber,
            cursorY,
            tableStartY: input.startY,
        });
    };

    const endPage = (): void => {
        input.onPageEnd?.({
            pageIndex: doc.currentPageIndex,
            pageNumber,
            cursorY,
            tableStartY: input.startY,
        });
    };

    beginPage();

    if (input.repeat.header !== 'never' && headRows.length > 0) {
        paintRows(headRows);
    }

    const shouldRepeatHeader = input.repeat.header === 'everyPage';
    let pageTopY = cursorY;

    for (const row of bodyRows) {
        const remaining = input.bottomLimit - cursorY;
        const reservedFooter = input.repeat.footer === 'everyPage' ? footHeight : 0;

        if (row.height > remaining - reservedFooter && cursorY > pageTopY) {
            if (input.repeat.footer === 'everyPage' && footRows.length > 0) {
                paintRows(footRows);
            }

            endPage();
            doc.addPage();
            pageNumber += 1;
            cursorY = input.topLimit;
            beginPage();

            if (shouldRepeatHeader && headRows.length > 0) {
                paintRows(headRows);
            }
            pageTopY = cursorY;
        }

        paintRows([row]);
        rowsDrawn += 1;
    }

    if (footRows.length > 0 && input.repeat.footer !== 'never') {
        const remaining = input.bottomLimit - cursorY;
        if (footHeight > remaining) {
            endPage();
            doc.addPage();
            pageNumber += 1;
            cursorY = input.topLimit;
            beginPage();
        }
        paintRows(footRows);
    }

    if (input.outerBorderWidth > 0 && input.outerBorderColor) {
        doc.drawRectangle(input.startX, input.startY, tableWidth, cursorY - input.startY, {
            strokeColor: input.outerBorderColor,
            lineWidth: input.outerBorderWidth,
        });
    }

    endPage();

    return {
        finalY: cursorY,
        startPageIndex,
        endPageIndex: doc.currentPageIndex,
        rowsDrawn,
    };
}
