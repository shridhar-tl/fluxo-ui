import cn from 'classnames';
import React from 'react';
import { Button } from '../../../components';
import { create, createHook } from '../../../store';
import { broadcastChannelTransport, syncMiddleware } from '../../../store/middlewares';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

interface SyncState {
    count: number;
    lastUpdatedBy: string;
}

const tabId = Math.random().toString(36).slice(2, 6).toUpperCase();

const syncStore = create<SyncState>(() => ({ count: 0, lastUpdatedBy: 'none' }), [
    syncMiddleware<SyncState>({
        transport: broadcastChannelTransport('fluxo-ui-demo-sync'),
        resolve: 'merge',
    }),
]);
const useSync = createHook(syncStore);

const code = `import { create } from 'fluxo-ui/store';
import {
  syncMiddleware,
  broadcastChannelTransport,
  webSocketTransport,
  storageEventTransport,
} from 'fluxo-ui/store/middlewares';

const store = create<SyncState>(() => ({ count: 0 }), [
  syncMiddleware<SyncState>({
    transport: broadcastChannelTransport('my-app'),       // or webSocketTransport('wss://...')
    resolve: 'merge',                                      // 'remote-wins' | 'local-wins' | 'merge' | (local, remote) => Partial<T>
  }),
]);

// Implement your own SyncTransport to use any other channel:
// { send(msg), onReceive(handler): unsubscribe, close?() }
`;

const SyncDemo: React.FC = () => {
    const { isDark } = useStoryTheme();
    const state = useSync();

    return (
        <>
            <ComponentDemo
                title="Sync Middleware (Pluggable Transport)"
                description="syncMiddleware abstracts the transport. Below uses BroadcastChannel; the same store can swap to WebSocket or a custom transport without changing call sites. Open the page in two tabs to see updates flow through."
            >
                <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto">
                    <div
                        className={cn('text-xs font-mono px-2 py-1 rounded', {
                            'bg-white/10 text-gray-400': isDark,
                            'bg-gray-100 text-gray-500': !isDark,
                        })}
                    >
                        Tab ID: {tabId}
                    </div>
                    <div className="text-4xl font-bold tabular-nums text-[var(--eui-primary)]">{state.count}</div>
                    {state.lastUpdatedBy !== 'none' && (
                        <div className={cn('text-xs', { 'text-gray-400': isDark, 'text-gray-500': !isDark })}>
                            Last updated by: {state.lastUpdatedBy === tabId ? 'this tab' : `tab ${state.lastUpdatedBy}`}
                        </div>
                    )}
                    <div className="flex gap-2">
                        <Button
                            label="+1"
                            size="sm"
                            onClick={() => syncStore.setState((s) => ({ count: s.count + 1, lastUpdatedBy: tabId }))}
                        />
                        <Button
                            label="+5"
                            size="sm"
                            onClick={() => syncStore.setState((s) => ({ count: s.count + 5, lastUpdatedBy: tabId }))}
                        />
                        <Button
                            label="Reset"
                            size="sm"
                            variant="secondary"
                            onClick={() => syncStore.setState({ count: 0, lastUpdatedBy: tabId })}
                        />
                    </div>
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default SyncDemo;
