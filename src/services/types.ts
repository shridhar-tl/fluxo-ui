export type ServiceLifetime = 'singleton' | 'scoped' | 'transient';

export interface ServiceConstructor<T = unknown> {
    new (...args: unknown[]): T;
    dependencies?: string[];
}

export interface ServiceOptions {
    retain?: boolean;
}

export type ServiceFactory<T = unknown> = (resolver: ServiceResolver) => T;

export interface ServiceDescriptor<T = unknown> {
    name: string;
    shortName: string;
    type?: ServiceConstructor<T>;
    factory?: ServiceFactory<T>;
    lifetime: ServiceLifetime;
    retain: boolean;
    dependencies?: string[];
    instance: T | null;
}

export interface ParameterizedServiceDescriptor<T = unknown, TArgs extends unknown[] = unknown[]> {
    name: string;
    shortName: string;
    factory: (resolver: ServiceResolver, ...args: TArgs) => T;
    lifetime: ServiceLifetime;
    retain: boolean;
    dependencies?: string[];
    instances: Map<string, T>;
}

export interface ServiceResolver {
    resolve<T = unknown>(name: string): T;
}

export interface ScopeHandle {
    resolve<T = unknown>(name: string): T;
    resolveWithArgs<T = unknown>(name: string, ...args: unknown[]): T;
    dispose(): void;
}
