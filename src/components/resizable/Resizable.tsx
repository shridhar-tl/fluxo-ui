import classNames from 'classnames';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import './resizable.scss';
import type {
    ResizableProps,
    ResizableSize,
    ResizeAxis,
    ResizeHandlePosition,
} from './resizable-types';

const allHandles: ResizeHandlePosition[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
const cornerHandles: ResizeHandlePosition[] = ['ne', 'nw', 'se', 'sw'];
const edgeHandles: ResizeHandlePosition[] = ['n', 's', 'e', 'w'];

function resolveHandles(
    handles: ResizableProps['handles'],
    axis: ResizeAxis,
): ResizeHandlePosition[] {
    let list: ResizeHandlePosition[];
    if (handles === 'all' || handles === undefined) list = allHandles;
    else if (handles === 'corners') list = cornerHandles;
    else if (handles === 'edges') list = edgeHandles;
    else list = handles;

    if (axis === 'horizontal') {
        return list.filter((h) => h === 'e' || h === 'w');
    }
    if (axis === 'vertical') {
        return list.filter((h) => h === 'n' || h === 's');
    }
    return list;
}

function handleAffectsWidth(handle: ResizeHandlePosition): -1 | 0 | 1 {
    if (handle === 'e' || handle === 'ne' || handle === 'se') return 1;
    if (handle === 'w' || handle === 'nw' || handle === 'sw') return -1;
    return 0;
}

function handleAffectsHeight(handle: ResizeHandlePosition): -1 | 0 | 1 {
    if (handle === 's' || handle === 'se' || handle === 'sw') return 1;
    if (handle === 'n' || handle === 'ne' || handle === 'nw') return -1;
    return 0;
}

function snapToGrid(value: number, step?: number): number {
    if (!step || step <= 0) return value;
    return Math.round(value / step) * step;
}

function clampNumber(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function parseInitialDimension(value: number | string | undefined, fallback: number): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const parsed = parseFloat(value);
        if (!Number.isNaN(parsed)) return parsed;
    }
    return fallback;
}

function getCursorForHandle(handle: ResizeHandlePosition): string {
    switch (handle) {
        case 'n':
        case 's':
            return 'ns-resize';
        case 'e':
        case 'w':
            return 'ew-resize';
        case 'ne':
        case 'sw':
            return 'nesw-resize';
        case 'nw':
        case 'se':
            return 'nwse-resize';
        default:
            return 'default';
    }
}

export const Resizable: React.FC<ResizableProps> = ({
    children,
    defaultWidth,
    defaultHeight,
    width: controlledWidth,
    height: controlledHeight,
    onSizeChange,
    onResizeStart,
    onResize,
    onResizeEnd,
    axis = 'both',
    handles,
    minWidth = 40,
    minHeight = 40,
    maxWidth = Number.POSITIVE_INFINITY,
    maxHeight = Number.POSITIVE_INFINITY,
    grid,
    aspectRatio,
    lockAspectRatio,
    disabled = false,
    handleSize = 8,
    showHandles = 'always',
    keyboardStep = 8,
    keyboardBigStep = 32,
    bounds,
    className,
    style,
    handleClassName,
    ariaLabel,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const liveSizeRef = useRef<ResizableSize>({
        width: parseInitialDimension(defaultWidth ?? controlledWidth, 200),
        height: parseInitialDimension(defaultHeight ?? controlledHeight, 200),
    });

    const [internalSize, setInternalSize] = useState<ResizableSize>(liveSizeRef.current);
    const [activeHandle, setActiveHandle] = useState<ResizeHandlePosition | null>(null);

    const isControlled = controlledWidth !== undefined && controlledHeight !== undefined;
    const size: ResizableSize = isControlled
        ? { width: controlledWidth as number, height: controlledHeight as number }
        : internalSize;

    useLayoutEffect(() => {
        liveSizeRef.current = size;
    }, [size]);

    const resolvedHandles = useMemo(() => resolveHandles(handles, axis), [handles, axis]);

    const computedAspectRatio = useMemo(() => {
        if (typeof aspectRatio === 'number' && aspectRatio > 0) return aspectRatio;
        if (aspectRatio === true || lockAspectRatio) {
            return liveSizeRef.current.height === 0
                ? 1
                : liveSizeRef.current.width / liveSizeRef.current.height;
        }
        return null;
    }, [aspectRatio, lockAspectRatio]);

    const onSizeChangeRef = useRef(onSizeChange);
    const onResizeStartRef = useRef(onResizeStart);
    const onResizeRef = useRef(onResize);
    const onResizeEndRef = useRef(onResizeEnd);

    useEffect(() => {
        onSizeChangeRef.current = onSizeChange;
        onResizeStartRef.current = onResizeStart;
        onResizeRef.current = onResize;
        onResizeEndRef.current = onResizeEnd;
    }, [onSizeChange, onResizeStart, onResize, onResizeEnd]);

    const computeBounds = useCallback((): { maxW: number; maxH: number } => {
        if (typeof bounds === 'object' && bounds) {
            return { maxW: bounds.width, maxH: bounds.height };
        }
        if (bounds === 'window') {
            return {
                maxW: typeof window !== 'undefined' ? window.innerWidth : Number.POSITIVE_INFINITY,
                maxH: typeof window !== 'undefined' ? window.innerHeight : Number.POSITIVE_INFINITY,
            };
        }
        if (bounds === 'parent') {
            const parent = containerRef.current?.parentElement;
            if (parent) {
                const rect = parent.getBoundingClientRect();
                return { maxW: rect.width, maxH: rect.height };
            }
        }
        return { maxW: Number.POSITIVE_INFINITY, maxH: Number.POSITIVE_INFINITY };
    }, [bounds]);

    const applySize = useCallback(
        (next: ResizableSize) => {
            liveSizeRef.current = next;
            if (!isControlled) setInternalSize(next);
            onSizeChangeRef.current?.(next);
        },
        [isControlled],
    );

    const computeNextSize = useCallback(
        (
            handle: ResizeHandlePosition,
            startSize: ResizableSize,
            deltaX: number,
            deltaY: number,
        ): ResizableSize => {
            const widthDir = handleAffectsWidth(handle);
            const heightDir = handleAffectsHeight(handle);
            let nextWidth = startSize.width + widthDir * deltaX;
            let nextHeight = startSize.height + heightDir * deltaY;

            const bnds = computeBounds();
            const effectiveMaxW = Math.min(maxWidth, bnds.maxW);
            const effectiveMaxH = Math.min(maxHeight, bnds.maxH);

            nextWidth = clampNumber(snapToGrid(nextWidth, grid?.[0]), minWidth, effectiveMaxW);
            nextHeight = clampNumber(snapToGrid(nextHeight, grid?.[1]), minHeight, effectiveMaxH);

            if (computedAspectRatio) {
                if (widthDir !== 0 && heightDir === 0) {
                    nextHeight = clampNumber(nextWidth / computedAspectRatio, minHeight, effectiveMaxH);
                } else if (heightDir !== 0 && widthDir === 0) {
                    nextWidth = clampNumber(nextHeight * computedAspectRatio, minWidth, effectiveMaxW);
                } else if (widthDir !== 0 && heightDir !== 0) {
                    const widthFromHeight = nextHeight * computedAspectRatio;
                    if (widthFromHeight <= nextWidth) {
                        nextWidth = clampNumber(widthFromHeight, minWidth, effectiveMaxW);
                        nextHeight = clampNumber(nextWidth / computedAspectRatio, minHeight, effectiveMaxH);
                    } else {
                        nextHeight = clampNumber(nextWidth / computedAspectRatio, minHeight, effectiveMaxH);
                        nextWidth = clampNumber(nextHeight * computedAspectRatio, minWidth, effectiveMaxW);
                    }
                }
            }

            return { width: nextWidth, height: nextHeight };
        },
        [computeBounds, computedAspectRatio, grid, maxHeight, maxWidth, minHeight, minWidth],
    );

    const handlePointerStart = useCallback(
        (handle: ResizeHandlePosition, clientX: number, clientY: number, pointerType: 'mouse' | 'touch') => {
            if (disabled) return;
            setActiveHandle(handle);
            const startSize: ResizableSize = { ...liveSizeRef.current };
            onResizeStartRef.current?.({ handle, size: startSize, pointerType });

            const previousUserSelect = document.body.style.userSelect;
            const previousCursor = document.body.style.cursor;
            document.body.style.userSelect = 'none';
            document.body.style.cursor = getCursorForHandle(handle);

            const move = (mx: number, my: number) => {
                const deltaX = mx - clientX;
                const deltaY = my - clientY;
                const next = computeNextSize(handle, startSize, deltaX, deltaY);
                applySize(next);
                onResizeRef.current?.({
                    handle,
                    size: next,
                    delta: { width: next.width - startSize.width, height: next.height - startSize.height },
                    pointerType,
                });
            };

            const cleanup = () => {
                document.body.style.userSelect = previousUserSelect;
                document.body.style.cursor = previousCursor;
                setActiveHandle(null);
                onResizeEndRef.current?.({ handle, size: liveSizeRef.current, pointerType });
            };

            if (pointerType === 'touch') {
                const onTouchMove = (ev: TouchEvent) => {
                    if (ev.touches.length === 0) return;
                    ev.preventDefault();
                    move(ev.touches[0].clientX, ev.touches[0].clientY);
                };
                const onTouchEnd = () => {
                    document.removeEventListener('touchmove', onTouchMove);
                    document.removeEventListener('touchend', onTouchEnd);
                    document.removeEventListener('touchcancel', onTouchEnd);
                    cleanup();
                };
                document.addEventListener('touchmove', onTouchMove, { passive: false });
                document.addEventListener('touchend', onTouchEnd);
                document.addEventListener('touchcancel', onTouchEnd);
            } else {
                const onMouseMove = (ev: MouseEvent) => {
                    move(ev.clientX, ev.clientY);
                };
                const onMouseUp = () => {
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                    cleanup();
                };
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            }
        },
        [applySize, computeNextSize, disabled],
    );

    const handleKeyDown = useCallback(
        (handle: ResizeHandlePosition) => (event: React.KeyboardEvent) => {
            if (disabled) return;
            const widthDir = handleAffectsWidth(handle);
            const heightDir = handleAffectsHeight(handle);
            const step = event.shiftKey ? keyboardBigStep : keyboardStep;

            let deltaX = 0;
            let deltaY = 0;
            switch (event.key) {
                case 'ArrowLeft':
                    deltaX = widthDir !== 0 ? -step : 0;
                    break;
                case 'ArrowRight':
                    deltaX = widthDir !== 0 ? step : 0;
                    break;
                case 'ArrowUp':
                    deltaY = heightDir !== 0 ? -step : 0;
                    break;
                case 'ArrowDown':
                    deltaY = heightDir !== 0 ? step : 0;
                    break;
                case 'Home':
                    deltaX = widthDir !== 0 ? -10000 : 0;
                    deltaY = heightDir !== 0 ? -10000 : 0;
                    break;
                case 'End':
                    deltaX = widthDir !== 0 ? 10000 : 0;
                    deltaY = heightDir !== 0 ? 10000 : 0;
                    break;
                default:
                    return;
            }

            event.preventDefault();
            const startSize: ResizableSize = { ...liveSizeRef.current };
            onResizeStartRef.current?.({ handle, size: startSize, pointerType: 'keyboard' });
            const next = computeNextSize(handle, startSize, deltaX, deltaY);
            applySize(next);
            onResizeRef.current?.({
                handle,
                size: next,
                delta: { width: next.width - startSize.width, height: next.height - startSize.height },
                pointerType: 'keyboard',
            });
            onResizeEndRef.current?.({ handle, size: next, pointerType: 'keyboard' });
        },
        [applySize, computeNextSize, disabled, keyboardBigStep, keyboardStep],
    );

    const containerStyle: React.CSSProperties = {
        width: size.width,
        height: size.height,
        ...style,
    };

    return (
        <div
            ref={containerRef}
            className={classNames(
                'eui-resizable',
                {
                    'eui-resizable-disabled': disabled,
                    'eui-resizable-hover-handles': showHandles === 'hover',
                    'eui-resizable-no-handles': showHandles === 'never',
                    'eui-resizable-resizing': activeHandle !== null,
                },
                className,
            )}
            style={containerStyle}
            data-resizing={activeHandle ? 'true' : undefined}
        >
            <div className="eui-resizable-content">{children}</div>
            {!disabled && showHandles !== 'never' && resolvedHandles.map((handle) => {
                const label = ariaLabel ? `${ariaLabel} resize ${handle}` : `Resize ${handle}`;
                return (
                    <div
                        key={handle}
                        className={classNames(
                            'eui-resizable-handle',
                            `eui-resizable-handle-${handle}`,
                            { 'eui-resizable-handle-active': activeHandle === handle },
                            handleClassName,
                        )}
                        role="separator"
                        aria-label={label}
                        aria-orientation={handle === 'e' || handle === 'w' ? 'vertical' : 'horizontal'}
                        aria-valuenow={Math.round(handle === 'e' || handle === 'w' ? size.width : size.height)}
                        aria-valuemin={handle === 'e' || handle === 'w' ? minWidth : minHeight}
                        aria-valuemax={
                            handle === 'e' || handle === 'w'
                                ? (Number.isFinite(maxWidth) ? maxWidth : 9999)
                                : (Number.isFinite(maxHeight) ? maxHeight : 9999)
                        }
                        tabIndex={0}
                        style={{
                            '--eui-resizable-handle-size': `${handleSize}px`,
                            cursor: getCursorForHandle(handle),
                        } as React.CSSProperties}
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handlePointerStart(handle, e.clientX, e.clientY, 'mouse');
                        }}
                        onTouchStart={(e) => {
                            if (e.touches.length === 0) return;
                            e.stopPropagation();
                            const touch = e.touches[0];
                            handlePointerStart(handle, touch.clientX, touch.clientY, 'touch');
                        }}
                        onKeyDown={handleKeyDown(handle)}
                    />
                );
            })}
        </div>
    );
};

Resizable.displayName = 'Resizable';
