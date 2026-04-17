export type ParameterType =
    | 'text'
    | 'masked-edit'
    | 'numeric'
    | 'date-picker'
    | 'date-range-picker'
    | 'dropdown'
    | 'radio-button'
    | 'multi-select'
    | 'chips'
    | 'checkbox';

export interface ReportMetadata {
    title: string;
    description?: string;
    version: string;
    createdAt: string;
    updatedAt: string;
}

export interface DatasourceConfig {
    id: string;
    name: string;
    type: string;
    config: Record<string, unknown>;
}

export type DerivedTransformType = 'flatten' | 'pick' | 'filter' | 'computed';

export interface DerivedTransformFlatten {
    type: 'flatten';
    childField: string;
}

export interface DerivedTransformPick {
    type: 'pick';
    fields: Array<{ source: string; alias?: string }>;
}

export interface DerivedTransformFilter {
    type: 'filter';
    expression: string;
}

export interface DerivedTransformComputed {
    type: 'computed';
    columns: Array<{ name: string; expression: string }>;
}

export type DerivedTransform =
    | DerivedTransformFlatten
    | DerivedTransformPick
    | DerivedTransformFilter
    | DerivedTransformComputed;

export interface DerivedDatasourceConfig {
    sourceDatasourceId: string;
    transforms: DerivedTransform[];
}

export interface ParameterConfig {
    id: string;
    name: string;
    type: ParameterType;
    label: string;
    description?: string;
    defaultValue?: unknown;
    mandatory: boolean;
    readOnly?: boolean | string;
    hidden?: boolean | string;
    width?: number;
    typeConfig: Record<string, unknown>;
}

export interface TextTypeConfig {
    minLength?: number;
    maxLength?: number;
    placeholder?: string;
    multiline?: boolean;
}

export interface MaskedEditTypeConfig {
    mask: string;
}

export interface NumericTypeConfig {
    min?: number;
    max?: number;
    decimalPlaces?: number;
    step?: number;
}

export interface DatePickerTypeConfig {
    minDate?: string;
    maxDate?: string;
    format?: string;
}

export interface DateRangePickerTypeConfig {
    minDate?: string;
    maxDate?: string;
    format?: string;
}

export interface DropdownTypeConfig {
    options?: SelectOption[];
    datasourceId?: string;
    labelField?: string;
    valueField?: string;
    searchable?: boolean;
}

export interface RadioButtonTypeConfig {
    options?: SelectOption[];
}

export interface MultiSelectTypeConfig {
    options?: SelectOption[];
    datasourceId?: string;
    labelField?: string;
    valueField?: string;
    minItems?: number;
    maxItems?: number;
}

export interface ChipsTypeConfig {
    options?: SelectOption[];
    allowFreeText?: boolean;
    minItems?: number;
    maxItems?: number;
}

export interface CheckboxTypeConfig {
    label?: string;
}

export interface SelectOption {
    label: string;
    value: unknown;
}

export interface HeaderComponentProps {
    level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    content: string;
}

export interface TextComponentProps {
    content: string;
}

export interface ImageComponentProps {
    src: string;
    alt?: string;
    objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
    width?: string;
    height?: string;
}

export interface HorizontalLineComponentProps {
    color?: string;
    thickness?: number;
    marginTop?: number;
    marginBottom?: number;
}

export interface ColumnsComponentProps {
    columnCount: number;
}

export interface CanvasComponentProps {
    width?: string;
    height?: string;
    snapToGrid?: boolean;
    gridSize?: number;
}

export interface CanvasItemLayout {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface TabComponentProps {
    tabs: Array<{ id: string; label: string }>;
    defaultTabId?: string;
}

export interface ConditionalFormat {
    id: string;
    expression: string;
    backgroundColor?: string;
    textColor?: string;
    fontWeight?: 'normal' | 'bold';
    fontStyle?: 'normal' | 'italic';
}

export interface TableColumnDef {
    id: string;
    field: string;
    label: string;
    width?: string;
    align?: 'left' | 'center' | 'right';
    formatExpr?: string;
    frozen?: boolean;
    visible?: boolean | string;
    sortable?: boolean;
    editable?: boolean;
    conditionalFormats?: ConditionalFormat[];
}

export interface TableColumnGroup {
    id: string;
    label: string;
    columnIds: string[];
    visible?: boolean | string;
}

export interface TableComponentProps {
    datasourceId: string;
    columns: TableColumnDef[];
    columnGroups?: TableColumnGroup[];
    groupBy?: string | string[];
    showGroupFooter?: boolean;
    rowVisibleExpr?: string;
    groupVisibleExpr?: string;
    pivotMode?: boolean;
    pivotRowField?: string;
    pivotColumnField?: string;
    pivotValueField?: string;
    pivotAggregation?: 'sum' | 'count' | 'avg' | 'min' | 'max';
    onDrillThrough?: string;
    enableSorting?: boolean;
    enableCellEdit?: boolean;
    enableCopyData?: boolean;
}

export interface SubReportComponentProps {
    subReportId: string;
    parameterMap: Record<string, string>;
}

export type ChartType = 'chart-bar' | 'chart-pie' | 'chart-donut' | 'chart-line';

export interface ChartComponentProps {
    datasourceId: string;
    title?: string;
    showLegend?: boolean;
    xAxisField?: string;
    yAxisField?: string;
    labelField?: string;
    valueField?: string;
    barColor?: string;
    lineColor?: string;
    colors?: string[];
    stacked?: boolean;
    lineTension?: number;
    showPoints?: boolean;
    areaFill?: boolean;
    onDrillThrough?: string;
}

export interface ComponentStyleProps {
    visible?: boolean | string;
    textColor?: string;
    backgroundColor?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    fontStyle?: 'normal' | 'italic';
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    borderColor?: string;
    borderWidth?: number;
    borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted';
    borderRadius?: number;
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    marginTop?: number;
    marginRight?: number;
    marginBottom?: number;
    marginLeft?: number;
    width?: string;
    height?: string;
}

export interface ReportComponent {
    id: string;
    type: string;
    props: Record<string, unknown>;
    styles: ComponentStyleProps;
    children?: ReportComponent[];
}

export interface HeadingStyle {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string;
    color?: string;
    lineHeight?: number;
}

export interface TableStyle {
    headerBackground?: string;
    headerColor?: string;
    footerBackground?: string;
    footerColor?: string;
    alternateRowColor?: string;
    cellBorder?: string;
    bodyColor?: string;
}

export type PageSize = 'A3' | 'A4' | 'A5' | 'Letter' | 'Legal' | 'custom';
export type PageOrientation = 'portrait' | 'landscape';

export interface PageSetup {
    size: PageSize;
    orientation: PageOrientation;
    customWidth?: number;
    customHeight?: number;
    marginTop?: number;
    marginRight?: number;
    marginBottom?: number;
    marginLeft?: number;
}

export interface GlobalStyles {
    fontFamily?: string;
    fontSize?: number;
    textColor?: string;
    headings: Partial<Record<'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6', HeadingStyle>>;
    table: TableStyle;
    pageSetup?: PageSetup;
}

export interface ReportBreakpoint {
    key: string;
    maxWidth: number;
    label: string;
}

export interface ReportDefinition {
    id: string;
    metadata: ReportMetadata;
    datasources: DatasourceConfig[];
    parameters: ParameterConfig[];
    components: ReportComponent[];
    globalStyles: GlobalStyles;
    breakpoints: ReportBreakpoint[];
}

const pageSizesInMm: Record<string, { width: number; height: number }> = {
    A3: { width: 297, height: 420 },
    A4: { width: 210, height: 297 },
    A5: { width: 148, height: 210 },
    Letter: { width: 216, height: 279 },
    Legal: { width: 216, height: 356 },
};

export function getPageDimensionsPx(setup?: PageSetup): { width: number; height: number } {
    const dpi = 96;
    const mmToPx = dpi / 25.4;

    if (!setup) {
        const a4 = pageSizesInMm.A4;
        return { width: Math.round(a4.width * mmToPx), height: Math.round(a4.height * mmToPx) };
    }

    let w: number;
    let h: number;

    if (setup.size === 'custom') {
        w = setup.customWidth ?? 210;
        h = setup.customHeight ?? 297;
    } else {
        const size = pageSizesInMm[setup.size] ?? pageSizesInMm.A4;
        w = size.width;
        h = size.height;
    }

    if (setup.orientation === 'landscape') {
        [w, h] = [h, w];
    }

    return { width: Math.round(w * mmToPx), height: Math.round(h * mmToPx) };
}

export function createEmptyDefinition(title = 'Untitled Report'): ReportDefinition {
    const now = new Date().toISOString();
    return {
        id: crypto.randomUUID(),
        metadata: {
            title,
            version: '1.0.0',
            createdAt: now,
            updatedAt: now,
        },
        datasources: [],
        parameters: [],
        components: [],
        globalStyles: {
            headings: {},
            table: {},
        },
        breakpoints: [
            { key: 'xs', maxWidth: 480, label: 'Mobile' },
            { key: 'sm', maxWidth: 768, label: 'Tablet' },
            { key: 'md', maxWidth: 1024, label: 'Laptop' },
            { key: 'lg', maxWidth: 1440, label: 'Desktop' },
            { key: 'xl', maxWidth: Infinity, label: 'Wide' },
        ],
    };
}
