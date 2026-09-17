export interface RgbColor {
    r: number;
    g: number;
    b: number;
}

export interface RgbaColor extends RgbColor {
    a: number;
}

export type ColorInput = string | number | [number, number, number] | [number, number, number, number] | RgbColor | RgbaColor | null;

const cssColorNames: Record<string, number> = {
    aliceblue: 0xf0f8ff,
    antiquewhite: 0xfaebd7,
    aqua: 0x00ffff,
    aquamarine: 0x7fffd4,
    azure: 0xf0ffff,
    beige: 0xf5f5dc,
    bisque: 0xffe4c4,
    black: 0x000000,
    blanchedalmond: 0xffebcd,
    blue: 0x0000ff,
    blueviolet: 0x8a2be2,
    brown: 0xa52a2a,
    burlywood: 0xdeb887,
    cadetblue: 0x5f9ea0,
    chartreuse: 0x7fff00,
    chocolate: 0xd2691e,
    coral: 0xff7f50,
    cornflowerblue: 0x6495ed,
    cornsilk: 0xfff8dc,
    crimson: 0xdc143c,
    cyan: 0x00ffff,
    darkblue: 0x00008b,
    darkcyan: 0x008b8b,
    darkgoldenrod: 0xb8860b,
    darkgray: 0xa9a9a9,
    darkgreen: 0x006400,
    darkgrey: 0xa9a9a9,
    darkkhaki: 0xbdb76b,
    darkmagenta: 0x8b008b,
    darkolivegreen: 0x556b2f,
    darkorange: 0xff8c00,
    darkorchid: 0x9932cc,
    darkred: 0x8b0000,
    darksalmon: 0xe9967a,
    darkseagreen: 0x8fbc8f,
    darkslateblue: 0x483d8b,
    darkslategray: 0x2f4f4f,
    darkslategrey: 0x2f4f4f,
    darkturquoise: 0x00ced1,
    darkviolet: 0x9400d3,
    deeppink: 0xff1493,
    deepskyblue: 0x00bfff,
    dimgray: 0x696969,
    dimgrey: 0x696969,
    dodgerblue: 0x1e90ff,
    firebrick: 0xb22222,
    floralwhite: 0xfffaf0,
    forestgreen: 0x228b22,
    fuchsia: 0xff00ff,
    gainsboro: 0xdcdcdc,
    ghostwhite: 0xf8f8ff,
    gold: 0xffd700,
    goldenrod: 0xdaa520,
    gray: 0x808080,
    green: 0x008000,
    greenyellow: 0xadff2f,
    grey: 0x808080,
    honeydew: 0xf0fff0,
    hotpink: 0xff69b4,
    indianred: 0xcd5c5c,
    indigo: 0x4b0082,
    ivory: 0xfffff0,
    khaki: 0xf0e68c,
    lavender: 0xe6e6fa,
    lavenderblush: 0xfff0f5,
    lawngreen: 0x7cfc00,
    lemonchiffon: 0xfffacd,
    lightblue: 0xadd8e6,
    lightcoral: 0xf08080,
    lightcyan: 0xe0ffff,
    lightgoldenrodyellow: 0xfafad2,
    lightgray: 0xd3d3d3,
    lightgreen: 0x90ee90,
    lightgrey: 0xd3d3d3,
    lightpink: 0xffb6c1,
    lightsalmon: 0xffa07a,
    lightseagreen: 0x20b2aa,
    lightskyblue: 0x87cefa,
    lightslategray: 0x778899,
    lightslategrey: 0x778899,
    lightsteelblue: 0xb0c4de,
    lightyellow: 0xffffe0,
    lime: 0x00ff00,
    limegreen: 0x32cd32,
    linen: 0xfaf0e6,
    magenta: 0xff00ff,
    maroon: 0x800000,
    mediumaquamarine: 0x66cdaa,
    mediumblue: 0x0000cd,
    mediumorchid: 0xba55d3,
    mediumpurple: 0x9370db,
    mediumseagreen: 0x3cb371,
    mediumslateblue: 0x7b68ee,
    mediumspringgreen: 0x00fa9a,
    mediumturquoise: 0x48d1cc,
    mediumvioletred: 0xc71585,
    midnightblue: 0x191970,
    mintcream: 0xf5fffa,
    mistyrose: 0xffe4e1,
    moccasin: 0xffe4b5,
    navajowhite: 0xffdead,
    navy: 0x000080,
    oldlace: 0xfdf5e6,
    olive: 0x808000,
    olivedrab: 0x6b8e23,
    orange: 0xffa500,
    orangered: 0xff4500,
    orchid: 0xda70d6,
    palegoldenrod: 0xeee8aa,
    palegreen: 0x98fb98,
    paleturquoise: 0xafeeee,
    palevioletred: 0xdb7093,
    papayawhip: 0xffefd5,
    peachpuff: 0xffdab9,
    peru: 0xcd853f,
    pink: 0xffc0cb,
    plum: 0xdda0dd,
    powderblue: 0xb0e0e6,
    purple: 0x800080,
    rebeccapurple: 0x663399,
    red: 0xff0000,
    rosybrown: 0xbc8f8f,
    royalblue: 0x4169e1,
    saddlebrown: 0x8b4513,
    salmon: 0xfa8072,
    sandybrown: 0xf4a460,
    seagreen: 0x2e8b57,
    seashell: 0xfff5ee,
    sienna: 0xa0522d,
    silver: 0xc0c0c0,
    skyblue: 0x87ceeb,
    slateblue: 0x6a5acd,
    slategray: 0x708090,
    slategrey: 0x708090,
    snow: 0xfffafa,
    springgreen: 0x00ff7f,
    steelblue: 0x4682b4,
    tan: 0xd2b48c,
    teal: 0x008080,
    thistle: 0xd8bfd8,
    tomato: 0xff6347,
    turquoise: 0x40e0d0,
    violet: 0xee82ee,
    wheat: 0xf5deb3,
    white: 0xffffff,
    whitesmoke: 0xf5f5f5,
    yellow: 0xffff00,
    yellowgreen: 0x9acd32,
};

const clampChannel = (value: number): number => {
    if (Number.isNaN(value)) return 0;
    return value < 0 ? 0 : value > 255 ? 255 : Math.round(value);
};

const clampAlpha = (value: number): number => {
    if (Number.isNaN(value)) return 1;
    return value < 0 ? 0 : value > 1 ? 1 : value;
};

const fromPackedInt = (packed: number): RgbColor => ({
    r: (packed >> 16) & 0xff,
    g: (packed >> 8) & 0xff,
    b: packed & 0xff,
});

const hueToChannel = (p: number, q: number, tRaw: number): number => {
    let t = tRaw;
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
};

export function hslToRgb(h: number, s: number, l: number): RgbColor {
    const hue = (((h % 360) + 360) % 360) / 360;
    const sat = Math.min(Math.max(s, 0), 1);
    const light = Math.min(Math.max(l, 0), 1);

    if (sat === 0) {
        const grey = clampChannel(light * 255);
        return { r: grey, g: grey, b: grey };
    }

    const q = light < 0.5 ? light * (1 + sat) : light + sat - light * sat;
    const p = 2 * light - q;

    return {
        r: clampChannel(hueToChannel(p, q, hue + 1 / 3) * 255),
        g: clampChannel(hueToChannel(p, q, hue) * 255),
        b: clampChannel(hueToChannel(p, q, hue - 1 / 3) * 255),
    };
}

const parseNumericList = (body: string): number[] =>
    body
        .split(/[\s,/]+/)
        .map((part) => part.trim())
        .filter((part) => part.length > 0)
        .map((part) => (part.endsWith('%') ? parseFloat(part) : parseFloat(part)));

const parseFunctionalColor = (value: string): RgbaColor | null => {
    const match = value.match(/^(rgba?|hsla?)\(([^)]*)\)$/);
    if (!match) return null;

    const [, fn, body] = match;
    const rawParts = body
        .split(/[\s,/]+/)
        .map((part) => part.trim())
        .filter((part) => part.length > 0);
    const numbers = parseNumericList(body);
    if (numbers.length < 3) return null;

    const alpha = numbers.length >= 4 ? (rawParts[3]?.endsWith('%') ? numbers[3] / 100 : numbers[3]) : 1;

    if (fn.startsWith('hsl')) {
        const saturation = rawParts[1]?.endsWith('%') ? numbers[1] / 100 : numbers[1];
        const lightness = rawParts[2]?.endsWith('%') ? numbers[2] / 100 : numbers[2];
        const rgb = hslToRgb(numbers[0], saturation, lightness);
        return { ...rgb, a: clampAlpha(alpha) };
    }

    const toByte = (index: number): number =>
        rawParts[index]?.endsWith('%') ? clampChannel((numbers[index] / 100) * 255) : clampChannel(numbers[index]);

    return { r: toByte(0), g: toByte(1), b: toByte(2), a: clampAlpha(alpha) };
};

const parseHexColor = (value: string): RgbaColor | null => {
    const hex = value.slice(1);
    const expand = (char: string): number => parseInt(char + char, 16);

    if (hex.length === 3 || hex.length === 4) {
        return {
            r: expand(hex[0]),
            g: expand(hex[1]),
            b: expand(hex[2]),
            a: hex.length === 4 ? expand(hex[3]) / 255 : 1,
        };
    }

    if (hex.length === 6 || hex.length === 8) {
        const intValue = parseInt(hex.slice(0, 6), 16);
        if (Number.isNaN(intValue)) return null;
        return {
            ...fromPackedInt(intValue),
            a: hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1,
        };
    }

    return null;
};

export function parseColor(input: ColorInput): RgbaColor | null {
    if (input === null || input === undefined) return null;

    if (typeof input === 'number') {
        if (input >= 0 && input <= 255 && Number.isInteger(input) && input <= 255) {
            const grey = clampChannel(input);
            return { r: grey, g: grey, b: grey, a: 1 };
        }
        return { ...fromPackedInt(input), a: 1 };
    }

    if (Array.isArray(input)) {
        return {
            r: clampChannel(input[0]),
            g: clampChannel(input[1]),
            b: clampChannel(input[2]),
            a: input.length > 3 ? clampAlpha(input[3] as number) : 1,
        };
    }

    if (typeof input === 'object') {
        return {
            r: clampChannel(input.r),
            g: clampChannel(input.g),
            b: clampChannel(input.b),
            a: 'a' in input ? clampAlpha(input.a) : 1,
        };
    }

    const value = input.trim().toLowerCase();
    if (value.length === 0) return null;
    if (value === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };

    const named = cssColorNames[value];
    if (named !== undefined) return { ...fromPackedInt(named), a: 1 };

    if (value.startsWith('#')) return parseHexColor(value);

    return parseFunctionalColor(value);
}

export function colorToHex(color: RgbColor): string {
    const toHex = (channel: number): string => clampChannel(channel).toString(16).padStart(2, '0');
    return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
}

export function relativeLuminance(color: RgbColor): number {
    const channel = (value: number): number => {
        const scaled = value / 255;
        return scaled <= 0.03928 ? scaled / 12.92 : Math.pow((scaled + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
}

export function contrastRatio(foreground: RgbColor, background: RgbColor): number {
    const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
    const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
    return (lighter + 0.05) / (darker + 0.05);
}

export function readableTextColor(background: RgbColor, light: RgbColor = { r: 255, g: 255, b: 255 }, dark: RgbColor = { r: 17, g: 24, b: 39 }): RgbColor {
    return contrastRatio(light, background) >= contrastRatio(dark, background) ? light : dark;
}
