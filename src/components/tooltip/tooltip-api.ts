import React from 'react';
import { PlacementCorners } from '../../types';

export interface TooltipOptions {
    timeout?: number;
    content?: React.ReactNode | string;
    placement?: PlacementCorners;
    id?: string;
}

export interface TooltipData {
    event: React.MouseEvent;
    options: TooltipOptions;
}

let showTooltipHandler: ((data: TooltipData) => void) | null = null;
let hideTooltipHandler: ((timeout: number) => void) | null = null;

export function registerTooltipHandlers(show: (data: TooltipData) => void, hide: (timeout: number) => void) {
    showTooltipHandler = show;
    hideTooltipHandler = hide;
}

export function unregisterTooltipHandlers(show: (data: TooltipData) => void, hide: (timeout: number) => void) {
    if (showTooltipHandler === show) showTooltipHandler = null;
    if (hideTooltipHandler === hide) hideTooltipHandler = null;
}

export function showTooltip(e: React.MouseEvent, opt: TooltipOptions | React.ReactNode | string) {
    if (showTooltipHandler) {
        const options: TooltipOptions = typeof opt === 'string' || React.isValidElement(opt) ? { content: opt } : (opt as TooltipOptions);
        showTooltipHandler({ event: e, options });
    }
}

export function hideTooltip(params: { timeout?: number } = {}) {
    const timeout = params.timeout ?? 1500;
    if (hideTooltipHandler) {
        hideTooltipHandler(timeout);
    }
}
