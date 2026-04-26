import React, { Children, cloneElement, isValidElement, useCallback, useRef } from 'react';
import { PlacementCorners } from '../../types';
import { hideTooltip, showTooltip } from './tooltip-api';

interface TooltipProps {
    content: React.ReactNode | string;
    placement?: PlacementCorners;
    timeout?: number;
    children: React.ReactElement;
    longPressMs?: number;
}

const isTouchDevice = () => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || (navigator as any).maxTouchPoints > 0;
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

    const clearLongPressTimer = useCallback(() => {
        if (longPressTimerRef.current !== null) {
            window.clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
    }, []);

    const handleMouseEnter = useCallback(
        (e: React.MouseEvent) => {
            if (isTouchDevice()) return;
            showTooltip(e, { content, placement, timeout });
        },
        [content, placement, timeout],
    );

    const handleMouseLeave = useCallback(() => {
        if (isTouchDevice()) return;
        hideTooltip({ timeout: 0 });
    }, []);

    const handlePointerDown = useCallback(
        (e: React.PointerEvent) => {
            if (e.pointerType === 'mouse') return;
            wasLongPressRef.current = false;
            const cloned = e as unknown as React.MouseEvent;
            longPressTimerRef.current = window.setTimeout(() => {
                wasLongPressRef.current = true;
                showTooltip(cloned, { content, placement, timeout: 2500 });
            }, longPressMs);
        },
        [content, placement, longPressMs],
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

    const childProps = (child as any).props || {};

    return cloneElement(child as any, {
        onMouseEnter: (e: React.MouseEvent) => {
            handleMouseEnter(e);
            childProps.onMouseEnter?.(e);
        },
        onMouseLeave: (e: React.MouseEvent) => {
            handleMouseLeave();
            childProps.onMouseLeave?.(e);
        },
        onPointerDown: (e: React.PointerEvent) => {
            handlePointerDown(e);
            childProps.onPointerDown?.(e);
        },
        onPointerUp: (e: React.PointerEvent) => {
            handlePointerEnd();
            childProps.onPointerUp?.(e);
        },
        onPointerCancel: (e: React.PointerEvent) => {
            handlePointerEnd();
            childProps.onPointerCancel?.(e);
        },
        onPointerLeave: (e: React.PointerEvent) => {
            clearLongPressTimer();
            childProps.onPointerLeave?.(e);
        },
        onClick: (e: React.MouseEvent) => {
            handleClick(e);
            if (!wasLongPressRef.current) {
                childProps.onClick?.(e);
            }
        },
    });
};

export default Tooltip;
