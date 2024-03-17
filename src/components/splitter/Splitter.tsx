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

// ---------------------------------------------------------------------------

export type SplitterLayout = 'horizontal' | 'vertical';

export interface SplitterProps {
    layout?: SplitterLayout;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    gutterSize?: number;
    onResizeEnd?: (firstPanelSize: number) => void;
}

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
        if (React.isValidElement(child)) {
            panels.push(child as React.ReactElement<SplitterPanelProps>);
        }
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
}) => {
    const isHorizontal = layout === 'horizontal';
    const containerRef = useRef<HTMLDivElement>(null);
    const firstPanelRef = useRef<HTMLDivElement>(null);
    const dragState = useRef<{ dragging: boolean; startPos: number; startFirstSize: number }>({
        dragging: false,
        startPos: 0,
        startFirstSize: 0,
    });

    const [firstSize, setFirstSize] = useState<number | null>(null);
    const initialised = useRef(false);
    const id = useId();

    const panels = getPanels(children);
    const firstPanel = panels[0];
    const secondPanel = panels[1];
    const singlePanel = firstPanel && !secondPanel;

    const firstProps = firstPanel?.props;
    const secondProps = secondPanel?.props;

    const propsRef = useRef({ firstProps, secondProps, gutterSize, isHorizontal, onResizeEnd });
    propsRef.current = { firstProps, secondProps, gutterSize, isHorizontal, onResizeEnd };

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
            const totalPx = isHorizontal ? entry.contentRect.width : entry.contentRect.height;
            if (totalPx > 0) {
                initSize(totalPx);
            }
        });

        observer.observe(container);

        const totalPx = isHorizontal ? container.offsetWidth : container.offsetHeight;
        if (totalPx > 0 && !initialised.current) {
            initSize(totalPx);
        }

        return () => observer.disconnect();
    }, [isHorizontal, initSize, singlePanel]);

    useEffect(() => {
        initialised.current = false;
        setFirstSize(null);
    }, [isHorizontal]);

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

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        const step = 20;
        const container = containerRef.current;
        const firstEl = firstPanelRef.current;
        if (!container || !firstEl) return;

        const { isHorizontal, firstProps, secondProps, gutterSize, onResizeEnd } = propsRef.current;
        if (!firstProps || !secondProps) return;
        const totalPx = isHorizontal ? container.offsetWidth : container.offsetHeight;
        const currentSize = isHorizontal ? firstEl.offsetWidth : firstEl.offsetHeight;

        let delta = 0;
        if (e.key === (isHorizontal ? 'ArrowLeft' : 'ArrowUp')) delta = -step;
        else if (e.key === (isHorizontal ? 'ArrowRight' : 'ArrowDown')) delta = step;
        else return;

        e.preventDefault();
        const next = clamp(currentSize + delta, getMinPx(firstProps, totalPx), totalPx - gutterSize - getMinPx(secondProps, totalPx));
        setFirstSize(next);
        onResizeEnd?.(next);
    }, [getMinPx]);

    if (!firstPanel) {
        console.warn('[Splitter] At least 1 SplitterPanel child is required.');
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

    const firstStyle: React.CSSProperties = {
        ...(firstProps?.style ?? {}),
        flexShrink: 0,
        overflow: 'hidden',
        ...(isHorizontal
            ? { width: firstSize !== null ? `${firstSize}px` : '50%' }
            : { height: firstSize !== null ? `${firstSize}px` : '50%' }),
    };

    const secondStyle: React.CSSProperties = {
        ...(secondProps?.style ?? {}),
        flex: '1 1 0',
        minWidth: 0,
        minHeight: 0,
        overflow: 'hidden',
    };

    const gutterStyle: React.CSSProperties = isHorizontal
        ? { width: `${gutterSize}px`, flexShrink: 0, minWidth: `${gutterSize}px` }
        : { height: `${gutterSize}px`, flexShrink: 0, minHeight: `${gutterSize}px` };

    return (
        <div
            ref={containerRef}
            className={classNames('eui-splitter', isHorizontal ? 'eui-splitter-horizontal' : 'eui-splitter-vertical', className)}
            style={style}
            id={id}
        >
            <div
                ref={firstPanelRef}
                className={classNames('eui-splitter-panel', firstProps?.className)}
                style={firstStyle}
            >
                {firstPanel.props.children}
            </div>

            <div
                className={classNames(
                    'eui-splitter-gutter',
                    isHorizontal ? 'eui-splitter-gutter-horizontal' : 'eui-splitter-gutter-vertical',
                )}
                style={gutterStyle}
                role="separator"
                aria-orientation={isHorizontal ? 'vertical' : 'horizontal'}
                aria-label="Resize panels"
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

            <div
                className={classNames('eui-splitter-panel', secondProps?.className)}
                style={secondStyle}
            >
                {secondPanel.props.children}
            </div>
        </div>
    );
};

Splitter.displayName = 'Splitter';
