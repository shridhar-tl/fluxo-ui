import { useEffect } from 'react';

export const useClickOutside = (ref: React.RefObject<HTMLElement | null>, callback: (e: MouseEvent) => void, enabled: boolean = true) => {
    useEffect(() => {
        if (!enabled || !ref) return;

        const handleClick = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                callback(event);
            }
        };

        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [ref, callback, enabled]);
};
