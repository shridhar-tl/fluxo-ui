import type { SparklineCurve, SparklineDatum, SparklineInput, SparklineReference } from './sparkline-types';

export interface Point {
    x: number;
    y: number;
    index: number;
    value: number;
}

export const normalizeData = (data: SparklineInput[] | undefined): SparklineDatum[] =>
    (data ?? []).map((item) => {
        if (item === null || item === undefined) return { value: null };
        if (typeof item === 'number') return { value: Number.isFinite(item) ? item : null };
        return { ...item, value: typeof item.value === 'number' && Number.isFinite(item.value) ? item.value : null };
    });

export const numericValues = (data: SparklineDatum[]): number[] =>
    data.map((d) => d.value).filter((v): v is number => v !== null);

export const mean = (values: number[]): number => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0);

export const median = (values: number[]): number => {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

export const resolveReference = (reference: SparklineReference, values: number[]): number => {
    if (typeof reference === 'number') return reference;
    if (reference === 'mean') return mean(values);
    if (reference === 'median') return median(values);
    if (reference === 'min') return values.length ? Math.min(...values) : 0;
    if (reference === 'max') return values.length ? Math.max(...values) : 0;
    return 0;
};

export interface Domain {
    min: number;
    max: number;
}

export const computeDomain = (values: number[], extras: number[], minOverride?: number, maxOverride?: number): Domain => {
    const all = [...values, ...extras];
    let min = minOverride ?? (all.length ? Math.min(...all) : 0);
    let max = maxOverride ?? (all.length ? Math.max(...all) : 1);
    if (min === max) {
        const pad = Math.abs(min) * 0.1 || 1;
        if (minOverride === undefined) min -= pad;
        if (maxOverride === undefined) max += pad;
    }
    return { min, max };
};

export const createYScale = (domain: Domain, top: number, bottom: number) => {
    const span = domain.max - domain.min || 1;
    return (value: number) => {
        const clamped = Math.min(domain.max, Math.max(domain.min, value));
        return bottom - ((clamped - domain.min) / span) * (bottom - top);
    };
};

export const createXScale = (count: number, left: number, right: number) => {
    if (count <= 1) return () => (left + right) / 2;
    const step = (right - left) / (count - 1);
    return (index: number) => left + index * step;
};

export const splitSegments = (data: SparklineDatum[], connectNulls: boolean, x: (i: number) => number, y: (v: number) => number): Point[][] => {
    const segments: Point[][] = [];
    let current: Point[] = [];
    data.forEach((datum, index) => {
        if (datum.value === null) {
            if (!connectNulls && current.length) {
                segments.push(current);
                current = [];
            }
            return;
        }
        current.push({ x: x(index), y: y(datum.value), index, value: datum.value });
    });
    if (current.length) segments.push(current);
    return segments;
};

const round = (n: number) => Math.round(n * 100) / 100;

const linearPath = (points: Point[]): string =>
    points.map((p, i) => `${i === 0 ? 'M' : 'L'}${round(p.x)},${round(p.y)}`).join(' ');

const stepPath = (points: Point[]): string => {
    if (!points.length) return '';
    let d = `M${round(points[0].x)},${round(points[0].y)}`;
    for (let i = 1; i < points.length; i++) {
        const midX = (points[i - 1].x + points[i].x) / 2;
        d += ` H${round(midX)} V${round(points[i].y)} H${round(points[i].x)}`;
    }
    return d;
};

const monotonePath = (points: Point[]): string => {
    const n = points.length;
    if (n < 3) return linearPath(points);
    const dx: number[] = [];
    const slopes: number[] = [];
    for (let i = 0; i < n - 1; i++) {
        dx.push(points[i + 1].x - points[i].x);
        slopes.push(dx[i] === 0 ? 0 : (points[i + 1].y - points[i].y) / dx[i]);
    }
    const tangents: number[] = [slopes[0]];
    for (let i = 1; i < n - 1; i++) {
        if (slopes[i - 1] * slopes[i] <= 0) tangents.push(0);
        else {
            const w1 = 2 * dx[i] + dx[i - 1];
            const w2 = dx[i] + 2 * dx[i - 1];
            tangents.push((w1 + w2) / (w1 / slopes[i - 1] + w2 / slopes[i]));
        }
    }
    tangents.push(slopes[n - 2]);
    let d = `M${round(points[0].x)},${round(points[0].y)}`;
    for (let i = 0; i < n - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const h = dx[i] / 3;
        d += ` C${round(p0.x + h)},${round(p0.y + tangents[i] * h)} ${round(p1.x - h)},${round(p1.y - tangents[i + 1] * h)} ${round(p1.x)},${round(p1.y)}`;
    }
    return d;
};

export const buildLinePath = (points: Point[], curve: SparklineCurve): string => {
    if (points.length === 1) {
        const p = points[0];
        return `M${round(p.x - 0.5)},${round(p.y)} L${round(p.x + 0.5)},${round(p.y)}`;
    }
    if (curve === 'smooth') return monotonePath(points);
    if (curve === 'step') return stepPath(points);
    return linearPath(points);
};

export const buildAreaPath = (points: Point[], curve: SparklineCurve, baselineY: number): string => {
    if (!points.length) return '';
    const line = buildLinePath(points, curve);
    const first = points[0];
    const last = points[points.length - 1];
    return `${line} L${round(last.x)},${round(baselineY)} L${round(first.x)},${round(baselineY)} Z`;
};

export const describeArc = (cx: number, cy: number, outer: number, inner: number, start: number, end: number): string => {
    const sweep = end - start;
    if (sweep >= Math.PI * 2 - 1e-6) {
        const mid = start + Math.PI;
        return `${describeArc(cx, cy, outer, inner, start, mid)} ${describeArc(cx, cy, outer, inner, mid, end)}`;
    }
    const large = sweep > Math.PI ? 1 : 0;
    const p = (r: number, a: number) => `${round(cx + r * Math.sin(a))},${round(cy - r * Math.cos(a))}`;
    if (inner <= 0) {
        return `M${round(cx)},${round(cy)} L${p(outer, start)} A${round(outer)},${round(outer)} 0 ${large} 1 ${p(outer, end)} Z`;
    }
    return `M${p(outer, start)} A${round(outer)},${round(outer)} 0 ${large} 1 ${p(outer, end)} L${p(inner, end)} A${round(inner)},${round(inner)} 0 ${large} 0 ${p(inner, start)} Z`;
};

export const nearestIndex = (data: SparklineDatum[], x: (i: number) => number, pointerX: number): number => {
    let best = -1;
    let bestDistance = Infinity;
    data.forEach((datum, index) => {
        if (datum.value === null) return;
        const distance = Math.abs(x(index) - pointerX);
        if (distance < bestDistance) {
            bestDistance = distance;
            best = index;
        }
    });
    return best;
};

export const defaultFormat = (value: number): string => {
    if (Number.isInteger(value)) return value.toLocaleString();
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

export const piePalette = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];
