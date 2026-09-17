import { winAnsiCodeForCharacter } from './encoding';
import {
    type FontMetricTable,
    type FontSelector,
    type StandardFontId,
    resolveStandardFontId,
    standardFontMetrics,
} from './standard-metrics';

export interface RegisteredFont {
    id: string;
    postScriptName: string;
    metrics: FontMetricTable;
    resourceName: string;
}

export interface TextMeasureOptions {
    fontSize: number;
    characterSpacing?: number;
    wordSpacing?: number;
    horizontalScale?: number;
}

const glyphWidth = (metrics: FontMetricTable, character: string): number => {
    const code = winAnsiCodeForCharacter(character);
    const width = metrics.widths[code];
    return width === undefined ? metrics.defaultWidth : width;
};

export class FontRegistry {
    private readonly fonts = new Map<string, RegisteredFont>();
    private resourceCounter = 0;

    resolve(selector: FontSelector): RegisteredFont {
        const postScriptName = resolveStandardFontId(selector);
        return this.register(postScriptName);
    }

    register(postScriptName: StandardFontId): RegisteredFont {
        const existing = this.fonts.get(postScriptName);
        if (existing) return existing;

        const metrics = standardFontMetrics[postScriptName];
        if (!metrics) throw new Error(`Unknown standard font: ${postScriptName}`);

        this.resourceCounter += 1;
        const font: RegisteredFont = {
            id: postScriptName,
            postScriptName,
            metrics,
            resourceName: `F${this.resourceCounter}`,
        };

        this.fonts.set(postScriptName, font);
        return font;
    }

    all(): RegisteredFont[] {
        return [...this.fonts.values()];
    }
}

export function measureTextWidth(font: RegisteredFont, text: string, options: TextMeasureOptions): number {
    if (!text) return 0;

    const { fontSize, characterSpacing = 0, wordSpacing = 0, horizontalScale = 1 } = options;
    let unitWidth = 0;
    let characterCount = 0;
    let spaceCount = 0;

    for (const character of text) {
        unitWidth += glyphWidth(font.metrics, character);
        characterCount += 1;
        if (character === ' ') spaceCount += 1;
    }

    const base = (unitWidth / 1000) * fontSize;
    return (base + characterSpacing * characterCount + wordSpacing * spaceCount) * horizontalScale;
}

export function measureCharacterWidths(font: RegisteredFont, text: string, options: TextMeasureOptions): number[] {
    const { fontSize, characterSpacing = 0, horizontalScale = 1 } = options;
    const widths: number[] = [];

    for (const character of text) {
        const width = (glyphWidth(font.metrics, character) / 1000) * fontSize + characterSpacing;
        widths.push(width * horizontalScale);
    }

    return widths;
}

export function fontAscent(font: RegisteredFont, fontSize: number): number {
    return (font.metrics.ascender / 1000) * fontSize;
}

export function fontDescent(font: RegisteredFont, fontSize: number): number {
    return (font.metrics.descender / 1000) * fontSize;
}
