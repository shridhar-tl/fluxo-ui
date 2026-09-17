import { parseColor } from '../core/color';
import { normalizeEdgeInsets } from '../core/geometry';
import type { PdfDocument } from '../core/pdf-document';
import { layoutGrid } from './grid-layout';
import { buildSectionRows, inferColumns } from './grid-model';
import { createStyleLayers } from './grid-presets';
import { renderGrid } from './grid-renderer';
import type { GridOptions, GridResult, RepeatOptions, RowDefinition } from './table-types';

const resolveRepeat = (repeat: RepeatOptions | undefined): Required<RepeatOptions> => ({
    header: repeat?.header ?? 'everyPage',
    footer: repeat?.footer ?? 'lastPage',
});

export function drawGrid(doc: PdfDocument, options: GridOptions = {}): GridResult {
    const head: RowDefinition[] = options.head ?? [];
    const body: RowDefinition[] = options.body ?? [];
    const foot: RowDefinition[] = options.foot ?? [];

    const columns = inferColumns(options.columns, head, body, foot);

    const headRows = buildSectionRows(head, columns, (column) => column.header);
    const footRows = buildSectionRows(foot, columns, (column) => column.footer);

    const margin = options.margin
        ? normalizeEdgeInsets(options.margin)
        : doc.margin;

    const pageWidth = doc.pageWidth;
    const pageHeight = doc.pageHeight;

    const maxWidth = pageWidth - margin.left - margin.right;
    const requestedWidth =
        typeof options.width === 'number' ? options.width : options.width === 'auto' ? undefined : maxWidth;

    const layers = createStyleLayers({
        preset: options.preset,
        palette: options.palette,
        styles: options.styles,
    });

    const layout = layoutGrid({
        doc,
        columns,
        head: headRows,
        body,
        foot: footRows,
        layers,
        availableWidth: requestedWidth ?? maxWidth,
        minRowHeight: options.minRowHeight ?? 0,
    });

    const tableWidth = layout.totalWidth;

    let startX = margin.left;
    if (options.align === 'center') {
        startX = margin.left + (maxWidth - tableWidth) / 2;
    } else if (options.align === 'right') {
        startX = pageWidth - margin.right - tableWidth;
    }

    if (options.pageBreak === 'always') {
        doc.addPage();
    }

    const startY = options.startY ?? margin.top;
    const outerColor = parseColor(options.outerBorderColor ?? null);

    const result = renderGrid({
        doc,
        columns: layout.columns,
        headRows: layout.headRows,
        bodyRows: layout.bodyRows,
        footRows: layout.footRows,
        startX,
        startY,
        bottomLimit: pageHeight - margin.bottom,
        topLimit: margin.top,
        repeat: resolveRepeat(options.repeat),
        outerBorderWidth: options.outerBorderWidth ?? 0,
        outerBorderColor: outerColor ? `rgb(${outerColor.r},${outerColor.g},${outerColor.b})` : null,
        onCellResolved: options.onCellResolved,
        onCellBeforeDraw: options.onCellBeforeDraw,
        onCellAfterDraw: options.onCellAfterDraw,
        onPageStart: options.onPageStart,
        onPageEnd: options.onPageEnd,
    });

    return {
        finalY: result.finalY,
        startPageIndex: result.startPageIndex,
        endPageIndex: result.endPageIndex,
        pageCount: result.endPageIndex - result.startPageIndex + 1,
        rowsDrawn: result.rowsDrawn,
    };
}
