import { parseColor } from '../core/color';
import type { CellStyle } from '../table/table-types';

const pixelsToPoints = 72 / 96;

const toPoints = (value: string | null | undefined): number => {
    if (!value) return 0;
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed * pixelsToPoints : 0;
};

const isTransparent = (value: string | null | undefined): boolean => {
    if (!value) return true;
    const parsed = parseColor(value);
    return parsed === null || parsed.a === 0;
};

function resolveInheritedBackground(element: Element, view: Window): string | null {
    let current: Element | null = element;

    while (current) {
        const background = view.getComputedStyle(current).backgroundColor;
        if (!isTransparent(background)) return background;
        current = current.parentElement;
    }

    return null;
}

const fontFamilyFor = (declared: string): string => {
    const first = declared.split(',')[0]?.trim().replace(/^["']|["']$/g, '');
    return first && first.length > 0 ? first : 'Helvetica';
};

const alignmentFor = (value: string): CellStyle['align'] | undefined => {
    if (value === 'center' || value === 'right' || value === 'left') return value;
    if (value === 'start') return 'left';
    if (value === 'end') return 'right';
    return undefined;
};

const verticalAlignmentFor = (value: string): CellStyle['verticalAlign'] | undefined => {
    if (value === 'top' || value === 'middle' || value === 'bottom') return value;
    return undefined;
};

export interface ReadCellStyleOptions {
    ignoreColors?: boolean;
}

export function readCellStyle(
    element: HTMLElement,
    view: Window,
    options: ReadCellStyleOptions = {},
): Partial<CellStyle> {
    const computed = view.getComputedStyle(element);
    const style: Partial<CellStyle> = {};
    const keepColors = options.ignoreColors !== true;

    style.font = fontFamilyFor(computed.fontFamily);
    style.fontSize = toPoints(computed.fontSize) || 10;

    const weight = parseInt(computed.fontWeight, 10);
    style.bold = computed.fontWeight === 'bold' || (Number.isFinite(weight) && weight >= 600);
    style.italic = computed.fontStyle === 'italic' || computed.fontStyle === 'oblique';

    if (keepColors) {
        const textColor = parseColor(computed.color);
        if (textColor) style.textColor = computed.color;

        const background = resolveInheritedBackground(element, view);
        if (background) style.background = background;
    }

    style.padding = {
        top: toPoints(computed.paddingTop),
        right: toPoints(computed.paddingRight),
        bottom: toPoints(computed.paddingBottom),
        left: toPoints(computed.paddingLeft),
    };

    const borderWidth = {
        top: toPoints(computed.borderTopWidth),
        right: toPoints(computed.borderRightWidth),
        bottom: toPoints(computed.borderBottomWidth),
        left: toPoints(computed.borderLeftWidth),
    };

    const uniform =
        borderWidth.top === borderWidth.right &&
        borderWidth.right === borderWidth.bottom &&
        borderWidth.bottom === borderWidth.left;

    style.borderWidth = uniform ? borderWidth.top : borderWidth;

    const borderSide =
        borderWidth.top > 0
            ? computed.borderTopColor
            : borderWidth.bottom > 0
              ? computed.borderBottomColor
              : borderWidth.left > 0
                ? computed.borderLeftColor
                : computed.borderRightColor;

    if (keepColors && !isTransparent(borderSide)) style.borderColor = borderSide;

    const align = alignmentFor(computed.textAlign);
    if (align) style.align = align;

    const verticalAlign = verticalAlignmentFor(computed.verticalAlign);
    if (verticalAlign) style.verticalAlign = verticalAlign;

    const lineHeight = parseFloat(computed.lineHeight);
    const fontSize = parseFloat(computed.fontSize);
    if (Number.isFinite(lineHeight) && Number.isFinite(fontSize) && fontSize > 0) {
        style.lineHeightFactor = Math.max(1, lineHeight / fontSize);
    }

    return style;
}

export function isElementVisible(element: HTMLElement, view: Window): boolean {
    const computed = view.getComputedStyle(element);
    return computed.display !== 'none' && computed.visibility !== 'hidden';
}

export function readColumnWidth(element: HTMLElement, view: Window): number | undefined {
    const computed = view.getComputedStyle(element);
    const width = toPoints(computed.width);
    return width > 0 ? width : undefined;
}
