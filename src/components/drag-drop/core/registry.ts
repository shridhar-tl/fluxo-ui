import type { ActiveDrag, DragItem, DropNodeSpec, DropPosition, DropResult, Unsubscribe } from './types';

type Listener = () => void;

interface OverState {
    nodeId: string;
    position: DropPosition | undefined;
}

const dropNodes = new Map<string, DropNodeSpec>();
const globalListeners = new Set<Listener>();
const nodeListeners = new Map<string, Set<Listener>>();

let activeDrag: ActiveDrag | null = null;
let overStack: OverState[] = [];

let notifyScheduled = false;
const pendingNodes = new Set<string>();
let pendingGlobal = false;

function scheduleFlush() {
    if (notifyScheduled) return;
    notifyScheduled = true;
    queueMicrotask(() => {
        notifyScheduled = false;
        const nodes = Array.from(pendingNodes);
        pendingNodes.clear();
        const wasGlobal = pendingGlobal;
        pendingGlobal = false;
        if (wasGlobal) {
            globalListeners.forEach((l) => l());
        }
        nodes.forEach((id) => {
            const set = nodeListeners.get(id);
            if (set) set.forEach((l) => l());
        });
    });
}

function notifyGlobal() {
    pendingGlobal = true;
    scheduleFlush();
}

function notifyNode(id: string) {
    pendingNodes.add(id);
    scheduleFlush();
}

export function registerDropNode(spec: DropNodeSpec): Unsubscribe {
    dropNodes.set(spec.id, spec);
    return () => {
        dropNodes.delete(spec.id);
        nodeListeners.delete(spec.id);
        overStack = overStack.filter((s) => s.nodeId !== spec.id);
    };
}

export function updateDropNode(id: string, patch: Partial<DropNodeSpec>) {
    const existing = dropNodes.get(id);
    if (!existing) return;
    dropNodes.set(id, { ...existing, ...patch });
}

export function getDropNode(id: string): DropNodeSpec | undefined {
    return dropNodes.get(id);
}

export function getAllDropNodes(): DropNodeSpec[] {
    return Array.from(dropNodes.values());
}

export function subscribeGlobal(listener: Listener): Unsubscribe {
    globalListeners.add(listener);
    return () => {
        globalListeners.delete(listener);
    };
}

export function subscribeNode(id: string, listener: Listener): Unsubscribe {
    let set = nodeListeners.get(id);
    if (!set) {
        set = new Set();
        nodeListeners.set(id, set);
    }
    set.add(listener);
    return () => {
        set!.delete(listener);
        if (set!.size === 0) nodeListeners.delete(id);
    };
}

export function getActiveDrag(): ActiveDrag | null {
    return activeDrag;
}

export function setActiveDrag(drag: ActiveDrag | null) {
    const prev = activeDrag;
    activeDrag = drag;
    if (!drag) {
        const stack = overStack;
        overStack = [];
        stack.forEach((s) => notifyNode(s.nodeId));
    }
    if (prev && !drag) {
        notifyGlobal();
    } else if (!prev && drag) {
        notifyGlobal();
    } else if (prev && drag) {
        notifyGlobal();
    }
}

export function updateActiveDrag(patch: Partial<ActiveDrag>) {
    if (!activeDrag) return;
    activeDrag = { ...activeDrag, ...patch };
    notifyGlobal();
}

export function getOverStack(): ReadonlyArray<OverState> {
    return overStack;
}

export function isOver(nodeId: string): boolean {
    return overStack.some((s) => s.nodeId === nodeId);
}

export function isOverCurrent(nodeId: string): boolean {
    return overStack.length > 0 && overStack[overStack.length - 1]!.nodeId === nodeId;
}

export function getOverPosition(nodeId: string): DropPosition | undefined {
    const entry = overStack.find((s) => s.nodeId === nodeId);
    return entry?.position;
}

export function setOverStack(next: Array<OverState>) {
    const prev = overStack;
    overStack = next;

    const prevIds = new Set(prev.map((s) => s.nodeId));
    const nextIds = new Set(next.map((s) => s.nodeId));
    const prevMap = new Map(prev.map((s) => [s.nodeId, s.position]));
    const nextMap = new Map(next.map((s) => [s.nodeId, s.position]));

    prevIds.forEach((id) => {
        if (!nextIds.has(id) || prevMap.get(id) !== nextMap.get(id)) {
            notifyNode(id);
        }
    });
    nextIds.forEach((id) => {
        if (!prevIds.has(id) || prevMap.get(id) !== nextMap.get(id)) {
            notifyNode(id);
        }
    });

    if (prev.length > 0 && next.length > 0) {
        const prevCurrent = prev[prev.length - 1]!.nodeId;
        const nextCurrent = next[next.length - 1]!.nodeId;
        if (prevCurrent !== nextCurrent) {
            notifyNode(prevCurrent);
            notifyNode(nextCurrent);
        }
    }
}

export function canDropOn(nodeId: string): boolean {
    if (!activeDrag) return false;
    const spec = dropNodes.get(nodeId);
    if (!spec) return false;
    return specAcceptsItem(spec, activeDrag.item) && spec.canDrop(activeDrag.item);
}

export function specAcceptsItem(spec: DropNodeSpec, item: DragItem): boolean {
    if (spec.accept === 'any') return true;
    if (typeof spec.accept === 'string') {
        return spec.accept === item.itemType || spec.accept === 'any';
    }
    return spec.accept.includes(item.itemType) || spec.accept.includes('any');
}

export function setDropResult(result: DropResult | null) {
    if (!activeDrag) return;
    activeDrag = { ...activeDrag, dropResult: result, didDrop: result != null };
    notifyGlobal();
}

export function resetActiveForEnd() {
    setActiveDrag(null);
}

export function resetRegistry() {
    activeDrag = null;
    overStack = [];
    dropNodes.clear();
    globalListeners.clear();
    nodeListeners.clear();
}
