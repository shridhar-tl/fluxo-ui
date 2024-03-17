import { useCallback, useState } from 'react';
import { ConfirmPopoverPlacement } from './types';

export interface PopoverPosition {
    top: number;
    left: number;
    resolvedPlacement: ConfirmPopoverPlacement;
}

const padding = 8;

const computePosition = (
    triggerRect: DOMRect,
    popoverWidth: number,
    popoverHeight: number,
    placement: ConfirmPopoverPlacement
): PopoverPosition => {
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const spaceTop = triggerRect.top;
    const spaceBottom = vh - triggerRect.bottom;
    const spaceLeft = triggerRect.left;
    const spaceRight = vw - triggerRect.right;

    const resolvedBase = (base: ConfirmPopoverPlacement): ConfirmPopoverPlacement => {
        if (base !== 'auto') return base;
        if (spaceBottom >= popoverHeight + padding) return 'bottom';
        if (spaceTop >= popoverHeight + padding) return 'top';
        if (spaceRight >= popoverWidth + padding) return 'right';
        if (spaceLeft >= popoverWidth + padding) return 'left';
        return spaceBottom >= spaceTop ? 'bottom' : 'top';
    };

    const resolved = resolvedBase(placement);

    const centerX = triggerRect.left + triggerRect.width / 2 - popoverWidth / 2 + scrollX;
    const centerY = triggerRect.top + triggerRect.height / 2 - popoverHeight / 2 + scrollY;
    const alignLeft = triggerRect.left + scrollX;
    const alignRight = triggerRect.right + scrollX - popoverWidth;
    const alignBottom = triggerRect.bottom + scrollY;

    let top = 0;
    let left = 0;

    switch (resolved) {
        case 'top':
            top = triggerRect.top + scrollY - popoverHeight - padding;
            left = clamp(centerX, padding, vw - popoverWidth - padding + scrollX);
            break;
        case 'topLeft':
            top = triggerRect.top + scrollY - popoverHeight - padding;
            left = clamp(alignLeft, padding, vw - popoverWidth - padding + scrollX);
            break;
        case 'topRight':
            top = triggerRect.top + scrollY - popoverHeight - padding;
            left = clamp(alignRight, padding, vw - popoverWidth - padding + scrollX);
            break;
        case 'bottom':
            top = alignBottom + padding;
            left = clamp(centerX, padding, vw - popoverWidth - padding + scrollX);
            break;
        case 'bottomLeft':
            top = alignBottom + padding;
            left = clamp(alignLeft, padding, vw - popoverWidth - padding + scrollX);
            break;
        case 'bottomRight':
            top = alignBottom + padding;
            left = clamp(alignRight, padding, vw - popoverWidth - padding + scrollX);
            break;
        case 'left':
            top = clamp(centerY, padding + scrollY, vh - popoverHeight - padding + scrollY);
            left = triggerRect.left + scrollX - popoverWidth - padding;
            break;
        case 'right':
            top = clamp(centerY, padding + scrollY, vh - popoverHeight - padding + scrollY);
            left = triggerRect.right + scrollX + padding;
            break;
        default:
            top = alignBottom + padding;
            left = clamp(centerX, padding, vw - popoverWidth - padding + scrollX);
    }

    return { top, left, resolvedPlacement: resolved };
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const useConfirmPopoverPosition = () => {
    const [position, setPosition] = useState<PopoverPosition>({ top: 0, left: 0, resolvedPlacement: 'bottom' });

    const calculatePosition = useCallback(
        (triggerElement: HTMLElement, popoverElement: HTMLElement, placement: ConfirmPopoverPlacement) => {
            const triggerRect = triggerElement.getBoundingClientRect();
            const popoverRect = popoverElement.getBoundingClientRect();
            const computed = computePosition(triggerRect, popoverRect.width, popoverRect.height, placement);

            popoverElement.style.top = `${computed.top}px`;
            popoverElement.style.left = `${computed.left}px`;

            setPosition(computed);
        },
        []
    );

    return { position, calculatePosition };
};
