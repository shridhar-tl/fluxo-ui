let lockCount = 0;
let savedOverflow: string | null = null;
let savedPaddingRight: string | null = null;

const getScrollbarWidth = () => {
    if (typeof window === 'undefined') return 0;
    return window.innerWidth - document.documentElement.clientWidth;
};

export const lockBodyScroll = () => {
    if (typeof document === 'undefined') return;
    if (lockCount === 0) {
        savedOverflow = document.body.style.overflow;
        savedPaddingRight = document.body.style.paddingRight;
        const scrollbar = getScrollbarWidth();
        if (scrollbar > 0) {
            document.body.style.paddingRight = `${scrollbar}px`;
        }
        document.body.style.overflow = 'hidden';
    }
    lockCount += 1;
};

export const unlockBodyScroll = () => {
    if (typeof document === 'undefined') return;
    if (lockCount === 0) return;
    lockCount -= 1;
    if (lockCount === 0) {
        document.body.style.overflow = savedOverflow ?? '';
        document.body.style.paddingRight = savedPaddingRight ?? '';
        savedOverflow = null;
        savedPaddingRight = null;
    }
};
