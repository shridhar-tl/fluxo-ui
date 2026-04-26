import { useEffect, useState } from 'react';

const MOBILE_MAX = 767;
const TABLET_MAX = 1023;

const getViewport = () => {
    if (typeof window === 'undefined') {
        return { isMobile: false, isTablet: false, isCompact: false };
    }
    const width = window.innerWidth;
    const isMobile = width <= MOBILE_MAX;
    const isTablet = width > MOBILE_MAX && width <= TABLET_MAX;
    return { isMobile, isTablet, isCompact: isMobile || isTablet };
};

export const useViewport = () => {
    const [viewport, setViewport] = useState(getViewport);

    useEffect(() => {
        const onResize = () => setViewport(getViewport());
        onResize();
        window.addEventListener('resize', onResize);
        window.addEventListener('orientationchange', onResize);
        return () => {
            window.removeEventListener('resize', onResize);
            window.removeEventListener('orientationchange', onResize);
        };
    }, []);

    return viewport;
};

export const useMobile = () => {
    const { isMobile } = useViewport();
    return isMobile;
};
