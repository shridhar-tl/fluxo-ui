import { inflate } from '../core/deflate';
import { deflateCompress } from '../core/deflate-encoder';

export interface SeparatedChannels {
    color: Uint8Array;
    alpha: Uint8Array;
}

const paethPredictor = (left: number, above: number, upperLeft: number): number => {
    const estimate = left + above - upperLeft;
    const distanceLeft = Math.abs(estimate - left);
    const distanceAbove = Math.abs(estimate - above);
    const distanceUpperLeft = Math.abs(estimate - upperLeft);

    if (distanceLeft <= distanceAbove && distanceLeft <= distanceUpperLeft) return left;
    if (distanceAbove <= distanceUpperLeft) return above;
    return upperLeft;
};

export function unfilterScanlines(
    data: Uint8Array,
    bytesPerRow: number,
    height: number,
    bytesPerPixel: number,
): Uint8Array {
    const output = new Uint8Array(bytesPerRow * height);

    let sourceOffset = 0;
    let targetOffset = 0;
    let previousRowOffset = -1;

    for (let row = 0; row < height; row += 1) {
        const filterType = data[sourceOffset];
        sourceOffset += 1;

        for (let index = 0; index < bytesPerRow; index += 1) {
            const raw = data[sourceOffset + index];
            const left = index >= bytesPerPixel ? output[targetOffset + index - bytesPerPixel] : 0;
            const above = previousRowOffset >= 0 ? output[previousRowOffset + index] : 0;
            const upperLeft =
                previousRowOffset >= 0 && index >= bytesPerPixel ? output[previousRowOffset + index - bytesPerPixel] : 0;

            let value: number;
            if (filterType === 0) {
                value = raw;
            } else if (filterType === 1) {
                value = raw + left;
            } else if (filterType === 2) {
                value = raw + above;
            } else if (filterType === 3) {
                value = raw + ((left + above) >> 1);
            } else if (filterType === 4) {
                value = raw + paethPredictor(left, above, upperLeft);
            } else {
                throw new Error(`Unsupported PNG scanline filter: ${filterType}`);
            }

            output[targetOffset + index] = value & 0xff;
        }

        sourceOffset += bytesPerRow;
        previousRowOffset = targetOffset;
        targetOffset += bytesPerRow;
    }

    return output;
}

export function separateAlphaChannel(
    compressed: Uint8Array,
    width: number,
    height: number,
    colorType: number,
    bitDepth: number,
): SeparatedChannels {
    if (bitDepth !== 8 && bitDepth !== 16) {
        throw new Error(`Transparent PNG images require an 8 or 16 bit depth, received ${bitDepth}.`);
    }

    const sampleBytes = bitDepth / 8;
    const colorSamples = colorType === 4 ? 1 : 3;
    const bytesPerPixel = (colorSamples + 1) * sampleBytes;
    const bytesPerRow = width * bytesPerPixel;

    const raw = unfilterScanlines(inflate(compressed), bytesPerRow, height, bytesPerPixel);

    const colorSampleBytes = colorSamples * sampleBytes;
    const color = new Uint8Array(width * colorSampleBytes * height);
    const alpha = new Uint8Array(width * sampleBytes * height);

    let colorCursor = 0;
    let alphaCursor = 0;

    for (let row = 0; row < height; row += 1) {
        const rowOffset = row * bytesPerRow;

        for (let column = 0; column < width; column += 1) {
            const pixelOffset = rowOffset + column * bytesPerPixel;

            for (let sample = 0; sample < colorSampleBytes; sample += 1) {
                color[colorCursor] = raw[pixelOffset + sample];
                colorCursor += 1;
            }

            for (let sample = 0; sample < sampleBytes; sample += 1) {
                alpha[alphaCursor] = raw[pixelOffset + colorSampleBytes + sample];
                alphaCursor += 1;
            }
        }
    }

    return { color: deflateCompress(color), alpha: deflateCompress(alpha) };
}

export function expandPalette(
    compressed: Uint8Array,
    width: number,
    height: number,
    bitDepth: number,
    palette: Uint8Array,
    transparency?: Uint8Array,
): SeparatedChannels {
    const bytesPerRow = Math.ceil((width * bitDepth) / 8);
    const bytesPerPixel = Math.max(1, Math.ceil(bitDepth / 8));
    const unfiltered = unfilterScanlines(inflate(compressed), bytesPerRow, height, bytesPerPixel);

    const color = new Uint8Array(width * 3 * height);
    const alpha = new Uint8Array(width * height);
    const hasTransparency = transparency !== undefined && transparency.length > 0;

    const samplesPerByte = 8 / bitDepth;
    const mask = (1 << bitDepth) - 1;

    let colorCursor = 0;
    let alphaCursor = 0;

    for (let row = 0; row < height; row += 1) {
        const rowOffset = row * bytesPerRow;

        for (let column = 0; column < width; column += 1) {
            let paletteIndex: number;

            if (bitDepth === 8) {
                paletteIndex = unfiltered[rowOffset + column];
            } else {
                const byteIndex = rowOffset + Math.floor(column / samplesPerByte);
                const shift = 8 - bitDepth * ((column % samplesPerByte) + 1);
                paletteIndex = (unfiltered[byteIndex] >> shift) & mask;
            }

            const paletteOffset = paletteIndex * 3;
            color[colorCursor] = palette[paletteOffset] ?? 0;
            color[colorCursor + 1] = palette[paletteOffset + 1] ?? 0;
            color[colorCursor + 2] = palette[paletteOffset + 2] ?? 0;
            colorCursor += 3;

            alpha[alphaCursor] = hasTransparency ? (transparency[paletteIndex] ?? 255) : 255;
            alphaCursor += 1;
        }
    }

    return { color: deflateCompress(color), alpha: deflateCompress(alpha) };
}
