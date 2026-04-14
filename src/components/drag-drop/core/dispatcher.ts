import { stopAutoScroll, updateAutoScroll } from './autoScroll';
import { hitTestPoint } from './hitTest';
import { computeDropPosition } from './positioning';
import {
    getActiveDrag,
    setOverStack,
    specAcceptsItem,
    updateActiveDrag,
} from './registry';
import type { ClientPoint, DropNodeSpec, DropPosition } from './types';

let pendingPoint: ClientPoint | null = null;
let rafId: number | null = null;
let lastPosition: DropPosition | undefined;
let lastInnermostId: string | null = null;

function flush() {
    rafId = null;
    const point = pendingPoint;
    if (!point) return;
    const active = getActiveDrag();
    if (!active) return;

    updateActiveDrag({ currentPoint: point });

    const { stack, innermost } = hitTestPoint(point, active);

    const validSpecs: DropNodeSpec[] = [];
    for (const spec of stack) {
        if (!specAcceptsItem(spec, active.item)) continue;
        if (!spec.canDrop(active.item)) continue;
        validSpecs.push(spec);
    }

    const innerSpec = innermost;
    let position: DropPosition | undefined;
    if (innerSpec) {
        position = computeDropPosition(
            innerSpec.node,
            point,
            innerSpec.orientation,
            innerSpec.dropPosition,
            innerSpec.edgeThreshold,
        );
        innerSpec.onHover?.(active.item, point, position);
    }

    const nextOver = validSpecs.map((spec) => ({
        nodeId: spec.id,
        position: spec === innerSpec ? position : undefined,
    }));
    setOverStack(nextOver);

    lastPosition = position;
    lastInnermostId = innerSpec?.id ?? null;

    updateAutoScroll(point, innerSpec?.node ?? null);
}

export function dispatchPoint(point: ClientPoint) {
    pendingPoint = point;
    if (rafId == null) {
        rafId = window.requestAnimationFrame(flush);
    }
}

export function dispatchEnd() {
    pendingPoint = null;
    if (rafId != null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
    }
    setOverStack([]);
    stopAutoScroll();
    lastPosition = undefined;
    lastInnermostId = null;
}

export function getLastInnermostId(): string | null {
    return lastInnermostId;
}

export function getLastPosition(): DropPosition | undefined {
    return lastPosition;
}
