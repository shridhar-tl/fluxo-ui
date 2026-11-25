const focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(',');

const isFollowing = (reference: Node, candidate: Node) => Boolean(reference.compareDocumentPosition(candidate) & Node.DOCUMENT_POSITION_FOLLOWING);

export const findFocusNeighbor = (element: HTMLElement, scopeSelector?: string): HTMLElement | null => {
    const scope = (scopeSelector ? element.parentElement?.closest<HTMLElement>(scopeSelector) : null) ?? element.parentElement;
    if (!scope) return null;
    const candidates = Array.from(scope.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (candidate) => !element.contains(candidate) && candidate.getAttribute('aria-hidden') !== 'true',
    );
    const next = candidates.find((candidate) => isFollowing(element, candidate));
    if (next) return next;
    const previous = candidates.filter((candidate) => !isFollowing(element, candidate));
    return previous.length ? previous[previous.length - 1] : null;
};

export const preserveFocusOnRemoval = (element: HTMLElement | null, scopeSelector?: string) => {
    if (!element || typeof window === 'undefined') return;
    const active = document.activeElement;
    if (!active || !element.contains(active)) return;
    const neighbor = findFocusNeighbor(element, scopeSelector);
    window.requestAnimationFrame(() => {
        if (element.isConnected && element.contains(document.activeElement)) return;
        if (document.activeElement && document.activeElement !== document.body) return;
        if (neighbor?.isConnected) neighbor.focus();
    });
};
