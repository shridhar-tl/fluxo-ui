import { PlacementCorners } from '../../types';

const margin = 8;

function computeRaw(
    placement: PlacementCorners,
    targetRect: DOMRect,
    tooltipRect: DOMRect
): { top: number; left: number } {
    switch (placement) {
        case 'topLeft':
            return {
                top: targetRect.top - tooltipRect.height - margin,
                left: targetRect.right - tooltipRect.width,
            };
        case 'topRight':
            return {
                top: targetRect.top - tooltipRect.height - margin,
                left: targetRect.left,
            };
        case 'bottomLeft':
            return {
                top: targetRect.bottom + margin,
                left: targetRect.right - tooltipRect.width,
            };
        case 'bottomRight':
            return {
                top: targetRect.bottom + margin,
                left: targetRect.left,
            };
        default:
            return { top: 0, left: 0 };
    }
}

function fitsViewport(
    pos: { top: number; left: number },
    tooltipRect: DOMRect
): boolean {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    return (
        pos.top >= margin &&
        pos.top + tooltipRect.height <= vh - margin &&
        pos.left >= margin &&
        pos.left + tooltipRect.width <= vw - margin
    );
}

function clampToViewport(
    pos: { top: number; left: number },
    tooltipRect: DOMRect
): { top: number; left: number } {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    return {
        top: Math.max(margin, Math.min(pos.top, vh - tooltipRect.height - margin)),
        left: Math.max(margin, Math.min(pos.left, vw - tooltipRect.width - margin)),
    };
}

const fallbackOrder: Record<PlacementCorners, PlacementCorners[]> = {
    bottomLeft: ['bottomLeft', 'bottomRight', 'topLeft', 'topRight'],
    bottomRight: ['bottomRight', 'bottomLeft', 'topRight', 'topLeft'],
    topLeft: ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'],
    topRight: ['topRight', 'topLeft', 'bottomRight', 'bottomLeft'],
    auto: ['bottomLeft', 'bottomRight', 'topLeft', 'topRight'],
};

export function computeTooltipPosition(
    targetRect: DOMRect,
    tooltipRect: DOMRect,
    preferredPlacement?: PlacementCorners
): { top: number; left: number; placement: PlacementCorners } {
    const preferred = preferredPlacement ?? 'auto';
    const placements = fallbackOrder[preferred] ?? fallbackOrder.auto;

    let finalPlacement = placements[0];
    let finalPos = computeRaw(placements[0], targetRect, tooltipRect);

    for (const placement of placements) {
        const pos = computeRaw(placement, targetRect, tooltipRect);
        if (fitsViewport(pos, tooltipRect)) {
            finalPlacement = placement;
            finalPos = pos;
            break;
        }
    }

    return { ...clampToViewport(finalPos, tooltipRect), placement: finalPlacement };
}
