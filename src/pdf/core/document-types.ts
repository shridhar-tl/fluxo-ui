import type { ColorInput } from './color';
import type { EdgeInsetsInput, LengthUnit, PageOrientation, PageSizeInput } from './geometry';

export interface DocumentMetadata {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string | string[];
    creator?: string;
    producer?: string;
    creationDate?: Date;
    modificationDate?: Date;
}

export interface DocumentOptions {
    unit?: LengthUnit;
    format?: PageSizeInput;
    orientation?: PageOrientation;
    margin?: EdgeInsetsInput;
    metadata?: DocumentMetadata;
    compress?: boolean;
    defaultFont?: string;
    defaultFontSize?: number;
    lineHeightFactor?: number;
    language?: string;
    displayTitleInWindow?: boolean;
}

export interface PageOptions {
    format?: PageSizeInput;
    orientation?: PageOrientation;
    margin?: EdgeInsetsInput;
}

export type HorizontalAlign = 'left' | 'center' | 'right' | 'justify';
export type VerticalAlign = 'top' | 'middle' | 'bottom';

export interface TextStyle {
    font?: string;
    fontSize?: number;
    bold?: boolean;
    italic?: boolean;
    color?: ColorInput;
    characterSpacing?: number;
    wordSpacing?: number;
    lineHeightFactor?: number;
    align?: HorizontalAlign;
    underline?: boolean;
    strikeThrough?: boolean;
    opacity?: number;
}

export interface TextOptions extends TextStyle {
    maxWidth?: number;
    anchor?: 'box' | 'point';
    maxLines?: number;
    ellipsis?: string;
    rotation?: number;
    baseline?: 'alphabetic' | 'top' | 'middle' | 'bottom';
    renderMode?: 'fill' | 'stroke' | 'fillStroke' | 'invisible';
}

export interface ShapeStyle {
    fillColor?: ColorInput;
    strokeColor?: ColorInput;
    lineWidth?: number;
    lineCap?: 'butt' | 'round' | 'square';
    lineJoin?: 'miter' | 'round' | 'bevel';
    dashPattern?: number[];
    dashPhase?: number;
    opacity?: number;
    fillOpacity?: number;
    strokeOpacity?: number;
}

export interface ImageOptions {
    x: number;
    y: number;
    width?: number;
    height?: number;
    opacity?: number;
    rotation?: number;
    fit?: 'fill' | 'contain' | 'cover';
}

export interface LinkOptions {
    url?: string;
    pageIndex?: number;
    tooltip?: string;
}

export interface OutlineEntry {
    title: string;
    pageIndex: number;
    y?: number;
    children?: OutlineEntry[];
}
