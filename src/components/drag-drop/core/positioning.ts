import type { ClientPoint, DropNodeSpec, DropOrientation, DropPosition } from './types';

export function computeDropPosition(
    node: HTMLElement,
    point: ClientPoint,
    orientation: DropOrientation,
    configured: DropPosition | 'auto',
    edgeThreshold: number,
): DropPosition {
    if (configured !== 'auto') return configured;
    const rect = node.getBoundingClientRect();
    if (orientation === 'horizontal') {
        const relative = point.x - rect.left;
        const width = rect.width;
        if (relative < edgeThreshold) return 'before';
        if (relative > width - edgeThreshold) return 'after';
        if (relative < width / 2) return 'before';
        return 'after';
    }
    const relative = point.y - rect.top;
    const height = rect.height;
    if (relative < edgeThreshold) return 'before';
    if (relative > height - edgeThreshold) return 'after';
    if (relative < height / 2) return 'before';
    return 'after';
}

export function resolveTargetIndex(spec: DropNodeSpec, position: DropPosition): number {
    const baseIndex = spec.getIndex ? spec.getIndex() : spec.index;
    if (position === 'after') return baseIndex + 1;
    return baseIndex;
}

export function pointInsideRect(point: ClientPoint, rect: DOMRect): boolean {
    return point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom;
}

export function findScrollableAncestor(node: HTMLElement | null): HTMLElement | null {
    let current: HTMLElement | null = node;
    while (current && current !== document.body) {
        const style = window.getComputedStyle(current);
        const overflowY = style.overflowY;
        const overflowX = style.overflowX;
        const scrollableY = (overflowY === 'auto' || overflowY === 'scroll') && current.scrollHeight > current.clientHeight;
        const scrollableX = (overflowX === 'auto' || overflowX === 'scroll') && current.scrollWidth > current.clientWidth;
        if (scrollableY || scrollableX) return current;
        current = current.parentElement;
    }
    return null;
}
