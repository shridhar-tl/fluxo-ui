type DiffOpType = 'equal' | 'insert' | 'delete';

interface LineDiffRow {
    type: DiffOpType | 'replace';
    oldIndex: number | null;
    newIndex: number | null;
    oldText: string;
    newText: string;
}

const splitLines = (s: string): string[] => s.split(/\r\n|\r|\n/);

const diffLines = (oldText: string, newText: string): LineDiffRow[] => {
    const a = splitLines(oldText);
    const b = splitLines(newText);
    const n = a.length;
    const m = b.length;

    let commonStart = 0;
    while (commonStart < n && commonStart < m && a[commonStart] === b[commonStart]) commonStart++;
    let commonEnd = 0;
    while (
        commonEnd < n - commonStart &&
        commonEnd < m - commonStart &&
        a[n - 1 - commonEnd] === b[m - 1 - commonEnd]
    ) {
        commonEnd++;
    }

    const aMid = a.slice(commonStart, n - commonEnd);
    const bMid = b.slice(commonStart, m - commonEnd);

    const rows: LineDiffRow[] = [];

    for (let i = 0; i < commonStart; i++) {
        rows.push({ type: 'equal', oldIndex: i, newIndex: i, oldText: a[i], newText: b[i] });
    }

    const midOps = diffLinesCore(aMid, bMid);
    for (const op of midOps) {
        if (op.type === 'equal') {
            rows.push({
                type: 'equal',
                oldIndex: commonStart + op.oldIndex!,
                newIndex: commonStart + op.newIndex!,
                oldText: op.oldText,
                newText: op.newText,
            });
        } else if (op.type === 'delete') {
            rows.push({
                type: 'delete',
                oldIndex: commonStart + op.oldIndex!,
                newIndex: null,
                oldText: op.oldText,
                newText: '',
            });
        } else if (op.type === 'insert') {
            rows.push({
                type: 'insert',
                oldIndex: null,
                newIndex: commonStart + op.newIndex!,
                oldText: '',
                newText: op.newText,
            });
        }
    }

    for (let i = 0; i < commonEnd; i++) {
        const oi = n - commonEnd + i;
        const ni = m - commonEnd + i;
        rows.push({ type: 'equal', oldIndex: oi, newIndex: ni, oldText: a[oi], newText: b[ni] });
    }

    return rows;
};

interface CoreOp {
    type: DiffOpType;
    oldIndex: number | null;
    newIndex: number | null;
    oldText: string;
    newText: string;
}

const diffLinesCore = (a: string[], b: string[]): CoreOp[] => {
    const n = a.length;
    const m = b.length;
    if (n === 0 && m === 0) return [];
    if (n === 0) {
        return b.map((line, i) => ({ type: 'insert' as const, oldIndex: null, newIndex: i, oldText: '', newText: line }));
    }
    if (m === 0) {
        return a.map((line, i) => ({ type: 'delete' as const, oldIndex: i, newIndex: null, oldText: line, newText: '' }));
    }

    const HISTOGRAM_LIMIT = 4000;
    if (n > HISTOGRAM_LIMIT || m > HISTOGRAM_LIMIT) {
        return histogramDiff(a, b);
    }

    const dp: Uint32Array = new Uint32Array((n + 1) * (m + 1));
    const stride = m + 1;
    for (let i = n - 1; i >= 0; i--) {
        for (let j = m - 1; j >= 0; j--) {
            if (a[i] === b[j]) {
                dp[i * stride + j] = dp[(i + 1) * stride + (j + 1)] + 1;
            } else {
                const down = dp[(i + 1) * stride + j];
                const right = dp[i * stride + (j + 1)];
                dp[i * stride + j] = down > right ? down : right;
            }
        }
    }

    const ops: CoreOp[] = [];
    let i = 0;
    let j = 0;
    while (i < n && j < m) {
        if (a[i] === b[j]) {
            ops.push({ type: 'equal', oldIndex: i, newIndex: j, oldText: a[i], newText: b[j] });
            i++;
            j++;
        } else if (dp[(i + 1) * stride + j] >= dp[i * stride + (j + 1)]) {
            ops.push({ type: 'delete', oldIndex: i, newIndex: null, oldText: a[i], newText: '' });
            i++;
        } else {
            ops.push({ type: 'insert', oldIndex: null, newIndex: j, oldText: '', newText: b[j] });
            j++;
        }
    }
    while (i < n) {
        ops.push({ type: 'delete', oldIndex: i, newIndex: null, oldText: a[i], newText: '' });
        i++;
    }
    while (j < m) {
        ops.push({ type: 'insert', oldIndex: null, newIndex: j, oldText: '', newText: b[j] });
        j++;
    }
    return ops;
};

const histogramDiff = (a: string[], b: string[]): CoreOp[] => {
    const ops: CoreOp[] = [];
    const aMap = new Map<string, number[]>();
    for (let i = 0; i < a.length; i++) {
        const arr = aMap.get(a[i]);
        if (arr) arr.push(i);
        else aMap.set(a[i], [i]);
    }

    const walk = (aStart: number, aEnd: number, bStart: number, bEnd: number) => {
        while (aStart < aEnd && bStart < bEnd && a[aStart] === b[bStart]) {
            ops.push({ type: 'equal', oldIndex: aStart, newIndex: bStart, oldText: a[aStart], newText: b[bStart] });
            aStart++;
            bStart++;
        }
        const localEqualsEnd: CoreOp[] = [];
        while (aEnd > aStart && bEnd > bStart && a[aEnd - 1] === b[bEnd - 1]) {
            aEnd--;
            bEnd--;
            localEqualsEnd.push({ type: 'equal', oldIndex: aEnd, newIndex: bEnd, oldText: a[aEnd], newText: b[bEnd] });
        }

        if (aStart >= aEnd && bStart >= bEnd) {
            for (let k = localEqualsEnd.length - 1; k >= 0; k--) ops.push(localEqualsEnd[k]);
            return;
        }
        if (aStart >= aEnd) {
            for (let j = bStart; j < bEnd; j++) {
                ops.push({ type: 'insert', oldIndex: null, newIndex: j, oldText: '', newText: b[j] });
            }
            for (let k = localEqualsEnd.length - 1; k >= 0; k--) ops.push(localEqualsEnd[k]);
            return;
        }
        if (bStart >= bEnd) {
            for (let j = aStart; j < aEnd; j++) {
                ops.push({ type: 'delete', oldIndex: j, newIndex: null, oldText: a[j], newText: '' });
            }
            for (let k = localEqualsEnd.length - 1; k >= 0; k--) ops.push(localEqualsEnd[k]);
            return;
        }

        let bestCount = Number.MAX_SAFE_INTEGER;
        let bestA = -1;
        let bestB = -1;
        let bestLen = 0;
        for (let j = bStart; j < bEnd; j++) {
            const positions = aMap.get(b[j]);
            if (!positions) continue;
            for (const p of positions) {
                if (p < aStart || p >= aEnd) continue;
                let len = 1;
                while (p + len < aEnd && j + len < bEnd && a[p + len] === b[j + len]) len++;
                const count = positions.length;
                if (len > bestLen || (len === bestLen && count < bestCount)) {
                    bestLen = len;
                    bestA = p;
                    bestB = j;
                    bestCount = count;
                }
            }
        }

        if (bestLen === 0) {
            for (let jj = aStart; jj < aEnd; jj++) {
                ops.push({ type: 'delete', oldIndex: jj, newIndex: null, oldText: a[jj], newText: '' });
            }
            for (let jj = bStart; jj < bEnd; jj++) {
                ops.push({ type: 'insert', oldIndex: null, newIndex: jj, oldText: '', newText: b[jj] });
            }
        } else {
            walk(aStart, bestA, bStart, bestB);
            for (let k = 0; k < bestLen; k++) {
                ops.push({ type: 'equal', oldIndex: bestA + k, newIndex: bestB + k, oldText: a[bestA + k], newText: b[bestB + k] });
            }
            walk(bestA + bestLen, aEnd, bestB + bestLen, bEnd);
        }

        for (let k = localEqualsEnd.length - 1; k >= 0; k--) ops.push(localEqualsEnd[k]);
    };

    walk(0, a.length, 0, b.length);
    return ops;
};

interface WordDiffSeg {
    type: DiffOpType;
    text: string;
}

const tokenizeWords = (s: string): string[] => {
    const out: string[] = [];
    const re = /(\s+|[A-Za-z0-9_]+|[^\sA-Za-z0-9_])/g;
    let match: RegExpExecArray | null;
    while ((match = re.exec(s)) !== null) out.push(match[0]);
    return out;
};

const diffWords = (oldText: string, newText: string): { oldSegs: WordDiffSeg[]; newSegs: WordDiffSeg[] } => {
    const a = tokenizeWords(oldText);
    const b = tokenizeWords(newText);
    const n = a.length;
    const m = b.length;
    if (n * m > 250000) {
        return {
            oldSegs: [{ type: 'delete', text: oldText }],
            newSegs: [{ type: 'insert', text: newText }],
        };
    }
    const stride = m + 1;
    const dp: Uint32Array = new Uint32Array((n + 1) * (m + 1));
    for (let i = n - 1; i >= 0; i--) {
        for (let j = m - 1; j >= 0; j--) {
            if (a[i] === b[j]) {
                dp[i * stride + j] = dp[(i + 1) * stride + (j + 1)] + 1;
            } else {
                const d = dp[(i + 1) * stride + j];
                const r = dp[i * stride + (j + 1)];
                dp[i * stride + j] = d > r ? d : r;
            }
        }
    }
    const oldSegs: WordDiffSeg[] = [];
    const newSegs: WordDiffSeg[] = [];
    let i = 0;
    let j = 0;
    const pushOld = (type: DiffOpType, text: string) => {
        const last = oldSegs[oldSegs.length - 1];
        if (last && last.type === type) last.text += text;
        else oldSegs.push({ type, text });
    };
    const pushNew = (type: DiffOpType, text: string) => {
        const last = newSegs[newSegs.length - 1];
        if (last && last.type === type) last.text += text;
        else newSegs.push({ type, text });
    };
    while (i < n && j < m) {
        if (a[i] === b[j]) {
            pushOld('equal', a[i]);
            pushNew('equal', b[j]);
            i++;
            j++;
        } else if (dp[(i + 1) * stride + j] >= dp[i * stride + (j + 1)]) {
            pushOld('delete', a[i]);
            i++;
        } else {
            pushNew('insert', b[j]);
            j++;
        }
    }
    while (i < n) {
        pushOld('delete', a[i]);
        i++;
    }
    while (j < m) {
        pushNew('insert', b[j]);
        j++;
    }
    return { oldSegs, newSegs };
};

const pairReplacements = (rows: LineDiffRow[]): LineDiffRow[] => {
    const out: LineDiffRow[] = [];
    let i = 0;
    while (i < rows.length) {
        const row = rows[i];
        if (row.type === 'delete') {
            let delEnd = i;
            while (delEnd < rows.length && rows[delEnd].type === 'delete') delEnd++;
            let insEnd = delEnd;
            while (insEnd < rows.length && rows[insEnd].type === 'insert') insEnd++;
            const dels = rows.slice(i, delEnd);
            const inss = rows.slice(delEnd, insEnd);
            const pairs = Math.min(dels.length, inss.length);
            for (let k = 0; k < pairs; k++) {
                out.push({
                    type: 'replace',
                    oldIndex: dels[k].oldIndex,
                    newIndex: inss[k].newIndex,
                    oldText: dels[k].oldText,
                    newText: inss[k].newText,
                });
            }
            for (let k = pairs; k < dels.length; k++) out.push(dels[k]);
            for (let k = pairs; k < inss.length; k++) out.push(inss[k]);
            i = insEnd;
        } else {
            out.push(row);
            i++;
        }
    }
    return out;
};

export { diffLines, diffWords, pairReplacements };
export type { LineDiffRow, WordDiffSeg, DiffOpType };
