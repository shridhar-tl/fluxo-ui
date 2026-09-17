export { PdfDocument, PathBuilder, sanitizeUrl } from './core/pdf-document';
export type {
    DocumentMetadata,
    DocumentOptions,
    HorizontalAlign,
    ImageOptions,
    LinkOptions,
    OutlineEntry,
    PageOptions,
    ShapeStyle,
    TextOptions,
    TextStyle,
    VerticalAlign,
} from './core/document-types';

export {
    fromPoints,
    horizontalInsets,
    listPageSizePresets,
    normalizeEdgeInsets,
    resolvePageSize,
    toPoints,
    unitScale,
    verticalInsets,
} from './core/geometry';
export type {
    EdgeInsets,
    EdgeInsetsInput,
    LengthUnit,
    NamedPageSize,
    PageOrientation,
    PageSizeInput,
    Point,
    Rect,
    Size,
} from './core/geometry';

export { colorToHex, contrastRatio, hslToRgb, parseColor, readableTextColor, relativeLuminance } from './core/color';
export type { ColorInput, RgbColor, RgbaColor } from './core/color';

export { drawGrid } from './table/draw-grid';
export { listGridPresets } from './table/grid-presets';
export type {
    CellDefinition,
    CellRenderContext,
    CellSpec,
    CellStyle,
    CellValue,
    ColumnDefinition,
    GridCallbacks,
    GridLayoutOptions,
    GridOptions,
    GridPalette,
    GridPresetName,
    GridResult,
    GridSection,
    PageRenderContext,
    RepeatOptions,
    ResolvedCell,
    ResolvedColumn,
    ResolvedRow,
    RowDefinition,
    SectionStyles,
} from './table/table-types';

export { FlowComposer, createFlow } from './layout/flow-composer';
export type { FlowOptions } from './layout/flow-composer';

export { applyFooterBand, applyHeaderBand, applyWatermark, stampPageNumbers } from './layout/page-furniture';
export type { RunningBandOptions, RunningTextSlot, WatermarkOptions } from './layout/page-furniture';

export {
    createObjectUrl,
    openPdfInNewTab,
    pdfMimeType,
    printPdf,
    savePdf,
    toArrayBuffer,
    toBase64,
    toBlob,
    toDataUrl,
} from './output/document-output';

export { listStandardFonts, resolveStandardFontId } from './text/standard-metrics';
export type { FontSelector, StandardFontId } from './text/standard-metrics';

export { decodeImage, detectImageFormat } from './graphics/image-data';
export type { DecodedImage, ImageFormat, ImageSource } from './graphics/image-data';
