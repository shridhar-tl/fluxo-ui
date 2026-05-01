export type BarcodeFormat = 'CODE128' | 'CODE39' | 'EAN13' | 'EAN8' | 'UPC' | 'ITF';

export interface EncodedBarcode {
    bars: string;
    text: string;
}

const code39Table: Record<string, string> = {
    '0': '101000111011101',
    '1': '111010001010111',
    '2': '101110001010111',
    '3': '111011100010101',
    '4': '101000111010111',
    '5': '111010001110101',
    '6': '101110001110101',
    '7': '101000101110111',
    '8': '111010001011101',
    '9': '101110001011101',
    A: '111010100010111',
    B: '101110100010111',
    C: '111011101000101',
    D: '101011100010111',
    E: '111010111000101',
    F: '101110111000101',
    G: '101010001110111',
    H: '111010100011101',
    I: '101110100011101',
    J: '101011100011101',
    K: '111010101000111',
    L: '101110101000111',
    M: '111011101010001',
    N: '101011101000111',
    O: '111010111010001',
    P: '101110111010001',
    Q: '101010111000111',
    R: '111010101110001',
    S: '101110101110001',
    T: '101011101110001',
    U: '111000101010111',
    V: '100011101010111',
    W: '111000111010101',
    X: '100010111010111',
    Y: '111000101110101',
    Z: '100011101110101',
    '-': '100010101110111',
    '.': '111000101011101',
    ' ': '100011101011101',
    $: '100010001000101',
    '/': '100010001010001',
    '+': '100010100010001',
    '%': '101000100010001',
    '*': '100010111011101',
};

const code128B: Record<string, number> = {};
for (let i = 32; i < 128; i += 1) {
    code128B[String.fromCharCode(i)] = i - 32;
}

const code128Patterns: string[] = [
    '11011001100', '11001101100', '11001100110', '10010011000', '10010001100',
    '10001001100', '10011001000', '10011000100', '10001100100', '11001001000',
    '11001000100', '11000100100', '10110011100', '10011011100', '10011001110',
    '10111001100', '10011101100', '10011100110', '11001110010', '11001011100',
    '11001001110', '11011100100', '11001110100', '11101101110', '11101001100',
    '11100101100', '11100100110', '11101100100', '11100110100', '11100110010',
    '11011011000', '11011000110', '11000110110', '10100011000', '10001011000',
    '10001000110', '10110001000', '10001101000', '10001100010', '11010001000',
    '11000101000', '11000100010', '10110111000', '10110001110', '10001101110',
    '10111011000', '10111000110', '10001110110', '11101110110', '11010001110',
    '11000101110', '11011101000', '11011100010', '11011101110', '11101011000',
    '11101000110', '11100010110', '11101101000', '11101100010', '11100011010',
    '11101111010', '11001000010', '11110001010', '10100110000', '10100001100',
    '10010110000', '10010000110', '10000101100', '10000100110', '10110010000',
    '10110000100', '10011010000', '10011000010', '10000110100', '10000110010',
    '11000010010', '11001010000', '11110111010', '11000010100', '10001111010',
    '10100111100', '10010111100', '10010011110', '10111100100', '10011110100',
    '10011110010', '11110100100', '11110010100', '11110010010', '11011011110',
    '11011110110', '11110110110', '10101111000', '10100011110', '10001011110',
    '10111101000', '10111100010', '11110101000', '11110100010', '10111011110',
    '10111101110', '11101011110', '11110101110', '11010000100', '11010010000',
    '11010011100', '1100011101011',
];

const code128StopPattern = '1100011101011';

const encodeCode128 = (value: string): EncodedBarcode => {
    const codes: number[] = [];
    codes.push(104);
    let weightedSum = codes[0];
    let position = 1;
    for (const ch of value) {
        if (!(ch in code128B)) throw new Error(`CODE128: unsupported character "${ch}"`);
        const code = code128B[ch];
        codes.push(code);
        weightedSum += code * position;
        position += 1;
    }
    const checksum = weightedSum % 103;
    codes.push(checksum);
    let bars = '';
    for (const code of codes) bars += code128Patterns[code];
    bars += code128StopPattern;
    return { bars, text: value };
};

const encodeCode39 = (value: string): EncodedBarcode => {
    const upper = value.toUpperCase();
    let bars = code39Table['*'];
    for (let i = 0; i < upper.length; i += 1) {
        const ch = upper[i];
        if (!(ch in code39Table)) throw new Error(`CODE39: unsupported character "${ch}"`);
        bars += '0' + code39Table[ch];
    }
    bars += '0' + code39Table['*'];
    return { bars, text: value };
};

const ean13LeftA = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'];
const ean13LeftB = ['0100111', '0110011', '0011011', '0100001', '0011101', '0111001', '0000101', '0010001', '0001001', '0010111'];
const ean13Right = ['1110010', '1100110', '1101100', '1000010', '1011100', '1001110', '1010000', '1000100', '1001000', '1110100'];
const ean13Parity = [
    'AAAAAA', 'AABABB', 'AABBAB', 'AABBBA', 'ABAABB', 'ABBAAB', 'ABBBAA', 'ABABAB', 'ABABBA', 'ABBABA',
];

const eanChecksum = (digits: number[]): number => {
    let sumOdd = 0;
    let sumEven = 0;
    for (let i = 0; i < digits.length; i += 1) {
        if (i % 2 === 0) sumEven += digits[i];
        else sumOdd += digits[i];
    }
    const total = sumEven * 3 + sumOdd;
    return (10 - (total % 10)) % 10;
};

const upcChecksum = (digits: number[]): number => {
    let sumOdd = 0;
    let sumEven = 0;
    for (let i = 0; i < digits.length; i += 1) {
        if (i % 2 === 0) sumOdd += digits[i];
        else sumEven += digits[i];
    }
    const total = sumOdd * 3 + sumEven;
    return (10 - (total % 10)) % 10;
};

const encodeEan13 = (value: string): EncodedBarcode => {
    const digits = value.replace(/\D/g, '').split('').map((d) => parseInt(d, 10));
    let arr = digits.slice();
    if (arr.length === 12) {
        arr.push(eanChecksum(arr));
    } else if (arr.length !== 13) {
        throw new Error('EAN13: requires 12 or 13 digits');
    }
    const first = arr[0];
    const parity = ean13Parity[first];
    let bars = '101';
    for (let i = 1; i <= 6; i += 1) {
        const d = arr[i];
        bars += parity[i - 1] === 'A' ? ean13LeftA[d] : ean13LeftB[d];
    }
    bars += '01010';
    for (let i = 7; i <= 12; i += 1) {
        bars += ean13Right[arr[i]];
    }
    bars += '101';
    return { bars, text: arr.join('') };
};

const encodeEan8 = (value: string): EncodedBarcode => {
    const digits = value.replace(/\D/g, '').split('').map((d) => parseInt(d, 10));
    let arr = digits.slice();
    if (arr.length === 7) arr.push(eanChecksum(arr));
    else if (arr.length !== 8) throw new Error('EAN8: requires 7 or 8 digits');
    let bars = '101';
    for (let i = 0; i < 4; i += 1) bars += ean13LeftA[arr[i]];
    bars += '01010';
    for (let i = 4; i < 8; i += 1) bars += ean13Right[arr[i]];
    bars += '101';
    return { bars, text: arr.join('') };
};

const encodeUpc = (value: string): EncodedBarcode => {
    const digits = value.replace(/\D/g, '').split('').map((d) => parseInt(d, 10));
    let arr = digits.slice();
    if (arr.length === 11) arr.push(upcChecksum(arr));
    else if (arr.length !== 12) throw new Error('UPC: requires 11 or 12 digits');
    let bars = '101';
    for (let i = 0; i < 6; i += 1) bars += ean13LeftA[arr[i]];
    bars += '01010';
    for (let i = 6; i < 12; i += 1) bars += ean13Right[arr[i]];
    bars += '101';
    return { bars, text: arr.join('') };
};

const itfPatterns = ['00110', '10001', '01001', '11000', '00101', '10100', '01100', '00011', '10010', '01010'];

const encodeItf = (value: string): EncodedBarcode => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0 || digits.length % 2 !== 0) throw new Error('ITF: requires non-empty even-length numeric input');
    let bars = '1010';
    for (let i = 0; i < digits.length; i += 2) {
        const aPattern = itfPatterns[parseInt(digits[i], 10)];
        const bPattern = itfPatterns[parseInt(digits[i + 1], 10)];
        for (let j = 0; j < 5; j += 1) {
            bars += aPattern[j] === '1' ? '111' : '1';
            bars += bPattern[j] === '1' ? '000' : '0';
        }
    }
    bars += '11101';
    return { bars, text: digits };
};

export const encodeBarcode = (value: string, format: BarcodeFormat): EncodedBarcode => {
    switch (format) {
        case 'CODE128':
            return encodeCode128(value);
        case 'CODE39':
            return encodeCode39(value);
        case 'EAN13':
            return encodeEan13(value);
        case 'EAN8':
            return encodeEan8(value);
        case 'UPC':
            return encodeUpc(value);
        case 'ITF':
            return encodeItf(value);
        default:
            throw new Error(`Unsupported barcode format: ${format}`);
    }
};
