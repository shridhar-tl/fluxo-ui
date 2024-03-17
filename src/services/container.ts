import type {
    ParameterizedServiceDescriptor,
    ScopeHandle,
    ServiceConstructor,
    ServiceDescriptor,
    ServiceFactory,
    ServiceLifetime,
    ServiceOptions,
    ServiceResolver,
} from './types';

const buildArgsKey = (args: unknown[]): string => {
    if (args.length === 0) return '';
    return args
        .map((a) => {
            if (a === null) return 'null';
            if (a === undefined) return 'undefined';
            if (typeof a === 'object') return JSON.stringify(a);
            return String(a);
        })
        .join('::');
};

const disposeInstance = (instance: unknown): void => {
    if (instance && typeof instance === 'object' && 'dispose' in instance) {
        (instance as { dispose: () => void }).dispose();
    }
};

export class ServiceContainer {
    private services: Record<string, ServiceDescriptor> = {};
    private paramServices: Record<string, ParameterizedServiceDescriptor> = {};

    private resolver: ServiceResolver = {
        resolve: <T = unknown>(name: string): T => this.resolveInternal(name) as T,
    };

    registerSingleton<T>(
        type: ServiceConstructor<T>,
        serviceName: string,
        shortName: string,
        opts?: ServiceOptions
    ): this {
        return this.register(type, serviceName, shortName, 'singleton', opts);
    }

    registerScoped<T>(
        type: ServiceConstructor<T>,
        serviceName: string,
        shortName: string,
        opts?: ServiceOptions
    ): this {
        return this.register(type, serviceName, shortName, 'scoped', opts);
    }

    registerTransient<T>(
        type: ServiceConstructor<T>,
        serviceName: string,
        shortName: string,
        opts?: ServiceOptions
    ): this {
        return this.register(type, serviceName, shortName, 'transient', opts);
    }

    registerSingletonFactory<T>(
        serviceName: string,
        shortName: string,
        factory: ServiceFactory<T>,
        deps?: string[],
        opts?: ServiceOptions
    ): this {
        return this.registerFactory(serviceName, shortName, 'singleton', factory, deps, opts);
    }

    registerScopedFactory<T>(
        serviceName: string,
        shortName: string,
        factory: ServiceFactory<T>,
        deps?: string[],
        opts?: ServiceOptions
    ): this {
        return this.registerFactory(serviceName, shortName, 'scoped', factory, deps, opts);
    }

    registerTransientFactory<T>(
        serviceName: string,
        shortName: string,
        factory: ServiceFactory<T>,
        deps?: string[],
        opts?: ServiceOptions
    ): this {
        return this.registerFactory(serviceName, shortName, 'transient', factory, deps, opts);
    }

    registerParameterized<T, TArgs extends unknown[]>(
        serviceName: string,
        shortName: string,
        lifetime: ServiceLifetime,
        factory: (resolver: ServiceResolver, ...args: TArgs) => T,
        opts?: ServiceOptions
    ): this {
        const merged = { retain: false, ...opts };

        this.paramServices[serviceName] = {
            name: serviceName,
            shortName,
            factory: factory as (resolver: ServiceResolver, ...args: unknown[]) => unknown,
            lifetime,
            retain: merged.retain,
            instances: new Map(),
        };

        return this;
    }

    resolve<T extends Record<string, unknown>>(...serviceNames: string[]): T {
        const target = {} as Record<string, unknown>;
        this.inject(target, serviceNames);
        return target as T;
    }

    resolveScoped<T extends Record<string, unknown>>(...serviceNames: string[]): T {
        const target = {} as Record<string, unknown>;
        this.inject(target, serviceNames, {});
        return target as T;
    }

    resolveWithArgs<T = unknown>(serviceName: string, ...args: unknown[]): T {
        return this.resolveParamInternal<T>(serviceName, args);
    }

    createScope(): ScopeHandle {
        const scopeStore: Record<string, unknown> = {};

        return {
            resolve: <T = unknown>(name: string): T => {
                return this.resolveInternal(name, [], scopeStore) as T;
            },
            resolveWithArgs: <T = unknown>(name: string, ...args: unknown[]): T => {
                return this.resolveParamInternal<T>(name, args, scopeStore);
            },
            dispose: () => {
                Object.values(scopeStore).forEach(disposeInstance);
                Object.keys(scopeStore).forEach((k) => delete scopeStore[k]);
            },
        };
    }

    has(name: string): boolean {
        return name in this.services || name in this.paramServices;
    }

    clearInstances(): void {
        Object.values(this.services).forEach((svc) => {
            if (svc.instance && !svc.retain) {
                disposeInstance(svc.instance);
                svc.instance = null;
            }
        });
        Object.values(this.paramServices).forEach((svc) => {
            if (!svc.retain) {
                svc.instances.forEach(disposeInstance);
                svc.instances.clear();
            }
        });
    }

    clearService(name: string): void {
        const svc = this.services[name];
        if (svc?.instance) {
            disposeInstance(svc.instance);
            svc.instance = null;
        }
        const paramSvc = this.paramServices[name];
        if (paramSvc) {
            paramSvc.instances.forEach(disposeInstance);
            paramSvc.instances.clear();
        }
    }

    private register<T>(
        type: ServiceConstructor<T>,
        serviceName: string,
        shortName: string,
        lifetime: ServiceLifetime,
        opts?: ServiceOptions
    ): this {
        const merged = { retain: false, ...opts };
        const dependency = type.dependencies;

        if (dependency && dependency.length > 0) {
            this.validateNoCycles(serviceName, dependency);
        }

        const hadInstance = this.services[serviceName]?.instance;

        this.services[serviceName] = {
            name: serviceName,
            shortName,
            type,
            lifetime,
            retain: merged.retain,
            dependencies: dependency && dependency.length > 0 ? dependency : undefined,
            instance: null,
        };

        if (hadInstance) {
            this.clearNonRetainedInstances();
        }

        return this;
    }

    private registerFactory<T>(
        serviceName: string,
        shortName: string,
        lifetime: ServiceLifetime,
        factory: ServiceFactory<T>,
        deps?: string[],
        opts?: ServiceOptions
    ): this {
        const merged = { retain: false, ...opts };

        if (deps && deps.length > 0) {
            this.validateNoCycles(serviceName, deps);
        }

        const hadInstance = this.services[serviceName]?.instance;

        this.services[serviceName] = {
            name: serviceName,
            shortName,
            factory: factory as ServiceFactory,
            lifetime,
            retain: merged.retain,
            dependencies: deps && deps.length > 0 ? deps : undefined,
            instance: null,
        };

        if (hadInstance) {
            this.clearNonRetainedInstances();
        }

        return this;
    }

    private clearNonRetainedInstances(): void {
        Object.values(this.services).forEach((svc) => {
            if (svc.instance && !svc.retain) {
                svc.instance = null;
            }
        });
    }

    private getRef(name: string): ServiceDescriptor {
        if (!name || typeof name !== 'string') {
            throw new Error('Service name must be a non-empty string');
        }

        name = name.trim();
        let svcObj = this.services[name];

        if (!svcObj && !name.endsWith('Service')) {
            svcObj = this.services[`${name}Service`];
        }

        if (!svcObj) {
            throw new Error(`'${name}' is not a registered service`);
        }
        return svcObj;
    }

    private resolveInternal(name: string, path: string[] = [], scope?: Record<string, unknown>): unknown {
        const svcObj = this.getRef(name);

        if (svcObj.lifetime === 'singleton' && svcObj.instance) {
            return svcObj.instance;
        }

        if (scope && scope[name]) {
            return scope[name];
        }

        if (path.includes(name)) {
            throw new Error(`Circular dependency detected: ${[...path, name].join(' -> ')}`);
        }

        const childPath = [...path, name];
        let instance: unknown;

        if (svcObj.factory) {
            instance = svcObj.factory(this.resolver);
        } else if (svcObj.type) {
            if (svcObj.dependencies && svcObj.dependencies.length > 0) {
                const deps = svcObj.dependencies.map((depName) => {
                    if (svcObj.lifetime === 'singleton') {
                        const depRef = this.getRef(depName);
                        if (depRef.lifetime !== 'singleton') {
                            throw new Error(
                                `Singleton service '${name}' cannot depend on ${depRef.lifetime} service '${depName}'`
                            );
                        }
                    }
                    return this.resolveInternal(depName, childPath, scope);
                });
                instance = new svcObj.type(...deps);
            } else {
                instance = new svcObj.type();
            }
        } else {
            throw new Error(`Service '${name}' has no type or factory`);
        }

        if (svcObj.lifetime === 'singleton') {
            svcObj.instance = instance;
        } else if (svcObj.lifetime === 'scoped' && scope) {
            scope[name] = instance;
        }

        return instance;
    }

    private resolveParamInternal<T = unknown>(
        name: string,
        args: unknown[],
        scope?: Record<string, unknown>
    ): T {
        const paramSvc = this.paramServices[name];
        if (!paramSvc) {
            throw new Error(`'${name}' is not a registered parameterized service`);
        }

        const argsKey = buildArgsKey(args);

        if (paramSvc.lifetime === 'singleton') {
            const cached = paramSvc.instances.get(argsKey);
            if (cached !== undefined) return cached as T;
        }

        if (paramSvc.lifetime === 'scoped' && scope) {
            const scopeKey = `${name}::${argsKey}`;
            if (scope[scopeKey] !== undefined) return scope[scopeKey] as T;
        }

        const instance = paramSvc.factory(this.resolver, ...args);

        if (paramSvc.lifetime === 'singleton') {
            paramSvc.instances.set(argsKey, instance);
        } else if (paramSvc.lifetime === 'scoped' && scope) {
            scope[`${name}::${argsKey}`] = instance;
        }

        return instance as T;
    }

    private inject(
        target: Record<string, unknown>,
        serviceNames: string[],
        scope?: Record<string, unknown>
    ): void {
        const uniqueSet = new Set(serviceNames);
        if (serviceNames.length !== uniqueSet.size) {
            throw new Error(`Duplicate dependency names: ${JSON.stringify(serviceNames)}`);
        }

        serviceNames.forEach((name) => {
            const svcObj = this.getRef(name);
            target[svcObj.shortName] = this.resolveInternal(name, [], scope);
        });
    }

    private validateNoCycles(newName: string, deps: string[]): void {
        const visited = new Set<string>();

        const walk = (depList: string[], path: string[]) => {
            for (const dep of depList) {
                if (dep === newName) {
                    throw new Error(`Circular dependency detected: ${[...path, dep].join(' -> ')}`);
                }
                if (visited.has(dep)) continue;
                visited.add(dep);

                const depDescriptor = this.services[dep];
                if (depDescriptor?.dependencies) {
                    walk(depDescriptor.dependencies, [...path, dep]);
                }
            }
        };

        walk(deps, [newName]);
    }
}

export function createContainer(): ServiceContainer {
    return new ServiceContainer();
}
