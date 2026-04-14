import { dispatchEnd, dispatchPoint, getLastInnermostId, getLastPosition } from './dispatcher';
import { createFloatingPreview, FloatingPreviewHandle } from './dragPreview';
import { resolveTargetIndex } from './positioning';
import {
    getActiveDrag,
    getDropNode,
    resetActiveForEnd,
    setActiveDrag,
    setDropResult,
} from './registry';
import type { ActiveDrag, ClientPoint, DragItem, DragSourceSpec, DropResult } from './types';

const DRAG_THRESHOLD = 5;

interface AttachResult {
    detach(): void;
}

interface SessionState {
    pointerId: number;
    startPoint: ClientPoint;
    currentPoint: ClientPoint;
    offset: ClientPoint;
    delayTimer: number | null;
    started: boolean;
    preview: FloatingPreviewHandle | null;
    isTouch: boolean;
}

export function attachPointerSource(
    node: HTMLElement,
    getSpec: () => DragSourceSpec,
    onStart: () => void,
    onEnd: () => void,
): AttachResult {
    let session: SessionState | null = null;

    const shouldUsePointerPath = (ev: PointerEvent): boolean => {
        const spec = getSpec();
        if (!spec.canDrag) return false;
        if (spec.disableNativeDrag) return true;
        if (ev.pointerType === 'touch' || ev.pointerType === 'pen') return true;
        if (spec.delay > 0) return true;
        if (spec.dragHandle) return true;
        if (typeof spec.dragPreview === 'function') return true;
        return false;
    };

    const getHandleNode = (): HTMLElement | null => {
        const spec = getSpec();
        return spec.dragHandle ?? node;
    };

    const onPointerDown = (ev: PointerEvent) => {
        if (session) return;
        if (ev.button !== 0 && ev.pointerType === 'mouse') return;
        if (!shouldUsePointerPath(ev)) return;

        const handle = getHandleNode();
        if (!handle) return;
        if (!(ev.target instanceof Node) || !handle.contains(ev.target)) return;

        const spec = getSpec();
        const rect = node.getBoundingClientRect();
        const startPoint: ClientPoint = { x: ev.clientX, y: ev.clientY };
        const offset: ClientPoint = { x: startPoint.x - rect.left, y: startPoint.y - rect.top };

        session = {
            pointerId: ev.pointerId,
            startPoint,
            currentPoint: startPoint,
            offset,
            delayTimer: null,
            started: false,
            preview: null,
            isTouch: ev.pointerType !== 'mouse',
        };

        window.addEventListener('pointermove', onPointerMove, { passive: false });
        window.addEventListener('pointerup', onPointerUp, true);
        window.addEventListener('pointercancel', onPointerCancel, true);
        window.addEventListener('keydown', onKeyDown, true);
        window.addEventListener('blur', onWindowBlur, true);

        if (spec.delay > 0) {
            session.delayTimer = window.setTimeout(() => {
                if (session && !session.started) {
                    beginDrag(session.currentPoint);
                }
            }, spec.delay);
        }
    };

    const beginDrag = (point: ClientPoint) => {
        if (!session || session.started) return;
        const spec = getSpec();
        if (!spec.canDrag) {
            cleanup();
            return;
        }
        session.started = true;

        const dragItem: DragItem = {
            index: spec.index,
            item: spec.item,
            itemType: spec.itemType,
            id: spec.id,
            containerId: spec.containerId,
            args: spec.args,
        };

        const active: ActiveDrag = {
            id: Symbol('drag'),
            path: 'pointer',
            item: dragItem,
            sourceNode: node,
            sourceRect: node.getBoundingClientRect(),
            startPoint: session.startPoint,
            currentPoint: point,
            offsetWithinSource: session.offset,
            dropResult: null,
            didDrop: false,
            files: null,
            dataTransfer: null,
        };

        setActiveDrag(active);
        spec.onDragStart?.(dragItem);

        if (spec.dragPreview !== 'none') {
            let previewNode: HTMLElement | null = null;
            if (spec.dragPreview instanceof HTMLElement) {
                previewNode = spec.dragPreview.cloneNode(true) as HTMLElement;
            } else if (typeof spec.dragPreview === 'function') {
                previewNode = spec.dragPreview(dragItem);
            }
            if (previewNode) {
                const wrapper = document.createElement('div');
                wrapper.appendChild(previewNode);
                document.body.appendChild(wrapper);
                const rect = wrapper.getBoundingClientRect();
                wrapper.remove();
                const handle: FloatingPreviewHandle = {
                    element: previewNode,
                    update(p) {
                        previewNode!.style.transform = `translate(${p.x - session!.offset.x}px, ${p.y - session!.offset.y}px)`;
                    },
                    destroy() {
                        previewNode!.remove();
                    },
                };
                previewNode.style.position = 'fixed';
                previewNode.style.left = '0';
                previewNode.style.top = '0';
                previewNode.style.pointerEvents = 'none';
                previewNode.style.zIndex = '9999';
                previewNode.style.width = `${rect.width}px`;
                previewNode.classList.add('eui-dnd-floating-preview');
                document.body.appendChild(previewNode);
                session.preview = handle;
                handle.update(point);
            } else {
                session.preview = createFloatingPreview(node, point, session.offset);
            }
        }

        onStart();
        dispatchPoint(point);
    };

    const onPointerMove = (ev: PointerEvent) => {
        if (!session || ev.pointerId !== session.pointerId) return;
        const point: ClientPoint = { x: ev.clientX, y: ev.clientY };
        session.currentPoint = point;

        if (!session.started) {
            const dx = point.x - session.startPoint.x;
            const dy = point.y - session.startPoint.y;
            if (Math.hypot(dx, dy) >= DRAG_THRESHOLD) {
                const spec = getSpec();
                if (spec.delay > 0) {
                    cleanup();
                    return;
                }
                beginDrag(point);
            }
            return;
        }

        ev.preventDefault();
        const spec = getSpec();
        const constrained = applyAxisConstraint(point, session.startPoint, spec.axis);
        session.preview?.update(constrained);
        spec.onDragging?.(constrained);
        dispatchPoint(constrained);
    };

    const applyAxisConstraint = (p: ClientPoint, start: ClientPoint, axis: DragSourceSpec['axis']): ClientPoint => {
        if (axis === 'x') return { x: p.x, y: start.y };
        if (axis === 'y') return { x: start.x, y: p.y };
        return p;
    };

    const finalizeDrop = () => {
        const spec = getSpec();
        const active = getActiveDrag();
        if (!active) return;

        const innermostId = getLastInnermostId();
        if (innermostId) {
            const dropSpec = getDropNode(innermostId);
            if (dropSpec) {
                const position = getLastPosition();
                const index = resolveTargetIndex(dropSpec, position ?? 'before');
                const result: DropResult = {
                    index,
                    id: dropSpec.getId ? dropSpec.getId() : undefined,
                    containerId: dropSpec.containerId,
                    args: dropSpec.getArgs ? dropSpec.getArgs() : undefined,
                    position,
                };
                setDropResult(result);
                dropSpec.onDrop?.(active.item, result);
            }
        }

        const final = getActiveDrag();
        const didDrop = final?.didDrop ?? false;
        const dropResult = final?.dropResult ?? null;
        spec.onDragEnd?.(active.item, didDrop, dropResult);
        if (spec.onRemove && didDrop && dropResult && dropResult.containerId !== spec.containerId) {
            spec.onRemove({ index: spec.index, id: spec.id }, dropResult);
        }
    };

    const onPointerUp = (ev: PointerEvent) => {
        if (!session || ev.pointerId !== session.pointerId) return;
        if (session.started) {
            finalizeDrop();
        }
        cleanup();
    };

    const onPointerCancel = (ev: PointerEvent) => {
        if (!session || ev.pointerId !== session.pointerId) return;
        cleanup();
    };

    const onKeyDown = (ev: KeyboardEvent) => {
        if (ev.key === 'Escape' && session) {
            cleanup();
        }
    };

    const onWindowBlur = () => {
        if (session) cleanup();
    };

    const cleanup = () => {
        if (!session) return;
        if (session.delayTimer != null) {
            window.clearTimeout(session.delayTimer);
        }
        session.preview?.destroy();
        const wasStarted = session.started;
        session = null;
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp, true);
        window.removeEventListener('pointercancel', onPointerCancel, true);
        window.removeEventListener('keydown', onKeyDown, true);
        window.removeEventListener('blur', onWindowBlur, true);
        if (wasStarted) {
            resetActiveForEnd();
            dispatchEnd();
            onEnd();
        }
    };

    node.addEventListener('pointerdown', onPointerDown);
    const handleEl = getSpec().dragHandle;
    if (handleEl && handleEl !== node) {
        handleEl.addEventListener('pointerdown', onPointerDown);
    }

    return {
        detach() {
            node.removeEventListener('pointerdown', onPointerDown);
            const h = getSpec().dragHandle;
            if (h && h !== node) {
                h.removeEventListener('pointerdown', onPointerDown);
            }
            if (session) cleanup();
        },
    };
}
