const winAnsiHighRange: Record<number, number> = {
    0x20ac: 128,
    0x201a: 130,
    0x0192: 131,
    0x201e: 132,
    0x2026: 133,
    0x2020: 134,
    0x2021: 135,
    0x02c6: 136,
    0x2030: 137,
    0x0160: 138,
    0x2039: 139,
    0x0152: 140,
    0x017d: 142,
    0x2018: 145,
    0x2019: 146,
    0x201c: 147,
    0x201d: 148,
    0x2022: 149,
    0x2013: 150,
    0x2014: 151,
    0x02dc: 152,
    0x2122: 153,
    0x0161: 154,
    0x203a: 155,
    0x0153: 156,
    0x017e: 158,
    0x0178: 159,
};

const fallbackTransliterations: Record<number, string> = {
    0x2212: '-',
    0x00a0: ' ',
    0x2009: ' ',
    0x200a: ' ',
    0x2002: ' ',
    0x2003: ' ',
    0x2007: ' ',
    0x2008: ' ',
    0x202f: ' ',
    0x2010: '-',
    0x2011: '-',
    0x2012: '-',
    0x2015: '-',
    0x00ad: '-',
};

export function unicodeToWinAnsi(codePoint: number): number | null {
    if (codePoint >= 0x20 && codePoint <= 0x7e) return codePoint;
    if (codePoint >= 0xa0 && codePoint <= 0xff) return codePoint;

    const mapped = winAnsiHighRange[codePoint];
    if (mapped !== undefined) return mapped;

    return null;
}

export function encodeWinAnsi(value: string): Uint8Array {
    const bytes: number[] = [];

    for (const character of value) {
        const codePoint = character.codePointAt(0);
        if (codePoint === undefined) continue;

        const direct = unicodeToWinAnsi(codePoint);
        if (direct !== null) {
            bytes.push(direct);
            continue;
        }

        const substitute = fallbackTransliterations[codePoint];
        if (substitute) {
            for (let index = 0; index < substitute.length; index += 1) {
                bytes.push(substitute.charCodeAt(index));
            }
            continue;
        }

        bytes.push(0x3f);
    }

    return Uint8Array.from(bytes);
}

export function winAnsiCodeForCharacter(character: string): number {
    const codePoint = character.codePointAt(0);
    if (codePoint === undefined) return 0x3f;

    const direct = unicodeToWinAnsi(codePoint);
    if (direct !== null) return direct;

    const substitute = fallbackTransliterations[codePoint];
    if (substitute) return substitute.charCodeAt(0);

    return 0x3f;
}

export function escapePdfStringBytes(bytes: Uint8Array): string {
    let result = '';
    for (let index = 0; index < bytes.length; index += 1) {
        const byte = bytes[index];
        if (byte === 0x28 || byte === 0x29 || byte === 0x5c) {
            result += `\\${String.fromCharCode(byte)}`;
        } else if (byte < 0x20 || byte > 0x7e) {
            result += `\\${byte.toString(8).padStart(3, '0')}`;
        } else {
            result += String.fromCharCode(byte);
        }
    }
    return result;
}
