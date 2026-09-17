export type BinaryChunk = string | Uint8Array;

const textEncoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;

export function latin1ToBytes(value: string): Uint8Array {
    const bytes = new Uint8Array(value.length);
    for (let index = 0; index < value.length; index += 1) {
        bytes[index] = value.charCodeAt(index) & 0xff;
    }
    return bytes;
}

export function bytesToLatin1(bytes: Uint8Array): string {
    let result = '';
    const blockSize = 0x8000;
    for (let offset = 0; offset < bytes.length; offset += blockSize) {
        const block = bytes.subarray(offset, offset + blockSize);
        result += String.fromCharCode(...block);
    }
    return result;
}

export function utf8ToBytes(value: string): Uint8Array {
    if (textEncoder) return textEncoder.encode(value);
    return latin1ToBytes(unescape(encodeURIComponent(value)));
}

export class ByteWriter {
    private chunks: Uint8Array[] = [];
    private length = 0;

    get offset(): number {
        return this.length;
    }

    push(chunk: BinaryChunk): this {
        const bytes = typeof chunk === 'string' ? latin1ToBytes(chunk) : chunk;
        this.chunks.push(bytes);
        this.length += bytes.length;
        return this;
    }

    pushLine(chunk: BinaryChunk = ''): this {
        this.push(chunk);
        this.push('\n');
        return this;
    }

    toBytes(): Uint8Array {
        const result = new Uint8Array(this.length);
        let position = 0;
        for (const chunk of this.chunks) {
            result.set(chunk, position);
            position += chunk.length;
        }
        return result;
    }

    reset(): void {
        this.chunks = [];
        this.length = 0;
    }
}

export function concatBytes(parts: Uint8Array[]): Uint8Array {
    const total = parts.reduce((sum, part) => sum + part.length, 0);
    const result = new Uint8Array(total);
    let position = 0;
    for (const part of parts) {
        result.set(part, position);
        position += part.length;
    }
    return result;
}

const base64Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function bytesToBase64(bytes: Uint8Array): string {
    let result = '';
    let index = 0;

    for (; index + 2 < bytes.length; index += 3) {
        const triplet = (bytes[index] << 16) | (bytes[index + 1] << 8) | bytes[index + 2];
        result +=
            base64Alphabet[(triplet >> 18) & 0x3f] +
            base64Alphabet[(triplet >> 12) & 0x3f] +
            base64Alphabet[(triplet >> 6) & 0x3f] +
            base64Alphabet[triplet & 0x3f];
    }

    const remaining = bytes.length - index;
    if (remaining === 1) {
        const value = bytes[index] << 16;
        result += base64Alphabet[(value >> 18) & 0x3f] + base64Alphabet[(value >> 12) & 0x3f] + '==';
    } else if (remaining === 2) {
        const value = (bytes[index] << 16) | (bytes[index + 1] << 8);
        result +=
            base64Alphabet[(value >> 18) & 0x3f] +
            base64Alphabet[(value >> 12) & 0x3f] +
            base64Alphabet[(value >> 6) & 0x3f] +
            '=';
    }

    return result;
}

const base64Lookup = ((): Uint8Array => {
    const table = new Uint8Array(256).fill(255);
    for (let index = 0; index < base64Alphabet.length; index += 1) {
        table[base64Alphabet.charCodeAt(index)] = index;
    }
    return table;
})();

export function base64ToBytes(value: string): Uint8Array {
    const cleaned = value.replace(/^data:[^;]*;base64,/, '').replace(/[\s=]/g, '');
    const output = new Uint8Array(Math.floor((cleaned.length * 3) / 4));

    let outputIndex = 0;
    let buffer = 0;
    let bitsCollected = 0;

    for (let index = 0; index < cleaned.length; index += 1) {
        const decoded = base64Lookup[cleaned.charCodeAt(index)];
        if (decoded === 255) continue;
        buffer = (buffer << 6) | decoded;
        bitsCollected += 6;
        if (bitsCollected >= 8) {
            bitsCollected -= 8;
            output[outputIndex] = (buffer >> bitsCollected) & 0xff;
            outputIndex += 1;
        }
    }

    return output.subarray(0, outputIndex);
}

export function formatNumber(value: number, precision = 4): string {
    if (!Number.isFinite(value)) return '0';
    const rounded = Number(value.toFixed(precision));
    if (Number.isInteger(rounded)) return String(rounded);
    return String(rounded);
}
