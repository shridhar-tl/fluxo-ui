import { useEffect, useState } from 'react';

const queryString = '(prefers-reduced-motion: reduce)';

const getInitialValue = () => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return false;
    }
    return window.matchMedia(queryString).matches;
};

export const useReducedMotion = (): boolean => {
    const [reduced, setReduced] = useState<boolean>(getInitialValue);

    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            return;
        }
        const mq = window.matchMedia(queryString);
        const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
        setReduced(mq.matches);
        if (typeof mq.addEventListener === 'function') {
            mq.addEventListener('change', handler);
            return () => mq.removeEventListener('change', handler);
        }
        mq.addListener(handler);
        return () => mq.removeListener(handler);
    }, []);

    return reduced;
};
