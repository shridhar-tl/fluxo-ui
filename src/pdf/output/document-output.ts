import { bytesToBase64 } from '../core/byte-writer';

export const pdfMimeType = 'application/pdf';

export function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
    const buffer = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(buffer).set(bytes);
    return buffer;
}

export function toBase64(bytes: Uint8Array): string {
    return bytesToBase64(bytes);
}

export function toDataUrl(bytes: Uint8Array): string {
    return `data:${pdfMimeType};base64,${bytesToBase64(bytes)}`;
}

export function toBlob(bytes: Uint8Array): Blob {
    if (typeof Blob === 'undefined') {
        throw new Error('Blob is not available in this environment.');
    }
    return new Blob([toArrayBuffer(bytes)], { type: pdfMimeType });
}

const ensureExtension = (fileName: string): string =>
    fileName.toLowerCase().endsWith('.pdf') ? fileName : `${fileName}.pdf`;

const sanitizeFileName = (fileName: string): string =>
    ensureExtension(fileName)
        .replace(/[\\/:*?"<>|]/g, '-')
        .replace(/\s+/g, ' ')
        .trim();

export function savePdf(bytes: Uint8Array, fileName = 'document.pdf'): void {
    if (typeof document === 'undefined' || typeof URL === 'undefined') {
        throw new Error('Saving a file requires a browser environment.');
    }

    const blob = toBlob(bytes);
    const objectUrl = URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = sanitizeFileName(fileName);
    anchor.rel = 'noopener';
    anchor.style.display = 'none';

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
}

export function openPdfInNewTab(bytes: Uint8Array): Window | null {
    if (typeof window === 'undefined' || typeof URL === 'undefined') {
        throw new Error('Opening a document requires a browser environment.');
    }

    const objectUrl = URL.createObjectURL(toBlob(bytes));
    const opened = window.open(objectUrl, '_blank', 'noopener,noreferrer');

    setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
    return opened;
}

export function createObjectUrl(bytes: Uint8Array): { url: string; revoke: () => void } {
    if (typeof URL === 'undefined') {
        throw new Error('Object URLs require a browser environment.');
    }

    const url = URL.createObjectURL(toBlob(bytes));
    return { url, revoke: () => URL.revokeObjectURL(url) };
}

export function printPdf(bytes: Uint8Array): void {
    if (typeof document === 'undefined') {
        throw new Error('Printing requires a browser environment.');
    }

    const { url, revoke } = createObjectUrl(bytes);

    const frame = document.createElement('iframe');
    frame.style.position = 'fixed';
    frame.style.right = '0';
    frame.style.bottom = '0';
    frame.style.width = '0';
    frame.style.height = '0';
    frame.style.border = '0';
    frame.src = url;

    frame.onload = () => {
        frame.contentWindow?.focus();
        frame.contentWindow?.print();
    };

    document.body.appendChild(frame);

    setTimeout(() => {
        document.body.removeChild(frame);
        revoke();
    }, 60000);
}
