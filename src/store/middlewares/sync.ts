import { Store } from '../types';

export interface SyncTransport {
    send(message: any): void;
    onReceive(handler: (message: any) => void): () => void;
    close?(): void;
}

export type ConflictResolver<T> = (local: T, remote: Partial<T>) => Partial<T>;

export interface SyncOptions<T> {
    transport: SyncTransport | (() => SyncTransport);
    filter?: (state: T) => any;
    resolve?: 'remote-wins' | 'local-wins' | 'merge' | ConflictResolver<T>;
    instanceId?: string;
    accept?: (message: any) => boolean;
}

const generateId = () => Math.random().toString(36).slice(2, 10);

const mergeShallow = <T>(local: T, remote: Partial<T>): Partial<T> => ({ ...(local as any), ...(remote as any) });

export function syncMiddleware<T>(options: SyncOptions<T>) {
    return (store: Store<T>): Store<T> => {
        const transport = typeof options.transport === 'function' ? options.transport() : options.transport;
        const instanceId = options.instanceId ?? generateId();
        const resolve = options.resolve ?? 'remote-wins';
        let isRemoteUpdate = false;

        const unsub = transport.onReceive((message) => {
            if (!message || typeof message !== 'object') return;
            if (message.senderId === instanceId) return;
            if (options.accept && !options.accept(message)) return;

            const remoteState = message.state as Partial<T>;
            if (remoteState == null) return;

            isRemoteUpdate = true;
            try {
                if (resolve === 'remote-wins') {
                    store.setState(remoteState as any, true);
                } else if (resolve === 'local-wins') {
                    // intentionally drop the remote update
                } else if (resolve === 'merge') {
                    store.setState((local) => mergeShallow(local, remoteState));
                } else {
                    store.setState((local) => resolve(local, remoteState));
                }
            } finally {
                isRemoteUpdate = false;
            }
        });

        store.on('change', (state) => {
            if (isRemoteUpdate) return;
            const payload = options.filter ? options.filter(state) : state;
            transport.send({ senderId: instanceId, state: payload });
        });

        const originalReset = store.reset;
        store.reset = () => {
            originalReset();
            if (transport.close) {
                unsub();
            }
        };

        return store;
    };
}

export function broadcastChannelTransport(channelName: string): SyncTransport {
    if (typeof BroadcastChannel === 'undefined') {
        return {
            send: () => {},
            onReceive: () => () => {},
        };
    }
    const channel = new BroadcastChannel(channelName);
    return {
        send: (msg) => channel.postMessage(msg),
        onReceive: (handler) => {
            const wrapped = (event: MessageEvent) => handler(event.data);
            channel.addEventListener('message', wrapped);
            return () => channel.removeEventListener('message', wrapped);
        },
        close: () => channel.close(),
    };
}

export function storageEventTransport(storageKey: string, storage: Storage = localStorage): SyncTransport {
    return {
        send: (msg) => {
            try {
                storage.setItem(storageKey, JSON.stringify({ ...msg, ts: Date.now() }));
            } catch (err) {
                console.error('storageEventTransport send failed:', err);
            }
        },
        onReceive: (handler) => {
            const listener = (event: StorageEvent) => {
                if (event.storageArea !== storage) return;
                if (event.key !== storageKey || event.newValue == null) return;
                try {
                    handler(JSON.parse(event.newValue));
                } catch (err) {
                    console.error('storageEventTransport parse failed:', err);
                }
            };
            window.addEventListener('storage', listener);
            return () => window.removeEventListener('storage', listener);
        },
    };
}

export function webSocketTransport(url: string, protocols?: string | string[]): SyncTransport {
    const handlers = new Set<(message: any) => void>();
    const ws = new WebSocket(url, protocols);
    const queue: string[] = [];
    let isOpen = false;

    ws.addEventListener('open', () => {
        isOpen = true;
        for (const msg of queue) ws.send(msg);
        queue.length = 0;
    });
    ws.addEventListener('message', (event) => {
        try {
            const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
            for (const h of handlers) h(data);
        } catch (err) {
            console.error('webSocketTransport parse failed:', err);
        }
    });

    return {
        send: (msg) => {
            const serialized = JSON.stringify(msg);
            if (isOpen) ws.send(serialized);
            else queue.push(serialized);
        },
        onReceive: (handler) => {
            handlers.add(handler);
            return () => {
                handlers.delete(handler);
            };
        },
        close: () => ws.close(),
    };
}
