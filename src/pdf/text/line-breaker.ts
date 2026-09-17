import { type RegisteredFont, type TextMeasureOptions, measureTextWidth } from './font-registry';

export interface WrapOptions extends TextMeasureOptions {
    maxWidth: number;
    breakLongWords?: boolean;
    maxLines?: number;
    ellipsis?: string;
}

export interface WrappedLine {
    text: string;
    width: number;
    truncated: boolean;
}

const explicitBreakPattern = /\r\n|\r|\n/;
const breakableWhitespace = /[^\S ]+/;

const splitOversizedWord = (
    font: RegisteredFont,
    word: string,
    options: WrapOptions,
): { segments: string[] } => {
    const segments: string[] = [];
    let current = '';

    for (const character of word) {
        const candidate = current + character;
        if (current.length > 0 && measureTextWidth(font, candidate, options) > options.maxWidth) {
            segments.push(current);
            current = character;
        } else {
            current = candidate;
        }
    }

    if (current.length > 0) segments.push(current);
    return { segments };
};

function wrapParagraph(font: RegisteredFont, paragraph: string, options: WrapOptions): string[] {
    if (paragraph.length === 0) return [''];

    const breakLongWords = options.breakLongWords !== false;
    const words = paragraph.split(breakableWhitespace).filter((word) => word.length > 0);
    if (words.length === 0) return [''];

    const lines: string[] = [];
    let currentLine = '';

    const flush = (): void => {
        if (currentLine.length > 0) {
            lines.push(currentLine);
            currentLine = '';
        }
    };

    for (const word of words) {
        const candidate = currentLine.length === 0 ? word : `${currentLine} ${word}`;

        if (measureTextWidth(font, candidate, options) <= options.maxWidth) {
            currentLine = candidate;
            continue;
        }

        flush();

        if (!breakLongWords || measureTextWidth(font, word, options) <= options.maxWidth) {
            currentLine = word;
            continue;
        }

        const { segments } = splitOversizedWord(font, word, options);
        for (let index = 0; index < segments.length - 1; index += 1) {
            lines.push(segments[index]);
        }
        currentLine = segments[segments.length - 1] ?? '';
    }

    flush();
    return lines.length > 0 ? lines : [''];
}

function appendEllipsis(font: RegisteredFont, text: string, options: WrapOptions): string {
    const marker = options.ellipsis ?? '…';

    let truncated = text;
    while (truncated.length > 0) {
        const candidate = `${truncated.trimEnd()}${marker}`;
        if (measureTextWidth(font, candidate, options) <= options.maxWidth) return candidate;
        truncated = truncated.slice(0, -1);
    }

    return marker;
}

export function wrapText(font: RegisteredFont, text: string, options: WrapOptions): WrappedLine[] {
    const source = text ?? '';
    const paragraphs = source.split(explicitBreakPattern);

    let lines: string[] = [];
    for (const paragraph of paragraphs) {
        lines = lines.concat(wrapParagraph(font, paragraph, options));
    }

    const limit = options.maxLines;
    if (limit !== undefined && limit > 0 && lines.length > limit) {
        const retained = lines.slice(0, limit);
        const lastIndex = retained.length - 1;
        retained[lastIndex] = appendEllipsis(font, retained[lastIndex], options);

        return retained.map((line, index) => ({
            text: line,
            width: measureTextWidth(font, line, options),
            truncated: index === lastIndex,
        }));
    }

    return lines.map((line) => ({
        text: line,
        width: measureTextWidth(font, line, options),
        truncated: false,
    }));
}

export function splitIntoLines(text: string): string[] {
    return (text ?? '').split(explicitBreakPattern);
}

export function measureBlockHeight(lineCount: number, fontSize: number, lineHeightFactor = 1.15): number {
    return lineCount * fontSize * lineHeightFactor;
}
