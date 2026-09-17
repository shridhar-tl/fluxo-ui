import type { CellStyle, GridPalette, GridPresetName, GridSection, SectionStyles } from './table-types';

export const baseCellStyle: CellStyle = {
    font: 'Helvetica',
    fontSize: 10,
    bold: false,
    italic: false,
    textColor: '#1f2937',
    background: null,
    borderColor: '#d1d5db',
    borderWidth: 0,
    padding: 5,
    align: 'left',
    verticalAlign: 'top',
    minHeight: 0,
    lineHeightFactor: 1.15,
    overflow: 'wrap',
};

interface PresetDefinition {
    all?: Partial<CellStyle>;
    header?: Partial<CellStyle>;
    body?: Partial<CellStyle>;
    footer?: Partial<CellStyle>;
    stripe?: Partial<CellStyle>;
}

const presetDefinitions: Record<GridPresetName, PresetDefinition> = {
    lined: {
        all: { borderWidth: 0.5, borderColor: '#cbd5e1' },
        header: { background: '#334155', textColor: '#ffffff', bold: true },
        body: { background: '#ffffff', textColor: '#1f2937' },
        footer: { background: '#334155', textColor: '#ffffff', bold: true },
    },
    ruled: {
        all: { borderWidth: { bottom: 0.5 }, borderColor: '#e2e8f0' },
        header: { borderWidth: { bottom: 1.2 }, borderColor: '#334155', bold: true, textColor: '#0f172a' },
        body: { textColor: '#1f2937' },
        footer: { borderWidth: { top: 1.2 }, borderColor: '#334155', bold: true, textColor: '#0f172a' },
    },
    zebra: {
        all: { borderWidth: 0 },
        header: { background: '#1e293b', textColor: '#ffffff', bold: true },
        body: { background: '#ffffff', textColor: '#1f2937' },
        stripe: { background: '#f1f5f9' },
        footer: { background: '#e2e8f0', textColor: '#0f172a', bold: true },
    },
    minimal: {
        all: { borderWidth: 0 },
        header: { bold: true, textColor: '#0f172a' },
        body: { textColor: '#334155' },
        footer: { bold: true, textColor: '#0f172a' },
    },
    boxed: {
        all: { borderWidth: 0.75, borderColor: '#94a3b8' },
        header: { background: '#f8fafc', textColor: '#0f172a', bold: true },
        body: { background: '#ffffff' },
        footer: { background: '#f8fafc', bold: true },
    },
};

const applyPalette = (definition: PresetDefinition, palette?: GridPalette): PresetDefinition => {
    if (!palette) return definition;

    const merged: PresetDefinition = {
        all: { ...definition.all },
        header: { ...definition.header },
        body: { ...definition.body },
        footer: { ...definition.footer },
        stripe: { ...definition.stripe },
    };

    if (palette.borderColor !== undefined) merged.all = { ...merged.all, borderColor: palette.borderColor };
    if (palette.headerBackground !== undefined) merged.header = { ...merged.header, background: palette.headerBackground };
    if (palette.headerTextColor !== undefined) merged.header = { ...merged.header, textColor: palette.headerTextColor };
    if (palette.bodyBackground !== undefined) merged.body = { ...merged.body, background: palette.bodyBackground };
    if (palette.bodyTextColor !== undefined) merged.body = { ...merged.body, textColor: palette.bodyTextColor };
    if (palette.footerBackground !== undefined) merged.footer = { ...merged.footer, background: palette.footerBackground };
    if (palette.footerTextColor !== undefined) merged.footer = { ...merged.footer, textColor: palette.footerTextColor };
    if (palette.stripeBackground !== undefined) merged.stripe = { ...merged.stripe, background: palette.stripeBackground };

    return merged;
};

export interface StyleResolutionInput {
    preset?: GridPresetName;
    palette?: GridPalette;
    styles?: SectionStyles;
}

export interface StyleLayers {
    forSection(section: GridSection, isStripe: boolean): Partial<CellStyle>;
    forColumn(key: string | number): Partial<CellStyle>;
}

export function createStyleLayers(input: StyleResolutionInput): StyleLayers {
    const preset = applyPalette(presetDefinitions[input.preset ?? 'lined'], input.palette);
    const custom = input.styles ?? {};

    const sectionCache = new Map<string, Partial<CellStyle>>();

    return {
        forSection(section: GridSection, isStripe: boolean): Partial<CellStyle> {
            const cacheKey = `${section}:${isStripe}`;
            const cached = sectionCache.get(cacheKey);
            if (cached) return cached;

            const presetSection = section === 'header' ? preset.header : section === 'footer' ? preset.footer : preset.body;
            const customSection = section === 'header' ? custom.header : section === 'footer' ? custom.footer : custom.body;

            const resolved: Partial<CellStyle> = {
                ...preset.all,
                ...presetSection,
                ...(isStripe && section === 'body' ? preset.stripe : undefined),
                ...custom.all,
                ...customSection,
                ...(isStripe && section === 'body' ? custom.stripe : undefined),
            };

            sectionCache.set(cacheKey, resolved);
            return resolved;
        },
        forColumn(key: string | number): Partial<CellStyle> {
            return custom.columns?.[key] ?? {};
        },
    };
}

export function listGridPresets(): GridPresetName[] {
    return Object.keys(presetDefinitions) as GridPresetName[];
}
