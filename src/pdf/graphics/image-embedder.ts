import { PdfArray, PdfDict, PdfName, type PdfObjectStore, type PdfRef, PdfStream } from '../core/objects';
import type { DecodedImage } from './image-data';
import { expandPalette, separateAlphaChannel } from './png-channels';

export function embedImage(store: PdfObjectStore, decoded: DecodedImage, target: PdfRef): void {
    let colorData = decoded.data;
    let softMaskData: Uint8Array | undefined;
    let colorSpace: PdfName = new PdfName(decoded.colorSpace);
    let bitsPerComponent = decoded.bitsPerComponent;

    if (decoded.format === 'png' && decoded.softMaskBitsPerComponent !== undefined) {
        const colorType = decoded.colorSpace === 'DeviceGray' ? 4 : 6;
        const separated = separateAlphaChannel(
            decoded.data,
            decoded.width,
            decoded.height,
            colorType,
            decoded.bitsPerComponent,
        );
        colorData = separated.color;
        softMaskData = separated.alpha;
    } else if (decoded.format === 'png' && decoded.palette) {
        const separated = expandPalette(
            decoded.data,
            decoded.width,
            decoded.height,
            decoded.bitsPerComponent,
            decoded.palette,
        );
        colorData = separated.color;
        softMaskData = separated.alpha;
        colorSpace = new PdfName('DeviceRGB');
        bitsPerComponent = 8;
    }

    const imageDict = new PdfDict({
        Type: new PdfName('XObject'),
        Subtype: new PdfName('Image'),
        Width: decoded.width,
        Height: decoded.height,
        ColorSpace: colorSpace,
        BitsPerComponent: bitsPerComponent,
        Filter: new PdfName(decoded.filter),
    });

    if (decoded.filter === 'FlateDecode' && decoded.format === 'png' && !softMaskData) {
        imageDict.set(
            'DecodeParms',
            new PdfDict({
                Predictor: 15,
                Colors: decoded.colorSpace === 'DeviceGray' ? 1 : 3,
                BitsPerComponent: decoded.bitsPerComponent,
                Columns: decoded.width,
            }),
        );
    }

    if (decoded.transparencyMask) {
        imageDict.set('Mask', new PdfArray(decoded.transparencyMask));
    }

    if (softMaskData) {
        const maskDict = new PdfDict({
            Type: new PdfName('XObject'),
            Subtype: new PdfName('Image'),
            Width: decoded.width,
            Height: decoded.height,
            ColorSpace: new PdfName('DeviceGray'),
            BitsPerComponent: decoded.softMaskBitsPerComponent ?? 8,
            Filter: new PdfName('FlateDecode'),
        });
        imageDict.set('SMask', store.add(new PdfStream(maskDict, softMaskData)));
    }

    store.assign(target, new PdfStream(imageDict, colorData));
}
