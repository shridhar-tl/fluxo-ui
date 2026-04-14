export interface HSV {
    h: number;
    s: number;
    v: number;
}

export interface RGB {
    r: number;
    g: number;
    b: number;
}

export const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

export const hsvToRgb = ({ h, s, v }: HSV): RGB => {
    const c = v * s;
    const hh = (h / 60) % 6;
    const x = c * (1 - Math.abs((hh % 2) - 1));
    let r = 0;
    let g = 0;
    let b = 0;
    if (hh >= 0 && hh < 1) { r = c; g = x; b = 0; }
    else if (hh < 2) { r = x; g = c; b = 0; }
    else if (hh < 3) { r = 0; g = c; b = x; }
    else if (hh < 4) { r = 0; g = x; b = c; }
    else if (hh < 5) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    const m = v - c;
    return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255),
    };
};

export const rgbToHsv = ({ r, g, b }: RGB): HSV => {
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const d = max - min;
    const v = max;
    const s = max === 0 ? 0 : d / max;
    let h = 0;
    if (d !== 0) {
        if (max === rn) h = 60 * (((gn - bn) / d) % 6);
        else if (max === gn) h = 60 * ((bn - rn) / d + 2);
        else h = 60 * ((rn - gn) / d + 4);
    }
    if (h < 0) h += 360;
    return { h, s, v };
};

export const rgbToHex = ({ r, g, b }: RGB): string => {
    const toHex = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const hexToRgb = (hex: string): RGB | null => {
    let clean = hex.trim().replace('#', '');
    if (clean.length === 3) {
        clean = clean.split('').map((c) => c + c).join('');
    }
    if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
    return {
        r: parseInt(clean.slice(0, 2), 16),
        g: parseInt(clean.slice(2, 4), 16),
        b: parseInt(clean.slice(4, 6), 16),
    };
};

export const hexToHsv = (hex: string): HSV | null => {
    const rgb = hexToRgb(hex);
    if (!rgb) return null;
    return rgbToHsv(rgb);
};

export const hsvToHex = (hsv: HSV): string => rgbToHex(hsvToRgb(hsv));

export const rgbaToString = (rgb: RGB, a: number): string => `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;

export const DEFAULT_SWATCHES = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
    '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#78716c',
    '#000000', '#ffffff',
];
