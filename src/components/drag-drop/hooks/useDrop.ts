import { useCallback, useEffect, useId, useMemo, useRef } from 'react';
import { DROP_NODE_ATTR } from '../core/hitTest';
import { ensureDocumentListeners } from '../core/install';
import {
    canDropOn,
    getOverPosition,
    isOver as registryIsOver,
    isOverCurrent as registryIsOverCurrent,
    registerDropNode,
    updateDropNode,
} from '../core/registry';
import type { DragItem, DropNodeSpec, DropPosition, DropResult } from '../core/types';
import { useNodeDndStore } from './useSyncExternal';

export interface UseDropSpec {
    containerId: string;
    index: number;
    id?: string | number;
    args?: unknown;
    accept?: string | string[];
    greedy?: boolean;
    orientation?: 'vertical' | 'horizontal';
    dropPosition?: DropPosition | 'auto';
    edgeThreshold?: number;
    acceptFiles?: boolean;
    dropEffect?: 'move' | 'copy' | 'link' | 'none';
    canDrop?: boolean | ((item: DragItem) => boolean);
    onDragEnter?: (item: DragItem) => void;
    onDragLeave?: (item: DragItem) => void;
    onHover?: (item: DragItem, position: DropPosition | undefined) => void;
    onDrop?: (source: DragItem, result: DropResult) => void;
}

export interface UseDropReturn {
    dropRef: (node: HTMLElement | null) => void;
    isOver: boolean;
    isOverCurrent: boolean;
    canDrop: boolean;
    position: DropPosition | undefined;
    nodeId: string;
}

export function useDrop(spec: UseDropSpec): UseDropReturn {
    const nodeId = useId();
    const specRef = useRef(spec);
    specRef.current = spec;
    const nodeRef = useRef<HTMLElement | null>(null);
    const unsubscribeRef = useRef<(() => void) | null>(null);

    const buildNodeSpec = useCallback(
        (node: HTMLElement): DropNodeSpec => ({
            id: nodeId,
            containerId: specRef.current.containerId,
            index: specRef.current.index,
            node,
            accept: specRef.current.accept ?? 'any',
            greedy: specRef.current.greedy ?? true,
            orientation: specRef.current.orientation ?? 'vertical',
            dropPosition: specRef.current.dropPosition ?? 'inside',
            edgeThreshold: specRef.current.edgeThreshold ?? 8,
            acceptFiles: specRef.current.acceptFiles ?? false,
            dropEffect: specRef.current.dropEffect ?? 'move',
            canDrop: (item) => {
                const cd = specRef.current.canDrop;
                if (cd == null) return true;
                if (typeof cd === 'boolean') return cd;
                return cd(item);
            },
            onDragEnter: (item) => specRef.current.onDragEnter?.(item),
            onDragLeave: (item) => specRef.current.onDragLeave?.(item),
            onHover: (item, _point, position) => specRef.current.onHover?.(item, position),
            onDrop: (item, result) => specRef.current.onDrop?.(item, result),
            getArgs: () => specRef.current.args,
            getId: () => specRef.current.id,
            getIndex: () => specRef.current.index,
        }),
        [nodeId],
    );

    const dropRef = useCallback(
        (node: HTMLElement | null) => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = null;
            }
            nodeRef.current = node;
            if (!node) return;
            ensureDocumentListeners();
            node.setAttribute(DROP_NODE_ATTR, nodeId);
            const registered = buildNodeSpec(node);
            unsubscribeRef.current = registerDropNode(registered);
        },
        [buildNodeSpec, nodeId],
    );

    useEffect(() => {
        if (!nodeRef.current) return;
        updateDropNode(nodeId, {
            containerId: spec.containerId,
            index: spec.index,
            accept: spec.accept ?? 'any',
            greedy: spec.greedy ?? true,
            orientation: spec.orientation ?? 'vertical',
            dropPosition: spec.dropPosition ?? 'inside',
            edgeThreshold: spec.edgeThreshold ?? 8,
            acceptFiles: spec.acceptFiles ?? false,
            dropEffect: spec.dropEffect ?? 'move',
        });
    }, [
        nodeId,
        spec.containerId,
        spec.index,
        spec.accept,
        spec.greedy,
        spec.orientation,
        spec.dropPosition,
        spec.edgeThreshold,
        spec.acceptFiles,
        spec.dropEffect,
    ]);

    useEffect(() => {
        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = null;
            }
        };
    }, []);

    const isOver = useNodeDndStore(nodeId, () => registryIsOver(nodeId));
    const isOverCurrent = useNodeDndStore(nodeId, () => registryIsOverCurrent(nodeId));
    const canDrop = useNodeDndStore(nodeId, () => canDropOn(nodeId));
    const position = useNodeDndStore(nodeId, () => getOverPosition(nodeId));

    return useMemo(
        () => ({ dropRef, isOver, isOverCurrent, canDrop, position, nodeId }),
        [dropRef, isOver, isOverCurrent, canDrop, position, nodeId],
    );
}
