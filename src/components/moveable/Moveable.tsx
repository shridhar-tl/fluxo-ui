import classNames from 'classnames';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import './moveable.scss';
import type {
    MoveableAxis,
    MoveableBounds,
    MoveablePosition,
    MoveableProps,
} from './moveable-types';

function snapValue(value: number, step?: number): number {
    if (!step || step <= 0) return value;
    return Math.round(value / step) * step;
}

function clamp(value: number, min: number, max: number): number {
    if (!Number.isFinite(min) && !Number.isFinite(max)) return value;
    return Math.max(min, Math.min(max, value));
}

function loadStoredPosition(key: string | undefined): MoveablePosition | null {
    if (!key || typeof window === 'undefined' || !window.localStorage) return null;
    try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') return parsed;
    } catch {
        return null;
    }
    return null;
}

function storePosition(key: string | undefined, pos: MoveablePosition): void {
    if (!key || typeof window === 'undefined' || !window.localStorage) return;
    try {
        window.localStorage.setItem(key, JSON.stringify(pos));
    } catch {
        /* ignore */
    }
}

function shouldStartDrag(target: HTMLElement, root: HTMLElement, handleSelector?: string, cancelSelector?: string): boolean {
    if (cancelSelector) {
        const cancel = target.closest(cancelSelector);
        if (cancel && root.contains(cancel)) return false;
    }
    if (handleSelector) {
        const handle = target.closest(handleSelector);
        if (!handle || !root.contains(handle)) return false;
    }
    return true;
}

export const Moveable: React.FC<MoveableProps> = ({
    children,
    defaultPosition,
    position: controlledPosition,
    onPositionChange,
    onMoveStart,
    onMove,
    onMoveEnd,
    axis = 'both',
    bounds = 'none',
    grid,
    disabled = false,
    handleSelector,
    cancelSelector,
    cursor = 'move',
    snapToGrid = true,
    keyboardStep = 8,
    keyboardBigStep = 32,
    elevateOnDrag = true,
    rememberLastPosition = false,
    storageKey,
    className,
    style,
    ariaLabel,
}) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const initialPos: MoveablePosition =
        (rememberLastPosition ? loadStoredPosition(storageKey) : null) ??
        defaultPosition ??
        controlledPosition ??
        { x: 0, y: 0 };

    const [internalPosition, setInternalPosition] = useState<MoveablePosition>(initialPos);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const liveRef = useRef<MoveablePosition>(initialPos);

    const isControlled = controlledPosition !== undefined;
    const position = isControlled ? (controlledPosition as MoveablePosition) : internalPosition;

    useLayoutEffect(() => {
        liveRef.current = position;
    }, [position]);

    const onPositionChangeRef = useRef(onPositionChange);
    const onMoveStartRef = useRef(onMoveStart);
    const onMoveRef = useRef(onMove);
    const onMoveEndRef = useRef(onMoveEnd);

    useEffect(() => {
        onPositionChangeRef.current = onPositionChange;
        onMoveStartRef.current = onMoveStart;
        onMoveRef.current = onMove;
        onMoveEndRef.current = onMoveEnd;
    }, [onPositionChange, onMoveStart, onMove, onMoveEnd]);

    const computeBounds = useCallback((): { left: number; top: number; right: number; bottom: number } => {
        const root = rootRef.current;
        if (typeof bounds === 'object') return bounds;
        if (bounds === 'window' && typeof window !== 'undefined' && root) {
            const rect = root.getBoundingClientRect();
            return {
                left: -rect.left + (liveRef.current.x ?? 0),
                top: -rect.top + (liveRef.current.y ?? 0),
                right: window.innerWidth - rect.width - rect.left + (liveRef.current.x ?? 0),
                bottom: window.innerHeight - rect.height - rect.top + (liveRef.current.y ?? 0),
            };
        }
        if (bounds === 'parent' && root?.parentElement) {
            const parent = root.parentElement;
            const parentRect = parent.getBoundingClientRect();
            const rect = root.getBoundingClientRect();
            return {
                left: -rect.left + parentRect.left + (liveRef.current.x ?? 0),
                top: -rect.top + parentRect.top + (liveRef.current.y ?? 0),
                right: parentRect.right - rect.right + (liveRef.current.x ?? 0),
                bottom: parentRect.bottom - rect.bottom + (liveRef.current.y ?? 0),
            };
        }
        return {
            left: Number.NEGATIVE_INFINITY,
            top: Number.NEGATIVE_INFINITY,
            right: Number.POSITIVE_INFINITY,
            bottom: Number.POSITIVE_INFINITY,
        };
    }, [bounds]);

    const applyPosition = useCallback(
        (next: MoveablePosition) => {
            liveRef.current = next;
            if (!isControlled) setInternalPosition(next);
            onPositionChangeRef.current?.(next);
            if (rememberLastPosition) storePosition(storageKey, next);
        },
        [isControlled, rememberLastPosition, storageKey],
    );

    const computeNext = useCallback(
        (startPos: MoveablePosition, deltaX: number, deltaY: number): MoveablePosition => {
            const xDelta = axis === 'y' ? 0 : deltaX;
            const yDelta = axis === 'x' ? 0 : deltaY;
            let nextX = startPos.x + xDelta;
            let nextY = startPos.y + yDelta;

            if (snapToGrid && grid) {
                nextX = snapValue(nextX, grid[0]);
                nextY = snapValue(nextY, grid[1]);
            }

            const bnds = computeBounds();
            nextX = clamp(nextX, bnds.left, bnds.right);
            nextY = clamp(nextY, bnds.top, bnds.bottom);

            return { x: nextX, y: nextY };
        },
        [axis, snapToGrid, grid, computeBounds],
    );

    const startDrag = useCallback(
        (clientX: number, clientY: number, pointerType: 'mouse' | 'touch') => {
            if (disabled) return;
            setIsDragging(true);
            const startPos: MoveablePosition = { ...liveRef.current };
            onMoveStartRef.current?.({ position: startPos, pointerType });

            const prevSelect = document.body.style.userSelect;
            const prevCursor = document.body.style.cursor;
            document.body.style.userSelect = 'none';
            document.body.style.cursor = cursor;

            const move = (mx: number, my: number) => {
                const deltaX = mx - clientX;
                const deltaY = my - clientY;
                const next = computeNext(startPos, deltaX, deltaY);
                applyPosition(next);
                onMoveRef.current?.({
                    position: next,
                    delta: { x: next.x - startPos.x, y: next.y - startPos.y },
                    pointerType,
                });
            };

            const finish = () => {
                document.body.style.userSelect = prevSelect;
                document.body.style.cursor = prevCursor;
                setIsDragging(false);
                onMoveEndRef.current?.({ position: liveRef.current, pointerType });
            };

            if (pointerType === 'touch') {
                const onTouchMove = (ev: TouchEvent) => {
                    if (!ev.touches.length) return;
                    ev.preventDefault();
                    move(ev.touches[0].clientX, ev.touches[0].clientY);
                };
                const onTouchEnd = () => {
                    document.removeEventListener('touchmove', onTouchMove);
                    document.removeEventListener('touchend', onTouchEnd);
                    document.removeEventListener('touchcancel', onTouchEnd);
                    finish();
                };
                document.addEventListener('touchmove', onTouchMove, { passive: false });
                document.addEventListener('touchend', onTouchEnd);
                document.addEventListener('touchcancel', onTouchEnd);
            } else {
                const onMouseMove = (ev: MouseEvent) => move(ev.clientX, ev.clientY);
                const onMouseUp = () => {
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                    finish();
                };
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            }
        },
        [applyPosition, computeNext, cursor, disabled],
    );

    const handlePointerDown = useCallback(
        (e: React.MouseEvent | React.TouchEvent) => {
            if (disabled) return;
            const root = rootRef.current;
            const target = e.target as HTMLElement;
            if (!root || !target) return;
            if (!shouldStartDrag(target, root, handleSelector, cancelSelector)) return;

            if ('touches' in e) {
                if (e.touches.length === 0) return;
                const touch = e.touches[0];
                startDrag(touch.clientX, touch.clientY, 'touch');
            } else {
                if (e.button !== 0) return;
                e.preventDefault();
                startDrag(e.clientX, e.clientY, 'mouse');
            }
        },
        [cancelSelector, disabled, handleSelector, startDrag],
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (disabled) return;
            const step = e.shiftKey ? keyboardBigStep : keyboardStep;
            let deltaX = 0;
            let deltaY = 0;
            switch (e.key) {
                case 'ArrowLeft':
                    deltaX = axis === 'y' ? 0 : -step;
                    break;
                case 'ArrowRight':
                    deltaX = axis === 'y' ? 0 : step;
                    break;
                case 'ArrowUp':
                    deltaY = axis === 'x' ? 0 : -step;
                    break;
                case 'ArrowDown':
                    deltaY = axis === 'x' ? 0 : step;
                    break;
                default:
                    return;
            }
            e.preventDefault();
            const startPos: MoveablePosition = { ...liveRef.current };
            onMoveStartRef.current?.({ position: startPos, pointerType: 'keyboard' });
            const next = computeNext(startPos, deltaX, deltaY);
            applyPosition(next);
            onMoveRef.current?.({
                position: next,
                delta: { x: next.x - startPos.x, y: next.y - startPos.y },
                pointerType: 'keyboard',
            });
            onMoveEndRef.current?.({ position: next, pointerType: 'keyboard' });
        },
        [applyPosition, axis, computeNext, disabled, keyboardBigStep, keyboardStep],
    );

    return (
        <div
            ref={rootRef}
            className={classNames(
                'eui-moveable',
                {
                    'eui-moveable-dragging': isDragging,
                    'eui-moveable-elevate': isDragging && elevateOnDrag,
                    'eui-moveable-disabled': disabled,
                },
                className,
            )}
            style={{
                transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
                cursor: disabled ? 'default' : handleSelector ? 'default' : cursor,
                touchAction: disabled ? 'auto' : 'none',
                ...style,
            }}
            onMouseDown={handlePointerDown}
            onTouchStart={handlePointerDown}
            onKeyDown={handleKeyDown}
            tabIndex={disabled ? -1 : 0}
            role="button"
            aria-label={ariaLabel ?? 'Movable element'}
            aria-pressed={isDragging}
        >
            {children}
        </div>
    );
};

Moveable.displayName = 'Moveable';

export type { MoveableAxis, MoveableBounds, MoveablePosition };
