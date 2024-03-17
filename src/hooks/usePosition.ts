import { useCallback, useState } from 'react';

export const usePosition = () => {
    const [position, setPosition] = useState({ top: 0, left: 0, placement: 'bottom' as 'top' | 'bottom' });

    const calculatePosition = useCallback((triggerElement: HTMLElement, popoverElement: HTMLElement) => {
        const triggerRect = triggerElement.getBoundingClientRect();
        const popoverRect = popoverElement.getBoundingClientRect();
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight,
        };

        const spaceBelow = viewport.height - triggerRect.bottom;
        const spaceAbove = triggerRect.top;
        const canFitBelow = spaceBelow >= popoverRect.height;
        const canFitAbove = spaceAbove >= popoverRect.height;

        let top: number;
        let placement: 'top' | 'bottom' = 'bottom';

        if (canFitBelow || (!canFitBelow && !canFitAbove && spaceBelow >= spaceAbove)) {
            top = triggerRect.bottom + window.scrollY;
            placement = 'bottom';
        } else {
            top = triggerRect.top + window.scrollY - popoverRect.height;
            placement = 'top';
        }

        let left = triggerRect.left + window.scrollX;

        if (left + popoverRect.width > viewport.width) {
            left = viewport.width - popoverRect.width - 10;
        }

        if (left < 10) {
            left = 10;
        }

        popoverElement.style.top = `${top}px`;
        popoverElement.style.left = `${left}px`;

        setPosition({ top, left, placement });
    }, []);

    return { position, calculatePosition };
};
