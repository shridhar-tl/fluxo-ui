import { base64ToBytes } from '../core/byte-writer';

export type ImageFormat = 'jpeg' | 'png';
export type ImageColorSpace = 'DeviceRGB' | 'DeviceGray' | 'DeviceCMYK';

export interface DecodedImage {
    format: ImageFormat;
    width: number;
    height: number;
    bitsPerComponent: number;
    colorSpace: ImageColorSpace;
    data: Uint8Array;
    filter: 'DCTDecode' | 'FlateDecode';
    softMask?: Uint8Array;
    softMaskBitsPerComponent?: number;
    palette?: Uint8Array;
    transparencyMask?: number[];
}

export type ImageSource = string | Uint8Array | ArrayBuffer;

const jpegStartOfFrameMarkers = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);

const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

export function toByteArray(source: ImageSource): Uint8Array {
    if (typeof source === 'string') {
        const commaIndex = source.indexOf(',');
        if (source.startsWith('data:') && commaIndex !== -1) {
            return base64ToBytes(source.slice(commaIndex + 1));
        }
        return base64ToBytes(source);
    }
    if (source instanceof ArrayBuffer) return new Uint8Array(source);
    return source;
}

export function detectImageFormat(bytes: Uint8Array): ImageFormat | null {
    if (bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpeg';

    if (bytes.length > 8) {
        let matches = true;
        for (let index = 0; index < pngSignature.length; index += 1) {
            if (bytes[index] !== pngSignature[index]) {
                matches = false;
                break;
            }
        }
        if (matches) return 'png';
    }

    return null;
}

function readUint32(bytes: Uint8Array, offset: number): number {
    return ((bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>> 0;
}

function decodeJpeg(bytes: Uint8Array): DecodedImage {
    let offset = 2;

    while (offset < bytes.length) {
        if (bytes[offset] !== 0xff) {
            offset += 1;
            continue;
        }

        const marker = bytes[offset + 1];

        if (jpegStartOfFrameMarkers.has(marker)) {
            const precision = bytes[offset + 4];
            const height = (bytes[offset + 5] << 8) | bytes[offset + 6];
            const width = (bytes[offset + 7] << 8) | bytes[offset + 8];
            const components = bytes[offset + 9];

            const colorSpace: ImageColorSpace =
                components === 1 ? 'DeviceGray' : components === 4 ? 'DeviceCMYK' : 'DeviceRGB';

            return {
                format: 'jpeg',
                width,
                height,
                bitsPerComponent: precision,
                colorSpace,
                data: bytes,
                filter: 'DCTDecode',
            };
        }

        if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
            offset += 2;
            continue;
        }

        const segmentLength = (bytes[offset + 2] << 8) | bytes[offset + 3];
        if (segmentLength <= 0) break;
        offset += 2 + segmentLength;
    }

    throw new Error('Unable to read JPEG dimensions: no frame header found.');
}

interface PngChunks {
    width: number;
    height: number;
    bitDepth: number;
    colorType: number;
    interlace: number;
    imageData: Uint8Array[];
    palette?: Uint8Array;
    transparency?: Uint8Array;
}

function readPngChunks(bytes: Uint8Array): PngChunks {
    let offset = 8;
    const imageData: Uint8Array[] = [];

    let width = 0;
    let height = 0;
    let bitDepth = 8;
    let colorType = 6;
    let interlace = 0;
    let palette: Uint8Array | undefined;
    let transparency: Uint8Array | undefined;

    while (offset < bytes.length) {
        const length = readUint32(bytes, offset);
        const type = String.fromCharCode(bytes[offset + 4], bytes[offset + 5], bytes[offset + 6], bytes[offset + 7]);
        const dataStart = offset + 8;

        if (type === 'IHDR') {
            width = readUint32(bytes, dataStart);
            height = readUint32(bytes, dataStart + 4);
            bitDepth = bytes[dataStart + 8];
            colorType = bytes[dataStart + 9];
            interlace = bytes[dataStart + 12];
        } else if (type === 'PLTE') {
            palette = bytes.subarray(dataStart, dataStart + length);
        } else if (type === 'tRNS') {
            transparency = bytes.subarray(dataStart, dataStart + length);
        } else if (type === 'IDAT') {
            imageData.push(bytes.subarray(dataStart, dataStart + length));
        } else if (type === 'IEND') {
            break;
        }

        offset = dataStart + length + 4;
    }

    return { width, height, bitDepth, colorType, interlace, imageData, palette, transparency };
}

const pngColorSpaceFor = (colorType: number): ImageColorSpace => {
    if (colorType === 0 || colorType === 4) return 'DeviceGray';
    return 'DeviceRGB';
};

const pngComponentsFor = (colorType: number): number => {
    if (colorType === 0) return 1;
    if (colorType === 2) return 3;
    if (colorType === 3) return 1;
    if (colorType === 4) return 2;
    return 4;
};

function concatChunks(chunks: Uint8Array[]): Uint8Array {
    const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const result = new Uint8Array(total);
    let position = 0;
    for (const chunk of chunks) {
        result.set(chunk, position);
        position += chunk.length;
    }
    return result;
}

function decodePng(bytes: Uint8Array): DecodedImage {
    const chunks = readPngChunks(bytes);

    if (chunks.interlace !== 0) {
        throw new Error('Interlaced PNG images are not supported. Re-save the image without interlacing.');
    }
    if (chunks.imageData.length === 0) {
        throw new Error('PNG image contains no pixel data.');
    }

    const hasAlphaChannel = chunks.colorType === 4 || chunks.colorType === 6;
    const compressed = concatChunks(chunks.imageData);

    if (hasAlphaChannel) {
        return {
            format: 'png',
            width: chunks.width,
            height: chunks.height,
            bitsPerComponent: chunks.bitDepth,
            colorSpace: pngColorSpaceFor(chunks.colorType),
            data: compressed,
            filter: 'FlateDecode',
            softMaskBitsPerComponent: chunks.bitDepth,
        };
    }

    const transparencyMask = chunks.transparency && chunks.colorType !== 3 ? buildColorKeyMask(chunks) : undefined;

    return {
        format: 'png',
        width: chunks.width,
        height: chunks.height,
        bitsPerComponent: chunks.bitDepth,
        colorSpace: chunks.colorType === 3 ? 'DeviceRGB' : pngColorSpaceFor(chunks.colorType),
        data: compressed,
        filter: 'FlateDecode',
        palette: chunks.palette,
        transparencyMask,
    };
}

function buildColorKeyMask(chunks: PngChunks): number[] | undefined {
    const transparency = chunks.transparency;
    if (!transparency) return undefined;

    if (chunks.colorType === 0 && transparency.length >= 2) {
        const grey = (transparency[0] << 8) | transparency[1];
        return [grey, grey];
    }

    if (chunks.colorType === 2 && transparency.length >= 6) {
        const red = (transparency[0] << 8) | transparency[1];
        const green = (transparency[2] << 8) | transparency[3];
        const blue = (transparency[4] << 8) | transparency[5];
        return [red, red, green, green, blue, blue];
    }

    return undefined;
}

export function decodeImage(source: ImageSource): DecodedImage {
    const bytes = toByteArray(source);
    const format = detectImageFormat(bytes);

    if (format === 'jpeg') return decodeJpeg(bytes);
    if (format === 'png') return decodePng(bytes);

    throw new Error('Unsupported image format. Provide a JPEG or PNG image.');
}

export function pngComponentCount(colorType: number): number {
    return pngComponentsFor(colorType);
}
