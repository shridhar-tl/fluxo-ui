import React from 'react';
import type { ChatPersist } from '../types';
import { readStored, writeStored } from './persistence';

export interface Position {
    x: number;
    y: number;
}

export interface Size {
    width: number;
    height: number;
}

export type ResizeEdge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export interface UseDragResizeOptions {
    enabled: boolean;
    draggable?: boolean;
    resizable?: boolean;
    persist?: ChatPersist;
    persistKey?: string;
    initialPosition?: Position;
    initialSize?: Size;
    minWidth: number;
    minHeight: number;
    maxWidth?: number | string;
    maxHeight?: number | string;
}

function isMobileViewport(): boolean {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
}

function clampPosition(pos: Position, size: Size): Position {
    if (typeof window === 'undefined') return pos;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const minVisible = 80;
    const maxX = Math.max(0, vw - minVisible);
    const minX = Math.min(0, -(size.width - minVisible));
    const maxY = Math.max(0, vh - minVisible);
    const minY = 0;
    return {
        x: Math.min(maxX, Math.max(minX, pos.x)),
        y: Math.min(maxY, Math.max(minY, pos.y)),
    };
}

function clampSize(size: Size, opts: { minWidth: number; minHeight: number; maxWidth?: number; maxHeight?: number }): Size {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 768;
    const maxW = opts.maxWidth ?? Math.floor(vw * 0.95);
    const maxH = opts.maxHeight ?? Math.floor(vh * 0.95);
    return {
        width: Math.min(maxW, Math.max(opts.minWidth, size.width)),
        height: Math.min(maxH, Math.max(opts.minHeight, size.height)),
    };
}

function resolvePxLimit(limit: number | string | undefined, axis: 'w' | 'h'): number | undefined {
    if (limit === undefined) return undefined;
    if (typeof limit === 'number') return limit;
    if (typeof window === 'undefined') return undefined;
    const dim = axis === 'w' ? window.innerWidth : window.innerHeight;
    if (limit.endsWith('vw')) return Math.floor((parseFloat(limit) / 100) * window.innerWidth);
    if (limit.endsWith('vh')) return Math.floor((parseFloat(limit) / 100) * window.innerHeight);
    if (limit.endsWith('%')) return Math.floor((parseFloat(limit) / 100) * dim);
    if (limit.endsWith('px')) return parseFloat(limit);
    const n = parseFloat(limit);
    return isNaN(n) ? undefined : n;
}

export function useDragResize(opts: UseDragResizeOptions) {
    const { enabled, draggable, resizable, persist, persistKey, initialPosition, initialSize, minWidth, minHeight, maxWidth, maxHeight } = opts;

    const baseKey = persistKey || 'fluxo-chat-window';
    const posKey = `${baseKey}-pos`;
    const sizeKey = `${baseKey}-size`;

    const [position, setPosition] = React.useState<Position | null>(() => {
        if (!enabled || !draggable) return null;
        const stored = readStored<Position>(persist, posKey);
        return stored || initialPosition || null;
    });

    const [size, setSize] = React.useState<Size | null>(() => {
        if (!enabled || !resizable) return null;
        const stored = readStored<Size>(persist, sizeKey);
        return stored || initialSize || null;
    });

    const dragState = React.useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
    const resizeState = React.useRef<{ edge: ResizeEdge; startX: number; startY: number; origW: number; origH: number; origX: number; origY: number } | null>(null);

    const onDragStart = React.useCallback(
        (event: React.PointerEvent) => {
            if (!enabled || !draggable || isMobileViewport()) return;
            event.preventDefault();
            const cur = position || { x: 0, y: 0 };
            dragState.current = {
                startX: event.clientX,
                startY: event.clientY,
                origX: cur.x,
                origY: cur.y,
            };
            (event.target as Element).setPointerCapture?.(event.pointerId);

            const handleMove = (e: PointerEvent) => {
                if (!dragState.current) return;
                const dx = e.clientX - dragState.current.startX;
                const dy = e.clientY - dragState.current.startY;
                const target = { x: dragState.current.origX + dx, y: dragState.current.origY + dy };
                const measureEl = document.querySelector('.eui-chat-window-shell-active') as HTMLElement | null;
                const w = measureEl?.offsetWidth ?? size?.width ?? minWidth;
                const h = measureEl?.offsetHeight ?? size?.height ?? minHeight;
                setPosition(clampPosition(target, { width: w, height: h }));
            };
            const handleUp = (e: PointerEvent) => {
                if (!dragState.current) return;
                dragState.current = null;
                (event.target as Element).releasePointerCapture?.(e.pointerId);
                window.removeEventListener('pointermove', handleMove);
                window.removeEventListener('pointerup', handleUp);
                window.removeEventListener('pointercancel', handleUp);
                setPosition((cur) => {
                    if (cur && persist) writeStored(persist, posKey, cur);
                    return cur;
                });
            };
            window.addEventListener('pointermove', handleMove);
            window.addEventListener('pointerup', handleUp);
            window.addEventListener('pointercancel', handleUp);
        },
        [enabled, draggable, persist, posKey, position, size, minWidth, minHeight],
    );

    const onResizeStart = React.useCallback(
        (edge: ResizeEdge) => (event: React.PointerEvent) => {
            if (!enabled || !resizable || isMobileViewport()) return;
            event.preventDefault();
            event.stopPropagation();
            const measureEl = (event.currentTarget as HTMLElement).closest('.eui-chat-window-shell') as HTMLElement | null;
            const rect = measureEl?.getBoundingClientRect();
            const cur = position || { x: 0, y: 0 };
            resizeState.current = {
                edge,
                startX: event.clientX,
                startY: event.clientY,
                origW: size?.width ?? rect?.width ?? minWidth,
                origH: size?.height ?? rect?.height ?? minHeight,
                origX: cur.x,
                origY: cur.y,
            };
            (event.target as Element).setPointerCapture?.(event.pointerId);

            const maxW = resolvePxLimit(maxWidth, 'w');
            const maxH = resolvePxLimit(maxHeight, 'h');

            const handleMove = (e: PointerEvent) => {
                const st = resizeState.current;
                if (!st) return;
                const dx = e.clientX - st.startX;
                const dy = e.clientY - st.startY;
                let w = st.origW;
                let h = st.origH;
                let nx = st.origX;
                let ny = st.origY;
                if (edge.includes('e')) w = st.origW + dx;
                if (edge.includes('w')) {
                    w = st.origW - dx;
                    nx = st.origX + dx;
                }
                if (edge.includes('s')) h = st.origH + dy;
                if (edge.includes('n')) {
                    h = st.origH - dy;
                    ny = st.origY + dy;
                }
                const clamped = clampSize({ width: w, height: h }, { minWidth, minHeight, maxWidth: maxW, maxHeight: maxH });
                if (edge.includes('w') && clamped.width !== w) nx = st.origX + (st.origW - clamped.width);
                if (edge.includes('n') && clamped.height !== h) ny = st.origY + (st.origH - clamped.height);
                setSize(clamped);
                if (draggable) setPosition(clampPosition({ x: nx, y: ny }, clamped));
            };
            const handleUp = (e: PointerEvent) => {
                resizeState.current = null;
                (event.target as Element).releasePointerCapture?.(e.pointerId);
                window.removeEventListener('pointermove', handleMove);
                window.removeEventListener('pointerup', handleUp);
                window.removeEventListener('pointercancel', handleUp);
                setSize((cur) => {
                    if (cur && persist) writeStored(persist, sizeKey, cur);
                    return cur;
                });
                setPosition((cur) => {
                    if (cur && persist) writeStored(persist, posKey, cur);
                    return cur;
                });
            };
            window.addEventListener('pointermove', handleMove);
            window.addEventListener('pointerup', handleUp);
            window.addEventListener('pointercancel', handleUp);
        },
        [enabled, resizable, persist, posKey, sizeKey, position, size, minWidth, minHeight, maxWidth, maxHeight, draggable],
    );

    React.useEffect(() => {
        if (!enabled) return;
        const onResize = () => {
            setPosition((cur) => {
                if (!cur) return cur;
                const measureEl = document.querySelector('.eui-chat-window-shell-active') as HTMLElement | null;
                const w = measureEl?.offsetWidth ?? size?.width ?? minWidth;
                const h = measureEl?.offsetHeight ?? size?.height ?? minHeight;
                return clampPosition(cur, { width: w, height: h });
            });
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [enabled, size, minWidth, minHeight]);

    return {
        position,
        size,
        onDragStart,
        onResizeStart,
        isMobile: isMobileViewport(),
    };
}
