export type LengthUnit = 'pt' | 'mm' | 'cm' | 'in' | 'px' | 'pc';

export interface Size {
    width: number;
    height: number;
}

export interface Point {
    x: number;
    y: number;
}

export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface EdgeInsets {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export type EdgeInsetsInput = number | number[] | Partial<EdgeInsets>;

export type PageOrientation = 'portrait' | 'landscape';

const pointsPerUnit: Record<LengthUnit, number> = {
    pt: 1,
    pc: 12,
    in: 72,
    mm: 72 / 25.4,
    cm: 72 / 2.54,
    px: 72 / 96,
};

export function unitScale(unit: LengthUnit): number {
    const scale = pointsPerUnit[unit];
    if (!scale) throw new Error(`Unsupported measurement unit: ${String(unit)}`);
    return scale;
}

export function toPoints(value: number, unit: LengthUnit): number {
    return value * unitScale(unit);
}

export function fromPoints(value: number, unit: LengthUnit): number {
    return value / unitScale(unit);
}

const namedPageSizes: Record<string, Size> = {
    a0: { width: 2383.94, height: 3370.39 },
    a1: { width: 1683.78, height: 2383.94 },
    a2: { width: 1190.55, height: 1683.78 },
    a3: { width: 841.89, height: 1190.55 },
    a4: { width: 595.28, height: 841.89 },
    a5: { width: 419.53, height: 595.28 },
    a6: { width: 297.64, height: 419.53 },
    a7: { width: 209.76, height: 297.64 },
    a8: { width: 147.4, height: 209.76 },
    b3: { width: 1000.63, height: 1417.32 },
    b4: { width: 708.66, height: 1000.63 },
    b5: { width: 498.9, height: 708.66 },
    b6: { width: 354.33, height: 498.9 },
    c3: { width: 918.43, height: 1298.27 },
    c4: { width: 649.13, height: 918.43 },
    c5: { width: 459.21, height: 649.13 },
    c6: { width: 323.15, height: 459.21 },
    letter: { width: 612, height: 792 },
    legal: { width: 612, height: 1008 },
    tabloid: { width: 792, height: 1224 },
    ledger: { width: 1224, height: 792 },
    executive: { width: 521.86, height: 756 },
    folio: { width: 612, height: 936 },
    statement: { width: 396, height: 612 },
    creditcard: { width: 153, height: 243 },
};

export type NamedPageSize = keyof typeof namedPageSizes;

export type PageSizeInput = string | [number, number] | Size;

export function resolvePageSize(size: PageSizeInput, unit: LengthUnit, orientation: PageOrientation = 'portrait'): Size {
    if (typeof size !== 'string') {
        const explicit = Array.isArray(size)
            ? { width: toPoints(size[0], unit), height: toPoints(size[1], unit) }
            : { width: toPoints(size.width, unit), height: toPoints(size.height, unit) };
        return explicit;
    }

    const preset = namedPageSizes[size.toLowerCase()];
    if (!preset) throw new Error(`Unknown page size preset: ${size}`);

    return orientation === 'landscape'
        ? { width: preset.height, height: preset.width }
        : { width: preset.width, height: preset.height };
}

export function listPageSizePresets(): string[] {
    return Object.keys(namedPageSizes);
}

export function normalizeEdgeInsets(input: EdgeInsetsInput | undefined, fallback = 0): EdgeInsets {
    if (input === undefined || input === null) {
        return { top: fallback, right: fallback, bottom: fallback, left: fallback };
    }

    if (typeof input === 'number') {
        return { top: input, right: input, bottom: input, left: input };
    }

    if (Array.isArray(input)) {
        const [a = fallback, b = a, c = a, d = b] = input;
        return { top: a, right: b, bottom: c, left: d };
    }

    return {
        top: input.top ?? fallback,
        right: input.right ?? fallback,
        bottom: input.bottom ?? fallback,
        left: input.left ?? fallback,
    };
}

export function horizontalInsets(insets: EdgeInsets): number {
    return insets.left + insets.right;
}

export function verticalInsets(insets: EdgeInsets): number {
    return insets.top + insets.bottom;
}
