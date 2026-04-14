import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { attachHtml5Source } from '../core/html5Path';
import { ensureDocumentListeners } from '../core/install';
import { attachPointerSource } from '../core/pointerPath';
import { getActiveDrag } from '../core/registry';
import type { DragSourceSpec } from '../core/types';
import { useGlobalDndStore } from './useSyncExternal';

export interface UseDragReturn {
    dragRef: (node: HTMLElement | null) => void;
    isDragging: boolean;
    canDrag: boolean;
    handlerId: string;
}

export function useDrag(spec: DragSourceSpec): UseDragReturn {
    const handlerId = useId();
    const specRef = useRef(spec);
    specRef.current = spec;

    const getSpec = useCallback(() => specRef.current, []);
    const [started, setStarted] = useState(false);

    const onStart = useCallback(() => setStarted(true), []);
    const onEnd = useCallback(() => setStarted(false), []);

    const nodeRef = useRef<HTMLElement | null>(null);
    const detachersRef = useRef<Array<() => void>>([]);

    const dragRef = useCallback(
        (node: HTMLElement | null) => {
            detachersRef.current.forEach((d) => d());
            detachersRef.current = [];
            nodeRef.current = node;
            if (!node) return;
            ensureDocumentListeners();
            const html5 = attachHtml5Source(node, getSpec, onStart, onEnd);
            const pointer = attachPointerSource(node, getSpec, onStart, onEnd);
            detachersRef.current.push(html5.detach, pointer.detach);
        },
        [getSpec, onStart, onEnd],
    );

    useEffect(() => {
        return () => {
            detachersRef.current.forEach((d) => d());
            detachersRef.current = [];
        };
    }, []);

    const isDragging = useGlobalDndStore(() => {
        if (!started) return false;
        const active = getActiveDrag();
        if (!active) return false;
        return (
            active.item.containerId === specRef.current.containerId &&
            active.item.index === specRef.current.index &&
            active.item.id === specRef.current.id
        );
    });

    return useMemo(
        () => ({
            dragRef,
            isDragging,
            canDrag: spec.canDrag,
            handlerId,
        }),
        [dragRef, isDragging, spec.canDrag, handlerId],
    );
}
