import type { CellSpec, ColumnDefinition, RowDefinition } from '../table/table-types';
import { isElementVisible, readCellStyle } from './dom-style-reader';

export interface ExtractOptions {
    includeHidden?: boolean;
    inheritStyles?: boolean;
    ignoreColors?: boolean;
    view?: Window;
    skipColumns?: number[];
    includeRow?: (row: HTMLTableRowElement) => boolean;
    includeCell?: (cell: HTMLTableCellElement) => boolean;
    transformText?: (text: string, element: HTMLTableCellElement) => string;
}

export interface ExtractedTable {
    columns: ColumnDefinition[];
    head: RowDefinition[];
    body: RowDefinition[];
    foot: RowDefinition[];
}

const blockLevelTags = new Set([
    'ADDRESS',
    'ARTICLE',
    'ASIDE',
    'BLOCKQUOTE',
    'DIV',
    'DL',
    'DT',
    'DD',
    'FIELDSET',
    'FIGCAPTION',
    'FIGURE',
    'FOOTER',
    'FORM',
    'H1',
    'H2',
    'H3',
    'H4',
    'H5',
    'H6',
    'HEADER',
    'HR',
    'LI',
    'MAIN',
    'NAV',
    'OL',
    'P',
    'PRE',
    'SECTION',
    'TABLE',
    'UL',
]);

function collectText(node: Node, output: string[]): void {
    if (node.nodeType === 3) {
        output.push(node.nodeValue ?? '');
        return;
    }

    if (node.nodeType !== 1) return;

    const element = node as Element;
    const tagName = element.tagName;

    if (tagName === 'BR') {
        output.push('\n');
        return;
    }

    if (tagName === 'SCRIPT' || tagName === 'STYLE' || tagName === 'TEMPLATE' || tagName === 'NOSCRIPT') {
        return;
    }

    const isBlock = blockLevelTags.has(tagName);
    if (isBlock && output.length > 0) output.push('\n');

    for (let index = 0; index < element.childNodes.length; index += 1) {
        collectText(element.childNodes[index], output);
    }

    if (isBlock) output.push('\n');
}

export function readCellText(cell: HTMLTableCellElement): string {
    const parts: string[] = [];
    collectText(cell, parts);

    return parts
        .join('')
        .replace(/ /g, ' ')
        .split('\n')
        .map((line) => line.replace(/[^\S ]+/g, ' ').trim())
        .filter((line, index, all) => line.length > 0 || (index > 0 && index < all.length - 1))
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function resolveView(options: ExtractOptions, table: HTMLTableElement): Window {
    if (options.view) return options.view;

    const ownerView = table.ownerDocument?.defaultView;
    if (ownerView) return ownerView;

    throw new Error('Unable to resolve a window for the supplied table element.');
}

function extractRow(
    row: HTMLTableRowElement,
    options: ExtractOptions,
    view: Window,
): CellSpec[] | null {
    if (!options.includeHidden && !isElementVisible(row, view)) return null;
    if (options.includeRow && !options.includeRow(row)) return null;

    const cells: CellSpec[] = [];
    const skip = new Set(options.skipColumns ?? []);

    for (let index = 0; index < row.cells.length; index += 1) {
        const cell = row.cells[index];
        if (skip.has(index)) continue;
        if (!options.includeHidden && !isElementVisible(cell, view)) continue;
        if (options.includeCell && !options.includeCell(cell)) continue;

        const rawText = readCellText(cell);
        const text = options.transformText ? options.transformText(rawText, cell) : rawText;

        const anchor = cell.querySelector('a[href]');
        const href = anchor ? (anchor.getAttribute('href') ?? undefined) : undefined;

        cells.push({
            value: text,
            colSpan: cell.colSpan > 1 ? cell.colSpan : undefined,
            rowSpan: cell.rowSpan > 1 ? cell.rowSpan : undefined,
            style: options.inheritStyles
                ? readCellStyle(cell, view, { ignoreColors: options.ignoreColors })
                : undefined,
            href,
        });
    }

    return cells.length > 0 ? cells : null;
}

export function extractTable(
    source: HTMLTableElement | string,
    options: ExtractOptions = {},
): ExtractedTable {
    const element =
        typeof source === 'string'
            ? (options.view ?? globalThis.window)?.document.querySelector<HTMLTableElement>(source)
            : source;

    if (!element) {
        throw new Error(`No table element matched the selector: ${String(source)}`);
    }

    const view = resolveView(options, element);

    const head: RowDefinition[] = [];
    const body: RowDefinition[] = [];
    const foot: RowDefinition[] = [];

    for (let index = 0; index < element.rows.length; index += 1) {
        const row = element.rows[index];
        const extracted = extractRow(row, options, view);
        if (!extracted) continue;

        const sectionTag = row.parentElement?.tagName;
        if (sectionTag === 'THEAD') {
            head.push(extracted);
        } else if (sectionTag === 'TFOOT') {
            foot.push(extracted);
        } else {
            body.push(extracted);
        }
    }

    const columnCount = Math.max(
        ...[...head, ...body, ...foot].map((row) =>
            (row as CellSpec[]).reduce((sum, cell) => sum + (cell.colSpan ?? 1), 0),
        ),
        0,
    );

    const columns: ColumnDefinition[] = Array.from({ length: columnCount }, (_unused, index) => ({ key: index }));

    return { columns, head, body, foot };
}
