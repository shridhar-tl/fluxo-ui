import classNames from 'classnames';
import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import './splitter.scss';

export interface SplitterPanelProps {
    children?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    minSize?: string;
    defaultSize?: string;
    fixed?: boolean;
}

export const SplitterPanel: React.FC<SplitterPanelProps> = ({ children, className, style }) => (
    <div className={classNames('eui-splitter-panel', className)} style={style}>
        {children}
    </div>
);

SplitterPanel.displayName = 'SplitterPanel';

export type SplitterLayout = 'horizontal' | 'vertical';

export interface SplitterProps {
    layout?: SplitterLayout;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    gutterSize?: number;
    onResizeEnd?: (firstPanelSize: number) => void;
    /**
     * Container width in pixels (measured on the splitter's own element, not
     * the viewport) below which a `layout="horizontal"` splitter collapses from
     * side-by-side into a stacked layout. Only applies when `layout` is
     * 'horizontal' — a vertical splitter is already stacked and ignores this.
     * The collapse only flips layout styles and swaps the draggable gutter for
     * a static divider; panels keep their identity and are never unmounted, so
     * child component state is preserved across the transition. Omit to disable.
     */
    responsive?: number;
    /**
     * Direction panels stack in once collapsed (only used with `responsive`).
     * Defaults to 'vertical' (first panel on top, second below).
     */
    collapsedLayout?: SplitterLayout;
    /**
     * Called when the splitter crosses the `responsive` threshold, with the
     * current collapsed state.
     */
    onCollapseChange?: (collapsed: boolean) => void;
}

const DEFAULT_KEYBOARD_STEP = 20;
const KEYBOARD_DEBOUNCE_MS = 180;

function parseSizeToPixels(size: string, totalPx: number): number {
    if (size.endsWith('%')) {
        return (parseFloat(size) / 100) * totalPx;
    }
    return parseFloat(size);
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function getPanels(children: React.ReactNode): React.ReactElement<SplitterPanelProps>[] {
    const panels: React.ReactElement<SplitterPanelProps>[] = [];
    React.Children.forEach(children, (child) => {
        if (!React.isValidElement(child)) return;

        const childType = child.type as { displayName?: string; name?: string } | string;
        const isSplitterPanel =
            childType === SplitterPanel ||
            (typeof childType !== 'string' && (childType.displayName === 'SplitterPanel' || childType.name === 'SplitterPanel'));

        if (!isSplitterPanel) {
            if (typeof console !== 'undefined' && typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
                console.warn('[FluxoUI Splitter] Only <SplitterPanel> children are accepted. Other elements will be ignored.');
            }
            return;
        }

        panels.push(child as React.ReactElement<SplitterPanelProps>);
    });
    return panels;
}

const gripDots = [0, 1, 2, 3, 4, 5];

export const Splitter: React.FC<SplitterProps> = ({
    layout = 'horizontal',
    children,
    className,
    style,
    gutterSize = 4,
    onResizeEnd,
    responsive,
    collapsedLayout = 'vertical',
    onCollapseChange,
}) => {
    const [collapsed, setCollapsed] = useState(false);
    const layoutIsHorizontal = layout === 'horizontal';
    const isHorizontal = (collapsed ? collapsedLayout : layout) === 'horizontal';
    const containerRef = useRef<HTMLDivElement>(null);
    const firstPanelRef = useRef<HTMLDivElement>(null);
    const secondPanelRef = useRef<HTMLDivElement>(null);
    const dragState = useRef<{ dragging: boolean; startPos: number; startFirstSize: number }>({
        dragging: false,
        startPos: 0,
        startFirstSize: 0,
    });
    const keyboardDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [firstSize, setFirstSize] = useState<number | null>(null);
    const initialised = useRef(false);
    const reactId = useId();
    const firstPanelId = `eui-splitter-panel-1-${reactId}`;
    const secondPanelId = `eui-splitter-panel-2-${reactId}`;

    const panels = getPanels(children);
    const firstPanel = panels[0];
    const secondPanel = panels[1];
    const singlePanel = firstPanel && !secondPanel;

    const firstProps = firstPanel?.props;
    const secondProps = secondPanel?.props;

    const propsRef = useRef({ firstProps, secondProps, gutterSize, isHorizontal, onResizeEnd, responsive, onCollapseChange });
    propsRef.current = { firstProps, secondProps, gutterSize, isHorizontal, onResizeEnd, responsive, onCollapseChange };

    const getMinPx = useCallback((props: SplitterPanelProps, totalPx: number): number => {
        if (!props.minSize) return 0;
        return parseSizeToPixels(props.minSize, totalPx);
    }, []);

    const initSize = useCallback((totalPx: number) => {
        const { firstProps, secondProps, gutterSize } = propsRef.current;
        if (firstProps?.defaultSize) {
            setFirstSize(parseSizeToPixels(firstProps.defaultSize, totalPx));
        } else if (secondProps?.defaultSize) {
            const secondPx = parseSizeToPixels(secondProps.defaultSize, totalPx);
            setFirstSize(totalPx - gutterSize - secondPx);
        } else {
            setFirstSize((totalPx - gutterSize) / 2);
        }
        initialised.current = true;
    }, []);

    useEffect(() => {
        if (singlePanel) return;
        const container = containerRef.current;
        if (!container) return;

        const observer = new ResizeObserver((entries) => {
            if (initialised.current) return;
            const entry = entries[0];
            const totalPx = layoutIsHorizontal ? entry.contentRect.width : entry.contentRect.height;
            if (totalPx > 0) {
                initSize(totalPx);
            }
        });

        observer.observe(container);

        const totalPx = layoutIsHorizontal ? container.offsetWidth : container.offsetHeight;
        if (totalPx > 0 && !initialised.current) {
            initSize(totalPx);
        }

        return () => observer.disconnect();
    }, [layoutIsHorizontal, initSize, singlePanel]);

    useEffect(() => {
        initialised.current = false;
        setFirstSize(null);
    }, [layoutIsHorizontal]);

    useEffect(() => {
        if (responsive == null || layout !== 'horizontal') {
            setCollapsed(false);
            return;
        }
        const container = containerRef.current;
        if (!container) return;

        const evaluate = (width: number) => {
            const next = width > 0 && width < responsive;
            setCollapsed((prev) => {
                if (prev !== next) propsRef.current.onCollapseChange?.(next);
                return next;
            });
        };

        const observer = new ResizeObserver((entries) => {
            evaluate(entries[0].contentRect.width);
        });
        observer.observe(container);
        evaluate(container.offsetWidth);

        return () => observer.disconnect();
    }, [responsive, layout]);

    useEffect(() => {
        return () => {
            if (keyboardDebounceRef.current !== null) {
                clearTimeout(keyboardDebounceRef.current);
            }
        };
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        const firstEl = firstPanelRef.current;
        if (!firstEl) return;

        const { isHorizontal } = propsRef.current;
        dragState.current = {
            dragging: true,
            startPos: isHorizontal ? e.clientX : e.clientY,
            startFirstSize: isHorizontal ? firstEl.offsetWidth : firstEl.offsetHeight,
        };

        const handleMouseMove = (ev: MouseEvent) => {
            if (!dragState.current.dragging) return;
            const container = containerRef.current;
            if (!container) return;

            const { isHorizontal, firstProps, secondProps, gutterSize } = propsRef.current;
            if (!firstProps || !secondProps) return;
            const totalPx = isHorizontal ? container.offsetWidth : container.offsetHeight;
            const delta = (isHorizontal ? ev.clientX : ev.clientY) - dragState.current.startPos;
            const raw = dragState.current.startFirstSize + delta;
            const clamped = clamp(raw, getMinPx(firstProps, totalPx), totalPx - gutterSize - getMinPx(secondProps, totalPx));
            setFirstSize(clamped);
        };

        const handleMouseUp = () => {
            if (!dragState.current.dragging) return;
            dragState.current.dragging = false;
            const firstEl = firstPanelRef.current;
            const { isHorizontal, onResizeEnd } = propsRef.current;
            if (firstEl && onResizeEnd) {
                onResizeEnd(isHorizontal ? firstEl.offsetWidth : firstEl.offsetHeight);
            }
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }, [getMinPx]);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        const touch = e.touches[0];
        const firstEl = firstPanelRef.current;
        if (!firstEl) return;

        const { isHorizontal } = propsRef.current;
        dragState.current = {
            dragging: true,
            startPos: isHorizontal ? touch.clientX : touch.clientY,
            startFirstSize: isHorizontal ? firstEl.offsetWidth : firstEl.offsetHeight,
        };

        const handleTouchMove = (ev: TouchEvent) => {
            if (!dragState.current.dragging) return;
            ev.preventDefault();
            const container = containerRef.current;
            if (!container) return;

            const { isHorizontal, firstProps, secondProps, gutterSize } = propsRef.current;
            if (!firstProps || !secondProps) return;
            const t = ev.touches[0];
            const totalPx = isHorizontal ? container.offsetWidth : container.offsetHeight;
            const delta = (isHorizontal ? t.clientX : t.clientY) - dragState.current.startPos;
            const raw = dragState.current.startFirstSize + delta;
            const clamped = clamp(raw, getMinPx(firstProps, totalPx), totalPx - gutterSize - getMinPx(secondProps, totalPx));
            setFirstSize(clamped);
        };

        const handleTouchEnd = () => {
            dragState.current.dragging = false;
            const firstEl = firstPanelRef.current;
            const { isHorizontal, onResizeEnd } = propsRef.current;
            if (firstEl && onResizeEnd) {
                onResizeEnd(isHorizontal ? firstEl.offsetWidth : firstEl.offsetHeight);
            }
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };

        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);
    }, [getMinPx]);

    const scheduleKeyboardResizeEnd = useCallback((next: number) => {
        if (keyboardDebounceRef.current !== null) {
            clearTimeout(keyboardDebounceRef.current);
        }
        keyboardDebounceRef.current = setTimeout(() => {
            keyboardDebounceRef.current = null;
            const { onResizeEnd } = propsRef.current;
            onResizeEnd?.(next);
        }, KEYBOARD_DEBOUNCE_MS);
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        const container = containerRef.current;
        const firstEl = firstPanelRef.current;
        if (!container || !firstEl) return;

        const { isHorizontal, firstProps, secondProps, gutterSize } = propsRef.current;
        if (!firstProps || !secondProps) return;
        const totalPx = isHorizontal ? container.offsetWidth : container.offsetHeight;
        const currentSize = isHorizontal ? firstEl.offsetWidth : firstEl.offsetHeight;
        const minPx = getMinPx(firstProps, totalPx);
        const maxPx = totalPx - gutterSize - getMinPx(secondProps, totalPx);

        const decreaseKey = isHorizontal ? 'ArrowLeft' : 'ArrowUp';
        const increaseKey = isHorizontal ? 'ArrowRight' : 'ArrowDown';

        let next: number | null = null;

        if (e.key === decreaseKey) {
            next = currentSize - DEFAULT_KEYBOARD_STEP;
        } else if (e.key === increaseKey) {
            next = currentSize + DEFAULT_KEYBOARD_STEP;
        } else if (e.key === 'PageUp') {
            next = currentSize - DEFAULT_KEYBOARD_STEP * 5;
        } else if (e.key === 'PageDown') {
            next = currentSize + DEFAULT_KEYBOARD_STEP * 5;
        } else if (e.key === 'Home') {
            next = minPx;
        } else if (e.key === 'End') {
            next = maxPx;
        } else if (e.key === 'Enter' || e.key === ' ') {
            return;
        } else {
            return;
        }

        e.preventDefault();
        const clamped = clamp(next, minPx, maxPx);
        setFirstSize(clamped);
        scheduleKeyboardResizeEnd(clamped);
    }, [getMinPx, scheduleKeyboardResizeEnd]);

    if (!firstPanel) {
        if (typeof console !== 'undefined') {
            console.warn('[Splitter] At least 1 SplitterPanel child is required.');
        }
        return null;
    }

    if (singlePanel) {
        return (
            <div
                className={classNames('eui-splitter', isHorizontal ? 'eui-splitter-horizontal' : 'eui-splitter-vertical', className)}
                style={style}
            >
                <div
                    className={classNames('eui-splitter-panel', firstProps?.className)}
                    style={{ flex: '1 1 0', minWidth: 0, minHeight: 0, overflow: 'hidden', ...(firstProps?.style ?? {}) }}
                >
                    {firstPanel.props.children}
                </div>
            </div>
        );
    }

    const firstStyle: React.CSSProperties = collapsed
        ? { ...(firstProps?.style ?? {}), flex: '0 0 auto', minWidth: 0, overflow: 'visible' }
        : {
              ...(firstProps?.style ?? {}),
              flexShrink: 0,
              overflow: 'hidden',
              ...(isHorizontal
                  ? { width: firstSize !== null ? `${firstSize}px` : '50%' }
                  : { height: firstSize !== null ? `${firstSize}px` : '50%' }),
          };

    const secondStyle: React.CSSProperties = collapsed
        ? { ...(secondProps?.style ?? {}), flex: '0 0 auto', minWidth: 0, overflow: 'visible' }
        : {
              ...(secondProps?.style ?? {}),
              flex: '1 1 0',
              minWidth: 0,
              minHeight: 0,
              overflow: 'hidden',
          };

    const gutterStyle: React.CSSProperties = isHorizontal
        ? { width: `${gutterSize}px`, flexShrink: 0, minWidth: `${gutterSize}px` }
        : { height: `${gutterSize}px`, flexShrink: 0, minHeight: `${gutterSize}px` };

    const containerEl = containerRef.current;
    let valueNow = 50;
    let valueMin = 0;
    let valueMax = 100;

    if (containerEl && firstSize !== null) {
        const totalPx = isHorizontal ? containerEl.offsetWidth : containerEl.offsetHeight;
        if (totalPx > 0) {
            valueNow = Math.round((firstSize / totalPx) * 100);
            const minFirst = firstProps ? getMinPx(firstProps, totalPx) : 0;
            const minSecond = secondProps ? getMinPx(secondProps, totalPx) : 0;
            valueMin = Math.round((minFirst / totalPx) * 100);
            valueMax = Math.round(((totalPx - gutterSize - minSecond) / totalPx) * 100);
        }
    }

    return (
        <div
            ref={containerRef}
            className={classNames(
                'eui-splitter',
                isHorizontal ? 'eui-splitter-horizontal' : 'eui-splitter-vertical',
                collapsed && 'eui-splitter-collapsed',
                className,
            )}
            style={style}
            id={reactId}
        >
            <div
                ref={firstPanelRef}
                id={firstPanelId}
                className={classNames('eui-splitter-panel', firstProps?.className)}
                style={firstStyle}
            >
                {firstPanel.props.children}
            </div>

            {collapsed ? (
                <div className="eui-splitter-divider" aria-hidden="true" style={gutterStyle} />
            ) : (
                <div
                    className={classNames(
                        'eui-splitter-gutter',
                        isHorizontal ? 'eui-splitter-gutter-horizontal' : 'eui-splitter-gutter-vertical',
                    )}
                    style={gutterStyle}
                    role="separator"
                    aria-orientation={isHorizontal ? 'vertical' : 'horizontal'}
                    aria-label="Resize panels"
                    aria-valuenow={valueNow}
                    aria-valuemin={valueMin}
                    aria-valuemax={valueMax}
                    aria-controls={`${firstPanelId} ${secondPanelId}`}
                    tabIndex={0}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                    onKeyDown={handleKeyDown}
                >
                    <div
                        className={classNames(
                            'eui-splitter-gutter-handle',
                            isHorizontal ? 'eui-splitter-gutter-handle-horizontal' : 'eui-splitter-gutter-handle-vertical',
                        )}
                    >
                        {gripDots.map((i) => (
                            <span key={i} className="eui-splitter-grip-dot" />
                        ))}
                    </div>
                </div>
            )}

            <div
                ref={secondPanelRef}
                id={secondPanelId}
                className={classNames('eui-splitter-panel', secondProps?.className)}
                style={secondStyle}
            >
                {secondPanel.props.children}
            </div>
        </div>
    );
};

Splitter.displayName = 'Splitter';
