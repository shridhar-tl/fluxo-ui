import cn from 'classnames';
import React, { useRef } from 'react';
import { Button } from '../../../components';
import { combineSlices, createHook, createSlice } from '../../../store';
import { CodeBlock } from '../../CodeBlock';
import { ComponentDemo } from '../../ComponentDemo';
import { useStoryTheme } from '../../StoryThemeContext';

interface AuthState {
    user: string;
    role: 'admin' | 'editor' | 'viewer';
}

interface CartState {
    items: number;
    total: number;
}

const authSlice = createSlice<AuthState>('auth', () => ({ user: 'Alice', role: 'admin' }));
const cartSlice = createSlice<CartState>('cart', () => ({ items: 0, total: 0 }));

const appStore = combineSlices({ auth: authSlice, cart: cartSlice });

const useApp = createHook(appStore);
const useAuth = createHook(authSlice);
const useCart = createHook(cartSlice);

const code = `import { combineSlices, createHook, createSlice } from 'fluxo-ui/store';

const authSlice = createSlice<AuthState>('auth', () => ({ user: 'Alice', role: 'admin' }));
const cartSlice = createSlice<CartState>('cart', () => ({ items: 0, total: 0 }));

const appStore = combineSlices({ auth: authSlice, cart: cartSlice });

// Each slice has a hook of its own — selectors only see the slice's branch
const useAuth = createHook(authSlice);
const useCart = createHook(cartSlice);

// And the combined store has a hook for the whole tree
const useApp = createHook(appStore);

// Direct slice writes are reflected in the combined store and vice versa.
authSlice.setState({ role: 'editor' });           // appStore.getState().auth.role === 'editor'
appStore.setState((s) => ({ cart: { ...s.cart, items: s.cart.items + 1 } }));  // cartSlice subscribers fire
`;

const AuthCard: React.FC = () => {
    const { isDark } = useStoryTheme();
    const renderCount = useRef(0);
    renderCount.current++;
    const auth = useAuth();

    const cycleRole = () => {
        const next: AuthState['role'] = auth.role === 'admin' ? 'editor' : auth.role === 'editor' ? 'viewer' : 'admin';
        authSlice.setState({ role: next });
    };

    return (
        <div className={cn('rounded-lg p-4 border', { 'border-white/10 bg-white/5': isDark, 'border-gray-200 bg-gray-50': !isDark })}>
            <div className="flex items-center justify-between mb-2">
                <div className={cn('text-xs uppercase tracking-wide font-semibold', { 'text-gray-500': isDark, 'text-gray-400': !isDark })}>
                    Auth Slice (useAuth)
                </div>
                <div
                    className={cn('text-xs px-2 py-0.5 rounded font-mono', {
                        'bg-amber-500/20 text-amber-400': isDark,
                        'bg-amber-100 text-amber-700': !isDark,
                    })}
                >
                    renders: {renderCount.current}
                </div>
            </div>
            <div className={cn('text-sm mb-1', { 'text-gray-300': isDark, 'text-gray-700': !isDark })}>
                User: <span className="font-medium text-[var(--eui-primary)]">{auth.user}</span>
            </div>
            <div className={cn('text-sm mb-3', { 'text-gray-300': isDark, 'text-gray-700': !isDark })}>
                Role: <span className="font-medium text-[var(--eui-primary)]">{auth.role}</span>
            </div>
            <Button label="Cycle Role (slice write)" size="xs" onClick={cycleRole} />
        </div>
    );
};

const CartCard: React.FC = () => {
    const { isDark } = useStoryTheme();
    const renderCount = useRef(0);
    renderCount.current++;
    const cart = useCart();

    const addItem = () => {
        cartSlice.setState((s) => ({ items: s.items + 1, total: s.total + 9.99 }));
    };

    return (
        <div className={cn('rounded-lg p-4 border', { 'border-white/10 bg-white/5': isDark, 'border-gray-200 bg-gray-50': !isDark })}>
            <div className="flex items-center justify-between mb-2">
                <div className={cn('text-xs uppercase tracking-wide font-semibold', { 'text-gray-500': isDark, 'text-gray-400': !isDark })}>
                    Cart Slice (useCart)
                </div>
                <div
                    className={cn('text-xs px-2 py-0.5 rounded font-mono', {
                        'bg-amber-500/20 text-amber-400': isDark,
                        'bg-amber-100 text-amber-700': !isDark,
                    })}
                >
                    renders: {renderCount.current}
                </div>
            </div>
            <div className={cn('text-sm mb-1', { 'text-gray-300': isDark, 'text-gray-700': !isDark })}>
                Items: <span className="font-medium text-[var(--eui-primary)]">{cart.items}</span>
            </div>
            <div className={cn('text-sm mb-3', { 'text-gray-300': isDark, 'text-gray-700': !isDark })}>
                Total: <span className="font-medium text-[var(--eui-primary)]">${cart.total.toFixed(2)}</span>
            </div>
            <Button label="Add Item (slice write)" size="xs" onClick={addItem} />
        </div>
    );
};

const CombinedView: React.FC = () => {
    const { isDark } = useStoryTheme();
    const renderCount = useRef(0);
    renderCount.current++;
    const state = useApp();

    const writeViaCombined = () => {
        appStore.setState((s) => ({
            auth: { ...s.auth, user: s.auth.user === 'Alice' ? 'Bob' : 'Alice' },
            cart: { ...s.cart, items: s.cart.items + 5, total: s.cart.total + 49.95 },
        }));
    };

    return (
        <div className={cn('rounded-lg p-4 border', { 'border-white/10 bg-white/5': isDark, 'border-gray-200 bg-gray-50': !isDark })}>
            <div className="flex items-center justify-between mb-2">
                <div className={cn('text-xs uppercase tracking-wide font-semibold', { 'text-gray-500': isDark, 'text-gray-400': !isDark })}>
                    Combined Store (useApp)
                </div>
                <div
                    className={cn('text-xs px-2 py-0.5 rounded font-mono', {
                        'bg-amber-500/20 text-amber-400': isDark,
                        'bg-amber-100 text-amber-700': !isDark,
                    })}
                >
                    renders: {renderCount.current}
                </div>
            </div>
            <pre
                className={cn('text-xs font-mono p-3 rounded mb-3 overflow-auto', {
                    'bg-black/30 text-gray-300': isDark,
                    'bg-gray-100 text-gray-700': !isDark,
                })}
            >
                {JSON.stringify(state, null, 2)}
            </pre>
            <Button label="Write Both Slices (combined write)" size="xs" onClick={writeViaCombined} />
        </div>
    );
};

const BasicSlice: React.FC = () => {
    return (
        <>
            <ComponentDemo
                title="Basic Slices"
                description="Two slices (auth, cart) composed into one combined store. Writes from either side flow to the other automatically."
                centered={false}
            >
                <div className="p-6 flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AuthCard />
                        <CartCard />
                    </div>
                    <CombinedView />
                </div>
            </ComponentDemo>
            <div className="mt-4">
                <CodeBlock code={code} language="tsx" />
            </div>
        </>
    );
};

export default BasicSlice;
