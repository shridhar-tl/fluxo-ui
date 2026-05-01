type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

const ECCodewords: Record<ErrorCorrectionLevel, number[]> = {
    L: [
        7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30,
        30, 30, 30, 30, 30, 30, 30, 30, 30,
    ],
    M: [
        10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28,
        28, 28, 28, 28, 28, 28, 28, 28, 28, 28,
    ],
    Q: [
        13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30,
        30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
    ],
    H: [
        17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30,
        30, 30, 30, 30, 30, 30, 30, 30, 30, 30,
    ],
};

const ECBlocks: Record<ErrorCorrectionLevel, [number, number, number, number][]> = {
    L: [
        [1, 19, 7, 0], [1, 34, 10, 0], [1, 55, 15, 0], [1, 80, 20, 0], [1, 108, 26, 0], [2, 68, 18, 0], [2, 78, 20, 0], [2, 97, 24, 0], [2, 116, 30, 0], [2, 68, 18, 2],
        [4, 81, 20, 0], [2, 92, 24, 2], [4, 107, 26, 0], [3, 115, 30, 1], [5, 87, 22, 1], [5, 98, 24, 1], [1, 107, 28, 5], [5, 120, 30, 1], [3, 113, 28, 4], [3, 107, 28, 5],
        [4, 116, 28, 4], [2, 111, 28, 7], [4, 121, 30, 5], [6, 117, 30, 4], [8, 106, 26, 4], [10, 114, 28, 2], [8, 122, 30, 4], [3, 117, 30, 10], [7, 116, 30, 7], [5, 115, 30, 10],
        [13, 115, 30, 3], [17, 115, 30, 0], [17, 115, 30, 1], [13, 115, 30, 6], [12, 121, 30, 7], [6, 121, 30, 14], [17, 122, 30, 4], [4, 122, 30, 18], [20, 117, 30, 4], [19, 118, 30, 6],
    ],
    M: [
        [1, 16, 10, 0], [1, 28, 16, 0], [1, 44, 26, 0], [2, 32, 18, 0], [2, 43, 24, 0], [4, 27, 16, 0], [4, 31, 18, 0], [2, 38, 22, 2], [3, 36, 22, 2], [4, 43, 26, 1],
        [1, 50, 30, 4], [6, 36, 22, 2], [8, 37, 22, 1], [4, 40, 24, 5], [5, 41, 24, 5], [7, 45, 28, 3], [10, 46, 28, 1], [9, 43, 26, 4], [3, 44, 26, 11], [3, 41, 26, 13],
        [17, 42, 26, 0], [17, 46, 28, 0], [4, 47, 28, 14], [6, 45, 28, 14], [8, 47, 28, 13], [19, 46, 28, 4], [22, 45, 28, 3], [3, 45, 28, 23], [21, 45, 28, 7], [19, 47, 28, 10],
        [2, 46, 28, 29], [10, 46, 28, 23], [14, 46, 28, 21], [14, 46, 28, 23], [12, 47, 28, 26], [6, 47, 28, 34], [29, 46, 28, 14], [13, 46, 28, 32], [40, 47, 28, 7], [18, 47, 28, 31],
    ],
    Q: [
        [1, 13, 13, 0], [1, 22, 22, 0], [2, 17, 18, 0], [2, 24, 26, 0], [2, 15, 18, 2], [4, 19, 24, 0], [2, 14, 18, 4], [4, 18, 22, 2], [4, 16, 20, 4], [6, 19, 24, 2],
        [4, 22, 28, 4], [4, 20, 26, 6], [8, 20, 24, 4], [11, 16, 20, 5], [5, 24, 30, 7], [15, 19, 24, 2], [1, 22, 28, 15], [17, 22, 28, 1], [17, 21, 26, 4], [15, 24, 30, 5],
        [17, 22, 28, 6], [7, 24, 30, 16], [11, 24, 30, 14], [11, 24, 30, 16], [7, 24, 30, 22], [28, 22, 28, 6], [8, 23, 30, 26], [4, 24, 30, 31], [1, 23, 30, 37], [15, 24, 30, 25],
        [42, 24, 30, 1], [10, 24, 30, 35], [29, 24, 30, 19], [44, 24, 30, 7], [39, 24, 30, 14], [46, 24, 30, 10], [49, 24, 30, 10], [48, 24, 30, 14], [43, 24, 30, 22], [34, 24, 30, 34],
    ],
    H: [
        [1, 9, 17, 0], [1, 16, 28, 0], [2, 13, 22, 0], [4, 9, 16, 0], [2, 11, 22, 2], [4, 15, 28, 0], [4, 13, 26, 1], [4, 14, 26, 2], [4, 12, 24, 4], [6, 15, 28, 2],
        [3, 12, 24, 8], [7, 14, 28, 4], [12, 11, 22, 4], [11, 12, 24, 5], [11, 12, 24, 7], [3, 15, 30, 13], [2, 14, 28, 17], [2, 14, 28, 19], [9, 13, 26, 16], [15, 15, 28, 10],
        [19, 16, 30, 6], [34, 13, 24, 0], [16, 15, 30, 14], [30, 16, 30, 2], [22, 15, 30, 13], [33, 16, 30, 4], [12, 15, 30, 28], [11, 15, 30, 31], [19, 15, 30, 26], [23, 15, 30, 25],
        [23, 15, 30, 28], [19, 15, 30, 35], [11, 15, 30, 46], [59, 16, 30, 1], [22, 15, 30, 41], [2, 15, 30, 64], [24, 15, 30, 46], [42, 15, 30, 32], [10, 15, 30, 67], [20, 15, 30, 61],
    ],
};

const CapacityBytes: Record<ErrorCorrectionLevel, number[]> = {
    L: [
        17, 32, 53, 78, 106, 134, 154, 192, 230, 271, 321, 367, 425, 458, 520, 586, 644, 718, 792, 858, 929, 1003, 1091, 1171,
        1273, 1367, 1465, 1528, 1628, 1732, 1840, 1952, 2068, 2188, 2303, 2431, 2563, 2699, 2809, 2953,
    ],
    M: [
        14, 26, 42, 62, 84, 106, 122, 152, 180, 213, 251, 287, 331, 362, 412, 450, 504, 560, 624, 666, 711, 779, 857, 911, 997,
        1059, 1125, 1190, 1264, 1370, 1452, 1538, 1628, 1722, 1809, 1911, 1989, 2099, 2213, 2331,
    ],
    Q: [
        11, 20, 32, 46, 60, 74, 86, 108, 130, 151, 177, 203, 241, 258, 292, 322, 364, 394, 442, 482, 509, 565, 611, 661, 715, 751,
        805, 868, 908, 982, 1030, 1112, 1168, 1228, 1283, 1351, 1423, 1499, 1579, 1663,
    ],
    H: [
        7, 14, 24, 34, 44, 58, 64, 84, 98, 119, 137, 155, 177, 194, 220, 250, 280, 310, 338, 382, 403, 439, 461, 511, 535, 593,
        625, 658, 698, 742, 790, 842, 898, 958, 983, 1051, 1093, 1139, 1219, 1273,
    ],
};

const AlignmentPositions: number[][] = [
    [],
    [],
    [6, 18],
    [6, 22],
    [6, 26],
    [6, 30],
    [6, 34],
    [6, 22, 38],
    [6, 24, 42],
    [6, 26, 46],
    [6, 28, 50],
    [6, 30, 54],
    [6, 32, 58],
    [6, 34, 62],
    [6, 26, 46, 66],
    [6, 26, 48, 70],
    [6, 26, 50, 74],
    [6, 30, 54, 78],
    [6, 30, 56, 82],
    [6, 30, 58, 86],
    [6, 34, 62, 90],
    [6, 28, 50, 72, 94],
    [6, 26, 50, 74, 98],
    [6, 30, 54, 78, 102],
    [6, 28, 54, 80, 106],
    [6, 32, 58, 84, 110],
    [6, 30, 58, 86, 114],
    [6, 34, 62, 90, 118],
    [6, 26, 50, 74, 98, 122],
    [6, 30, 54, 78, 102, 126],
    [6, 26, 52, 78, 104, 130],
    [6, 30, 56, 82, 108, 134],
    [6, 34, 60, 86, 112, 138],
    [6, 30, 58, 86, 114, 142],
    [6, 34, 62, 90, 118, 146],
    [6, 30, 54, 78, 102, 126, 150],
    [6, 24, 50, 76, 102, 128, 154],
    [6, 28, 54, 80, 106, 132, 158],
    [6, 32, 58, 84, 110, 136, 162],
    [6, 26, 54, 82, 110, 138, 166],
    [6, 30, 58, 86, 114, 142, 170],
];

const ECLevelMap: Record<ErrorCorrectionLevel, number> = { L: 1, M: 0, Q: 3, H: 2 };

const expTable: number[] = new Array(512).fill(0);
const logTable: number[] = new Array(256).fill(0);

const initGF = () => {
    let x = 1;
    for (let i = 0; i < 255; i += 1) {
        expTable[i] = x;
        logTable[x] = i;
        x <<= 1;
        if (x & 0x100) x ^= 0x11d;
    }
    for (let i = 255; i < 512; i += 1) expTable[i] = expTable[i - 255];
};
initGF();

const gfMul = (a: number, b: number) => {
    if (a === 0 || b === 0) return 0;
    return expTable[(logTable[a] + logTable[b]) % 255];
};

const generatorPoly = (degree: number): number[] => {
    let poly = [1];
    for (let i = 0; i < degree; i += 1) {
        const next = new Array(poly.length + 1).fill(0);
        for (let j = 0; j < poly.length; j += 1) {
            next[j] ^= poly[j];
            next[j + 1] ^= gfMul(poly[j], expTable[i]);
        }
        poly = next;
    }
    return poly;
};

const reedSolomonCompute = (data: number[], degree: number): number[] => {
    const generator = generatorPoly(degree);
    const result = new Array(degree).fill(0);
    for (let i = 0; i < data.length; i += 1) {
        const factor = data[i] ^ result[0];
        result.shift();
        result.push(0);
        if (factor !== 0) {
            for (let j = 0; j < degree; j += 1) {
                result[j] ^= gfMul(generator[j + 1], factor);
            }
        }
    }
    return result;
};

const utf8Encode = (str: string): number[] => {
    const out: number[] = [];
    for (let i = 0; i < str.length; i += 1) {
        let code = str.charCodeAt(i);
        if (code < 0x80) {
            out.push(code);
        } else if (code < 0x800) {
            out.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
        } else if (code < 0xd800 || code >= 0xe000) {
            out.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
        } else {
            i += 1;
            const next = str.charCodeAt(i);
            code = 0x10000 + (((code & 0x3ff) << 10) | (next & 0x3ff));
            out.push(
                0xf0 | (code >> 18),
                0x80 | ((code >> 12) & 0x3f),
                0x80 | ((code >> 6) & 0x3f),
                0x80 | (code & 0x3f),
            );
        }
    }
    return out;
};

const chooseVersion = (bytes: number[], ec: ErrorCorrectionLevel): number => {
    const len = bytes.length;
    const cap = CapacityBytes[ec];
    for (let v = 1; v <= 40; v += 1) {
        if (len <= cap[v - 1]) return v;
    }
    throw new Error('Data too long for QR code');
};

const buildBitstream = (bytes: number[], version: number, ec: ErrorCorrectionLevel): number[] => {
    const blocks = ECBlocks[ec][version - 1];
    const ecPerBlock = ECCodewords[ec][version - 1];
    const numShortBlocks = blocks[0];
    const numLongBlocks = blocks[3] ?? 0;
    const dataPerShort = blocks[1];
    const dataPerLong = numLongBlocks > 0 ? dataPerShort + 1 : dataPerShort;
    const totalDataCodewords = numShortBlocks * dataPerShort + numLongBlocks * dataPerLong;
    const totalBits = totalDataCodewords * 8;

    const bits: number[] = [];
    const pushBits = (value: number, length: number) => {
        for (let i = length - 1; i >= 0; i -= 1) {
            bits.push((value >> i) & 1);
        }
    };

    pushBits(0b0100, 4);
    const charCountBits = version <= 9 ? 8 : 16;
    pushBits(bytes.length, charCountBits);
    for (const b of bytes) pushBits(b, 8);

    const remaining = totalBits - bits.length;
    pushBits(0, Math.min(4, remaining));
    while (bits.length % 8 !== 0) bits.push(0);

    const padBytes = [0xec, 0x11];
    let pad = 0;
    while (bits.length < totalBits) {
        pushBits(padBytes[pad % 2], 8);
        pad += 1;
    }

    const dataCodewords: number[] = [];
    for (let i = 0; i < bits.length; i += 8) {
        let v = 0;
        for (let j = 0; j < 8; j += 1) v = (v << 1) | bits[i + j];
        dataCodewords.push(v);
    }

    const blocksData: number[][] = [];
    const blocksEC: number[][] = [];
    let offset = 0;
    for (let i = 0; i < numShortBlocks; i += 1) {
        const block = dataCodewords.slice(offset, offset + dataPerShort);
        offset += dataPerShort;
        blocksData.push(block);
        blocksEC.push(reedSolomonCompute(block, ecPerBlock));
    }
    for (let i = 0; i < numLongBlocks; i += 1) {
        const block = dataCodewords.slice(offset, offset + dataPerLong);
        offset += dataPerLong;
        blocksData.push(block);
        blocksEC.push(reedSolomonCompute(block, ecPerBlock));
    }

    const finalCodewords: number[] = [];
    const maxData = Math.max(...blocksData.map((b) => b.length));
    for (let i = 0; i < maxData; i += 1) {
        for (const block of blocksData) {
            if (i < block.length) finalCodewords.push(block[i]);
        }
    }
    const maxEC = Math.max(...blocksEC.map((b) => b.length));
    for (let i = 0; i < maxEC; i += 1) {
        for (const block of blocksEC) {
            if (i < block.length) finalCodewords.push(block[i]);
        }
    }

    const finalBits: number[] = [];
    for (const cw of finalCodewords) {
        for (let i = 7; i >= 0; i -= 1) finalBits.push((cw >> i) & 1);
    }
    return finalBits;
};

const placeFinder = (matrix: number[][], reserved: boolean[][], r: number, c: number) => {
    for (let dr = -1; dr <= 7; dr += 1) {
        for (let dc = -1; dc <= 7; dc += 1) {
            const rr = r + dr;
            const cc = c + dc;
            if (rr < 0 || cc < 0 || rr >= matrix.length || cc >= matrix.length) continue;
            reserved[rr][cc] = true;
            const inBorder = dr === -1 || dr === 7 || dc === -1 || dc === 7;
            if (inBorder) {
                matrix[rr][cc] = 0;
                continue;
            }
            const onOuterRing = dr === 0 || dr === 6 || dc === 0 || dc === 6;
            const inInnerSquare = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
            matrix[rr][cc] = onOuterRing || inInnerSquare ? 1 : 0;
        }
    }
};

const placeAlignment = (matrix: number[][], reserved: boolean[][], r: number, c: number) => {
    for (let dr = -2; dr <= 2; dr += 1) {
        for (let dc = -2; dc <= 2; dc += 1) {
            const rr = r + dr;
            const cc = c + dc;
            if (rr < 0 || cc < 0 || rr >= matrix.length || cc >= matrix.length) continue;
            reserved[rr][cc] = true;
            const dist = Math.max(Math.abs(dr), Math.abs(dc));
            matrix[rr][cc] = dist === 1 ? 0 : 1;
        }
    }
};

const placeFunctionPatterns = (size: number, version: number) => {
    const matrix: number[][] = Array.from({ length: size }, () => new Array(size).fill(0));
    const reserved: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));

    placeFinder(matrix, reserved, 0, 0);
    placeFinder(matrix, reserved, 0, size - 7);
    placeFinder(matrix, reserved, size - 7, 0);

    for (let i = 8; i < size - 8; i += 1) {
        matrix[6][i] = i % 2 === 0 ? 1 : 0;
        matrix[i][6] = i % 2 === 0 ? 1 : 0;
        reserved[6][i] = true;
        reserved[i][6] = true;
    }

    const aligns = AlignmentPositions[version];
    for (let i = 0; i < aligns.length; i += 1) {
        for (let j = 0; j < aligns.length; j += 1) {
            const r = aligns[i];
            const c = aligns[j];
            if ((r === 6 && c === 6) || (r === 6 && c === size - 7) || (r === size - 7 && c === 6)) continue;
            placeAlignment(matrix, reserved, r, c);
        }
    }

    matrix[size - 8][8] = 1;
    reserved[size - 8][8] = true;

    for (let i = 0; i <= 8; i += 1) {
        reserved[8][i] = true;
        reserved[i][8] = true;
    }
    for (let i = 0; i < 8; i += 1) {
        reserved[8][size - 1 - i] = true;
        reserved[size - 1 - i][8] = true;
    }

    if (version >= 7) {
        for (let i = 0; i < 6; i += 1) {
            for (let j = size - 11; j <= size - 9; j += 1) {
                reserved[i][j] = true;
                reserved[j][i] = true;
            }
        }
    }

    return { matrix, reserved };
};

const placeData = (matrix: number[][], reserved: boolean[][], data: number[]) => {
    const size = matrix.length;
    let bitIndex = 0;
    let upward = true;

    for (let col = size - 1; col > 0; col -= 2) {
        if (col === 6) col -= 1;
        for (let i = 0; i < size; i += 1) {
            const r = upward ? size - 1 - i : i;
            for (let dc = 0; dc < 2; dc += 1) {
                const c = col - dc;
                if (!reserved[r][c]) {
                    matrix[r][c] = bitIndex < data.length ? data[bitIndex] : 0;
                    bitIndex += 1;
                }
            }
        }
        upward = !upward;
    }
};

const maskFn = (mask: number, r: number, c: number): boolean => {
    switch (mask) {
        case 0:
            return (r + c) % 2 === 0;
        case 1:
            return r % 2 === 0;
        case 2:
            return c % 3 === 0;
        case 3:
            return (r + c) % 3 === 0;
        case 4:
            return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
        case 5:
            return ((r * c) % 2) + ((r * c) % 3) === 0;
        case 6:
            return (((r * c) % 2) + ((r * c) % 3)) % 2 === 0;
        case 7:
            return (((r + c) % 2) + ((r * c) % 3)) % 2 === 0;
        default:
            return false;
    }
};

const applyMask = (matrix: number[][], reserved: boolean[][], mask: number) => {
    const result = matrix.map((row) => row.slice());
    for (let r = 0; r < matrix.length; r += 1) {
        for (let c = 0; c < matrix.length; c += 1) {
            if (!reserved[r][c] && maskFn(mask, r, c)) {
                result[r][c] ^= 1;
            }
        }
    }
    return result;
};

const finderRunPattern = [1, 1, 3, 1, 1];

const hasFinderLikeRun = (run: number[]): boolean => {
    if (run.length < 5) return false;
    const start = run.length - 5;
    const unit = run[start];
    if (unit <= 0) return false;
    for (let k = 0; k < 5; k += 1) {
        if (run[start + k] !== unit * finderRunPattern[k]) return false;
    }
    return true;
};

const computePenalty = (matrix: number[][]): number => {
    const size = matrix.length;
    let penalty = 0;

    for (let r = 0; r < size; r += 1) {
        let runLen = 1;
        const runs: number[] = [];
        let lastColor = matrix[r][0];
        for (let c = 1; c < size; c += 1) {
            if (matrix[r][c] === lastColor) {
                runLen += 1;
            } else {
                runs.push(runLen);
                if (runLen >= 5) penalty += 3 + (runLen - 5);
                if (lastColor === 0 && hasFinderLikeRun(runs)) penalty += 40;
                runLen = 1;
                lastColor = matrix[r][c];
            }
        }
        runs.push(runLen);
        if (runLen >= 5) penalty += 3 + (runLen - 5);
        if (lastColor === 0 && hasFinderLikeRun(runs)) penalty += 40;
    }

    for (let c = 0; c < size; c += 1) {
        let runLen = 1;
        const runs: number[] = [];
        let lastColor = matrix[0][c];
        for (let r = 1; r < size; r += 1) {
            if (matrix[r][c] === lastColor) {
                runLen += 1;
            } else {
                runs.push(runLen);
                if (runLen >= 5) penalty += 3 + (runLen - 5);
                if (lastColor === 0 && hasFinderLikeRun(runs)) penalty += 40;
                runLen = 1;
                lastColor = matrix[r][c];
            }
        }
        runs.push(runLen);
        if (runLen >= 5) penalty += 3 + (runLen - 5);
        if (lastColor === 0 && hasFinderLikeRun(runs)) penalty += 40;
    }

    for (let r = 0; r < size - 1; r += 1) {
        for (let c = 0; c < size - 1; c += 1) {
            const v = matrix[r][c];
            if (matrix[r][c + 1] === v && matrix[r + 1][c] === v && matrix[r + 1][c + 1] === v) penalty += 3;
        }
    }

    let dark = 0;
    for (let r = 0; r < size; r += 1) for (let c = 0; c < size; c += 1) if (matrix[r][c] === 1) dark += 1;
    const ratio = dark / (size * size);
    penalty += Math.floor(Math.abs(ratio * 100 - 50) / 5) * 10;
    return penalty;
};

const computeFormatBits = (ec: ErrorCorrectionLevel, mask: number): number[] => {
    const ecBits = ECLevelMap[ec];
    const data = (ecBits << 3) | mask;
    let rem = data << 10;
    const g = 0b10100110111;
    for (let i = 14; i >= 10; i -= 1) {
        if (rem & (1 << i)) rem ^= g << (i - 10);
    }
    const fullData = ((data << 10) | rem) ^ 0b101010000010010;
    const bits: number[] = [];
    for (let i = 14; i >= 0; i -= 1) bits.push((fullData >> i) & 1);
    return bits;
};

const placeFormatInfo = (matrix: number[][], ec: ErrorCorrectionLevel, mask: number) => {
    const size = matrix.length;
    const bits = computeFormatBits(ec, mask);

    for (let i = 0; i <= 5; i += 1) matrix[8][i] = bits[i];
    matrix[8][7] = bits[6];
    matrix[8][8] = bits[7];
    matrix[7][8] = bits[8];
    for (let i = 9; i <= 14; i += 1) matrix[14 - i][8] = bits[i];

    for (let i = 0; i <= 6; i += 1) matrix[size - 1 - i][8] = bits[i];
    matrix[8][size - 8] = bits[7];
    for (let i = 8; i <= 14; i += 1) matrix[8][size - 15 + i] = bits[i];

    matrix[size - 8][8] = 1;
};

const computeVersionBits = (version: number): number[] => {
    let rem = version << 12;
    const g = 0b1111100100101;
    for (let i = 17; i >= 12; i -= 1) {
        if (rem & (1 << i)) rem ^= g << (i - 12);
    }
    const fullData = (version << 12) | rem;
    const bits: number[] = [];
    for (let i = 17; i >= 0; i -= 1) bits.push((fullData >> i) & 1);
    return bits;
};

const placeVersionInfo = (matrix: number[][], version: number) => {
    if (version < 7) return;
    const size = matrix.length;
    const bits = computeVersionBits(version);
    for (let i = 0; i < 18; i += 1) {
        const bit = bits[17 - i];
        const r = Math.floor(i / 3);
        const c = (i % 3) + size - 11;
        matrix[r][c] = bit;
        matrix[c][r] = bit;
    }
};

const encodeMatrix = (value: string, ec: ErrorCorrectionLevel): boolean[][] => {
    const bytes = utf8Encode(value);
    const version = chooseVersion(bytes, ec);
    const size = 17 + version * 4;
    const dataBits = buildBitstream(bytes, version, ec);
    const { matrix, reserved } = placeFunctionPatterns(size, version);

    placeData(matrix, reserved, dataBits);
    placeVersionInfo(matrix, version);

    let bestMatrix = matrix;
    let bestPenalty = Infinity;
    for (let mask = 0; mask < 8; mask += 1) {
        const masked = applyMask(matrix, reserved, mask);
        placeFormatInfo(masked, ec, mask);
        const penalty = computePenalty(masked);
        if (penalty < bestPenalty) {
            bestPenalty = penalty;
            bestMatrix = masked;
        }
    }
    return bestMatrix.map((row) => row.map((v) => v === 1));
};

export type { ErrorCorrectionLevel };
export const encode = encodeMatrix;
