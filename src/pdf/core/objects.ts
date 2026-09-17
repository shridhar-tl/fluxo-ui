import { ByteWriter, formatNumber, latin1ToBytes, utf8ToBytes } from './byte-writer';

export type PdfValue =
    | PdfName
    | PdfString
    | PdfHexString
    | PdfRef
    | PdfDict
    | PdfArray
    | PdfStream
    | PdfRaw
    | number
    | boolean
    | null;

export class PdfName {
    constructor(readonly value: string) {}

    toString(): string {
        return `/${escapeNameToken(this.value)}`;
    }
}

export class PdfRaw {
    constructor(readonly value: string) {}

    toString(): string {
        return this.value;
    }
}

export class PdfRef {
    constructor(readonly id: number, readonly generation = 0) {}

    toString(): string {
        return `${this.id} ${this.generation} R`;
    }
}

export class PdfString {
    constructor(readonly value: string) {}
}

export class PdfHexString {
    constructor(readonly bytes: Uint8Array) {}
}

export class PdfArray {
    constructor(readonly items: PdfValue[] = []) {}

    push(value: PdfValue): this {
        this.items.push(value);
        return this;
    }
}

export class PdfDict {
    readonly entries = new Map<string, PdfValue>();

    constructor(initial?: Record<string, PdfValue>) {
        if (initial) {
            for (const [key, value] of Object.entries(initial)) {
                if (value !== undefined) this.entries.set(key, value);
            }
        }
    }

    set(key: string, value: PdfValue | undefined): this {
        if (value !== undefined) this.entries.set(key, value);
        return this;
    }

    get(key: string): PdfValue | undefined {
        return this.entries.get(key);
    }

    has(key: string): boolean {
        return this.entries.has(key);
    }
}

export class PdfStream {
    constructor(readonly dict: PdfDict, readonly data: Uint8Array) {}
}

const nameEscapePattern = /[^\w.\-+]/g;

function escapeNameToken(value: string): string {
    return value.replace(nameEscapePattern, (char) => `#${char.charCodeAt(0).toString(16).padStart(2, '0')}`);
}

const needsUnicodeEncoding = (value: string): boolean => {
    for (let index = 0; index < value.length; index += 1) {
        if (value.charCodeAt(index) > 0xff) return true;
    }
    return false;
};

function encodeTextString(value: string): Uint8Array {
    if (!needsUnicodeEncoding(value)) {
        return latin1ToBytes(value);
    }
    const utf16 = [0xfe, 0xff];
    for (let index = 0; index < value.length; index += 1) {
        const code = value.charCodeAt(index);
        utf16.push((code >> 8) & 0xff, code & 0xff);
    }
    return Uint8Array.from(utf16);
}

function escapeLiteralString(bytes: Uint8Array): string {
    let result = '';
    for (let index = 0; index < bytes.length; index += 1) {
        const byte = bytes[index];
        if (byte === 0x28 || byte === 0x29 || byte === 0x5c) {
            result += `\\${String.fromCharCode(byte)}`;
        } else if (byte === 0x0d) {
            result += '\\r';
        } else if (byte === 0x0a) {
            result += '\\n';
        } else if (byte === 0x09) {
            result += '\\t';
        } else if (byte < 0x20 || byte > 0x7e) {
            result += `\\${byte.toString(8).padStart(3, '0')}`;
        } else {
            result += String.fromCharCode(byte);
        }
    }
    return result;
}

function bytesToHexString(bytes: Uint8Array): string {
    let result = '';
    for (let index = 0; index < bytes.length; index += 1) {
        result += bytes[index].toString(16).padStart(2, '0');
    }
    return result;
}

export function serializeValue(value: PdfValue): string {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (typeof value === 'number') return formatNumber(value);
    if (value instanceof PdfName) return value.toString();
    if (value instanceof PdfRaw) return value.value;
    if (value instanceof PdfRef) return value.toString();
    if (value instanceof PdfString) return `(${escapeLiteralString(encodeTextString(value.value))})`;
    if (value instanceof PdfHexString) return `<${bytesToHexString(value.bytes)}>`;
    if (value instanceof PdfArray) return `[${value.items.map(serializeValue).join(' ')}]`;
    if (value instanceof PdfDict) return serializeDict(value);
    if (value instanceof PdfStream) return serializeDict(value.dict);
    return 'null';
}

function serializeDict(dict: PdfDict): string {
    const parts: string[] = [];
    for (const [key, entry] of dict.entries) {
        parts.push(`/${escapeNameToken(key)} ${serializeValue(entry)}`);
    }
    return `<<${parts.join(' ')}>>`;
}

export interface IndirectObject {
    id: number;
    value: PdfValue;
}

export class PdfObjectStore {
    private readonly objects = new Map<number, PdfValue>();
    private nextId = 1;

    allocate(): PdfRef {
        const id = this.nextId;
        this.nextId += 1;
        return new PdfRef(id);
    }

    assign(ref: PdfRef, value: PdfValue): PdfRef {
        this.objects.set(ref.id, value);
        return ref;
    }

    add(value: PdfValue): PdfRef {
        const ref = this.allocate();
        return this.assign(ref, value);
    }

    get(ref: PdfRef): PdfValue | undefined {
        return this.objects.get(ref.id);
    }

    get size(): number {
        return this.nextId - 1;
    }

    entries(): IndirectObject[] {
        const result: IndirectObject[] = [];
        for (let id = 1; id < this.nextId; id += 1) {
            const value = this.objects.get(id);
            result.push({ id, value: value === undefined ? null : value });
        }
        return result;
    }
}

export function writeIndirectObject(writer: ByteWriter, object: IndirectObject): void {
    writer.push(`${object.id} 0 obj\n`);

    if (object.value instanceof PdfStream) {
        const stream = object.value;
        stream.dict.set('Length', stream.data.length);
        writer.push(serializeDict(stream.dict));
        writer.push('\nstream\n');
        writer.push(stream.data);
        writer.push('\nendstream');
    } else {
        writer.push(serializeValue(object.value));
    }

    writer.push('\nendobj\n');
}

export function pdfTextString(value: string): PdfString {
    return new PdfString(value);
}

export function pdfUtf8HexString(value: string): PdfHexString {
    return new PdfHexString(utf8ToBytes(value));
}
