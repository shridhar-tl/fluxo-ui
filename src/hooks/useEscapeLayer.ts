import { useEffect, useRef } from 'react';
import { pushLayer } from '../utils/layer-stack';

export const useEscapeLayer = (active: boolean, onEscape?: () => void) => {
    const $ref = useRef<(() => void) | undefined>(onEscape);
    $ref.current = onEscape;

    useEffect(() => {
        if (!active) return;
        return pushLayer($ref);
    }, [active]);
};
