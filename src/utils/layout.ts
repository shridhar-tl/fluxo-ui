export function ensurePartiallyVisible(element: HTMLElement): void {
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    const elementHeight = rect.height;
    const minVisibleHeight = Math.min(200, elementHeight);

    // Calculate visible height of element inside viewport
    const visibleTop = Math.max(rect.top, 0);
    const visibleBottom = Math.min(rect.bottom, viewportHeight);
    const visibleHeight = visibleBottom - visibleTop;

    // If visible height is already at least the minVisibleHeight, do nothing
    if (visibleHeight >= minVisibleHeight) {
        return;
    }

    // Current scroll position of the page (top of viewport relative to document)
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    // Determine new scroll target to make at least minVisibleHeight visible

    // Case 1: Element is below the viewport (top is below viewport bottom)
    if (rect.top > viewportHeight) {
        // Scroll down so that minVisibleHeight of the element is visible.
        // We'll scroll so that the element is visible starting "minVisibleHeight" px from top viewport
        const scrollTo = scrollY + rect.top - minVisibleHeight + 20; // 20px padding
        window.scrollTo({ top: scrollTo, behavior: typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
    // Case 2: Element is above the viewport (bottom is above viewport top)
    else if (rect.bottom < 0) {
        // Scroll up so that minVisibleHeight of the element is visible.
        // We'll scroll so that element's bottom is minVisibleHeight px from the top of viewport.
        const scrollTo = scrollY + rect.bottom - 20;
        window.scrollTo({ top: scrollTo, behavior: typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
    // Case 3: Element is partially visible but visibleHeight < minVisibleHeight
    else {
        // If partially visible but less than minVisibleHeight, scroll just enough to show minVisibleHeight

        if (rect.top < 0) {
            // Too little visible at top because element extends above viewport
            // Scroll down by the missing height
            const scrollDelta = minVisibleHeight - visibleHeight;
            window.scrollBy({ top: -scrollDelta, behavior: typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        } else if (rect.bottom > viewportHeight) {
            // Too little visible at bottom because element extends below viewport
            // Scroll down by the missing height
            const scrollDelta = minVisibleHeight - visibleHeight;
            window.scrollBy({ top: scrollDelta, behavior: typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        }
    }
}
