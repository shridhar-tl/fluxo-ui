export type DrawTool =
    | 'select'
    | 'arrow'
    | 'line'
    | 'rect'
    | 'circle'
    | 'freehand'
    | 'text'
    | 'balloon'
    | 'step'
    | 'highlighter'
    | 'callout'
    | 'dimension'
    | 'curvedArrow';

export type DrawColor =
    | 'red'
    | 'orange'
    | 'yellow'
    | 'green'
    | 'teal'
    | 'blue'
    | 'purple'
    | 'black'
    | 'white';

export type FontFamily = 'sans-serif' | 'serif' | 'monospace' | 'cursive';
export type ArrowheadStyle = 'single' | 'double';
export type DrawTransition =
    | 'none'
    | 'fade'
    | 'scale'
    | 'slide-up'
    | 'slide-down'
    | 'slide-left'
    | 'slide-right';

export interface DrawPoint {
    x: number;
    y: number;
}

export interface BaseObject {
    id: string;
    strokeColor: DrawColor;
    strokeWidth: number;
}

export interface ArrowObject extends BaseObject {
    type: 'arrow';
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    arrowheadStyle: ArrowheadStyle;
}

export interface LineObject extends BaseObject {
    type: 'line';
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

export interface RectObject extends BaseObject {
    type: 'rect';
    x: number;
    y: number;
    width: number;
    height: number;
    fillColor: DrawColor | 'transparent';
    rounded: boolean;
}

export interface CircleObject extends BaseObject {
    type: 'circle';
    x: number;
    y: number;
    width: number;
    height: number;
    fillColor: DrawColor | 'transparent';
}

export interface FreehandObject extends BaseObject {
    type: 'freehand';
    points: DrawPoint[];
}

export interface TextObject extends BaseObject {
    type: 'text';
    x: number;
    y: number;
    width: number;
    height: number;
    text: string;
    fontFamily: FontFamily;
    fontSize: number;
    fontColor: DrawColor;
    fillColor: DrawColor | 'transparent';
    fontBold?: boolean;
    fontItalic?: boolean;
    fontUnderline?: boolean;
}

export interface BalloonObject extends BaseObject {
    type: 'balloon';
    x: number;
    y: number;
    width: number;
    height: number;
    text: string;
    fontFamily: FontFamily;
    fontSize: number;
    fontColor: DrawColor;
    fillColor: DrawColor | 'transparent';
    tailDirection: 'down' | 'up' | 'left' | 'right';
    fontBold?: boolean;
    fontItalic?: boolean;
    fontUnderline?: boolean;
}

export interface StepObject extends BaseObject {
    type: 'step';
    x: number;
    y: number;
    radius: number;
    stepNumber: number;
    fillColor: DrawColor;
    fontColor: DrawColor;
}

export interface HighlighterObject extends BaseObject {
    type: 'highlighter';
    points: DrawPoint[];
}

export interface CalloutObject extends BaseObject {
    type: 'callout';
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    stepNumber: number;
    fillColor: DrawColor;
    fontColor: DrawColor;
    radius: number;
}

export interface DimensionObject extends BaseObject {
    type: 'dimension';
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    customLabel?: string;
}

export interface CurvedArrowObject extends BaseObject {
    type: 'curvedArrow';
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    cpx: number;
    cpy: number;
}

export type DrawObject =
    | ArrowObject
    | LineObject
    | RectObject
    | CircleObject
    | FreehandObject
    | TextObject
    | BalloonObject
    | StepObject
    | HighlighterObject
    | CalloutObject
    | DimensionObject
    | CurvedArrowObject;

export interface DrawToolDefaults {
    strokeColor: DrawColor;
    fillColor: DrawColor | 'transparent';
    strokeWidth: number;
    fontFamily: FontFamily;
    fontSize: number;
    fontColor: DrawColor;
    fontBold: boolean;
    fontItalic: boolean;
    fontUnderline: boolean;
    rounded: boolean;
    arrowheadStyle: ArrowheadStyle;
}

export interface DrawItem {
    id: string;
    object: DrawObject;
    showAtMs: number;
    hideAtMs: number | null;
    transition: DrawTransition;
    groupId: string | null;
    xPct: number;
    yPct: number;
    wPct: number | null;
    hPct: number | null;
    rotation?: number;
}

export interface DrawGroup {
    id: string;
    label: string;
    showAtMs: number;
    hideAtMs: number | null;
    transition: DrawTransition;
}

export type CanvasBackground =
    | { type: 'video'; videoRef: React.RefObject<HTMLVideoElement | null> }
    | { type: 'image'; src: string }
    | { type: 'color'; color: string };

export type ImageExportFormat = 'png' | 'jpg' | 'webp' | 'svg';

export interface ToolConfig {
    select?: boolean;
    arrow?: boolean;
    line?: boolean;
    rect?: boolean;
    circle?: boolean;
    freehand?: boolean;
    text?: boolean;
    balloon?: boolean;
    step?: boolean;
    highlighter?: boolean;
    callout?: boolean;
    dimension?: boolean;
    curvedArrow?: boolean;
}

export interface CanvasDrawFeatures {
    tools?: ToolConfig;
    timing?: boolean;
    groups?: boolean;
    transitions?: boolean;
    undo?: boolean;
    export?: boolean;
    clearAll?: boolean;
    strokeColor?: boolean;
    strokeWidth?: boolean;
    fillColor?: boolean;
    fontControls?: boolean;
    roundedCorners?: boolean;
}

export const colorMap: Record<DrawColor, string> = {
    red: '#e63946',
    orange: '#f4a261',
    yellow: '#f9c74f',
    green: '#52b788',
    teal: '#2a9d8f',
    blue: '#4361ee',
    purple: '#7209b7',
    black: '#1a1a2e',
    white: '#ffffff',
};

export const defaultToolDefaults: DrawToolDefaults = {
    strokeColor: 'red',
    fillColor: 'transparent',
    strokeWidth: 2,
    fontFamily: 'sans-serif',
    fontSize: 14,
    fontColor: 'black',
    fontBold: false,
    fontItalic: false,
    fontUnderline: false,
    rounded: false,
    arrowheadStyle: 'single',
};

export function contrastColor(hex: string): string {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return lum > 0.55 ? '#1a1a2e' : '#ffffff';
}

export function autoFontColor(fillColor: string, explicitFontColor: DrawColor): string {
    if (fillColor === 'transparent' || fillColor === 'none') return colorMap[explicitFontColor] ?? explicitFontColor;
    const hex = (colorMap[fillColor as DrawColor] ?? fillColor).replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return lum > 0.55 ? '#1a1a2e' : '#ffffff';
}
