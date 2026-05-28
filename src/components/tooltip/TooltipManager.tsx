import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import { registerTooltipHandlers, TooltipData, TooltipOptions, unregisterTooltipHandlers } from './tooltip-api';
import { computeTooltipPosition } from './utils';
import '../eui-base.scss';
import './tooltip.scss';

interface TooltipState {
    visible: boolean;
    content: React.ReactNode | string;
    options: TooltipOptions;
    targetRect: DOMRect | null;
    pos: { top: number; left: number };
    positioned: boolean;
}

function TooltipProvider() {
    const [state, setState] = useState<TooltipState>({
        visible: false,
        content: null,
        options: {},
        targetRect: null,
        pos: { top: 0, left: 0 },
        positioned: false,
    });
    const hideTimer = useRef<number | null>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const hoverRef = useRef(false);
    const targetRef = useRef<HTMLElement | null>(null);

    const clearHideTimer = () => {
        if (hideTimer.current) {
            window.clearTimeout(hideTimer.current);
            hideTimer.current = null;
        }
    };

    const isTargetActive = () => {
        const target = targetRef.current;
        if (!target) return false;
        if (document.activeElement === target) return true;
        return target.matches?.(':hover') ?? false;
    };

    const onShow = (data: TooltipData) => {
        clearHideTimer();
        const target = data.event.currentTarget as HTMLElement;
        targetRef.current = target;
        const rect = target.getBoundingClientRect();
        setState({
            visible: true,
            content: data.options.content || '',
            options: { timeout: 1500, placement: 'auto', ...data.options },
            targetRect: rect,
            pos: { top: rect.top, left: rect.left },
            positioned: false,
        });
    };

    const performHide = () => {
        targetRef.current = null;
        setState((s) => ({ ...s, visible: false }));
    };

    const onHide = (timeout: number) => {
        clearHideTimer();
        if (timeout === 0) {
            performHide();
        } else {
            hideTimer.current = window.setTimeout(() => {
                if (!hoverRef.current && !isTargetActive()) {
                    performHide();
                }
            }, timeout);
        }
    };

    const onHideById = (id: string) => {
        setState((s) => {
            if (!s.visible || s.options.id !== id) return s;
            clearHideTimer();
            targetRef.current = null;
            return { ...s, visible: false };
        });
    };

    useEffect(() => {
        registerTooltipHandlers(onShow, onHide, onHideById);
        const handleClick = (e: MouseEvent) => {
            if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
                clearHideTimer();
                performHide();
            }
        };
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                clearHideTimer();
                performHide();
            }
        };
        document.addEventListener('click', handleClick);
        document.addEventListener('keydown', handleKeyDown, true);
        return () => {
            unregisterTooltipHandlers(onShow, onHide);
            document.removeEventListener('click', handleClick);
            document.removeEventListener('keydown', handleKeyDown, true);
            clearHideTimer();
        };
    }, []);

    useLayoutEffect(() => {
        if (state.visible && tooltipRef.current && state.targetRect) {
            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            const { top, left } = computeTooltipPosition(state.targetRect, tooltipRect, state.options.placement);
            setState((s) => ({ ...s, pos: { top, left }, positioned: true }));
        }
    }, [state.visible, state.targetRect, state.options.placement, state.content]);

    const tooltipElement = state.visible
        ? createPortal(
              <div
                  ref={tooltipRef}
                  id={state.options.id}
                  role="tooltip"
                  className={classNames('eui-tooltip', { 'eui-tooltip-visible': state.positioned })}
                  style={{
                      top: state.positioned ? state.pos.top : -9999,
                      left: state.positioned ? state.pos.left : -9999,
                  }}
                  onMouseEnter={() => {
                      hoverRef.current = true;
                      clearHideTimer();
                  }}
                  onMouseLeave={() => {
                      hoverRef.current = false;
                      const t = state.options.timeout ?? 1500;
                      hideTimer.current = window.setTimeout(() => {
                          if (!hoverRef.current && !isTargetActive()) performHide();
                      }, t);
                  }}
              >
                  {state.content}
              </div>,
              document.body
          )
        : null;

    return tooltipElement;
}

export default TooltipProvider;
