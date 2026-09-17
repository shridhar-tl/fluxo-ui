export type StandardFontId =
    | 'Helvetica'
    | 'Helvetica-Bold'
    | 'Helvetica-Oblique'
    | 'Helvetica-BoldOblique'
    | 'Times-Roman'
    | 'Times-Bold'
    | 'Times-Italic'
    | 'Times-BoldItalic'
    | 'Courier'
    | 'Courier-Bold'
    | 'Courier-Oblique'
    | 'Courier-BoldOblique'
    | 'Symbol'
    | 'ZapfDingbats';

export interface FontMetricTable {
    widths: Record<number, number>;
    defaultWidth: number;
    ascender: number;
    descender: number;
    capHeight: number;
    italicAngle: number;
    flags: number;
    bbox: [number, number, number, number];
    stemV: number;
}

const expandRuns = (runs: ReadonlyArray<readonly [number, readonly number[]]>): Record<number, number> => {
    const widths: Record<number, number> = {};
    for (const [start, values] of runs) {
        for (let offset = 0; offset < values.length; offset += 1) {
            widths[start + offset] = values[offset];
        }
    }
    return widths;
};

const helveticaRegularRuns = [
    [
        32,
        [
            278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556,
            556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278,
            500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469,
            556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500,
            278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
        ],
    ],
    [
        128,
        [
            556, 350, 222, 556, 333, 1000, 556, 556, 333, 1000, 667, 333, 1000, 350, 611, 350, 350, 222, 222, 333, 333,
            350, 556, 1000, 333, 1000, 500, 333, 944, 350, 500, 667, 278, 333, 556, 556, 556, 556, 260, 556, 333, 737,
            370, 556, 584, 333, 737, 552, 400, 549, 333, 333, 333, 576, 537, 278, 333, 333, 365, 556, 834, 834, 834,
            611, 667, 667, 667, 667, 667, 667, 1000, 722, 667, 667, 667, 667, 278, 278, 278, 278, 722, 722, 778, 778,
            778, 778, 778, 584, 778, 722, 722, 722, 722, 667, 667, 611, 556, 556, 556, 556, 556, 556, 889, 500, 556,
            556, 556, 556, 278, 278, 278, 278, 556, 556, 556, 556, 556, 556, 556, 549, 611, 556, 556, 556, 556, 500,
            556, 500,
        ],
    ],
] as const;

const helveticaBoldRuns = [
    [
        32,
        [
            278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556,
            556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611, 975, 722, 722, 722, 722, 667, 611, 778, 722, 278,
            556, 722, 611, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584,
            556, 333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611, 611, 611, 389, 556,
            333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584,
        ],
    ],
    [
        128,
        [
            556, 350, 278, 556, 500, 1000, 556, 556, 333, 1000, 667, 333, 1000, 350, 611, 350, 350, 278, 278, 500, 500,
            350, 556, 1000, 333, 1000, 556, 333, 944, 350, 500, 667, 278, 333, 556, 556, 556, 556, 280, 556, 333, 737,
            370, 556, 584, 333, 737, 552, 400, 549, 333, 333, 333, 576, 556, 278, 333, 333, 365, 556, 834, 834, 834,
            611, 722, 722, 722, 722, 722, 722, 1000, 722, 667, 667, 667, 667, 278, 278, 278, 278, 722, 722, 778, 778,
            778, 778, 778, 584, 778, 722, 722, 722, 722, 667, 667, 611, 556, 556, 556, 556, 556, 556, 889, 556, 556,
            556, 556, 556, 278, 278, 278, 278, 611, 611, 611, 611, 611, 611, 611, 549, 611, 611, 611, 611, 611, 556,
            611, 556,
        ],
    ],
] as const;

const timesRomanRuns = [
    [
        32,
        [
            250, 333, 408, 500, 500, 833, 778, 180, 333, 333, 500, 564, 250, 333, 250, 278, 500, 500, 500, 500, 500,
            500, 500, 500, 500, 500, 278, 278, 564, 564, 564, 444, 921, 722, 667, 667, 722, 611, 556, 722, 722, 333,
            389, 722, 611, 889, 722, 722, 556, 722, 667, 556, 611, 722, 722, 944, 722, 722, 611, 333, 278, 333, 469,
            500, 333, 444, 500, 444, 500, 444, 333, 500, 500, 278, 278, 500, 278, 778, 500, 500, 500, 500, 333, 389,
            278, 500, 500, 722, 500, 500, 444, 480, 200, 480, 541,
        ],
    ],
    [
        128,
        [
            500, 350, 333, 500, 444, 1000, 500, 500, 333, 1000, 556, 333, 889, 350, 611, 350, 350, 333, 333, 444, 444,
            350, 500, 1000, 333, 980, 389, 333, 722, 350, 444, 722, 250, 333, 500, 500, 500, 500, 200, 500, 333, 760,
            276, 500, 564, 333, 760, 500, 400, 549, 300, 300, 333, 576, 453, 250, 333, 300, 310, 500, 750, 750, 750,
            444, 722, 722, 722, 722, 722, 722, 889, 667, 611, 611, 611, 611, 333, 333, 333, 333, 722, 722, 722, 722,
            722, 722, 722, 564, 722, 722, 722, 722, 722, 722, 556, 500, 444, 444, 444, 444, 444, 444, 667, 444, 444,
            444, 444, 444, 278, 278, 278, 278, 500, 500, 500, 500, 500, 500, 500, 549, 500, 500, 500, 500, 500, 500,
            500, 500,
        ],
    ],
] as const;

const timesBoldRuns = [
    [
        32,
        [
            250, 333, 555, 500, 500, 1000, 833, 278, 333, 333, 500, 570, 250, 333, 250, 278, 500, 500, 500, 500, 500,
            500, 500, 500, 500, 500, 333, 333, 570, 570, 570, 500, 930, 722, 667, 722, 722, 667, 611, 778, 778, 389,
            500, 778, 667, 944, 722, 778, 611, 778, 722, 556, 667, 722, 722, 1000, 722, 722, 667, 333, 278, 333, 581,
            500, 333, 500, 556, 444, 556, 444, 333, 500, 556, 278, 333, 556, 278, 833, 556, 500, 556, 556, 444, 389,
            333, 556, 500, 722, 500, 500, 444, 394, 220, 394, 520,
        ],
    ],
    [
        128,
        [
            500, 350, 333, 500, 500, 1000, 500, 500, 333, 1000, 556, 333, 1000, 350, 667, 350, 350, 333, 333, 500, 500,
            350, 500, 1000, 333, 1000, 389, 333, 722, 350, 444, 722, 250, 333, 500, 500, 500, 500, 220, 500, 333, 747,
            300, 500, 570, 333, 747, 500, 400, 549, 300, 300, 333, 576, 540, 250, 333, 300, 330, 500, 750, 750, 750,
            500, 722, 722, 722, 722, 722, 722, 1000, 722, 667, 667, 667, 667, 389, 389, 389, 389, 722, 722, 778, 778,
            778, 778, 778, 570, 778, 722, 722, 722, 722, 722, 611, 556, 500, 500, 500, 500, 500, 500, 722, 444, 444,
            444, 444, 444, 278, 278, 278, 278, 500, 556, 500, 500, 500, 500, 500, 549, 500, 556, 556, 556, 556, 500,
            556, 500,
        ],
    ],
] as const;

const timesItalicRuns = [
    [
        32,
        [
            250, 333, 420, 500, 500, 833, 778, 214, 333, 333, 500, 675, 250, 333, 250, 278, 500, 500, 500, 500, 500,
            500, 500, 500, 500, 500, 333, 333, 675, 675, 675, 500, 920, 611, 611, 667, 722, 611, 611, 722, 722, 333,
            444, 667, 556, 833, 667, 722, 611, 722, 611, 500, 556, 722, 611, 833, 611, 556, 556, 389, 278, 389, 422,
            500, 333, 500, 500, 444, 500, 444, 278, 500, 500, 278, 278, 444, 278, 722, 500, 500, 500, 500, 389, 389,
            278, 500, 444, 667, 444, 444, 389, 400, 275, 400, 541,
        ],
    ],
    [
        128,
        [
            500, 350, 333, 500, 556, 889, 500, 500, 333, 1000, 500, 333, 944, 350, 556, 350, 350, 333, 333, 556, 556,
            350, 500, 889, 333, 980, 389, 333, 667, 350, 389, 556, 250, 389, 500, 500, 500, 500, 275, 500, 333, 760,
            276, 500, 675, 333, 760, 500, 400, 549, 300, 300, 333, 576, 523, 250, 333, 300, 310, 500, 750, 750, 750,
            500, 611, 611, 611, 611, 611, 611, 889, 667, 611, 611, 611, 611, 333, 333, 333, 333, 722, 667, 722, 722,
            722, 722, 722, 675, 722, 722, 722, 722, 722, 556, 611, 500, 500, 500, 500, 500, 500, 500, 667, 444, 444,
            444, 444, 444, 278, 278, 278, 278, 500, 500, 500, 500, 500, 500, 500, 549, 500, 500, 500, 500, 500, 444,
            500, 444,
        ],
    ],
] as const;

const timesBoldItalicRuns = [
    [
        32,
        [
            250, 389, 555, 500, 500, 833, 778, 278, 333, 333, 500, 570, 250, 333, 250, 278, 500, 500, 500, 500, 500,
            500, 500, 500, 500, 500, 333, 333, 570, 570, 570, 500, 832, 667, 667, 667, 722, 667, 667, 722, 778, 389,
            500, 667, 611, 889, 722, 722, 611, 722, 667, 556, 611, 722, 667, 889, 667, 611, 611, 333, 278, 333, 570,
            500, 333, 500, 500, 444, 500, 444, 333, 500, 556, 278, 278, 500, 278, 778, 556, 500, 500, 500, 389, 389,
            278, 556, 444, 667, 500, 444, 389, 348, 220, 348, 570,
        ],
    ],
    [
        128,
        [
            500, 350, 333, 500, 500, 1000, 500, 500, 333, 1000, 556, 333, 944, 350, 611, 350, 350, 333, 333, 500, 500,
            350, 500, 1000, 333, 1000, 389, 333, 722, 350, 389, 611, 250, 389, 500, 500, 500, 500, 220, 500, 333, 747,
            266, 500, 606, 333, 747, 500, 400, 549, 300, 300, 333, 576, 500, 250, 333, 300, 300, 500, 750, 750, 750,
            500, 667, 667, 667, 667, 667, 667, 944, 667, 667, 667, 667, 667, 389, 389, 389, 389, 722, 722, 722, 722,
            722, 722, 722, 570, 722, 722, 722, 722, 722, 611, 611, 500, 500, 500, 500, 500, 500, 500, 722, 444, 444,
            444, 444, 444, 278, 278, 278, 278, 500, 556, 500, 500, 500, 500, 500, 549, 500, 556, 556, 556, 556, 444,
            500, 444,
        ],
    ],
] as const;

const monospacedWidths = (): Record<number, number> => {
    const widths: Record<number, number> = {};
    for (let code = 32; code <= 255; code += 1) {
        widths[code] = 600;
    }
    return widths;
};

const buildMetric = (
    widths: Record<number, number>,
    overrides: Partial<Omit<FontMetricTable, 'widths'>>,
): FontMetricTable => ({
    widths,
    defaultWidth: overrides.defaultWidth ?? 500,
    ascender: overrides.ascender ?? 718,
    descender: overrides.descender ?? -207,
    capHeight: overrides.capHeight ?? 718,
    italicAngle: overrides.italicAngle ?? 0,
    flags: overrides.flags ?? 32,
    bbox: overrides.bbox ?? [-166, -225, 1000, 931],
    stemV: overrides.stemV ?? 80,
});

const helveticaWidths = expandRuns(helveticaRegularRuns);
const helveticaBoldWidths = expandRuns(helveticaBoldRuns);
const timesRomanWidths = expandRuns(timesRomanRuns);
const timesBoldWidths = expandRuns(timesBoldRuns);
const timesItalicWidths = expandRuns(timesItalicRuns);
const timesBoldItalicWidths = expandRuns(timesBoldItalicRuns);
const courierWidths = monospacedWidths();

export const standardFontMetrics: Record<StandardFontId, FontMetricTable> = {
    Helvetica: buildMetric(helveticaWidths, {
        ascender: 718,
        descender: -207,
        capHeight: 718,
        bbox: [-166, -225, 1000, 931],
        stemV: 88,
    }),
    'Helvetica-Bold': buildMetric(helveticaBoldWidths, {
        ascender: 718,
        descender: -207,
        capHeight: 718,
        flags: 32 | 262144,
        bbox: [-170, -228, 1003, 962],
        stemV: 140,
    }),
    'Helvetica-Oblique': buildMetric(helveticaWidths, {
        ascender: 718,
        descender: -207,
        capHeight: 718,
        italicAngle: -12,
        flags: 32 | 64,
        bbox: [-170, -225, 1116, 931],
        stemV: 88,
    }),
    'Helvetica-BoldOblique': buildMetric(helveticaBoldWidths, {
        ascender: 718,
        descender: -207,
        capHeight: 718,
        italicAngle: -12,
        flags: 32 | 64 | 262144,
        bbox: [-174, -228, 1114, 962],
        stemV: 140,
    }),
    'Times-Roman': buildMetric(timesRomanWidths, {
        ascender: 683,
        descender: -217,
        capHeight: 662,
        flags: 34,
        bbox: [-168, -218, 1000, 898],
        stemV: 84,
    }),
    'Times-Bold': buildMetric(timesBoldWidths, {
        ascender: 683,
        descender: -217,
        capHeight: 676,
        flags: 34 | 262144,
        bbox: [-168, -218, 1000, 935],
        stemV: 139,
    }),
    'Times-Italic': buildMetric(timesItalicWidths, {
        ascender: 683,
        descender: -217,
        capHeight: 653,
        italicAngle: -15.5,
        flags: 34 | 64,
        bbox: [-169, -217, 1010, 883],
        stemV: 76,
    }),
    'Times-BoldItalic': buildMetric(timesBoldItalicWidths, {
        ascender: 683,
        descender: -217,
        capHeight: 669,
        italicAngle: -15,
        flags: 34 | 64 | 262144,
        bbox: [-200, -218, 996, 921],
        stemV: 121,
    }),
    Courier: buildMetric(courierWidths, {
        defaultWidth: 600,
        ascender: 629,
        descender: -157,
        capHeight: 562,
        flags: 33,
        bbox: [-23, -250, 715, 805],
        stemV: 51,
    }),
    'Courier-Bold': buildMetric(courierWidths, {
        defaultWidth: 600,
        ascender: 629,
        descender: -157,
        capHeight: 562,
        flags: 33 | 262144,
        bbox: [-113, -250, 749, 801],
        stemV: 106,
    }),
    'Courier-Oblique': buildMetric(courierWidths, {
        defaultWidth: 600,
        ascender: 629,
        descender: -157,
        capHeight: 562,
        italicAngle: -12,
        flags: 33 | 64,
        bbox: [-27, -250, 849, 805],
        stemV: 51,
    }),
    'Courier-BoldOblique': buildMetric(courierWidths, {
        defaultWidth: 600,
        ascender: 629,
        descender: -157,
        capHeight: 562,
        italicAngle: -12,
        flags: 33 | 64 | 262144,
        bbox: [-57, -250, 869, 801],
        stemV: 106,
    }),
    Symbol: buildMetric(
        { ...helveticaWidths },
        { defaultWidth: 600, ascender: 700, descender: -200, capHeight: 700, flags: 4, bbox: [-180, -293, 1090, 1010] },
    ),
    ZapfDingbats: buildMetric(
        { ...helveticaWidths },
        { defaultWidth: 700, ascender: 700, descender: -200, capHeight: 700, flags: 4, bbox: [-1, -143, 981, 820] },
    ),
};

export interface FontSelector {
    family: string;
    bold?: boolean;
    italic?: boolean;
}

const familyAliases: Record<string, 'helvetica' | 'times' | 'courier' | 'symbol' | 'zapfdingbats'> = {
    helvetica: 'helvetica',
    arial: 'helvetica',
    'arial black': 'helvetica',
    verdana: 'helvetica',
    tahoma: 'helvetica',
    'segoe ui': 'helvetica',
    'sans-serif': 'helvetica',
    system: 'helvetica',
    times: 'times',
    'times new roman': 'times',
    georgia: 'times',
    garamond: 'times',
    serif: 'times',
    courier: 'courier',
    'courier new': 'courier',
    monaco: 'courier',
    consolas: 'courier',
    menlo: 'courier',
    monospace: 'courier',
    symbol: 'symbol',
    zapfdingbats: 'zapfdingbats',
};

export function resolveStandardFontId(selector: FontSelector): StandardFontId {
    const normalized = selector.family.trim().toLowerCase().replace(/["']/g, '');
    const firstFamily = normalized.split(',')[0].trim();
    const group = familyAliases[firstFamily] ?? familyAliases[normalized] ?? 'helvetica';

    if (group === 'symbol') return 'Symbol';
    if (group === 'zapfdingbats') return 'ZapfDingbats';

    const bold = selector.bold === true;
    const italic = selector.italic === true;

    if (group === 'times') {
        if (bold && italic) return 'Times-BoldItalic';
        if (bold) return 'Times-Bold';
        if (italic) return 'Times-Italic';
        return 'Times-Roman';
    }

    const suffixBase = group === 'courier' ? 'Courier' : 'Helvetica';
    if (bold && italic) return `${suffixBase}-BoldOblique` as StandardFontId;
    if (bold) return `${suffixBase}-Bold` as StandardFontId;
    if (italic) return `${suffixBase}-Oblique` as StandardFontId;
    return suffixBase as StandardFontId;
}

export function listStandardFonts(): StandardFontId[] {
    return Object.keys(standardFontMetrics) as StandardFontId[];
}
