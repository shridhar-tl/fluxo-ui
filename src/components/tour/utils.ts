import { Placement } from './types';

export function isElementInViewport(el: HTMLElement | null) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

const OFFSET = 8;

export function computeTooltipPosition(
    targetRect: DOMRect,
    tooltipSize: { width: number; height: number },
    placement?: Placement,
    containerRect: DOMRect = document.body.getBoundingClientRect()
): { top: number; left: number; placement: Placement } {
    const space = {
        top: targetRect.top - containerRect.top,
        bottom: containerRect.bottom - targetRect.bottom,
        left: targetRect.left - containerRect.left,
        right: containerRect.right - targetRect.right,
    };

    const fitTop = space.top >= tooltipSize.height + OFFSET;
    const fitBottom = space.bottom >= tooltipSize.height + OFFSET;
    const fitLeft = space.left >= tooltipSize.width + OFFSET;
    const fitRight = space.right >= tooltipSize.width + OFFSET;

    // Use placement if provided
    let placementUsed: Placement;
    if (placement) {
        placementUsed = placement;
    } else {
        if (fitBottom) placementUsed = 'bottom';
        else if (fitTop) placementUsed = 'top';
        else if (fitRight) placementUsed = 'right';
        else if (fitLeft) placementUsed = 'left';
        else placementUsed = 'bottom';
    }

    let top = 0,
        left = 0;

    switch (placementUsed) {
        case 'top':
            top = targetRect.top - tooltipSize.height - OFFSET;
            left = targetRect.left + targetRect.width / 2 - tooltipSize.width / 2;
            break;
        case 'bottom':
            top = targetRect.bottom + OFFSET;
            left = targetRect.left + targetRect.width / 2 - tooltipSize.width / 2;
            break;
        case 'left':
            top = targetRect.top + targetRect.height / 2 - tooltipSize.height / 2;
            left = targetRect.left - tooltipSize.width - OFFSET;
            break;
        case 'right':
            top = targetRect.top + targetRect.height / 2 - tooltipSize.height / 2;
            left = targetRect.right + OFFSET;
            break;
    }

    // Clamp top and left to viewport
    top = Math.min(Math.max(containerRect.top + OFFSET, top), containerRect.bottom - tooltipSize.height - OFFSET);
    left = Math.min(Math.max(containerRect.left + OFFSET, left), containerRect.right - tooltipSize.width - OFFSET);

    return { top, left, placement: placementUsed };
}
