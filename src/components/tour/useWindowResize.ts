import { useEffect, useState } from 'react';

export function useWindowResize() {
    const [size, setSize] = useState<{ width: number; height: number }>({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {
        function onResize() {
            setSize({ width: window.innerWidth, height: window.innerHeight });
        }

        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    return size;
}
