import type { ClientPoint } from './types';

const EMPTY_IMG_SRC = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

let cachedEmptyImage: HTMLImageElement | null = null;

export function getEmptyDragImage(): HTMLImageElement | null {
    if (typeof window === 'undefined' || !('Image' in window)) return null;
    if (!cachedEmptyImage) {
        const img = new Image();
        img.src = EMPTY_IMG_SRC;
        cachedEmptyImage = img;
    }
    return cachedEmptyImage;
}

export interface FloatingPreviewHandle {
    update(point: ClientPoint): void;
    destroy(): void;
    element: HTMLElement;
}

export function createFloatingPreview(
    sourceNode: HTMLElement,
    start: ClientPoint,
    offset: ClientPoint,
): FloatingPreviewHandle {
    const rect = sourceNode.getBoundingClientRect();
    const clone = sourceNode.cloneNode(true) as HTMLElement;
    clone.style.position = 'fixed';
    clone.style.pointerEvents = 'none';
    clone.style.top = '0px';
    clone.style.left = '0px';
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.margin = '0';
    clone.style.zIndex = '9999';
    clone.style.opacity = '0.92';
    clone.style.transform = `translate(${start.x - offset.x}px, ${start.y - offset.y}px)`;
    clone.style.transition = 'none';
    clone.style.willChange = 'transform';
    clone.classList.add('eui-dnd-floating-preview');
    document.body.appendChild(clone);

    return {
        element: clone,
        update(point) {
            clone.style.transform = `translate(${point.x - offset.x}px, ${point.y - offset.y}px)`;
        },
        destroy() {
            clone.remove();
        },
    };
}
