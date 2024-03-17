import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import { registerTooltipHandlers, TooltipData, TooltipOptions, unregisterTooltipHandlers } from './Tooltip';
import { computeTooltipPosition } from './utils';
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

    const clearHideTimer = () => {
        if (hideTimer.current) {
            window.clearTimeout(hideTimer.current);
            hideTimer.current = null;
        }
    };

    const onShow = (data: TooltipData) => {
        clearHideTimer();
        const target = data.event.currentTarget as HTMLElement;
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
        setState((s) => ({ ...s, visible: false }));
    };

    const onHide = (timeout: number) => {
        clearHideTimer();
        if (timeout === 0) {
            performHide();
        } else {
            hideTimer.current = window.setTimeout(() => {
                if (!hoverRef.current) {
                    performHide();
                }
            }, timeout);
        }
    };

    useEffect(() => {
        registerTooltipHandlers(onShow, onHide);
        const handleClick = (e: MouseEvent) => {
            if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
                clearHideTimer();
                performHide();
            }
        };
        document.addEventListener('click', handleClick);
        return () => {
            unregisterTooltipHandlers(onShow, onHide);
            document.removeEventListener('click', handleClick);
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
                          if (!hoverRef.current) performHide();
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
