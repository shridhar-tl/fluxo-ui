type CodeEntry = readonly [number, number, number];

const lengthCodeTable: readonly CodeEntry[] = [
    [3, 257, 0],
    [4, 258, 0],
    [5, 259, 0],
    [6, 260, 0],
    [7, 261, 0],
    [8, 262, 0],
    [9, 263, 0],
    [10, 264, 0],
    [11, 265, 1],
    [13, 266, 1],
    [15, 267, 1],
    [17, 268, 1],
    [19, 269, 2],
    [23, 270, 2],
    [27, 271, 2],
    [31, 272, 2],
    [35, 273, 3],
    [43, 274, 3],
    [51, 275, 3],
    [59, 276, 3],
    [67, 277, 4],
    [83, 278, 4],
    [99, 279, 4],
    [115, 280, 4],
    [131, 281, 5],
    [163, 282, 5],
    [195, 283, 5],
    [227, 284, 5],
    [258, 285, 0],
] as const;

const distanceCodeTable: readonly CodeEntry[] = [
    [1, 0, 0],
    [2, 1, 0],
    [3, 2, 0],
    [4, 3, 0],
    [5, 4, 1],
    [7, 5, 1],
    [9, 6, 2],
    [13, 7, 2],
    [17, 8, 3],
    [25, 9, 3],
    [33, 10, 4],
    [49, 11, 4],
    [65, 12, 5],
    [97, 13, 5],
    [129, 14, 6],
    [193, 15, 6],
    [257, 16, 7],
    [385, 17, 7],
    [513, 18, 8],
    [769, 19, 8],
    [1025, 20, 9],
    [1537, 21, 9],
    [2049, 22, 10],
    [3073, 23, 10],
    [4097, 24, 11],
    [6145, 25, 11],
    [8193, 26, 12],
    [12289, 27, 12],
    [16385, 28, 13],
    [24577, 29, 13],
] as const;

const reverseBits = (value: number, count: number): number => {
    let result = 0;
    for (let index = 0; index < count; index += 1) {
        result = (result << 1) | ((value >> index) & 1);
    }
    return result;
};

class BitWriter {
    private bytes: number[] = [];
    private bitBuffer = 0;
    private bitCount = 0;

    writeBits(value: number, count: number): void {
        this.bitBuffer |= (value & ((1 << count) - 1)) << this.bitCount;
        this.bitCount += count;

        while (this.bitCount >= 8) {
            this.bytes.push(this.bitBuffer & 0xff);
            this.bitBuffer >>>= 8;
            this.bitCount -= 8;
        }
    }

    writeHuffman(code: number, length: number): void {
        this.writeBits(reverseBits(code, length), length);
    }

    flush(): void {
        if (this.bitCount > 0) {
            this.bytes.push(this.bitBuffer & 0xff);
            this.bitBuffer = 0;
            this.bitCount = 0;
        }
    }

    toBytes(): Uint8Array {
        return Uint8Array.from(this.bytes);
    }
}

const fixedLiteralCode = (symbol: number): { code: number; length: number } => {
    if (symbol <= 143) return { code: 0x30 + symbol, length: 8 };
    if (symbol <= 255) return { code: 0x190 + (symbol - 144), length: 9 };
    if (symbol <= 279) return { code: symbol - 256, length: 7 };
    return { code: 0xc0 + (symbol - 280), length: 8 };
};

const adler32 = (data: Uint8Array): number => {
    let low = 1;
    let high = 0;

    for (let index = 0; index < data.length; index += 1) {
        low = (low + data[index]) % 65521;
        high = (high + low) % 65521;
    }

    return ((high << 16) | low) >>> 0;
};

const windowSize = 32768;
const minimumMatch = 3;
const maximumMatch = 258;
const hashSize = 1 << 15;

export function deflateCompress(data: Uint8Array): Uint8Array {
    const writer = new BitWriter();

    writer.writeBits(1, 1);
    writer.writeBits(1, 2);

    const head = new Int32Array(hashSize).fill(-1);
    const previous = new Int32Array(data.length).fill(-1);

    const hashAt = (position: number): number =>
        ((data[position] << 10) ^ (data[position + 1] << 5) ^ data[position + 2]) & (hashSize - 1);

    const emitLiteral = (byte: number): void => {
        const { code, length } = fixedLiteralCode(byte);
        writer.writeHuffman(code, length);
    };

    let position = 0;

    while (position < data.length) {
        let matchLength = 0;
        let matchDistance = 0;

        if (position + minimumMatch <= data.length) {
            const bucket = hashAt(position);
            let candidate = head[bucket];
            let attempts = 64;

            while (candidate >= 0 && attempts > 0 && position - candidate <= windowSize) {
                attempts -= 1;

                let length = 0;
                const limit = Math.min(maximumMatch, data.length - position);
                while (length < limit && data[candidate + length] === data[position + length]) {
                    length += 1;
                }

                if (length > matchLength) {
                    matchLength = length;
                    matchDistance = position - candidate;
                    if (length >= maximumMatch) break;
                }

                candidate = previous[candidate];
            }

            previous[position] = head[bucket];
            head[bucket] = position;
        }

        if (matchLength >= minimumMatch) {
            let lengthEntry: CodeEntry = lengthCodeTable[0];
            for (let index = lengthCodeTable.length - 1; index >= 0; index -= 1) {
                if (matchLength >= lengthCodeTable[index][0]) {
                    lengthEntry = lengthCodeTable[index];
                    break;
                }
            }

            const { code, length } = fixedLiteralCode(lengthEntry[1]);
            writer.writeHuffman(code, length);
            if (lengthEntry[2] > 0) writer.writeBits(matchLength - lengthEntry[0], lengthEntry[2]);

            let distanceEntry: CodeEntry = distanceCodeTable[0];
            for (let index = distanceCodeTable.length - 1; index >= 0; index -= 1) {
                if (matchDistance >= distanceCodeTable[index][0]) {
                    distanceEntry = distanceCodeTable[index];
                    break;
                }
            }

            writer.writeHuffman(distanceEntry[1], 5);
            if (distanceEntry[2] > 0) writer.writeBits(matchDistance - distanceEntry[0], distanceEntry[2]);

            for (let step = 1; step < matchLength; step += 1) {
                const next = position + step;
                if (next + minimumMatch <= data.length) {
                    const bucket = hashAt(next);
                    previous[next] = head[bucket];
                    head[bucket] = next;
                }
            }

            position += matchLength;
            continue;
        }

        emitLiteral(data[position]);
        position += 1;
    }

    const endCode = fixedLiteralCode(256);
    writer.writeHuffman(endCode.code, endCode.length);
    writer.flush();

    const payload = writer.toBytes();
    const checksum = adler32(data);
    const output = new Uint8Array(payload.length + 6);

    output[0] = 0x78;
    output[1] = 0x9c;
    output.set(payload, 2);

    const tail = payload.length + 2;
    output[tail] = (checksum >>> 24) & 0xff;
    output[tail + 1] = (checksum >>> 16) & 0xff;
    output[tail + 2] = (checksum >>> 8) & 0xff;
    output[tail + 3] = checksum & 0xff;

    return output;
}
