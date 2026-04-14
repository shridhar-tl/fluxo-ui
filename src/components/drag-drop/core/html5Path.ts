import { dispatchEnd, dispatchPoint, getLastInnermostId, getLastPosition } from './dispatcher';
import { getEmptyDragImage } from './dragPreview';
import {
    getActiveDrag,
    getDropNode,
    resetActiveForEnd,
    setActiveDrag,
    setDropResult,
} from './registry';
import { resolveTargetIndex } from './positioning';
import type { ActiveDrag, ClientPoint, DragItem, DragSourceSpec, DropResult } from './types';

interface AttachResult {
    detach(): void;
}

interface HandleState {
    pressed: boolean;
    handle: HTMLElement | null;
}

export function attachHtml5Source(
    node: HTMLElement,
    getSpec: () => DragSourceSpec,
    onStart: () => void,
    onEnd: () => void,
): AttachResult {
    const handleState: HandleState = { pressed: false, handle: null };

    const onHandlePointerDown = (ev: PointerEvent) => {
        handleState.pressed = true;
        handleState.handle = ev.currentTarget as HTMLElement;
        node.setAttribute('draggable', 'true');
        const release = () => {
            handleState.pressed = false;
            handleState.handle = null;
            window.removeEventListener('pointerup', release, true);
            window.removeEventListener('pointercancel', release, true);
        };
        window.addEventListener('pointerup', release, true);
        window.addEventListener('pointercancel', release, true);
    };

    const rewireHandle = () => {
        const spec = getSpec();
        if (spec.dragHandle && spec.dragHandle !== handleState.handle) {
            if (handleState.handle) {
                handleState.handle.removeEventListener('pointerdown', onHandlePointerDown);
            }
            handleState.handle = spec.dragHandle;
            handleState.handle.addEventListener('pointerdown', onHandlePointerDown);
            node.setAttribute('draggable', 'false');
        } else if (!spec.dragHandle) {
            node.setAttribute('draggable', spec.canDrag ? 'true' : 'false');
        }
    };

    rewireHandle();

    const onDragStart = (ev: DragEvent) => {
        const spec = getSpec();
        if (!spec.canDrag) {
            ev.preventDefault();
            return;
        }
        if (spec.dragHandle && !handleState.pressed) {
            ev.preventDefault();
            return;
        }
        if (spec.disableNativeDrag) {
            ev.preventDefault();
            return;
        }

        const rect = node.getBoundingClientRect();
        const point: ClientPoint = { x: ev.clientX, y: ev.clientY };
        const offset: ClientPoint = { x: point.x - rect.left, y: point.y - rect.top };

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
            path: 'html5',
            item: dragItem,
            sourceNode: node,
            sourceRect: rect,
            startPoint: point,
            currentPoint: point,
            offsetWithinSource: offset,
            dropResult: null,
            didDrop: false,
            files: null,
            dataTransfer: ev.dataTransfer,
        };

        setActiveDrag(active);

        if (ev.dataTransfer) {
            try {
                ev.dataTransfer.setData('text/plain', spec.id != null ? String(spec.id) : '');
            } catch {
                // Firefox may throw on repeated setData; ignore.
            }
            if (spec.dragData) {
                for (const key of Object.keys(spec.dragData)) {
                    try {
                        ev.dataTransfer.setData(key, spec.dragData[key]!);
                    } catch {
                        // ignore
                    }
                }
            }
            ev.dataTransfer.effectAllowed = 'move';

            if (spec.dragPreview === 'none') {
                const emptyImg = getEmptyDragImage();
                if (emptyImg) {
                    try {
                        ev.dataTransfer.setDragImage(emptyImg, 0, 0);
                    } catch {
                        // ignore
                    }
                }
            } else if (spec.dragPreview instanceof HTMLElement) {
                try {
                    ev.dataTransfer.setDragImage(spec.dragPreview, offset.x, offset.y);
                } catch {
                    // ignore
                }
            } else if (typeof spec.dragPreview === 'function') {
                const el = spec.dragPreview(dragItem);
                if (el) {
                    try {
                        ev.dataTransfer.setDragImage(el, offset.x, offset.y);
                    } catch {
                        // ignore
                    }
                }
            }
        }

        spec.onDragStart?.(dragItem);
        onStart();
        dispatchPoint(point);
    };

    const onDrag = (ev: DragEvent) => {
        const spec = getSpec();
        if (!getActiveDrag()) return;
        if (ev.clientX === 0 && ev.clientY === 0) return;
        const point: ClientPoint = { x: ev.clientX, y: ev.clientY };
        spec.onDragging?.(point);
        dispatchPoint(point);
    };

    const onDragEnd = (_ev: DragEvent) => {
        const spec = getSpec();
        const active = getActiveDrag();
        if (!active) {
            onEnd();
            return;
        }
        const didDrop = active.didDrop;
        const dropResult = active.dropResult;
        spec.onDragEnd?.(active.item, didDrop, dropResult);
        if (spec.onRemove && didDrop && dropResult && dropResult.containerId !== spec.containerId) {
            spec.onRemove({ index: spec.index, id: spec.id }, dropResult);
        }
        resetActiveForEnd();
        dispatchEnd();
        onEnd();
    };

    node.addEventListener('dragstart', onDragStart);
    node.addEventListener('drag', onDrag);
    node.addEventListener('dragend', onDragEnd);

    return {
        detach() {
            node.removeEventListener('dragstart', onDragStart);
            node.removeEventListener('drag', onDrag);
            node.removeEventListener('dragend', onDragEnd);
            if (handleState.handle) {
                handleState.handle.removeEventListener('pointerdown', onHandlePointerDown);
            }
            node.removeAttribute('draggable');
        },
    };
}

export function installDocumentDragListeners() {
    if (typeof document === 'undefined') return () => undefined;

    const onDocDragOver = (ev: DragEvent) => {
        const active = getActiveDrag();
        if (active && active.path === 'html5') {
            ev.preventDefault();
            if (ev.dataTransfer) ev.dataTransfer.dropEffect = 'move';
            dispatchPoint({ x: ev.clientX, y: ev.clientY });
            return;
        }
        if (ev.dataTransfer && Array.from(ev.dataTransfer.types || []).includes('Files')) {
            ev.preventDefault();
            ev.dataTransfer.dropEffect = 'copy';
        }
    };

    const onDocDrop = (ev: DragEvent) => {
        const active = getActiveDrag();
        if (active && active.path === 'html5') {
            const innermostId = getLastInnermostId();
            if (!innermostId) return;
            const spec = getDropNode(innermostId);
            if (!spec) return;
            ev.preventDefault();
            const position = getLastPosition();
            const index = resolveTargetIndex(spec, position ?? 'before');
            const result: DropResult = {
                index,
                id: spec.getId ? spec.getId() : undefined,
                containerId: spec.containerId,
                args: spec.getArgs ? spec.getArgs() : undefined,
                position,
            };
            setDropResult(result);
            spec.onDrop?.(active.item, result);
            return;
        }
        if (ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files.length > 0) {
            const target = ev.target as HTMLElement | null;
            let el: HTMLElement | null = target;
            while (el) {
                const nodeId = el.getAttribute && el.getAttribute('data-eui-dnd-drop');
                if (nodeId) {
                    const spec = getDropNode(nodeId);
                    if (spec && spec.acceptFiles) {
                        ev.preventDefault();
                        const fileItem = {
                            index: 0,
                            item: { files: ev.dataTransfer.files },
                            itemType: '__files__',
                            containerId: '__os__',
                        };
                        const result: DropResult = {
                            index: spec.index,
                            containerId: spec.containerId,
                            id: spec.getId ? spec.getId() : undefined,
                            args: spec.getArgs ? spec.getArgs() : undefined,
                        };
                        spec.onDrop?.(fileItem, result);
                        return;
                    }
                }
                el = el.parentElement;
            }
        }
    };

    document.addEventListener('dragover', onDocDragOver);
    document.addEventListener('drop', onDocDrop);

    return () => {
        document.removeEventListener('dragover', onDocDragOver);
        document.removeEventListener('drop', onDocDrop);
    };
}
