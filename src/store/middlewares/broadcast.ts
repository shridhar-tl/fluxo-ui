import { Store } from '../types';

export interface BroadcastMiddlewareOptions {
    key?: string;
    filter?: (state: any) => any;
}

export const broadcastMiddleware =
    <T>(channelName: string, options: BroadcastMiddlewareOptions = {}) =>
    (store: Store<T>): Store<T> => {
        if (typeof BroadcastChannel === 'undefined') return store;

        const channel = new BroadcastChannel(channelName);
        let isRemoteUpdate = false;
        const instanceId = Math.random().toString(36).slice(2, 10);

        channel.onmessage = (event) => {
            const { senderId, state } = event.data;
            if (senderId === instanceId) return;

            isRemoteUpdate = true;
            store.setState(state, true);
            isRemoteUpdate = false;
        };

        store.on('change', (state) => {
            if (isRemoteUpdate) return;
            const payload = options.filter ? options.filter(state) : state;
            channel.postMessage({ senderId: instanceId, state: payload });
        });

        return store;
    };
