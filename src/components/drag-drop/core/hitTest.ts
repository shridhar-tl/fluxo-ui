import { getAllDropNodes, specAcceptsItem } from './registry';
import type { ActiveDrag, ClientPoint, DropNodeSpec } from './types';

export const DROP_NODE_ATTR = 'data-eui-dnd-drop';

export interface HitResult {
    stack: DropNodeSpec[];
    innermost: DropNodeSpec | null;
}

export function hitTestPoint(point: ClientPoint, active: ActiveDrag | null): HitResult {
    if (typeof document === 'undefined') return { stack: [], innermost: null };

    let element = document.elementFromPoint(point.x, point.y) as HTMLElement | null;
    const specsById = new Map(getAllDropNodes().map((s) => [s.id, s]));

    const hits: DropNodeSpec[] = [];
    while (element) {
        if (element.hasAttribute(DROP_NODE_ATTR)) {
            const id = element.getAttribute(DROP_NODE_ATTR)!;
            const spec = specsById.get(id);
            if (spec) hits.push(spec);
        }
        element = element.parentElement;
    }

    const stack = hits.reverse();
    let innermost: DropNodeSpec | null = null;

    for (let i = stack.length - 1; i >= 0; i--) {
        const spec = stack[i]!;
        if (!active) {
            innermost = spec;
            break;
        }
        if (!specAcceptsItem(spec, active.item)) continue;
        if (!spec.canDrop(active.item)) continue;
        innermost = spec;
        break;
    }

    return { stack, innermost };
}

export function hitTestFromEventTarget(target: EventTarget | null): DropNodeSpec | null {
    if (!target || !(target instanceof HTMLElement)) return null;
    const specsById = new Map(getAllDropNodes().map((s) => [s.id, s]));
    let element: HTMLElement | null = target;
    while (element) {
        if (element.hasAttribute(DROP_NODE_ATTR)) {
            const id = element.getAttribute(DROP_NODE_ATTR)!;
            const spec = specsById.get(id);
            if (spec) return spec;
        }
        element = element.parentElement;
    }
    return null;
}
