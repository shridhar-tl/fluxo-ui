import type { ColorInput } from '../core/color';
import type { EdgeInsetsInput } from '../core/geometry';

export type GridSection = 'header' | 'body' | 'footer';

export type CellValue = string | number | boolean | null | undefined;

export interface CellSpec {
    value?: CellValue;
    colSpan?: number;
    rowSpan?: number;
    style?: Partial<CellStyle>;
    href?: string;
}

export type CellDefinition = CellValue | CellSpec;

export type RowDefinition = CellDefinition[] | Record<string, CellDefinition>;

export interface ColumnDefinition {
    key: string | number;
    header?: CellValue;
    footer?: CellValue;
    width?: number | 'auto' | 'shrink';
    minWidth?: number;
    maxWidth?: number;
    style?: Partial<CellStyle>;
    headerStyle?: Partial<CellStyle>;
    footerStyle?: Partial<CellStyle>;
    format?: (value: CellValue, rowIndex: number) => string;
}

export type BorderWidths = number | Partial<Record<'top' | 'right' | 'bottom' | 'left', number>>;

export interface CellStyle {
    font: string;
    fontSize: number;
    bold: boolean;
    italic: boolean;
    textColor: ColorInput;
    background: ColorInput;
    borderColor: ColorInput;
    borderWidth: BorderWidths;
    padding: EdgeInsetsInput;
    align: 'left' | 'center' | 'right';
    verticalAlign: 'top' | 'middle' | 'bottom';
    minHeight: number;
    lineHeightFactor: number;
    overflow: 'wrap' | 'ellipsis' | 'clip' | 'shrink';
    maxLines?: number;
}

export interface GridPalette {
    headerBackground?: ColorInput;
    headerTextColor?: ColorInput;
    bodyBackground?: ColorInput;
    bodyTextColor?: ColorInput;
    footerBackground?: ColorInput;
    footerTextColor?: ColorInput;
    stripeBackground?: ColorInput;
    borderColor?: ColorInput;
}

export type GridPresetName = 'lined' | 'ruled' | 'zebra' | 'minimal' | 'boxed';

export interface SectionStyles {
    all?: Partial<CellStyle>;
    header?: Partial<CellStyle>;
    body?: Partial<CellStyle>;
    footer?: Partial<CellStyle>;
    stripe?: Partial<CellStyle>;
    columns?: Record<string | number, Partial<CellStyle>>;
}

export interface RepeatOptions {
    header?: 'everyPage' | 'firstPage' | 'never';
    footer?: 'everyPage' | 'lastPage' | 'never';
}

export interface GridLayoutOptions {
    startY?: number;
    margin?: EdgeInsetsInput;
    width?: number | 'full' | 'auto';
    align?: 'left' | 'center' | 'right';
    minRowHeight?: number;
    pageBreak?: 'auto' | 'avoid' | 'always';
    outerBorderWidth?: number;
    outerBorderColor?: ColorInput;
    overflowColumns?: 'shrink' | 'paginate';
    repeatedColumns?: (string | number)[];
}

export interface ResolvedCell {
    text: string[];
    style: CellStyle;
    section: GridSection;
    colSpan: number;
    rowSpan: number;
    href?: string;
    rowIndex: number;
    columnIndex: number;
    x: number;
    y: number;
    width: number;
    height: number;
    spannedHeight: number;
    contentWidth: number;
    longestWordWidth: number;
    naturalHeight: number;
}

export interface ResolvedRow {
    cells: Map<number, ResolvedCell>;
    section: GridSection;
    index: number;
    height: number;
    spansPages: boolean;
}

export interface ResolvedColumn {
    key: string | number;
    index: number;
    definition: ColumnDefinition | null;
    width: number;
    naturalWidth: number;
    minWidth: number;
    readableWidth: number;
}

export interface CellRenderContext {
    cell: ResolvedCell;
    row: ResolvedRow;
    column: ResolvedColumn;
    pageIndex: number;
}

export interface PageRenderContext {
    pageIndex: number;
    pageNumber: number;
    cursorY: number;
    tableStartY: number;
}

export interface GridCallbacks {
    onCellResolved?: (context: CellRenderContext) => void;
    onCellBeforeDraw?: (context: CellRenderContext) => boolean | void;
    onCellAfterDraw?: (context: CellRenderContext) => void;
    onPageStart?: (context: PageRenderContext) => void;
    onPageEnd?: (context: PageRenderContext) => void;
}

export interface GridOptions extends GridLayoutOptions, GridCallbacks {
    columns?: ColumnDefinition[];
    head?: RowDefinition[];
    body?: RowDefinition[];
    foot?: RowDefinition[];
    preset?: GridPresetName;
    palette?: GridPalette;
    styles?: SectionStyles;
    repeat?: RepeatOptions;
}

export interface GridResult {
    finalY: number;
    startPageIndex: number;
    endPageIndex: number;
    pageCount: number;
    rowsDrawn: number;
}
