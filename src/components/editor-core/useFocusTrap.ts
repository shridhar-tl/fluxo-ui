import { useEffect } from 'react';

const FOCUSABLE_SELECTOR =
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useFocusTrap(active: boolean, containerRef: React.RefObject<HTMLElement | null>): void {
    useEffect(() => {
        if (!active) return;
        const previouslyFocused = document.activeElement as HTMLElement | null;

        const handleKey = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;
            const container = containerRef.current;
            if (!container) return;
            const focusables = Array.from(
                container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
            ).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null);
            if (focusables.length === 0) return;
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            const activeEl = document.activeElement as HTMLElement | null;
            if (e.shiftKey && activeEl === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && activeEl === last) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('keydown', handleKey);
            if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
                try {
                    previouslyFocused.focus();
                } catch {
                    /* noop */
                }
            }
        };
    }, [active, containerRef]);
}
