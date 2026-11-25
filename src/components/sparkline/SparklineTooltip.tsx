import React, { useCallback, useLayoutEffect, useRef } from 'react';

import { createPortal } from 'react-dom';

interface SparklineTooltipProps {
    svg: SVGSVGElement | null;
    anchor: { x: number; y: number } | null;
    id: string;
    children: React.ReactNode;
}

const edgeGap = 8;
const belowClass = 'eui-sparkline-tooltip-below';

const SparklineTooltip: React.FC<SparklineTooltipProps> = ({ svg, anchor, id, children }) => {
    const tooltipRef = useRef<HTMLDivElement>(null);

    const position = useCallback(() => {
        const tooltip = tooltipRef.current;
        if (!svg || !anchor || !tooltip) return;
        const rect = svg.getBoundingClientRect();
        const viewportX = rect.left + anchor.x;
        const viewportY = rect.top + anchor.y;
        const halfWidth = tooltip.offsetWidth / 2;
        const clampedX = Math.min(window.innerWidth - edgeGap - halfWidth, Math.max(edgeGap + halfWidth, viewportX));
        tooltip.style.top = `${viewportY + window.scrollY}px`;
        tooltip.style.left = `${clampedX + window.scrollX}px`;
        tooltip.classList.toggle(belowClass, viewportY < tooltip.offsetHeight + 16);
        tooltip.style.visibility = 'visible';
    }, [svg, anchor]);

    useLayoutEffect(() => {
        if (!anchor) return;
        position();
        window.addEventListener('scroll', position, { capture: true, passive: true });
        window.addEventListener('resize', position);
        return () => {
            window.removeEventListener('scroll', position, { capture: true });
            window.removeEventListener('resize', position);
        };
    }, [anchor, position, children]);

    if (!anchor || typeof document === 'undefined') return null;

    return createPortal(
        <div id={id} ref={tooltipRef} role="tooltip" className="eui-sparkline-tooltip" style={{ visibility: 'hidden' }}>
            {children}
        </div>,
        document.body,
    );
};

export { SparklineTooltip };
