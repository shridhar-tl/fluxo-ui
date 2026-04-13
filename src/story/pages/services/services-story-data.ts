import type { SectionNavItem } from '../../SectionNav';
import type { FeatureItem } from '../../FeatureCard';

export const sectionNavItems: SectionNavItem[] = [
    { id: 'basic', title: 'Basic Usage', description: 'Classes, interfaces, factories' },
    { id: 'lifetimes', title: 'Lifetimes', description: 'Singleton, scoped, transient' },
    { id: 'parameterized', title: 'Parameterized', description: 'Factory with arguments' },
    { id: 'swapping', title: 'Swapping Implementations', description: 'Replace classes at runtime' },
    { id: 'react-integration', title: 'React Integration', description: 'Hooks, HOC, scopes' },
    { id: 'import', title: 'Import', description: 'Import statement' },
    { id: 'container-api', title: 'Container API', description: 'Core methods' },
    { id: 'react-api', title: 'React API', description: 'React hooks and components' },
    { id: 'features', title: 'Features', description: 'Feature summary' },
];

export const features: FeatureItem[] = [
    {
        title: 'Class & Factory Registration',
        description: 'Register service classes with static dependency arrays, or plain factory functions returning objects. Both support interface typing.',
    },
    {
        title: '3 Lifetimes',
        description: 'Singleton (one instance), scoped (per-scope), and transient (always new) lifetime management.',
    },
    {
        title: 'Parameterized Factories',
        description: 'Register factories that accept arguments at resolution time for dynamic, user-scoped service creation.',
    },
    {
        title: 'Implementation Swapping',
        description: 'Register different classes or factories under the same service name to swap implementations by environment or config.',
    },
    {
        title: 'Circular Dependency Detection',
        description: 'Detects circular dependencies at registration time and throws descriptive errors with the full dependency chain.',
    },
    {
        title: 'React Integration',
        description: 'ServiceProvider with default params, ServiceScope for isolation, useService hook, useContainer, and withServices HOC.',
    },
];

export const containerApiProps = {
    registerSingleton: {
        type: '(Class, name, shortName, opts?) => this',
        description: 'Register a class as singleton. The class can have a static dependencies array. Constructor args are auto-resolved. Chainable.',
    },
    registerScoped: {
        type: '(Class, name, shortName, opts?) => this',
        description: 'Register a class as scoped — one instance per scope. Chainable.',
    },
    registerTransient: {
        type: '(Class, name, shortName, opts?) => this',
        description: 'Register a class as transient — new instance every resolve. Chainable.',
    },
    registerSingletonFactory: {
        type: '(name, shortName, factory, deps?, opts?) => this',
        description: 'Register a factory function as singleton. Factory receives (resolver) and returns an object. Chainable.',
    },
    registerScopedFactory: {
        type: '(name, shortName, factory, deps?, opts?) => this',
        description: 'Register a factory function as scoped. Chainable.',
    },
    registerTransientFactory: {
        type: '(name, shortName, factory, deps?, opts?) => this',
        description: 'Register a factory function as transient. Chainable.',
    },
    registerParameterized: {
        type: '(name, shortName, lifetime, factory, opts?) => this',
        description: 'Register a parameterized factory. The factory receives (resolver, ...args) and is called with args at resolution time. Chainable.',
    },
    resolve: {
        type: '(...serviceNames) => { $shortName: instance }',
        description: 'Resolve one or more services by name. Returns an object keyed by short names (e.g. $dashboard, $session).',
    },
    resolveScoped: {
        type: '(...serviceNames) => { $shortName: instance }',
        description: 'Same as resolve but creates a fresh scope — scoped services get new instances.',
    },
    resolveWithArgs: {
        type: '(serviceName, ...args) => instance',
        description: 'Resolve a parameterized service by passing arguments to its factory.',
    },
    createScope: {
        type: '() => ScopeHandle',
        description: 'Create an isolated scope. Scoped services are cached per scope. Call dispose() to clean up.',
    },
    clearInstances: {
        type: '() => void',
        description: 'Clear all cached singleton instances (except retained ones). Calls dispose() on disposable instances.',
    },
    clearService: {
        type: '(name) => void',
        description: 'Clear the cached instance for a specific service only.',
    },
    has: {
        type: '(name) => boolean',
        description: 'Check whether a service is registered under the given name.',
    },
};

export const reactApiProps = {
    ServiceProvider: {
        type: 'React.FC<{ container, defaultParams?, children }>',
        description: 'Provides the container and default parameters for parameterized services. If useServiceWithArgs is called without args, these defaults are used.',
    },
    ServiceScope: {
        type: 'React.FC<{ children }>',
        description: 'Creates an isolated scope for scoped services. Auto-disposes on unmount.',
    },
    useService: {
        type: '(...serviceNames) => { $shortName: instance }',
        description: 'Resolve services by name within the nearest scope (or container if no scope). Returns keyed object.',
    },
    useServiceWithArgs: {
        type: '(serviceName, ...args) => instance',
        description: 'Resolve a parameterized service. Uses ServiceProvider defaultParams if no args passed.',
    },
    useScope: {
        type: '() => ScopeHandle',
        description: 'Access the current scope handle directly. Must be within a ServiceScope.',
    },
    useContainer: {
        type: '() => ServiceContainer',
        description: 'Access the container directly for advanced registration or resolution.',
    },
    withServices: {
        type: '(Component, config) => WrappedComponent',
        description: 'HOC that injects resolved services as props. Config specifies service names and parameterized args.',
    },
};
