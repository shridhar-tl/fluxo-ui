import {
    type ComponentType,
    type Context,
    createContext,
    type ReactNode,
    useContext,
    useEffect,
    useMemo,
    useRef,
} from 'react';
import type { ServiceContainer } from './container';
import type { ScopeHandle } from './types';

interface ServiceContextValue {
    container: ServiceContainer;
    defaultParams: Record<string, unknown[]>;
}

const ServiceContext: Context<ServiceContextValue | null> = createContext<ServiceContextValue | null>(null);
const ScopeContext: Context<ScopeHandle | null> = createContext<ScopeHandle | null>(null);

interface ServiceProviderProps {
    container: ServiceContainer;
    children: ReactNode;
    defaultParams?: Record<string, unknown[]>;
}

export function ServiceProvider({ container, children, defaultParams }: ServiceProviderProps) {
    const value = useMemo<ServiceContextValue>(
        () => ({ container, defaultParams: defaultParams || {} }),
        [container, defaultParams]
    );

    return (
        <ServiceContext.Provider value={value}>
            {children}
        </ServiceContext.Provider>
    );
}

interface ServiceScopeProps {
    children: ReactNode;
}

export function ServiceScope({ children }: ServiceScopeProps) {
    const ctx = useContext(ServiceContext);
    if (!ctx) {
        throw new Error('ServiceScope must be used within a ServiceProvider');
    }

    const scopeRef = useRef<ScopeHandle | null>(null);
    if (!scopeRef.current) {
        scopeRef.current = ctx.container.createScope();
    }

    useEffect(() => {
        return () => {
            scopeRef.current?.dispose();
            scopeRef.current = null;
        };
    }, []);

    return (
        <ScopeContext.Provider value={scopeRef.current}>
            {children}
        </ScopeContext.Provider>
    );
}

function useContainerCtx(): ServiceContextValue {
    const ctx = useContext(ServiceContext);
    if (!ctx) {
        throw new Error('useService must be used within a ServiceProvider');
    }
    return ctx;
}

export function useService<T extends Record<string, unknown>>(...serviceNames: string[]): T {
    const { container } = useContainerCtx();
    const scope = useContext(ScopeContext);

    return useMemo(() => {
        if (scope) {
            const result = {} as Record<string, unknown>;
            serviceNames.forEach((name) => {
                result[name] = scope.resolve(name);
            });
            return result as T;
        }
        return container.resolve<T>(...serviceNames);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [container, scope, ...serviceNames]);
}

export function useServiceWithArgs<T = unknown>(serviceName: string, ...args: unknown[]): T {
    const { container, defaultParams } = useContainerCtx();
    const scope = useContext(ScopeContext);

    const effectiveArgs = args.length > 0 ? args : (defaultParams[serviceName] || []);

    return useMemo(() => {
        if (scope) {
            return scope.resolveWithArgs<T>(serviceName, ...effectiveArgs);
        }
        return container.resolveWithArgs<T>(serviceName, ...effectiveArgs);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [container, serviceName, scope, ...effectiveArgs]);
}

export function useScope(): ScopeHandle {
    const scope = useContext(ScopeContext);
    if (!scope) {
        throw new Error('useScope must be used within a ServiceScope');
    }
    return scope;
}

export function useContainer(): ServiceContainer {
    return useContainerCtx().container;
}

interface WithServicesConfig {
    services?: string[];
    parameterized?: Record<string, unknown[]>;
}

export function withServices<P extends Record<string, unknown>>(
    Component: ComponentType<P>,
    config: WithServicesConfig
): ComponentType<Omit<P, string>> {
    const displayName = Component.displayName || Component.name || 'Component';

    function WrappedComponent(props: Omit<P, string>) {
        const { container } = useContainerCtx();

        const resolved = config.services ? container.resolve(...config.services) : {};

        const paramResolved: Record<string, unknown> = {};
        if (config.parameterized) {
            Object.entries(config.parameterized).forEach(([name, args]) => {
                paramResolved[name] = container.resolveWithArgs(name, ...args);
            });
        }

        const merged = { ...resolved, ...paramResolved, ...props };
        return <Component {...(merged as P)} />;
    }

    WrappedComponent.displayName = `withServices(${displayName})`;
    return WrappedComponent;
}
