import { useSyncExternalStore } from 'react';
import { subscribeGlobal, subscribeNode } from '../core/registry';

export function useGlobalDndStore<T>(selector: () => T): T {
    return useSyncExternalStore(subscribeGlobal, selector, selector);
}

export function useNodeDndStore<T>(nodeId: string, selector: () => T): T {
    const subscribe = (listener: () => void) => subscribeNode(nodeId, listener);
    return useSyncExternalStore(subscribe, selector, selector);
}
