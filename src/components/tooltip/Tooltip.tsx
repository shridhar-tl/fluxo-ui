import React, { Children, cloneElement, isValidElement, useCallback, useId, useRef } from 'react';
import { PlacementCorners } from '../../types';
import { hideTooltip, showTooltip } from './tooltip-api';

interface TooltipProps {
    content: React.ReactNode | string;
    placement?: PlacementCorners;
    timeout?: number;
    children: React.ReactElement;
    longPressMs?: number;
}

const canHover = () => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return true;
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
};

export const Tooltip: React.FC<TooltipProps> = ({
    content,
    placement = 'auto',
    timeout = 1500,
    children,
    longPressMs = 500,
}) => {
    const longPressTimerRef = useRef<number | null>(null);
    const wasLongPressRef = useRef(false);
    const generatedId = useId();
    const tooltipId = `eui-tooltip-${generatedId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

    const clearLongPressTimer = useCallback(() => {
        if (longPressTimerRef.current !== null) {
            window.clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
    }, []);

    const handleMouseEnter = useCallback(
        (e: React.MouseEvent) => {
            if (!canHover()) return;
            showTooltip(e, { content, placement, timeout, id: tooltipId });
        },
        [content, placement, timeout, tooltipId],
    );

    const handleMouseLeave = useCallback(() => {
        if (!canHover()) return;
        hideTooltip({ timeout: 0 });
    }, []);

    const handleFocus = useCallback(
        (e: React.FocusEvent) => {
            const cloned = e as unknown as React.MouseEvent;
            showTooltip(cloned, { content, placement, timeout, id: tooltipId });
        },
        [content, placement, timeout, tooltipId],
    );

    const handleBlur = useCallback(() => {
        hideTooltip({ timeout: 0 });
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            hideTooltip({ timeout: 0 });
        }
    }, []);

    const handlePointerDown = useCallback(
        (e: React.PointerEvent) => {
            if (e.pointerType === 'mouse') return;
            wasLongPressRef.current = false;
            const cloned = e as unknown as React.MouseEvent;
            longPressTimerRef.current = window.setTimeout(() => {
                wasLongPressRef.current = true;
                showTooltip(cloned, { content, placement, timeout: 2500, id: tooltipId });
            }, longPressMs);
        },
        [content, placement, longPressMs, tooltipId],
    );

    const handlePointerEnd = useCallback(() => {
        clearLongPressTimer();
        if (wasLongPressRef.current) {
            window.setTimeout(() => hideTooltip({ timeout: 0 }), 1500);
        }
    }, [clearLongPressTimer]);

    const handleClick = useCallback(
        (e: React.MouseEvent) => {
            if (wasLongPressRef.current) {
                e.preventDefault();
                e.stopPropagation();
                wasLongPressRef.current = false;
            }
        },
        [],
    );

    const child = Children.only(children);
    if (!isValidElement(child)) return child;

    const childProps = (child as { props?: Record<string, unknown> }).props || {};
    const existingDescribedBy = typeof childProps['aria-describedby'] === 'string' ? (childProps['aria-describedby'] as string) : '';
    const mergedDescribedBy = existingDescribedBy && !existingDescribedBy.split(/\s+/).includes(tooltipId)
        ? `${existingDescribedBy} ${tooltipId}`
        : existingDescribedBy || tooltipId;

    const childOnMouseEnter = childProps.onMouseEnter as ((e: React.MouseEvent) => void) | undefined;
    const childOnMouseLeave = childProps.onMouseLeave as ((e: React.MouseEvent) => void) | undefined;
    const childOnFocus = childProps.onFocus as ((e: React.FocusEvent) => void) | undefined;
    const childOnBlur = childProps.onBlur as ((e: React.FocusEvent) => void) | undefined;
    const childOnKeyDown = childProps.onKeyDown as ((e: React.KeyboardEvent) => void) | undefined;
    const childOnPointerDown = childProps.onPointerDown as ((e: React.PointerEvent) => void) | undefined;
    const childOnPointerUp = childProps.onPointerUp as ((e: React.PointerEvent) => void) | undefined;
    const childOnPointerCancel = childProps.onPointerCancel as ((e: React.PointerEvent) => void) | undefined;
    const childOnPointerLeave = childProps.onPointerLeave as ((e: React.PointerEvent) => void) | undefined;
    const childOnClick = childProps.onClick as ((e: React.MouseEvent) => void) | undefined;

    return cloneElement(child as React.ReactElement<Record<string, unknown>>, {
        'aria-describedby': mergedDescribedBy,
        onMouseEnter: (e: React.MouseEvent) => {
            handleMouseEnter(e);
            childOnMouseEnter?.(e);
        },
        onMouseLeave: (e: React.MouseEvent) => {
            handleMouseLeave();
            childOnMouseLeave?.(e);
        },
        onFocus: (e: React.FocusEvent) => {
            handleFocus(e);
            childOnFocus?.(e);
        },
        onBlur: (e: React.FocusEvent) => {
            handleBlur();
            childOnBlur?.(e);
        },
        onKeyDown: (e: React.KeyboardEvent) => {
            handleKeyDown(e);
            childOnKeyDown?.(e);
        },
        onPointerDown: (e: React.PointerEvent) => {
            handlePointerDown(e);
            childOnPointerDown?.(e);
        },
        onPointerUp: (e: React.PointerEvent) => {
            handlePointerEnd();
            childOnPointerUp?.(e);
        },
        onPointerCancel: (e: React.PointerEvent) => {
            handlePointerEnd();
            childOnPointerCancel?.(e);
        },
        onPointerLeave: (e: React.PointerEvent) => {
            clearLongPressTimer();
            childOnPointerLeave?.(e);
        },
        onClick: (e: React.MouseEvent) => {
            handleClick(e);
            if (!wasLongPressRef.current) {
                childOnClick?.(e);
            }
        },
    });
};

export default Tooltip;
