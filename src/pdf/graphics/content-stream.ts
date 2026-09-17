import { formatNumber } from '../core/byte-writer';
import type { RgbColor } from '../core/color';
import { escapePdfStringBytes } from '../text/encoding';

export type LineCapStyle = 'butt' | 'round' | 'square';
export type LineJoinStyle = 'miter' | 'round' | 'bevel';
export type PaintMode = 'fill' | 'stroke' | 'fillStroke' | 'none';
export type TextRenderMode = 'fill' | 'stroke' | 'fillStroke' | 'invisible';

const lineCapCodes: Record<LineCapStyle, number> = { butt: 0, round: 1, square: 2 };
const lineJoinCodes: Record<LineJoinStyle, number> = { miter: 0, round: 1, bevel: 2 };
const textRenderCodes: Record<TextRenderMode, number> = { fill: 0, stroke: 1, fillStroke: 2, invisible: 3 };

export interface Matrix {
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;
}

export const identityMatrix: Matrix = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };

export function multiplyMatrix(first: Matrix, second: Matrix): Matrix {
    return {
        a: first.a * second.a + first.b * second.c,
        b: first.a * second.b + first.b * second.d,
        c: first.c * second.a + first.d * second.c,
        d: first.c * second.b + first.d * second.d,
        e: first.e * second.a + first.f * second.c + second.e,
        f: first.e * second.b + first.f * second.d + second.f,
    };
}

export function translationMatrix(x: number, y: number): Matrix {
    return { a: 1, b: 0, c: 0, d: 1, e: x, f: y };
}

export function rotationMatrix(degrees: number): Matrix {
    const radians = (degrees * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    return { a: cos, b: sin, c: -sin, d: cos, e: 0, f: 0 };
}

export function scalingMatrix(scaleX: number, scaleY: number): Matrix {
    return { a: scaleX, b: 0, c: 0, d: scaleY, e: 0, f: 0 };
}

const channel = (value: number): string => formatNumber(value / 255, 4);

export class ContentStream {
    private readonly operations: string[] = [];

    write(operation: string): this {
        this.operations.push(operation);
        return this;
    }

    saveState(): this {
        return this.write('q');
    }

    restoreState(): this {
        return this.write('Q');
    }

    applyMatrix(matrix: Matrix): this {
        return this.write(
            `${formatNumber(matrix.a)} ${formatNumber(matrix.b)} ${formatNumber(matrix.c)} ${formatNumber(matrix.d)} ${formatNumber(matrix.e)} ${formatNumber(matrix.f)} cm`,
        );
    }

    setFillColor(color: RgbColor): this {
        return this.write(`${channel(color.r)} ${channel(color.g)} ${channel(color.b)} rg`);
    }

    setStrokeColor(color: RgbColor): this {
        return this.write(`${channel(color.r)} ${channel(color.g)} ${channel(color.b)} RG`);
    }

    setLineWidth(width: number): this {
        return this.write(`${formatNumber(width)} w`);
    }

    setLineCap(style: LineCapStyle): this {
        return this.write(`${lineCapCodes[style]} J`);
    }

    setLineJoin(style: LineJoinStyle): this {
        return this.write(`${lineJoinCodes[style]} j`);
    }

    setMiterLimit(limit: number): this {
        return this.write(`${formatNumber(limit)} M`);
    }

    setDashPattern(pattern: number[], phase = 0): this {
        const segments = pattern.map((value) => formatNumber(value)).join(' ');
        return this.write(`[${segments}] ${formatNumber(phase)} d`);
    }

    setExtGraphicsState(resourceName: string): this {
        return this.write(`/${resourceName} gs`);
    }

    moveTo(x: number, y: number): this {
        return this.write(`${formatNumber(x)} ${formatNumber(y)} m`);
    }

    lineTo(x: number, y: number): this {
        return this.write(`${formatNumber(x)} ${formatNumber(y)} l`);
    }

    curveTo(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number): this {
        return this.write(
            `${formatNumber(x1)} ${formatNumber(y1)} ${formatNumber(x2)} ${formatNumber(y2)} ${formatNumber(x3)} ${formatNumber(y3)} c`,
        );
    }

    closePath(): this {
        return this.write('h');
    }

    rectangle(x: number, y: number, width: number, height: number): this {
        return this.write(`${formatNumber(x)} ${formatNumber(y)} ${formatNumber(width)} ${formatNumber(height)} re`);
    }

    clip(evenOdd = false): this {
        return this.write(evenOdd ? 'W* n' : 'W n');
    }

    paint(mode: PaintMode, evenOdd = false): this {
        if (mode === 'none') return this.write('n');
        if (mode === 'fill') return this.write(evenOdd ? 'f*' : 'f');
        if (mode === 'stroke') return this.write('S');
        return this.write(evenOdd ? 'B*' : 'B');
    }

    beginText(): this {
        return this.write('BT');
    }

    endText(): this {
        return this.write('ET');
    }

    setFont(resourceName: string, size: number): this {
        return this.write(`/${resourceName} ${formatNumber(size)} Tf`);
    }

    setTextMatrix(matrix: Matrix): this {
        return this.write(
            `${formatNumber(matrix.a)} ${formatNumber(matrix.b)} ${formatNumber(matrix.c)} ${formatNumber(matrix.d)} ${formatNumber(matrix.e)} ${formatNumber(matrix.f)} Tm`,
        );
    }

    setCharacterSpacing(spacing: number): this {
        return this.write(`${formatNumber(spacing)} Tc`);
    }

    setWordSpacing(spacing: number): this {
        return this.write(`${formatNumber(spacing)} Tw`);
    }

    setHorizontalScale(scalePercent: number): this {
        return this.write(`${formatNumber(scalePercent)} Tz`);
    }

    setTextRise(rise: number): this {
        return this.write(`${formatNumber(rise)} Ts`);
    }

    setTextRenderMode(mode: TextRenderMode): this {
        return this.write(`${textRenderCodes[mode]} Tr`);
    }

    setLeading(leading: number): this {
        return this.write(`${formatNumber(leading)} TL`);
    }

    nextLine(): this {
        return this.write('T*');
    }

    showText(encoded: Uint8Array): this {
        return this.write(`(${escapePdfStringBytes(encoded)}) Tj`);
    }

    drawXObject(resourceName: string): this {
        return this.write(`/${resourceName} Do`);
    }

    beginMarkedContent(tag: string): this {
        return this.write(`/${tag} BMC`);
    }

    endMarkedContent(): this {
        return this.write('EMC');
    }

    isEmpty(): boolean {
        return this.operations.length === 0;
    }

    toString(): string {
        return this.operations.join('\n');
    }
}

export function roundedRectanglePath(
    stream: ContentStream,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
): void {
    const limit = Math.min(width, height) / 2;
    const r = Math.max(0, Math.min(radius, limit));

    if (r <= 0) {
        stream.rectangle(x, y, width, height);
        return;
    }

    const kappa = 0.5522847498 * r;
    const right = x + width;
    const top = y + height;

    stream.moveTo(x + r, y);
    stream.lineTo(right - r, y);
    stream.curveTo(right - r + kappa, y, right, y + r - kappa, right, y + r);
    stream.lineTo(right, top - r);
    stream.curveTo(right, top - r + kappa, right - r + kappa, top, right - r, top);
    stream.lineTo(x + r, top);
    stream.curveTo(x + r - kappa, top, x, top - r + kappa, x, top - r);
    stream.lineTo(x, y + r);
    stream.curveTo(x, y + r - kappa, x + r - kappa, y, x + r, y);
    stream.closePath();
}

export function ellipsePath(stream: ContentStream, centerX: number, centerY: number, radiusX: number, radiusY: number): void {
    const kappaX = 0.5522847498 * radiusX;
    const kappaY = 0.5522847498 * radiusY;

    stream.moveTo(centerX - radiusX, centerY);
    stream.curveTo(centerX - radiusX, centerY + kappaY, centerX - kappaX, centerY + radiusY, centerX, centerY + radiusY);
    stream.curveTo(centerX + kappaX, centerY + radiusY, centerX + radiusX, centerY + kappaY, centerX + radiusX, centerY);
    stream.curveTo(centerX + radiusX, centerY - kappaY, centerX + kappaX, centerY - radiusY, centerX, centerY - radiusY);
    stream.curveTo(centerX - kappaX, centerY - radiusY, centerX - radiusX, centerY - kappaY, centerX - radiusX, centerY);
    stream.closePath();
}
