import cn from 'classnames';
import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

const contractCode = `// A middleware is just a function that takes the store and returns a (usually wrapped) store.
import type { Middleware, Store } from 'fluxo-ui/store';

const myMiddleware: Middleware<MyState> = (store: Store<MyState>) => {
  // Inspect, wrap, or augment the store, then return it.
  return store;
};

const store = create<MyState>(() => initial, [myMiddleware]);
`;

const wrapSetStateCode = `// Pattern 1: Wrap setState — useful for throttling, validating, transforming writes.
const upperCaseNames: Middleware<{ name: string }> = (store) => {
  const original = store.setState;
  store.setState = (next, ...rest) => {
    if (typeof next !== 'function' && next?.name) next.name = next.name.toUpperCase();
    return original(next as any, ...rest as [any, any?]);
  };
  return store;
};
`;

const subscribeCode = `// Pattern 2: Subscribe via store.on() — useful for logging, persistence, broadcasting.
const auditMiddleware: Middleware<any> = (store) => {
  store.on('change', (state, { previous }) => {
    track('state_changed', { previous, state });
  });
  return store;
};
`;

const augmentCode = `// Pattern 3: Augment the returned store with new methods — useful for undo/redo, optimistic, etc.
interface SnapshotStore<T> extends Store<T> {
  snapshot: () => T;
}

const snapshotMiddleware = <T,>(store: Store<T>): SnapshotStore<T> => {
  return {
    ...store,
    snapshot: () => structuredClone(store.getState()),
  };
};
`;

const orderCode = `// Order matters: middlewares wrap left-to-right.
// The leftmost middleware sees user calls first; the rightmost is closest to the underlying store.
const store = create(() => initial, [
  loggerMiddleware(),       // sees the original setState from the user
  throttleMiddleware(100),  // throttles before the change reaches persist
  persistMiddleware({ debounceMs: 200 }),
]);
`;

const AuthoringMiddleware: React.FC = () => {
    const { isDark } = useStoryTheme();

    return (
        <ComponentDemo
            title="Build Your Own Middleware"
            description="The middleware contract is one line. Three patterns cover almost every use case."
            centered={false}
        >
            <div className="p-6 flex flex-col gap-5">
                <div>
                    <h3 className={cn('text-base font-semibold mb-2', { 'text-gray-200': isDark, 'text-gray-800': !isDark })}>
                        The contract
                    </h3>
                    <CodeBlock code={contractCode} language="ts" />
                </div>
                <div>
                    <h3 className={cn('text-base font-semibold mb-2', { 'text-gray-200': isDark, 'text-gray-800': !isDark })}>
                        Pattern 1 — wrap setState
                    </h3>
                    <CodeBlock code={wrapSetStateCode} language="ts" />
                </div>
                <div>
                    <h3 className={cn('text-base font-semibold mb-2', { 'text-gray-200': isDark, 'text-gray-800': !isDark })}>
                        Pattern 2 — subscribe via store.on()
                    </h3>
                    <CodeBlock code={subscribeCode} language="ts" />
                </div>
                <div>
                    <h3 className={cn('text-base font-semibold mb-2', { 'text-gray-200': isDark, 'text-gray-800': !isDark })}>
                        Pattern 3 — augment the store
                    </h3>
                    <CodeBlock code={augmentCode} language="ts" />
                </div>
                <div>
                    <h3 className={cn('text-base font-semibold mb-2', { 'text-gray-200': isDark, 'text-gray-800': !isDark })}>
                        Composition order
                    </h3>
                    <CodeBlock code={orderCode} language="ts" />
                </div>
            </div>
        </ComponentDemo>
    );
};

export default AuthoringMiddleware;
