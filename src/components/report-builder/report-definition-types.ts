export type ParameterType =
    | 'text'
    | 'masked-edit'
    | 'numeric'
    | 'date-picker'
    | 'date-range-picker'
    | 'dropdown'
    | 'autocomplete'
    | 'radio-button'
    | 'multi-select'
    | 'chips'
    | 'checkbox'
    | 'file';

export interface ParameterValidation {
    regex?: string;
    regexMessage?: string;
    keyfilter?: string;
    minValue?: number;
    maxValue?: number;
    minLength?: number;
    maxLength?: number;
    minItems?: number;
    maxItems?: number;
    allowedFileTypes?: string;
    maxFileSize?: number;
}

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
    allowMultiple?: boolean;
    datasetId?: string;
    displayField?: string;
    valueField?: string;
    validation?: ParameterValidation;
}

export type VariableScope = 'global' | 'component';

export interface VariableConfig {
    id: string;
    name: string;
    scope: VariableScope;
    description?: string;
    defaultValueExpression?: string;
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

export interface AutocompleteTypeConfig {
    options?: SelectOption[];
    datasourceId?: string;
    labelField?: string;
    valueField?: string;
    minQueryLength?: number;
    maxSuggestions?: number;
}

export interface FileTypeConfig {
    placeholder?: string;
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
    tooltip?: string;
    anchorId?: string;
}

export interface TextComponentProps {
    content: string;
    tooltip?: string;
}

export interface ImageComponentProps {
    src: string;
    alt?: string;
    tooltip?: string;
    objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
    width?: string;
    height?: string;
    href?: string;
    openInNewTab?: boolean;
}

export interface HorizontalLineComponentProps {
    color?: string;
    thickness?: number;
    marginTop?: number;
    marginBottom?: number;
    style?: 'solid' | 'dashed' | 'dotted';
    label?: string;
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

export type TableCellItemType = 'text' | 'expression' | 'image' | 'menu' | 'field' | 'parameter';

export interface TableCellItem {
    id: string;
    type: TableCellItemType;
    text?: string;
    expression?: string;
    src?: string;
    alt?: string;
    fieldPath?: string;
    parameterName?: string;
    menuId?: string;
    href?: string;
    clickAction?: 'none' | 'link' | 'drill' | 'set-variable';
    drillVariable?: string;
    drillValueExpr?: string;
    setVariableName?: string;
    setVariableValueExpr?: string;
    style?: ComponentStyleProps;
}

export interface TableColumnDef {
    kind?: 'column';
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
    cellItems?: TableCellItem[];
}

export interface TableColumnGroupNode {
    kind: 'group';
    id: string;
    label: string;
    visible?: boolean | string;
    children: TableColumnNode[];
}

export type TableColumnNode = TableColumnDef | TableColumnGroupNode;

export interface TableColumnGroup {
    id: string;
    label: string;
    columnIds: string[];
    visible?: boolean | string;
}

export type TableRowGroupKind = 'parent' | 'details';

export interface TableRowGroup {
    id: string;
    name: string;
    groupKind: TableRowGroupKind;
    datasetId?: string;
    datasetExpression?: string;
    keys?: string[];
    filter?: string;
    sortBy?: string;
    visible?: string;
    variables?: Array<{ key: string; expression: string }>;
    showFooter?: boolean;
    children?: TableRowGroup[];
}

export interface TableExtraRowCell {
    columnId?: string;
    colSpan?: number;
    align?: 'left' | 'center' | 'right';
    textExpression?: string;
    style?: ComponentStyleProps;
}

export interface TableExtraRow {
    id: string;
    cells: TableExtraRowCell[];
}

export interface TableComponentProps {
    datasourceId: string;
    columns: TableColumnDef[];
    columnTree?: TableColumnNode[];
    columnGroups?: TableColumnGroup[];
    rowGroups?: TableRowGroup[];
    headRows?: TableExtraRow[];
    footerRows?: TableExtraRow[];
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

export type RepeaterLayout = 'stack' | 'grid' | 'inline';

export interface RepeaterComponentProps {
    /** Id of the datasource to iterate over. Empty when using datasetExpression. */
    datasourceId?: string;
    /** Full-expression dataset. Used when datasourceId is empty. Must return an array of rows. */
    datasetExpression?: string;
    /** Expression filter evaluated per-row. Row skipped when the result is falsy. */
    filter?: string;
    /** Expression that produces a comparable key. Rows are sorted ascending by it. */
    sortBy?: string;
    /** 'asc' (default) or 'desc'. */
    sortDirection?: 'asc' | 'desc';
    /** Skip the first N rows after sort/filter. Accepts a number or a string expression (=...). */
    offset?: number | string;
    /** Render at most N rows after offset. 0 or undefined means no limit. Accepts a number or a string expression (=...). */
    limit?: number | string;
    /** Layout of the rendered iterations. */
    layout?: RepeaterLayout;
    /** Number of columns when layout is 'grid'. */
    gridColumns?: number;
    /** Pixel gap between iterations. */
    gap?: number;
    /** Optional wrap for 'inline' layout. */
    inlineWrap?: boolean;
    /** Content shown when the dataset is empty / all rows filtered out. */
    emptyMessage?: string;
    /** Hide the whole repeater block when empty. Overrides emptyMessage. */
    hideWhenEmpty?: boolean;
    /** Separator rendered between iterations. */
    separator?: 'none' | 'line' | 'gap';
    /** Repeat each iteration with an alternating background. */
    alternateRowBackground?: boolean;
}

export type ChartType =
    | 'chart-bar'
    | 'chart-horizontal-bar'
    | 'chart-stacked-bar'
    | 'chart-pie'
    | 'chart-donut'
    | 'chart-line'
    | 'chart-area'
    | 'chart-polar-area'
    | 'chart-radar'
    | 'chart-scatter'
    | 'chart-bubble';

export type LegendPosition = 'top' | 'bottom' | 'left' | 'right';
export type LegendAlign = 'start' | 'center' | 'end';
export type TitleAlign = 'start' | 'center' | 'end';
export type PointStyle =
    | 'circle'
    | 'cross'
    | 'crossRot'
    | 'dash'
    | 'line'
    | 'rect'
    | 'rectRounded'
    | 'rectRot'
    | 'star'
    | 'triangle';

export interface ChartSeriesConfig {
    id: string;
    label?: string;
    valueField: string;
    color?: string;
    /** Line-only: override tension, pointStyle, borderWidth per series. */
    borderWidth?: number;
    pointStyle?: PointStyle;
    /** Bubble-only: field holding the radius for each point. */
    radiusField?: string;
    /** Scatter/bubble: x-axis numeric field (overrides the top-level xAxisField). */
    xField?: string;
    /** Scatter/bubble: y-axis numeric field (overrides the top-level yAxisField). */
    yField?: string;
}

export interface ChartAxisConfig {
    title?: string;
    display?: boolean;
    gridDisplay?: boolean;
    gridColor?: string;
    tickColor?: string;
    beginAtZero?: boolean;
    min?: number;
    max?: number;
    /** Numeric-axis value formatter hint: 'number' | 'currency' | 'percent' | 'short'. */
    format?: 'number' | 'currency' | 'percent' | 'short';
    currencySymbol?: string;
    decimals?: number;
}

export interface ChartComponentProps {
    datasourceId: string;

    // ── Content ─────────────────────────────────────────────────────────────
    title?: string;
    subtitle?: string;
    titleAlign?: TitleAlign;
    titleColor?: string;
    titleFontSize?: number;

    // ── Field mappings ──────────────────────────────────────────────────────
    xAxisField?: string;
    yAxisField?: string;
    labelField?: string;
    valueField?: string;
    /** Used by bar/line/area charts: pivots values per unique value of this field into separate series. */
    seriesField?: string;

    // ── Aggregation ─────────────────────────────────────────────────────────
    /**
     * How to aggregate multiple rows that share the same x/label value.
     * Default: 'sum' for bar/line/area/pie/donut/polar/radar; 'none' for scatter/bubble.
     * Use 'none' for a chart where each row is already its own data point (pre-aggregated).
     */
    aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'none';

    // ── Multi-series (explicit series override) ─────────────────────────────
    series?: ChartSeriesConfig[];

    // ── Colors / palette ────────────────────────────────────────────────────
    barColor?: string;
    lineColor?: string;
    colors?: string[];

    // ── Cartesian options ───────────────────────────────────────────────────
    stacked?: boolean;
    xAxis?: ChartAxisConfig;
    yAxis?: ChartAxisConfig;
    rAxis?: ChartAxisConfig;

    // ── Line / Area ─────────────────────────────────────────────────────────
    lineTension?: number;
    showPoints?: boolean;
    areaFill?: boolean;
    pointStyle?: PointStyle;
    pointRadius?: number;
    lineBorderWidth?: number;

    // ── Bar ─────────────────────────────────────────────────────────────────
    barBorderRadius?: number;
    barBorderWidth?: number;
    barBorderColor?: string;
    barPercentage?: number;
    categoryPercentage?: number;

    // ── Pie / Donut / Polar ─────────────────────────────────────────────────
    cutoutPercent?: number;
    rotation?: number;
    borderWidth?: number;
    borderColor?: string;

    // ── Bubble ──────────────────────────────────────────────────────────────
    radiusField?: string;
    radiusScale?: number;

    // ── Legend ──────────────────────────────────────────────────────────────
    showLegend?: boolean;
    legendPosition?: LegendPosition;
    legendAlign?: LegendAlign;
    legendFontSize?: number;
    legendBoxWidth?: number;

    // ── Tooltip ─────────────────────────────────────────────────────────────
    tooltipEnabled?: boolean;
    tooltipMode?: 'nearest' | 'index' | 'point' | 'dataset';
    tooltipIntersect?: boolean;
    tooltipValueFormat?: 'number' | 'currency' | 'percent' | 'short';

    // ── Data labels ─────────────────────────────────────────────────────────
    showDataLabels?: boolean;
    dataLabelColor?: string;
    dataLabelFormat?: 'number' | 'currency' | 'percent' | 'short';
    dataLabelDecimals?: number;

    // ── Sizing / behaviour ──────────────────────────────────────────────────
    height?: number;
    aspectRatio?: number;
    animate?: boolean;

    // ── Drill-through / visibility ──────────────────────────────────────────
    onDrillThrough?: string;
    hidden?: string;
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
    variables?: VariableConfig[];
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
    variables: VariableConfig[];
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
        variables: [],
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
