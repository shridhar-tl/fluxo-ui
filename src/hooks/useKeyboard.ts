import { useEffect, useRef } from 'react';

export const useKeyboard = (handlers: Record<string, () => void>, enabled: boolean = true) => {
    const $ref = useRef(handlers);
    $ref.current = handlers;

    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            const handler = $ref.current[event.key];
            if (handler) {
                event.preventDefault();
                handler();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [enabled]);
};
