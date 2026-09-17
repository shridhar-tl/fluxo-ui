const adler32 = (data: Uint8Array): number => {
    let low = 1;
    let high = 0;

    for (let index = 0; index < data.length; index += 1) {
        low = (low + data[index]) % 65521;
        high = (high + low) % 65521;
    }

    return ((high << 16) | low) >>> 0;
};

export function deflateStore(data: Uint8Array): Uint8Array {
    const blockLimit = 65535;
    const blockCount = Math.max(1, Math.ceil(data.length / blockLimit));
    const output = new Uint8Array(2 + data.length + blockCount * 5 + 4);

    let position = 0;
    output[position] = 0x78;
    position += 1;
    output[position] = 0x01;
    position += 1;

    for (let blockIndex = 0; blockIndex < blockCount; blockIndex += 1) {
        const start = blockIndex * blockLimit;
        const size = Math.min(blockLimit, data.length - start);
        const isFinal = blockIndex === blockCount - 1;

        output[position] = isFinal ? 1 : 0;
        position += 1;
        output[position] = size & 0xff;
        position += 1;
        output[position] = (size >> 8) & 0xff;
        position += 1;
        output[position] = ~size & 0xff;
        position += 1;
        output[position] = (~size >> 8) & 0xff;
        position += 1;

        output.set(data.subarray(start, start + size), position);
        position += size;
    }

    const checksum = adler32(data);
    output[position] = (checksum >> 24) & 0xff;
    position += 1;
    output[position] = (checksum >> 16) & 0xff;
    position += 1;
    output[position] = (checksum >> 8) & 0xff;
    position += 1;
    output[position] = checksum & 0xff;
    position += 1;

    return output.subarray(0, position);
}

const lengthBaseTable = [
    3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258,
];
const lengthExtraTable = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];
const distanceBaseTable = [
    1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145,
    8193, 12289, 16385, 24577,
];
const distanceExtraTable = [
    0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13,
];
const codeLengthOrder = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];

interface HuffmanTable {
    counts: Int32Array;
    symbols: Int32Array;
}

function buildHuffmanTable(lengths: Uint8Array | number[], count: number): HuffmanTable {
    const counts = new Int32Array(16);
    for (let index = 0; index < count; index += 1) {
        counts[lengths[index]] += 1;
    }
    counts[0] = 0;

    const offsets = new Int32Array(16);
    for (let bits = 1; bits < 16; bits += 1) {
        offsets[bits] = offsets[bits - 1] + counts[bits - 1];
    }

    const symbols = new Int32Array(count);
    for (let index = 0; index < count; index += 1) {
        if (lengths[index] !== 0) {
            symbols[offsets[lengths[index]]] = index;
            offsets[lengths[index]] += 1;
        }
    }

    return { counts, symbols };
}

class BitReader {
    private bitBuffer = 0;
    private bitCount = 0;
    position: number;

    constructor(private readonly data: Uint8Array, startOffset: number) {
        this.position = startOffset;
    }

    readBits(count: number): number {
        while (this.bitCount < count) {
            if (this.position >= this.data.length) throw new Error('Compressed stream ended unexpectedly.');
            this.bitBuffer |= this.data[this.position] << this.bitCount;
            this.position += 1;
            this.bitCount += 8;
        }

        const value = this.bitBuffer & ((1 << count) - 1);
        this.bitBuffer >>>= count;
        this.bitCount -= count;
        return value;
    }

    decodeSymbol(table: HuffmanTable): number {
        let code = 0;
        let first = 0;
        let index = 0;

        for (let length = 1; length < 16; length += 1) {
            code |= this.readBits(1);
            const count = table.counts[length];

            if (code - first < count) {
                return table.symbols[index + (code - first)];
            }

            index += count;
            first = (first + count) << 1;
            code <<= 1;
        }

        throw new Error('Malformed compressed data: invalid Huffman code.');
    }

    alignToByte(): void {
        this.bitBuffer = 0;
        this.bitCount = 0;
    }
}

const fixedLiteralTable = ((): HuffmanTable => {
    const lengths = new Uint8Array(288);
    lengths.fill(8, 0, 144);
    lengths.fill(9, 144, 256);
    lengths.fill(7, 256, 280);
    lengths.fill(8, 280, 288);
    return buildHuffmanTable(lengths, 288);
})();

const fixedDistanceTable = ((): HuffmanTable => {
    const lengths = new Uint8Array(30).fill(5);
    return buildHuffmanTable(lengths, 30);
})();

function readDynamicTables(reader: BitReader): { literals: HuffmanTable; distances: HuffmanTable } {
    const literalCount = reader.readBits(5) + 257;
    const distanceCount = reader.readBits(5) + 1;
    const codeLengthCount = reader.readBits(4) + 4;

    const codeLengths = new Uint8Array(19);
    for (let index = 0; index < codeLengthCount; index += 1) {
        codeLengths[codeLengthOrder[index]] = reader.readBits(3);
    }

    const codeLengthTable = buildHuffmanTable(codeLengths, 19);
    const combined = new Uint8Array(literalCount + distanceCount);

    let index = 0;
    while (index < combined.length) {
        const symbol = reader.decodeSymbol(codeLengthTable);

        if (symbol < 16) {
            combined[index] = symbol;
            index += 1;
        } else if (symbol === 16) {
            const previous = combined[index - 1];
            const repeat = 3 + reader.readBits(2);
            for (let step = 0; step < repeat; step += 1) {
                combined[index] = previous;
                index += 1;
            }
        } else if (symbol === 17) {
            const repeat = 3 + reader.readBits(3);
            index += repeat;
        } else {
            const repeat = 11 + reader.readBits(7);
            index += repeat;
        }
    }

    return {
        literals: buildHuffmanTable(combined.subarray(0, literalCount), literalCount),
        distances: buildHuffmanTable(combined.subarray(literalCount), distanceCount),
    };
}

export function inflate(source: Uint8Array): Uint8Array {
    const hasZlibHeader = source.length > 1 && (source[0] & 0x0f) === 8 && ((source[0] << 8) | source[1]) % 31 === 0;
    const reader = new BitReader(source, hasZlibHeader ? 2 : 0);

    const blocks: Uint8Array[] = [];
    let output = new Uint8Array(Math.max(1024, source.length * 4));
    let outputLength = 0;

    const ensureCapacity = (additional: number): void => {
        if (outputLength + additional <= output.length) return;
        let nextSize = output.length * 2;
        while (nextSize < outputLength + additional) nextSize *= 2;
        const expanded = new Uint8Array(nextSize);
        expanded.set(output.subarray(0, outputLength));
        output = expanded;
    };

    let isFinalBlock = false;

    while (!isFinalBlock) {
        isFinalBlock = reader.readBits(1) === 1;
        const blockType = reader.readBits(2);

        if (blockType === 0) {
            reader.alignToByte();
            const start = reader.position;
            const size = source[start] | (source[start + 1] << 8);
            ensureCapacity(size);
            output.set(source.subarray(start + 4, start + 4 + size), outputLength);
            outputLength += size;
            reader.position = start + 4 + size;
            continue;
        }

        if (blockType === 3) throw new Error('Malformed compressed data: reserved block type.');

        const tables = blockType === 1 ? { literals: fixedLiteralTable, distances: fixedDistanceTable } : readDynamicTables(reader);

        for (;;) {
            const symbol = reader.decodeSymbol(tables.literals);

            if (symbol < 256) {
                ensureCapacity(1);
                output[outputLength] = symbol;
                outputLength += 1;
                continue;
            }

            if (symbol === 256) break;

            const lengthIndex = symbol - 257;
            const length = lengthBaseTable[lengthIndex] + reader.readBits(lengthExtraTable[lengthIndex]);
            const distanceSymbol = reader.decodeSymbol(tables.distances);
            const distance = distanceBaseTable[distanceSymbol] + reader.readBits(distanceExtraTable[distanceSymbol]);

            ensureCapacity(length);
            let copyFrom = outputLength - distance;
            for (let step = 0; step < length; step += 1) {
                output[outputLength] = output[copyFrom];
                outputLength += 1;
                copyFrom += 1;
            }
        }
    }

    blocks.length = 0;
    return output.subarray(0, outputLength);
}
