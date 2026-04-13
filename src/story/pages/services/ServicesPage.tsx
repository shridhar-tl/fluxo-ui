import cn from 'classnames';
import React from 'react';
import { CodeBlock } from '../../CodeBlock';
import { FeatureGrid } from '../../FeatureCard';
import PageLayout from '../../PageLayout';
import { PropsTable } from '../../PropsTable';
import { useStoryTheme } from '../../StoryThemeContext';
import BasicUsage from './BasicUsage';
import Lifetimes from './Lifetimes';
import Parameterized from './Parameterized';
import ReactIntegration from './ReactIntegration';
import SwappingImplementations from './SwappingImplementations';
import {
    containerApiProps,
    features,
    reactApiProps,
    sectionNavItems,
} from './services-story-data';

const ServicesPage: React.FC = () => {
    const { isDark } = useStoryTheme();
    const h2 = cn('text-2xl font-semibold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark });
    const desc = cn('text-sm mb-4', { 'text-gray-400': isDark, 'text-gray-500': !isDark });

    return (
        <PageLayout sectionNavItems={sectionNavItems}>
            <div>
                <h1 className={cn('text-2xl md:text-4xl font-bold mb-4', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>
                    Dependency Injection
                </h1>
                <p className={cn('text-base md:text-xl', { 'text-gray-400': isDark, 'text-gray-600': !isDark })}>
                    A class-based dependency injection container. Register service classes with static dependency arrays,
                    swap implementations by environment, and resolve by name — the container handles instantiation and wiring.
                </p>
            </div>

            <section id="basic" className="scroll-mt-8">
                <h2 className={h2}>Basic Usage</h2>
                <p className={desc}>
                    Register classes with injectable(), declare dependencies via static arrays, and resolve by name.
                    The container instantiates the class and injects its dependencies as constructor arguments.
                </p>
                <BasicUsage />
            </section>

            <section id="lifetimes" className="scroll-mt-8">
                <h2 className={h2}>Service Lifetimes</h2>
                <p className={desc}>
                    Control instance caching: singleton (default, one instance forever), scoped (one per scope),
                    transient (always new), and retain (survives clearInstances).
                </p>
                <Lifetimes />
            </section>

            <section id="parameterized" className="scroll-mt-8">
                <h2 className={h2}>Parameterized Services</h2>
                <p className={desc}>
                    Register factories that receive arguments at resolution time. The factory also receives a resolver
                    to access other services. Arguments become part of the cache key for singleton and scoped lifetimes.
                </p>
                <Parameterized />
            </section>

            <section id="swapping" className="scroll-mt-8">
                <h2 className={h2}>Swapping Implementations</h2>
                <p className={desc}>
                    Register different classes under the same service name based on environment, config, or runtime conditions.
                    Consumer code resolves by name and never knows which implementation it gets.
                </p>
                <SwappingImplementations />
            </section>

            <section id="react-integration" className="scroll-mt-8">
                <h2 className={h2}>React Integration</h2>
                <p className={desc}>
                    ServiceProvider supplies default parameters for parameterized services. ServiceScope creates isolated
                    scopes that auto-dispose on unmount. Hooks and HOC for consuming services in components.
                </p>
                <ReactIntegration />
            </section>

            <section id="import" className="scroll-mt-8">
                <h2 className={h2}>Import</h2>
                <CodeBlock code={`import {
    createContainer,
    ServiceContainer,
    ServiceProvider,
    ServiceScope,
    useService,
    useServiceWithArgs,
    useScope,
    useContainer,
    withServices,
} from 'ether-ui/services';

// Create a container
const services = createContainer();

// Class-based registration (chainable)
services
    .registerSingleton(MyClass, 'MyService', '$myService')
    .registerScoped(OtherClass, 'OtherService', '$other')
    .registerTransient(AnotherClass, 'AnotherService', '$another');

// Factory-based registration (chainable)
services
    .registerSingletonFactory('MyService', '$myService', (resolver) => ({ ... }))
    .registerScopedFactory('OtherService', '$other', (resolver) => ({ ... }))
    .registerTransientFactory('AnotherService', '$another', (resolver) => ({ ... }));

// Parameterized (chainable)
services.registerParameterized('UserApi', '$userApi', 'scoped', (resolver, userId) => ({ ... }));`} />
            </section>

            <section id="container-api" className="scroll-mt-8">
                <h2 className={h2}>Container API</h2>
                <PropsTable props={containerApiProps} />
            </section>

            <section id="react-api" className="scroll-mt-8">
                <h2 className={h2}>React API</h2>
                <PropsTable props={reactApiProps} />
            </section>

            <section id="features" className="scroll-mt-8">
                <h2 className={cn('text-2xl font-semibold mb-6', { 'text-gray-100': isDark, 'text-gray-900': !isDark })}>Features</h2>
                <FeatureGrid features={features} />
            </section>
        </PageLayout>
    );
};

export default ServicesPage;
