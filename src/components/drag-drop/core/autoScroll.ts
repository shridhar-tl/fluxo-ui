import { findScrollableAncestor } from './positioning';
import type { ClientPoint } from './types';

const EDGE_SIZE = 48;
const MAX_SPEED = 18;

let rafId: number | null = null;
let currentPoint: ClientPoint | null = null;
let currentNode: HTMLElement | null = null;

function tick() {
    rafId = null;
    if (!currentPoint) return;
    scrollStep(currentPoint, currentNode);
    if (currentPoint) {
        rafId = window.requestAnimationFrame(tick);
    }
}

function scrollStep(point: ClientPoint, startNode: HTMLElement | null) {
    const container = findScrollableAncestor(startNode);
    if (container) {
        const rect = container.getBoundingClientRect();
        const dy = computeDelta(point.y, rect.top, rect.bottom);
        const dx = computeDelta(point.x, rect.left, rect.right);
        if (dy !== 0 || dx !== 0) {
            container.scrollTop += dy;
            container.scrollLeft += dx;
            return;
        }
    }
    const viewHeight = window.innerHeight;
    const viewWidth = window.innerWidth;
    const wy = computeDelta(point.y, 0, viewHeight);
    const wx = computeDelta(point.x, 0, viewWidth);
    if (wy !== 0 || wx !== 0) {
        window.scrollBy(wx, wy);
    }
}

function computeDelta(value: number, min: number, max: number): number {
    if (value < min + EDGE_SIZE) {
        const ratio = Math.max(0, Math.min(1, (min + EDGE_SIZE - value) / EDGE_SIZE));
        return -Math.ceil(ratio * MAX_SPEED);
    }
    if (value > max - EDGE_SIZE) {
        const ratio = Math.max(0, Math.min(1, (value - (max - EDGE_SIZE)) / EDGE_SIZE));
        return Math.ceil(ratio * MAX_SPEED);
    }
    return 0;
}

export function updateAutoScroll(point: ClientPoint | null, node: HTMLElement | null) {
    currentPoint = point;
    currentNode = node;
    if (point && rafId == null) {
        rafId = window.requestAnimationFrame(tick);
    }
    if (!point && rafId != null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
    }
}

export function stopAutoScroll() {
    currentPoint = null;
    currentNode = null;
    if (rafId != null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
    }
}
