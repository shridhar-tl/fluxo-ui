import { RefObject, useCallback, useEffect, useLayoutEffect } from 'react';

interface AutoResizeOptions {
    enabled?: boolean;
    maxHeight?: number;
}

export const useAutoResize = (
    ref: RefObject<HTMLTextAreaElement | null>,
    value: string,
    { enabled = true, maxHeight }: AutoResizeOptions = {},
): void => {
    const adjust = useCallback(() => {
        const textarea = ref.current;
        if (!enabled || !textarea) return;
        textarea.style.height = 'auto';
        const contentHeight = textarea.scrollHeight;
        const overflows = maxHeight !== undefined && contentHeight > maxHeight;
        textarea.style.height = `${overflows ? maxHeight : contentHeight}px`;
        textarea.style.overflowY = overflows ? 'auto' : 'hidden';
    }, [ref, enabled, maxHeight]);

    useLayoutEffect(() => {
        adjust();
    }, [adjust, value]);

    useEffect(() => {
        const textarea = ref.current;
        if (!enabled || !textarea || typeof ResizeObserver === 'undefined') return;
        let width = textarea.clientWidth;
        const observer = new ResizeObserver(() => {
            if (textarea.clientWidth === width) return;
            width = textarea.clientWidth;
            adjust();
        });
        observer.observe(textarea);
        return () => observer.disconnect();
    }, [ref, enabled, adjust]);
};
