import React from 'react';
import { PlacementCorners } from '../../types';
import { warnManagerMissing } from '../../utils/warn-manager-missing';

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
let hideTooltipByIdHandler: ((id: string) => void) | null = null;

export function registerTooltipHandlers(
    show: (data: TooltipData) => void,
    hide: (timeout: number) => void,
    hideById?: (id: string) => void,
) {
    showTooltipHandler = show;
    hideTooltipHandler = hide;
    hideTooltipByIdHandler = hideById ?? null;
}

export function unregisterTooltipHandlers(show: (data: TooltipData) => void, hide: (timeout: number) => void) {
    if (showTooltipHandler === show) showTooltipHandler = null;
    if (hideTooltipHandler === hide) hideTooltipHandler = null;
    hideTooltipByIdHandler = null;
}

export function showTooltip(e: React.MouseEvent, opt: TooltipOptions | React.ReactNode | string) {
    if (showTooltipHandler) {
        const options: TooltipOptions = typeof opt === 'string' || React.isValidElement(opt) ? { content: opt } : (opt as TooltipOptions);
        showTooltipHandler({ event: e, options });
        return;
    }
    warnManagerMissing('TooltipManager', 'showTooltip', '<TooltipManager /> from fluxo-ui');
}

export function hideTooltip(params: { timeout?: number } = {}) {
    const timeout = params.timeout ?? 1500;
    if (hideTooltipHandler) {
        hideTooltipHandler(timeout);
    }
}

export function hideTooltipById(id: string) {
    hideTooltipByIdHandler?.(id);
}
